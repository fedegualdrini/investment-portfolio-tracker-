import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush
} from 'recharts';
import { PerformanceChartProps } from '../types/performance';
import { useCurrency } from '../contexts/CurrencyContext';
import { useLanguage } from '../contexts/LanguageContext';
import { formatDate } from '../utils/performanceCalculations';

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  const { formatCurrency: formatCurrencyContext } = useCurrency();

  if (active && payload && payload.length) {
    return (
      <div className="glass-card-static p-3 shadow-lg" style={{ minWidth: '180px' }}>
        <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
          {formatDate(label)}
        </p>
        {payload.map((entry: any, index: number) => {
          // For percentage growth data keys, show as percentage
          const isPercentageData = entry.dataKey?.includes('Growth');
          const displayValue = isPercentageData
            ? `${entry.value.toFixed(2)}%`
            : formatCurrencyContext(entry.payload[entry.dataKey.replace('Growth', 'Value')]);

          return (
            <div key={index} className="flex items-center space-x-2 mb-1">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {entry.name}:
              </span>
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                {displayValue}
              </span>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

export function PerformanceChart({ data, selectedBenchmark, dateRange }: PerformanceChartProps) {
  const { formatCurrency: formatCurrencyContext } = useCurrency();
  const { t } = useLanguage();

  // Convert absolute values to percentage growth from initial investment
  const chartData = React.useMemo(() => {
    if (data.length === 0) return [];

    // Get the initial investment amounts for both portfolio and benchmark
    const initialPortfolioValue = data[0].portfolioValue;
    const initialBenchmarkValue = data[0].benchmarkValue;

    return data.map(point => ({
      ...point,
      date: formatDate(point.date),
      // Convert to percentage growth: (current - initial) / initial * 100
      // Each uses its own initial value for accurate percentage calculation
      portfolioGrowth: initialPortfolioValue > 0
        ? ((point.portfolioValue - initialPortfolioValue) / initialPortfolioValue) * 100
        : 0,
      benchmarkGrowth: initialBenchmarkValue > 0
        ? ((point.benchmarkValue - initialBenchmarkValue) / initialBenchmarkValue) * 100
        : 0,
      // Keep original values for tooltip
      portfolioValue: point.portfolioValue,
      benchmarkValue: point.benchmarkValue
    }));
  }, [data]);

  if (chartData.length === 0) {
    return (
      <div className="glass-card p-8">
        <div className="text-center">
          <p style={{ color: 'var(--text-muted)' }}>No data available for the selected period</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border-primary)"
            strokeOpacity={0.5}
          />
          <XAxis
            dataKey="date"
            stroke="var(--text-muted)"
            tick={{ fontSize: 12, fill: 'var(--text-muted)' }}
            tickLine={{ stroke: 'var(--text-muted)' }}
          />
          <YAxis
            stroke="var(--text-muted)"
            tick={{ fontSize: 12, fill: 'var(--text-muted)' }}
            tickLine={{ stroke: 'var(--text-muted)' }}
            tickFormatter={(value) => `${value.toFixed(1)}%`}
          />
          <Tooltip
            content={<CustomTooltip />}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="portfolioGrowth"
            stroke="#10B981"
            strokeWidth={2}
            name="Portfolio"
            dot={false}
            activeDot={{ r: 4, stroke: '#10B981', strokeWidth: 2, fill: '#10B981' }}
          />
          <Line
            type="monotone"
            dataKey="benchmarkGrowth"
            stroke="#06B6D4"
            strokeWidth={2}
            name={selectedBenchmark}
            dot={false}
            activeDot={{ r: 4, stroke: '#06B6D4', strokeWidth: 2, fill: '#06B6D4' }}
          />
          <Brush
            dataKey="date"
            height={30}
            stroke="#10B981"
            fill="transparent"
            tickFormatter={(value) => formatDate(value)}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
