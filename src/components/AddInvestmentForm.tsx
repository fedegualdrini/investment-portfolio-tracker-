import React, { useState, useEffect } from 'react';
import { Plus, X, AlertCircle, CheckCircle } from 'lucide-react';
import type { Investment, InvestmentType, PaymentFrequency } from '../types/investment';
import { BondAnalysisService } from '../services/bondAnalysisService';
import { useLanguage } from '../contexts/LanguageContext';

interface AddInvestmentFormProps {
  onAdd: (investment: Omit<Investment, 'id'>) => void;
  onCancel: () => void;
}

export function AddInvestmentForm({ onAdd, onCancel }: AddInvestmentFormProps) {
  const { t } = useLanguage();
  
  const [formData, setFormData] = useState({
    symbol: '',
    name: '',
    type: 'stock' as InvestmentType,
    quantity: '',
    purchasePrice: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    fixedYield: '',
    // Enhanced bond fields
    paymentFrequency: 'semi-annual' as PaymentFrequency,
    maturityDate: '',
    faceValue: '',
    lastPaymentDate: '',
    nextPaymentDate: '',
    // Cash fields
    currency: 'USD',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [bondAnalysis, setBondAnalysis] = useState<any>(null);
  const [requiredPaymentField, setRequiredPaymentField] = useState<'lastPayment' | 'nextPayment' | 'none'>('none');
  const bondAnalysisService = new BondAnalysisService();

  const investmentTypes: { value: InvestmentType; label: string }[] = [
    { value: 'crypto', label: t('type.crypto') },
    { value: 'stock', label: t('type.stock') },
    { value: 'etf', label: t('type.etf') },
    { value: 'bond', label: t('type.bond') },
    { value: 'cash', label: t('type.cash') },
    { value: 'commodity', label: t('type.commodity') },
    { value: 'other', label: t('type.other') },
  ];

  const paymentFrequencies: { value: PaymentFrequency; label: string }[] = [
    { value: 'monthly', label: t('frequency.monthly') },
    { value: 'quarterly', label: t('frequency.quarterly') },
    { value: 'semi-annual', label: t('frequency.semi.annual') },
    { value: 'annual', label: t('frequency.annual') },
    { value: 'zero-coupon', label: t('frequency.zero.coupon') },
    { value: 'unknown', label: t('frequency.unknown') },
  ];

  // Determine required payment field based on purchase timing
  useEffect(() => {
    if (formData.type === 'bond' && formData.purchaseDate && formData.maturityDate && formData.paymentFrequency) {
      const required = bondAnalysisService.getRequiredPaymentField(
        formData.purchaseDate,
        formData.maturityDate,
        formData.paymentFrequency
      );
      setRequiredPaymentField(required);
    } else {
      setRequiredPaymentField('none');
    }
  }, [formData.purchaseDate, formData.maturityDate, formData.paymentFrequency, formData.type]);

  // Smart bond analysis when symbol or yield changes (for suggestions only)
  useEffect(() => {
    if (formData.type === 'bond' && formData.symbol && formData.fixedYield) {
      const mockInvestment: Partial<Investment> = {
        symbol: formData.symbol,
        type: 'bond',
        fixedYield: parseFloat(formData.fixedYield),
        purchasePrice: parseFloat(formData.purchasePrice) || 100,
        quantity: parseFloat(formData.quantity) || 1,
        purchaseDate: formData.purchaseDate,
        faceValue: parseFloat(formData.faceValue) || undefined,
      };
      
      const analysis = bondAnalysisService.analyzeBond(mockInvestment as Investment);
      setBondAnalysis(analysis);
      
      // Don't auto-override user input - just show analysis for reference
      // User can manually change payment frequency if they want to use the suggestion
    } else {
      setBondAnalysis(null);
    }
  }, [formData.symbol, formData.fixedYield, formData.type, formData.purchasePrice, formData.quantity, formData.faceValue]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.symbol.trim()) {
      newErrors.symbol = 'Symbol is required';
    }
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }
    if (!formData.purchasePrice || parseFloat(formData.purchasePrice) <= 0) {
      newErrors.purchasePrice = 'Purchase price must be greater than 0';
    }
    if (!formData.purchaseDate) {
      newErrors.purchaseDate = 'Purchase date is required';
    }
    if (formData.type === 'bond' && formData.fixedYield && parseFloat(formData.fixedYield) < 0) {
      newErrors.fixedYield = 'Fixed yield cannot be negative';
    }
    if (formData.type === 'bond' && formData.maturityDate) {
      const maturityDate = new Date(formData.maturityDate);
      const purchaseDate = new Date(formData.purchaseDate);
      if (maturityDate <= purchaseDate) {
        newErrors.maturityDate = 'Maturity date must be after purchase date';
      }
    }
    if (formData.type === 'bond' && formData.faceValue && parseFloat(formData.faceValue) <= 0) {
      newErrors.faceValue = 'Face value must be greater than 0';
    }
    
    // Validate payment date fields based on required field
    if (formData.type === 'bond' && requiredPaymentField === 'lastPayment') {
      if (!formData.lastPaymentDate) {
        newErrors.lastPaymentDate = 'Last payment date is required for bonds purchased after payment cycles';
      } else {
        const lastPayment = new Date(formData.lastPaymentDate);
        const purchase = new Date(formData.purchaseDate);
        if (lastPayment < purchase) {
          newErrors.lastPaymentDate = 'Last payment date cannot be before purchase date';
        }
      }
    }
    
    if (formData.type === 'bond' && requiredPaymentField === 'nextPayment') {
      if (!formData.nextPaymentDate) {
        newErrors.nextPaymentDate = 'Next payment date is required for recently purchased bonds';
      } else {
        const nextPayment = new Date(formData.nextPaymentDate);
        const purchase = new Date(formData.purchaseDate);
        if (nextPayment <= purchase) {
          newErrors.nextPaymentDate = 'Next payment date must be after purchase date';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const investment: Omit<Investment, 'id'> = {
      symbol: formData.symbol.toUpperCase().trim(),
      name: formData.name.trim(),
      type: formData.type,
      quantity: parseFloat(formData.quantity),
      purchasePrice: parseFloat(formData.purchasePrice),
      purchaseDate: formData.purchaseDate,
      ...(formData.fixedYield && { fixedYield: parseFloat(formData.fixedYield) }),
      // Enhanced bond fields
      ...(formData.type === 'bond' && {
        paymentFrequency: formData.paymentFrequency,
        ...(formData.maturityDate && { maturityDate: formData.maturityDate }),
        ...(formData.faceValue && { faceValue: parseFloat(formData.faceValue) }),
        ...(formData.lastPaymentDate && { lastPaymentDate: formData.lastPaymentDate }),
        ...(formData.nextPaymentDate && { nextPaymentDate: formData.nextPaymentDate }),
      }),
      // Cash fields
      ...(formData.type === 'cash' && {
        currency: formData.currency,
      }),
    };

    onAdd(investment);
  };

  const handleChange = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value,
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  return (
    <div className="brand-card p-6 pt-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="brand-heading-md">{t('add.investment')}</h2>
        <button
          onClick={onCancel}
          className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block brand-subtext-sm mb-2">
              {t('symbol')} *
            </label>
            <input
              type="text"
              value={formData.symbol}
              onChange={handleChange('symbol')}
              className={`brand-input ${
                errors.symbol ? 'border-red-300 dark:border-red-600' : ''
              }`}
              placeholder={t('placeholder.symbol')}
            />
            {errors.symbol && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.symbol}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('investment.type')} *
            </label>
            <select
              value={formData.type}
              onChange={handleChange('type')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              {investmentTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('name')} *
            </label>
          <input
            type="text"
            value={formData.name}
            onChange={handleChange('name')}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
              errors.name ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
            }`}
                          placeholder={t('placeholder.name')}
          />
          {errors.name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('quantity')} *
            </label>
            <input
              type="number"
              step="any"
              value={formData.quantity}
              onChange={handleChange('quantity')}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                errors.quantity ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder={t('placeholder.quantity')}
            />
            {errors.quantity && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.quantity}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('purchase.price')} {formData.type === 'cash' ? `(${t('purchase.price.helper')})` : '(USD)'} *
            </label>
            <input
              type="number"
              step="any"
              value={formData.purchasePrice}
              onChange={handleChange('purchasePrice')}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                errors.purchasePrice ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder={t('placeholder.price')}
            />
            {errors.purchasePrice && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.purchasePrice}</p>}
          </div>
        </div>

        {/* Currency field for cash investments */}
        {formData.type === 'cash' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('currency')} *
            </label>
            <select
              value={formData.currency}
              onChange={handleChange('currency')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="USD">{t('currency.usd')}</option>
              <option value="EUR">{t('currency.eur')}</option>
              <option value="GBP">{t('currency.gbp')}</option>
              <option value="JPY">{t('currency.jpy')}</option>
              <option value="CAD">{t('currency.cad')}</option>
              <option value="AUD">{t('currency.aud')}</option>
              <option value="CHF">{t('currency.chf')}</option>
              <option value="CNY">{t('currency.cny')}</option>
              <option value="INR">{t('currency.inr')}</option>
              <option value="BRL">{t('currency.brl')}</option>
              <option value="MXN">{t('currency.mxn')}</option>
              <option value="ARS">{t('currency.ars')}</option>
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {t('currency.helper')}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('purchase.date')} *
            </label>
            <input
              type="date"
              value={formData.purchaseDate}
              onChange={handleChange('purchaseDate')}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                errors.purchaseDate ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            {errors.purchaseDate && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.purchaseDate}</p>}
          </div>

          {formData.type === 'bond' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fixed Yield (% per annum)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.fixedYield}
                onChange={handleChange('fixedYield')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                  errors.fixedYield ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="e.g., 3.5"
              />
              {errors.fixedYield && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.fixedYield}</p>}
            </div>
          )}
        </div>

        {/* Enhanced Bond Fields */}
        {formData.type === 'bond' && (
          <>
            {/* Smart Analysis Display */}
            {bondAnalysis && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  {bondAnalysis.confidence > 0.7 ? (
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  )}
                  <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Smart Bond Analysis
                  </h4>
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  <p>Detected payment frequency: <strong>{bondAnalysisService.getFrequencyLabel(bondAnalysis.paymentFrequency)}</strong></p>
                  <p className={`${bondAnalysisService.getConfidenceColor(bondAnalysis.confidence)}`}>
                    {bondAnalysisService.getConfidenceLabel(bondAnalysis.confidence)} ({Math.round(bondAnalysis.confidence * 100)}%)
                  </p>
                  {bondAnalysis.paymentAmount > 0 && (
                    <p>Estimated payment: <strong>${bondAnalysis.paymentAmount.toFixed(2)}</strong></p>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Payment Frequency *
                </label>
                <select
                  value={formData.paymentFrequency}
                  onChange={handleChange('paymentFrequency')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  {paymentFrequencies.map((freq) => (
                    <option key={freq.value} value={freq.value}>
                      {freq.label}
                    </option>
                  ))}
                </select>
                {bondAnalysis && bondAnalysis.confidence > 0.6 && (
                  <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      💡 <strong>Suggestion:</strong> Based on the bond symbol and yield, 
                      we suggest <strong>{bondAnalysis.paymentFrequency}</strong> payments 
                      (confidence: {Math.round(bondAnalysis.confidence * 100)}%)
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Maturity Date
                </label>
                <input
                  type="date"
                  value={formData.maturityDate}
                  onChange={handleChange('maturityDate')}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                    errors.maturityDate ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {errors.maturityDate && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.maturityDate}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Face Value (Optional)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.faceValue}
                onChange={handleChange('faceValue')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                  errors.faceValue ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Leave blank to use purchase price × quantity"
              />
              {errors.faceValue && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.faceValue}</p>}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Face value is used for accurate yield calculations. If not provided, we'll use purchase price × quantity.
              </p>
            </div>

            {/* Conditional Payment Date Fields */}
            {requiredPaymentField === 'lastPayment' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Last Payment Date Received *
                </label>
                <input
                  type="date"
                  value={formData.lastPaymentDate}
                  onChange={handleChange('lastPaymentDate')}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                    errors.lastPaymentDate ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {errors.lastPaymentDate && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.lastPaymentDate}</p>}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Since you've owned this bond for more than one payment cycle, please enter the date of the last payment you received.
                </p>
              </div>
            )}

            {requiredPaymentField === 'nextPayment' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Next Payment Date *
                </label>
                <input
                  type="date"
                  value={formData.nextPaymentDate}
                  onChange={handleChange('nextPaymentDate')}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                    errors.nextPaymentDate ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {errors.nextPaymentDate && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.nextPaymentDate}</p>}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Since you recently purchased this bond, please enter the next payment date you expect to receive.
                </p>
              </div>
            )}
          </>
        )}

        <div className="flex space-x-4 pt-4">
          <button
            type="submit"
            className="brand-button-primary flex-1 flex items-center justify-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>{t('add')}</span>
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="brand-button-secondary flex-1"
          >
            {t('cancel')}
          </button>
        </div>
      </form>
    </div>
  );
}