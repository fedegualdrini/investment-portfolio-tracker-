import { PerformanceDataPoint, PerformanceMetrics, HistoricalPriceData } from '../types/performance.js';

export class PerformanceMetricsCalculator {
  static calculateTotalReturn(values: number[]): number {
    if (values.length < 2) return 0;
    return (values[values.length - 1] - values[0]) / values[0];
  }

  static calculateAnnualizedReturn(values: number[], years: number): number {
    if (values.length < 2 || years <= 0) return 0;
    const totalReturn = this.calculateTotalReturn(values);
    return Math.pow(1 + totalReturn, 1 / years) - 1;
  }

  static calculateVolatility(returns: number[]): number {
    if (returns.length < 2) return 0;
    const mean = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length;
    return Math.sqrt(variance) * Math.sqrt(252); // Annualized
  }

  static calculateSharpeRatio(returns: number[], riskFreeRate: number = 0.02): number {
    if (returns.length < 2) return 0;
    const excessReturns = returns.map(ret => ret - riskFreeRate / 252);
    const meanExcessReturn = excessReturns.reduce((sum, ret) => sum + ret, 0) / excessReturns.length;
    const volatility = this.calculateVolatility(returns);
    return volatility === 0 ? 0 : meanExcessReturn / volatility;
  }

  static calculateMaxDrawdown(values: number[]): number {
    if (values.length < 2) return 0;
    let maxDrawdown = 0;
    let peak = values[0];

    for (let i = 1; i < values.length; i++) {
      if (values[i] > peak) {
        peak = values[i];
      } else {
        const drawdown = (peak - values[i]) / peak;
        maxDrawdown = Math.max(maxDrawdown, drawdown);
      }
    }

    return maxDrawdown;
  }

  static calculateBeta(portfolioReturns: number[], benchmarkReturns: number[]): number {
    if (portfolioReturns.length !== benchmarkReturns.length || portfolioReturns.length < 2) return 1;

    const portfolioMean = portfolioReturns.reduce((sum, ret) => sum + ret, 0) / portfolioReturns.length;
    const benchmarkMean = benchmarkReturns.reduce((sum, ret) => sum + ret, 0) / benchmarkReturns.length;

    let covariance = 0;
    let benchmarkVariance = 0;

    for (let i = 0; i < portfolioReturns.length; i++) {
      const portfolioDiff = portfolioReturns[i] - portfolioMean;
      const benchmarkDiff = benchmarkReturns[i] - benchmarkMean;
      covariance += portfolioDiff * benchmarkDiff;
      benchmarkVariance += benchmarkDiff * benchmarkDiff;
    }

    return benchmarkVariance === 0 ? 1 : covariance / benchmarkVariance;
  }

  static calculateAlpha(portfolioReturns: number[], benchmarkReturns: number[], beta: number, riskFreeRate: number = 0.02): number {
    if (portfolioReturns.length !== benchmarkReturns.length || portfolioReturns.length < 2) return 0;

    const portfolioMean = portfolioReturns.reduce((sum, ret) => sum + ret, 0) / portfolioReturns.length;
    const benchmarkMean = benchmarkReturns.reduce((sum, ret) => sum + ret, 0) / benchmarkReturns.length;

    // Annualize returns
    const annualizedPortfolioReturn = portfolioMean * 252;
    const annualizedBenchmarkReturn = benchmarkMean * 252;

    // CAPM: Alpha = Portfolio Return - (Risk Free Rate + Beta * (Market Return - Risk Free Rate))
    return annualizedPortfolioReturn - (riskFreeRate + beta * (annualizedBenchmarkReturn - riskFreeRate));
  }

  static calculateInformationRatio(portfolioReturns: number[], benchmarkReturns: number[]): number {
    if (portfolioReturns.length !== benchmarkReturns.length || portfolioReturns.length < 2) return 0;

    const activeReturns = portfolioReturns.map((portfolio, i) => portfolio - benchmarkReturns[i]);
    const meanActiveReturn = activeReturns.reduce((sum, ret) => sum + ret, 0) / activeReturns.length;
    const trackingError = this.calculateVolatility(activeReturns);

    return trackingError === 0 ? 0 : meanActiveReturn / trackingError;
  }

