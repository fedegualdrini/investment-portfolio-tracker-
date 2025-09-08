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
import { normalizedComparisonService, NormalizedComparison } from '../services/normalizedComparisonService';

export function PerformanceComparisonPage() {
  const { investments } = useInvestments();
  const { formatCurrency } = useCurrency();
  const { t } = useLanguage();

  // State management
  const [selectedBenchmark, setSelectedBenchmark] = useState<Benchmark>(BENCHMARKS[0]);
  const [dateRange, setDateRange] = useState<DateRange>(getDateRangeFromPreset('1Y'));
  const [performanceData, setPerformanceData] = useState<PerformanceDataPoint[]>([]);
  const [normalizedComparison, setNormalizedComparison] = useState<NormalizedComparison | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data fetching with normalized comparison using the global service
  const fetchPerformanceData = useCallback(async () => {
    if (investments.length === 0) {
      setPerformanceData([]);
      setNormalizedComparison(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔥 Fetching performance data using NormalizedComparisonService');
      
      // Use the global service directly - no API calls needed!
      const result = await normalizedComparisonService.getNormalizedComparison(
        investments,
        selectedBenchmark.id,
        dateRange.start,
        dateRange.end
      );

      console.log('✅ Performance data received:', result);
      
      setNormalizedComparison(result.normalizedComparison);
      setPerformanceData(result.normalizedComparison.normalizedPortfolio);

    } catch (err) {
      console.error('❌ Error fetching performance data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch performance data');
      setPerformanceData([]);
      setNormalizedComparison(null);
    } finally {
      setLoading(false);
    }
  }, [investments, selectedBenchmark, dateRange]);

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

  // Handle loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorAlert 
          message={error}
          onRetry={fetchPerformanceData}
        />
      </div>
    );
  }

  // Handle no data state
  if (performanceData.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              No Performance Data Available
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Unable to fetch performance data for the selected time period. Please try a different date range.
            </p>
            <button
              onClick={fetchPerformanceData}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <PerformanceHeader
        selectedBenchmark={selectedBenchmark}
        onBenchmarkChange={setSelectedBenchmark}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        availableBenchmarks={BENCHMARKS}
        dateRangePresets={DATE_RANGE_PRESETS}
      />

      {/* Performance Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Portfolio vs Benchmark Performance
        </h3>
        <PerformanceChart 
          data={performanceData}
          benchmarkData={normalizedComparison?.normalizedBenchmark || []}
          formatCurrency={formatCurrency}
        />
      </div>

      {/* Cumulative Returns Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Cumulative Returns
        </h3>
        <CumulativeReturnsChart 
          data={performanceData}
          benchmarkData={normalizedComparison?.normalizedBenchmark || []}
          formatCurrency={formatCurrency}
        />
      </div>

      {/* Performance Metrics */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Performance Metrics
        </h3>
        <PerformanceMetrics 
          data={performanceData}
          benchmarkData={normalizedComparison?.normalizedBenchmark || []}
          formatCurrency={formatCurrency}
        />
      </div>

      {/* Normalization Info */}
      {normalizedComparison && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
            Comparison Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-blue-800 dark:text-blue-200">Starting Value:</span>
              <span className="ml-2 text-blue-700 dark:text-blue-300">
                {formatCurrency(normalizedComparison.startingValue)}
              </span>
            </div>
            <div>
              <span className="font-medium text-blue-800 dark:text-blue-200">Benchmark Shares:</span>
              <span className="ml-2 text-blue-700 dark:text-blue-300">
                {normalizedComparison.benchmarkShares.toFixed(6)}
              </span>
            </div>
            <div className="md:col-span-2">
              <p className="text-blue-700 dark:text-blue-300">
                Both portfolios start at the same dollar amount ({formatCurrency(normalizedComparison.startingValue)}) 
                to ensure a fair performance comparison. This shows the true relative performance 
                of your portfolio against the benchmark.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}