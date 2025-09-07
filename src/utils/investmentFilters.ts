import type { Investment } from '../types/investment';

/**
 * Investment filtering utility functions
 */

export interface InvestmentFilters {
  type?: string;
  symbol?: string;
}

/**
 * Filter investments by type
 */
export function filterByType(investments: Investment[], type: string): Investment[] {
  return investments.filter(inv => inv.type === type);
}

/**
 * Filter investments by symbol (case-insensitive partial match)
 */
export function filterBySymbol(investments: Investment[], symbol: string): Investment[] {
  return investments.filter(inv => 
    inv.symbol.toLowerCase().includes(symbol.toLowerCase())
  );
}

/**
 * Apply multiple filters to investments
 */
export function filterInvestments(
  investments: Investment[],
  filters: InvestmentFilters
): Investment[] {
  let filtered = [...investments];

  if (filters.type) {
    filtered = filterByType(filtered, filters.type);
  }

  if (filters.symbol) {
    filtered = filterBySymbol(filtered, filters.symbol);
  }

  return filtered;
}

/**
 * Search investments by multiple criteria
 */
export function searchInvestments(
  investments: Investment[],
  searchTerm: string
): Investment[] {
  if (!searchTerm.trim()) {
    return investments;
  }

  const term = searchTerm.toLowerCase();
  return investments.filter(inv => 
    inv.symbol.toLowerCase().includes(term) ||
    inv.name.toLowerCase().includes(term) ||
    inv.type.toLowerCase().includes(term)
  );
}

/**
 * Sort investments by various criteria
 */
export type SortCriteria = 'symbol' | 'name' | 'type' | 'value' | 'gainLoss' | 'purchaseDate';
export type SortOrder = 'asc' | 'desc';

export function sortInvestments(
  investments: Investment[],
  criteria: SortCriteria,
  order: SortOrder = 'asc'
): Investment[] {
  const sorted = [...investments].sort((a, b) => {
    let comparison = 0;

    switch (criteria) {
      case 'symbol':
        comparison = a.symbol.localeCompare(b.symbol);
        break;
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'type':
        comparison = a.type.localeCompare(b.type);
        break;
      case 'value':
        const valueA = (a.currentPrice || a.purchasePrice) * a.quantity;
        const valueB = (b.currentPrice || b.purchasePrice) * b.quantity;
        comparison = valueA - valueB;
        break;
      case 'gainLoss':
        const gainLossA = ((a.currentPrice || a.purchasePrice) - a.purchasePrice) * a.quantity;
        const gainLossB = ((b.currentPrice || b.purchasePrice) - b.purchasePrice) * b.quantity;
        comparison = gainLossA - gainLossB;
        break;
      case 'purchaseDate':
        comparison = new Date(a.purchaseDate).getTime() - new Date(b.purchaseDate).getTime();
        break;
    }

    return order === 'desc' ? -comparison : comparison;
  });

  return sorted;
}
