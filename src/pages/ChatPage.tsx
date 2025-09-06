import { useState, useEffect, useMemo } from 'react';
import { Send, ArrowLeft, Bot, User, Trash2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { useInvestments } from '../hooks/useInvestments';
import { CurrencyService } from '../services/currencyService';
import { BondAnalysisService } from '../services/bondAnalysisService';
import type { Investment } from '../types/investment';

interface ChatPageProps {
  onBack: () => void;
}

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

export function ChatPage({ onBack }: ChatPageProps) {
  const { t } = useLanguage();
  const { currency } = useCurrency();
  const { investments, calculatePortfolioSummary, lastUpdate, setInvestments } = useInvestments();
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
        // If there's an error parsing, start with empty messages
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
        if (currency && typeof currency === 'string' && currency.trim()) {
          uniqueCurrencies.add(currency.trim());
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

        // Build comprehensive investment data with all available information
        const detailedInvestments = investments.map(inv => {
          const currentValue = (inv.currentPrice || inv.purchasePrice) * inv.quantity;
          const investedValue = inv.purchasePrice * inv.quantity;
          const gainLoss = currentValue - investedValue;
          const gainLossPercent = investedValue > 0 ? ((gainLoss / investedValue) * 100) : 0;
          
          return {
            // Basic info
            id: inv.id,
            symbol: inv.symbol,
            name: inv.name,
            type: inv.type,
            quantity: inv.quantity,
            purchasePrice: inv.purchasePrice,
            currentPrice: inv.currentPrice || inv.purchasePrice,
            purchaseDate: inv.purchaseDate,
            lastUpdated: inv.lastUpdated,
            currency: inv.currency,
            
            // Calculated values
            currentValue,
            investedValue,
            gainLoss,
            gainLossPercent,
            
            // Bond-specific information
            ...(inv.type === 'bond' && {
              fixedYield: inv.fixedYield,
              paymentFrequency: inv.paymentFrequency,
              nextPaymentDate: inv.nextPaymentDate,
              lastPaymentDate: inv.lastPaymentDate,
              maturityDate: inv.maturityDate,
              faceValue: inv.faceValue,
              issuanceDate: inv.issuanceDate,
              
              // Calculate bond payment info
              annualCouponPayment: inv.fixedYield && inv.faceValue ? 
                (inv.faceValue * inv.quantity * inv.fixedYield / 100) : 
                (inv.purchasePrice * inv.quantity * (inv.fixedYield || 0) / 100),
              
              // Payment schedule info
              paymentSchedule: inv.paymentFrequency ? {
                frequency: inv.paymentFrequency,
                nextPayment: inv.nextPaymentDate,
                lastPayment: inv.lastPaymentDate,
                maturity: inv.maturityDate,
                annualRate: inv.fixedYield,
                faceValue: inv.faceValue
              } : null
            }),
            
            // Exchange rate info
            exchangeRate: inv.exchangeRate || 1,
            exchangeRateToUSD: exchangeRates[inv.currency || 'USD'] || 1
          };
        });

        const context = {
          investments: detailedInvestments,
          totalValue: summary.totalValue,
          totalInvested: summary.totalInvested,
          totalGainLoss: summary.totalGainLoss,
          totalGainLossPercentage: summary.totalGainLossPercentage,
          currency,
          exchangeRates,
          lastUpdated: lastUpdate?.toISOString() || null,
          
          // Current date and time context
          currentDate: new Date().toISOString(),
          currentDateFormatted: new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          currentTime: new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            timeZoneName: 'short'
          }),
          
          // Additional portfolio analysis
          portfolioAnalysis: {
            bondCount: investments.filter(inv => inv.type === 'bond').length,
            stockCount: investments.filter(inv => inv.type === 'stock').length,
            cryptoCount: investments.filter(inv => inv.type === 'crypto').length,
            cashCount: investments.filter(inv => inv.type === 'cash').length,
            
            // Bond-specific analysis
            totalBondValue: investments
              .filter(inv => inv.type === 'bond')
              .reduce((sum, inv) => sum + ((inv.currentPrice || inv.purchasePrice) * inv.quantity), 0),
            
            totalAnnualCouponIncome: investments
              .filter(inv => inv.type === 'bond' && inv.fixedYield)
              .reduce((sum, inv) => {
                const faceValue = inv.faceValue || inv.purchasePrice;
                return sum + (faceValue * inv.quantity * inv.fixedYield / 100);
              }, 0),
            
            // All bond payments (calculated using BondAnalysisService)
            allBondPayments: investments
              .filter(inv => inv.type === 'bond')
              .map(inv => {
                // Use BondAnalysisService to get calculated payment information
                const bondInfo = bondAnalysisService.analyzeBond(inv);
                const hasPaymentDate = bondInfo.nextPaymentDate && bondInfo.nextPaymentDate !== '';
                
                let paymentInfo = {
                  symbol: inv.symbol,
                  name: inv.name,
                  nextPaymentDate: bondInfo.nextPaymentDate || 'Not specified',
                  paymentAmount: bondInfo.paymentAmount,
                  paymentFrequency: bondInfo.paymentFrequency,
                  maturityDate: inv.maturityDate || 'Not specified',
                  fixedYield: inv.fixedYield || 0,
                  faceValue: inv.faceValue || inv.purchasePrice,
                  hasSpecificDate: hasPaymentDate,
                  confidence: bondInfo.confidence
                };

                // Add timing info only if we have a specific payment date
                if (hasPaymentDate) {
                  const paymentDate = new Date(bondInfo.nextPaymentDate);
                  const today = new Date();
                  const daysUntilPayment = Math.ceil((paymentDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                  
                  paymentInfo = {
                    ...paymentInfo,
                    daysUntilPayment: daysUntilPayment,
                    isOverdue: daysUntilPayment < 0,
                    relativeTiming: daysUntilPayment < 0 ? 
                      `${Math.abs(daysUntilPayment)} days overdue` :
                      daysUntilPayment === 0 ? 
                      'Today' :
                      daysUntilPayment === 1 ? 
                      'Tomorrow' :
                      daysUntilPayment <= 7 ? 
                      `In ${daysUntilPayment} days` :
                      daysUntilPayment <= 30 ? 
                      `In ${daysUntilPayment} days (${Math.ceil(daysUntilPayment / 7)} weeks)` :
                      `In ${daysUntilPayment} days (${Math.ceil(daysUntilPayment / 30)} months)`
                  };
                } else {
                  paymentInfo = {
                    ...paymentInfo,
                    daysUntilPayment: null,
                    isOverdue: false,
                    relativeTiming: 'Payment date not specified'
                  };
                }

                return paymentInfo;
              })
              .sort((a, b) => {
                // Sort by payment date if available, otherwise by symbol
                if (a.hasSpecificDate && b.hasSpecificDate) {
                  return new Date(a.nextPaymentDate).getTime() - new Date(b.nextPaymentDate).getTime();
                } else if (a.hasSpecificDate && !b.hasSpecificDate) {
                  return -1;
                } else if (!a.hasSpecificDate && b.hasSpecificDate) {
                  return 1;
                } else {
                  return a.symbol.localeCompare(b.symbol);
                }
              }),

            // Upcoming bond payments with specific dates only (using BondAnalysisService)
            upcomingBondPayments: investments
              .filter(inv => inv.type === 'bond')
              .map(inv => {
                const bondInfo = bondAnalysisService.analyzeBond(inv);
                return {
                  symbol: inv.symbol,
                  name: inv.name,
                  nextPaymentDate: bondInfo.nextPaymentDate,
                  paymentAmount: bondInfo.paymentAmount,
                  paymentFrequency: bondInfo.paymentFrequency,
                  maturityDate: inv.maturityDate,
                  confidence: bondInfo.confidence
                };
              })
              .filter(payment => payment.nextPaymentDate && payment.nextPaymentDate !== 'Not specified')
              .map(payment => {
                const paymentDate = new Date(payment.nextPaymentDate);
                const today = new Date();
                const daysUntilPayment = Math.ceil((paymentDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                
                return {
                  ...payment,
                  daysUntilPayment: daysUntilPayment,
                  isOverdue: daysUntilPayment < 0,
                  relativeTiming: daysUntilPayment < 0 ? 
                    `${Math.abs(daysUntilPayment)} days overdue` :
                    daysUntilPayment === 0 ? 
                    'Today' :
                    daysUntilPayment === 1 ? 
                    'Tomorrow' :
                    daysUntilPayment <= 7 ? 
                    `In ${daysUntilPayment} days` :
                    daysUntilPayment <= 30 ? 
                    `In ${daysUntilPayment} days (${Math.ceil(daysUntilPayment / 7)} weeks)` :
                    `In ${daysUntilPayment} days (${Math.ceil(daysUntilPayment / 30)} months)`
                };
              })
              .sort((a, b) => new Date(a.nextPaymentDate).getTime() - new Date(b.nextPaymentDate).getTime())
          }
        };
        
        setPortfolioContext(context);
      } catch (error) {
        console.error('Error building portfolio context:', error);
      }
    };

    buildPortfolioContext();
  }, [investments, currency, calculatePortfolioSummary, lastUpdate, currencyService]);

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('🎯 Frontend: handleSubmit called!');
    console.log('🎯 Frontend: input value:', input);
    console.log('🎯 Frontend: isLoading:', isLoading);
    
    e.preventDefault();
    if (!input.trim() || isLoading) {
      console.log('🚫 Frontend: Early return - input empty or loading');
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input.trim();
    setInput('');
    setIsLoading(true);
    setError(null); // Clear any previous errors

    try {
      console.log('🚀 Frontend: Making API call to /api/chat');
      console.log('📦 Frontend: Portfolio context:', portfolioContext ? 'Present' : 'Missing');
      
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
      
      console.log('📡 Frontend: API response status:', response.status);

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      
      // Handle investment updates if the AI made changes
      if (data.updatedPortfolio && data.updatedPortfolio.investments) {
        console.log('📈 ChatPage: Applying investment updates:', data.updatedPortfolio.investments);
        setInvestments(data.updatedPortfolio.investments);
      }
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content || 'Sorry, I encountered an error. Please try again.',
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error('❌ Frontend: Chat error:', err);
      console.error('❌ Frontend: Error details:', err.message);
      setError('Failed to connect to AI service');
      // Fallback response when API is not available
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `${t('chat.welcome.message')}

I notice you asked: "${currentInput}"

${t('chat.error.generic')}

However, I can still provide some general guidance:
- For investment strategies, consider diversification across asset classes
- For portfolio analysis, review your risk tolerance and time horizon  
- For bond analysis, consider duration, credit rating, and yield
- Always consult with qualified financial professionals for personalized advice

What specific aspect of investing would you like to discuss?`,
      };
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('📝 Frontend: Input changed:', e.target.value);
    setInput(e.target.value);
  };

  const clearChatHistory = () => {
    setMessages([]);
    localStorage.removeItem('chatHistory');
  };

  return (
    <div className="fixed top-16 left-0 right-0 bottom-0 bg-gray-50 dark:bg-gray-900 transition-colors duration-200 flex flex-col z-50">
      {/* Chat Header */}
      <div className="flex-shrink-0 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <button
            onClick={onBack}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0"
            title={t('back.to.portfolio')}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <div className="p-1.5 sm:p-2 bg-blue-600 dark:bg-blue-500 rounded-lg flex-shrink-0">
              <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-base sm:text-xl font-semibold text-gray-900 dark:text-gray-100 truncate">
                {t('chat.title')}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                {t('chat.subtitle')}
              </p>
            </div>
          </div>
          {messages.length > 0 && (
            <button
              onClick={clearChatHistory}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex-shrink-0"
              title="Clear chat history"
            >
              <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Messages Area - Takes remaining space */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <Bot className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                {t('chat.welcome.title')}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                {t('chat.welcome.message')}
              </p>
            </div>
          )}
          
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex max-w-[85%] sm:max-w-xs lg:max-w-2xl ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'} space-x-2`}>
                <div className={`flex-shrink-0 ${message.role === 'user' ? 'ml-2' : 'mr-2'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.role === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}>
                    {message.role === 'user' ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </div>
                </div>
                <div className={`px-3 py-2 sm:px-4 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100'
                }`}>
                  <div className="whitespace-pre-wrap text-sm">
                    {message.content}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex max-w-[85%] sm:max-w-xs lg:max-w-2xl space-x-2">
                <div className="flex-shrink-0 mr-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                    <Bot className="h-4 w-4" />
                  </div>
                </div>
                <div className="px-3 py-2 sm:px-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="flex justify-center">
              <div className="px-4 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
                {t('chat.error.connection')}
              </div>
            </div>
          )}
      </div>

      {/* Input Form - Fixed at bottom */}
      <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 sm:px-6 lg:px-8 py-4">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder={t('chat.placeholder')}
            className="flex-1 px-3 py-2 sm:px-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 text-sm sm:text-base"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-3 py-2 sm:px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
