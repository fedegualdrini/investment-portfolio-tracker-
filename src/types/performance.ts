export interface HistoricalPriceData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
  adjustedClose?: number;
}

export interface PerformanceDataPoint {
  date: string;
  portfolioValue: number;
  benchmarkValue: number;
  portfolioReturn: number;
  benchmarkReturn: number;
  cumulativePortfolioReturn: number;
  cumulativeBenchmarkReturn: number;
}

export interface Benchmark {
  id: string;
  name: string;
  symbol: string;
  description: string;
  dataSource: 'yahoo' | 'coingecko';
  type: 'stock' | 'crypto' | 'bond';
}

export interface PerformanceMetrics {
  totalReturn: number;
  annualizedReturn: number;
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
  beta: number;
  alpha: number;
  informationRatio: number;
  trackingError: number;
}

export interface DateRange {
  start: string;
  end: string;
}

export interface PerformanceChartProps {
  data: PerformanceDataPoint[];
  selectedBenchmark: string;
  dateRange: DateRange;
}

export interface CumulativeReturnsProps {
  data: PerformanceDataPoint[];
}

export interface MetricCardProps {
  title: string;
  value: string;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  subtitle?: string;
}

export interface BenchmarkSelectorProps {
  selectedBenchmark: Benchmark;
  onBenchmarkChange: (benchmark: Benchmark) => void;
  benchmarks: Benchmark[];
}

export interface DateRangePickerProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

export interface PerformanceHeaderProps {
  selectedBenchmark: Benchmark;
  onBenchmarkChange: (benchmark: Benchmark) => void;
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  onRefresh: () => void;
  loading: boolean;
}

export interface ErrorAlertProps {
  message: string;
  onRetry: () => void;
}

export interface LoadingSpinnerProps {
  message?: string;
}

// Predefined benchmarks
export const BENCHMARKS: Benchmark[] = [
  {
    id: 'SPY',
    name: 'S&P 500',
    symbol: '^GSPC',
    description: 'S&P 500 Index',
    dataSource: 'yahoo',
    type: 'stock'
  },
  {
    id: 'QQQ',
    name: 'NASDAQ 100',
    symbol: '^IXIC',
    description: 'NASDAQ Composite Index',
    dataSource: 'yahoo',
    type: 'stock'
  },
  {
    id: 'DIA',
    name: 'Dow Jones',
    symbol: '^DJI',
    description: 'Dow Jones Industrial Average',
    dataSource: 'yahoo',
    type: 'stock'
  },
  {
    id: 'BTC',
    name: 'Bitcoin',
    symbol: 'bitcoin',
    description: 'Bitcoin Price Index',
    dataSource: 'coingecko',
    type: 'crypto'
  },
  {
    id: 'ETH',
    name: 'Ethereum',
    symbol: 'ethereum',
    description: 'Ethereum Price Index',
    dataSource: 'coingecko',
    type: 'crypto'
  }
];

// Date range presets
export const DATE_RANGE_PRESETS = {
  '1M': { start: '1M', end: 'now' },
  '3M': { start: '3M', end: 'now' },
  '6M': { start: '6M', end: 'now' },
  '1Y': { start: '1Y', end: 'now' },
  '3Y': { start: '3Y', end: 'now' },
  '5Y': { start: '5Y', end: 'now' },
  'ALL': { start: 'ALL', end: 'now' }
} as const;

export type DateRangePreset = keyof typeof DATE_RANGE_PRESETS;
