import React from 'react';
import { PieChart as PieChartIcon } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useLanguage } from '../contexts/LanguageContext';
import { useCurrency } from '../contexts/CurrencyContext';
import type { PortfolioSummary, InvestmentType } from '../types/investment';

const COLORS: Record<InvestmentType, string> = {
  crypto: '#F97316',
  stock: '#8B5CF6',
  bond: '#3B82F6',
  etf: '#10B981',
  commodity: '#F59E0B',
  cash: '#14B8A6',
  other: '#6B7280',
};

interface PortfolioStatsProps {
  summary: PortfolioSummary;
}

interface AllocationEntry {
  type: InvestmentType;
  value: number;
  percentage: number;
}

const CustomTooltip = ({ active, payload, getTypeLabel, formatCurrency }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as AllocationEntry;
    return (
      <div className="glass-card-static p-3 shadow-lg" style={{ border: '1px solid var(--border-primary)' }}>
        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
          {getTypeLabel(data.type)}
        </p>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {formatCurrency(data.value)} ({data.percentage.toFixed(1)}%)
        </p>
      </div>
    );
  }
  return null;
};

export function PortfolioStats({ summary }: PortfolioStatsProps) {
  const { t } = useLanguage();
  const { formatCurrency } = useCurrency();

  const formatPercentage = (percentage: number) => {
    return `${percentage.toFixed(1)}%`;
  };

  const getTypeLabel = (type: InvestmentType) => {
    const labels: Record<InvestmentType, string> = {
      crypto: t('type.crypto'),
      stock: t('type.stock'),
      bond: t('type.bond'),
      etf: t('type.etf'),
      commodity: t('type.commodity'),
      cash: t('type.cash'),
      other: t('type.other'),
    };
    return labels[type] || t('type.other');
  };

  const allocationData: AllocationEntry[] = Object.entries(summary.investmentsByType).map(([type, value]) => ({
    type: type as InvestmentType,
    value,
    percentage: summary.totalValue > 0 ? (value / summary.totalValue) * 100 : 0,
  }));

  if (summary.totalValue === 0) {
    return null;
  }

  return (
    <div className="glass-card p-6">
      <div className="flex items-center space-x-2 mb-6">
        <PieChartIcon className="h-5 w-5" style={{ color: 'var(--text-secondary)' }} />
        <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
          {t('portfolio.allocation')}
        </h2>
      </div>

      {/* Donut Chart */}
      <div className="relative">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={allocationData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={85}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              {allocationData.map((entry) => (
                <Cell key={entry.type} fill={COLORS[entry.type] || COLORS.other} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip getTypeLabel={getTypeLabel} formatCurrency={formatCurrency} />} />
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Total</p>
            <p className="text-lg font-bold gradient-text">{formatCurrency(summary.totalValue)}</p>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 space-y-3">
        {allocationData.map(({ type, value, percentage }) => (
          <div key={type} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: COLORS[type] || COLORS.other }}
              />
              <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                {getTypeLabel(type)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {formatPercentage(percentage)}
              </span>
              <span className="text-sm ml-3" style={{ color: 'var(--text-primary)' }}>
                {formatCurrency(value)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Total Invested */}
      <div className="mt-6 pt-4" style={{ borderTop: '1px solid var(--border-primary)' }}>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            {t('total.invested')}
          </span>
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            {formatCurrency(summary.totalInvested)}
          </span>
        </div>
      </div>
    </div>
  );
}
