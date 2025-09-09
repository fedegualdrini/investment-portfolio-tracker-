import { HistoricalPriceData } from '../types/performance';
import { YahooHistoricalService } from './yahooHistoricalService';
import { CoinGeckoHistoricalService } from './coinGeckoHistoricalService';

export interface HistoricalDataService {
  getHistoricalData(symbol: string, startDate: string, endDate: string): Promise<HistoricalPriceData[]>;
  getBatchHistoricalData(symbols: string[], startDate: string, endDate: string): Promise<Map<string, HistoricalPriceData[]>>;
}

export class UnifiedHistoricalDataService implements HistoricalDataService {
  private yahooService: YahooHistoricalService;
  private coinGeckoService: CoinGeckoHistoricalService;

  constructor() {
    this.yahooService = new YahooHistoricalService();
    this.coinGeckoService = new CoinGeckoHistoricalService();
  }

  async getHistoricalData(
    symbol: string,
    startDate: string,
    endDate: string,
    dataSource?: 'yahoo' | 'coingecko'
  ): Promise<HistoricalPriceData[]> {
    // Auto-detect data source based on symbol if not specified
    const source = dataSource || this.detectDataSource(symbol);

    try {
      if (source === 'coingecko') {
        return await this.coinGeckoService.getHistoricalData(symbol, startDate, endDate);
      } else {
        // For crypto symbols that might be misclassified, try CoinGecko first
        if (this.isLikelyCryptoSymbol(symbol)) {
          console.log(`[Historical Service] ${symbol} appears to be crypto, trying CoinGecko first`);
          try {
            return await this.coinGeckoService.getHistoricalData(symbol, startDate, endDate);
          } catch (cryptoError) {
            console.log(`[Historical Service] CoinGecko failed for ${symbol}, falling back to Yahoo`);
            return await this.yahooService.getHistoricalData(symbol, startDate, endDate);
          }
        } else {
          return await this.yahooService.getHistoricalData(symbol, startDate, endDate);
        }
      }
    } catch (error) {
      console.error(`Error fetching historical data for ${symbol} from ${source}:`, error);

      // Try fallback to other source if primary fails
      const fallbackSource = source === 'coingecko' ? 'yahoo' : 'coingecko';
      console.log(`Trying fallback to ${fallbackSource} for ${symbol}`);

      try {
        if (fallbackSource === 'coingecko') {
          return await this.coinGeckoService.getHistoricalData(symbol, startDate, endDate);
        } else {
          return await this.yahooService.getHistoricalData(symbol, startDate, endDate);
        }
      } catch (fallbackError) {
        console.error(`Fallback also failed for ${symbol}:`, fallbackError);
        throw new Error(`Failed to fetch historical data for ${symbol} from both sources`);
      }
    }
  }

  async getBatchHistoricalData(
    symbols: string[],
    startDate: string,
    endDate: string
  ): Promise<Map<string, HistoricalPriceData[]>> {
    const results = new Map<string, HistoricalPriceData[]>();
    
    // Group symbols by data source
    const yahooSymbols: string[] = [];
    const coinGeckoSymbols: string[] = [];

    symbols.forEach(symbol => {
      const source = this.detectDataSource(symbol);
      if (source === 'coingecko') {
        coinGeckoSymbols.push(symbol);
      } else {
        yahooSymbols.push(symbol);
      }
    });

    // Fetch data from both sources in parallel
    const [yahooResults, coinGeckoResults] = await Promise.all([
      yahooSymbols.length > 0 
        ? this.yahooService.getBatchHistoricalData(yahooSymbols, startDate, endDate)
        : Promise.resolve(new Map<string, HistoricalPriceData[]>()),
      coinGeckoSymbols.length > 0 
        ? this.coinGeckoService.getBatchHistoricalData(coinGeckoSymbols, startDate, endDate)
        : Promise.resolve(new Map<string, HistoricalPriceData[]>())
    ]);

    // Combine results
    yahooResults.forEach((data, symbol) => results.set(symbol, data));
    coinGeckoResults.forEach((data, symbol) => results.set(symbol, data));

    return results;
  }

  private detectDataSource(symbol: string): 'yahoo' | 'coingecko' {
    const upperSymbol = symbol.toUpperCase();

    // Common crypto symbols that should use CoinGecko
    const cryptoSymbols = [
      'BTC', 'ETH', 'ADA', 'DOT', 'LINK', 'SOL', 'MATIC', 'AVAX', 'ATOM', 'LUNA',
      'USDT', 'USDC', 'BNB', 'XRP', 'DOGE', 'LTC', 'BCH', 'EOS', 'TRX', 'XLM',
      'bitcoin', 'ethereum', 'cardano', 'polkadot', 'chainlink', 'solana'
    ];

    // Check if it's a crypto symbol
    if (cryptoSymbols.includes(upperSymbol) || cryptoSymbols.includes(symbol.toLowerCase())) {
      return 'coingecko';
    }

    // Check if it's a stock index (starts with ^)
    if (symbol.startsWith('^')) {
      return 'yahoo';
    }

    // Default to Yahoo for stocks and other instruments
    return 'yahoo';
  }

  private isLikelyCryptoSymbol(symbol: string): boolean {
    const upperSymbol = symbol.toUpperCase();
    const lowerSymbol = symbol.toLowerCase();

    // Extended list of crypto indicators
    const cryptoIndicators = [
      // Common crypto symbols
      'BTC', 'ETH', 'ADA', 'DOT', 'LINK', 'SOL', 'MATIC', 'AVAX', 'ATOM', 'LUNA',
      'USDT', 'USDC', 'BNB', 'XRP', 'DOGE', 'LTC', 'BCH', 'EOS', 'TRX', 'XLM',
      'bitcoin', 'ethereum', 'cardano', 'polkadot', 'chainlink', 'solana',
      // Additional crypto indicators
      'crypto', 'coin', 'token', 'blockchain', 'defi', 'nft'
    ];

    // Check for exact matches
    if (cryptoIndicators.includes(upperSymbol) || cryptoIndicators.includes(lowerSymbol)) {
      return true;
    }

    // Check for partial matches in symbol names (e.g., "BTC-USD", "ETH/USD")
    if (upperSymbol.includes('BTC') || upperSymbol.includes('ETH') ||
        lowerSymbol.includes('bitcoin') || lowerSymbol.includes('ethereum')) {
      return true;
    }

    // Check length - crypto symbols are typically short (2-5 characters)
    if (upperSymbol.length >= 2 && upperSymbol.length <= 6 &&
        !upperSymbol.includes('.') && !upperSymbol.includes('/')) {
      // Additional heuristic: if it looks like a ticker and isn't obviously a stock
      return true;
    }

    return false;
  }

  clearCache(): void {
    this.yahooService.clearCache();
    this.coinGeckoService.clearCache();
  }
}

// Factory function to create service instances
export function createHistoricalDataService(): HistoricalDataService {
  return new UnifiedHistoricalDataService();
}

// Export individual services for direct use if needed
export { YahooHistoricalService, CoinGeckoHistoricalService };
