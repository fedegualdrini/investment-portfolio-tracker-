import type { Investment } from '../types/investment';
import { PortfolioService } from './portfolioService';
import { BondAnalysisService } from './bondAnalysisService';

export interface PerformanceAnalysis {
  totalReturn: number;
  totalReturnPercentage: number;
  bestPerformer: Investment | null;
  worstPerformer: Investment | null;
  averageReturn: number;
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
}

export interface RiskAnalysis {
  concentrationRisk: {
    byType: Record<string, number>;
    bySymbol: Array<{ symbol: string; percentage: number }>;
  };
  volatility: number;
  beta: number;
  valueAtRisk: number;
  riskScore: number;
}

export interface DiversificationAnalysis {
  assetAllocation: Record<string, { count: number; value: number; percentage: number }>;
  geographicDiversification: Record<string, number>;
  sectorDiversification: Record<string, number>;
  diversificationScore: number;
}

export interface BondAnalysis {
  totalBondValue: number;
  totalAnnualIncome: number;
  averageYield: number;
  averageMaturity: number;
  yieldToMaturity: number;
  duration: number;
  creditQuality: string;
  upcomingPayments: Array<{
    symbol: string;
    date: string;
    amount: number;
    daysUntil: number;
  }>;
}

export interface ComprehensiveAnalysis {
  performance: PerformanceAnalysis;
  risk: RiskAnalysis;
  diversification: DiversificationAnalysis;
  bonds: BondAnalysis;
  summary: {
    overallScore: number;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  };
}

export class AnalysisService {
  private portfolioService: PortfolioService;
  private bondAnalysisService: BondAnalysisService;

  constructor() {
    this.portfolioService = new PortfolioService();
    this.bondAnalysisService = new BondAnalysisService();
  }

  /**
   * Perform comprehensive portfolio analysis
   */
  async analyzePortfolio(investments: Investment[]): Promise<ComprehensiveAnalysis> {
    const performance = this.analyzePerformance(investments);
    const risk = this.analyzeRisk(investments);
    const diversification = this.analyzeDiversification(investments);
    const bonds = this.analyzeBonds(investments);

    const summary = this.generateSummary(performance, risk, diversification, bonds);

    return {
      performance,
      risk,
      diversification,
      bonds,
      summary
    };
  }

