import React from 'react';
import { 
  TrendingUp, 
  Calendar, 
  Target, 
  TrendingDown, 
  Activity, 
  Zap 
} from 'lucide-react';
import { PerformanceMetrics as PerformanceMetricsType } from '../types/performance';
import { MetricCard } from './MetricCard';
import { formatPercentage } from '../utils/performanceCalculations';

interface PerformanceMetricsProps {
  metrics: PerformanceMetricsType | null;
}

export function PerformanceMetrics({ metrics }: PerformanceMetricsProps) {
  if (!metrics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      <MetricCard
        title="Total Return"
        value={formatPercentage(metrics.totalReturn)}
        trend={metrics.totalReturn > 0 ? 'up' : 'down'}
        icon={<TrendingUp className="w-5 h-5" />}
        subtitle="Since inception"
      />
      
      <MetricCard
        title="Annualized Return"
        value={formatPercentage(metrics.annualizedReturn)}
        trend={metrics.annualizedReturn > 0 ? 'up' : 'down'}
        icon={<Calendar className="w-5 h-5" />}
        subtitle="Per year"
      />
      
      <MetricCard
        title="Sharpe Ratio"
        value={metrics.sharpeRatio.toFixed(2)}
        trend={metrics.sharpeRatio > 1 ? 'up' : metrics.sharpeRatio > 0 ? 'neutral' : 'down'}
        icon={<Target className="w-5 h-5" />}
        subtitle="Risk-adjusted return"
      />
      
      <MetricCard
        title="Max Drawdown"
        value={formatPercentage(metrics.maxDrawdown)}
        trend="down"
        icon={<TrendingDown className="w-5 h-5" />}
        subtitle="Peak to trough"
      />
      
      <MetricCard
        title="Beta"
        value={metrics.beta.toFixed(2)}
        trend={metrics.beta > 1 ? 'up' : metrics.beta < 1 ? 'down' : 'neutral'}
        icon={<Activity className="w-5 h-5" />}
        subtitle="Market sensitivity"
      />
      
      <MetricCard
        title="Alpha"
        value={formatPercentage(metrics.alpha)}
        trend={metrics.alpha > 0 ? 'up' : 'down'}
        icon={<Zap className="w-5 h-5" />}
        subtitle="Excess return"
      />
    </div>
  );
}
