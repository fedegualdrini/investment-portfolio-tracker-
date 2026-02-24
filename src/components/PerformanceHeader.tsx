import React from 'react';
import { RefreshCw, BarChart3 } from 'lucide-react';
import { PerformanceHeaderProps } from '../types/performance';
import { BenchmarkSelector } from './BenchmarkSelector';
import { DateRangePicker } from './DateRangePicker';
import { BENCHMARKS } from '../types/performance';
import { useLanguage } from '../contexts/LanguageContext';

export function PerformanceHeader({
  selectedBenchmark,
  onBenchmarkChange,
  dateRange,
  onDateRangeChange,
  onRefresh,
  loading
}: PerformanceHeaderProps) {
  const { t } = useLanguage();

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <BarChart3 className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {t('performance.comparison')}
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {t('performance.comparison.subtitle')}
            </p>
          </div>
        </div>

        <button
          onClick={onRefresh}
          disabled={loading}
          className="gradient-btn inline-flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? t('loading') : t('refresh')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BenchmarkSelector
          selectedBenchmark={selectedBenchmark}
          onBenchmarkChange={onBenchmarkChange}
          benchmarks={BENCHMARKS}
        />

        <DateRangePicker
          dateRange={dateRange}
          onDateRangeChange={onDateRangeChange}
        />
      </div>
    </div>
  );
}
