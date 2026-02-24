import React, { useMemo, useState, useCallback } from 'react';
import { Calendar, DollarSign, TrendingUp, Clock, RefreshCw, ChevronDown, ChevronRight } from 'lucide-react';
import type { Investment, PaymentEvent } from '../types/investment';
import { BondAnalysisService } from '../services/bondAnalysisService';
import { useLanguage } from '../contexts/LanguageContext';
import { useCurrency } from '../contexts/CurrencyContext';

interface BondCashFlowProps {
  investments: Investment[];
}

interface CashFlowSummary {
  nextPayment: PaymentEvent | null;
  monthlyIncome: number;
  quarterlyIncome: number;
  annualIncome: number;
  upcomingPayments: PaymentEvent[];
}

export function BondCashFlow({ investments }: BondCashFlowProps) {
  const { t } = useLanguage();
  const { formatCurrency } = useCurrency();

  const [refreshKey, setRefreshKey] = useState(0);
  const [collapsedSections, setCollapsedSections] = useState({
    cashFlowSummary: false,
    nextPayment: false,
    upcomingPayments: false,
    bondHoldings: false
  });

  const bondAnalysisService = useMemo(() => {
    const service = new BondAnalysisService();
    // Clear all cached data to ensure we use the latest smart detection logic
    service.clearAllCache();
    return service;
  }, [refreshKey]);

  const handleClearCache = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  const toggleSection = useCallback((section: keyof typeof collapsedSections) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

  const bondInvestments = investments.filter(inv => inv.type === 'bond' && inv.fixedYield);

  // Create a dependency key that includes all relevant bond properties
  // This ensures all bond sections update when ANY bond property changes
  const bondDependencyKey = useMemo(() => {
    return bondInvestments.map(inv =>
      `${inv.id}-${inv.fixedYield}-${inv.paymentFrequency}-${inv.maturityDate}-${inv.faceValue}-${inv.quantity}-${inv.purchasePrice}`
    ).join('|');
  }, [bondInvestments]);

  const cashFlowSummary = useMemo((): CashFlowSummary => {
    if (bondInvestments.length === 0) {
      return {
        nextPayment: null,
        monthlyIncome: 0,
        quarterlyIncome: 0,
        annualIncome: 0,
        upcomingPayments: []
      };
    }

    let allPayments: PaymentEvent[] = [];
    let totalAnnualIncome = 0;

    bondInvestments.forEach(investment => {
      const payments = bondAnalysisService.generatePaymentSchedule(investment, 12);
      allPayments = [...allPayments, ...payments];

      // Calculate annual income
      const bondInfo = bondAnalysisService.analyzeBond(investment);
      totalAnnualIncome += bondInfo.paymentAmount * bondInfo.totalAnnualPayments;
    });

    // Sort payments by date
    allPayments.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Find next payment
    const now = new Date();
    const nextPayment = allPayments.find(payment => new Date(payment.date) > now) || null;

    // Calculate income estimates
    const monthlyIncome = totalAnnualIncome / 12;
    const quarterlyIncome = totalAnnualIncome / 4;

    return {
      nextPayment,
      monthlyIncome,
      quarterlyIncome,
      annualIncome: totalAnnualIncome,
      upcomingPayments: allPayments.slice(0, 6) // Next 6 payments
    };
  }, [bondInvestments, bondAnalysisService, bondDependencyKey, refreshKey]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysUntil = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getTranslatedFrequency = (frequency: string) => {
    const frequencyMap: Record<string, string> = {
      'monthly': t('frequency.monthly'),
      'quarterly': t('frequency.quarterly'),
      'semi-annual': t('frequency.semi.annual'),
      'annual': t('frequency.annual'),
      'zero-coupon': t('frequency.zero.coupon'),
      'unknown': t('frequency.unknown')
    };
    return frequencyMap[frequency] || frequency;
  };

  if (bondInvestments.length === 0) {
    return (
      <div className="glass-card p-4 sm:p-6">
        <div className="text-center py-6 sm:py-8">
          <DollarSign className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-emerald-500 mb-3 sm:mb-4" />
          <h3 className="text-base sm:text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>{t('no.bond.investments')}</h3>
          <p className="text-sm sm:text-base" style={{ color: 'var(--text-secondary)' }}>{t('add.bonds.message')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Cash Flow Summary */}
      <div className="glass-card cursor-pointer">
        <div
          className="p-4 sm:p-6"
          onClick={() => toggleSection('cashFlowSummary')}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              <h2 className="text-base sm:text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{t('bond.cash.flow')}</h2>
              {collapsedSections.cashFlowSummary ? (
                <ChevronRight className="h-5 w-5" style={{ color: 'var(--text-muted)' }} />
              ) : (
                <ChevronDown className="h-5 w-5" style={{ color: 'var(--text-muted)' }} />
              )}
            </div>
            <div className="flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={handleClearCache}
                className="gradient-btn flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 text-xs sm:text-sm"
                title="Clear cache and recalculate payment dates"
                aria-label="Clear cache and recalculate payment dates"
              >
                <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">{t('refresh.calculations')}</span>
                <span className="sm:hidden">Refresh</span>
              </button>
              <button
                onClick={() => {
                  console.log('DEBUG: Smart Detection Results');
                  bondInvestments.forEach(inv => {
                    console.log(`\n${inv.symbol}:`);
                    console.log('  Maturity:', inv.maturityDate);
                    console.log('  User Frequency:', inv.paymentFrequency);

                    // Test smart detection directly
                    const maturityDate = new Date(inv.maturityDate + 'T12:00:00');
                    console.log('  Parsed Maturity Day:', maturityDate.getDate());

                    const bondInfo = bondAnalysisService.analyzeBond(inv);
                    console.log('  Calculated Next Payment:', bondInfo.nextPaymentDate);
                    console.log('  Confidence:', Math.round(bondInfo.confidence * 100) + '%');
                  });
                }}
                className="btn-ghost flex items-center space-x-1 px-2 py-2 text-xs rounded"
                title="Debug payment calculations (check console)"
              >
                <span>{t('debug')}</span>
              </button>
            </div>
          </div>

          {!collapsedSections.cashFlowSummary && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div className="glass-card-static p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-emerald-500">{t('monthly.income')}</p>
                    <p className="text-lg sm:text-2xl font-bold text-emerald-500 truncate">
                      {formatCurrency(cashFlowSummary.monthlyIncome)}
                    </p>
                  </div>
                  <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-500 flex-shrink-0" />
                </div>
              </div>

              <div className="glass-card-static p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-cyan-500">{t('quarterly.income')}</p>
                    <p className="text-lg sm:text-2xl font-bold text-cyan-500 truncate">
                      {formatCurrency(cashFlowSummary.quarterlyIncome)}
                    </p>
                  </div>
                  <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-cyan-500 flex-shrink-0" />
                </div>
              </div>

              <div className="glass-card-static p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium" style={{ color: 'var(--accent-primary)' }}>{t('annual.income')}</p>
                    <p className="text-lg sm:text-2xl font-bold truncate" style={{ color: 'var(--accent-primary)' }}>
                      {formatCurrency(cashFlowSummary.annualIncome)}
                    </p>
                  </div>
                  <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0" style={{ color: 'var(--accent-primary)' }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Next Payment Alert */}
      {cashFlowSummary.nextPayment && (
        <div className="glass-card-static cursor-pointer" style={{ borderColor: 'var(--accent-primary)' }}>
          <div
            className="p-3 sm:p-4"
            onClick={() => toggleSection('nextPayment')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-500 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <h3 className="text-xs sm:text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{t('next.payment')}</h3>
                  <p className="text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <strong>{formatCurrency(cashFlowSummary.nextPayment.amount)}</strong> on{' '}
                    <strong>{formatDate(cashFlowSummary.nextPayment.date)}</strong>
                    {getDaysUntil(cashFlowSummary.nextPayment.date) > 0 && (
                      <span className="text-cyan-500">
                        {' '}({getDaysUntil(cashFlowSummary.nextPayment.date)} {t('days')})
                      </span>
                    )}
                  </p>
                </div>
              </div>
              {collapsedSections.nextPayment ? (
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
              ) : (
                <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Payments Schedule */}
      <div className="glass-card cursor-pointer">
        <div
          className="p-4 sm:p-6"
          onClick={() => toggleSection('upcomingPayments')}
        >
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-base sm:text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{t('upcoming.payments')}</h3>
            {collapsedSections.upcomingPayments ? (
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: 'var(--text-muted)' }} />
            ) : (
              <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: 'var(--text-muted)' }} />
            )}
          </div>

          {!collapsedSections.upcomingPayments && (
            <>
              {cashFlowSummary.upcomingPayments.length > 0 ? (
                <div className="space-y-2 sm:space-y-3">
                  {cashFlowSummary.upcomingPayments.map((payment, index) => {
                    const daysUntil = getDaysUntil(payment.date);
                    const isOverdue = daysUntil < 0;
                    const isUpcoming = daysUntil <= 30 && daysUntil >= 0;

                    return (
                      <div
                        key={index}
                        className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-2 sm:p-3 rounded-lg border transition-colors gap-2 sm:gap-0 ${
                          isOverdue
                            ? 'bg-red-500/10 border-red-500/20'
                            : isUpcoming
                            ? 'bg-amber-500/10 border-amber-500/20'
                            : 'glass-card-static'
                        }`}
                        style={!isOverdue && !isUpcoming ? { borderColor: 'var(--border-primary)' } : {}}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm sm:text-base font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                            {payment.description.replace('coupon payment', t('coupon.payment'))}
                          </p>
                          <p className={`text-xs sm:text-sm ${
                            isOverdue
                              ? 'text-red-500'
                              : isUpcoming
                              ? 'text-amber-500'
                              : ''
                          }`} style={!isOverdue && !isUpcoming ? { color: 'var(--text-muted)' } : {}}>
                            {formatDate(payment.date)}
                            {daysUntil >= 0 ? ` (${daysUntil} ${t('days')})` : ` (${Math.abs(daysUntil)} ${t('days.overdue')})`}
                          </p>
                        </div>
                        <div className="text-left sm:text-right flex-shrink-0">
                          <p className="text-sm sm:text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                            {formatCurrency(payment.amount)}
                          </p>
                          <p className="text-xs sm:text-sm capitalize" style={{ color: 'var(--text-muted)' }}>
                            {payment.type === 'coupon' ? t('coupon') : payment.type}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center py-4" style={{ color: 'var(--text-muted)' }}>
                  {t('no.upcoming.payments')}
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Bond Holdings Summary */}
      <div className="glass-card cursor-pointer">
        <div
          className="p-4 sm:p-6"
          onClick={() => toggleSection('bondHoldings')}
        >
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-base sm:text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{t('bond.holdings')}</h3>
            {collapsedSections.bondHoldings ? (
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: 'var(--text-muted)' }} />
            ) : (
              <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: 'var(--text-muted)' }} />
            )}
          </div>

          {!collapsedSections.bondHoldings && (
            <div className="space-y-2 sm:space-y-3">
              {bondInvestments.map((investment) => {
                const bondInfo = bondAnalysisService.analyzeBond(investment);
                const annualIncome = bondInfo.paymentAmount * bondInfo.totalAnnualPayments;

                return (
                  <div
                    key={investment.id}
                    className="glass-card-static p-2 sm:p-3"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm sm:text-base font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                          {investment.symbol} - {investment.name}
                        </p>
                        <p className="text-xs sm:text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                          {investment.fixedYield}% &bull; {getTranslatedFrequency(bondInfo.paymentFrequency)}
                        </p>
                        {bondInfo.nextPaymentDate && (
                          <p className="text-xs sm:text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                            {t('next.payment')}: {formatDate(bondInfo.nextPaymentDate)}
                          </p>
                        )}
                      </div>
                      <div className="text-left sm:text-right flex-shrink-0">
                        <p className="text-sm sm:text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {formatCurrency(annualIncome)}/{t('annual.income').toLowerCase()}
                        </p>
                        <p className="text-xs sm:text-sm" style={{ color: 'var(--text-muted)' }}>
                          {formatCurrency(bondInfo.paymentAmount)} {t('per.payment')}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
