
import { useMemo } from 'react';
import { ArrowLeft, PieChart, TrendingUp, Calendar, DollarSign, Clock, RefreshCw, ChevronDown, ChevronRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { BondCashFlow } from '../components/BondCashFlow';
import { PremiumGate } from '../components/subscription/PremiumGate';
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
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  if (bondInvestments.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          {/* Header */}
          <div className="flex items-center space-x-3 sm:space-x-4 mb-6 sm:mb-8">
            <button
              onClick={onBack}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="mobile-title brand-heading">{t('bond.analysis')}</h1>
              <p className="mobile-subtitle brand-subtext">{t('bond.analysis.subtitle')}</p>
            </div>
          </div>

          {/* Empty State */}
          <div className="text-center py-8 sm:py-16">
            <DollarSign className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-purple-400 dark:text-purple-500 mb-4 sm:mb-6" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2 sm:mb-3">{t('no.bond.investments.title')}</h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 px-4">
              {t('no.bond.investments.subtitle')}
            </p>
            <div className="flex justify-center">
              <button
                onClick={onBack}
                className="brand-button-primary px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base"
              >
                {t('back.to.portfolio')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PremiumGate>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="flex items-center space-x-3 sm:space-x-4 mb-6 sm:mb-8">
          <button
            onClick={onBack}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="mobile-title brand-heading">{t('bond.analysis')}</h1>
            <p className="mobile-subtitle brand-subtext">{t('bond.analysis.subtitle')}</p>
          </div>
        </div>

        {/* Bond Portfolio Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="brand-card p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="brand-subtext-sm">{t('total.value')}</p>
                <p className="brand-heading-md truncate">
                  {formatCurrency(bondPortfolioSummary!.totalValue)}
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
                <p className={`brand-heading-md truncate ${getGainLossColor(bondPortfolioSummary!.totalGainLoss)}`}>
                  {formatCurrency(bondPortfolioSummary!.totalGainLoss)}
                </p>
              </div>
              <div className={`p-2 sm:p-3 rounded-lg flex-shrink-0 ${bondPortfolioSummary!.totalGainLoss >= 0 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                <TrendingUp className={`h-5 w-5 sm:h-6 sm:w-6 ${bondPortfolioSummary!.totalGainLoss >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} />
              </div>
            </div>
          </div>

          <div className="brand-card p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="brand-subtext-sm">{t('gain.loss.percentage')}</p>
                <p className={`brand-heading-md truncate ${getGainLossColor(bondPortfolioSummary!.totalGainLossPercentage)}`}>
                  {formatPercentage(bondPortfolioSummary!.totalGainLossPercentage)}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg flex-shrink-0">
                <PieChart className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          <div className="brand-card p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="brand-subtext-sm">{t('annual.income')}</p>
                <p className="brand-heading-md truncate">
                  {formatCurrency(bondPortfolioSummary!.totalAnnualIncome)}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg flex-shrink-0">
                <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Bond Cash Flow Component */}
        <BondCashFlow investments={bondInvestments} />
        </div>
      </div>
    </PremiumGate>
  );
}
