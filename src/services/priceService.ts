import type { Investment, PriceData } from '../types/investment';

const COINGECKO_API = 'https://api.coingecko.com/api/v3';

// Map of crypto symbols to CoinGecko IDs
const CRYPTO_ID_MAP: Record<string, string> = {
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

export class PriceService {
  private cache = new Map<string, { data: PriceData; timestamp: number }>();
  private readonly CACHE_DURATION = 60000; // 1 minute

  async getCryptoPrice(symbol: string): Promise<number | null> {
    try {
      const coinId = CRYPTO_ID_MAP[symbol.toUpperCase()] || symbol.toLowerCase();
      const response = await fetch(
        `${COINGECKO_API}/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true`
      );
      
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

  async getStockPrice(symbol: string): Promise<number | null> {
    try {
      // Using proxied Yahoo Finance API to avoid CORS issues
      const response = await fetch(
        `/api/yahoo/v8/finance/chart/${symbol}?interval=1d&range=1d`
      );
      
      if (!response.ok) throw new Error('Failed to fetch stock price');
      
      const data = await response.json();
      const result = data.chart?.result?.[0];
      const price = result?.meta?.regularMarketPrice;
      
      return price || null;
    } catch (error) {
      console.error(`Error fetching stock price for ${symbol}:`, error);
      return null;
    }
  }

  async updateInvestmentPrice(investment: Investment): Promise<Investment> {
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

    let price: number | null = null;

    switch (investment.type) {
      case 'crypto':
        price = await this.getCryptoPrice(investment.symbol);
        break;
      case 'stock':
      case 'etf':
        price = await this.getStockPrice(investment.symbol);
        break;
      case 'bond':
        // Bonds typically don't have live prices, use purchase price + yield calculation
        price = this.calculateBondValue(investment);
        break;
      default:
        // For other types, keep the last known price or purchase price
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

  private calculateBondValue(investment: Investment): number {
    if (!investment.fixedYield) return investment.purchasePrice;
    
    const purchaseDate = new Date(investment.purchaseDate);
    const now = new Date();
    const yearsPassed = (now.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
    
    // Simple compound interest calculation
    return investment.purchasePrice * Math.pow(1 + (investment.fixedYield / 100), yearsPassed);
  }

  async updateAllPrices(investments: Investment[]): Promise<Investment[]> {
    const updatePromises = investments.map(investment => 
      this.updateInvestmentPrice(investment)
    );
    
    return Promise.all(updatePromises);
  }
}