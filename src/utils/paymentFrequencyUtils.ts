import type { PaymentFrequency } from '../types/investment';

/**
 * Utility functions for payment frequency calculations
 */

/**
 * Get the number of payments per year for a given payment frequency
 */
export function getPaymentsPerYear(frequency: PaymentFrequency): number {
  switch (frequency) {
    case 'monthly': return 12;
    case 'quarterly': return 4;
    case 'semi-annual': return 2;
    case 'annual': return 1;
    case 'zero-coupon': return 0;
    default: return 2; // Default to semi-annual
  }
}

/**
 * Get the number of months between payments for a given payment frequency
 */
export function getMonthsInterval(frequency: PaymentFrequency): number {
  switch (frequency) {
    case 'monthly': return 1;
    case 'quarterly': return 3;
    case 'semi-annual': return 6;
    case 'annual': return 12;
    case 'zero-coupon': return 0;
    default: return 6; // Default to semi-annual
  }
}

/**
 * Calculate payment amount based on face value, yield, and frequency
 */
export function calculatePaymentAmount(
  faceValue: number,
  annualYield: number,
  frequency: PaymentFrequency
): number {
  const paymentsPerYear = getPaymentsPerYear(frequency);
  const totalAnnualIncome = faceValue * annualYield;
  return paymentsPerYear > 0 ? totalAnnualIncome / paymentsPerYear : 0;
}

/**
 * Calculate total annual payments for a given frequency
 */
export function calculateTotalAnnualPayments(frequency: PaymentFrequency): number {
  return getPaymentsPerYear(frequency);
}
