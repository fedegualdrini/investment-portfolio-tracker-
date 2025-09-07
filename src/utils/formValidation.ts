import type { InvestmentType, PaymentFrequency } from '../types/investment';

/**
 * Form validation utility functions
 */

// Define a type for the form data that matches the component's state
interface InvestmentFormData {
  symbol: string;
  name: string;
  type: InvestmentType;
  quantity: string;
  purchasePrice: string;
  purchaseDate: string;
  fixedYield?: string;
  paymentFrequency?: PaymentFrequency;
  maturityDate?: string;
  faceValue?: string;
  lastPaymentDate?: string;
  nextPaymentDate?: string;
  currency?: string;
}

export interface ValidationErrors {
  [key: string]: string;
}

/**
 * Validate investment form data
 */
export function validateInvestmentForm(
  formData: InvestmentFormData,
  requiredPaymentField: 'lastPayment' | 'nextPayment' | 'none' = 'none'
): ValidationErrors {
  const errors: ValidationErrors = {};

  // Basic required field validations
  if (!formData.symbol.trim()) {
    errors.symbol = 'Symbol is required';
  }
  if (!formData.name.trim()) {
    errors.name = 'Name is required';
  }
  if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
    errors.quantity = 'Quantity must be greater than 0';
  }
  if (!formData.purchasePrice || parseFloat(formData.purchasePrice) <= 0) {
    errors.purchasePrice = 'Purchase price must be greater than 0';
  }
  if (!formData.purchaseDate) {
    errors.purchaseDate = 'Purchase date is required';
  }

  // Bond-specific validations
  if (formData.type === 'bond') {
    if (formData.fixedYield && parseFloat(formData.fixedYield) < 0) {
      errors.fixedYield = 'Fixed yield cannot be negative';
    }
    
    if (formData.maturityDate) {
      const maturityDate = new Date(formData.maturityDate);
      const purchaseDate = new Date(formData.purchaseDate);
      if (maturityDate <= purchaseDate) {
        errors.maturityDate = 'Maturity date must be after purchase date';
      }
    }
    
    if (formData.faceValue && parseFloat(formData.faceValue) <= 0) {
      errors.faceValue = 'Face value must be greater than 0';
    }
    
    // Validate payment date fields based on required field
    if (requiredPaymentField === 'lastPayment') {
      if (!formData.lastPaymentDate) {
        errors.lastPaymentDate = 'Last payment date is required for bonds purchased after payment cycles';
      } else {
        const lastPayment = new Date(formData.lastPaymentDate);
        const purchase = new Date(formData.purchaseDate);
        if (lastPayment < purchase) {
          errors.lastPaymentDate = 'Last payment date cannot be before purchase date';
        }
      }
    }
    
    if (requiredPaymentField === 'nextPayment') {
      if (!formData.nextPaymentDate) {
        errors.nextPaymentDate = 'Next payment date is required for bonds purchased before payment cycles';
      } else {
        const nextPayment = new Date(formData.nextPaymentDate);
        const purchase = new Date(formData.purchaseDate);
        if (nextPayment <= purchase) {
          errors.nextPaymentDate = 'Next payment date must be after purchase date';
        }
      }
    }
  }

  return errors;
}

/**
 * Check if form has any validation errors
 */
export function hasValidationErrors(errors: ValidationErrors): boolean {
  return Object.keys(errors).length > 0;
}

/**
 * Get error message for a specific field
 */
export function getFieldError(errors: ValidationErrors, fieldName: string): string | undefined {
  return errors[fieldName];
}
