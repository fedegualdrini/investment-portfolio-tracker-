import React, { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';
import type { Investment, InvestmentType, PaymentFrequency } from '../types/investment';
import { BondAnalysisService } from '../services/bondAnalysisService';
import { useLanguage } from '../contexts/LanguageContext';
import { getInvestmentTypeOptions } from '../constants/investmentTypes';
import { getPaymentFrequencyOptions } from '../constants/paymentFrequencies';
import { validateInvestmentForm } from '../utils/formValidation';

interface EditInvestmentFormProps {
  investment: Investment;
  onSave: (id: string, updates: Partial<Investment>) => void;
  onCancel: () => void;
}

const TYPE_BADGE: Record<string, string> = {
  crypto: 'badge-crypto',
  stock: 'badge-stock',
  bond: 'badge-bond',
  etf: 'badge-etf',
  commodity: 'badge-commodity',
  cash: 'badge-cash',
  other: 'badge-other',
};

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

  const investmentTypes = getInvestmentTypeOptions(t);
  const paymentFrequencies = getPaymentFrequencyOptions(t);

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
    const newErrors = validateInvestmentForm(formData, requiredPaymentField);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {t('edit')} {formData.symbol}
          </h2>
          <span className={TYPE_BADGE[formData.type] || 'badge-other'}>
            {formData.type}
          </span>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="btn-icon"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Form Section */}
        <div className="glass-card p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Symbol */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                {t('symbol')} *
              </label>
              <input
                type="text"
                value={formData.symbol}
                onChange={handleChange('symbol')}
                className={`input-field ${errors.symbol ? 'border-red-500' : ''}`}
                placeholder={t('placeholder.symbol')}
              />
              {errors.symbol && <p className="text-red-500 text-xs mt-1">{errors.symbol}</p>}
            </div>

            {/* Investment Type */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                {t('investment.type')} *
              </label>
              <select
                value={formData.type}
                onChange={handleChange('type')}
                className="input-field"
              >
                {investmentTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Name — full width */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                {t('name')} *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={handleChange('name')}
                className={`input-field ${errors.name ? 'border-red-500' : ''}`}
                placeholder={t('placeholder.name')}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                {t('quantity')} *
              </label>
              <input
                type="number"
                step="any"
                value={formData.quantity}
                onChange={handleChange('quantity')}
                className={`input-field ${errors.quantity ? 'border-red-500' : ''}`}
                placeholder={t('placeholder.quantity')}
              />
              {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
            </div>

            {/* Purchase Price */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                {t('purchase.price')} (USD) *
              </label>
              <input
                type="number"
                step="any"
                value={formData.purchasePrice}
                onChange={handleChange('purchasePrice')}
                className={`input-field ${errors.purchasePrice ? 'border-red-500' : ''}`}
                placeholder={t('placeholder.price')}
              />
              {errors.purchasePrice && <p className="text-red-500 text-xs mt-1">{errors.purchasePrice}</p>}
            </div>

            {/* Purchase Date */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                {t('purchase.date')} *
              </label>
              <input
                type="date"
                value={formData.purchaseDate}
                onChange={handleChange('purchaseDate')}
                className={`input-field ${errors.purchaseDate ? 'border-red-500' : ''}`}
              />
              {errors.purchaseDate && <p className="text-red-500 text-xs mt-1">{errors.purchaseDate}</p>}
            </div>

            {/* Fixed Yield (bond only) */}
            {formData.type === 'bond' && (
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  {t('fixed.yield')}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.fixedYield}
                  onChange={handleChange('fixedYield')}
                  className={`input-field ${errors.fixedYield ? 'border-red-500' : ''}`}
                  placeholder="e.g., 3.5"
                />
                {errors.fixedYield && <p className="text-red-500 text-xs mt-1">{errors.fixedYield}</p>}
              </div>
            )}

            {/* Currency (cash only) */}
            {formData.type === 'cash' && (
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Currency *
                </label>
                <select
                  value={formData.currency}
                  onChange={handleChange('currency')}
                  className="input-field"
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
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  Exchange rates are automatically fetched and updated hourly.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Bond-Specific Section */}
        {formData.type === 'bond' && (
          <div className="glass-card p-6">
            <h3 className="text-base font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              {t('bond.details')}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Payment Frequency */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  {t('payment.frequency')} *
                </label>
                <select
                  value={formData.paymentFrequency}
                  onChange={handleChange('paymentFrequency')}
                  className="input-field"
                >
                  {paymentFrequencies.map((freq) => (
                    <option key={freq.value} value={freq.value}>
                      {freq.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Maturity Date */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  {t('maturity.date')}
                </label>
                <input
                  type="date"
                  value={formData.maturityDate}
                  onChange={handleChange('maturityDate')}
                  className={`input-field ${errors.maturityDate ? 'border-red-500' : ''}`}
                />
                {errors.maturityDate && <p className="text-red-500 text-xs mt-1">{errors.maturityDate}</p>}
              </div>

              {/* Face Value — full width */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  {t('face.value')}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.faceValue}
                  onChange={handleChange('faceValue')}
                  className={`input-field ${errors.faceValue ? 'border-red-500' : ''}`}
                  placeholder={t('placeholder.face.value')}
                />
                {errors.faceValue && <p className="text-red-500 text-xs mt-1">{errors.faceValue}</p>}
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  {t('face.value.helper')}
                </p>
              </div>

              {/* Conditional Payment Date Fields */}
              {requiredPaymentField === 'lastPayment' && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                    {t('last.payment.date')} *
                  </label>
                  <input
                    type="date"
                    value={formData.lastPaymentDate}
                    onChange={handleChange('lastPaymentDate')}
                    className={`input-field ${errors.lastPaymentDate ? 'border-red-500' : ''}`}
                  />
                  {errors.lastPaymentDate && <p className="text-red-500 text-xs mt-1">{errors.lastPaymentDate}</p>}
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    Since you've owned this bond for more than one payment cycle, please enter the date of the last payment you received.
                  </p>
                </div>
              )}

              {requiredPaymentField === 'nextPayment' && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                    {t('next.payment.date')} *
                  </label>
                  <input
                    type="date"
                    value={formData.nextPaymentDate}
                    onChange={handleChange('nextPaymentDate')}
                    className={`input-field ${errors.nextPaymentDate ? 'border-red-500' : ''}`}
                  />
                  {errors.nextPaymentDate && <p className="text-red-500 text-xs mt-1">{errors.nextPaymentDate}</p>}
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    Since you recently purchased this bond, please enter the next payment date you expect to receive.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            className="gradient-btn flex-1 flex items-center justify-center gap-2"
          >
            <Save className="h-4 w-4" />
            <span>{t('save')}</span>
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="btn-ghost flex-1"
          >
            {t('cancel')}
          </button>
        </div>
      </form>
    </div>
  );
}
