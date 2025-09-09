import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react';
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
import { getDateRangeFromPreset } from '../utils/dateUtils';
import { PerformanceHeader } from '../components/PerformanceHeader';
import { PerformanceChart } from '../components/PerformanceChart';
import { ErrorAlert } from '../components/ErrorAlert';
import { LoadingSpinner } from '../components/LoadingSpinner';
import {
  tenThousandComparisonService,
  TenThousandComparison
} from '../services/tenThousandComparisonService';

interface PerformanceComparisonPageProps {
  onBack: () => void;
}

export function PerformanceComparisonPage({ onBack }: PerformanceComparisonPageProps) {
  const { investments } = useInvestments();
  const { formatCurrency, displayCurrency, convertForDisplay, getCurrentARSRate } = useCurrency();
  const { t } = useLanguage();

  // State management
  const [selectedBenchmark, setSelectedBenchmark] = useState<Benchmark>(BENCHMARKS[0]);
  const [dateRange, setDateRange] = useState<DateRange>(getDateRangeFromPreset('1Y'));
  const [comparison, setComparison] = useState<TenThousandComparison | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ FIXED: Remove stale closure dependencies
  const handleDateRangeChange = useCallback((newDateRange: DateRange) => {
    console.log('📅 [DEBUG] Date range changed to:', newDateRange);
    setDateRange(newDateRange);
  }, []); // Empty dependencies - function never recreates

  const handleBenchmarkChange = useCallback((newBenchmark: Benchmark) => {
    console.log('📊 [DEBUG] Benchmark changed to:', newBenchmark.id);
    setSelectedBenchmark(newBenchmark);
  }, []); // Empty dependencies - function never recreates

  /**
   * Fetch performance data using the 10k comparison service.
   * This simulates investing 10k USD (or equivalent in display currency) at the start of the period,
   * distributed according to portfolio allocation percentages.
   */
  const fetchPerformanceData = useCallback(async () => {
    if (investments.length === 0) {
      setComparison(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔥 [DEBUG] Fetching 10k performance comparison data');
      console.log('🔥 [DEBUG] Date range:', dateRange.start, 'to', dateRange.end);
      console.log('🔥 [DEBUG] Benchmark:', selectedBenchmark.id);
      console.log('🔥 [DEBUG] Investments count:', investments.length);

      // Step 1: Get current USD to display currency rate
      const usdToDisplayCurrencyRate = displayCurrency === 'USD' ? 1 : await getCurrentARSRate();

      console.log(`💱 [DEBUG] Current rate: 1 USD = ${usdToDisplayCurrencyRate} ${displayCurrency}`);

      // Step 2: Fetch performance data using the new 10k service
      const result = await tenThousandComparisonService.getTenThousandComparison(
        investments,
        selectedBenchmark.id,
        dateRange.start,
        dateRange.end,
        10000, // 10k investment
        displayCurrency,
        usdToDisplayCurrencyRate
      );

      console.log('✅ [DEBUG] 10k comparison data received');
      console.log('✅ [DEBUG] Portfolio return:', result.portfolioReturn);
      console.log('✅ [DEBUG] Benchmark return:', result.benchmarkReturn);
      console.log('✅ [DEBUG] Alpha:', result.alpha);

      setComparison(result);

    } catch (err) {
      console.error('❌ [DEBUG] Error fetching 10k performance data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch performance data');
      setComparison(null);
    } finally {
      setLoading(false);
    }
  }, [investments, selectedBenchmark, dateRange, displayCurrency, getCurrentARSRate]);

  // Effects - Trigger data fetch when dependencies change
  useEffect(() => {
    console.log('🔄 [DEBUG] useEffect triggered - fetching data');
    console.log('🔄 [DEBUG] Current dateRange:', dateRange);
    console.log('🔄 [DEBUG] Current benchmark:', selectedBenchmark.id);
    fetchPerformanceData();
  }, [investments, selectedBenchmark, dateRange, displayCurrency]);

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
              <h1 className="mobile-title brand-heading">{t('performance.comparison')}</h1>
              <p className="mobile-subtitle brand-subtext">{t('performance.comparison.subtitle')}</p>
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
              <h1 className="mobile-title brand-heading">{t('performance.comparison')}</h1>
              <p className="mobile-subtitle brand-subtext">{t('performance.comparison.subtitle')}</p>
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
  if (!comparison || comparison.portfolioPerformance.length === 0) {
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
              <p className="mobile-subtitle brand-subtext">
                Compare 10k {displayCurrency} investment performance against {selectedBenchmark.name}
              </p>
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
            <h1 className="mobile-title brand-heading">{t('performance.comparison')}</h1>
            <p className="mobile-subtitle brand-subtext">
              {t('performance.comparison.10k.subtitle', { currency: displayCurrency, benchmark: selectedBenchmark.name })}
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Performance Header Controls */}
          <PerformanceHeader
            selectedBenchmark={selectedBenchmark}
            onBenchmarkChange={handleBenchmarkChange}
            dateRange={dateRange}
            onDateRangeChange={handleDateRangeChange}
            onRefresh={fetchPerformanceData}
            loading={loading}
          />

          {/* Performance Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {t('percentage.growth', { benchmark: selectedBenchmark.name })}
            </h3>
            <PerformanceChart
              data={comparison.portfolioPerformance}
              selectedBenchmark={selectedBenchmark.name}
              dateRange={dateRange}
            />
          </div>

          {/* Key Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Investment Amount */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('investment.amount')}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {formatCurrency(comparison.investedAmount)}
                  </p>
                </div>
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>

            {/* Portfolio Return */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('portfolio.return')}</p>
                  <p className={`text-2xl font-bold ${comparison.portfolioReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {(comparison.portfolioReturn * 100).toFixed(2)}%
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('final.value')}: {formatCurrency(comparison.finalPortfolioValue)}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${comparison.portfolioReturn >= 0 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                  {comparison.portfolioReturn >= 0 ? (
                    <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                  ) : (
                    <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
                  )}
                </div>
              </div>
            </div>

            {/* Benchmark Return */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('benchmark.return')}</p>
                  <p className={`text-2xl font-bold ${comparison.benchmarkReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {(comparison.benchmarkReturn * 100).toFixed(2)}%
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('final.value')}: {formatCurrency(comparison.finalBenchmarkValue)}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${comparison.benchmarkReturn >= 0 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                  {comparison.benchmarkReturn >= 0 ? (
                    <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                  ) : (
                    <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Alpha (Portfolio vs Benchmark) */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {t('alpha.title')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {t('alpha.subtitle')}
                </p>
                <p className={`text-3xl font-bold ${comparison.alpha >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {(comparison.alpha * 100).toFixed(2)}%
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  {comparison.alpha >= 0
                    ? t('outperformed.by', { benchmark: selectedBenchmark.name, percentage: (comparison.alpha * 100).toFixed(2) })
                    : t('underperformed.by', { benchmark: selectedBenchmark.name, percentage: Math.abs(comparison.alpha * 100).toFixed(2) })
                  }
                </p>
              </div>
              <div className={`p-4 rounded-lg ${comparison.alpha >= 0 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                {comparison.alpha >= 0 ? (
                  <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
                ) : (
                  <TrendingDown className="h-8 w-8 text-red-600 dark:text-red-400" />
                )}
              </div>
            </div>
          </div>

          {/* Portfolio Allocation Breakdown */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {t('portfolio.allocation.title')}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              {t('portfolio.allocation.subtitle', { amount: formatCurrency(comparison.investedAmount) })}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {comparison.allocations.map((allocation, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {allocation.investment.symbol.toUpperCase()}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {allocation.investment.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {(allocation.allocation * 100).toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatCurrency(allocation.investedAmount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}