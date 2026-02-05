import { describe, it, expect } from 'vitest';
import type { PortfolioAnalysis } from '../../src/lib/analyzer/types';
import {
  generateSummary,
  generatePerformanceSection,
  generateAllocationSection,
  generateTopMoversSection,
  generateWeeklyPulse,
} from '../../src/lib/narrative/templateEngine';

describe('Template Engine', () => {
  const mockAnalysis: PortfolioAnalysis = {
    metrics: {
      totalValue: 15000,
      totalInvested: 12000,
      absoluteGainLoss: 3000,
      gainLossPercent: 25,
      periodChange: {
        amount: 500,
        percent: 3.5,
        direction: 'up',
      },
    },
    allocation: {
      byAssetType: [
        { type: 'stock', value: 8000, percentage: 53.3 },
        { type: 'crypto', value: 5000, percentage: 33.3 },
        { type: 'bond', value: 2000, percentage: 13.4 },
      ],
      byHolding: [
        { symbol: 'AAPL', name: 'Apple', value: 5000, percentage: 33.3, type: 'stock' },
        { symbol: 'BTC', name: 'Bitcoin', value: 5000, percentage: 33.3, type: 'crypto' },
        { symbol: 'TLT', name: 'Treasury', value: 2000, percentage: 13.4, type: 'bond' },
      ],
      largestPosition: { symbol: 'AAPL', percentage: 33.3 },
      concentrationRisk: 'high',
    },
    trends: {
      bestPerformer: { symbol: 'BTC', changePercent: 15 },
      worstPerformer: { symbol: 'TLT', changePercent: -2.5 },
      newHighs: [],
      newLows: [],
    },
    milestones: [],
    timestamp: new Date().toISOString(),
  };

  describe('generateSummary', () => {
    it('generates performance summary', () => {
      const summary = generateSummary(mockAnalysis);

      expect(summary).toContain('$500');
      expect(summary).toContain('up');
      expect(summary.length).toBeGreaterThan(10);
    });

    it('handles different directions', () => {
      const downAnalysis = {
        ...mockAnalysis,
        metrics: {
          ...mockAnalysis.metrics,
          periodChange: { amount: 300, percent: 2, direction: 'down' as const },
        },
      };

      const summary = generateSummary(downAnalysis);
      expect(summary).toContain('down');
    });

    it('returns total value when no period change', () => {
      const noChangeAnalysis = {
        ...mockAnalysis,
        metrics: {
          ...mockAnalysis.metrics,
          periodChange: { amount: 0, percent: 0, direction: 'unchanged' as const },
        },
      };

      const summary = generateSummary(noChangeAnalysis);
      expect(summary).toContain('$15,000');
    });
  });

  describe('generatePerformanceSection', () => {
    it('creates performance section with heading and body', () => {
      const section = generatePerformanceSection(mockAnalysis);

      expect(section.heading).toBe('Performance Summary');
      expect(section.body).toContain('Total value');
      expect(section.body).toContain('$15,000');
    });
  });

  describe('generateAllocationSection', () => {
    it('creates allocation section', () => {
      const section = generateAllocationSection(mockAnalysis);

      expect(section.heading).toBe('Asset Allocation');
      expect(section.body).toContain('stock');
      expect(section.body).toContain('53.3%');
    });

    it('mentions largest position when >20%', () => {
      const section = generateAllocationSection(mockAnalysis);

      expect(section.body).toContain('AAPL');
    });

    it('handles empty portfolio', () => {
      const emptyAnalysis = { ...mockAnalysis, allocation: { byAssetType: [], byHolding: [], largestPosition: { symbol: '', percentage: 0 } } };
      const section = generateAllocationSection(emptyAnalysis);

      expect(section.body).toContain('No allocation data');
    });
  });

  describe('generateTopMoversSection', () => {
    it('creates top movers section when performers exist', () => {
      const section = generateTopMoversSection(mockAnalysis);

      expect(section).not.toBeNull();
      expect(section!.heading).toBe('Notable Movements');
      expect(section!.body).toContain('BTC');
    });

    it('returns null when no significant movements', () => {
      const noMovers = {
        ...mockAnalysis,
        trends: { bestPerformer: null, worstPerformer: null, newHighs: [], newLows: [] },
      };
      const section = generateTopMoversSection(noMovers);

      expect(section).toBeNull();
    });
  });

  describe('generateWeeklyPulse', () => {
    it('generates complete pulse object', () => {
      const pulse = generateWeeklyPulse(mockAnalysis);

      expect(pulse.title).toBe('Portfolio Pulse');
      expect(pulse.date).toBeDefined();
      expect(pulse.summary).toBeDefined();
      expect(pulse.sections.length).toBeGreaterThan(0);
      expect(pulse.highlights.length).toBeGreaterThan(0);
      expect(pulse.disclaimer).toContain('Not financial advice');
    });

    it('includes disclaimer in all pulses', () => {
      const pulse = generateWeeklyPulse(mockAnalysis);

      expect(pulse.disclaimer.toLowerCase()).toContain('not financial advice');
      expect(pulse.disclaimer.toLowerCase()).toContain('educational');
    });

    it('includes educational context', () => {
      const pulse = generateWeeklyPulse(mockAnalysis);

      const contextSection = pulse.sections.find(s => s.heading === 'Context');
      expect(contextSection).toBeDefined();
    });
  });

  describe('template variety', () => {
    it('produces different narratives on multiple runs', () => {
      const summaries: string[] = [];

      for (let i = 0; i < 10; i++) {
        summaries.push(generateSummary(mockAnalysis));
      }

      const uniqueSummaries = new Set(summaries);
      expect(uniqueSummaries.size).toBeGreaterThan(1);
    });
  });
});
