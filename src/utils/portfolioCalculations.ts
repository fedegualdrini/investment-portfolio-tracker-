import type { Investment, InvestmentType, PortfolioSummary } from '../types/investment';

/**
 * Utility functions for portfolio calculations
 */

/**
 * Calculate portfolio summary from investments
 */
export function calculatePortfolioSummary(investments: Investment[]): PortfolioSummary {
  const totalInvested = investments.reduce((sum, inv) => sum + inv.purchasePrice * inv.quantity, 0);
  const totalValue = investments.reduce((sum, inv) => sum + (inv.currentPrice || inv.purchasePrice) * inv.quantity, 0);
  const totalGainLoss = totalValue - totalInvested;
  const totalGainLossPercentage = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;

  const investmentsByType: Record<string, number> = {
    'stock': 0, 'bond': 0, 'crypto': 0, 'etf': 0, 'commodity': 0, 'cash': 0, 'other': 0
  };
  investments.forEach(inv => {
    investmentsByType[inv.type] = (investmentsByType[inv.type] || 0) + (inv.currentPrice || inv.purchasePrice) * inv.quantity;
  });

  return {
    totalValue,
    totalInvested,
    totalGainLoss,
    totalGainLossPercentage,
    investmentsByType: investmentsByType as Record<InvestmentType, number>
  };
}


/**
 * Calculate total bond value from investments
 */
export function calculateTotalBondValue(investments: Investment[]): number {
  return investments
    .filter(inv => inv.type === 'bond')
    .reduce((sum, inv) => sum + (inv.currentPrice || inv.purchasePrice) * inv.quantity, 0);
}

/**
 * Calculate total annual coupon income from bonds
 */
export function calculateTotalAnnualCouponIncome(investments: Investment[]): number {
  return investments
    .filter(inv => inv.type === 'bond')
    .reduce((sum, inv) => {
      const faceValue = inv.faceValue || inv.purchasePrice * inv.quantity;
      return sum + (inv.fixedYield || 0) * faceValue / 100;
    }, 0);
}

/**
 * Get investments by type
 */
export function getInvestmentsByType(investments: Investment[], type: string): Investment[] {
  return investments.filter(inv => inv.type === type);
}

/**
 * Get bonds from investments
 */
export function getBonds(investments: Investment[]): Investment[] {
  return getInvestmentsByType(investments, 'bond');
}

/**
 * Get stocks from investments
 */
export function getStocks(investments: Investment[]): Investment[] {
  return investments.filter(inv => inv.type === 'stock' || inv.type === 'etf');
}

/**
 * Get crypto from investments
 */
export function getCrypto(investments: Investment[]): Investment[] {
  return getInvestmentsByType(investments, 'crypto');
}

/**
 * Get cash from investments
 */
export function getCash(investments: Investment[]): Investment[] {
  return getInvestmentsByType(investments, 'cash');
}
