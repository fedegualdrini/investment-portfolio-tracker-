/**
 * STRICT DATA SOURCE SEPARATION - NO EXCEPTIONS
 *
 * CRITICAL RULES (WRITTEN IN STONE):
 * ================================
 * 1. BONDS AND STOCKS: ONLY Yahoo Finance - NEVER CoinGecko
 * 2. CRYPTOS: ONLY CoinGecko - NEVER Yahoo Finance
 * 3. NO FALLBACKS between data sources
 * 4. NO MIXING of data sources under any circumstances
 * 5. If a source fails, the request fails - no automatic fallback
 *
 * This separation is critical for data accuracy and consistency.
 */

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
    // STRICT RULE: NO FALLBACKS, NO MIXING OF DATA SOURCES
    // - Bonds and stocks: ONLY Yahoo Finance
    // - Cryptos: ONLY CoinGecko
    // - No fallback to other sources under any circumstances

    const source = dataSource || this.detectDataSource(symbol);

    // ENFORCE STRICT SEPARATION - NO FALLBACKS ALLOWED
    if (source === 'coingecko') {
      // CRYPTO SYMBOLS: ONLY COINGECKO, NO YAHOO FALLBACK
      console.log(`[STRICT RULE] ${symbol} -> CoinGecko (CRYPTO ONLY)`);
      return await this.coinGeckoService.getHistoricalData(symbol, startDate, endDate);
    } else {
      // BONDS/STOCKS SYMBOLS: ONLY YAHOO FINANCE, NO COINGECKO FALLBACK
      console.log(`[STRICT RULE] ${symbol} -> Yahoo Finance (BONDS/STOCKS ONLY)`);
      return await this.yahooService.getHistoricalData(symbol, startDate, endDate);
    }
  }

  async getBatchHistoricalData(
    symbols: string[],
    startDate: string,
    endDate: string
  ): Promise<Map<string, HistoricalPriceData[]>> {
    const results = new Map<string, HistoricalPriceData[]>();

    // STRICT SEPARATION: Group symbols by data source with NO MIXING
    const yahooSymbols: string[] = []; // Stocks, bonds, indices ONLY
    const coinGeckoSymbols: string[] = []; // Cryptos ONLY

    symbols.forEach(symbol => {
      const source = this.detectDataSource(symbol);
      if (source === 'coingecko') {
        coinGeckoSymbols.push(symbol);
      } else {
        yahooSymbols.push(symbol);
      }
    });

    console.log(`[STRICT RULE] Batch processing:`);
    console.log(`[STRICT RULE]   Yahoo Finance: ${yahooSymbols.length} symbols (stocks/bonds only)`);
    console.log(`[STRICT RULE]   CoinGecko: ${coinGeckoSymbols.length} symbols (crypto only)`);

    // Fetch data from sources in parallel - NO CROSSOVER
    const [yahooResults, coinGeckoResults] = await Promise.all([
      yahooSymbols.length > 0
        ? this.yahooService.getBatchHistoricalData(yahooSymbols, startDate, endDate)
        : Promise.resolve(new Map<string, HistoricalPriceData[]>()),
      coinGeckoSymbols.length > 0
        ? this.coinGeckoService.getBatchHistoricalData(coinGeckoSymbols, startDate, endDate)
        : Promise.resolve(new Map<string, HistoricalPriceData[]>())
    ]);

    // STRICT COMBINATION: Only combine results from their designated sources
    yahooResults.forEach((data, symbol) => {
      if (yahooSymbols.includes(symbol)) {
        results.set(symbol, data);
      }
    });

    coinGeckoResults.forEach((data, symbol) => {
      if (coinGeckoSymbols.includes(symbol)) {
        results.set(symbol, data);
      }
    });

    return results;
  }

  private detectDataSource(symbol: string): 'yahoo' | 'coingecko' {
    const upperSymbol = symbol.toUpperCase();

    // STRICT CRYPTO SYMBOLS - ONLY COINGECKO
    const CRYPTO_SYMBOLS = [
      'BTC', 'ETH', 'ADA', 'DOT', 'LINK', 'SOL', 'MATIC', 'AVAX', 'ATOM', 'LUNA',
      'USDT', 'USDC', 'BNB', 'XRP', 'DOGE', 'LTC', 'BCH', 'EOS', 'TRX', 'XLM',
      'bitcoin', 'ethereum', 'cardano', 'polkadot', 'chainlink', 'solana'
    ];

    // CRYPTO DETECTION: If it's in the crypto list, ONLY use CoinGecko
    if (CRYPTO_SYMBOLS.includes(upperSymbol) || CRYPTO_SYMBOLS.includes(symbol.toLowerCase())) {
      console.log(`[STRICT RULE] ${symbol} identified as CRYPTO -> CoinGecko ONLY`);
      return 'coingecko';
    }

    // EVERYTHING ELSE (stocks, bonds, indices): ONLY Yahoo Finance
    console.log(`[STRICT RULE] ${symbol} identified as STOCK/BOND -> Yahoo Finance ONLY`);
    return 'yahoo';
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