  static calculateTrackingError(portfolioReturns: number[], benchmarkReturns: number[]): number {
    if (portfolioReturns.length !== benchmarkReturns.length || portfolioReturns.length < 2) return 0;

    const activeReturns = portfolioReturns.map((portfolio, i) => portfolio - benchmarkReturns[i]);
    return this.calculateVolatility(activeReturns);
  }

  static calculateAllMetrics(data: PerformanceDataPoint[]): PerformanceMetrics {
    if (data.length < 2) {
      return {
        totalReturn: 0,
        annualizedReturn: 0,
        volatility: 0,
        sharpeRatio: 0,
        maxDrawdown: 0,
        beta: 1,
        alpha: 0,
        informationRatio: 0,
        trackingError: 0
      };
    }

    const portfolioValues = data.map(d => d.portfolioValue);
    const benchmarkValues = data.map(d => d.benchmarkValue);
    const portfolioReturns = data.map(d => d.portfolioReturn);
    const benchmarkReturns = data.map(d => d.benchmarkReturn);

    const totalReturn = this.calculateTotalReturn(portfolioValues);
    const years = this.calculateYears(data[0].date, data[data.length - 1].date);
    const annualizedReturn = this.calculateAnnualizedReturn(portfolioValues, years);
    const volatility = this.calculateVolatility(portfolioReturns);
    const sharpeRatio = this.calculateSharpeRatio(portfolioReturns);
    const maxDrawdown = this.calculateMaxDrawdown(portfolioValues);
    const beta = this.calculateBeta(portfolioReturns, benchmarkReturns);
    const alpha = this.calculateAlpha(portfolioReturns, benchmarkReturns, beta);
    const informationRatio = this.calculateInformationRatio(portfolioReturns, benchmarkReturns);
    const trackingError = this.calculateTrackingError(portfolioReturns, benchmarkReturns);

    return {
      totalReturn,
      annualizedReturn,
      volatility,
      sharpeRatio,
      maxDrawdown,
      beta,
      alpha,
      informationRatio,
      trackingError
    };
  }

  private static calculateYears(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays / 365.25;
  }
}

export class PortfolioValueCalculator {
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

  static getPriceAtDate(
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

  static generatePortfolioTimeSeries(
    investments: any[],
    startDate: string,
    endDate: string,
    historicalData: Map<string, HistoricalPriceData[]>
  ): PerformanceDataPoint[] {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeSeries: PerformanceDataPoint[] = [];

    // Get all unique dates from historical data
    const allDates = new Set<string>();
    historicalData.forEach(data => {
      data.forEach(point => allDates.add(point.date));
    });

    const sortedDates = Array.from(allDates)
      .map(date => new Date(date))
      .filter(date => date >= start && date <= end)
      .sort((a, b) => a.getTime() - b.getTime())
      .map(date => date.toISOString().split('T')[0]);

    let previousPortfolioValue = 0;
    let previousBenchmarkValue = 0;

    for (let i = 0; i < sortedDates.length; i++) {
      const date = sortedDates[i];
      const portfolioValue = this.calculatePortfolioValueAtDate(investments, date, historicalData);
      
      // Calculate returns
      const portfolioReturn = previousPortfolioValue > 0 
        ? (portfolioValue - previousPortfolioValue) / previousPortfolioValue 
        : 0;
      
      const benchmarkReturn = 0; // Will be calculated separately for benchmark
      
      // Calculate cumulative returns
      const cumulativePortfolioReturn = i === 0 ? 0 : 
        (portfolioValue - timeSeries[0].portfolioValue) / timeSeries[0].portfolioValue;
      
      const cumulativeBenchmarkReturn = 0; // Will be calculated separately

      timeSeries.push({
        date,
        portfolioValue,
        benchmarkValue: 0, // Will be filled by benchmark data
        portfolioReturn,
        benchmarkReturn,
        cumulativePortfolioReturn,
        cumulativeBenchmarkReturn
      });

      previousPortfolioValue = portfolioValue;
    }

    return timeSeries;
  }
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function formatPercentage(value: number, decimals: number = 2): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

export function formatCurrency(value: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(value);
}
