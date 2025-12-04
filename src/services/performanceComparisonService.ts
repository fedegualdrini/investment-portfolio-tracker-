import { 
  PerformanceDataPoint, 
  HistoricalPriceData, 
  Benchmark, 
  BENCHMARKS 
} from '../types/performance.js';
import { PortfolioValueCalculator, PerformanceMetricsCalculator } from '../utils/performanceCalculations.js';
import { getDateRangeFromPreset, getLastTradingDay } from '../utils/dateUtils.js';
import { HistoricalDataService } from './historicalDataService.js';
import { PortfolioNormalizationService, NormalizedComparison } from './portfolioNormalizationService.js';
import { DataGapFiller } from './dataGapFiller.js';

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
  ): Promise<PerformanceDataPoint[]> {
    const cacheKey = `portfolio_${JSON.stringify(investments)}_${startDate}_${endDate}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      // Get historical data for all investments
      const symbols = investments.map(inv => inv.symbol);
      const historicalData = await this.historicalDataService.getBatchHistoricalData(
        symbols,
        startDate,
        endDate
      );

      // Calculate portfolio values over time
      const portfolioTimeSeries = PortfolioValueCalculator.generatePortfolioTimeSeries(
        investments,
        startDate,
        endDate,
        historicalData
      );

      this.setCachedData(cacheKey, portfolioTimeSeries);
      return portfolioTimeSeries;

    } catch (error) {
      console.error('Error getting portfolio historical data:', error);
      throw error;
    }
  }

  async getBenchmarkHistoricalData(
    benchmark: Benchmark,
    startDate: string,
    endDate: string
  ): Promise<HistoricalPriceData[]> {
    const cacheKey = `benchmark_${benchmark.symbol}_${startDate}_${endDate}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const data = await this.historicalDataService.getHistoricalData(
        benchmark.symbol,
        startDate,
        endDate
      );

      this.setCachedData(cacheKey, data);
      return data;

    } catch (error) {
      console.error(`Error getting benchmark data for ${benchmark.symbol}:`, error);
      throw error;
    }
  }

  async getInvestmentHistoricalData(
    symbol: string,
    startDate: string,
    endDate: string
  ): Promise<HistoricalPriceData[]> {
    const cacheKey = `investment_${symbol}_${startDate}_${endDate}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const data = await this.historicalDataService.getHistoricalData(
        symbol,
        startDate,
        endDate
      );

      this.setCachedData(cacheKey, data);
      return data;

    } catch (error) {
      console.error(`Error getting investment data for ${symbol}:`, error);
      throw error;
    }
  }

  async getNormalizedComparison(
    investments: any[],
    benchmark: Benchmark,
    startDate: string,
    endDate: string
  ): Promise<NormalizedComparison> {
    const cacheKey = `normalized_${JSON.stringify(investments)}_${benchmark.symbol}_${startDate}_${endDate}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      // Get portfolio and benchmark data
      const [portfolioData, benchmarkData] = await Promise.all([
        this.getPortfolioHistoricalData(investments, startDate, endDate),
        this.getBenchmarkHistoricalData(benchmark, startDate, endDate)
      ]);

      // Fill gaps in both datasets to ensure consistent date ranges
      const portfolioDataMap = new Map<string, HistoricalPriceData[]>();
      investments.forEach(inv => {
        const symbolData = portfolioData.map(point => ({
          date: point.date,
          open: 0, // We don't have individual asset OHLC in portfolio data
          high: 0,
          low: 0,
          close: 0, // This will be calculated from portfolio value
          volume: 0,
          adjustedClose: 0
        }));
        portfolioDataMap.set(inv.symbol, symbolData);
      });

      const { portfolioData: filledPortfolioData, benchmarkData: filledBenchmarkData } = 
        DataGapFiller.fillDataGapsForComparison(portfolioDataMap, benchmarkData, startDate, endDate);

      // Normalize the comparison
      const normalizedComparison = PortfolioNormalizationService.normalizeComparison(
        portfolioData,
        filledBenchmarkData
      );

      this.setCachedData(cacheKey, normalizedComparison);
      return normalizedComparison;

    } catch (error) {
      console.error('Error getting normalized comparison:', error);
      throw error;
    }
  }

  async getPerformanceMetrics(
    investments: any[],
    benchmark: Benchmark,
    startDate: string,
    endDate: string
  ): Promise<any> {
    try {
      const normalizedComparison = await this.getNormalizedComparison(
        investments,
        benchmark,
        startDate,
        endDate
      );

      return PortfolioNormalizationService.calculateNormalizedMetrics(normalizedComparison);

    } catch (error) {
      console.error('Error calculating performance metrics:', error);
      throw error;
    }
  }

  async getCombinedPortfolioAndBenchmarkData(
    investments: any[],
    benchmark: Benchmark,
    startDate: string,
    endDate: string
  ): Promise<{
    portfolioData: PerformanceDataPoint[];
    benchmarkData: PerformanceDataPoint[];
    normalizedComparison: NormalizedComparison;
  }> {
    try {
      const normalizedComparison = await this.getNormalizedComparison(
        investments,
        benchmark,
        startDate,
        endDate
      );

      return {
        portfolioData: normalizedComparison.normalizedPortfolio,
        benchmarkData: normalizedComparison.normalizedBenchmark,
        normalizedComparison
      };

    } catch (error) {
      console.error('Error getting combined data:', error);
      throw error;
    }
  }

  async getAvailableBenchmarks(): Promise<Benchmark[]> {
    return BENCHMARKS;
  }

  async getBenchmarkById(id: string): Promise<Benchmark | null> {
    return BENCHMARKS.find(b => b.id === id) || null;
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

  clearCache(): void {
    this.cache.clear();
  }
}

export function createPerformanceComparisonService(
  historicalDataService: HistoricalDataService,
  portfolioService: any = {}
): PerformanceComparisonService {
  return new PerformanceComparisonService(historicalDataService, portfolioService);
}