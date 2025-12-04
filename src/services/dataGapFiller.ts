import { HistoricalPriceData } from '../types/performance.js';

export interface DateRange {
  start: string;
  end: string;
}

export class DataGapFiller {
  /**
   * Fill gaps in historical data by using the last available price
   * This handles weekends, holidays, and market closures
   */
  static fillDataGaps(
    data: HistoricalPriceData[],
    startDate: string,
    endDate: string
  ): HistoricalPriceData[] {
    if (data.length === 0) return data;

    // Sort data by date
    const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Generate all dates in the range
    const allDates = this.generateDateRange(startDate, endDate);
    
    // Create a map of existing data for quick lookup
    const dataMap = new Map<string, HistoricalPriceData>();
    sortedData.forEach(point => {
      dataMap.set(point.date, point);
    });

    // Fill gaps with last available price
    const filledData: HistoricalPriceData[] = [];
    let lastKnownPrice: HistoricalPriceData | null = null;

    for (const date of allDates) {
      if (dataMap.has(date)) {
        // Data exists for this date
        lastKnownPrice = dataMap.get(date)!;
        filledData.push(lastKnownPrice);
      } else if (lastKnownPrice) {
        // Fill gap with last known price
        filledData.push({
          date,
          open: lastKnownPrice.close, // Use close price as open for gap-filled days
          high: lastKnownPrice.close,
          low: lastKnownPrice.close,
          close: lastKnownPrice.close,
          volume: 0, // No volume on non-trading days
          adjustedClose: lastKnownPrice.adjustedClose || lastKnownPrice.close
        });
      }
      // If no lastKnownPrice yet, skip until we have data
    }

    return filledData;
  }

  /**
   * Fill gaps in multiple datasets and ensure they have the same date range
   */
  static fillDataGapsForComparison(
    portfolioData: Map<string, HistoricalPriceData[]>,
    benchmarkData: HistoricalPriceData[],
    startDate: string,
    endDate: string
  ): {
    portfolioData: Map<string, HistoricalPriceData[]>;
    benchmarkData: HistoricalPriceData[];
  } {
    // Fill gaps in benchmark data
    const filledBenchmarkData = this.fillDataGaps(benchmarkData, startDate, endDate);

    // Fill gaps in portfolio data for each symbol
    const filledPortfolioData = new Map<string, HistoricalPriceData[]>();
    portfolioData.forEach((data, symbol) => {
      filledPortfolioData.set(symbol, this.fillDataGaps(data, startDate, endDate));
    });

    return {
      portfolioData: filledPortfolioData,
      benchmarkData: filledBenchmarkData
    };
  }

  /**
   * Generate all dates in a range (including weekends)
   */
  private static generateDateRange(startDate: string, endDate: string): string[] {
    const dates: string[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const current = new Date(start);
    while (current <= end) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }
    
    return dates;
  }

  /**
   * Check if a date is a weekend
   */
  static isWeekend(date: string): boolean {
    const day = new Date(date).getDay();
    return day === 0 || day === 6; // Sunday or Saturday
  }

  /**
   * Check if a date is a market holiday (basic implementation)
   * In a production app, you'd want a more comprehensive holiday calendar
   */
  static isMarketHoliday(date: string): boolean {
    const dateObj = new Date(date);
    const month = dateObj.getMonth();
    const day = dateObj.getDate();
    const year = dateObj.getFullYear();

    // New Year's Day
    if (month === 0 && day === 1) return true;
    
    // Independence Day
    if (month === 6 && day === 4) return true;
    
    // Christmas Day
    if (month === 11 && day === 25) return true;
    
    // Thanksgiving (4th Thursday of November)
    if (month === 10) {
      const thanksgiving = this.getThanksgivingDate(year);
      if (day === thanksgiving) return true;
    }
    
    // Labor Day (1st Monday of September)
    if (month === 8) {
      const laborDay = this.getLaborDayDate(year);
      if (day === laborDay) return true;
    }

    return false;
  }

  /**
   * Get Thanksgiving date for a given year
   */
  private static getThanksgivingDate(year: number): number {
    const november = new Date(year, 10, 1); // November 1st
    const firstThursday = 1 + (4 - november.getDay()) % 7; // First Thursday
    return firstThursday + 21; // 4th Thursday
  }

  /**
   * Get Labor Day date for a given year
   */
  private static getLaborDayDate(year: number): number {
    const september = new Date(year, 8, 1); // September 1st
    const firstMonday = 1 + (1 - september.getDay() + 7) % 7; // First Monday
    return firstMonday;
  }

  /**
   * Check if a date is a trading day (not weekend or holiday)
   */
  static isTradingDay(date: string): boolean {
    return !this.isWeekend(date) && !this.isMarketHoliday(date);
  }

  /**
   * Get the next trading day after a given date
   */
  static getNextTradingDay(date: string): string {
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    
    while (!this.isTradingDay(nextDay.toISOString().split('T')[0])) {
      nextDay.setDate(nextDay.getDate() + 1);
    }
    
    return nextDay.toISOString().split('T')[0];
  }

  /**
   * Get the previous trading day before a given date
   */
  static getPreviousTradingDay(date: string): string {
    const prevDay = new Date(date);
    prevDay.setDate(prevDay.getDate() - 1);
    
    while (!this.isTradingDay(prevDay.toISOString().split('T')[0])) {
      prevDay.setDate(prevDay.getDate() - 1);
    }
    
    return prevDay.toISOString().split('T')[0];
  }
}
