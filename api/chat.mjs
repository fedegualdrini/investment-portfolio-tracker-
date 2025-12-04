import { generateText, tool, stepCountIs, NoSuchToolError, InvalidToolInputError } from 'ai';
import { z } from 'zod';
import { config } from 'dotenv';
import { randomUUID } from 'crypto';

// Load environment variables for local development
config({ path: '.env.local', override: true });

// AI Configuration for context optimization
const AI_CONFIG = {
  MAX_CONTEXT_TOKENS: 3000,
  LARGE_PORTFOLIO_THRESHOLD: 15,
  TOP_PERFORMERS_COUNT: 5,
  BOTTOM_PERFORMERS_COUNT: 5,
  ENABLE_QUERY_ANALYSIS: true,
  ENABLE_CONTEXT_SUMMARIZATION: true,
  CHARS_PER_TOKEN: 4
};

// Context Optimization Functions
function analyzeQuery(query) {
  const normalizedQuery = query.toLowerCase();
  const symbols = [];
  const names = [];
  const types = [];

  // Common stock symbols pattern (2-5 uppercase letters)
  const symbolPattern = /\b([A-Z]{2,5})\b/g;
  const symbolMatches = query.match(symbolPattern);
  if (symbolMatches) {
    symbols.push(...symbolMatches.map(s => s.toUpperCase()));
  }

  // Common company names
  const companyNames = [
    'apple', 'microsoft', 'google', 'amazon', 'tesla', 'meta', 'facebook',
    'nvidia', 'netflix', 'bitcoin', 'ethereum', 'cardano', 'solana',
    'edenor', 'ypf', 'pampa', 'galicia', 'bbva', 'santander'
  ];

  for (const company of companyNames) {
    if (normalizedQuery.includes(company)) {
      names.push(company);
    }
  }

  // Asset types
  const assetTypes = ['bond', 'bonds', 'stock', 'stocks', 'crypto', 'cryptocurrency', 'cash', 'etf'];
  for (const type of assetTypes) {
    if (normalizedQuery.includes(type)) {
      const normalizedType = type.replace(/s$/, '');
      if (!types.includes(normalizedType)) {
        types.push(normalizedType);
      }
    }
  }

  const isSpecific = symbols.length > 0 || names.length > 0 || (types.length > 0 && types.length < 3);

  return { symbols, names, types, isSpecific, query };
}

function filterRelevantAssets(investments, queryAnalysis) {
  if (!queryAnalysis.isSpecific) {
    return investments;
  }

  const relevant = [];

  for (const investment of investments) {
    if (queryAnalysis.symbols.some(s => investment.symbol.toUpperCase() === s.toUpperCase())) {
      relevant.push(investment);
      continue;
    }

    if (queryAnalysis.names.some(name =>
      investment.name.toLowerCase().includes(name.toLowerCase()) ||
      investment.symbol.toLowerCase().includes(name.toLowerCase())
    )) {
      relevant.push(investment);
      continue;
    }

    if (queryAnalysis.types.some(type => investment.type.toLowerCase() === type.toLowerCase())) {
      relevant.push(investment);
      continue;
    }
  }

  return relevant.length > 0 ? relevant : investments;
}

function summarizePortfolio(investments) {
  const totalInvested = investments.reduce((sum, inv) => sum + inv.purchasePrice * inv.quantity, 0);
  const totalValue = investments.reduce((sum, inv) => sum + (inv.currentPrice || inv.purchasePrice) * inv.quantity, 0);
  const totalGainLoss = totalValue - totalInvested;
  const totalGainLossPercentage = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;

  const stocks = investments.filter(inv => inv.type === 'stock' || inv.type === 'etf');
  const bonds = investments.filter(inv => inv.type === 'bond');
  const crypto = investments.filter(inv => inv.type === 'crypto');
  const cash = investments.filter(inv => inv.type === 'cash');
  const other = investments.filter(inv => !['stock', 'etf', 'bond', 'crypto', 'cash'].includes(inv.type));

  const investmentsWithReturns = investments.map(inv => {
    const gainLoss = (inv.currentPrice || inv.purchasePrice) - inv.purchasePrice;
    const gainLossPercentage = inv.purchasePrice > 0 ? (gainLoss / inv.purchasePrice) * 100 : 0;
    return {
      symbol: inv.symbol,
      name: inv.name,
      type: inv.type,
      gainLossPercentage
    };
  });

  const sorted = [...investmentsWithReturns].sort((a, b) => b.gainLossPercentage - a.gainLossPercentage);
  const topPerformers = sorted.slice(0, AI_CONFIG.TOP_PERFORMERS_COUNT);
  const bottomPerformers = sorted.slice(-AI_CONFIG.BOTTOM_PERFORMERS_COUNT).reverse();

  let bondSummary;
  if (bonds.length > 0) {
    const totalBondValue = bonds.reduce((sum, inv) => sum + (inv.currentPrice || inv.purchasePrice) * inv.quantity, 0);
    const totalAnnualIncome = bonds.reduce((sum, inv) => {
      const faceValue = inv.faceValue || inv.purchasePrice * inv.quantity;
      return sum + (inv.fixedYield || 0) * faceValue / 100;
    }, 0);

    const bondsWithPayments = bonds
      .filter(inv => inv.nextPaymentDate)
      .sort((a, b) => new Date(a.nextPaymentDate).getTime() - new Date(b.nextPaymentDate).getTime());

    bondSummary = {
      count: bonds.length,
      totalValue: totalBondValue,
      totalAnnualIncome,
      nextPaymentDate: bondsWithPayments[0]?.nextPaymentDate
    };
  }

  return {
    totalValue,
    totalInvested,
    totalGainLoss,
    totalGainLossPercentage,
    investmentCount: investments.length,
    assetAllocation: {
      stocks: stocks.length,
      bonds: bonds.length,
      crypto: crypto.length,
      cash: cash.length,
      other: other.length
    },
    topPerformers,
    bottomPerformers,
    bondSummary
  };
}

function estimateTokenCount(text) {
  return Math.ceil(text.length / AI_CONFIG.CHARS_PER_TOKEN);
}

// Import shared services - Note: These need to be compiled to JS or we need to use a different approach
// For now, let's implement the services directly in the chat.mjs file to avoid module resolution issues

// Portfolio Service Implementation
class PortfolioService {
  calculatePortfolioSummary(investments) {
    const totalInvested = investments.reduce((sum, inv) => sum + inv.purchasePrice * inv.quantity, 0);
    const totalValue = investments.reduce((sum, inv) => sum + (inv.currentPrice || inv.purchasePrice) * inv.quantity, 0);
    const totalGainLoss = totalValue - totalInvested;
    const totalGainLossPercentage = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;

    return {
      totalValue,
      totalInvested,
      totalGainLoss,
      totalGainLossPercentage,
      investmentCount: investments.length,
      lastUpdated: new Date().toISOString()
    };
  }

