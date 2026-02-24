import React, { useState, useEffect, useCallback } from 'react';
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Target } from 'lucide-react';
import { useInvestments } from '../hooks/useInvestments';
import { useCurrency } from '../contexts/CurrencyContext';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Benchmark,
  DateRange,
  BENCHMARKS
} from '../types/performance';
import { getDateRangeFromPreset } from '../utils/dateUtils';
import { PerformanceHeader } from '../components/PerformanceHeader';
import { PerformanceChart } from '../components/PerformanceChart';
import {
  tenThousandComparisonService,
  TenThousandComparison
} from '../services/tenThousandComparisonService';

interface PerformanceComparisonPageProps {
  onBack: () => void;
}

export function PerformanceComparisonPage({ onBack }: PerformanceComparisonPageProps) {
  const { investments } = useInvestments();
  const { formatCurrency, displayCurrency, getCurrentARSRate } = useCurrency();
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
      <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="glass-card p-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 mb-4">
              <BarChart3 className="h-8 w-8 text-emerald-500" />
            </div>
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              No Investments Found
            </h2>
            <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
              Add some investments to your portfolio to view performance comparisons.
            </p>
            <button
              onClick={onBack}
              className="gradient-btn"
            >
              Back to Portfolio
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Handle loading state
  if (loading) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="space-y-6">
          {/* Skeleton header controls */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="shimmer-loading w-10 h-10 rounded-lg" />
                <div>
                  <div className="shimmer-loading h-6 w-48 rounded mb-2" />
                  <div className="shimmer-loading h-4 w-64 rounded" />
                </div>
              </div>
              <div className="shimmer-loading h-10 w-28 rounded-lg" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="shimmer-loading h-20 rounded-lg" />
              <div className="shimmer-loading h-20 rounded-lg" />
            </div>
          </div>

          {/* Skeleton chart */}
          <div className="glass-card p-6">
            <div className="shimmer-loading h-6 w-56 rounded mb-4" />
            <div className="shimmer-loading h-[400px] rounded-lg" />
          </div>

          {/* Skeleton metric cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="stat-card">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="shimmer-loading h-4 w-24 rounded mb-3" />
                    <div className="shimmer-loading h-8 w-32 rounded mb-2" />
                    <div className="shimmer-loading h-3 w-20 rounded" />
                  </div>
                  <div className="shimmer-loading w-12 h-12 rounded-lg" />
                </div>
              </div>
            ))}
          </div>

          {/* Skeleton alpha section */}
          <div className="glass-card p-6">
            <div className="shimmer-loading h-6 w-40 rounded mb-2" />
            <div className="shimmer-loading h-4 w-64 rounded mb-4" />
            <div className="shimmer-loading h-10 w-32 rounded" />
          </div>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="glass-card p-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
              <TrendingDown className="h-5 w-5 text-red-500" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                Error Loading Data
              </h3>
              <p className="text-sm mb-4 text-red-500">
                {error}
              </p>
              <button
                onClick={fetchPerformanceData}
                className="gradient-btn"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle no data state
  if (!comparison || comparison.portfolioPerformance.length === 0) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="glass-card p-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 mb-4">
              <BarChart3 className="h-8 w-8 text-emerald-500" />
            </div>
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              No Performance Data Available
            </h2>
            <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
              Unable to fetch performance data for the selected time period. Please try a different date range.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={fetchPerformanceData}
                className="gradient-btn"
              >
                Retry
              </button>
              <button
                onClick={onBack}
                className="btn-ghost"
              >
                Back to Portfolio
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
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
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
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
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{t('investment.amount')}</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {formatCurrency(comparison.investedAmount)}
                </p>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-lg">
                <DollarSign className="h-6 w-6 text-emerald-500" />
              </div>
            </div>
          </div>

          {/* Portfolio Return */}
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{t('portfolio.return')}</p>
                <p className={`text-2xl font-bold ${comparison.portfolioReturn >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {(comparison.portfolioReturn * 100).toFixed(2)}%
                </p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {t('final.value')}: {formatCurrency(comparison.finalPortfolioValue)}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${comparison.portfolioReturn >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                {comparison.portfolioReturn >= 0 ? (
                  <TrendingUp className="h-6 w-6 text-emerald-500" />
                ) : (
                  <TrendingDown className="h-6 w-6 text-red-500" />
                )}
              </div>
            </div>
          </div>

          {/* Benchmark Return */}
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{t('benchmark.return')}</p>
                <p className={`text-2xl font-bold ${comparison.benchmarkReturn >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {(comparison.benchmarkReturn * 100).toFixed(2)}%
                </p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {t('final.value')}: {formatCurrency(comparison.finalBenchmarkValue)}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${comparison.benchmarkReturn >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                {comparison.benchmarkReturn >= 0 ? (
                  <TrendingUp className="h-6 w-6 text-emerald-500" />
                ) : (
                  <TrendingDown className="h-6 w-6 text-red-500" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Alpha (Portfolio vs Benchmark) */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                {t('alpha.title')}
              </h3>
              <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                {t('alpha.subtitle')}
              </p>
              <p className={`text-4xl font-bold gradient-text`}>
                {comparison.alpha >= 0 ? '+' : ''}{(comparison.alpha * 100).toFixed(2)}%
              </p>
              <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
                {comparison.alpha >= 0
                  ? t('outperformed.by', { benchmark: selectedBenchmark.name, percentage: (comparison.alpha * 100).toFixed(2) })
                  : t('underperformed.by', { benchmark: selectedBenchmark.name, percentage: Math.abs(comparison.alpha * 100).toFixed(2) })
                }
              </p>
            </div>
            <div className={`p-4 rounded-lg ${comparison.alpha >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
              {comparison.alpha >= 0 ? (
                <Target className="h-8 w-8 text-emerald-500" />
              ) : (
                <TrendingDown className="h-8 w-8 text-red-500" />
              )}
            </div>
          </div>
        </div>

        {/* Portfolio Allocation Breakdown */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            {t('portfolio.allocation.title')}
          </h3>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
            {t('portfolio.allocation.subtitle', { amount: formatCurrency(comparison.investedAmount) })}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {comparison.allocations.map((allocation, index) => (
              <div key={index} className="glass-card-static p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      {allocation.investment.symbol.toUpperCase()}
                    </p>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {allocation.investment.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-emerald-500">
                      {(allocation.allocation * 100).toFixed(1)}%
                    </p>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      {formatCurrency(allocation.investedAmount)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
