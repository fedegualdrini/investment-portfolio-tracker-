import React from 'react';
import { PieChart, BarChart3 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useCurrency } from '../contexts/CurrencyContext';
import type { PortfolioSummary, InvestmentType } from '../types/investment';

interface PortfolioStatsProps {
  summary: PortfolioSummary;
}

export function PortfolioStats({ summary }: PortfolioStatsProps) {
  const { t } = useLanguage();
  const { formatCurrency } = useCurrency();

  const formatPercentage = (percentage: number) => {
    return `${percentage.toFixed(1)}%`;
  };

  const getTypeColor = (type: InvestmentType) => {
    const colors = {
      crypto: 'bg-orange-500',
      stock: 'bg-purple-500',
      bond: 'bg-blue-500',
      etf: 'bg-green-500',
      commodity: 'bg-yellow-500',
      cash: 'bg-emerald-500',
      other: 'bg-gray-500',
    };
    return colors[type] || colors.other;
  };

  const getTypeLabel = (type: InvestmentType) => {
    const labels = {
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

  const allocationData = Object.entries(summary.investmentsByType).map(([type, value]) => ({
    type: type as InvestmentType,
    value,
    percentage: summary.totalValue > 0 ? (value / summary.totalValue) * 100 : 0,
  }));

  if (summary.totalValue === 0) {
    return null;
  }

  return (
    <div className="brand-card p-6">
      <div className="flex items-center space-x-2 mb-6">
        <PieChart className="h-5 w-5 text-purple-600 dark:text-purple-400" />
        <h2 className="brand-heading-sm">{t('portfolio.allocation')}</h2>
      </div>

      <div className="space-y-4">
        {allocationData.map(({ type, value, percentage }) => (
          <div key={type} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${getTypeColor(type)}`} />
              <span className="brand-text-sm">
                {getTypeLabel(type)}
              </span>
            </div>
            <div className="text-right">
              <p className="brand-text-sm">
                {formatCurrency(value)}
              </p>
              <p className="brand-subtext-xs">
                {formatPercentage(percentage)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
        <div className="flex justify-between items-center">
          <span className="brand-text-sm">{t('total.invested')}</span>
          <span className="brand-text-sm">
            {formatCurrency(summary.totalInvested)}
          </span>
        </div>
      </div>
    </div>
  );
}