import { 
  PerformanceDataPoint, 
  HistoricalPriceData, 
  Benchmark, 
  BENCHMARKS 
} from '../types/performance';
import { createHistoricalDataService } from './historicalDataService';
import { PerformanceComparisonService } from './performanceComparisonService';

export interface NormalizedComparison {
  normalizedPortfolio: PerformanceDataPoint[];
  normalizedBenchmark: PerformanceDataPoint[];
  startingValue: number;
  benchmarkShares: number;
}

export interface NormalizedComparisonResult {
  normalizedComparison: NormalizedComparison;
  metrics: {
    portfolioReturn: number;
    benchmarkReturn: number;
    alpha: number;
    beta: number;
    sharpeRatio: number;
    maxDrawdown: number;
  };
  benchmark: Benchmark;
}

export class NormalizedComparisonService {
  private historicalDataService = createHistoricalDataService();
  private performanceService = new PerformanceComparisonService(this.historicalDataService);

  /**
   * Get normalized comparison between portfolio and benchmark
   * This ensures both start at the same dollar amount for fair comparison
   */
  async getNormalizedComparison(
    investments: any[],
    benchmarkId: string,
    startDate: string,
    endDate: string
  ): Promise<NormalizedComparisonResult> {
    console.log('🔥 NormalizedComparisonService called');
    console.log('Investments:', investments);
    console.log('Benchmark ID:', benchmarkId);
    console.log('Date range:', startDate, 'to', endDate);

    // Find the benchmark
    const benchmark = BENCHMARKS.find(b => b.id === benchmarkId);
    if (!benchmark) {
      throw new Error(`Benchmark with id ${benchmarkId} not found`);
    }

    console.log('✅ Benchmark found:', benchmark.name);

    try {
      // Get portfolio historical data
      console.log('📊 Fetching portfolio data...');
      const portfolioData = await this.performanceService.getPortfolioHistoricalData(
        investments,
        startDate,
        endDate
      );

      console.log('✅ Portfolio data received:', portfolioData.length, 'data points');

      // Get benchmark historical data
      console.log('📈 Fetching benchmark data...');
      const benchmarkData = await this.performanceService.getBenchmarkHistoricalData(
        benchmark,
        startDate,
        endDate
      );

      console.log('✅ Benchmark data received:', benchmarkData.length, 'data points');

      if (portfolioData.length === 0 || benchmarkData.length === 0) {
        throw new Error('No data available for the selected period');
      }

      // Normalize the data
      const normalizedComparison = this.normalizeData(portfolioData, benchmarkData);
      
      // Calculate performance metrics
      const metrics = this.calculateMetrics(normalizedComparison);

      console.log('✅ Normalization complete');
      console.log('Portfolio return:', (metrics.portfolioReturn * 100).toFixed(2) + '%');
      console.log('Benchmark return:', (metrics.benchmarkReturn * 100).toFixed(2) + '%');
      console.log('Alpha:', (metrics.alpha * 100).toFixed(2) + '%');

      return {
        normalizedComparison,
        metrics,
        benchmark
      };

    } catch (error) {
      console.error('❌ Error in NormalizedComparisonService:', error);
      throw error;
    }
  }

