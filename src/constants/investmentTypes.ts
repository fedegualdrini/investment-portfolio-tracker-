import type { InvestmentType } from '../types/investment';

/**
 * Shared constants for investment types
 */

export interface InvestmentTypeOption {
  value: InvestmentType;
  label: string;
}

/**
 * Get investment type options with labels
 * This function takes a translation function to support internationalization
 */
export function getInvestmentTypeOptions(t: (key: string) => string): InvestmentTypeOption[] {
  return [
    { value: 'crypto', label: t('type.crypto') },
    { value: 'stock', label: t('type.stock') },
    { value: 'etf', label: t('type.etf') },
    { value: 'bond', label: t('type.bond') },
    { value: 'cash', label: t('type.cash') },
    { value: 'commodity', label: t('type.commodity') },
    { value: 'other', label: t('type.other') },
  ];
}

/**
 * Default investment type options (without translation)
 */
export const DEFAULT_INVESTMENT_TYPE_OPTIONS: InvestmentTypeOption[] = [
  { value: 'crypto', label: 'Cryptocurrency' },
  { value: 'stock', label: 'Stock' },
  { value: 'etf', label: 'ETF' },
  { value: 'bond', label: 'Bond' },
  { value: 'cash', label: 'Cash' },
  { value: 'commodity', label: 'Commodity' },
  { value: 'other', label: 'Other' },
];

/**
 * All available investment types
 */
export const INVESTMENT_TYPES: InvestmentType[] = [
  'crypto',
  'stock', 
  'etf',
  'bond',
  'cash',
  'commodity',
  'other'
];

/**
 * Check if a string is a valid investment type
 */
export function isValidInvestmentType(type: string): type is InvestmentType {
  return INVESTMENT_TYPES.includes(type as InvestmentType);
}
