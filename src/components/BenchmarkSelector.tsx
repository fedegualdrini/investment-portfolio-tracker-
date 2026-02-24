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
      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
        {t('benchmark')}
      </label>
      <div className="relative">
        <select
          value={selectedBenchmark.id}
          onChange={(e) => {
            const benchmark = benchmarks.find(b => b.id === e.target.value);
            if (benchmark) onBenchmarkChange(benchmark);
          }}
          className="input-field appearance-none pr-10"
        >
          {benchmarks.map((benchmark) => (
            <option key={benchmark.id} value={benchmark.id}>
              {benchmark.name} ({benchmark.symbol})
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
      </div>
      <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
        {selectedBenchmark.description}
      </p>
    </div>
  );
}
