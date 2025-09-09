import {
  PerformanceDataPoint,
  HistoricalPriceData,
  Benchmark,
  BENCHMARKS
} from '../types/performance';
import { createHistoricalDataService } from './historicalDataService';

export interface InvestmentAllocation {
  /** The investment object */
  investment: any;
  /** Percentage of portfolio allocated to this investment (0-1) */
  allocation: number;
  /** Amount invested in this investment (in display currency) */
  investedAmount: number;
  /** Quantity of shares/units owned */
  quantity: number;
}

export interface TenThousandComparison {
  /** Portfolio performance data points showing percentage growth */
  portfolioPerformance: PerformanceDataPoint[];
  /** Benchmark performance data points showing percentage growth */
  benchmarkPerformance: PerformanceDataPoint[];
  /** Total amount invested (10k in display currency) */
  investedAmount: number;
  /** Allocations for each investment in the portfolio */
  allocations: InvestmentAllocation[];
  /** Final portfolio value at the end of the period */
  finalPortfolioValue: number;
  /** Final benchmark value at the end of the period */
  finalBenchmarkValue: number;
  /** Total portfolio return as percentage */
  portfolioReturn: number;
  /** Total benchmark return as percentage */
  benchmarkReturn: number;
  /** Alpha (portfolio return minus benchmark return) */
  alpha: number;
}

/**
 * Service for comparing portfolio performance against benchmarks
 * assuming a fixed investment amount (10k USD or equivalent in display currency)
 * distributed according to portfolio allocation percentages.
 */
export class TenThousandComparisonService {
  private historicalDataService = createHistoricalDataService();

  /**
   * Calculate portfolio performance assuming 10,000 USD (or equivalent in display currency)
   * was invested at the start of the period, distributed according to portfolio allocations.
   *
   * @param investments - Array of user's investment holdings
   * @param benchmarkId - ID of the benchmark to compare against
   * @param startDate - Start date for the comparison period
   * @param endDate - End date for the comparison period
   * @param investmentAmount - Amount to invest (defaults to 10,000)
   * @param displayCurrency - Current display currency ('USD' or 'ARS')
   * @param usdToDisplayCurrencyRate - Conversion rate from USD to display currency
   * @returns Promise<TenThousandComparison> - Complete performance comparison
   */
  async getTenThousandComparison(
    investments: any[],
    benchmarkId: string,
    startDate: string,
    endDate: string,
    investmentAmount: number = 10000,
    displayCurrency: 'USD' | 'ARS' = 'USD',
    usdToDisplayCurrencyRate: number = 1
  ): Promise<TenThousandComparison> {

    console.log('🔥 TenThousandComparisonService - Starting 10k comparison calculation');
    console.log(`📊 Investment Amount: ${investmentAmount} ${displayCurrency}`);
    console.log(`💱 USD to ${displayCurrency} Rate: ${usdToDisplayCurrencyRate}`);
    console.log(`📈 Benchmark: ${benchmarkId}`);

    // Step 1: Convert investment amount to display currency if needed
    const investmentAmountInDisplayCurrency = displayCurrency === 'USD'
      ? investmentAmount
      : investmentAmount * usdToDisplayCurrencyRate;

    console.log(`💰 Investment Amount in Display Currency: ${investmentAmountInDisplayCurrency} ${displayCurrency}`);

    // Step 2: Calculate portfolio allocations and invested amounts
    const allocations = this.calculatePortfolioAllocations(
      investments,
      investmentAmountInDisplayCurrency
    );

    console.log('📊 Portfolio Allocations:');
    allocations.forEach(allocation => {
      console.log(`  - ${allocation.investment.symbol}: ${allocation.allocation * 100}% (${allocation.investedAmount} ${displayCurrency})`);
    });

    // Step 3: Fetch historical data for all investments and benchmark
    const portfolioData = await this.fetchPortfolioHistoricalData(allocations, startDate, endDate);
    const benchmarkData = await this.fetchBenchmarkHistoricalData(benchmarkId, startDate, endDate);

    // Step 4: Calculate portfolio value over time
    const portfolioPerformance = this.calculatePortfolioPerformance(
      portfolioData,
      allocations,
      investmentAmountInDisplayCurrency
    );

    // Step 5: Calculate benchmark performance (normalized to same investment amount)
    const benchmarkPerformance = this.calculateBenchmarkPerformance(
      benchmarkData,
      investmentAmountInDisplayCurrency
    );

    // Step 6: Combine portfolio and benchmark data for chart display
    const combinedPerformance = this.combinePortfolioAndBenchmarkData(
      portfolioPerformance,
      benchmarkPerformance
    );

    // Step 7: Calculate final metrics using combined data
    const finalPortfolioValue = combinedPerformance[combinedPerformance.length - 1]?.portfolioValue || investmentAmountInDisplayCurrency;
    const finalBenchmarkValue = combinedPerformance[combinedPerformance.length - 1]?.benchmarkValue || investmentAmountInDisplayCurrency;

    const portfolioReturn = (finalPortfolioValue - investmentAmountInDisplayCurrency) / investmentAmountInDisplayCurrency;
    const benchmarkReturn = (finalBenchmarkValue - investmentAmountInDisplayCurrency) / investmentAmountInDisplayCurrency;
    const alpha = portfolioReturn - benchmarkReturn;

    console.log('📊 Final Results:');
    console.log(`  - Initial Investment: ${investmentAmountInDisplayCurrency} ${displayCurrency}`);
    console.log(`  - Final Portfolio Value: ${finalPortfolioValue} ${displayCurrency}`);
    console.log(`  - Final Benchmark Value: ${finalBenchmarkValue} ${displayCurrency}`);
    console.log(`  - Portfolio Return: ${(portfolioReturn * 100).toFixed(2)}%`);
    console.log(`  - Benchmark Return: ${(benchmarkReturn * 100).toFixed(2)}%`);
    console.log(`  - Alpha: ${(alpha * 100).toFixed(2)}%`);

    return {
      portfolioPerformance: combinedPerformance, // Combined data for chart
      benchmarkPerformance, // Keep separate for any additional processing
      investedAmount: investmentAmountInDisplayCurrency,
      allocations,
      finalPortfolioValue,
      finalBenchmarkValue,
      portfolioReturn,
      benchmarkReturn,
      alpha
    };
  }

