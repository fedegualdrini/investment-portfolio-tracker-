import { 
  PerformanceDataPoint, 
  HistoricalPriceData, 
  Benchmark, 
  BENCHMARKS 
} from '../types/performance';
import { PortfolioValueCalculator, PerformanceMetricsCalculator } from '../utils/performanceCalculations';
import { getDateRangeFromPreset, getLastTradingDay } from '../utils/dateUtils';

export class PerformanceComparisonService {
  private cache: Map<string, any> = new Map();
  private cacheExpiry = 1000 * 60 * 60; // 1 hour

  constructor(
    private yahooService: any,
    private coinGeckoService: any,
    private portfolioService: any
  ) {}

  async getPortfolioHistoricalData(
    investments: any[],
    startDate: string,
    endDate: string
  ): Promise<Map<string, HistoricalPriceData[]>> {
    const cacheKey = `portfolio_${startDate}_${endDate}_${investments.length}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    const historicalData = new Map<string, HistoricalPriceData[]>();

    // Group investments by data source
    const yahooSymbols: string[] = [];
    const coinGeckoSymbols: string[] = [];

    investments.forEach(investment => {
      if (investment.type === 'crypto') {
        coinGeckoSymbols.push(investment.symbol);
      } else {
        yahooSymbols.push(investment.symbol);
      }
    });

    // Fetch Yahoo Finance data
    if (yahooSymbols.length > 0) {
      try {
        const yahooData = await this.yahooService.getBatchHistoricalData(
          yahooSymbols,
          startDate,
          endDate
        );
        yahooData.forEach((data: HistoricalPriceData[], symbol: string) => {
          historicalData.set(symbol, data);
        });
      } catch (error) {
        console.error('Error fetching Yahoo Finance data:', error);
      }
    }

    // Fetch CoinGecko data
    if (coinGeckoSymbols.length > 0) {
      try {
        const coinGeckoData = await this.coinGeckoService.getBatchHistoricalData(
          coinGeckoSymbols,
          startDate,
          endDate
        );
        coinGeckoData.forEach((data: HistoricalPriceData[], symbol: string) => {
          historicalData.set(symbol, data);
        });
      } catch (error) {
        console.error('Error fetching CoinGecko data:', error);
      }
    }

    this.setCachedData(cacheKey, historicalData);
    return historicalData;
  }

  async getBenchmarkHistoricalData(
    benchmark: Benchmark,
    startDate: string,
    endDate: string
  ): Promise<HistoricalPriceData[]> {
    const cacheKey = `benchmark_${benchmark.id}_${startDate}_${endDate}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    let data: HistoricalPriceData[] = [];

    try {
      if (benchmark.dataSource === 'yahoo') {
        data = await this.yahooService.getHistoricalData(
          benchmark.symbol,
          startDate,
          endDate
        );
      } else if (benchmark.dataSource === 'coingecko') {
        data = await this.coinGeckoService.getHistoricalData(
          benchmark.symbol,
          startDate,
          endDate
        );
      }
    } catch (error) {
      console.error(`Error fetching benchmark data for ${benchmark.name}:`, error);
      // Return empty array on error
      data = [];
    }

    this.setCachedData(cacheKey, data);
    return data;
  }

  async getPerformanceComparison(
    investments: any[],
    benchmark: Benchmark,
    startDate: string,
    endDate: string
  ): Promise<PerformanceDataPoint[]> {
    const cacheKey = `comparison_${benchmark.id}_${startDate}_${endDate}_${investments.length}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      // Fetch portfolio historical data
      const portfolioHistoricalData = await this.getPortfolioHistoricalData(
        investments,
        startDate,
        endDate
      );

      // Fetch benchmark historical data
      const benchmarkHistoricalData = await this.getBenchmarkHistoricalData(
        benchmark,
        startDate,
        endDate
      );

      // Generate portfolio time series
      const portfolioTimeSeries = PortfolioValueCalculator.generatePortfolioTimeSeries(
        investments,
        startDate,
        endDate,
        portfolioHistoricalData
      );

      // Combine with benchmark data
      const comparisonData = this.combinePortfolioAndBenchmarkData(
        portfolioTimeSeries,
        benchmarkHistoricalData
      );

      this.setCachedData(cacheKey, comparisonData);
      return comparisonData;
    } catch (error) {
      console.error('Error generating performance comparison:', error);
      return [];
    }
  }

  private combinePortfolioAndBenchmarkData(
    portfolioData: PerformanceDataPoint[],
    benchmarkData: HistoricalPriceData[]
  ): PerformanceDataPoint[] {
    const benchmarkMap = new Map<string, HistoricalPriceData>();
    benchmarkData.forEach(point => {
      benchmarkMap.set(point.date, point);
    });

    return portfolioData.map(portfolioPoint => {
      const benchmarkPoint = benchmarkMap.get(portfolioPoint.date);
      
      if (benchmarkPoint) {
        const benchmarkValue = benchmarkPoint.close;
        const benchmarkReturn = portfolioPoint.benchmarkValue > 0 
          ? (benchmarkValue - portfolioPoint.benchmarkValue) / portfolioPoint.benchmarkValue 
          : 0;

        return {
          ...portfolioPoint,
          benchmarkValue,
          benchmarkReturn,
          cumulativeBenchmarkReturn: portfolioData[0] ? 
            (benchmarkValue - benchmarkMap.get(portfolioData[0].date)?.close || benchmarkValue) / (benchmarkMap.get(portfolioData[0].date)?.close || benchmarkValue) 
            : 0
        };
      }

      return portfolioPoint;
    });
  }

  async getInvestmentHistoricalData(
    investment: any,
    startDate: string,
    endDate: string
  ): Promise<HistoricalPriceData[]> {
    const cacheKey = `investment_${investment.symbol}_${startDate}_${endDate}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    let data: HistoricalPriceData[] = [];

    try {
      if (investment.type === 'crypto') {
        data = await this.coinGeckoService.getHistoricalData(
          investment.symbol,
          startDate,
          endDate
        );
      } else {
        data = await this.yahooService.getHistoricalData(
          investment.symbol,
          startDate,
          endDate
        );
      }
    } catch (error) {
      console.error(`Error fetching data for ${investment.symbol}:`, error);
    }

    this.setCachedData(cacheKey, data);
    return data;
  }

  calculatePortfolioValueAtDate(
    investments: any[],
    date: string,
    historicalData: Map<string, HistoricalPriceData[]>
  ): number {
    return PortfolioValueCalculator.calculatePortfolioValueAtDate(
      investments,
      date,
      historicalData
    );
  }

  generatePerformanceComparison(
    portfolioData: PerformanceDataPoint[],
    benchmarkData: PerformanceDataPoint[]
  ): PerformanceDataPoint[] {
    // This method combines portfolio and benchmark data
    // Implementation depends on specific requirements
    return portfolioData;
  }

  getAvailableBenchmarks(): Benchmark[] {
    return BENCHMARKS;
  }

  getBenchmarkById(id: string): Benchmark | undefined {
    return BENCHMARKS.find(benchmark => benchmark.id === id);
  }

  clearCache(): void {
    this.cache.clear();
  }

  private getCachedData(key: string): any {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }
    return null;
  }

  private setCachedData(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
}

// Factory function to create service instance
export function createPerformanceComparisonService(
  yahooService: any,
  coinGeckoService: any,
  portfolioService: any
): PerformanceComparisonService {
  return new PerformanceComparisonService(yahooService, coinGeckoService, portfolioService);
}
