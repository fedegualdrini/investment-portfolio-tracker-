import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, AlertCircle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Investment, InvestmentType, PaymentFrequency } from '../types/investment';
import { BondAnalysisService } from '../services/bondAnalysisService';
import { useLanguage } from '../contexts/LanguageContext';
import { getInvestmentTypeOptions } from '../constants/investmentTypes';
import { getPaymentFrequencyOptions } from '../constants/paymentFrequencies';
import { validateInvestmentForm } from '../utils/formValidation';

interface AddInvestmentFormProps {
  onAdd: (investment: Omit<Investment, 'id'>) => void;
  onCancel: () => void;
}

export function AddInvestmentForm({ onAdd, onCancel }: AddInvestmentFormProps) {
  const { t } = useLanguage();

  const [currentStep, setCurrentStep] = useState(1);

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

  const investmentTypes = getInvestmentTypeOptions(t);
  const paymentFrequencies = getPaymentFrequencyOptions(t);

  const isBond = formData.type === 'bond';
  const totalSteps = isBond ? 3 : 2;

  const steps = [
    { number: 1, label: t('step.basic') },
    { number: 2, label: t('step.financial') },
    ...(isBond ? [{ number: 3, label: t('step.bond') }] : []),
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
    } else {
      setBondAnalysis(null);
    }
  }, [formData.symbol, formData.fixedYield, formData.type, formData.purchasePrice, formData.quantity, formData.faceValue]);

  // Reset step if user switches away from bond and is on step 3
  useEffect(() => {
    if (!isBond && currentStep === 3) {
      setCurrentStep(2);
    }
  }, [isBond, currentStep]);

  const validateStep = (step: number): boolean => {
    const stepErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.symbol.trim()) {
        stepErrors.symbol = 'Symbol is required';
      }
      if (!formData.name.trim()) {
        stepErrors.name = 'Name is required';
      }
    }

    if (step === 2) {
      if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
        stepErrors.quantity = 'Quantity must be greater than 0';
      }
      if (!formData.purchasePrice || parseFloat(formData.purchasePrice) <= 0) {
        stepErrors.purchasePrice = 'Purchase price must be greater than 0';
      }
      if (!formData.purchaseDate) {
        stepErrors.purchaseDate = 'Purchase date is required';
      }
    }

    if (step === 3 && isBond) {
      if (formData.fixedYield && parseFloat(formData.fixedYield) < 0) {
        stepErrors.fixedYield = 'Fixed yield cannot be negative';
      }
      if (formData.maturityDate) {
        const maturityDate = new Date(formData.maturityDate);
        const purchaseDate = new Date(formData.purchaseDate);
        if (maturityDate <= purchaseDate) {
          stepErrors.maturityDate = 'Maturity date must be after purchase date';
        }
      }
      if (formData.faceValue && parseFloat(formData.faceValue) <= 0) {
        stepErrors.faceValue = 'Face value must be greater than 0';
      }
      if (requiredPaymentField === 'lastPayment') {
        if (!formData.lastPaymentDate) {
          stepErrors.lastPaymentDate = 'Last payment date is required for bonds purchased after payment cycles';
        } else {
          const lastPayment = new Date(formData.lastPaymentDate);
          const purchase = new Date(formData.purchaseDate);
          if (lastPayment < purchase) {
            stepErrors.lastPaymentDate = 'Last payment date cannot be before purchase date';
          }
        }
      }
      if (requiredPaymentField === 'nextPayment') {
        if (!formData.nextPaymentDate) {
          stepErrors.nextPaymentDate = 'Next payment date is required for bonds purchased before payment cycles';
        } else {
          const nextPayment = new Date(formData.nextPaymentDate);
          const purchase = new Date(formData.purchaseDate);
          if (nextPayment <= purchase) {
            stepErrors.nextPaymentDate = 'Next payment date must be after purchase date';
          }
        }
      }
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const validateForm = () => {
    const newErrors = validateInvestmentForm(formData, requiredPaymentField);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setErrors({});
    setCurrentStep(prev => prev - 1);
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

  const isLastStep = currentStep === totalSteps;

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 animate-fadeInUp">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link to="/" className="btn-icon">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold gradient-text">{t('add.investment')}</h1>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center mb-8">
        {steps.map((step, index) => (
          <React.Fragment key={step.number}>
            {/* Step circle + label */}
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                  currentStep > step.number
                    ? 'bg-emerald-500 text-white'
                    : currentStep === step.number
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-white shadow-lg shadow-emerald-500/30'
                    : 'border-2 text-gray-400'
                }`}
                style={
                  currentStep < step.number
                    ? { borderColor: 'var(--border-primary)' }
                    : currentStep === step.number
                    ? { background: 'linear-gradient(to right, #10b981, #2dd4bf)' }
                    : undefined
                }
              >
                {currentStep > step.number ? (
                  <Check className="h-4 w-4" />
                ) : (
                  step.number
                )}
              </div>
              <span
                className="text-xs mt-1.5 font-medium whitespace-nowrap"
                style={{
                  color:
                    currentStep >= step.number
                      ? 'var(--text-primary)'
                      : 'var(--text-muted)',
                }}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line between steps */}
            {index < steps.length - 1 && (
              <div className="flex-1 mx-3 mt-[-1.25rem]">
                <div
                  className="h-0.5 w-full rounded-full transition-all duration-500"
                  style={{
                    background:
                      currentStep > step.number
                        ? 'var(--accent-primary, #10b981)'
                        : 'var(--border-primary)',
                  }}
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        {/* Step 1 - Basic Info */}
        {currentStep === 1 && (
          <div className="glass-card p-6 space-y-5">
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--text-secondary)' }}
              >
                {t('symbol')} *
              </label>
              <input
                type="text"
                value={formData.symbol}
                onChange={handleChange('symbol')}
                className={`input-field ${
                  errors.symbol ? 'border-red-500' : ''
                }`}
                placeholder={t('placeholder.symbol')}
              />
              {errors.symbol && (
                <p className="text-red-500 text-xs mt-1">{errors.symbol}</p>
              )}
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--text-secondary)' }}
              >
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

            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--text-secondary)' }}
              >
                {t('name')} *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={handleChange('name')}
                className={`input-field ${
                  errors.name ? 'border-red-500' : ''
                }`}
                placeholder={t('placeholder.name')}
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>
          </div>
        )}

        {/* Step 2 - Financial Details */}
        {currentStep === 2 && (
          <div className="glass-card p-6 space-y-5">
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--text-secondary)' }}
              >
                {t('quantity')} *
              </label>
              <input
                type="number"
                step="any"
                value={formData.quantity}
                onChange={handleChange('quantity')}
                className={`input-field ${
                  errors.quantity ? 'border-red-500' : ''
                }`}
                placeholder={t('placeholder.quantity')}
              />
              {errors.quantity && (
                <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>
              )}
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--text-secondary)' }}
              >
                {t('purchase.price')} {formData.type === 'cash' ? `(${t('purchase.price.helper')})` : '(USD)'} *
              </label>
              <input
                type="number"
                step="any"
                value={formData.purchasePrice}
                onChange={handleChange('purchasePrice')}
                className={`input-field ${
                  errors.purchasePrice ? 'border-red-500' : ''
                }`}
                placeholder={t('placeholder.price')}
              />
              {errors.purchasePrice && (
                <p className="text-red-500 text-xs mt-1">{errors.purchasePrice}</p>
              )}
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--text-secondary)' }}
              >
                {t('purchase.date')} *
              </label>
              <input
                type="date"
                value={formData.purchaseDate}
                onChange={handleChange('purchaseDate')}
                className={`input-field ${
                  errors.purchaseDate ? 'border-red-500' : ''
                }`}
              />
              {errors.purchaseDate && (
                <p className="text-red-500 text-xs mt-1">{errors.purchaseDate}</p>
              )}
            </div>

            {/* Currency field for cash investments */}
            {formData.type === 'cash' && (
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {t('currency')} *
                </label>
                <select
                  value={formData.currency}
                  onChange={handleChange('currency')}
                  className="input-field"
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
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  {t('currency.helper')}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 3 - Bond Details */}
        {currentStep === 3 && isBond && (
          <div className="glass-card p-6 space-y-5">
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--text-secondary)' }}
              >
                Fixed Yield (% per annum)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.fixedYield}
                onChange={handleChange('fixedYield')}
                className={`input-field ${
                  errors.fixedYield ? 'border-red-500' : ''
                }`}
                placeholder="e.g., 3.5"
              />
              {errors.fixedYield && (
                <p className="text-red-500 text-xs mt-1">{errors.fixedYield}</p>
              )}
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--text-secondary)' }}
              >
                Payment Frequency *
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

            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--text-secondary)' }}
              >
                Maturity Date
              </label>
              <input
                type="date"
                value={formData.maturityDate}
                onChange={handleChange('maturityDate')}
                className={`input-field ${
                  errors.maturityDate ? 'border-red-500' : ''
                }`}
              />
              {errors.maturityDate && (
                <p className="text-red-500 text-xs mt-1">{errors.maturityDate}</p>
              )}
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--text-secondary)' }}
              >
                Face Value (Optional)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.faceValue}
                onChange={handleChange('faceValue')}
                className={`input-field ${
                  errors.faceValue ? 'border-red-500' : ''
                }`}
                placeholder="Leave blank to use purchase price x quantity"
              />
              {errors.faceValue && (
                <p className="text-red-500 text-xs mt-1">{errors.faceValue}</p>
              )}
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Face value is used for accurate yield calculations. If not provided, we'll use purchase price x quantity.
              </p>
            </div>

            {/* Conditional Payment Date Fields */}
            {requiredPaymentField === 'lastPayment' && (
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Last Payment Date Received *
                </label>
                <input
                  type="date"
                  value={formData.lastPaymentDate}
                  onChange={handleChange('lastPaymentDate')}
                  className={`input-field ${
                    errors.lastPaymentDate ? 'border-red-500' : ''
                  }`}
                />
                {errors.lastPaymentDate && (
                  <p className="text-red-500 text-xs mt-1">{errors.lastPaymentDate}</p>
                )}
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  Since you've owned this bond for more than one payment cycle, please enter the date of the last payment you received.
                </p>
              </div>
            )}

            {requiredPaymentField === 'nextPayment' && (
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Next Payment Date *
                </label>
                <input
                  type="date"
                  value={formData.nextPaymentDate}
                  onChange={handleChange('nextPaymentDate')}
                  className={`input-field ${
                    errors.nextPaymentDate ? 'border-red-500' : ''
                  }`}
                />
                {errors.nextPaymentDate && (
                  <p className="text-red-500 text-xs mt-1">{errors.nextPaymentDate}</p>
                )}
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  Since you recently purchased this bond, please enter the next payment date you expect to receive.
                </p>
              </div>
            )}

            {/* Bond Analysis Suggestion Box */}
            {bondAnalysis && (
              <div
                className="glass-card-static p-4"
                style={{ borderLeft: '3px solid var(--accent-primary, #10b981)' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  {bondAnalysis.confidence > 0.7 ? (
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                  )}
                  <h4
                    className="text-sm font-semibold"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    Smart Bond Analysis
                  </h4>
                </div>
                <div className="space-y-1" style={{ color: 'var(--text-secondary)' }}>
                  <p className="text-sm">
                    Detected payment frequency:{' '}
                    <strong>{bondAnalysisService.getFrequencyLabel(bondAnalysis.paymentFrequency)}</strong>
                  </p>
                  <p className={`text-sm ${bondAnalysisService.getConfidenceColor(bondAnalysis.confidence)}`}>
                    {bondAnalysisService.getConfidenceLabel(bondAnalysis.confidence)} ({Math.round(bondAnalysis.confidence * 100)}%)
                  </p>
                  {bondAnalysis.paymentAmount > 0 && (
                    <p className="text-sm">
                      Estimated payment: <strong>${bondAnalysis.paymentAmount.toFixed(2)}</strong>
                    </p>
                  )}
                  {bondAnalysis.confidence > 0.6 && (
                    <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                      Suggestion: Based on the bond symbol and yield, we suggest{' '}
                      <strong>{bondAnalysis.paymentFrequency}</strong> payments (confidence:{' '}
                      {Math.round(bondAnalysis.confidence * 100)}%)
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          {currentStep === 1 ? (
            <>
              <div />
              <button
                type="button"
                onClick={handleNext}
                className="gradient-btn px-8"
              >
                {t('step.next')}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleBack}
                className="btn-ghost px-6"
              >
                {t('step.back')}
              </button>
              {isLastStep ? (
                <button
                  type="submit"
                  className="gradient-btn px-8"
                >
                  {t('add.investment')}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  className="gradient-btn px-8"
                >
                  {t('step.next')}
                </button>
              )}
            </>
          )}
        </div>
      </form>
    </div>
  );
}
