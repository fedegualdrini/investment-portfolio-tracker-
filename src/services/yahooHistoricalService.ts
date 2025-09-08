import { HistoricalPriceData } from '../types/performance';
import { DataGapFiller } from './dataGapFiller';

export interface YahooHistoricalResponse {
  chart: {
    result: Array<{
      meta: {
        currency: string;
        symbol: string;
        exchangeName: string;
        instrumentType: string;
        firstTradeDate: number;
        regularMarketTime: number;
        gmtoffset: number;
        timezone: string;
        exchangeTimezoneName: string;
        regularMarketPrice: number;
        chartPreviousClose: number;
        previousClose: number;
        scale: number;
        priceHint: number;
        currentTradingPeriod: any;
        tradingPeriods: any[][];
        dataGranularity: string;
        range: string;
        validRanges: string[];
      };
      timestamp: number[];
      indicators: {
        quote: Array<{
          open: (number | null)[];
          high: (number | null)[];
          low: (number | null)[];
          close: (number | null)[];
          volume: (number | null)[];
        }>;
        adjclose: Array<{
          adjclose: (number | null)[];
        }>;
      };
    }>;
    error: any;
  };
}

export class YahooHistoricalService {
  private cache = new Map<string, { data: HistoricalPriceData[]; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  async getHistoricalData(
    symbol: string,
    startDate: string,
    endDate: string
  ): Promise<HistoricalPriceData[]> {
    const cacheKey = `yahoo_${symbol}_${startDate}_${endDate}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const startTimestamp = Math.floor(new Date(startDate).getTime() / 1000);
      const endTimestamp = Math.floor(new Date(endDate).getTime() / 1000);

      const response = await fetch(
        `/api/yahoo/v8/finance/chart/${symbol}?period1=${startTimestamp}&period2=${endTimestamp}&interval=1d&includePrePost=true&events=div%2Csplit`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch historical data for ${symbol}: ${response.status}`);
      }

      const data: YahooHistoricalResponse = await response.json();

      if (data.chart.error) {
        throw new Error(`Yahoo Finance error: ${JSON.stringify(data.chart.error)}`);
      }

      if (!data.chart.result || data.chart.result.length === 0) {
        throw new Error(`No data found for symbol ${symbol}`);
      }

      const result = data.chart.result[0];
      const timestamps = result.timestamp;
      const quotes = result.indicators.quote[0];
      const adjclose = result.indicators.adjclose?.[0];

      const historicalData: HistoricalPriceData[] = [];

      for (let i = 0; i < timestamps.length; i++) {
        const timestamp = timestamps[i];
        const date = new Date(timestamp * 1000).toISOString().split('T')[0];

        // Skip if any required data is missing
        if (quotes.open[i] === null || quotes.high[i] === null || 
            quotes.low[i] === null || quotes.close[i] === null) {
          continue;
        }

        historicalData.push({
          date,
          open: quotes.open[i]!,
          high: quotes.high[i]!,
          low: quotes.low[i]!,
          close: quotes.close[i]!,
          volume: quotes.volume[i] || 0,
          adjustedClose: adjclose?.adjclose[i] || quotes.close[i]!
        });
      }

      // Fill gaps in data (weekends, holidays)
      const filledData = DataGapFiller.fillDataGaps(historicalData, startDate, endDate);

      this.setCachedData(cacheKey, filledData);
      return filledData;

    } catch (error) {
      console.error(`Error fetching Yahoo historical data for ${symbol}:`, error);
      throw error;
    }
  }

  async getBatchHistoricalData(
    symbols: string[],
    startDate: string,
    endDate: string
  ): Promise<Map<string, HistoricalPriceData[]>> {
    const results = new Map<string, HistoricalPriceData[]>();
    
    // Process symbols in batches to avoid overwhelming the API
    const batchSize = 5;
    for (let i = 0; i < symbols.length; i += batchSize) {
      const batch = symbols.slice(i, i + batchSize);
      
      const promises = batch.map(async (symbol) => {
        try {
          const data = await this.getHistoricalData(symbol, startDate, endDate);
          results.set(symbol, data);
        } catch (error) {
          console.error(`Failed to fetch data for ${symbol}:`, error);
          results.set(symbol, []); // Set empty array for failed requests
        }
      });

      await Promise.all(promises);
      
      // Add small delay between batches to be respectful to the API
      if (i + batchSize < symbols.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return results;
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