import { 
  PerformanceDataPoint, 
  HistoricalPriceData, 
  Benchmark, 
  BENCHMARKS 
} from '../types/performance';
import { PortfolioValueCalculator, PerformanceMetricsCalculator } from '../utils/performanceCalculations';
import { getDateRangeFromPreset, getLastTradingDay } from '../utils/dateUtils';
import { HistoricalDataService } from './historicalDataService';

export class PerformanceComparisonService {
  private cache: Map<string, any> = new Map();
  private cacheExpiry = 1000 * 60 * 60; // 1 hour

  constructor(
    private historicalDataService: HistoricalDataService,
    private portfolioService: any = {}
  ) {}

  async getPortfolioHistoricalData(
    investments: any[],
    startDate: string,
    endDate: string
  ): Promise<Map<string, HistoricalPriceData[]>> {
    const cacheKey = `portfolio_${startDate}_${endDate}_${investments.length}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const symbols = investments.map(inv => inv.symbol);
      const historicalData = await this.historicalDataService.getBatchHistoricalData(
        symbols,
        startDate,
        endDate
      );

      this.setCachedData(cacheKey, historicalData);
      return historicalData;
    } catch (error) {
      console.error('Error fetching portfolio historical data:', error);
      return new Map<string, HistoricalPriceData[]>();
    }
  }

  async getBenchmarkHistoricalData(
    benchmark: Benchmark,
    startDate: string,
    endDate: string
  ): Promise<HistoricalPriceData[]> {
    const cacheKey = `benchmark_${benchmark.id}_${startDate}_${endDate}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const data = await this.historicalDataService.getHistoricalData(
        benchmark.symbol,
        startDate,
        endDate,
        benchmark.dataSource
      );

      this.setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      console.error(`Error fetching benchmark data for ${benchmark.name}:`, error);
      return [];
    }
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

    try {
      const dataSource = investment.type === 'crypto' ? 'coingecko' : 'yahoo';
      const data = await this.historicalDataService.getHistoricalData(
        investment.symbol,
        startDate,
        endDate,
        dataSource
      );

      this.setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      console.error(`Error fetching data for ${investment.symbol}:`, error);
      return [];
    }
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
  historicalDataService: HistoricalDataService,
  portfolioService: any = {}
): PerformanceComparisonService {
  return new PerformanceComparisonService(historicalDataService, portfolioService);
}