  /**
   * Normalize portfolio and benchmark data to start at the same dollar amount
   */
  private normalizeData(
    portfolioData: PerformanceDataPoint[],
    benchmarkData: HistoricalPriceData[]
  ): NormalizedComparison {
    console.log('📊 Starting normalization process...');

    // Get starting values
    const startingPortfolioValue = portfolioData[0].portfolioValue;
    const startingBenchmarkPrice = benchmarkData[0].close;
    const benchmarkShares = startingPortfolioValue / startingBenchmarkPrice;

    console.log(`Starting portfolio value: ${startingPortfolioValue}`);
    console.log(`Starting benchmark price: ${startingBenchmarkPrice}`);
    console.log(`Benchmark shares: ${benchmarkShares}`);

    // Create a map of benchmark data for quick lookup
    const benchmarkMap = new Map<string, HistoricalPriceData>();
    benchmarkData.forEach(point => {
      benchmarkMap.set(point.date, point);
    });

    // Create normalized benchmark data that matches portfolio dates
    const normalizedBenchmark: PerformanceDataPoint[] = [];
    let previousBenchmarkValue = startingPortfolioValue;

    for (let i = 0; i < portfolioData.length; i++) {
      const portfolioPoint = portfolioData[i];
      const date = portfolioPoint.date;
      
      // Find benchmark data for this date
      let benchmarkPoint = benchmarkMap.get(date);
      
      // If no exact match, find the closest available date (within 7 days)
      if (!benchmarkPoint) {
        const availableDates = Array.from(benchmarkMap.keys()).sort();
        const targetDate = new Date(date);
        
        let closestDate = null;
        let minDiff = Infinity;
        
        for (const availableDate of availableDates) {
          const diff = Math.abs(new Date(availableDate).getTime() - targetDate.getTime());
          if (diff < minDiff && diff <= 7 * 24 * 60 * 60 * 1000) { // 7 days
            minDiff = diff;
            closestDate = availableDate;
          }
        }
        
        if (closestDate) {
          benchmarkPoint = benchmarkMap.get(closestDate);
        }
      }

      if (!benchmarkPoint) {
        console.warn(`No benchmark data found for date ${date}, using previous value`);
        // Use previous benchmark value if no data available
        const benchmarkValue = previousBenchmarkValue;
        const benchmarkReturn = 0;
        
        normalizedBenchmark.push({
          date,
          portfolioValue: portfolioPoint.portfolioValue,
          benchmarkValue,
          portfolioReturn: portfolioPoint.portfolioReturn,
          benchmarkReturn,
          cumulativePortfolioReturn: portfolioPoint.cumulativePortfolioReturn,
          cumulativeBenchmarkReturn: i === 0 ? 0 : 
            (benchmarkValue - normalizedBenchmark[0].benchmarkValue) / normalizedBenchmark[0].benchmarkValue
        });
        
        continue;
      }

      // Calculate normalized benchmark value
      const benchmarkValue = benchmarkShares * benchmarkPoint.close;
      const benchmarkReturn = i === 0 ? 0 : 
        (benchmarkValue - previousBenchmarkValue) / previousBenchmarkValue;

      normalizedBenchmark.push({
        date,
        portfolioValue: portfolioPoint.portfolioValue,
        benchmarkValue,
        portfolioReturn: portfolioPoint.portfolioReturn,
        benchmarkReturn,
        cumulativePortfolioReturn: portfolioPoint.cumulativePortfolioReturn,
        cumulativeBenchmarkReturn: i === 0 ? 0 : 
          (benchmarkValue - normalizedBenchmark[0].benchmarkValue) / normalizedBenchmark[0].benchmarkValue
      });

      previousBenchmarkValue = benchmarkValue;
    }

    return {
      normalizedPortfolio: portfolioData,
      normalizedBenchmark,
      startingValue: startingPortfolioValue,
      benchmarkShares
    };
  }

  /**
   * Calculate performance metrics for the normalized comparison
   */
  private calculateMetrics(normalizedComparison: NormalizedComparison) {
    const { normalizedPortfolio, normalizedBenchmark } = normalizedComparison;
    
    const startingPortfolioValue = normalizedPortfolio[0].portfolioValue;
    const endingPortfolioValue = normalizedPortfolio[normalizedPortfolio.length - 1].portfolioValue;
    const endingBenchmarkValue = normalizedBenchmark[normalizedBenchmark.length - 1].benchmarkValue;
    
    const portfolioReturn = (endingPortfolioValue - startingPortfolioValue) / startingPortfolioValue;
    const benchmarkReturn = (endingBenchmarkValue - startingPortfolioValue) / startingPortfolioValue;
    const alpha = portfolioReturn - benchmarkReturn;

    // Calculate additional metrics
    const portfolioReturns = normalizedPortfolio.slice(1).map((point, index) => 
      (point.portfolioValue - normalizedPortfolio[index].portfolioValue) / normalizedPortfolio[index].portfolioValue
    );
    
    const benchmarkReturns = normalizedBenchmark.slice(1).map((point, index) => 
      (point.benchmarkValue - normalizedBenchmark[index].benchmarkValue) / normalizedBenchmark[index].benchmarkValue
    );

    // Calculate volatility (annualized)
    const avgPortfolioReturn = portfolioReturns.reduce((sum, ret) => sum + ret, 0) / portfolioReturns.length;
    const portfolioVariance = portfolioReturns.reduce((sum, ret) => sum + Math.pow(ret - avgPortfolioReturn, 2), 0) / portfolioReturns.length;
    const portfolioVolatility = Math.sqrt(portfolioVariance) * Math.sqrt(252); // Annualized

    // Calculate Sharpe ratio (simplified)
    const riskFreeRate = 0.02; // 2% risk-free rate
    const sharpeRatio = portfolioVolatility > 0 ? (avgPortfolioReturn - riskFreeRate) / portfolioVolatility : 0;

    // Calculate maximum drawdown
    let maxDrawdown = 0;
    let peak = startingPortfolioValue;
    
    for (const point of normalizedPortfolio) {
      if (point.portfolioValue > peak) {
        peak = point.portfolioValue;
      }
      const drawdown = (peak - point.portfolioValue) / peak;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }

    return {
      portfolioReturn,
      benchmarkReturn,
      alpha,
      beta: 1, // Simplified for now
      sharpeRatio,
      maxDrawdown
    };
  }

  /**
   * Get available benchmarks
   */
  getAvailableBenchmarks(): Benchmark[] {
    return BENCHMARKS;
  }

  /**
   * Get benchmark by ID
   */
  getBenchmarkById(id: string): Benchmark | null {
    return BENCHMARKS.find(b => b.id === id) || null;
  }
}

// Create and export a singleton instance
export const normalizedComparisonService = new NormalizedComparisonService();