  /**
   * Analyze portfolio performance
   */
  analyzePerformance(investments: Investment[]): PerformanceAnalysis {
    if (investments.length === 0) {
      return {
        totalReturn: 0,
        totalReturnPercentage: 0,
        bestPerformer: null,
        worstPerformer: null,
        averageReturn: 0,
        volatility: 0,
        sharpeRatio: 0,
        maxDrawdown: 0
      };
    }

    const returns = investments.map(inv => {
      const currentValue = (inv.currentPrice || inv.purchasePrice) * inv.quantity;
      const investedValue = inv.purchasePrice * inv.quantity;
      return (currentValue - investedValue) / investedValue;
    });

    const totalReturn = returns.reduce((sum, ret) => sum + ret, 0);
    const totalReturnPercentage = (totalReturn / investments.length) * 100;
    const averageReturn = totalReturn / investments.length;

    // Find best and worst performers
    const bestPerformer = investments.reduce((best, inv) => {
      const currentReturn = ((inv.currentPrice || inv.purchasePrice) - inv.purchasePrice) / inv.purchasePrice;
      const bestReturn = ((best.currentPrice || best.purchasePrice) - best.purchasePrice) / best.purchasePrice;
      return currentReturn > bestReturn ? inv : best;
    });

    const worstPerformer = investments.reduce((worst, inv) => {
      const currentReturn = ((inv.currentPrice || inv.purchasePrice) - inv.purchasePrice) / inv.purchasePrice;
      const worstReturn = ((worst.currentPrice || worst.purchasePrice) - worst.purchasePrice) / worst.purchasePrice;
      return currentReturn < worstReturn ? inv : worst;
    });

    // Calculate volatility (standard deviation of returns)
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - averageReturn, 2), 0) / returns.length;
    const volatility = Math.sqrt(variance);

    // Simple Sharpe ratio (assuming risk-free rate of 2%)
    const riskFreeRate = 0.02;
    const sharpeRatio = volatility > 0 ? (averageReturn - riskFreeRate) / volatility : 0;

    // Calculate max drawdown (simplified)
    const maxDrawdown = Math.min(...returns);

    return {
      totalReturn,
      totalReturnPercentage,
      bestPerformer,
      worstPerformer,
      averageReturn,
      volatility,
      sharpeRatio,
      maxDrawdown
    };
  }

  /**
   * Analyze portfolio risk
   */
  analyzeRisk(investments: Investment[]): RiskAnalysis {
    if (investments.length === 0) {
      return {
        concentrationRisk: { byType: {}, bySymbol: [] },
        volatility: 0,
        beta: 1,
        valueAtRisk: 0,
        riskScore: 0
      };
    }

    const totalValue = investments.reduce((sum, inv) => 
      sum + (inv.currentPrice || inv.purchasePrice) * inv.quantity, 0
    );

    // Concentration by type
    const byType: Record<string, number> = {};
    investments.forEach(inv => {
      byType[inv.type] = (byType[inv.type] || 0) + 
        ((inv.currentPrice || inv.purchasePrice) * inv.quantity / totalValue) * 100;
    });

    // Concentration by symbol
    const bySymbol = investments
      .map(inv => ({
        symbol: inv.symbol,
        percentage: ((inv.currentPrice || inv.purchasePrice) * inv.quantity / totalValue) * 100
      }))
      .sort((a, b) => b.percentage - a.percentage);

    // Calculate volatility
    const returns = investments.map(inv => {
      const currentValue = (inv.currentPrice || inv.purchasePrice) * inv.quantity;
      const investedValue = inv.purchasePrice * inv.quantity;
      return (currentValue - investedValue) / investedValue;
    });

    const averageReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - averageReturn, 2), 0) / returns.length;
    const volatility = Math.sqrt(variance);

    // Simple beta calculation (assuming market beta of 1)
    const beta = 1; // This would need historical data for proper calculation

    // Value at Risk (95% confidence, simplified)
    const sortedReturns = returns.sort((a, b) => a - b);
    const varIndex = Math.floor(sortedReturns.length * 0.05);
    const valueAtRisk = sortedReturns[varIndex] || 0;

    // Risk score (0-100, higher is riskier)
    const concentrationRisk = Math.max(...Object.values(byType));
    const riskScore = Math.min(100, (volatility * 100) + (concentrationRisk * 0.5));

    return {
      concentrationRisk: { byType, bySymbol },
      volatility,
      beta,
      valueAtRisk,
      riskScore
    };
  }

  /**
   * Analyze portfolio diversification
   */
  analyzeDiversification(investments: Investment[]): DiversificationAnalysis {
    if (investments.length === 0) {
      return {
        assetAllocation: {},
        geographicDiversification: {},
        sectorDiversification: {},
        diversificationScore: 0
      };
    }

    const totalValue = investments.reduce((sum, inv) => 
      sum + (inv.currentPrice || inv.purchasePrice) * inv.quantity, 0
    );

    // Asset allocation
    const assetAllocation: Record<string, { count: number; value: number; percentage: number }> = {};
    investments.forEach(inv => {
      const value = (inv.currentPrice || inv.purchasePrice) * inv.quantity;
      if (!assetAllocation[inv.type]) {
        assetAllocation[inv.type] = { count: 0, value: 0, percentage: 0 };
      }
      assetAllocation[inv.type].count++;
      assetAllocation[inv.type].value += value;
    });

    // Calculate percentages
    Object.keys(assetAllocation).forEach(type => {
      assetAllocation[type].percentage = (assetAllocation[type].value / totalValue) * 100;
    });

    // Geographic diversification (simplified - would need more data)
    const geographicDiversification: Record<string, number> = {
      'US': 0,
      'International': 0,
      'Emerging Markets': 0
    };

    // Sector diversification (simplified - would need more data)
    const sectorDiversification: Record<string, number> = {
      'Technology': 0,
      'Healthcare': 0,
      'Financial': 0,
      'Consumer': 0,
      'Industrial': 0,
      'Other': 0
    };

    // Diversification score (0-100, higher is better)
    const typeCount = Object.keys(assetAllocation).length;
    const maxAllocation = Math.max(...Object.values(assetAllocation).map(a => a.percentage));
    const diversificationScore = Math.min(100, (typeCount * 20) - (maxAllocation * 0.5));

    return {
      assetAllocation,
      geographicDiversification,
      sectorDiversification,
      diversificationScore
    };
  }

  /**
   * Analyze bond portfolio
   */
  analyzeBonds(investments: Investment[]): BondAnalysis {
    const bonds = investments.filter(inv => inv.type === 'bond');

    if (bonds.length === 0) {
      return {
        totalBondValue: 0,
        totalAnnualIncome: 0,
        averageYield: 0,
        averageMaturity: 0,
        yieldToMaturity: 0,
        duration: 0,
        creditQuality: 'N/A',
        upcomingPayments: []
      };
    }

    const totalBondValue = bonds.reduce((sum, inv) => 
      sum + (inv.currentPrice || inv.purchasePrice) * inv.quantity, 0
    );

    const totalAnnualIncome = bonds.reduce((sum, inv) => {
      const faceValue = inv.faceValue || inv.purchasePrice * inv.quantity;
      return sum + (inv.fixedYield || 0) * faceValue / 100;
    }, 0);

    const averageYield = bonds.reduce((sum, inv) => sum + (inv.fixedYield || 0), 0) / bonds.length;

    // Calculate average maturity (simplified)
    const bondsWithMaturity = bonds.filter(inv => inv.maturityDate);
    const averageMaturity = bondsWithMaturity.length > 0 
      ? bondsWithMaturity.reduce((sum, inv) => {
          const maturity = new Date(inv.maturityDate!);
          const now = new Date();
          const yearsToMaturity = (maturity.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 365);
          return sum + yearsToMaturity;
        }, 0) / bondsWithMaturity.length
      : 0;

    // Generate upcoming payments
    const upcomingPayments = bonds
      .filter(inv => inv.nextPaymentDate)
      .map(inv => {
        const paymentDate = new Date(inv.nextPaymentDate!);
        const now = new Date();
        const daysUntil = Math.ceil((paymentDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        const faceValue = inv.faceValue || inv.purchasePrice * inv.quantity;
        const annualYield = (inv.fixedYield || 0) / 100;
        
        // Use user-provided payment frequency to calculate correct payment amount
        const paymentFrequency = inv.paymentFrequency || 'semi-annual';
        let paymentsPerYear = 2; // Default to semi-annual
        
        switch (paymentFrequency) {
          case 'monthly': paymentsPerYear = 12; break;
          case 'quarterly': paymentsPerYear = 4; break;
          case 'semi-annual': paymentsPerYear = 2; break;
          case 'annual': paymentsPerYear = 1; break;
          case 'zero-coupon': paymentsPerYear = 0; break;
        }
        
        const paymentAmount = paymentsPerYear > 0 ? (faceValue * annualYield) / paymentsPerYear : 0;

        return {
          symbol: inv.symbol,
          date: inv.nextPaymentDate!,
          amount: paymentAmount,
          daysUntil
        };
      })
      .filter(payment => payment.daysUntil >= 0)
      .sort((a, b) => a.daysUntil - b.daysUntil);

    return {
      totalBondValue,
      totalAnnualIncome,
      averageYield,
      averageMaturity,
      yieldToMaturity: averageYield, // Simplified
      duration: averageMaturity, // Simplified
      creditQuality: 'Investment Grade', // Simplified
      upcomingPayments
    };
  }

  /**
   * Generate analysis summary with recommendations
   */
  private generateSummary(
    performance: PerformanceAnalysis,
    risk: RiskAnalysis,
    diversification: DiversificationAnalysis,
    bonds: BondAnalysis
  ): { overallScore: number; strengths: string[]; weaknesses: string[]; recommendations: string[] } {
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const recommendations: string[] = [];

    // Performance analysis
    if (performance.totalReturnPercentage > 10) {
      strengths.push('Strong overall returns');
    } else if (performance.totalReturnPercentage < 0) {
      weaknesses.push('Negative returns');
      recommendations.push('Review underperforming investments');
    }

    if (performance.sharpeRatio > 1) {
      strengths.push('Good risk-adjusted returns');
    } else if (performance.sharpeRatio < 0.5) {
      weaknesses.push('Poor risk-adjusted returns');
      recommendations.push('Consider rebalancing for better risk-return profile');
    }

    // Risk analysis
    if (risk.riskScore < 30) {
      strengths.push('Low portfolio risk');
    } else if (risk.riskScore > 70) {
      weaknesses.push('High portfolio risk');
      recommendations.push('Consider reducing concentration risk');
    }

    const maxConcentration = Math.max(...risk.concentrationRisk.bySymbol.map(s => s.percentage));
    if (maxConcentration > 20) {
      weaknesses.push('High concentration in individual positions');
      recommendations.push('Diversify individual holdings');
    }

    // Diversification analysis
    if (diversification.diversificationScore > 70) {
      strengths.push('Well-diversified portfolio');
    } else if (diversification.diversificationScore < 40) {
      weaknesses.push('Poor diversification');
      recommendations.push('Add more asset classes and sectors');
    }

    // Bond analysis
    if (bonds.totalBondValue > 0) {
      if (bonds.averageYield > 4) {
        strengths.push('Attractive bond yields');
      }
      if (bonds.upcomingPayments.length > 0) {
        strengths.push('Regular income from bonds');
      }
    } else {
      recommendations.push('Consider adding bonds for income and stability');
    }

    // Calculate overall score
    const performanceScore = Math.min(100, Math.max(0, (performance.totalReturnPercentage + 20) * 2));
    const riskScore = Math.min(100, Math.max(0, 100 - risk.riskScore));
    const diversificationScore = diversification.diversificationScore;
    
    const overallScore = (performanceScore + riskScore + diversificationScore) / 3;

    return {
      overallScore,
      strengths,
      weaknesses,
      recommendations
    };
  }

  /**
   * Generate analysis report for specific timeframe
   */
  analyzeTimeframe(
    investments: Investment[],
    timeframe: '1M' | '3M' | '6M' | '1Y' | 'YTD' | 'ALL'
  ): PerformanceAnalysis {
    // This would require historical data - for now return current analysis
    return this.analyzePerformance(investments);
  }

  /**
   * Compare portfolio to benchmark
   */
  compareToBenchmark(
    investments: Investment[],
    benchmark: 'SP500' | 'NASDAQ' | 'BOND' | 'CRYPTO'
  ): { portfolioReturn: number; benchmarkReturn: number; alpha: number } {
    const performance = this.analyzePerformance(investments);
    
    // Mock benchmark returns (would need real data)
    const benchmarkReturns: Record<string, number> = {
      'SP500': 8.5,
      'NASDAQ': 12.3,
      'BOND': 3.2,
      'CRYPTO': 25.7
    };

    const benchmarkReturn = benchmarkReturns[benchmark] || 0;
    const alpha = performance.totalReturnPercentage - benchmarkReturn;

    return {
      portfolioReturn: performance.totalReturnPercentage,
      benchmarkReturn,
      alpha
    };
  }
}
