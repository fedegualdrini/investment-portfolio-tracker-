import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ArrowLeft } from 'lucide-react';
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

interface PerformanceComparisonPageProps {
  onBack: () => void;
}

export function PerformanceComparisonPage({ onBack }: PerformanceComparisonPageProps) {
  const { investments } = useInvestments();
  const { formatCurrency } = useCurrency();
  const { t } = useLanguage();

  // State management
  const [selectedBenchmark, setSelectedBenchmark] = useState<Benchmark>(BENCHMARKS[0]);
  const [dateRange, setDateRange] = useState<DateRange>(getDateRangeFromPreset('1Y'));
  const [performanceData, setPerformanceData] = useState<PerformanceDataPoint[]>([]);
  const [normalizedComparison, setNormalizedComparison] = useState<NormalizedComparison | null>(null);
  const [metrics, setMetrics] = useState<any>(null);
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
      setMetrics(result.metrics);

    } catch (err) {
      console.error('❌ Error fetching performance data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch performance data');
      setPerformanceData([]);
      setNormalizedComparison(null);
      setMetrics(null);
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          {/* Header with Back Button */}
          <div className="flex items-center space-x-3 sm:space-x-4 mb-6 sm:mb-8">
            <button
              onClick={onBack}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="mobile-title brand-heading">Performance Comparison</h1>
              <p className="mobile-subtitle brand-subtext">Compare your portfolio performance against market benchmarks</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                No Investments Found
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Add some investments to your portfolio to view performance comparisons.
              </p>
              <button
                onClick={onBack}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Back to Portfolio
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          {/* Header with Back Button */}
          <div className="flex items-center space-x-3 sm:space-x-4 mb-6 sm:mb-8">
            <button
              onClick={onBack}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="mobile-title brand-heading">Performance Comparison</h1>
              <p className="mobile-subtitle brand-subtext">Compare your portfolio performance against market benchmarks</p>
            </div>
          </div>

          <div className="flex justify-center items-center min-h-[400px]">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          {/* Header with Back Button */}
          <div className="flex items-center space-x-3 sm:space-x-4 mb-6 sm:mb-8">
            <button
              onClick={onBack}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="mobile-title brand-heading">Performance Comparison</h1>
              <p className="mobile-subtitle brand-subtext">Compare your portfolio performance against market benchmarks</p>
            </div>
          </div>

          <ErrorAlert 
            message={error}
            onRetry={fetchPerformanceData}
          />
        </div>
      </div>
    );
  }

  // Handle no data state
  if (performanceData.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          {/* Header with Back Button */}
          <div className="flex items-center space-x-3 sm:space-x-4 mb-6 sm:mb-8">
            <button
              onClick={onBack}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="mobile-title brand-heading">Performance Comparison</h1>
              <p className="mobile-subtitle brand-subtext">Compare your portfolio performance against market benchmarks</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                No Performance Data Available
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Unable to fetch performance data for the selected time period. Please try a different date range.
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={fetchPerformanceData}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  Retry
                </button>
                <button
                  onClick={onBack}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  Back to Portfolio
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header with Back Button */}
        <div className="flex items-center space-x-3 sm:space-x-4 mb-6 sm:mb-8">
          <button
            onClick={onBack}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="mobile-title brand-heading">Performance Comparison</h1>
            <p className="mobile-subtitle brand-subtext">Compare your portfolio performance against market benchmarks</p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Performance Header Controls */}
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
          selectedBenchmark={selectedBenchmark.name}
          dateRange={dateRange}
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
          metrics={metrics ? {
            totalReturn: metrics.portfolioReturn,
            annualizedReturn: metrics.portfolioReturn, // Simplified for now
            volatility: 0, // Will be calculated from service
            sharpeRatio: metrics.sharpeRatio,
            maxDrawdown: metrics.maxDrawdown,
            beta: metrics.beta,
            alpha: metrics.alpha,
            informationRatio: 0,
            trackingError: 0
          } : null}
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
      </div>
    </div>
  );
}