  /**
   * Calculate how much of the total investment amount goes to each investment
   * based on their percentage allocation in the current portfolio.
   *
   * @param investments - Array of user's investment holdings
   * @param totalInvestmentAmount - Total amount to invest
   * @returns Array of InvestmentAllocation objects
   */
  private calculatePortfolioAllocations(
    investments: any[],
    totalInvestmentAmount: number
  ): InvestmentAllocation[] {

    // Step 1: Calculate total current portfolio value
    let totalPortfolioValue = 0;
    for (const investment of investments) {
      const currentPrice = investment.currentPrice || investment.purchasePrice;
      totalPortfolioValue += currentPrice * investment.quantity;
    }

    console.log(`📊 Total Current Portfolio Value: ${totalPortfolioValue}`);

    // Step 2: Calculate allocation percentage for each investment
    const allocations: InvestmentAllocation[] = [];
    for (const investment of investments) {
      const currentPrice = investment.currentPrice || investment.purchasePrice;
      const investmentValue = currentPrice * investment.quantity;
      const allocation = investmentValue / totalPortfolioValue;

      // Calculate how much of the 10k should go to this investment
      const investedAmount = totalInvestmentAmount * allocation;

      // Calculate quantity to buy at current price
      const quantity = investedAmount / currentPrice;

      allocations.push({
        investment,
        allocation,
        investedAmount,
        quantity
      });
    }

    return allocations;
  }

