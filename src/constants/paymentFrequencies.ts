import type { PaymentFrequency } from '../types/investment';

/**
 * Shared constants for payment frequencies
 */

export interface PaymentFrequencyOption {
  value: PaymentFrequency;
  label: string;
}

/**
 * Get payment frequency options with labels
 * This function takes a translation function to support internationalization
 */
export function getPaymentFrequencyOptions(t: (key: string) => string): PaymentFrequencyOption[] {
  return [
    { value: 'monthly', label: t('frequency.monthly') },
    { value: 'quarterly', label: t('frequency.quarterly') },
    { value: 'semi-annual', label: t('frequency.semi.annual') },
    { value: 'annual', label: t('frequency.annual') },
    { value: 'zero-coupon', label: t('frequency.zero.coupon') },
    { value: 'unknown', label: t('frequency.unknown') },
  ];
}

/**
 * Default payment frequency options (without translation)
 */
export const DEFAULT_PAYMENT_FREQUENCY_OPTIONS: PaymentFrequencyOption[] = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'semi-annual', label: 'Semi-Annual' },
  { value: 'annual', label: 'Annual' },
  { value: 'zero-coupon', label: 'Zero Coupon' },
  { value: 'unknown', label: 'Unknown' },
];

/**
 * All available payment frequencies
 */
export const PAYMENT_FREQUENCIES: PaymentFrequency[] = [
  'monthly',
  'quarterly',
  'semi-annual',
  'annual',
  'zero-coupon',
  'unknown'
];

/**
 * Check if a string is a valid payment frequency
 */
export function isValidPaymentFrequency(frequency: string): frequency is PaymentFrequency {
  return PAYMENT_FREQUENCIES.includes(frequency as PaymentFrequency);
}

/**
 * Default payment frequency
 */
export const DEFAULT_PAYMENT_FREQUENCY: PaymentFrequency = 'semi-annual';
