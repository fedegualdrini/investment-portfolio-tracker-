
import { useMemo } from 'react';
import { PieChart, TrendingUp, Calendar, DollarSign } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { BondCashFlow } from '../components/BondCashFlow';
import type { Investment } from '../types/investment';

interface BondAnalysisPageProps {
  investments: Investment[];
  onBack: () => void;
}

export function BondAnalysisPage({ investments, onBack }: BondAnalysisPageProps) {
  const { t } = useLanguage();
  const { formatCurrency } = useCurrency();

  // Filter only bond investments
  const bondInvestments = investments.filter(inv => inv.type === 'bond');

  const formatPercentage = (percentage: number) => {
    return `${percentage.toFixed(1)}%`;
  };

  // Calculate bond portfolio summary
  const bondPortfolioSummary = useMemo(() => {
    if (bondInvestments.length === 0) return null;

    const totalValue = bondInvestments.reduce((sum, inv) => {
      const currentPrice = inv.currentPrice || inv.purchasePrice;
      return sum + (currentPrice * inv.quantity);
    }, 0);

    const totalInvested = bondInvestments.reduce((sum, inv) => {
      return sum + (inv.purchasePrice * inv.quantity);
    }, 0);

    const totalGainLoss = totalValue - totalInvested;
    const totalGainLossPercentage = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;

    const totalAnnualIncome = bondInvestments.reduce((sum, inv) => {
      if (inv.fixedYield && inv.faceValue) {
        return sum + (inv.faceValue * inv.quantity * inv.fixedYield / 100);
      }
      return sum + (inv.purchasePrice * inv.quantity * (inv.fixedYield || 0) / 100);
    }, 0);

    return {
      totalValue,
      totalInvested,
      totalGainLoss,
      totalGainLossPercentage,
      totalAnnualIncome,
      bondCount: bondInvestments.length
    };
  }, [bondInvestments]);

  const getGainLossColor = (value: number) => {
    if (value > 0) return 'text-emerald-500';
    if (value < 0) return 'text-red-500';
    return '';
  };

  const getGainLossStyle = (value: number) => {
    if (value === 0) return { color: 'var(--text-muted)' };
    return {};
  };

  if (bondInvestments.length === 0) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Empty State */}
        <div className="glass-card p-8 text-center max-w-md mx-auto">
          <DollarSign className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-emerald-500 mb-4 sm:mb-6" />
          <h3 className="text-lg sm:text-xl font-semibold gradient-text mb-2 sm:mb-3">{t('no.bond.investments.title')}</h3>
          <p className="text-sm sm:text-base mb-4 sm:mb-6 px-4" style={{ color: 'var(--text-secondary)' }}>
            {t('no.bond.investments.subtitle')}
          </p>
          <div className="flex justify-center">
            <button
              onClick={onBack}
              className="gradient-btn px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base"
            >
              {t('back.to.portfolio')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Bond Portfolio Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('total.value')}</p>
              <p className="text-xl font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                {formatCurrency(bondPortfolioSummary!.totalValue)}
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-emerald-500/10 rounded-lg flex-shrink-0">
              <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-500" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('total.gain.loss')}</p>
              <p className={`text-xl font-bold truncate ${getGainLossColor(bondPortfolioSummary!.totalGainLoss)}`} style={getGainLossStyle(bondPortfolioSummary!.totalGainLoss)}>
                {formatCurrency(bondPortfolioSummary!.totalGainLoss)}
              </p>
            </div>
            <div className={`p-2 sm:p-3 rounded-lg flex-shrink-0 ${bondPortfolioSummary!.totalGainLoss >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
              <TrendingUp className={`h-5 w-5 sm:h-6 sm:w-6 ${bondPortfolioSummary!.totalGainLoss >= 0 ? 'text-emerald-500' : 'text-red-500'}`} />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('gain.loss.percentage')}</p>
              <p className={`text-xl font-bold truncate ${getGainLossColor(bondPortfolioSummary!.totalGainLossPercentage)}`} style={getGainLossStyle(bondPortfolioSummary!.totalGainLossPercentage)}>
                {formatPercentage(bondPortfolioSummary!.totalGainLossPercentage)}
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-emerald-500/10 rounded-lg flex-shrink-0">
              <PieChart className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-500" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('annual.income')}</p>
              <p className="text-xl font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                {formatCurrency(bondPortfolioSummary!.totalAnnualIncome)}
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-emerald-500/10 rounded-lg flex-shrink-0">
              <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Bond Cash Flow Component */}
      <BondCashFlow investments={bondInvestments} />
    </div>
  );
}
