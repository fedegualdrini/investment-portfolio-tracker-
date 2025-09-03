import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Trash2, Edit3, BarChart3 } from 'lucide-react';
import type { Investment } from '../types/investment';
import { useLanguage } from '../contexts/LanguageContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { PriceChart } from './PriceChart';

interface InvestmentCardProps {
  investment: Investment;
  onRemove: () => void;
  onEdit: () => void;
}

export function InvestmentCard({ investment, onRemove, onEdit }: InvestmentCardProps) {
  const { t } = useLanguage();
  const { formatCurrency } = useCurrency();
  const [showModal, setShowModal] = useState(false);
  const [showChart, setShowChart] = useState(false);
  
  const currentPrice = investment.currentPrice || investment.purchasePrice;
  const totalValue = currentPrice * investment.quantity;
  const totalInvested = investment.purchasePrice * investment.quantity;
  const gainLoss = totalValue - totalInvested;
  const gainLossPercentage = totalInvested > 0 ? (gainLoss / totalInvested) * 100 : 0;

  const formatPercentage = (percentage: number) => {
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      crypto: 'bg-orange-50 text-orange-600 border-orange-200',
      stock: 'bg-purple-50 text-purple-600 border-purple-200',
      bond: 'bg-blue-50 text-blue-600 border-blue-200',
      etf: 'bg-green-50 text-green-600 border-green-200',
      commodity: 'bg-yellow-50 text-yellow-600 border-yellow-200',
      cash: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      other: 'bg-gray-50 text-gray-600 border-gray-200',
    };
    return colors[type as keyof typeof colors] || colors.other;
  };

  const getGainLossColor = (value: number) => {
    if (value > 0) return 'text-green-600 dark:text-green-400';
    if (value < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  return (
    <>
      <div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 hover:shadow-md hover:shadow-blue-500/20 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 hover:scale-[1.02] cursor-pointer"
        onClick={() => setShowModal(true)}
      >
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">{investment.symbol}</h3>
            <span className={`px-2 py-1 text-xs font-medium rounded-full border flex-shrink-0 ${getTypeColor(investment.type)}`}>
              {investment.type.toUpperCase()}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{investment.name}</p>
        </div>
        <div className="flex items-center space-x-1 flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-200"
            title={t('edit')}
          >
            <Edit3 className="h-4 w-4" />
          </button>
          {(investment.type === 'stock' || investment.type === 'crypto') && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowChart(true);
              }}
              className="p-2 text-gray-400 dark:text-gray-500 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors duration-200"
              title={t('view.chart')}
            >
              <BarChart3 className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
            title={t('remove')}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="brand-subtext-sm">{t('quantity')}</span>
          <span className="brand-text">{investment.quantity.toLocaleString()}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="brand-subtext-sm">{t('purchase.price')}</span>
          <span className="brand-text">{formatCurrency(investment.purchasePrice)}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="brand-subtext-sm">{t('current.price')}</span>
          <span className="brand-text">
            {investment.type === 'cash' && investment.currency && investment.currency !== 'USD' 
              ? `${investment.currency} ${currentPrice.toLocaleString()}`
              : formatCurrency(currentPrice)
            }
          </span>
        </div>

        {investment.type === 'cash' && investment.currency && investment.currency !== 'USD' && (
          <div className="flex justify-between items-center">
            <span className="brand-subtext-sm">Value in USD</span>
            <span className="brand-text">{formatCurrency(totalValue)}</span>
          </div>
        )}

        <hr className="border-gray-200 dark:border-gray-600" />

        <div className="flex justify-between items-center">
          <span className="brand-subtext-sm">{t('total.value')}</span>
          <span className="brand-heading-sm">{formatCurrency(totalValue)}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="brand-subtext-sm">{t('total.gain.loss')}</span>
          <div className="flex items-center space-x-1">
            {gainLoss !== 0 && (
              gainLoss > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
              )
            )}
            <span className={`font-semibold ${getGainLossColor(gainLoss)}`}>
              {formatCurrency(gainLoss)}
            </span>
            <span className={`text-sm ${getGainLossColor(gainLoss)}`}>
              ({formatPercentage(gainLossPercentage)})
            </span>
          </div>
        </div>

        {investment.fixedYield && (
          <div className="flex justify-between items-center">
            <span className="brand-subtext-sm">{t('fixed.yield').split('(')[0].trim()}</span>
            <span className="brand-text">{investment.fixedYield}% p.a.</span>
          </div>
        )}

        {investment.type === 'bond' && investment.paymentFrequency && (
          <div className="flex justify-between items-center">
            <span className="brand-subtext-sm">{t('payment.frequency')}</span>
            <span className="brand-text capitalize">
              {investment.paymentFrequency.replace('-', ' ')}
            </span>
          </div>
        )}

        {investment.type === 'bond' && investment.maturityDate && (
          <div className="flex justify-between items-center">
            <span className="brand-subtext-sm">Maturity</span>
            <span className="brand-text">
              {new Date(investment.maturityDate).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>

      {investment.lastUpdated && (
        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-600">
          <p className="brand-subtext-xs">
            Updated: {new Date(investment.lastUpdated).toLocaleTimeString()}
          </p>
        </div>
      )}
      </div>

      {/* Investment Detail Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="relative w-full max-w-4xl max-h-[90vh] overflow-auto brand-card rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 brand-card px-8 py-6 border-b border-gray-200 dark:border-gray-700 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30">
                    <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {investment.symbol.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h2 className="brand-heading-lg">{investment.symbol}</h2>
                    <p className="brand-text-lg">{investment.name}</p>
                    <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full border ${getTypeColor(investment.type)} mt-2`}>
                      {investment.type.toUpperCase()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="px-8 py-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Key Metrics */}
                <div className="space-y-6">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                    <h3 className="brand-heading mb-4">Key Metrics</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="brand-subtext">{t('quantity')}</span>
                        <span className="brand-heading-sm">{investment.quantity.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="brand-subtext">{t('purchase.price')}</span>
                        <span className="brand-heading-sm">{formatCurrency(investment.purchasePrice)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="brand-subtext">{t('current.price')}</span>
                        <span className="brand-heading-sm">
                          {investment.type === 'cash' && investment.currency && investment.currency !== 'USD' 
                            ? `${investment.currency} ${currentPrice.toLocaleString()}`
                            : formatCurrency(currentPrice)
                          }
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="brand-subtext">{t('total.value')}</span>
                        <span className="brand-heading-lg">{formatCurrency(totalValue)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                    <h3 className="brand-heading mb-4">Performance</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="brand-subtext">Total Invested</span>
                        <span className="brand-heading-sm">{formatCurrency(totalInvested)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="brand-subtext">{t('total.gain.loss')}</span>
                        <div className="flex items-center space-x-2">
                          {gainLoss !== 0 && (
                            gainLoss > 0 ? (
                              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                            ) : (
                              <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
                            )
                          )}
                          <span className={`brand-heading-sm ${getGainLossColor(gainLoss)}`}>
                            {formatCurrency(gainLoss)}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="brand-subtext">Gain/Loss %</span>
                        <span className={`brand-heading-sm ${getGainLossColor(gainLoss)}`}>
                          {formatPercentage(gainLossPercentage)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Additional Details */}
                <div className="space-y-6">
                  {investment.fixedYield && (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                      <h3 className="brand-heading mb-4">Yield Information</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="brand-subtext">{t('fixed.yield').split('(')[0].trim()}</span>
                          <span className="brand-heading-sm">{investment.fixedYield}% p.a.</span>
                        </div>
                        {investment.faceValue && (
                          <div className="flex justify-between items-center">
                            <span className="brand-subtext">Face Value</span>
                            <span className="brand-heading-sm">{formatCurrency(investment.faceValue)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {investment.type === 'bond' && (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                      <h3 className="brand-heading mb-4">Bond Details</h3>
                      <div className="space-y-4">
                        {investment.paymentFrequency && (
                          <div className="flex justify-between items-center">
                            <span className="brand-subtext">{t('payment.frequency')}</span>
                            <span className="brand-heading-sm capitalize">
                              {investment.paymentFrequency.replace('-', ' ')}
                            </span>
                          </div>
                        )}
                        {investment.maturityDate && (
                          <div className="flex justify-between items-center">
                            <span className="brand-subtext">Maturity Date</span>
                            <span className="brand-heading-sm">
                              {new Date(investment.maturityDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        {investment.nextPaymentDate && (
                          <div className="flex justify-between items-center">
                            <span className="brand-subtext">Next Payment</span>
                            <span className="brand-heading-sm">
                              {new Date(investment.nextPaymentDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {investment.type === 'cash' && investment.currency && investment.currency !== 'USD' && (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                      <h3 className="brand-heading mb-4">Currency Details</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="brand-subtext">Currency</span>
                          <span className="brand-heading-sm">{investment.currency}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="brand-subtext">Local Value</span>
                          <span className="brand-heading-sm">{investment.currency} {currentPrice.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="brand-subtext">USD Value</span>
                          <span className="brand-heading-sm">{formatCurrency(totalValue)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {investment.lastUpdated && (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                      <h3 className="brand-heading mb-4">{t('last.update')}</h3>
                      <p className="brand-text">
                        {new Date(investment.lastUpdated).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    setShowModal(false);
                    // Small delay to ensure modal closes before edit form opens
                    setTimeout(() => {
                      onEdit();
                    }, 100);
                  }}
                  className="brand-button-secondary px-6 py-3"
                >
                  {t('edit')} {t('investment')}
                </button>
                <button
                  onClick={() => {
                    setShowModal(false);
                    // Small delay to ensure modal closes before remove action
                    setTimeout(() => {
                      onRemove();
                    }, 100);
                  }}
                  className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                >
                  {t('remove')} {t('investment')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Price Chart Modal */}
      <PriceChart
        investment={investment}
        isVisible={showChart}
        onClose={() => setShowChart(false)}
      />
    </>
  );
}