import { DateRange, DATE_RANGE_PRESETS, DateRangePreset } from '../types/performance';

export function getDateRangeFromPreset(preset: string): DateRange {
  const now = new Date();
  
  switch (preset) {
    case '1M':
      return {
        start: new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).toISOString().split('T')[0],
        end: now.toISOString().split('T')[0]
      };
    case '3M':
      return {
        start: new Date(now.getFullYear(), now.getMonth() - 3, now.getDate()).toISOString().split('T')[0],
        end: now.toISOString().split('T')[0]
      };
    case '6M':
      return {
        start: new Date(now.getFullYear(), now.getMonth() - 6, now.getDate()).toISOString().split('T')[0],
        end: now.toISOString().split('T')[0]
      };
    case '1Y':
      return {
        start: new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()).toISOString().split('T')[0],
        end: now.toISOString().split('T')[0]
      };
    case '3Y':
      return {
        start: new Date(now.getFullYear() - 3, now.getMonth(), now.getDate()).toISOString().split('T')[0],
        end: now.toISOString().split('T')[0]
      };
    case '5Y':
      return {
        start: new Date(now.getFullYear() - 5, now.getMonth(), now.getDate()).toISOString().split('T')[0],
        end: now.toISOString().split('T')[0]
      };
    case 'ALL':
      return {
        start: '2020-01-01', // Default start date for "all time"
        end: now.toISOString().split('T')[0]
      };
    default:
      return DATE_RANGE_PRESETS['1Y'];
  }
}

export function getPresetFromDateRange(dateRange: DateRange): DateRangePreset {
  const now = new Date();
  const start = new Date(dateRange.start);
  const end = new Date(dateRange.end);
  
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 31) return '1M';
  if (diffDays <= 93) return '3M';
  if (diffDays <= 186) return '6M';
  if (diffDays <= 365) return '1Y';
  if (diffDays <= 1095) return '3Y';
  if (diffDays <= 1825) return '5Y';
  return 'ALL';
}

export function formatDateForDisplay(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function formatDateForAPI(date: string): string {
  return new Date(date).toISOString().split('T')[0];
}

export function addDays(date: string, days: number): string {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result.toISOString().split('T')[0];
}

export function subtractDays(date: string, days: number): string {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result.toISOString().split('T')[0];
}

export function getDaysBetween(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function isDateInRange(date: string, startDate: string, endDate: string): boolean {
  const dateObj = new Date(date);
  const start = new Date(startDate);
  const end = new Date(endDate);
  return dateObj >= start && dateObj <= end;
}

export function getLastTradingDay(date: string = new Date().toISOString().split('T')[0]): string {
  const dateObj = new Date(date);
  const dayOfWeek = dateObj.getDay();
  
  // If it's Sunday (0), go back to Friday
  if (dayOfWeek === 0) {
    dateObj.setDate(dateObj.getDate() - 2);
  }
  // If it's Saturday (6), go back to Friday
  else if (dayOfWeek === 6) {
    dateObj.setDate(dateObj.getDate() - 1);
  }
  
  return dateObj.toISOString().split('T')[0];
}

export function getFirstTradingDayOfMonth(year: number, month: number): string {
  const firstDay = new Date(year, month, 1);
  const dayOfWeek = firstDay.getDay();
  
  // If it's weekend, move to next Monday
  if (dayOfWeek === 0) { // Sunday
    firstDay.setDate(firstDay.getDate() + 1);
  } else if (dayOfWeek === 6) { // Saturday
    firstDay.setDate(firstDay.getDate() + 2);
  }
  
  return firstDay.toISOString().split('T')[0];
}

export function getLastTradingDayOfMonth(year: number, month: number): string {
  const lastDay = new Date(year, month + 1, 0);
  const dayOfWeek = lastDay.getDay();
  
  // If it's weekend, move to previous Friday
  if (dayOfWeek === 0) { // Sunday
    lastDay.setDate(lastDay.getDate() - 2);
  } else if (dayOfWeek === 6) { // Saturday
    lastDay.setDate(lastDay.getDate() - 1);
  }
  
  return lastDay.toISOString().split('T')[0];
}
