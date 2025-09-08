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
              {formatCurrencyContext(entry.value)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function PerformanceChart({ data, selectedBenchmark, dateRange }: PerformanceChartProps) {
  const { formatCurrency: formatCurrencyContext } = useCurrency();
  const { t } = useLanguage();

  const chartData = React.useMemo(() => 
    data.map(point => ({
      ...point,
      date: formatDate(point.date),
      portfolioValue: point.portfolioValue,
      benchmarkValue: point.benchmarkValue
    })), [data]
  );

  if (chartData.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400">No data available for the selected period</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Portfolio vs {selectedBenchmark}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Performance comparison over time
        </p>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart
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
            tickFormatter={(value) => formatCurrencyContext(value)}
          />
          <Tooltip 
            content={<CustomTooltip />}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="portfolioValue" 
            stroke="#8884d8" 
            strokeWidth={2}
            name="Portfolio"
            dot={false}
            activeDot={{ r: 4, stroke: '#8884d8', strokeWidth: 2 }}
          />
          <Line 
            type="monotone" 
            dataKey="benchmarkValue" 
            stroke="#82ca9d" 
            strokeWidth={2}
            name={selectedBenchmark}
            dot={false}
            activeDot={{ r: 4, stroke: '#82ca9d', strokeWidth: 2 }}
          />
          <Brush 
            dataKey="date" 
            height={30} 
            stroke="#8884d8"
            fill="#f8f9fa"
            tickFormatter={(value) => formatDate(value)}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
