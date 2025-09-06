import React, { useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, RefreshCw } from 'lucide-react';
import type { Investment, PortfolioSummary } from '../types/investment';
import { InvestmentCard } from './InvestmentCard';
import { useLanguage } from '../contexts/LanguageContext';
import { useCurrency } from '../contexts/CurrencyContext';

interface DashboardProps {
  investments: Investment[];
  summary: PortfolioSummary;
  onUpdatePrices: () => void;
  onRemoveInvestment: (id: string) => void;
  onEditInvestment: (id: string) => void;
  isLoading: boolean;
  lastUpdate: Date | null;
}

export function Dashboard({
  investments,
  summary,
  onUpdatePrices,
  onRemoveInvestment,
  onEditInvestment,
  isLoading,
  lastUpdate,
}: DashboardProps) {
  const { t } = useLanguage();
  const { formatCurrency } = useCurrency();
  
  
  // Auto-update prices every 5 minutes
  useEffect(() => {
    if (investments.length === 0) return;

    const interval = setInterval(() => {
      onUpdatePrices();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [investments.length, onUpdatePrices]);

  const formatPercentage = (percentage: number) => {
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`;
  };

  const getGainLossColor = (value: number) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  if (investments.length === 0) {
    return (
      <div className="text-center py-12">
        <DollarSign className="mx-auto h-12 w-12 text-purple-400 dark:text-purple-500 mb-4" />
        <h3 className="brand-heading-sm mb-2">{t('no.investments')}</h3>
        <p className="brand-subtext">{t('add.first.investment')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="brand-card p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="brand-subtext-sm">{t('total.value')}</p>
              <p className="brand-heading-lg truncate">
                {formatCurrency(summary.totalValue)}
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg flex-shrink-0">
              <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="brand-card p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="brand-subtext-sm">{t('total.gain.loss')}</p>
              <p className={`brand-heading-lg truncate ${getGainLossColor(summary.totalGainLoss)}`}>
                {formatCurrency(summary.totalGainLoss)}
              </p>
            </div>
            <div className={`p-2 sm:p-3 rounded-lg flex-shrink-0 ${summary.totalGainLoss >= 0 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
              {summary.totalGainLoss >= 0 ? (
                <TrendingUp className={`h-5 w-5 sm:h-6 sm:w-6 ${summary.totalGainLoss >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} />
              ) : (
                <TrendingDown className="h-5 w-5 sm:h-6 sm:w-6 text-red-600 dark:text-red-400" />
              )}
            </div>
          </div>
        </div>

        <div className="brand-card p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="brand-subtext-sm">{t('gain.loss.percentage')}</p>
              <p className={`brand-heading-lg truncate ${getGainLossColor(summary.totalGainLossPercentage)}`}>
                {formatPercentage(summary.totalGainLossPercentage)}
              </p>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0">
              <button
                onClick={onUpdatePrices}
                disabled={isLoading}
                className={`p-2 rounded-lg transition-colors ${
                  isLoading
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed'
                    : 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30'
                }`}
                title={t('update.prices')}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
          {lastUpdate && (
            <p className="brand-subtext-xs mt-2">
              {t('last.update')}: {lastUpdate.toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>

      {/* Investments Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {investments.map((investment) => (
          <InvestmentCard
            key={investment.id}
            investment={investment}
            onRemove={() => onRemoveInvestment(investment.id)}
            onEdit={() => onEditInvestment(investment.id)}
          />
        ))}
      </div>
    </div>
  );
}