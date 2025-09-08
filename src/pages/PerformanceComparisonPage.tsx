import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useInvestments } from '../hooks/useInvestments';
import { useCurrency } from '../contexts/CurrencyContext';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  PerformanceDataPoint, 
  Benchmark, 
  DateRange, 
  BENCHMARKS,
  DATE_RANGE_PRESETS 
} from '../types/performance';
import { PerformanceMetricsCalculator } from '../utils/performanceCalculations';
import { getDateRangeFromPreset } from '../utils/dateUtils';
import { PerformanceHeader } from '../components/PerformanceHeader';
import { PerformanceChart } from '../components/PerformanceChart';
import { CumulativeReturnsChart } from '../components/CumulativeReturnsChart';
import { PerformanceMetrics } from '../components/PerformanceMetrics';
import { ErrorAlert } from '../components/ErrorAlert';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { createPerformanceComparisonService } from '../services/performanceComparisonService';

// Mock services - these would be replaced with actual service instances
const mockYahooService = {
  getBatchHistoricalData: async (symbols: string[], startDate: string, endDate: string) => {
    // Mock implementation - replace with actual Yahoo Finance API calls
    const mockData = new Map();
    symbols.forEach(symbol => {
      mockData.set(symbol, generateMockHistoricalData(startDate, endDate));
    });
    return mockData;
  },
  getHistoricalData: async (symbol: string, startDate: string, endDate: string) => {
    return generateMockHistoricalData(startDate, endDate);
  }
};

const mockCoinGeckoService = {
  getBatchHistoricalData: async (symbols: string[], startDate: string, endDate: string) => {
    const mockData = new Map();
    symbols.forEach(symbol => {
      mockData.set(symbol, generateMockHistoricalData(startDate, endDate));
    });
    return mockData;
  },
  getHistoricalData: async (symbol: string, startDate: string, endDate: string) => {
    return generateMockHistoricalData(startDate, endDate);
  }
};

const mockPortfolioService = {
  // Mock portfolio service methods
};

// Mock data generator for development
function generateMockHistoricalData(startDate: string, endDate: string) {
  const data = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  
  let basePrice = 100;
  for (let i = 0; i < days; i++) {
    const date = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
    const change = (Math.random() - 0.5) * 0.05; // ±2.5% daily change
    basePrice *= (1 + change);
    
    data.push({
      date: date.toISOString().split('T')[0],
      open: basePrice * 0.99,
      high: basePrice * 1.02,
      low: basePrice * 0.98,
      close: basePrice,
      volume: Math.floor(Math.random() * 1000000) + 100000
    });
  }
  
  return data;
}

export function PerformanceComparisonPage() {
  const { investments } = useInvestments();
  const { formatCurrency } = useCurrency();
  const { t } = useLanguage();

  // State management
  const [selectedBenchmark, setSelectedBenchmark] = useState<Benchmark>(BENCHMARKS[0]);
  const [dateRange, setDateRange] = useState<DateRange>(getDateRangeFromPreset('1Y'));
  const [performanceData, setPerformanceData] = useState<PerformanceDataPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Services
  const performanceService = useMemo(() => 
    createPerformanceComparisonService(mockYahooService, mockCoinGeckoService, mockPortfolioService), 
    []
  );

  // Memoized calculations
  const metrics = useMemo(() => 
    performanceData.length > 0 
      ? PerformanceMetricsCalculator.calculateAllMetrics(performanceData) 
      : null, 
    [performanceData]
  );

  // Data fetching
  const fetchPerformanceData = useCallback(async () => {
    if (investments.length === 0) {
      setPerformanceData([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await performanceService.getPerformanceComparison(
        investments,
        selectedBenchmark,
        dateRange.start,
        dateRange.end
      );
      setPerformanceData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch performance data');
      setPerformanceData([]);
    } finally {
      setLoading(false);
    }
  }, [investments, selectedBenchmark, dateRange, performanceService]);

  // Effects
  useEffect(() => {
    fetchPerformanceData();
  }, [fetchPerformanceData]);

  // Handle empty portfolio
  if (investments.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              No Investments Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Add some investments to your portfolio to view performance comparisons.
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Add Investments
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <PerformanceHeader
        selectedBenchmark={selectedBenchmark}
        onBenchmarkChange={setSelectedBenchmark}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onRefresh={fetchPerformanceData}
        loading={loading}
      />

      {/* Error handling */}
      {error && (
        <ErrorAlert message={error} onRetry={fetchPerformanceData} />
      )}

      {/* Main content */}
      {!loading && performanceData.length > 0 && (
        <>
          {/* Performance metrics cards */}
          <PerformanceMetrics metrics={metrics} />

          {/* Main comparison chart */}
          <PerformanceChart
            data={performanceData}
            selectedBenchmark={selectedBenchmark.name}
            dateRange={dateRange}
          />

          {/* Cumulative returns chart */}
          <CumulativeReturnsChart data={performanceData} />
        </>
      )}

      {/* Loading state */}
      {loading && <LoadingSpinner />}

      {/* No data state */}
      {!loading && performanceData.length === 0 && !error && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              No Performance Data
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              No performance data available for the selected period. Try adjusting the date range.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
