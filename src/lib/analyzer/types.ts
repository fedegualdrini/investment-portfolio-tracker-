/**
 * Types for portfolio analysis and narrative generation
 */

export interface PortfolioMetrics {
  totalValue: number;
  totalInvested: number;
  absoluteGainLoss: number;
  gainLossPercent: number;
  periodChange: {
    amount: number;
    percent: number;
    direction: 'up' | 'down' | 'unchanged';
  };
}

export interface AllocationBreakdown {
  byAssetType: {
    type: string;
    value: number;
    percentage: number;
  }[];
  byHolding: {
    symbol: string;
    name: string;
    value: number;
    percentage: number;
    type: string;
  }[];
  largestPosition: {
    symbol: string;
    percentage: number;
  };
  concentrationRisk?: string;
}

export interface TrendData {
  bestPerformer: {
    symbol: string;
    changePercent: number;
  } | null;
  worstPerformer: {
    symbol: string;
    changePercent: number;
  } | null;
  newHighs: string[];
  newLows: string[];
}

export interface MilestoneData {
  crossed: boolean;
  threshold: number;
  direction: 'above' | 'below';
  message: string;
}

export interface PortfolioAnalysis {
  metrics: PortfolioMetrics;
  allocation: AllocationBreakdown;
  trends: TrendData;
  milestones: MilestoneData[];
  timestamp: string;
}
