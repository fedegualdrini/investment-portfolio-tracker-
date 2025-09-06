import React, { useState, useEffect, useMemo } from 'react';
import { Send, Bot, User, Trash2, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { useInvestmentContext } from '../contexts/InvestmentContext';
import { CurrencyService } from '../services/currencyService';
import { BondAnalysisService } from '../services/bondAnalysisService';
import type { Investment } from '../types/investment';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface PortfolioContext {
  investments: Investment[];
  totalValue: number;
  totalInvested: number;
  totalGainLoss: number;
  totalGainLossPercentage: number;
  currency: string;
  exchangeRates: Record<string, number>;
  lastUpdated: string | null;
}

export function ChatBlob() {
  const { t } = useLanguage();
  const { displayCurrency } = useCurrency();
  const { 
    investments, 
    calculatePortfolioSummary, 
    lastUpdate,
    setInvestments
  } = useInvestmentContext();
  
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [portfolioContext, setPortfolioContext] = useState<PortfolioContext | null>(null);

  // Load chat history from localStorage on component mount
  useEffect(() => {
    const savedMessages = localStorage.getItem('chatHistory');
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        setMessages(parsedMessages);
      } catch (error) {
        console.error('Error loading chat history:', error);
        setMessages([]);
      }
    }
  }, []);

  // Save chat history to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chatHistory', JSON.stringify(messages));
    }
  }, [messages]);

  const currencyService = useMemo(() => new CurrencyService(), []);
  const bondAnalysisService = useMemo(() => new BondAnalysisService(), []);

  // Build portfolio context when investments or currency changes
  useEffect(() => {
    const buildPortfolioContext = async () => {
      if (!investments.length) {
        setPortfolioContext(null);
        return;
      }

      try {
        const summary = calculatePortfolioSummary();
        
        // Get exchange rates for different currencies in the portfolio
        const uniqueCurrencies = new Set<string>();
        investments.forEach(inv => {
          if (inv.currency && typeof inv.currency === 'string' && inv.currency.trim()) {
            uniqueCurrencies.add(inv.currency.trim());
          }
        });
        if (displayCurrency && typeof displayCurrency === 'string' && displayCurrency.trim()) {
          uniqueCurrencies.add(displayCurrency.trim());
        }
        
        // If no currencies found, default to USD
        if (uniqueCurrencies.size === 0) {
          uniqueCurrencies.add('USD');
        }
        
        const exchangeRates: Record<string, number> = {};
        for (const curr of uniqueCurrencies) {
          if (curr && curr !== 'USD') {
            try {
              exchangeRates[curr] = await currencyService.getExchangeRate(curr);
            } catch (error) {
              console.warn(`Failed to fetch exchange rate for ${curr}:`, error);
              exchangeRates[curr] = 1; // Fallback to 1:1 rate
            }
          } else {
            exchangeRates[curr] = 1;
          }
        }

        const context = {
          investments,
          totalValue: summary.totalValue,
          totalInvested: summary.totalInvested,
          totalGainLoss: summary.totalGainLoss,
          totalGainLossPercentage: summary.totalGainLossPercentage,
          currency: displayCurrency,
          exchangeRates,
          lastUpdated: lastUpdate?.toISOString() || null,
        };
        
        setPortfolioContext(context);
      } catch (error) {
        console.error('Error building portfolio context:', error);
      }
    };

    buildPortfolioContext();
  }, [investments, displayCurrency, calculatePortfolioSummary, lastUpdate, currencyService]);

  const sendMessage = async (messageContent: string) => {
    console.log('🎯 ChatBlob: sendMessage called with:', messageContent);
    
    if (!messageContent.trim() || isLoading) {
      console.log('🚫 ChatBlob: Early return - input empty or loading');
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      console.log('🚀 ChatBlob: Making API call to /api/chat');
      console.log('📦 ChatBlob: Portfolio context:', portfolioContext ? 'Present' : 'Missing');
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })),
          portfolioContext,
        }),
      });
      
      console.log('📡 ChatBlob: API response status:', response.status);

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      
      // Debug: Log the entire response to see what we're getting
      console.log('📈 ChatBlob: Full API response:', data);
      console.log('📈 ChatBlob: Response keys:', Object.keys(data));
      console.log('📈 ChatBlob: Has updatedPortfolio:', !!data.updatedPortfolio);
      console.log('📈 ChatBlob: updatedPortfolio keys:', data.updatedPortfolio ? Object.keys(data.updatedPortfolio) : 'none');
      
      // Handle investment updates if the AI made changes
      if (data.updatedPortfolio && data.updatedPortfolio.investments) {
        console.log('📈 ChatBlob: Applying investment updates:', data.updatedPortfolio.investments);
        console.log('📈 ChatBlob: Investment count:', data.updatedPortfolio.investments.length);
        console.log('📈 ChatBlob: Investment symbols:', data.updatedPortfolio.investments.map(inv => inv.symbol));
        setInvestments(data.updatedPortfolio.investments);
      } else {
        console.log('📈 ChatBlob: No updatedPortfolio data to apply');
      }
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content || 'Sorry, I encountered an error. Please try again.',
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error('❌ ChatBlob: Chat error:', err);
      setError('Failed to connect to AI service');
      
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I'm having trouble connecting to the AI service right now. However, I can still provide some general guidance about your portfolio and investments. What would you like to know?`,
      };
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const messageContent = input.trim();
    setInput('');
    await sendMessage(messageContent);
  };

  const clearChatHistory = () => {
    setMessages([]);
    localStorage.removeItem('chatHistory');
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-50"
          title={t('chat.title')}
        >
          <Bot className="h-6 w-6" />
        </button>
      )}

      {/* Chat Blob Interface */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col z-50 transition-all duration-300">
          {/* Chat Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 rounded-t-xl bg-gray-50 dark:bg-gray-750">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-blue-600 dark:bg-blue-500 rounded-lg">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {t('chat.title')}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t('chat.subtitle')}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              {messages.length > 0 && (
                <button
                  onClick={clearChatHistory}
                  className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                  title="Clear chat history"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={toggleChat}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                title="Close chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <Bot className="h-8 w-8 text-blue-500 mx-auto mb-3" />
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  {t('chat.welcome.title')}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t('chat.welcome.message')}
                </p>
              </div>
            )}
            
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'} space-x-2`}>
                  <div className={`flex-shrink-0 ${message.role === 'user' ? 'ml-2' : 'mr-2'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      message.role === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                    }`}>
                      {message.role === 'user' ? (
                        <User className="h-3 w-3" />
                      ) : (
                        <Bot className="h-3 w-3" />
                      )}
                    </div>
                  </div>
                  <div className={`px-3 py-2 rounded-lg text-xs ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                  }`}>
                    <div className="whitespace-pre-wrap">
                      {message.content}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex max-w-[80%] space-x-2">
                  <div className="flex-shrink-0 mr-2">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                      <Bot className="h-3 w-3" />
                    </div>
                  </div>
                  <div className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700">
                    <div className="flex space-x-1">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="text-center">
                <div className="px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-xs">
                  {error}
                </div>
              </div>
            )}
          </div>

          {/* Input Form */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-3">
            <form onSubmit={handleSubmit} className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t('chat.placeholder')}
                className="flex-1 px-3 py-2 text-xs border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}