import React from 'react';
import { ChevronDown } from 'lucide-react';
import { BenchmarkSelectorProps } from '../types/performance';
import { useLanguage } from '../contexts/LanguageContext';

export function BenchmarkSelector({ 
  selectedBenchmark, 
  onBenchmarkChange, 
  benchmarks 
}: BenchmarkSelectorProps) {
  const { t } = useLanguage();
  
  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {t('benchmark')}
      </label>
      <div className="relative">
        <select
          value={selectedBenchmark.id}
          onChange={(e) => {
            const benchmark = benchmarks.find(b => b.id === e.target.value);
            if (benchmark) onBenchmarkChange(benchmark);
          }}
          className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-10 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full"
        >
          {benchmarks.map((benchmark) => (
            <option key={benchmark.id} value={benchmark.id}>
              {benchmark.name} ({benchmark.symbol})
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
      </div>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        {selectedBenchmark.description}
      </p>
    </div>
  );
}
