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
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
          {formatDate(label)}
        </p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center space-x-2 mb-1">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {entry.name}:
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
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
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400">No cumulative returns data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Cumulative Returns
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
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
            stroke="#f5f5f5" 
            strokeOpacity={0.3}
          />
          <XAxis 
            dataKey="date" 
            stroke="#666"
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: '#666' }}
          />
          <YAxis 
            stroke="#666"
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: '#666' }}
            tickFormatter={(value) => formatPercentage(value)}
          />
          <Tooltip 
            content={<CustomTooltip />}
          />
          <Area 
            type="monotone" 
            dataKey="cumulativePortfolioReturn" 
            stackId="1" 
            stroke="#8884d8" 
            fill="#8884d8" 
            fillOpacity={0.6}
            name="Portfolio"
          />
          <Area 
            type="monotone" 
            dataKey="cumulativeBenchmarkReturn" 
            stackId="2" 
            stroke="#82ca9d" 
            fill="#82ca9d" 
            fillOpacity={0.6}
            name="Benchmark"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
