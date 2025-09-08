import { HistoricalPriceData, PerformanceDataPoint } from '../types/performance';

export interface NormalizedComparison {
  normalizedPortfolio: PerformanceDataPoint[];
  normalizedBenchmark: PerformanceDataPoint[];
  startingValue: number;
  benchmarkShares: number;
}

export class PortfolioNormalizationService {
  /**
   * Normalize portfolio and benchmark data to start at the same dollar amount
   * This allows for true relative performance comparison
   */
  static normalizeComparison(
    portfolioData: PerformanceDataPoint[],
    benchmarkData: HistoricalPriceData[]
  ): NormalizedComparison {
    if (portfolioData.length === 0 || benchmarkData.length === 0) {
      throw new Error('Cannot normalize comparison with empty data');
    }

    // Get the starting values
    const startingPortfolioValue = portfolioData[0].portfolioValue;
    const startingBenchmarkPrice = benchmarkData[0].close;
    
    // Calculate how many benchmark shares we would buy with the starting portfolio value
    const benchmarkShares = startingPortfolioValue / startingBenchmarkPrice;

    // Create a map of benchmark data for quick lookup
    const benchmarkMap = new Map<string, HistoricalPriceData>();
    benchmarkData.forEach(point => {
      benchmarkMap.set(point.date, point);
    });

    // Normalize portfolio data (already in correct format)
    const normalizedPortfolio = portfolioData.map(point => ({
      ...point,
      // Portfolio value is already correct, just ensure we have the right structure
    }));

    // Normalize benchmark data to match portfolio dates and values
    const normalizedBenchmark: PerformanceDataPoint[] = portfolioData.map((portfolioPoint, index) => {
      const benchmarkPoint = benchmarkMap.get(portfolioPoint.date);
      
      if (!benchmarkPoint) {
        throw new Error(`No benchmark data found for date ${portfolioPoint.date}`);
      }

      // Calculate the benchmark portfolio value
      const benchmarkValue = benchmarkShares * benchmarkPoint.close;
      
      // Calculate returns
      const benchmarkReturn = index === 0 ? 0 : 
        (benchmarkValue - normalizedBenchmark[index - 1].benchmarkValue) / normalizedBenchmark[index - 1].benchmarkValue;
      
      // Calculate cumulative returns
      const cumulativeBenchmarkReturn = index === 0 ? 0 : 
        (benchmarkValue - normalizedBenchmark[0].benchmarkValue) / normalizedBenchmark[0].benchmarkValue;

      return {
        date: portfolioPoint.date,
        portfolioValue: portfolioPoint.portfolioValue,
        benchmarkValue,
        portfolioReturn: portfolioPoint.portfolioReturn,
        benchmarkReturn,
        cumulativePortfolioReturn: portfolioPoint.cumulativePortfolioReturn,
        cumulativeBenchmarkReturn
      };
    });

    return {
      normalizedPortfolio,
      normalizedBenchmark,
      startingValue: startingPortfolioValue,
      benchmarkShares
    };
  }

  /**
   * Calculate portfolio value at a specific date using historical data
   */
  static calculatePortfolioValueAtDate(
    investments: any[],
    date: string,
    historicalData: Map<string, HistoricalPriceData[]>
  ): number {
    return investments.reduce((total, investment) => {
      const priceData = this.getPriceAtDate(
        investment.symbol,
        date,
        historicalData.get(investment.symbol) || []
      );

      if (priceData) {
        const currentValue = investment.quantity * priceData.close;
        return total + currentValue;
      }

      return total;
    }, 0);
  }

  /**
   * Get price data for a specific date
   */
  private static getPriceAtDate(
    symbol: string,
    date: string,
    historicalData: HistoricalPriceData[]
  ): HistoricalPriceData | null {
    const targetDate = new Date(date);
    
    // Find the closest date (within 7 days)
    let closestData = null;
    let minDiff = Infinity;

    for (const data of historicalData) {
      const dataDate = new Date(data.date);
      const diff = Math.abs(dataDate.getTime() - targetDate.getTime());
      
      if (diff < minDiff && diff <= 7 * 24 * 60 * 60 * 1000) { // 7 days in milliseconds
        minDiff = diff;
        closestData = data;
      }
    }

    return closestData;
  }

