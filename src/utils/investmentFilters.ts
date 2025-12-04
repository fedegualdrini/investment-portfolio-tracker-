// Re-export all functions and types from shared directory
export type { InvestmentFilters, SortCriteria, SortOrder } from '../shared/utils/investmentFilters';
export {
  filterByType,
  filterBySymbol,
  filterInvestments,
  searchInvestments,
  sortInvestments
} from '../shared/utils/investmentFilters';

