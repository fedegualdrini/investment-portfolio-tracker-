import type { Investment, PortfolioSummary } from '../../types/investment';
import type {
  PortfolioMetrics,
  AllocationBreakdown,
  TrendData,
  MilestoneData,
  PortfolioAnalysis,
} from './types';

/**
 * Calculate portfolio performance metrics
 */
export function calculatePerformance(
  investments: Investment[],
  previousTotal?: number
): PortfolioMetrics {
  let totalValue = 0;
  let totalInvested = 0;

  investments.forEach(inv => {
    const price = inv.currentPrice ?? inv.purchasePrice;
    totalValue += price * inv.quantity;
    totalInvested += inv.purchasePrice * inv.quantity;
  });

  const absoluteGainLoss = totalValue - totalInvested;
  const gainLossPercent = totalInvested > 0 ? (absoluteGainLoss / totalInvested) * 100 : 0;

  let periodChange = { amount: 0, percent: 0, direction: 'unchanged' as const };

  if (previousTotal !== undefined && previousTotal > 0) {
    const change = totalValue - previousTotal;
    periodChange = {
      amount: Math.abs(change),
      percent: Math.abs((change / previousTotal) * 100),
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'unchanged',
    };
  }

  return {
    totalValue,
    totalInvested,
    absoluteGainLoss,
    gainLossPercent,
    periodChange,
  };
}

/**
 * Calculate allocation breakdown by asset type and holding
 */
export function calculateAllocation(investments: Investment[]): AllocationBreakdown {
  if (investments.length === 0) {
    return {
      byAssetType: [],
      byHolding: [],
      largestPosition: { symbol: '', percentage: 0 },
    };
  }

  const totalValue = investments.reduce((sum, inv) => {
    const price = inv.currentPrice ?? inv.purchasePrice;
    return sum + price * inv.quantity;
  }, 0);

  // By asset type
  const typeValues: Record<string, number> = {};
  investments.forEach(inv => {
    const price = inv.currentPrice ?? inv.purchasePrice;
    const value = price * inv.quantity;
    typeValues[inv.type] = (typeValues[inv.type] || 0) + value;
  });

  const byAssetType = Object.entries(typeValues)
    .map(([type, value]) => ({
      type,
      value,
      percentage: totalValue > 0 ? (value / totalValue) * 100 : 0,
    }))
    .sort((a, b) => b.value - a.value);

  // By individual holding
  const byHolding = investments
    .map(inv => {
      const price = inv.currentPrice ?? inv.purchasePrice;
      const value = price * inv.quantity;
      return {
        symbol: inv.symbol,
        name: inv.name,
        value,
        percentage: totalValue > 0 ? (value / totalValue) * 100 : 0,
        type: inv.type,
      };
    })
    .sort((a, b) => b.value - a.value);

  // Largest position
  const largestPosition = byHolding[0] || { symbol: '', percentage: 0 };

  // Simple concentration check (just for context, not advice)
  let concentrationRisk: string | undefined;
  if (largestPosition.percentage > 30) {
    concentrationRisk = 'high';
  } else if (largestPosition.percentage > 20) {
    concentrationRisk = 'moderate';
  }

  return {
    byAssetType,
    byHolding,
    largestPosition: {
      symbol: largestPosition.symbol,
      percentage: largestPosition.percentage,
    },
    concentrationRisk,
  };
}

/**
 * Detect trends: best/worst performers, new highs/lows
 */
export function detectTrends(
  investments: Investment[],
  previousPrices?: Record<string, number>
): TrendData {
  const performers: { symbol: string; changePercent: number }[] = [];
  const newHighs: string[] = [];
  const newLows: string[] = [];

  investments.forEach(inv => {
    const currentPrice = inv.currentPrice ?? inv.purchasePrice;
    const costBasis = inv.purchasePrice;

    // Calculate change from purchase (overall performance)
    const changePercent = costBasis > 0
      ? ((currentPrice - costBasis) / costBasis) * 100
      : 0;

    performers.push({ symbol: inv.symbol, changePercent });

    // Check for new highs/lows if we have previous price data
    if (previousPrices && previousPrices[inv.symbol] !== undefined) {
      const prev = previousPrices[inv.symbol];
      if (currentPrice > prev * 1.05) {
        newHighs.push(inv.symbol);
      } else if (currentPrice < prev * 0.95) {
        newLows.push(inv.symbol);
      }
    }
  });

  performers.sort((a, b) => b.changePercent - a.changePercent);

  return {
    bestPerformer: performers[0] || null,
    worstPerformer: performers[performers.length - 1] || null,
    newHighs,
    newLows,
  };
}

/**
 * Detect portfolio milestones crossed
 */
const MILESTONE_THRESHOLDS = [1000, 5000, 10000, 25000, 50000, 100000, 250000, 500000, 1000000];

export function detectMilestones(
  currentValue: number,
  previousValue?: number
): MilestoneData[] {
  const milestones: MilestoneData[] = [];

  if (previousValue === undefined || previousValue <= 0) {
    // First milestone check - just note current thresholds
    const closestThreshold = MILESTONE_THRESHOLDS.find(t => currentValue >= t);
    if (closestThreshold) {
      milestones.push({
        crossed: true,
        threshold: closestThreshold,
        direction: 'above',
        message: `Portfolio value is $${Math.round(currentValue).toLocaleString()}`,
      });
    }
    return milestones;
  }

  // Check if we crossed any thresholds going up
  for (const threshold of MILESTONE_THRESHOLDS) {
    if (previousValue < threshold && currentValue >= threshold) {
      milestones.push({
        crossed: true,
        threshold,
        direction: 'above',
        message: `Portfolio crossed $${threshold.toLocaleString()}`,
      });
    } else if (previousValue >= threshold && currentValue < threshold) {
      milestones.push({
        crossed: true,
        threshold,
        direction: 'below',
        message: `Portfolio dipped below $${threshold.toLocaleString()}`,
      });
    }
  }

  return milestones;
}

/**
 * Run complete portfolio analysis
 */
export function analyzePortfolio(
  investments: Investment[],
  options: {
    previousTotal?: number;
    previousPrices?: Record<string, number>;
  } = {}
): PortfolioAnalysis {
  const metrics = calculatePerformance(investments, options.previousTotal);
  const allocation = calculateAllocation(investments);
  const trends = detectTrends(investments, options.previousPrices);
  const milestones = detectMilestones(metrics.totalValue, options.previousTotal);

  return {
    metrics,
    allocation,
    trends,
    milestones,
    timestamp: new Date().toISOString(),
  };
}
