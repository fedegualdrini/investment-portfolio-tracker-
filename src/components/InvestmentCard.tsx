import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Trash2, Edit3, BarChart3, X } from 'lucide-react';
import type { Investment } from '../types/investment';
import { useLanguage } from '../contexts/LanguageContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { PriceChart } from './PriceChart';

// Type color mapping
const TYPE_COLORS: Record<string, string> = {
  crypto: '#F97316',
  stock: '#8B5CF6',
  bond: '#3B82F6',
  etf: '#10B981',
  commodity: '#F59E0B',
  cash: '#14B8A6',
  other: '#6B7280',
};

// Type badge class mapping
const TYPE_BADGE: Record<string, string> = {
  crypto: 'badge-crypto',
  stock: 'badge-stock',
  bond: 'badge-bond',
  etf: 'badge-etf',
  commodity: 'badge-commodity',
  cash: 'badge-cash',
  other: 'badge-other',
};

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

  const typeColor = TYPE_COLORS[investment.type] || TYPE_COLORS.other;
  const typeBadge = TYPE_BADGE[investment.type] || TYPE_BADGE.other;

  return (
    <>
      {/* Investment Card */}
      <div
        className="glass-card group cursor-pointer animate-fade-in-up"
        style={{ borderLeft: `4px solid ${typeColor}` }}
        onClick={() => setShowModal(true)}
      >
        <div className="p-4 sm:p-5">
          {/* Top row: Symbol + Badge + Actions */}
          <div className="flex items-start justify-between mb-1">
            <div className="flex items-center gap-2 min-w-0">
              <h3
                className="font-semibold text-base sm:text-lg truncate"
                style={{ color: 'var(--text-primary)' }}
              >
                {investment.symbol}
              </h3>
              <span className={`${typeBadge} flex-shrink-0`}>
                {investment.type.toUpperCase()}
              </span>
            </div>
            {/* Action buttons — visible only on hover */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="btn-icon"
                title={t('edit')}
                aria-label={t('edit')}
              >
                <Edit3 className="h-4 w-4" />
              </button>
              {(investment.type === 'stock' || investment.type === 'crypto') && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowChart(true);
                  }}
                  className="btn-icon"
                  title={t('view.chart')}
                  aria-label={t('view.chart')}
                >
                  <BarChart3 className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
                className="btn-icon hover:!text-red-500"
                title={t('remove')}
                aria-label={t('remove')}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Name */}
          <p
            className="text-sm truncate mb-4"
            style={{ color: 'var(--text-muted)' }}
          >
            {investment.name}
          </p>

          {/* Key metrics */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {t('current.price')}
              </span>
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                {investment.type === 'cash' && investment.currency && investment.currency !== 'USD'
                  ? `${investment.currency} ${currentPrice.toLocaleString()}`
                  : formatCurrency(currentPrice)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {t('total.gain.loss')}
              </span>
              <div className="flex items-center gap-1">
                {gainLoss !== 0 &&
                  (gainLoss > 0 ? (
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                  ))}
                <span
                  className={`text-sm font-semibold ${
                    gainLoss > 0
                      ? 'text-emerald-500'
                      : gainLoss < 0
                        ? 'text-red-500'
                        : ''
                  }`}
                  style={gainLoss === 0 ? { color: 'var(--text-muted)' } : undefined}
                >
                  {gainLoss >= 0 ? '+' : ''}
                  {formatCurrency(gainLoss)} ({formatPercentage(gainLossPercentage)})
                </span>
              </div>
            </div>
          </div>

          {/* Bottom row: quantity + total */}
          <div
            className="mt-4 pt-3 flex items-center justify-between text-xs"
            style={{ borderTop: '1px solid var(--border-primary)' }}
          >
            <span style={{ color: 'var(--text-secondary)' }}>
              {t('quantity')}: {investment.quantity.toLocaleString()}
            </span>
            <span
              className="h-3 w-px mx-2"
              style={{ background: 'var(--border-primary)' }}
            />
            <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
              {t('total.value')}: {formatCurrency(totalValue)}
            </span>
          </div>

          {/* Timestamp */}
          {investment.lastUpdated && (
            <p
              className="mt-2 text-[10px]"
              style={{ color: 'var(--text-muted)' }}
            >
              Updated: {new Date(investment.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>
      </div>

      {/* ============================
          Investment Detail Modal
         ============================ */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowModal(false)}
        >
          <div
            className="relative w-full max-w-4xl max-h-[90vh] overflow-auto glass-card rounded-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top gradient accent bar */}
            <div
              className="h-1 w-full rounded-t-2xl"
              style={{
                background: `linear-gradient(90deg, ${typeColor}, ${typeColor}88)`,
              }}
            />

            {/* Modal Header */}
            <div
              className="sticky top-0 px-6 sm:px-8 py-5 flex items-center justify-between"
              style={{
                background: 'var(--bg-card)',
                borderBottom: '1px solid var(--border-primary)',
              }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div>
                  <div className="flex items-center gap-2">
                    <h2
                      className="text-xl sm:text-2xl font-bold truncate"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {investment.symbol}
                    </h2>
                    <span className={`${typeBadge} flex-shrink-0`}>
                      {investment.type.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                    {investment.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="btn-icon flex-shrink-0"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="px-6 sm:px-8 py-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column — Key Metrics */}
                <div className="space-y-6">
                  <div className="glass-card-static rounded-xl p-5">
                    <h3
                      className="text-sm font-semibold uppercase tracking-wider mb-4"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      Key Metrics
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {t('quantity')}
                        </span>
                        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {investment.quantity.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {t('purchase.price')}
                        </span>
                        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {formatCurrency(investment.purchasePrice)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {t('current.price')}
                        </span>
                        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {investment.type === 'cash' && investment.currency && investment.currency !== 'USD'
                            ? `${investment.currency} ${currentPrice.toLocaleString()}`
                            : formatCurrency(currentPrice)}
                        </span>
                      </div>
                      <div
                        className="flex justify-between items-center pt-3"
                        style={{ borderTop: '1px solid var(--border-primary)' }}
                      >
                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {t('total.value')}
                        </span>
                        <span className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                          {formatCurrency(totalValue)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="glass-card-static rounded-xl p-5">
                    <h3
                      className="text-sm font-semibold uppercase tracking-wider mb-4"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      Performance
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          Total Invested
                        </span>
                        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {formatCurrency(totalInvested)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {t('total.gain.loss')}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {gainLoss !== 0 &&
                            (gainLoss > 0 ? (
                              <TrendingUp className="h-4 w-4 text-emerald-500" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-red-500" />
                            ))}
                          <span
                            className={`text-sm font-semibold ${
                              gainLoss > 0
                                ? 'text-emerald-500'
                                : gainLoss < 0
                                  ? 'text-red-500'
                                  : ''
                            }`}
                            style={gainLoss === 0 ? { color: 'var(--text-muted)' } : undefined}
                          >
                            {formatCurrency(gainLoss)}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          Gain/Loss %
                        </span>
                        <span
                          className={`text-sm font-semibold ${
                            gainLoss > 0
                              ? 'text-emerald-500'
                              : gainLoss < 0
                                ? 'text-red-500'
                                : ''
                          }`}
                          style={gainLoss === 0 ? { color: 'var(--text-muted)' } : undefined}
                        >
                          {formatPercentage(gainLossPercentage)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column — Additional Details */}
                <div className="space-y-6">
                  {investment.fixedYield && (
                    <div className="glass-card-static rounded-xl p-5">
                      <h3
                        className="text-sm font-semibold uppercase tracking-wider mb-4"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        Yield Information
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            {t('fixed.yield').split('(')[0].trim()}
                          </span>
                          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                            {investment.fixedYield}% p.a.
                          </span>
                        </div>
                        {investment.faceValue && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                              Face Value
                            </span>
                            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                              {formatCurrency(investment.faceValue)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {investment.type === 'bond' && (
                    <div className="glass-card-static rounded-xl p-5">
                      <h3
                        className="text-sm font-semibold uppercase tracking-wider mb-4"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        Bond Details
                      </h3>
                      <div className="space-y-3">
                        {investment.paymentFrequency && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                              {t('payment.frequency')}
                            </span>
                            <span
                              className="text-sm font-semibold capitalize"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {investment.paymentFrequency.replace('-', ' ')}
                            </span>
                          </div>
                        )}
                        {investment.maturityDate && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                              Maturity Date
                            </span>
                            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                              {new Date(investment.maturityDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        {investment.nextPaymentDate && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                              Next Payment
                            </span>
                            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                              {new Date(investment.nextPaymentDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {investment.type === 'cash' && investment.currency && investment.currency !== 'USD' && (
                    <div className="glass-card-static rounded-xl p-5">
                      <h3
                        className="text-sm font-semibold uppercase tracking-wider mb-4"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        Currency Details
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            Currency
                          </span>
                          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                            {investment.currency}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            Local Value
                          </span>
                          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                            {investment.currency} {currentPrice.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            USD Value
                          </span>
                          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                            {formatCurrency(totalValue)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {investment.lastUpdated && (
                    <div className="glass-card-static rounded-xl p-5">
                      <h3
                        className="text-sm font-semibold uppercase tracking-wider mb-4"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {t('last.update')}
                      </h3>
                      <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                        {new Date(investment.lastUpdated).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div
                className="flex justify-end gap-3 mt-8 pt-6"
                style={{ borderTop: '1px solid var(--border-primary)' }}
              >
                <button
                  onClick={() => {
                    setShowModal(false);
                    setTimeout(() => {
                      onEdit();
                    }, 100);
                  }}
                  className="gradient-btn"
                >
                  {t('edit')} {t('investment')}
                </button>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setTimeout(() => {
                      onRemove();
                    }, 100);
                  }}
                  className="btn-danger px-5 py-2.5"
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
