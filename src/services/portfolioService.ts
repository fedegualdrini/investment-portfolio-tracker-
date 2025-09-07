import type { Investment } from '../types/investment';
import { PriceService } from './priceService';
import { calculatePortfolioSummary, calculateTotalBondValue, calculateTotalAnnualCouponIncome, getBonds, getStocks, getCrypto, getCash } from '../utils/portfolioCalculations';
import { getPaymentsPerYear, calculatePaymentAmount } from '../utils/paymentFrequencyUtils';
import { filterInvestments } from '../utils/investmentFilters';

export interface PortfolioSummary {
  totalValue: number;
  totalInvested: number;
  totalGainLoss: number;
  totalGainLossPercentage: number;
  investmentCount: number;
  lastUpdated: string | null;
}

export interface PortfolioAnalysis {
  bondCount: number;
  stockCount: number;
  cryptoCount: number;
  cashCount: number;
  totalBondValue: number;
  totalAnnualCouponIncome: number;
  allBondPayments: any[];
  upcomingBondPayments: any[];
}

export interface PortfolioContext {
  currentDateFormatted: string;
  currentTime: string;
  totalValue: number;
  totalInvested: number;
  totalGainLoss: number;
  totalGainLossPercentage: number;
  investments: Investment[];
  portfolioAnalysis: PortfolioAnalysis;
  currency: string;
  exchangeRates: Record<string, number>;
  lastUpdated: string | null;
}

export class PortfolioService {
  private priceService: PriceService;

  constructor() {
    this.priceService = new PriceService();
  }

  /**
   * Calculate portfolio summary from investments
   */
  calculatePortfolioSummary(investments: Investment[]): PortfolioSummary {
    return calculatePortfolioSummary(investments);
  }

  /**
   * Analyze portfolio composition and bond details
   */
  analyzePortfolio(investments: Investment[]): PortfolioAnalysis {
    const bonds = getBonds(investments);
    const stocks = getStocks(investments);
    const crypto = getCrypto(investments);
    const cash = getCash(investments);

    const totalBondValue = calculateTotalBondValue(investments);
    const totalAnnualCouponIncome = calculateTotalAnnualCouponIncome(investments);

    // Generate bond payment information
    const allBondPayments = bonds.map(inv => {
      const faceValue = inv.faceValue || inv.purchasePrice * inv.quantity;
      const annualYield = (inv.fixedYield || 0) / 100;
      
      // Use user-provided payment frequency directly (trust user input)
      const paymentFrequency = inv.paymentFrequency || 'semi-annual';
      const perPaymentAmount = calculatePaymentAmount(faceValue, annualYield, paymentFrequency);

      return {
        symbol: inv.symbol,
        name: inv.name,
        paymentAmount: perPaymentAmount,
        paymentFrequency,
        nextPaymentDate: inv.nextPaymentDate,
        maturityDate: inv.maturityDate,
        fixedYield: inv.fixedYield,
        hasSpecificDate: !!(inv.nextPaymentDate || inv.lastPaymentDate),
        isOverdue: inv.nextPaymentDate ? new Date(inv.nextPaymentDate) < new Date() : false,
        relativeTiming: inv.nextPaymentDate ? this.getRelativeTiming(inv.nextPaymentDate) : undefined
      };
    });

    const upcomingBondPayments = allBondPayments
      .filter(payment => payment.nextPaymentDate && new Date(payment.nextPaymentDate) >= new Date())
      .sort((a, b) => new Date(a.nextPaymentDate).getTime() - new Date(b.nextPaymentDate).getTime());

    return {
      bondCount: bonds.length,
      stockCount: stocks.length,
      cryptoCount: crypto.length,
      cashCount: cash.length,
      totalBondValue,
      totalAnnualCouponIncome,
      allBondPayments,
      upcomingBondPayments
    };
  }