  analyzePortfolio(investments) {
    const bonds = investments.filter(inv => inv.type === 'bond');
    const stocks = investments.filter(inv => inv.type === 'stock' || inv.type === 'etf');
    const crypto = investments.filter(inv => inv.type === 'crypto');
    const cash = investments.filter(inv => inv.type === 'cash');

    const totalBondValue = bonds.reduce((sum, inv) => sum + (inv.currentPrice || inv.purchasePrice) * inv.quantity, 0);
    const totalAnnualCouponIncome = bonds.reduce((sum, inv) => {
      const faceValue = inv.faceValue || inv.purchasePrice * inv.quantity;
      return sum + (inv.fixedYield || 0) * faceValue / 100;
    }, 0);

    // Generate bond payment information
    const allBondPayments = bonds.map(inv => {
      const faceValue = inv.faceValue || inv.purchasePrice * inv.quantity;
      const annualYield = (inv.fixedYield || 0) / 100;
      const paymentAmount = faceValue * annualYield;

      // Use user-provided payment frequency directly (trust user input)
      const paymentFrequency = inv.paymentFrequency || 'semi-annual';
      let paymentsPerYear = 2; // Default to semi-annual

      switch (paymentFrequency) {
        case 'monthly': paymentsPerYear = 12; break;
        case 'quarterly': paymentsPerYear = 4; break;
        case 'semi-annual': paymentsPerYear = 2; break;
        case 'annual': paymentsPerYear = 1; break;
        case 'zero-coupon': paymentsPerYear = 0; break;
      }

      const perPaymentAmount = paymentsPerYear > 0 ? paymentAmount / paymentsPerYear : 0;

      return {
        symbol: inv.symbol,
        name: inv.name,
        paymentAmount: perPaymentAmount,
        paymentFrequency,
        nextPaymentDate: inv.nextPaymentDate,
        maturityDate: inv.maturityDate,
        fixedYield: inv.fixedYield,
        hasSpecificDate: !!(inv.nextPaymentDate || inv.lastPaymentDate),
        isOverdue: inv.nextPaymentDate ? new Date(inv.nextPaymentDate) < new Date() : false,
        relativeTiming: inv.nextPaymentDate ? this.getRelativeTiming(inv.nextPaymentDate) : undefined
      };
    });

    const upcomingBondPayments = allBondPayments
      .filter(payment => payment.nextPaymentDate && new Date(payment.nextPaymentDate) >= new Date())
      .sort((a, b) => new Date(a.nextPaymentDate).getTime() - new Date(b.nextPaymentDate).getTime());

    return {
      bondCount: bonds.length,
      stockCount: stocks.length,
      cryptoCount: crypto.length,
      cashCount: cash.length,
      totalBondValue,
      totalAnnualCouponIncome,
      allBondPayments,
      upcomingBondPayments
    };
  }

  async buildPortfolioContext(investments, currency = 'USD', exchangeRates = {}) {
    const now = new Date();
    const summary = this.calculatePortfolioSummary(investments);
    const analysis = this.analyzePortfolio(investments);

    return {
      currentDateFormatted: now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      currentTime: now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
      }),
      totalValue: summary.totalValue,
      totalInvested: summary.totalInvested,
      totalGainLoss: summary.totalGainLoss,
      totalGainLossPercentage: summary.totalGainLossPercentage,
      investments,
      portfolioAnalysis: analysis,
      currency,
      exchangeRates,
      lastUpdated: summary.lastUpdated
    };
  }

  analyzePerformance(investments, analysisType = 'performance', timeframe = 'all time') {
    const summary = this.calculatePortfolioSummary(investments);
    const analysis = this.analyzePortfolio(investments);

    switch (analysisType) {
      case 'performance':
        return {
          analysisType,
          timeframe,
          timestamp: new Date().toISOString(),
          results: {
            totalValue: summary.totalValue,
            totalInvested: summary.totalInvested,
            totalGainLoss: summary.totalGainLoss,
            totalGainLossPercentage: summary.totalGainLossPercentage,
            bestPerformer: investments.reduce((best, inv) => {
              const currentReturn = ((inv.currentPrice - inv.purchasePrice) / inv.purchasePrice) * 100;
              const bestReturn = ((best.currentPrice - best.purchasePrice) / best.purchasePrice) * 100;
              return currentReturn > bestReturn ? inv : best;
            }),
            worstPerformer: investments.reduce((worst, inv) => {
              const currentReturn = ((inv.currentPrice - inv.purchasePrice) / inv.purchasePrice) * 100;
              const worstReturn = ((worst.currentPrice - worst.purchasePrice) / worst.purchasePrice) * 100;
              return currentReturn < worstReturn ? inv : worst;
            })
          }
        };

      case 'bonds':
        return {
          analysisType,
          timeframe,
          timestamp: new Date().toISOString(),
          results: {
            bondCount: analysis.bondCount,
            totalBondValue: analysis.totalBondValue,
            totalAnnualCouponIncome: analysis.totalAnnualCouponIncome,
            upcomingPayments: analysis.upcomingBondPayments.map(payment => ({
              symbol: payment.symbol,
              nextPayment: payment.nextPaymentDate,
              amount: payment.paymentAmount
            }))
          }
        };

      case 'overview':
        return {
          analysisType,
          timeframe,
          timestamp: new Date().toISOString(),
          results: {
            summary: `Portfolio overview for ${timeframe}`,
            totalInvestments: investments.length,
            assetAllocation: {
              stocks: analysis.stockCount,
              bonds: analysis.bondCount,
              crypto: analysis.cryptoCount,
              cash: analysis.cashCount
            }
          }
        };

      default:
        return {
          analysisType,
          timeframe,
          timestamp: new Date().toISOString(),
          results: { message: 'Analysis type not implemented' }
        };
    }
  }

  getRelativeTiming(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return `${Math.abs(diffDays)} days overdue`;
    } else if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Tomorrow';
    } else if (diffDays <= 7) {
      return `In ${diffDays} days`;
    } else if (diffDays <= 30) {
      const weeks = Math.ceil(diffDays / 7);
      return `In ${weeks} week${weeks > 1 ? 's' : ''}`;
    } else {
      const months = Math.ceil(diffDays / 30);
      return `In ${months} month${months > 1 ? 's' : ''}`;
    }
  }

  addInvestment(currentInvestments, newInvestmentData) {
    const newInvestment = {
      id: randomUUID(),
      currentPrice: newInvestmentData.purchasePrice,
      lastUpdated: new Date().toISOString(),
      ...newInvestmentData,
    };
    const updatedInvestments = [...currentInvestments, newInvestment];
    const summary = this.calculatePortfolioSummary(updatedInvestments);
    return { updatedInvestments, summary };
  }

  updateInvestment(currentInvestments, id, updates) {
    const investmentIndex = currentInvestments.findIndex(inv => inv.id === id);
    if (investmentIndex === -1) {
      throw new Error(`No investment found with ID: ${id}`);
    }

    const updatedInvestment = {
      ...currentInvestments[investmentIndex],
      ...updates,
      symbol: updates.symbol ? updates.symbol.toUpperCase().trim() : currentInvestments[investmentIndex].symbol,
      name: updates.name ? updates.name.trim() : currentInvestments[investmentIndex].name,
    };

    const newInvestments = [...currentInvestments];
    newInvestments[investmentIndex] = updatedInvestment;
    const summary = this.calculatePortfolioSummary(newInvestments);
    return { updatedInvestments: newInvestments, summary, updatedInvestment };
  }

  removeInvestment(currentInvestments, id) {
    const investmentIndex = currentInvestments.findIndex(inv => inv.id === id);
    if (investmentIndex === -1) {
      throw new Error(`No investment found with ID: ${id}`);
    }
    const removedInvestment = currentInvestments[investmentIndex];
    const updatedInvestments = currentInvestments.filter(inv => inv.id !== id);
    const summary = this.calculatePortfolioSummary(updatedInvestments);
    return { updatedInvestments, summary, removedInvestment };
  }

  listInvestments(currentInvestments, filters = {}) {
    let filtered = currentInvestments;
    if (filters.type) {
      filtered = filtered.filter(inv => inv.type === filters.type);
    }
    if (filters.symbol) {
      filtered = filtered.filter(inv => inv.symbol.toLowerCase().includes(filters.symbol.toLowerCase()));
    }
    return filtered;
  }
}

