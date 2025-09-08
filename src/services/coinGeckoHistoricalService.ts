import { HistoricalPriceData } from '../types/performance';

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

  async getHistoricalData(
    symbol: string,
    startDate: string,
    endDate: string
  ): Promise<HistoricalPriceData[]> {
    const cacheKey = `coingecko_${symbol}_${startDate}_${endDate}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const coinId = this.getCoinId(symbol);
      const startTimestamp = Math.floor(new Date(startDate).getTime() / 1000);
      const endTimestamp = Math.floor(new Date(endDate).getTime() / 1000);

      const response = await fetch(
        `${COINGECKO_API}/coins/${coinId}/market_chart/range?vs_currency=usd&from=${startTimestamp}&to=${endTimestamp}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch CoinGecko data for ${symbol}: ${response.status}`);
      }

      const data: CoinGeckoHistoricalResponse = await response.json();

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

      this.setCachedData(cacheKey, historicalData);
      return historicalData;

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

  clearCache(): void {
    this.cache.clear();
  }
}