  /**
   * Generate normalized performance time series
   */
  static generateNormalizedTimeSeries(
    investments: any[],
    benchmarkData: HistoricalPriceData[],
    startDate: string,
    endDate: string,
    historicalData: Map<string, HistoricalPriceData[]>
  ): NormalizedComparison {
    // Calculate portfolio values for each date
    const portfolioTimeSeries: PerformanceDataPoint[] = [];
    
    // Get all unique dates from historical data
    const allDates = new Set<string>();
    historicalData.forEach(data => {
      data.forEach(point => allDates.add(point.date));
    });
    benchmarkData.forEach(point => allDates.add(point.date));

    const sortedDates = Array.from(allDates)
      .map(date => new Date(date))
      .filter(date => {
        const dateStr = date.toISOString().split('T')[0];
        return dateStr >= startDate && dateStr <= endDate;
      })
      .sort((a, b) => a.getTime() - b.getTime())
      .map(date => date.toISOString().split('T')[0]);

    let previousPortfolioValue = 0;

    for (let i = 0; i < sortedDates.length; i++) {
      const date = sortedDates[i];
      const portfolioValue = this.calculatePortfolioValueAtDate(investments, date, historicalData);
      
      // Calculate returns
      const portfolioReturn = previousPortfolioValue > 0 
        ? (portfolioValue - previousPortfolioValue) / previousPortfolioValue 
        : 0;
      
      // Calculate cumulative returns
      const cumulativePortfolioReturn = i === 0 ? 0 : 
        (portfolioValue - portfolioTimeSeries[0].portfolioValue) / portfolioTimeSeries[0].portfolioValue;

      portfolioTimeSeries.push({
        date,
        portfolioValue,
        benchmarkValue: 0, // Will be filled by normalization
        portfolioReturn,
        benchmarkReturn: 0, // Will be filled by normalization
        cumulativePortfolioReturn,
        cumulativeBenchmarkReturn: 0 // Will be filled by normalization
      });

      previousPortfolioValue = portfolioValue;
    }

    // Normalize the comparison
    return this.normalizeComparison(portfolioTimeSeries, benchmarkData);
  }

  /**
   * Calculate performance metrics for normalized comparison
   */
  static calculateNormalizedMetrics(normalizedComparison: NormalizedComparison): {
    portfolioReturn: number;
    benchmarkReturn: number;
    alpha: number;
    beta: number;
    sharpeRatio: number;
    maxDrawdown: number;
  } {
    const { normalizedPortfolio, normalizedBenchmark } = normalizedComparison;
    
    if (normalizedPortfolio.length < 2) {
      return {
        portfolioReturn: 0,
        benchmarkReturn: 0,
        alpha: 0,
        beta: 1,
        sharpeRatio: 0,
        maxDrawdown: 0
      };
    }

    // Calculate total returns
    const startingPortfolioValue = normalizedPortfolio[0].portfolioValue;
    const endingPortfolioValue = normalizedPortfolio[normalizedPortfolio.length - 1].portfolioValue;
    const portfolioReturn = (endingPortfolioValue - startingPortfolioValue) / startingPortfolioValue;

    const startingBenchmarkValue = normalizedBenchmark[0].benchmarkValue;
    const endingBenchmarkValue = normalizedBenchmark[normalizedBenchmark.length - 1].benchmarkValue;
    const benchmarkReturn = (endingBenchmarkValue - startingBenchmarkValue) / startingBenchmarkValue;

    // Calculate daily returns for risk metrics
    const portfolioReturns = normalizedPortfolio.slice(1).map((point, index) => 
      (point.portfolioValue - normalizedPortfolio[index].portfolioValue) / normalizedPortfolio[index].portfolioValue
    );
    
    const benchmarkReturns = normalizedBenchmark.slice(1).map((point, index) => 
      (point.benchmarkValue - normalizedBenchmark[index].benchmarkValue) / normalizedBenchmark[index].benchmarkValue
    );

    // Calculate beta (covariance / variance of benchmark)
    const avgPortfolioReturn = portfolioReturns.reduce((sum, ret) => sum + ret, 0) / portfolioReturns.length;
    const avgBenchmarkReturn = benchmarkReturns.reduce((sum, ret) => sum + ret, 0) / benchmarkReturns.length;
    
    const covariance = portfolioReturns.reduce((sum, ret, index) => 
      sum + (ret - avgPortfolioReturn) * (benchmarkReturns[index] - avgBenchmarkReturn), 0
    ) / portfolioReturns.length;
    
    const benchmarkVariance = benchmarkReturns.reduce((sum, ret) => 
      sum + Math.pow(ret - avgBenchmarkReturn, 2), 0
    ) / benchmarkReturns.length;
    
    const beta = benchmarkVariance > 0 ? covariance / benchmarkVariance : 1;

    // Calculate alpha (portfolio return - (risk-free rate + beta * (benchmark return - risk-free rate)))
    const riskFreeRate = 0.02; // Assume 2% risk-free rate
    const alpha = portfolioReturn - (riskFreeRate + beta * (benchmarkReturn - riskFreeRate));

    // Calculate Sharpe ratio (simplified)
    const portfolioVolatility = Math.sqrt(portfolioReturns.reduce((sum, ret) => 
      sum + Math.pow(ret - avgPortfolioReturn, 2), 0
    ) / portfolioReturns.length);
    
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
      beta,
      sharpeRatio,
      maxDrawdown
    };
  }
}
