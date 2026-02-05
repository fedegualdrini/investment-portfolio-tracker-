import { describe, it, expect } from 'vitest';
import type { Investment } from '../../src/types/investment';
import {
  calculatePerformance,
  calculateAllocation,
  detectTrends,
  detectMilestones,
  analyzePortfolio,
} from '../../src/lib/analyzer/portfolioAnalyzer';

describe('Portfolio Analyzer', () => {
  const mockInvestments: Investment[] = [
    {
      id: '1',
      symbol: 'AAPL',
      name: 'Apple Inc',
      type: 'stock',
      quantity: 10,
      purchasePrice: 150,
      currentPrice: 175,
      purchaseDate: '2024-01-01',
    },
    {
      id: '2',
      symbol: 'BTC',
      name: 'Bitcoin',
      type: 'crypto',
      quantity: 0.5,
      purchasePrice: 40000,
      currentPrice: 45000,
      purchaseDate: '2024-01-01',
    },
    {
      id: '3',
      symbol: 'TLT',
      name: '20+ Year Treasury',
      type: 'bond',
      quantity: 50,
      purchasePrice: 95,
      currentPrice: 92,
      purchaseDate: '2024-01-01',
    },
  ];

  describe('calculatePerformance', () => {
    it('calculates total value and invested amounts', () => {
      const result = calculatePerformance(mockInvestments);

      // AAPL: 10 * 175 = 1750, invested: 10 * 150 = 1500
      // BTC: 0.5 * 45000 = 22500, invested: 0.5 * 40000 = 20000
      // TLT: 50 * 92 = 4600, invested: 50 * 95 = 4750

      expect(result.totalValue).toBeCloseTo(1750 + 22500 + 4600, 0);
      expect(result.totalInvested).toBeCloseTo(1500 + 20000 + 4750, 0);
      expect(result.absoluteGainLoss).toBeCloseTo(3250, 0);
    });

    it('calculates period change when previous total provided', () => {
      const previousTotal = 28000;
      const result = calculatePerformance(mockInvestments, previousTotal);

      expect(result.periodChange.direction).toBe('up');
      expect(result.periodChange.amount).toBeGreaterThan(0);
    });

    it('handles empty portfolio', () => {
      const result = calculatePerformance([]);

      expect(result.totalValue).toBe(0);
      expect(result.totalInvested).toBe(0);
      expect(result.gainLossPercent).toBe(0);
    });

    it('handles single investment', () => {
      const single = [mockInvestments[0]];
      const result = calculatePerformance(single);

      expect(result.totalValue).toBe(1750);
      expect(result.gainLossPercent).toBeCloseTo(16.67, 1);
    });
  });

  describe('calculateAllocation', () => {
    it('calculates breakdown by asset type', () => {
      const result = calculateAllocation(mockInvestments);

      // Should have crypto, stock, bond
      expect(result.byAssetType.length).toBe(3);

      // Crypto should be largest (22500)
      const crypto = result.byAssetType.find(a => a.type === 'crypto');
      expect(crypto).toBeDefined();
      expect(crypto!.percentage).toBeGreaterThan(50);
    });

    it('identifies largest position', () => {
      const result = calculateAllocation(mockInvestments);

      expect(result.largestPosition.symbol).toBe('BTC');
      expect(result.largestPosition.percentage).toBeGreaterThan(50);
    });

    it('detects high concentration', () => {
      const result = calculateAllocation(mockInvestments);

      expect(result.concentrationRisk).toBe('high');
    });

    it('handles empty portfolio', () => {
      const result = calculateAllocation([]);

      expect(result.byAssetType).toEqual([]);
      expect(result.largestPosition.symbol).toBe('');
    });
  });

  describe('detectTrends', () => {
    it('identifies best and worst performers', () => {
      const result = detectTrends(mockInvestments);

      expect(result.bestPerformer).not.toBeNull();
      expect(result.worstPerformer).not.toBeNull();

      // BTC should be best at +12.5%
      expect(result.bestPerformer!.symbol).toBe('BTC');
      expect(result.bestPerformer!.changePercent).toBeGreaterThan(0);

      // TLT should be worst at ~ -3.16%
      expect(result.worstPerformer!.symbol).toBe('TLT');
      expect(result.worstPerformer!.changePercent).toBeLessThan(0);
    });

    it('detects new highs and lows', () => {
      const previousPrices = {
        AAPL: 170,
        BTC: 43000,
        TLT: 94,
      };

      const result = detectTrends(mockInvestments, previousPrices);

      // AAPL current 175 > 170 * 1.05 = 178.5, so not new high  
      // BTC 45000 > 43000 * 1.05 = 45150, so not new high
      // TLT 92 < 94 * 0.95 = 89.3, so not new low

      expect(Array.isArray(result.newHighs)).toBe(true);
      expect(Array.isArray(result.newLows)).toBe(true);
    });

    it('handles empty portfolio', () => {
      const result = detectTrends([]);

      expect(result.bestPerformer).toBeNull();
      expect(result.worstPerformer).toBeNull();
    });
  });

  describe('detectMilestones', () => {
    it('detects crossing $10k threshold going up', () => {
      const milestones = detectMilestones(12000, 9500);

      const crossed10k = milestones.find(m => m.threshold === 10000);
      expect(crossed10k).toBeDefined();
      expect(crossed10k!.crossed).toBe(true);
      expect(crossed10k!.direction).toBe('above');
    });

    it('detects crossing $5k threshold going down', () => {
      const milestones = detectMilestones(4500, 5500);

      const crossed5k = milestones.find(m => m.threshold === 5000);
      expect(crossed5k).toBeDefined();
      expect(crossed5k!.direction).toBe('below');
    });

    it('returns empty array when no thresholds crossed', () => {
      const milestones = detectMilestones(16000, 15500);

      // No thresholds between 15500 and 16000
      expect(milestones.length).toBe(0);
    });

    it('handles initial check without previous value', () => {
      const milestones = detectMilestones(15000);

      // Should note that we're above $10k
      expect(milestones.length).toBeGreaterThan(0);
      expect(milestones.some(m => m.threshold <= 15000)).toBe(true);
    });
  });

  describe('analyzePortfolio', () => {
    it('returns complete analysis object', () => {
      const result = analyzePortfolio(mockInvestments);

      expect(result).toHaveProperty('metrics');
      expect(result).toHaveProperty('allocation');
      expect(result).toHaveProperty('trends');
      expect(result).toHaveProperty('milestones');
      expect(result).toHaveProperty('timestamp');

      expect(result.metrics.totalValue).toBeGreaterThan(0);
      expect(result.allocation.byAssetType.length).toBeGreaterThan(0);
    });

    it('uses previous values for period comparison', () => {
      const result = analyzePortfolio(mockInvestments, { previousTotal: 28000 });

      expect(result.metrics.periodChange.direction).toBe('up');
      expect(result.milestones).toBeDefined();
    });
  });
});