  /**
   * Fetch historical data for all investments in the portfolio.
   * This gets the price history for each investment over the specified time period.
   *
   * @param allocations - Investment allocations with quantities
   * @param startDate - Start date for historical data
   * @param endDate - End date for historical data
   * @returns Promise<Map<string, HistoricalPriceData[]>> - Map of symbol to historical data
   */
  private async fetchPortfolioHistoricalData(
    allocations: InvestmentAllocation[],
    startDate: string,
    endDate: string
  ): Promise<Map<string, HistoricalPriceData[]>> {

    const portfolioData = new Map<string, HistoricalPriceData[]>();

    for (const allocation of allocations) {
      const symbol = allocation.investment.symbol;
      console.log(`📈 Fetching historical data for ${symbol}...`);

      try {
        const historicalData = await this.historicalDataService.getHistoricalData(
          symbol,
          startDate,
          endDate,
          allocation.investment.dataSource || 'yahoo'
        );

        portfolioData.set(symbol, historicalData);
        console.log(`✅ Got ${historicalData.length} data points for ${symbol}`);

      } catch (error) {
        console.error(`❌ Error fetching data for ${symbol}:`, error);
        // Use empty array as fallback
        portfolioData.set(symbol, []);
      }
    }

    return portfolioData;
  }

  /**
   * Fetch historical data for the benchmark.
   *
   * @param benchmarkId - ID of the benchmark
   * @param startDate - Start date for historical data
   * @param endDate - End date for historical data
   * @returns Promise<HistoricalPriceData[]> - Historical data for benchmark
   */
  private async fetchBenchmarkHistoricalData(
    benchmarkId: string,
    startDate: string,
    endDate: string
  ): Promise<HistoricalPriceData[]> {

    const benchmark = BENCHMARKS.find(b => b.id === benchmarkId);
    if (!benchmark) {
      throw new Error(`Benchmark with id ${benchmarkId} not found`);
    }

    console.log(`📈 Fetching benchmark data for ${benchmark.name}...`);

    const benchmarkData = await this.historicalDataService.getHistoricalData(
      benchmark.symbol,
      startDate,
      endDate,
      benchmark.dataSource
    );

    console.log(`✅ Got ${benchmarkData.length} data points for ${benchmark.name}`);
    return benchmarkData;
  }

  /**
   * Calculate portfolio performance over time based on historical data.
   * This simulates what would happen if we invested the allocated amounts
   * at the start of the period and held until each point in time.
   *
   * @param portfolioData - Historical data for all investments
   * @param allocations - How much was invested in each investment
   * @param totalInvestmentAmount - Total amount invested
   * @returns Array of PerformanceDataPoint objects
   */
  private calculatePortfolioPerformance(
    portfolioData: Map<string, HistoricalPriceData[]>,
    allocations: InvestmentAllocation[],
    totalInvestmentAmount: number
  ): PerformanceDataPoint[] {

    // Step 1: Get all unique dates across all investments
    const allDates = new Set<string>();
    for (const historicalData of portfolioData.values()) {
      historicalData.forEach(dataPoint => allDates.add(dataPoint.date));
    }

    const sortedDates = Array.from(allDates).sort();

    console.log(`📅 Found ${sortedDates.length} unique dates across portfolio`);

    // Step 2: Calculate portfolio value for each date
    const performance: PerformanceDataPoint[] = [];
    let previousPortfolioValue = totalInvestmentAmount;

    for (let i = 0; i < sortedDates.length; i++) {
      const date = sortedDates[i];
      let portfolioValue = 0;

      // Calculate value of each investment on this date
      for (const allocation of allocations) {
        const symbol = allocation.investment.symbol;
        const historicalData = portfolioData.get(symbol) || [];

        // Find the data point for this date (or closest available)
        const dataPoint = this.findClosestDataPoint(historicalData, date);
        if (dataPoint) {
          // Value = quantity owned * price on this date
          const investmentValue = allocation.quantity * dataPoint.close;
          portfolioValue += investmentValue;
        } else {
          // If no data for this date, assume no change from previous value
          // This is a simplified assumption - in reality you'd want better handling
          portfolioValue += allocation.investedAmount; // Keep original investment amount
        }
      }

      // Calculate returns
      const portfolioReturn = i === 0 ? 0 : (portfolioValue - previousPortfolioValue) / previousPortfolioValue;
      const cumulativePortfolioReturn = (portfolioValue - totalInvestmentAmount) / totalInvestmentAmount;

      performance.push({
        date,
        portfolioValue,
        benchmarkValue: totalInvestmentAmount, // Will be updated when benchmark is calculated
        portfolioReturn,
        benchmarkReturn: 0, // Will be updated when benchmark is calculated
        cumulativePortfolioReturn,
        cumulativeBenchmarkReturn: 0 // Will be updated when benchmark is calculated
      });

      previousPortfolioValue = portfolioValue;
    }

    console.log(`📊 Calculated portfolio performance for ${performance.length} dates`);
    return performance;
  }

