import React, { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';
import type { Investment, InvestmentType, PaymentFrequency } from '../types/investment';
import { BondAnalysisService } from '../services/bondAnalysisService';
import { useLanguage } from '../contexts/LanguageContext';

interface EditInvestmentFormProps {
  investment: Investment;
  onSave: (id: string, updates: Partial<Investment>) => void;
  onCancel: () => void;
}

export function EditInvestmentForm({ investment, onSave, onCancel }: EditInvestmentFormProps) {
  const { t } = useLanguage();
  
  const [formData, setFormData] = useState({
    symbol: investment.symbol,
    name: investment.name,
    type: investment.type,
    quantity: investment.quantity.toString(),
    purchasePrice: investment.purchasePrice.toString(),
    purchaseDate: investment.purchaseDate,
    fixedYield: investment.fixedYield?.toString() || '',
    // Enhanced bond fields
    paymentFrequency: investment.paymentFrequency || 'semi-annual' as PaymentFrequency,
    maturityDate: investment.maturityDate || '',
    faceValue: investment.faceValue?.toString() || '',
    lastPaymentDate: investment.lastPaymentDate || '',
    nextPaymentDate: investment.nextPaymentDate || '',
    // Cash fields
    currency: investment.currency || 'USD',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
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

    const updates: Partial<Investment> = {
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

    onSave(investment.id, updates);
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
        <h2 className="brand-heading-md">{t('edit')}</h2>
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-2">
              {t('symbol')} *
            </label>
            <input
              type="text"
              value={formData.symbol}
              onChange={handleChange('symbol')}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                errors.symbol ? 'border-red-300 dark:border-red-600 dark:border-red-600' : 'border-gray-300 dark:border-gray-600 dark:border-gray-600'
              }`}
              placeholder={t('placeholder.symbol')}
            />
            {errors.symbol && <p className="mt-1 text-sm text-red-600 dark:text-red-400 dark:text-red-400">{errors.symbol}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('investment.type')} *
            </label>
            <select
              value={formData.type}
              onChange={handleChange('type')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
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
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
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
              {t('purchase.price')} (USD) *
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
                {t('fixed.yield')}
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

          {formData.type === 'cash' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Currency *
              </label>
              <select
                value={formData.currency}
                onChange={handleChange('currency')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="JPY">JPY - Japanese Yen</option>
                <option value="CAD">CAD - Canadian Dollar</option>
                <option value="AUD">AUD - Australian Dollar</option>
                <option value="CHF">CHF - Swiss Franc</option>
                <option value="CNY">CNY - Chinese Yuan</option>
                              <option value="INR">INR - Indian Rupee</option>
              <option value="BRL">BRL - Brazilian Real</option>
              <option value="MXN">MXN - Mexican Peso</option>
              <option value="ARS">ARS - Argentine Peso</option>
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Exchange rates are automatically fetched and updated hourly.
              </p>
            </div>
          )}
        </div>

        {/* Enhanced Bond Fields for Editing */}
        {formData.type === 'bond' && (
          <>
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
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="semi-annual">Semi-Annual</option>
                  <option value="annual">Annual</option>
                  <option value="zero-coupon">Zero Coupon</option>
                  <option value="unknown">Unknown</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('maturity.date')}
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
                  {t('face.value')}
                </label>
              <input
                type="number"
                step="0.01"
                value={formData.faceValue}
                onChange={handleChange('faceValue')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                  errors.faceValue ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder={t('placeholder.face.value')}
              />
              {errors.faceValue && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.faceValue}</p>}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {t('face.value.helper')}
              </p>
            </div>

            {/* Conditional Payment Date Fields */}
            {requiredPaymentField === 'lastPayment' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('last.payment.date')} *
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
                  {t('next.payment.date')} *
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
            className="flex-1 bg-blue-600 dark:bg-blue-700 text-white py-2 px-4 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>{t('save')}</span>
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors duration-200"
          >
            {t('cancel')}
          </button>
        </div>
      </form>
    </div>
  );
}