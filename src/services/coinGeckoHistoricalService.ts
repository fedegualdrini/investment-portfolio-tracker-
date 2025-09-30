import { HistoricalPriceData } from '../types/performance.js';
import { DataGapFiller } from './dataGapFiller.js';

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
  'USDT': 'tether',
  'USDC': 'usd-coin',
  'BNB': 'binancecoin',
  'XRP': 'ripple',
  'DOGE': 'dogecoin',
  'LTC': 'litecoin',
  'BCH': 'bitcoin-cash',
  'EOS': 'eos',
  'TRX': 'tron',
  'XLM': 'stellar',
};

export interface CoinGeckoHistoricalResponse {
  prices: Array<[number, number]>; // [timestamp, price]
  market_caps: Array<[number, number]>;
  total_volumes: Array<[number, number]>;
}

export class CoinGeckoHistoricalService {
  private cache = new Map<string, { data: HistoricalPriceData[]; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private lastRequestTime = 0;
  private requestQueue: Array<() => void> = [];
  private isProcessingQueue = false;
  private retryAttempts = new Map<string, number>();

  async getHistoricalData(
    symbol: string,
    startDate: string,
    endDate: string
  ): Promise<HistoricalPriceData[]> {
    const cacheKey = `coingecko_${symbol}_${startDate}_${endDate}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const startTimestamp = Math.floor(new Date(startDate).getTime() / 1000);
      const endTimestamp = Math.floor(new Date(endDate).getTime() / 1000);

      // Use proxy endpoint to avoid CORS issues
      const proxyUrl = `/api/coingecko?coinId=${encodeURIComponent(symbol)}&start=${startTimestamp}&end=${endTimestamp}`;

      // Use rate-limited request method
      const data = await this.makeRateLimitedRequest(proxyUrl, cacheKey);

      if (!data.prices || data.prices.length === 0) {
        throw new Error(`No price data found for ${symbol}`);
      }

      const historicalData: HistoricalPriceData[] = [];

      // CoinGecko returns hourly data, we need to convert to daily
      const dailyData = this.convertToDailyData(data);

      for (const [timestamp, price] of dailyData.prices) {
        const date = new Date(timestamp).toISOString().split('T')[0];
        
        // Find corresponding market cap and volume data
        const marketCap = dailyData.market_caps.find(([ts]) => ts === timestamp)?.[1] || 0;
        const volume = dailyData.total_volumes.find(([ts]) => ts === timestamp)?.[1] || 0;

        // For crypto, we'll use the price as open, high, low, close since CoinGecko doesn't provide OHLC
        // In a real implementation, you might want to use a different API that provides OHLC data
        historicalData.push({
          date,
          open: price,
          high: price,
          low: price,
          close: price,
          volume: Math.floor(volume),
          adjustedClose: price
        });
      }

      // Fill gaps in data (though crypto trades 24/7, there might be API gaps)
      const filledData = DataGapFiller.fillDataGaps(historicalData, startDate, endDate);

      this.setCachedData(cacheKey, filledData);
      return filledData;

    } catch (error) {
      console.error(`Error fetching CoinGecko historical data for ${symbol}:`, error);
      throw error;
    }
  }

  async getBatchHistoricalData(
    symbols: string[],
    startDate: string,
    endDate: string
  ): Promise<Map<string, HistoricalPriceData[]>> {
    const results = new Map<string, HistoricalPriceData[]>();
    
    // Process symbols sequentially to avoid rate limiting
    for (const symbol of symbols) {
      try {
        const data = await this.getHistoricalData(symbol, startDate, endDate);
        results.set(symbol, data);
        
        // Add delay between requests to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.error(`Failed to fetch CoinGecko data for ${symbol}:`, error);
        results.set(symbol, []); // Set empty array for failed requests
      }
    }

    return results;
  }

  private getCoinId(symbol: string): string {
    const upperSymbol = symbol.toUpperCase();
    return CRYPTO_ID_MAP[upperSymbol] || symbol.toLowerCase();
  }

  private convertToDailyData(data: CoinGeckoHistoricalResponse): {
    prices: Array<[number, number]>;
    market_caps: Array<[number, number]>;
    total_volumes: Array<[number, number]>;
  } {
    // Group hourly data by day and take the last price of each day
    const dailyMap = new Map<string, {
      price: number;
      marketCap: number;
      volume: number;
      timestamp: number;
    }>();

    // Process prices
    for (const [timestamp, price] of data.prices) {
      const date = new Date(timestamp).toISOString().split('T')[0];
      const existing = dailyMap.get(date);
      
      if (!existing || timestamp > existing.timestamp) {
        dailyMap.set(date, {
          price,
          marketCap: 0,
          volume: 0,
          timestamp
        });
      }
    }

    // Process market caps
    for (const [timestamp, marketCap] of data.market_caps) {
      const date = new Date(timestamp).toISOString().split('T')[0];
      const existing = dailyMap.get(date);
      
      if (existing && timestamp === existing.timestamp) {
        existing.marketCap = marketCap;
      }
    }

    // Process volumes
    for (const [timestamp, volume] of data.total_volumes) {
      const date = new Date(timestamp).toISOString().split('T')[0];
      const existing = dailyMap.get(date);
      
      if (existing && timestamp === existing.timestamp) {
        existing.volume = volume;
      }
    }

    // Convert back to arrays
    const dailyEntries = Array.from(dailyMap.values()).sort((a, b) => a.timestamp - b.timestamp);
    
    return {
      prices: dailyEntries.map(entry => [entry.timestamp, entry.price]),
      market_caps: dailyEntries.map(entry => [entry.timestamp, entry.marketCap]),
      total_volumes: dailyEntries.map(entry => [entry.timestamp, entry.volume])
    };
  }

  private getCachedData(key: string): HistoricalPriceData[] | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  private setCachedData(key: string, data: HistoricalPriceData[]): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Make a rate-limited request with exponential backoff retry logic
   */
  private async makeRateLimitedRequest(
    url: string,
    cacheKey: string,
    retryCount = 0
  ): Promise<CoinGeckoHistoricalResponse> {

    // Enforce minimum delay between requests (CoinGecko free tier: ~10-50 calls/minute)
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    const minDelay = 200; // 200ms minimum delay

    if (timeSinceLastRequest < minDelay) {
      await new Promise(resolve => setTimeout(resolve, minDelay - timeSinceLastRequest));
    }

    this.lastRequestTime = Date.now();

    try {
      console.log(`[CoinGecko Service] Making request: ${url}`);
      const response = await fetch(url);

      // Handle rate limiting
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        const delay = this.calculateBackoffDelay(retryCount, retryAfter);

        console.warn(`[CoinGecko Service] Rate limited. Retrying in ${delay}ms (attempt ${retryCount + 1})`);

        if (retryCount < 3) { // Max 3 retries
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.makeRateLimitedRequest(url, cacheKey, retryCount + 1);
        } else {
          throw new Error(`CoinGecko rate limit exceeded after ${retryCount + 1} attempts`);
        }
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      this.retryAttempts.delete(cacheKey); // Reset retry count on success
      return data;

    } catch (error) {
      console.error(`[CoinGecko Service] Request failed:`, error);
      throw error;
    }
  }

  /**
   * Calculate exponential backoff delay
   */
  private calculateBackoffDelay(retryCount: number, retryAfterHeader?: string | null): number {
    // If server provides Retry-After header, use it
    if (retryAfterHeader) {
      const retryAfter = parseInt(retryAfterHeader, 10);
      if (!isNaN(retryAfter)) {
        return Math.min(retryAfter * 1000, 30000); // Max 30 seconds
      }
    }

    // Exponential backoff: 1s, 2s, 4s, 8s...
    const baseDelay = 1000; // 1 second
    const maxDelay = 30000; // 30 seconds
    const delay = Math.min(baseDelay * Math.pow(2, retryCount), maxDelay);

    // Add jitter to avoid thundering herd
    const jitter = Math.random() * 1000;
    return delay + jitter;
  }

  clearCache(): void {
    this.cache.clear();
    this.retryAttempts.clear();
  }
}