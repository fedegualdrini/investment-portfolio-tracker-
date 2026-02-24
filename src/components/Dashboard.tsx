import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, DollarSign, RefreshCw, BarChart3, PlusCircle } from 'lucide-react';
import type { Investment, PortfolioSummary } from '../types/investment';
import { InvestmentCard } from './InvestmentCard';
import { LoadingCard } from './LoadingSpinner';
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
    if (value > 0) return 'text-emerald-500';
    if (value < 0) return 'text-red-500';
    return '';
  };

  // Empty state
  if (investments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        {/* Icon composition */}
        <div className="relative mb-8">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(16,185,129,0.1)' }}
          >
            <BarChart3 className="h-10 w-10" style={{ color: 'var(--accent-primary)' }} />
          </div>
          <div
            className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(6,182,212,0.1)' }}
          >
            <DollarSign className="h-5 w-5" style={{ color: 'var(--accent-secondary)' }} />
          </div>
        </div>

        <h3 className="gradient-text text-2xl font-bold mb-2">
          {t('empty.title')}
        </h3>
        <p className="text-base mb-8 max-w-md text-center" style={{ color: 'var(--text-muted)' }}>
          {t('empty.subtitle')}
        </p>
        <Link to="/investment/new" className="gradient-btn inline-flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          {t('empty.cta')}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Card 1: Total Value */}
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                {t('total.value')}
              </p>
              <p className="gradient-text text-2xl sm:text-3xl font-bold truncate">
                {formatCurrency(summary.totalValue)}
              </p>
            </div>
            <div
              className="p-2.5 rounded-xl flex-shrink-0"
              style={{ background: 'rgba(16,185,129,0.1)' }}
            >
              <DollarSign className="h-5 w-5 sm:h-6 sm:w-6" style={{ color: 'var(--accent-primary)' }} />
            </div>
          </div>
        </div>

        {/* Card 2: Total Gain/Loss */}
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                {t('total.gain.loss')}
              </p>
              <p className={`text-2xl sm:text-3xl font-bold truncate ${getGainLossColor(summary.totalGainLoss)}`}
                 style={summary.totalGainLoss === 0 ? { color: 'var(--text-primary)' } : undefined}
              >
                {formatCurrency(summary.totalGainLoss)}
              </p>
            </div>
            <div
              className={`p-2.5 rounded-xl flex-shrink-0 ${
                summary.totalGainLoss >= 0
                  ? 'bg-emerald-500/10 text-emerald-500'
                  : 'bg-red-500/10 text-red-500'
              }`}
            >
              {summary.totalGainLoss >= 0 ? (
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6" />
              ) : (
                <TrendingDown className="h-5 w-5 sm:h-6 sm:w-6" />
              )}
            </div>
          </div>
        </div>

        {/* Card 3: Gain/Loss % */}
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                {t('gain.loss.percentage')}
              </p>
              <p className={`text-2xl sm:text-3xl font-bold truncate ${getGainLossColor(summary.totalGainLossPercentage)}`}
                 style={summary.totalGainLossPercentage === 0 ? { color: 'var(--text-primary)' } : undefined}
              >
                {formatPercentage(summary.totalGainLossPercentage)}
              </p>
            </div>
            <div className="flex-shrink-0">
              <button
                onClick={onUpdatePrices}
                disabled={isLoading}
                className={`btn-icon p-2.5 rounded-xl ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                title={t('update.prices')}
              >
                <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
          {lastUpdate && (
            <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
              {t('last.update')}: {lastUpdate.toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>

      {/* Holdings Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Holdings
          </h2>
          <span
            className="px-2 py-0.5 rounded-full text-xs font-medium"
            style={{
              color: 'var(--accent-primary)',
              background: 'rgba(16,185,129,0.1)',
            }}
          >
            {investments.length}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {isLoading && investments.length === 0 ? (
            // Show loading cards when initially loading
            Array.from({ length: 3 }).map((_, index) => (
              <LoadingCard key={`loading-${index}`} />
            ))
          ) : (
            investments.map((investment) => (
              <InvestmentCard
                key={investment.id}
                investment={investment}
                onRemove={() => onRemoveInvestment(investment.id)}
                onEdit={() => onEditInvestment(investment.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