  /**
   * Build comprehensive portfolio context for AI
   */
  async buildPortfolioContext(
    investments: Investment[],
    currency: string = 'USD',
    exchangeRates: Record<string, number> = {}
  ): Promise<PortfolioContext> {
    const now = new Date();
    const summary = this.calculatePortfolioSummary(investments);
    const analysis = this.analyzePortfolio(investments);

    return {
      currentDateFormatted: now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      currentTime: now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
      }),
      totalValue: summary.totalValue,
      totalInvested: summary.totalInvested,
      totalGainLoss: summary.totalGainLoss,
      totalGainLossPercentage: summary.totalGainLossPercentage,
      investments,
      portfolioAnalysis: analysis,
      currency,
      exchangeRates,
      lastUpdated: summary.lastUpdated
    };
  }

  /**
   * Add a new investment to the portfolio
   */
  addInvestment(
    investments: Investment[],
    newInvestment: Omit<Investment, 'id'>
  ): { updatedInvestments: Investment[]; summary: PortfolioSummary } {
    const investment: Investment = {
      ...newInvestment,
      id: crypto.randomUUID(),
      currentPrice: newInvestment.purchasePrice, // Initially same as purchase price
      lastUpdated: new Date().toISOString()
    };

    const updatedInvestments = [...investments, investment];
    const summary = this.calculatePortfolioSummary(updatedInvestments);

    return { updatedInvestments, summary };
  }

  /**
   * Update an existing investment
   */
  updateInvestment(
    investments: Investment[],
    id: string,
    updates: Partial<Investment>
  ): { updatedInvestments: Investment[]; summary: PortfolioSummary } {
    const investmentIndex = investments.findIndex(inv => inv.id === id);
    
    if (investmentIndex === -1) {
      throw new Error(`Investment with ID ${id} not found`);
    }

    const updatedInvestments = [...investments];
    updatedInvestments[investmentIndex] = {
      ...updatedInvestments[investmentIndex],
      ...updates,
      lastUpdated: new Date().toISOString()
    };

    const summary = this.calculatePortfolioSummary(updatedInvestments);

    return { updatedInvestments, summary };
  }

  /**
   * Remove an investment from the portfolio
   */
  removeInvestment(
    investments: Investment[],
    id: string
  ): { updatedInvestments: Investment[]; summary: PortfolioSummary; removedInvestment: Investment } {
    const investmentIndex = investments.findIndex(inv => inv.id === id);
    
    if (investmentIndex === -1) {
      throw new Error(`Investment with ID ${id} not found`);
    }

    const removedInvestment = investments[investmentIndex];
    const updatedInvestments = investments.filter(inv => inv.id !== id);
    const summary = this.calculatePortfolioSummary(updatedInvestments);

    return { updatedInvestments, summary, removedInvestment };
  }

  /**
   * List investments with optional filtering
   */
  listInvestments(
    investments: Investment[],
    filters?: { type?: string; symbol?: string }
  ): Investment[] {
    return filterInvestments(investments, filters || {});
  }

  /**
   * Refresh prices for all investments
   */
  async refreshAllPrices(investments: Investment[]): Promise<{
    updatedInvestments: Investment[];
    summary: PortfolioSummary;
    priceResults: Array<{
      symbol: string;
      type: string;
      oldPrice: number;
      newPrice: number;
      priceChange: number;
      priceChangePercent: number;
      success: boolean;
      timestamp: string;
    }>;
  }> {
    const priceResults = [];
    const updatedInvestments = [];

    for (const investment of investments) {
      try {
        const oldPrice = investment.currentPrice || investment.purchasePrice;
        const updatedInvestment = await this.priceService.updateInvestmentPrice(investment);
        const newPrice = updatedInvestment.currentPrice || investment.purchasePrice;
        
        const priceChange = newPrice - oldPrice;
        const priceChangePercent = oldPrice > 0 ? (priceChange / oldPrice) * 100 : 0;

        priceResults.push({
          symbol: investment.symbol,
          type: investment.type,
          oldPrice,
          newPrice,
          priceChange,
          priceChangePercent,
          success: true,
          timestamp: new Date().toISOString()
        });

        updatedInvestments.push(updatedInvestment);
      } catch (error) {
        console.error(`Error updating price for ${investment.symbol}:`, error);
        
        priceResults.push({
          symbol: investment.symbol,
          type: investment.type,
          oldPrice: investment.currentPrice || investment.purchasePrice,
          newPrice: investment.currentPrice || investment.purchasePrice,
          priceChange: 0,
          priceChangePercent: 0,
          success: false,
          timestamp: new Date().toISOString()
        });

        updatedInvestments.push(investment); // Keep original if update failed
      }
    }

    const summary = this.calculatePortfolioSummary(updatedInvestments);

    return {
      updatedInvestments,
      summary,
      priceResults
    };
  }

  /**
   * Get relative timing description for payment dates
   */
  private getRelativeTiming(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return `${Math.abs(diffDays)} days overdue`;
    } else if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Tomorrow';
    } else if (diffDays <= 7) {
      return `In ${diffDays} days`;
    } else if (diffDays <= 30) {
      const weeks = Math.ceil(diffDays / 7);
      return `In ${weeks} week${weeks > 1 ? 's' : ''}`;
    } else {
      const months = Math.ceil(diffDays / 30);
      return `In ${months} month${months > 1 ? 's' : ''}`;
    }
  }

  /**
   * Analyze portfolio performance
   */
  analyzePerformance(
    investments: Investment[],
    analysisType: 'performance' | 'risk' | 'diversification' | 'bonds' | 'overview' = 'performance',
    timeframe: string = 'all time'
  ) {
    const summary = this.calculatePortfolioSummary(investments);
    const analysis = this.analyzePortfolio(investments);

    switch (analysisType) {
      case 'performance':
        return {
          analysisType,
          timeframe,
          timestamp: new Date().toISOString(),
          results: {
            totalValue: summary.totalValue,
            totalInvested: summary.totalInvested,
            totalGainLoss: summary.totalGainLoss,
            totalGainLossPercentage: summary.totalGainLossPercentage,
            bestPerformer: investments.reduce((best, inv) => {
              const currentReturn = ((inv.currentPrice - inv.purchasePrice) / inv.purchasePrice) * 100;
              const bestReturn = ((best.currentPrice - best.purchasePrice) / best.purchasePrice) * 100;
              return currentReturn > bestReturn ? inv : best;
            }),
            worstPerformer: investments.reduce((worst, inv) => {
              const currentReturn = ((inv.currentPrice - inv.purchasePrice) / inv.purchasePrice) * 100;
              const worstReturn = ((worst.currentPrice - worst.purchasePrice) / worst.purchasePrice) * 100;
              return currentReturn < worstReturn ? inv : worst;
            })
          }
        };

      case 'bonds':
        return {
          analysisType,
          timeframe,
          timestamp: new Date().toISOString(),
          results: {
            bondCount: analysis.bondCount,
            totalBondValue: analysis.totalBondValue,
            totalAnnualCouponIncome: analysis.totalAnnualCouponIncome,
            upcomingPayments: analysis.upcomingBondPayments.map(payment => ({
              symbol: payment.symbol,
              nextPayment: payment.nextPaymentDate,
              amount: payment.paymentAmount
            }))
          }
        };

      case 'overview':
        return {
          analysisType,
          timeframe,
          timestamp: new Date().toISOString(),
          results: {
            summary: `Portfolio overview for ${timeframe}`,
            totalInvestments: investments.length,
            assetAllocation: {
              stocks: analysis.stockCount,
              bonds: analysis.bondCount,
              crypto: analysis.cryptoCount,
              cash: analysis.cashCount
            }
          }
        };

      default:
        return {
          analysisType,
          timeframe,
          timestamp: new Date().toISOString(),
          results: { message: 'Analysis type not implemented' }
        };
    }
  }
}