  /**
   * Combine portfolio and benchmark performance data for chart display.
   * This ensures both datasets have matching dates and proper benchmark values.
   *
   * @param portfolioData - Portfolio performance data
   * @param benchmarkData - Benchmark performance data
   * @returns Array of combined PerformanceDataPoint objects
   */
  private combinePortfolioAndBenchmarkData(
    portfolioData: PerformanceDataPoint[],
    benchmarkData: PerformanceDataPoint[]
  ): PerformanceDataPoint[] {

    if (portfolioData.length === 0) return [];
    if (benchmarkData.length === 0) {
      // If no benchmark data, return portfolio data with benchmark values set to initial investment
      const initialValue = portfolioData[0].portfolioValue;
      return portfolioData.map(point => ({
        ...point,
        benchmarkValue: initialValue,
        benchmarkReturn: 0,
        cumulativeBenchmarkReturn: 0
      }));
    }

    // Create a map of benchmark data by date for quick lookup
    const benchmarkMap = new Map<string, PerformanceDataPoint>();
    benchmarkData.forEach(point => {
      benchmarkMap.set(point.date, point);
    });

    // Combine data by matching dates
    const combined: PerformanceDataPoint[] = [];

    for (const portfolioPoint of portfolioData) {
      const benchmarkPoint = benchmarkMap.get(portfolioPoint.date);

      if (benchmarkPoint) {
        // Perfect date match
        combined.push({
          ...portfolioPoint,
          benchmarkValue: benchmarkPoint.benchmarkValue,
          benchmarkReturn: benchmarkPoint.benchmarkReturn,
          cumulativeBenchmarkReturn: benchmarkPoint.cumulativeBenchmarkReturn
        });
      } else {
        // No exact match - use closest available benchmark data
        const closestBenchmark = this.findClosestBenchmarkData(benchmarkMap, portfolioPoint.date);
        if (closestBenchmark) {
          combined.push({
            ...portfolioPoint,
            benchmarkValue: closestBenchmark.benchmarkValue,
            benchmarkReturn: closestBenchmark.benchmarkReturn,
            cumulativeBenchmarkReturn: closestBenchmark.cumulativeBenchmarkReturn
          });
        } else {
          // No benchmark data available for this date - use initial investment value
          const initialValue = portfolioData[0].portfolioValue;
          combined.push({
            ...portfolioPoint,
            benchmarkValue: initialValue,
            benchmarkReturn: 0,
            cumulativeBenchmarkReturn: 0
          });
        }
      }
    }

    console.log(`📊 Combined ${combined.length} data points for chart display`);
    return combined;
  }

  /**
   * Find the closest benchmark data point to a target date.
   *
   * @param benchmarkMap - Map of benchmark data by date
   * @param targetDate - Target date to find closest match for
   * @returns Closest PerformanceDataPoint or null
   */
  private findClosestBenchmarkData(
    benchmarkMap: Map<string, PerformanceDataPoint>,
    targetDate: string
  ): PerformanceDataPoint | null {

    const targetTime = new Date(targetDate).getTime();
    let closestPoint: PerformanceDataPoint | null = null;
    let smallestDifference = Infinity;

    for (const point of benchmarkMap.values()) {
      const pointTime = new Date(point.date).getTime();
      const timeDifference = Math.abs(pointTime - targetTime);

      if (timeDifference < smallestDifference && timeDifference <= 7 * 24 * 60 * 60 * 1000) { // 7 days
        smallestDifference = timeDifference;
        closestPoint = point;
      }
    }

    return closestPoint;
  }