// Price Service Implementation
class PriceService {
  constructor() {
    this.cache = new Map();
    this.CACHE_DURATION = 60000; // 1 minute
  }

  async getCryptoPrice(symbol) {
    try {
      const CRYPTO_ID_MAP = {
        'BTC': 'bitcoin',
        'ETH': 'ethereum',
        'ADA': 'cardano',
        'DOT': 'polkadot',
        'LINK': 'chainlink',
        'SOL': 'solana',
        'MATIC': 'polygon',
        'AVAX': 'avalanche-2',
        'ATOM': 'cosmos',
        'LUNA': 'terra-luna-2',
      };

      const coinId = CRYPTO_ID_MAP[symbol.toUpperCase()] || symbol.toLowerCase();
      const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true`);

      if (!response.ok) throw new Error('Failed to fetch crypto price');

      const data = await response.json();
      const coinData = data[coinId];

      if (!coinData) return null;

      return coinData.usd;
    } catch (error) {
      console.error(`Error fetching crypto price for ${symbol}:`, error);
      return null;
    }
  }

  async getStockPrice(symbol) {
    try {
      const response = await fetch(`/api/yahoo/v8/finance/chart/${symbol}?interval=1d&range=1d`);
      if (!response.ok) throw new Error('Failed to fetch stock price');

      const data = await response.json();
      const result = data.chart?.result?.[0];
      return result?.meta?.regularMarketPrice || null;
    } catch (error) {
      console.error(`Error fetching stock price for ${symbol}:`, error);
      return null;
    }
  }

  calculateBondValue(investment) {
    if (!investment.fixedYield) return investment.purchasePrice;

    const purchaseDate = new Date(investment.purchaseDate);
    const now = new Date();
    const yearsPassed = (now.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365);

    return investment.purchasePrice * Math.pow(1 + (investment.fixedYield / 100), yearsPassed);
  }

  async updateInvestmentPrice(investment) {
    const cacheKey = `${investment.type}-${investment.symbol}`;
    const cached = this.cache.get(cacheKey);

    // Return cached data if still fresh
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return {
        ...investment,
        currentPrice: cached.data.price,
        lastUpdated: cached.data.lastUpdated,
      };
    }

    let price = null;

    switch (investment.type) {
      case 'crypto':
        price = await this.getCryptoPrice(investment.symbol);
        break;
      case 'stock':
      case 'etf':
        price = await this.getStockPrice(investment.symbol);
        break;
      case 'bond':
        price = this.calculateBondValue(investment);
        break;
      default:
        price = investment.currentPrice || investment.purchasePrice;
    }

    const updatedInvestment = {
      ...investment,
      currentPrice: price || investment.currentPrice || investment.purchasePrice,
      lastUpdated: new Date().toISOString(),
    };

    // Cache the result
    if (price !== null) {
      this.cache.set(cacheKey, {
        data: {
          symbol: investment.symbol,
          price,
          lastUpdated: updatedInvestment.lastUpdated,
        },
        timestamp: Date.now(),
      });
    }

    return updatedInvestment;
  }

  async updateBulkPrices(investments) {
    const results = [];

    for (const investment of investments) {
      try {
        const oldPrice = investment.currentPrice || investment.purchasePrice;
        const updatedInvestment = await this.updateInvestmentPrice(investment);
        const newPrice = updatedInvestment.currentPrice || investment.purchasePrice;

        const priceChange = newPrice - oldPrice;
        const priceChangePercent = oldPrice > 0 ? (priceChange / oldPrice) * 100 : 0;

        results.push({
          symbol: investment.symbol,
          type: investment.type,
          oldPrice,
          newPrice,
          priceChange,
          priceChangePercent,
          success: true,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        results.push({
          symbol: investment.symbol,
          type: investment.type,
          oldPrice: investment.currentPrice || investment.purchasePrice,
          newPrice: investment.currentPrice || investment.purchasePrice,
          priceChange: 0,
          priceChangePercent: 0,
          success: false,
          timestamp: new Date().toISOString(),
          error: error.message
        });
      }
    }

    const successCount = results.filter(r => r.success).length;

    return {
      results,
      successCount,
      totalCount: investments.length,
      timestamp: new Date().toISOString()
    };
  }
}

// Analysis Service Implementation
class AnalysisService {
  constructor() {
    this.portfolioService = new PortfolioService();
  }

  analyzePortfolio(investments) {
    return this.portfolioService.analyzePerformance(investments);
  }
}

export default async function handler(req, res) {
  // IMMEDIATE LOGGING - This should show up if function is called
  console.log('🔥 FUNCTION CALLED - api/chat.mjs handler started');
  console.log('🔥 Request method:', req.method);
  console.log('🔥 Request URL:', req.url);
  console.log('🔥 Request headers:', JSON.stringify(req.headers, null, 2));

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  try {
    const { messages } = req.body;
    let { portfolioContext } = req.body;

    if (!messages || !Array.isArray(messages)) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Messages array is required' }));
      return;
    }

    // Check if AI Gateway API key is available
    console.log('🚀 Starting AI request...');
    console.log('Environment check - AI_GATEWAY_API_KEY exists:', !!process.env.AI_GATEWAY_API_KEY);
    console.log('Environment check - AI_GATEWAY_API_KEY length:', process.env.AI_GATEWAY_API_KEY?.length || 0);

    if (!process.env.AI_GATEWAY_API_KEY) {
      console.error('❌ AI_GATEWAY_API_KEY is not set in environment variables');
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: 'AI Gateway API key not configured',
        content: "I'm currently having trouble connecting to the AI service. Please try again in a moment."
      }));
      return;
    }

    // 🎯 CONTEXT OPTIMIZATION: Analyze user query to optimize context
    const userMessage = messages[messages.length - 1]?.content || '';
    const queryAnalysis = AI_CONFIG.ENABLE_QUERY_ANALYSIS ? analyzeQuery(userMessage) : { isSpecific: false };

    console.log('🔍 Query Analysis:', {
      query: userMessage,
      isSpecific: queryAnalysis.isSpecific,
      symbols: queryAnalysis.symbols,
      names: queryAnalysis.names,
      types: queryAnalysis.types
    });

    // Determine if we should use optimized context
    const portfolioSize = portfolioContext?.investments?.length || 0;
    const shouldSummarize = AI_CONFIG.ENABLE_CONTEXT_SUMMARIZATION &&
      !queryAnalysis.isSpecific &&
      portfolioSize > AI_CONFIG.LARGE_PORTFOLIO_THRESHOLD;
    const shouldFilter = queryAnalysis.isSpecific && portfolioSize > 0;

    console.log('📊 Context Optimization Decision:', {
      portfolioSize,
      shouldSummarize,
      shouldFilter,
      originalInvestments: portfolioSize
    });

    // Apply context optimization
    let contextNote = '';
    if (shouldFilter && portfolioContext?.investments) {
      const originalSize = portfolioContext.investments.length;
      const filteredInvestments = filterRelevantAssets(portfolioContext.investments, queryAnalysis);
      portfolioContext.investments = filteredInvestments;

      const filteredSymbols = filteredInvestments.map(inv => inv.symbol).join(', ');
      contextNote = `\n\nNOTE: Showing details for ${filteredInvestments.length} relevant investment(s): ${filteredSymbols}. Ask about other investments if needed.`;

      console.log('✂️ Context Filtered:', {
        originalSize,
        filteredSize: filteredInvestments.length,
        symbols: filteredSymbols
      });
    } else if (shouldSummarize && portfolioContext?.investments) {
      const summary = summarizePortfolio(portfolioContext.investments);
      portfolioContext.portfolioSummary = summary;
      portfolioContext.investments = []; // Clear full investment list to save tokens

      contextNote = `\n\nNOTE: Showing portfolio summary for ${summary.investmentCount} investments. Ask about specific investments for detailed information.`;

      console.log('📝 Context Summarized:', {
        originalSize: summary.investmentCount,
        topPerformers: summary.topPerformers.length,
        bottomPerformers: summary.bottomPerformers.length
      });
    }

    // Estimate token usage
    const contextString = JSON.stringify(portfolioContext);
    const estimatedTokens = estimateTokenCount(contextString);
    console.log('🎯 Estimated Context Tokens:', estimatedTokens);

    // Build system prompt with portfolio context
    let systemPrompt = `You are an advanced AI investment assistant with access to the user's portfolio data and real-time market information. Your role is to provide personalized, data-driven insights, analysis, and recommendations.

CRITICAL: You have access to investment management tools. When users want to create, edit, or delete investments, you MUST use the appropriate tools:
- addInvestment: Create new investments
- updateInvestment: Modify existing investments  
- removeInvestment: Delete investments
- listInvestments: Show investments with optional filtering
- testTool: Test tool to verify tool calling works

NEVER just describe what you would do - ALWAYS call the actual tools. If a user asks to add an investment, you MUST call the addInvestment tool with the provided data.

IMPORTANT: Before adding any investment, you MUST call the testTool first to verify tool calling is working.

MULTIPLE TASK COMPLETION - CRITICAL:
When a user requests multiple actions (e.g., "add Apple stock AND Bitcoin"), you MUST complete ALL requested actions sequentially:
1. Identify ALL the separate actions the user is requesting
2. Execute each action one by one using the appropriate tools
3. Do NOT stop after the first successful action - continue until ALL actions are completed
4. If you encounter an error with one action, continue with the remaining actions
5. Provide a summary of ALL completed actions at the end

Example: If user says "add 100 shares of Apple and 1 Bitcoin", you must:
- Step 1: Call addInvestment for Apple
- Step 2: Call addInvestment for Bitcoin  
- Step 3: Provide summary of both additions

DO NOT stop after just adding Apple - you must also add Bitcoin as requested.

PORTFOLIO CONTEXT:
The user has a diversified investment portfolio with the following holdings:

Current Date and Time: ${portfolioContext?.currentDateFormatted || 'Not available'} (${portfolioContext?.currentTime || 'Not available'})

Portfolio Summary:
- Total Value: $${portfolioContext?.totalValue?.toFixed(2) || '0.00'}
- Total Invested: $${portfolioContext?.totalInvested?.toFixed(2) || '0.00'}
- Total Gain/Loss: $${portfolioContext?.totalGainLoss?.toFixed(2) || '0.00'} (${portfolioContext?.totalGainLossPercentage?.toFixed(2) || '0.00'}%)

Portfolio Analysis:
- Bonds: ${portfolioContext?.portfolioAnalysis?.bondCount || 0} holdings
- Stocks: ${portfolioContext?.portfolioAnalysis?.stockCount || 0} holdings
- Crypto: ${portfolioContext?.portfolioAnalysis?.cryptoCount || 0} holdings
- Cash: ${portfolioContext?.portfolioAnalysis?.cashCount || 0} holdings
- Total Bond Value: $${portfolioContext?.portfolioAnalysis?.totalBondValue?.toFixed(2) || '0.00'}
- Total Annual Coupon Income: $${portfolioContext?.portfolioAnalysis?.totalAnnualCouponIncome?.toFixed(2) || '0.00'}`;

    // Add detailed investment information by type
    if (portfolioContext?.investments?.length > 0) {
      const investments = portfolioContext.investments;

      // Group investments by type
      const cryptoInvestments = investments.filter(inv => inv.type === 'crypto');
      const stockInvestments = investments.filter(inv => inv.type === 'stock');
      const bondInvestments = investments.filter(inv => inv.type === 'bond');
      const cashInvestments = investments.filter(inv => inv.type === 'cash');

      if (cryptoInvestments.length > 0) {
        systemPrompt += `\n\nCRYPTOCURRENCY (${cryptoInvestments.length} investment${cryptoInvestments.length > 1 ? 's' : ''}):`;
        cryptoInvestments.forEach(inv => {
          const gainLoss = inv.currentPrice - inv.purchasePrice;
          const gainLossPercent = ((gainLoss / inv.purchasePrice) * 100).toFixed(2);
          systemPrompt += `\n- ${inv.symbol} (${inv.name}): ${inv.quantity} units at $${inv.purchasePrice} purchase price, currently $${inv.currentPrice} (${gainLossPercent}% ${gainLoss >= 0 ? 'gain' : 'loss'})`;
        });
      }

      if (stockInvestments.length > 0) {
        systemPrompt += `\n\nSTOCKS (${stockInvestments.length} investment${stockInvestments.length > 1 ? 's' : ''}):`;
        stockInvestments.forEach(inv => {
          const gainLoss = inv.currentPrice - inv.purchasePrice;
          const gainLossPercent = ((gainLoss / inv.purchasePrice) * 100).toFixed(2);
          systemPrompt += `\n- ${inv.symbol} (${inv.name}): ${inv.quantity} units at $${inv.purchasePrice} purchase price, currently $${inv.currentPrice} (${gainLossPercent}% ${gainLoss >= 0 ? 'gain' : 'loss'})`;
        });
      }

      if (bondInvestments.length > 0) {
        systemPrompt += `\n\nBONDS (${bondInvestments.length} investment${bondInvestments.length > 1 ? 's' : ''}):`;
        bondInvestments.forEach(inv => {
          const gainLoss = inv.currentPrice - inv.purchasePrice;
          const gainLossPercent = ((gainLoss / inv.purchasePrice) * 100).toFixed(2);
          let bondInfo = `\n- ${inv.symbol} (${inv.name}): ${inv.quantity} units at $${inv.purchasePrice}, currently $${inv.currentPrice} (${gainLossPercent}% ${gainLoss >= 0 ? 'gain' : 'loss'}), ${inv.fixedYield}% yield, ${inv.paymentFrequency} payments, matures ${inv.maturityDate}`;

          if (inv.nextPaymentDate) {
            bondInfo += `, next payment ${inv.nextPaymentDate}`;
          } else if (inv.lastPaymentDate) {
            bondInfo += `, last payment ${inv.lastPaymentDate}`;
          }

          systemPrompt += bondInfo;
        });
      }

      if (cashInvestments.length > 0) {
        systemPrompt += `\n\nCASH (${cashInvestments.length} holding${cashInvestments.length > 1 ? 's' : ''}):`;
        cashInvestments.forEach(inv => {
          systemPrompt += `\n- ${inv.name}: $${inv.quantity.toFixed(2)}`;
        });
      }
    }

    // Add bond payment information if available
    if (portfolioContext?.portfolioAnalysis?.allBondPayments?.length > 0) {
      systemPrompt += `\n\nBOND PAYMENT SCHEDULE:`;
      systemPrompt += `\n\nAll Bond Payment Information:\n${portfolioContext.portfolioAnalysis.allBondPayments.map(payment => {
        let paymentInfo = `- ${payment.symbol} (${payment.name}): $${payment.paymentAmount?.toFixed(2) || '0.00'} annual coupon`;

        if (payment.hasSpecificDate) {

          // Define tools using proper AI SDK format from documentation
          const refreshPricesTool = tool({
            description: 'Refresh prices for all investments in the portfolio. Use this when user asks to refresh, update, or get latest prices for their investments.',
            inputSchema: z.object({
              refreshAll: z.boolean().optional().describe('Set to true to refresh all portfolio investments (default: true)')
            }),
            execute: async (input, options) => {
              console.log('🔄 Tool execute called: refreshPrices');
              console.log('🔄 Raw input received:', JSON.stringify(input, null, 2));
              console.log('🔄 Options received:', JSON.stringify(options, null, 2));

              try {
                const investments = portfolioContext.investments || [];
                console.log('🔄 Found investments to refresh:', investments.length);

                if (investments.length === 0) {
                  return {
                    success: false,
                    message: 'No investments found in portfolio to refresh',
                    timestamp: new Date().toISOString()
                  };
                }

                // Use modularized price service
                const result = await priceService.updateBulkPrices(investments);

                // Update the portfolioContext with new prices
                const updatedInvestments = investments.map(investment => {
                  const priceResult = result.results.find(r => r.symbol === investment.symbol);
                  if (priceResult && priceResult.success) {
                    return {
                      ...investment,
                      currentPrice: priceResult.newPrice,
                      lastUpdated: priceResult.timestamp
                    };
                  }
                  return investment;
                });

                // Update the portfolioContext object
                portfolioContext.investments = updatedInvestments;
                const summary = portfolioService.calculatePortfolioSummary(updatedInvestments);
                portfolioContext.totalValue = summary.totalValue;
                portfolioContext.totalGainLoss = summary.totalGainLoss;
                portfolioContext.totalGainLossPercentage = summary.totalGainLossPercentage;

                return {
                  success: true,
                  results: result.results,
                  message: `Successfully refreshed prices for ${result.successCount} out of ${result.totalCount} investments`,
                  totalInvestments: result.totalCount,
                  successfullyRefreshed: result.successCount,
                  timestamp: new Date().toISOString(),
                  updatedPortfolio: {
                    investments: updatedInvestments,
                    totalValue: summary.totalValue,
                    totalInvested: summary.totalInvested,
                    totalGainLoss: summary.totalGainLoss,
                    totalGainLossPercentage: summary.totalGainLossPercentage
                  }
                };

              } catch (error) {
                console.error('🔄 Error in refreshPrices tool:', error);
                return {
                  success: false,
                  error: error.message,
                  message: 'Failed to refresh prices'
                };
              }
            }
          });

          const analyzePortfolioTool = tool({
            description: 'Analyze portfolio performance and provide insights. Use this when user asks for portfolio analysis, performance review, or investment insights.',
            inputSchema: z.object({
              analysisType: z.enum(['performance', 'risk', 'diversification', 'bonds', 'overview']).describe('Type of analysis to perform'),
              timeframe: z.string().optional().describe('Timeframe for analysis (e.g., "1 year", "6 months", "all time")')
            }),
            execute: async (input, options) => {
              console.log('📊 Tool execute called: analyzePortfolio');
              console.log('📊 Raw input received:', JSON.stringify(input, null, 2));
              console.log('📊 Options received:', JSON.stringify(options, null, 2));

              const { analysisType, timeframe = 'all time' } = input;
              console.log('📊 Extracted analysisType:', analysisType, 'timeframe:', timeframe);

              try {
                const investments = portfolioContext.investments || [];

                // Use modularized analysis service
                const analysis = portfolioService.analyzePerformance(investments, analysisType, timeframe);

                return {
                  success: true,
                  analysis,
                  message: `Portfolio analysis completed for ${analysisType} over ${timeframe}`
                };
              } catch (error) {
                console.error('📊 Error in analyzePortfolio tool:', error);
                return {
                  success: false,
                  error: error.message,
                  message: 'Failed to analyze portfolio'
                };
              }
            }
          });

          const addInvestmentTool = tool({
            description: 'Add a new investment to the portfolio. Use this when user wants to create a new investment.',
            inputSchema: z.object({
              symbol: z.string().min(1, 'Symbol is required'),
              name: z.string().min(1, 'Name is required'),
              type: z.enum(['crypto', 'stock', 'bond', 'etf', 'commodity', 'cash', 'other']),
              quantity: z.number().positive('Quantity must be positive'),
              purchasePrice: z.number().positive('Purchase price must be positive'),
              purchaseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
              // Optional fields based on type
              fixedYield: z.number().optional(),
              paymentFrequency: z.string().optional(),
              maturityDate: z.string().optional(),
              faceValue: z.number().optional(),
              currency: z.string().optional()
            }),
            execute: async (input) => {
              console.log('➕ Tool execute called: addInvestment');
              console.log('➕ Raw input received:', JSON.stringify(input, null, 2));

              try {
                // Validation
                if (!input.symbol || !input.name || !input.type || !input.quantity || !input.purchasePrice || !input.purchaseDate) {
                  return {
                    success: false,
                    error: 'Missing required fields',
                    message: 'Please provide symbol, name, type, quantity, purchase price, and purchase date'
                  };
                }

                // Initialize portfolio context if it doesn't exist
                if (!portfolioContext) {
                  portfolioContext = {
                    investments: [],
                    totalValue: 0,
                    totalInvested: 0,
                    totalGainLoss: 0,
                    totalGainLossPercentage: 0,
                    currency: 'USD',
                    exchangeRates: {},
                    lastUpdated: null
                  };
                }

                // Create new investment data
                const newInvestmentData = {
                  symbol: input.symbol.toUpperCase().trim(),
                  name: input.name.trim(),
                  type: input.type,
                  quantity: input.quantity,
                  purchasePrice: input.purchasePrice,
                  purchaseDate: input.purchaseDate,
                  // Optional fields
                  ...(input.fixedYield && { fixedYield: input.fixedYield }),
                  ...(input.paymentFrequency && { paymentFrequency: input.paymentFrequency }),
                  ...(input.maturityDate && { maturityDate: input.maturityDate }),
                  ...(input.faceValue && { faceValue: input.faceValue }),
                  ...(input.currency && { currency: input.currency })
                };

                // Use modularized portfolio service
                const { updatedInvestments, summary } = portfolioService.addInvestment(
                  portfolioContext.investments || [],
                  newInvestmentData
                );

                // Update portfolio context
                portfolioContext.investments = updatedInvestments;
                portfolioContext.totalValue = summary.totalValue;
                portfolioContext.totalInvested = summary.totalInvested;
                portfolioContext.totalGainLoss = summary.totalGainLoss;
                portfolioContext.totalGainLossPercentage = summary.totalGainLossPercentage;

                const newInvestment = updatedInvestments[updatedInvestments.length - 1];

                return {
                  success: true,
                  investment: newInvestment,
                  message: `Successfully added ${input.quantity} shares of ${input.symbol} (${input.name}) to your portfolio`,
                  updatedPortfolio: {
                    investments: updatedInvestments,
                    totalValue: summary.totalValue,
                    totalInvested: summary.totalInvested,
                    totalGainLoss: summary.totalGainLoss,
                    totalGainLossPercentage: summary.totalGainLossPercentage
                  }
                };
              } catch (error) {
                console.error('➕ Error in addInvestment tool:', error);
                return {
                  success: false,
                  error: error.message,
                  message: 'Failed to add investment'
                };
              }
            }
          });

          const updateInvestmentTool = tool({
            description: 'Update an existing investment in the portfolio. Use this when user wants to modify an investment.',
            inputSchema: z.object({
              id: z.string().min(1, 'Investment ID is required'),
              updates: z.object({
                symbol: z.string().optional(),
                name: z.string().optional(),
                quantity: z.number().optional(),
                purchasePrice: z.number().optional(),
                purchaseDate: z.string().optional(),
                fixedYield: z.number().optional(),
                paymentFrequency: z.string().optional(),
                maturityDate: z.string().optional(),
                faceValue: z.number().optional(),
                currency: z.string().optional()
              })
            }),
            execute: async (input) => {
              console.log('✏️ Tool execute called: updateInvestment');
              console.log('✏️ Raw input received:', JSON.stringify(input, null, 2));

              try {
                const { id, updates } = input;

                // Initialize portfolio context if it doesn't exist
                if (!portfolioContext) {
                  portfolioContext = {
                    investments: [],
                    totalValue: 0,
                    totalInvested: 0,
                    totalGainLoss: 0,
                    totalGainLossPercentage: 0,
                    currency: 'USD',
                    exchangeRates: {},
                    lastUpdated: null
                  };
                }

                // Prepare updates with proper formatting
                const formattedUpdates = {
                  ...updates,
                  // Ensure symbol is uppercase if provided
                  ...(updates.symbol && { symbol: updates.symbol.toUpperCase().trim() }),
                  // Ensure name is trimmed if provided
                  ...(updates.name && { name: updates.name.trim() })
                };

                // Use modularized portfolio service
                const { updatedInvestments, summary } = portfolioService.updateInvestment(
                  portfolioContext.investments || [],
                  id,
                  formattedUpdates
                );

                // Update portfolio context
                portfolioContext.investments = updatedInvestments;
                portfolioContext.totalValue = summary.totalValue;
                portfolioContext.totalInvested = summary.totalInvested;
                portfolioContext.totalGainLoss = summary.totalGainLoss;
                portfolioContext.totalGainLossPercentage = summary.totalGainLossPercentage;

                const updatedInvestment = updatedInvestments.find(inv => inv.id === id);

                return {
                  success: true,
                  investment: updatedInvestment,
                  message: `Successfully updated investment ${updatedInvestment?.symbol} (${updatedInvestment?.name})`,
                  updatedPortfolio: {
                    investments: updatedInvestments,
                    totalValue: summary.totalValue,
                    totalInvested: summary.totalInvested,
                    totalGainLoss: summary.totalGainLoss,
                    totalGainLossPercentage: summary.totalGainLossPercentage
                  }
                };
              } catch (error) {
                console.error('✏️ Error in updateInvestment tool:', error);
                return {
                  success: false,
                  error: error.message,
                  message: 'Failed to update investment'
                };
              }
            }
          });

          const removeInvestmentTool = tool({
            description: 'Remove an investment from the portfolio. Use this when user wants to delete an investment.',
            inputSchema: z.object({
              id: z.string().min(1, 'Investment ID is required')
            }),
            execute: async (input) => {
              console.log('🗑️ Tool execute called: removeInvestment');
              console.log('🗑️ Raw input received:', JSON.stringify(input, null, 2));

              try {
                const { id } = input;

                // Initialize portfolio context if it doesn't exist
                if (!portfolioContext) {
                  portfolioContext = {
                    investments: [],
                    totalValue: 0,
                    totalInvested: 0,
                    totalGainLoss: 0,
                    totalGainLossPercentage: 0,
                    currency: 'USD',
                    exchangeRates: {},
                    lastUpdated: null
                  };
                }

                // Use modularized portfolio service
                const { updatedInvestments, summary, removedInvestment } = portfolioService.removeInvestment(
                  portfolioContext.investments || [],
                  id
                );

                // Update portfolio context
                portfolioContext.investments = updatedInvestments;
                portfolioContext.totalValue = summary.totalValue;
                portfolioContext.totalInvested = summary.totalInvested;
                portfolioContext.totalGainLoss = summary.totalGainLoss;
                portfolioContext.totalGainLossPercentage = summary.totalGainLossPercentage;

                return {
                  success: true,
                  removedInvestment: removedInvestment,
                  message: `Successfully removed investment ${removedInvestment.symbol} (${removedInvestment.name}) from your portfolio`,
                  updatedPortfolio: {
                    investments: updatedInvestments,
                    totalValue: summary.totalValue,
                    totalInvested: summary.totalInvested,
                    totalGainLoss: summary.totalGainLoss,
                    totalGainLossPercentage: summary.totalGainLossPercentage
                  }
                };
              } catch (error) {
                console.error('🗑️ Error in removeInvestment tool:', error);
                return {
                  success: false,
                  error: error.message,
                  message: 'Failed to remove investment'
                };
              }
            }
          });

          const listInvestmentsTool = tool({
            description: 'List investments in the portfolio with optional filtering. Use this when user wants to see their investments.',
            inputSchema: z.object({
              type: z.string().optional().describe('Filter by investment type (crypto, stock, bond, etc.)'),
              symbol: z.string().optional().describe('Filter by symbol')
            }),
            execute: async (input) => {
              console.log('📋 Tool execute called: listInvestments');
              console.log('📋 Raw input received:', JSON.stringify(input, null, 2));

              try {
                // Initialize portfolio context if it doesn't exist
                if (!portfolioContext) {
                  portfolioContext = {
                    investments: [],
                    totalValue: 0,
                    totalInvested: 0,
                    totalGainLoss: 0,
                    totalGainLossPercentage: 0,
                    currency: 'USD',
                    exchangeRates: {},
                    lastUpdated: null
                  };
                }

                // Use modularized portfolio service
                const filteredInvestments = portfolioService.listInvestments(
                  portfolioContext.investments || [],
                  { type: input.type, symbol: input.symbol }
                );

                return {
                  success: true,
                  investments: filteredInvestments,
                  totalCount: filteredInvestments.length,
                  message: `Found ${filteredInvestments.length} investment(s) matching your criteria`
                };
              } catch (error) {
                console.error('📋 Error in listInvestments tool:', error);
                return {
                  success: false,
                  error: error.message,
                  message: 'Failed to list investments'
                };
              }
            }
          });

          // Test tool to verify tool calling works
          const testTool = tool({
            description: 'Test tool to verify tool calling is working. Call this tool when user asks to add investments.',
            inputSchema: z.object({
              message: z.string().describe('Test message')
            }),
            execute: async (input) => {
              console.log('🧪 TEST TOOL CALLED:', input.message);
              return {
                success: true,
                message: 'Test tool executed successfully',
                timestamp: new Date().toISOString()
              };
            }
          });


          // Generate AI response using AI Gateway
          console.log('🤖 Generating AI response through AI Gateway...');
          console.log('🔑 AI_GATEWAY_API_KEY present:', !!process.env.AI_GATEWAY_API_KEY);
          console.log('🔑 AI_GATEWAY_API_KEY starts with:', process.env.AI_GATEWAY_API_KEY?.substring(0, 10) + '...');
          console.log('📝 Model being used: openai/gpt-4o-mini');
          console.log('📊 Messages count:', messages.length);
          console.log('📏 System prompt length:', systemPrompt.length);
          console.log('📏 System prompt preview (last 500 chars):', systemPrompt.slice(-500));
          console.log('🔧 Available tools:', Object.keys({
            refreshPrices: refreshPricesTool,
            analyzePortfolio: analyzePortfolioTool,
            addInvestment: addInvestmentTool,
            updateInvestment: updateInvestmentTool,
            removeInvestment: removeInvestmentTool,
            listInvestments: listInvestmentsTool
          }));

          // Debug tool definitions
          console.log('🔧 Tool definitions check:');
          console.log('  - addInvestmentTool defined:', !!addInvestmentTool);
          console.log('  - updateInvestmentTool defined:', !!updateInvestmentTool);
          console.log('  - removeInvestmentTool defined:', !!removeInvestmentTool);
          console.log('  - listInvestmentsTool defined:', !!listInvestmentsTool);

          const result = await generateText({
            model: 'openai/gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: systemPrompt + `

TOOL CAPABILITIES:
- You have access to a "refreshPrices" tool that refreshes ALL investments in the portfolio (same as the refresh button)
- You have access to an "analyzePortfolio" tool that can perform various portfolio analyses
- You have access to investment management tools: "addInvestment", "updateInvestment", "removeInvestment", "listInvestments"
- When users ask to "refresh prices", "get latest prices", "update prices", or "check current prices", use the refreshPrices tool
- When users ask for "portfolio analysis", "performance review", "risk assessment", or "investment insights", use the analyzePortfolio tool
- When users want to create, edit, or delete investments, use the appropriate investment management tools
- The refreshPrices tool uses the exact same logic as the refresh button in the UI - it updates all investments at once
- Always use the appropriate tool when users request these specific actions, then provide a clear summary of the results
- You can use multiple tools in sequence if needed to fully answer the user's question

INVESTMENT MANAGEMENT - USE THESE TOOLS:
- addInvestment: Create new investments (symbol, name, type, quantity, purchasePrice, purchaseDate required)
- updateInvestment: Modify existing investments (need investment ID)
- removeInvestment: Delete investments (need investment ID)  
- listInvestments: Show investments (optional type/symbol filters)

EXAMPLES - ACTUALLY CALL THE TOOLS:
- User: "Add 100 shares of Apple at $150" → First call testTool, then call addInvestment tool with {symbol: "AAPL", name: "Apple", type: "stock", quantity: 100, purchasePrice: 150, purchaseDate: "2025-09-06"}
- User: "Update my Apple shares to 150" → Call listInvestments to find ID, then updateInvestment
- User: "Remove my Tesla investment" → Call listInvestments to find ID, then removeInvestment
- User: "Show my stocks" → Call listInvestments with type: "stock"

REMEMBER: You must actually call the tools, not just describe what you would do!

TOOL USAGE EXAMPLES:
- User: "Refresh my investment prices" or "Update all prices" or "Get latest prices"
- You: Call refreshPrices tool (it will automatically refresh ALL investments in the portfolio)
- Then provide a clear summary of the updated prices, showing old vs new prices and any significant changes

- User: "Analyze my portfolio performance"
- You: Call analyzePortfolio tool with analysisType: "performance"
- Then provide detailed insights based on the analysis results

- User: "Show me my bond analysis and then refresh my prices"
- You: First call analyzePortfolio with analysisType: "bonds", then call refreshPrices
- Then provide comprehensive insights combining both results`
              },
              ...messages
            ],
            maxTokens: 2000,
            temperature: 0.7,
            stopWhen: stepCountIs(5), // Allow up to 5 steps for multi-step tool calls
            tools: {
              refreshPrices: refreshPricesTool,
              analyzePortfolio: analyzePortfolioTool,
              addInvestment: addInvestmentTool,
              updateInvestment: updateInvestmentTool,
              removeInvestment: removeInvestmentTool,
              listInvestments: listInvestmentsTool,
              testTool: testTool
            },
            onStepFinish: ({ text, toolCalls, toolResults, finishReason, usage }) => {
              console.log('🔄 Step finished:');
              console.log('  - Text length:', text?.length || 0);
              console.log('  - Tool calls:', toolCalls?.length || 0);
              console.log('  - Tool results:', toolResults?.length || 0);
              console.log('  - Finish reason:', finishReason);
              console.log('  - Usage:', usage);

              if (toolCalls?.length > 0) {
                toolCalls.forEach(call => {
                  console.log(`  - Tool called: ${call.toolName}`);
                  console.log(`    - Tool call ID: ${call.toolCallId}`);
                  console.log(`    - Tool args:`, call.args);
                  console.log(`    - Tool input:`, call.input);
                  console.log(`    - Full call object:`, JSON.stringify(call, null, 2));

                  // Special logging for investment management tools
                  if (['addInvestment', 'updateInvestment', 'removeInvestment', 'listInvestments', 'testTool'].includes(call.toolName)) {
                    console.log(`🎯 INVESTMENT TOOL CALLED: ${call.toolName}`);
                    console.log(`🎯 Tool input:`, JSON.stringify(call.input, null, 2));
                  }
                });
              }

              if (toolResults?.length > 0) {
                toolResults.forEach(result => {
                  console.log(`  - Tool result for ${result.toolName}:`);
                  console.log(`    - Result:`, result.output);
                  console.log(`    - Full result object:`, JSON.stringify(result, null, 2));

                  // Special logging for investment management tools
                  if (['addInvestment', 'updateInvestment', 'removeInvestment', 'listInvestments', 'testTool'].includes(result.toolName)) {
                    console.log(`🎯 INVESTMENT TOOL RESULT: ${result.toolName}`);
                    console.log(`🎯 Success:`, result.output?.success);
                    console.log(`🎯 Message:`, result.output?.message);
                    if (result.output?.updatedPortfolio) {
                      console.log(`🎯 Updated portfolio investments count:`, result.output.updatedPortfolio.investments?.length);
                      console.log(`🎯 Updated portfolio symbols:`, result.output.updatedPortfolio.investments?.map(inv => inv.symbol));
                    }
                  }
                });
              }
            }
          });

          console.log('✅ AI Response generated successfully');
          console.log('📊 AI Gateway usage:', result.usage);
          console.log('🔍 Response length:', result.text?.length || 0);
          console.log('🔍 Response preview (first 200 chars):', result.text?.substring(0, 200));

          // Check if response mentions investment actions without calling tools
          if (result.text && result.text.toLowerCase().includes('add') && result.text.toLowerCase().includes('investment') && result.toolCalls?.length === 0) {
            console.log('⚠️ WARNING: Response mentions adding investment but no tools were called!');
            console.log('⚠️ Response text contains:', result.text.toLowerCase().includes('add') ? 'ADD' : 'NO ADD');
            console.log('⚠️ Response text contains:', result.text.toLowerCase().includes('investment') ? 'INVESTMENT' : 'NO INVESTMENT');
            console.log('⚠️ Tool calls made:', result.toolCalls?.length || 0);
          }

          // Check for specific investment management keywords
          if (result.text && (result.text.toLowerCase().includes('apple') || result.text.toLowerCase().includes('aapl')) && result.toolCalls?.length === 0) {
            console.log('⚠️ WARNING: Response mentions Apple/AAPL but no tools were called!');
          }
          console.log('🔍 Full result object keys:', Object.keys(result));
          console.log('🔍 Usage details:', JSON.stringify(result.usage, null, 2));
          console.log('🔍 Steps taken:', result.steps?.length || 0);
          console.log('🔍 Tool calls made:', result.toolCalls?.length || 0);
          console.log('🔍 Tool results:', result.toolResults?.length || 0);

          // Debug tool calls
          if (result.toolCalls?.length > 0) {
            console.log('🔍 All tool calls:', result.toolCalls.map(call => call.toolName));
            console.log('🔍 Tool calls details:', result.toolCalls.map(call => ({
              name: call.toolName,
              args: call.args,
              input: call.input
            })));
          } else {
            console.log('🔍 No tool calls made in this response');
          }

          // Log detailed step information
          if (result.steps?.length > 0) {
            result.steps.forEach((step, index) => {
              console.log(`📋 Step ${index + 1}:`, {
                text: step.text?.substring(0, 100) + '...',
                toolCalls: step.toolCalls?.length || 0,
                toolResults: step.toolResults?.length || 0,
                finishReason: step.finishReason
              });
            });
          }

          // Check if any tool results contain updated portfolio data
          let updatedPortfolio = null;
          if (result.steps) {
            // Find the LAST tool result with updatedPortfolio (this will have the final merged portfolio)
            for (const step of result.steps) {
              if (step.toolResults) {
                for (const toolResult of step.toolResults) {
                  console.log('🔍 Checking tool result:', toolResult.toolName);
                  console.log('🔍 Tool result has output:', !!toolResult.output);
                  console.log('🔍 Tool result output keys:', toolResult.output ? Object.keys(toolResult.output) : 'none');

                  if (toolResult.output && toolResult.output.updatedPortfolio) {
                    updatedPortfolio = toolResult.output.updatedPortfolio;
                    console.log('📊 Found updated portfolio data from tool result:', toolResult.toolName);
                    // Don't break - continue to find the LAST (final) portfolio update
                  }
                }
              }
            }
          }

          const responseData = {
            content: result.text,
            usage: result.usage,
            steps: result.steps?.length || 0,
            toolCalls: result.toolCalls?.length || 0,
            toolResults: result.toolResults?.length || 0
          };

          // Include updated portfolio data if available
          if (updatedPortfolio) {
            responseData.updatedPortfolio = updatedPortfolio;
            console.log('📊 Including updated portfolio in response');
            console.log('📊 Updated portfolio investments count:', updatedPortfolio.investments?.length);
            console.log('📊 Updated portfolio symbols:', updatedPortfolio.investments?.map(inv => inv.symbol));
          } else {
            console.log('📊 No updated portfolio data to include');
          }


          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(responseData));

        } catch (error) {
          console.error('❌ Error in chat API:', error);
          console.error('❌ Error details:', error.message);
          console.error('❌ Error stack:', error.stack);

          // Handle tool-specific errors as per AI SDK documentation
          if (NoSuchToolError.isInstance(error)) {
            console.error('❌ No such tool error:', error.toolName);
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              error: 'Tool not found',
              content: `I tried to use a tool called "${error.toolName}" that doesn't exist. This is a configuration issue on my end. Please try a different request.`
            }));
            return;
          }

          if (InvalidToolInputError.isInstance(error)) {
            console.error('❌ Invalid tool input error:', error.toolName, error.input);
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              error: 'Invalid tool input',
              content: `I tried to call the "${error.toolName}" tool with invalid parameters. Let me try to help you in a different way.`
            }));
            return;
          }

          // Check if it's an AI Gateway specific error
          if (error.message?.includes('AI_GATEWAY_API_KEY') || error.message?.includes('gateway')) {
            console.error('❌ AI Gateway authentication error');
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              error: 'AI Gateway authentication failed',
              content: "I'm having trouble connecting to the AI service. Please try again in a moment."
            }));
            return;
          }

          // Check if it's a model-specific error
          if (error.message?.includes('model') || error.message?.includes('openai')) {
            console.error('❌ Model configuration error');
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              error: 'Model configuration error',
              content: "I'm having trouble with the AI model configuration. Please try again in a moment."
            }));
            return;
          }

          // Check for tool execution errors in steps
          if (error.steps) {
            const toolErrors = error.steps.flatMap(step =>
              step.content?.filter(part => part.type === 'tool-error') || []
            );

            if (toolErrors.length > 0) {
              console.error('❌ Tool execution errors:', toolErrors);
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({
                error: 'Tool execution failed',
                content: "I encountered an error while trying to use my tools. Let me try to help you without using tools."
              }));
              return;
            }
          }

          // Generic error fallback
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            error: 'Internal server error',
            content: "I'm currently having trouble connecting to the AI service. Please try again in a moment."
          }));
        }
      }