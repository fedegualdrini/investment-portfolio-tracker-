import React from 'react';
import { ArrowLeft, PieChart, TrendingUp, Calendar, DollarSign, Clock, RefreshCw, ChevronDown, ChevronRight } from 'lucide-react';
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
  const bondPortfolioSummary = React.useMemo(() => {
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center space-x-4 mb-8">
            <button
              onClick={onBack}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="brand-heading-lg">{t('bond.analysis')}</h1>
              <p className="brand-subtext">{t('bond.analysis.subtitle')}</p>
            </div>
          </div>

          {/* Empty State */}
          <div className="text-center py-16">
            <DollarSign className="mx-auto h-16 w-16 text-purple-400 dark:text-purple-500 mb-6" />
            <h3 className="brand-heading-md mb-3">No Bond Investments Found</h3>
            <p className="brand-subtext mb-6">
              Add bonds to your portfolio to access advanced bond analysis, cash flow projections, and yield optimization tools.
            </p>
            <div className="flex justify-center space-x-4">
                              <button
                  onClick={onBack}
                  className="brand-button-primary px-6 py-3"
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={onBack}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
                      <div>
              <h1 className="brand-heading-lg">{t('bond.analysis')}</h1>
              <p className="brand-subtext">{t('bond.analysis.subtitle')}</p>
            </div>
        </div>

        {/* Bond Portfolio Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="brand-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="brand-subtext-sm">{t('total.value')}</p>
                <p className="brand-heading-md">
                  {formatCurrency(bondPortfolioSummary!.totalValue)}
                </p>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <DollarSign className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          <div className="brand-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="brand-subtext-sm">{t('total.gain.loss')}</p>
                <p className={`brand-heading-md ${getGainLossColor(bondPortfolioSummary!.totalGainLoss)}`}>
                  {formatCurrency(bondPortfolioSummary!.totalGainLoss)}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${bondPortfolioSummary!.totalGainLoss >= 0 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                <TrendingUp className={`h-6 w-6 ${bondPortfolioSummary!.totalGainLoss >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} />
              </div>
            </div>
          </div>

          <div className="brand-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="brand-subtext-sm">{t('gain.loss.percentage')}</p>
                <p className={`brand-heading-md ${getGainLossColor(bondPortfolioSummary!.totalGainLossPercentage)}`}>
                  {formatPercentage(bondPortfolioSummary!.totalGainLossPercentage)}
                </p>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <PieChart className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          <div className="brand-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="brand-subtext-sm">{t('annual.income')}</p>
                <p className="brand-heading-md">
                  {formatCurrency(bondPortfolioSummary!.totalAnnualIncome)}
                </p>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Bond Cash Flow Component */}
        <BondCashFlow investments={bondInvestments} />
      </div>
    </div>
  );
}
