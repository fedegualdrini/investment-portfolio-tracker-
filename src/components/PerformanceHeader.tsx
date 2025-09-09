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
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
            <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {t('performance.comparison')}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('performance.comparison.subtitle')}
            </p>
          </div>
        </div>
        
        <button
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
