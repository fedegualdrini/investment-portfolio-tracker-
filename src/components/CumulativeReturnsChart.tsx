import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { CumulativeReturnsProps } from '../types/performance';
import { useLanguage } from '../contexts/LanguageContext';
import { formatDate, formatPercentage } from '../utils/performanceCalculations';

// Custom tooltip for cumulative returns
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card-static p-3 shadow-lg">
        <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
          {formatDate(label)}
        </p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center space-x-2 mb-1">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {entry.name}:
            </span>
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              {formatPercentage(entry.value)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function CumulativeReturnsChart({ data }: CumulativeReturnsProps) {
  const { t } = useLanguage();

  const chartData = React.useMemo(() =>
    data.map(point => ({
      ...point,
      date: formatDate(point.date),
      cumulativePortfolioReturn: point.cumulativePortfolioReturn,
      cumulativeBenchmarkReturn: point.cumulativeBenchmarkReturn
    })), [data]
  );

  if (chartData.length === 0) {
    return (
      <div className="glass-card p-8">
        <div className="text-center">
          <p style={{ color: 'var(--text-muted)' }}>No cumulative returns data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
          Cumulative Returns
        </h2>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Total returns over time (percentage)
        </p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
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
            tickFormatter={(value) => formatPercentage(value)}
          />
          <Tooltip
            content={<CustomTooltip />}
          />
          <Area
            type="monotone"
            dataKey="cumulativePortfolioReturn"
            stackId="1"
            stroke="#10B981"
            fill="#10B981"
            fillOpacity={0.15}
            name="Portfolio"
          />
          <Area
            type="monotone"
            dataKey="cumulativeBenchmarkReturn"
            stackId="2"
            stroke="#06B6D4"
            fill="#06B6D4"
            fillOpacity={0.15}
            name="Benchmark"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
