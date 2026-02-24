import React, { useState, useEffect, useMemo } from 'react';
import { Send, Bot, User, Trash2, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { useInvestmentContext } from '../contexts/InvestmentContext';
import { CurrencyService } from '../services/currencyService';
import { BondAnalysisService } from '../services/bondAnalysisService';
import { PortfolioService, type PortfolioContext } from '../services/portfolioService';
import { ChatApiService } from '../services/chatApiService';
import { trackInvestmentActions } from './GoogleAnalytics';
import type { Investment } from '../types/investment';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
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
  const [isHovered, setIsHovered] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  
  // Handle hover with delay
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (isHovered) {
      timeoutId = setTimeout(() => {
        setShowBubble(true);
      }, 500); // 500ms delay
    } else {
      setShowBubble(false);
    }
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isHovered]);
  
  // Track chat open/close
  const handleToggleChat = (open: boolean) => {
    setIsOpen(open);
    trackInvestmentActions.chatInteraction(open ? 'open_chat' : 'close_chat');
  };
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
  const portfolioService = useMemo(() => new PortfolioService(), []);
  const chatApiService = useMemo(() => new ChatApiService(), []);

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

        // Use modularized portfolio service to build context
        const context = await portfolioService.buildPortfolioContext(
          investments,
          displayCurrency,
          exchangeRates
        );
        
        setPortfolioContext(context);
      } catch (error) {
        console.error('Error building portfolio context:', error);
      }
    };

    buildPortfolioContext();
  }, [investments, displayCurrency, lastUpdate, currencyService, portfolioService]);

  const sendMessage = async (messageContent: string) => {
    console.log('🎯 ChatBlob: sendMessage called with:', messageContent);
    
    // Track chat interaction
    trackInvestmentActions.chatInteraction('send_message');
    
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
      
      // Use modularized chat API service
      const data = await chatApiService.sendMessage(
        [...messages, userMessage].map(m => ({ role: m.role, content: m.content })),
        portfolioContext
      );
      
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
    handleToggleChat(!isOpen);
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
          {/* Hover Message Bubble */}
          {showBubble && (
            <div className="absolute bottom-full right-0 mb-3 animate-fade-in-up">
              <div className="glass-card-static px-4 py-3 w-64 sm:w-72" style={{ color: 'var(--text-primary)' }}>
                <p className="text-sm font-medium leading-snug">
                  Hi! I'm your personal AI assistant. Let me know if I can help you with your portfolio!
                </p>
                {/* Arrow pointing down */}
                <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent" style={{ borderTopColor: 'var(--bg-card)' }}></div>
              </div>
            </div>
          )}

          <button
            onClick={toggleChat}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-emerald-500 to-cyan-500 text-white rounded-full shadow-lg shadow-glow-emerald hover:shadow-glow-accent transition-all duration-300 flex items-center justify-center transform hover:scale-110 active:scale-95"
            title={t('chat.title')}
            aria-label={t('chat.title')}
          >
            <Bot className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>
      )}

      {/* Chat Blob Interface */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-2rem)] sm:w-96 max-w-sm h-[calc(100vh-8rem)] sm:h-[500px] max-h-[600px] rounded-xl shadow-glass-lg flex flex-col z-50 transition-all duration-300 animate-slide-in-up overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}>
          {/* Gradient accent bar at top */}
          <div className="h-[3px] w-full bg-gradient-to-r from-emerald-500 to-cyan-500 flex-shrink-0"></div>

          {/* Chat Header */}
          <div className="flex items-center justify-between p-4 flex-shrink-0" style={{ borderBottom: '1px solid var(--border-primary)' }}>
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-lg">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {t('chat.title')}
                </h3>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {t('chat.subtitle')}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              {messages.length > 0 && (
                <button
                  onClick={clearChatHistory}
                  className="btn-icon !p-1.5 hover:!text-red-500 hover:!bg-red-500/10"
                  title="Clear chat history"
                  aria-label="Clear chat history"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={toggleChat}
                className="btn-icon !p-1.5"
                title="Close chat"
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <Bot className="h-8 w-8 text-emerald-500 mx-auto mb-3" />
                <h4 className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  {t('chat.welcome.title')}
                </h4>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
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
                        ? 'bg-gradient-to-br from-emerald-500 to-cyan-500 text-white'
                        : ''
                    }`} style={message.role === 'assistant' ? { background: 'var(--bg-card-hover)', color: 'var(--text-secondary)' } : undefined}>
                      {message.role === 'user' ? (
                        <User className="h-3 w-3" />
                      ) : (
                        <Bot className="h-3 w-3" />
                      )}
                    </div>
                  </div>
                  <div className={`px-3 py-2 rounded-lg text-xs ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white'
                      : 'glass-card-static'
                  }`} style={message.role === 'assistant' ? { color: 'var(--text-primary)' } : undefined}>
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
                    <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'var(--bg-card-hover)', color: 'var(--text-secondary)' }}>
                      <Bot className="h-3 w-3" />
                    </div>
                  </div>
                  <div className="glass-card-static px-3 py-2">
                    <div className="flex space-x-1">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="text-center">
                <div className="px-3 py-2 rounded-lg bg-red-500/10 text-red-500 text-xs" style={{ border: '1px solid rgba(239,68,68,0.2)' }}>
                  {error}
                </div>
              </div>
            )}
          </div>

          {/* Input Form */}
          <div className="p-3 flex-shrink-0" style={{ borderTop: '1px solid var(--border-primary)' }}>
            <form onSubmit={handleSubmit} className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t('chat.placeholder')}
                className="input-field !py-2 !text-xs flex-1"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="px-3 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-lg hover:shadow-glow-emerald disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                aria-label="Send message"
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