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

export interface PriceUpdateResult {
  symbol: string;
  type: string;
  oldPrice: number;
  newPrice: number;
  priceChange: number;
  priceChangePercent: number;
  success: boolean;
  timestamp: string;
  error?: string;
}

export interface BulkPriceUpdateResult {
  results: PriceUpdateResult[];
  successCount: number;
  totalCount: number;
  timestamp: string;
}

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

  /**
   * Update prices for multiple investments in bulk with detailed results
   */
  async updateBulkPrices(investments: Investment[]): Promise<BulkPriceUpdateResult> {
    const results: PriceUpdateResult[] = [];
    
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
          error: error instanceof Error ? error.message : 'Unknown error'
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

  /**
   * Get price for a specific symbol and type
   */
  async getPrice(symbol: string, type: string): Promise<number | null> {
    switch (type) {
      case 'crypto':
        return await this.getCryptoPrice(symbol);
      case 'stock':
      case 'etf':
        return await this.getStockPrice(symbol);
      default:
        return null;
    }
  }

  /**
   * Clear cache for a specific symbol
   */
  clearCacheForSymbol(symbol: string, type: string): void {
    const cacheKey = `${type}-${symbol}`;
    this.cache.delete(cacheKey);
  }

  /**
   * Clear all cached prices
   */
  clearAllCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}