import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { MetricCardProps } from '../types/performance';

export function MetricCard({ title, value, trend, icon, subtitle }: MetricCardProps) {
  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-emerald-500';
      case 'down':
        return 'text-red-500';
      default:
        return '';
    }
  };

  const getTrendBgColor = () => {
    switch (trend) {
      case 'up':
        return 'bg-emerald-500/10';
      case 'down':
        return 'bg-red-500/10';
      default:
        return '';
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4" />;
      case 'down':
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <Minus className="w-4 h-4" />;
    }
  };

  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-lg bg-emerald-500/10">
            <span className="text-emerald-500">{icon}</span>
          </div>
          <h3 className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            {title}
          </h3>
        </div>
        <div className={`flex items-center space-x-1 ${getTrendColor()}`}>
          {getTrendIcon()}
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          {value}
        </p>
        {subtitle && (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