  /**
   * Calculate benchmark performance assuming the same investment amount.
   * This shows what the benchmark would have returned with the same initial investment.
   *
   * @param benchmarkData - Historical data for the benchmark
   * @param investmentAmount - Amount invested in benchmark
   * @returns Array of PerformanceDataPoint objects for benchmark
   */
  private calculateBenchmarkPerformance(
    benchmarkData: HistoricalPriceData[],
    investmentAmount: number
  ): PerformanceDataPoint[] {

    if (benchmarkData.length === 0) {
      return [];
    }

    console.log(`📊 Calculating benchmark performance for ${benchmarkData.length} data points`);

    // Step 1: Calculate benchmark shares (how many shares we could buy with investment amount)
    const startingPrice = benchmarkData[0].close;
    const benchmarkShares = investmentAmount / startingPrice;

    console.log(`📊 Benchmark starting price: ${startingPrice}`);
    console.log(`📊 Benchmark shares to buy: ${benchmarkShares}`);

    // Step 2: Calculate benchmark value over time
    const performance: PerformanceDataPoint[] = [];
    let previousBenchmarkValue = investmentAmount;

    for (let i = 0; i < benchmarkData.length; i++) {
      const dataPoint = benchmarkData[i];
      const benchmarkValue = benchmarkShares * dataPoint.close;

      const benchmarkReturn = i === 0 ? 0 : (benchmarkValue - previousBenchmarkValue) / previousBenchmarkValue;
      const cumulativeBenchmarkReturn = (benchmarkValue - investmentAmount) / investmentAmount;

      performance.push({
        date: dataPoint.date,
        portfolioValue: investmentAmount, // Not used for benchmark-only data
        benchmarkValue,
        portfolioReturn: 0, // Not used for benchmark-only data
        benchmarkReturn,
        cumulativePortfolioReturn: 0, // Not used for benchmark-only data
        cumulativeBenchmarkReturn
      });

      previousBenchmarkValue = benchmarkValue;
    }

    return performance;
  }

  /**
   * Find the closest data point to a target date.
   * Used when we don't have exact date matches across different data sources.
   *
   * @param historicalData - Array of historical data points
   * @param targetDate - Target date to find closest match for
   * @param maxDaysDifference - Maximum days difference to consider (default 7)
   * @returns HistoricalPriceData or null if no close match found
   */
  private findClosestDataPoint(
    historicalData: HistoricalPriceData[],
    targetDate: string,
    maxDaysDifference: number = 7
  ): HistoricalPriceData | null {

    const targetTime = new Date(targetDate).getTime();
    const maxTimeDifference = maxDaysDifference * 24 * 60 * 60 * 1000; // Convert days to milliseconds

    let closestPoint: HistoricalPriceData | null = null;
    let smallestDifference = Infinity;

    for (const dataPoint of historicalData) {
      const pointTime = new Date(dataPoint.date).getTime();
      const timeDifference = Math.abs(pointTime - targetTime);

      if (timeDifference < smallestDifference && timeDifference <= maxTimeDifference) {
        smallestDifference = timeDifference;
        closestPoint = dataPoint;
      }
    }

    return closestPoint;
  }

  /**
   * Get available benchmarks for comparison.
   *
   * @returns Array of available benchmarks
   */
  getAvailableBenchmarks(): Benchmark[] {
    return BENCHMARKS;
  }

  /**
   * Get benchmark by ID.
   *
   * @param id - Benchmark ID
   * @returns Benchmark object or null if not found
   */
  getBenchmarkById(id: string): Benchmark | null {
    return BENCHMARKS.find(b => b.id === id) || null;
  }
}

// Create and export singleton instance
export const tenThousandComparisonService = new TenThousandComparisonService();
