import { useState, useCallback, useEffect } from 'react';
import type { Investment } from '../types/investment';
import type { WeeklyPulseNarrative } from '../lib/narrative/types';
import type { PortfolioAnalysis } from '../lib/analyzer/types';
import { analyzePortfolio } from '../lib/analyzer/portfolioAnalyzer';
import { generateWeeklyPulse } from '../lib/narrative/templateEngine';

const STORAGE_KEY_PREFIX = 'portfolio-pulse-';
const LAST_PULSE_KEY = 'portfolio-pulse-last';

interface PulseState {
  narrative: WeeklyPulseNarrative | null;
  analysis: PortfolioAnalysis | null;
  isLoading: boolean;
  error: string | null;
  lastGenerated: Date | null;
}

export function useWeeklyPulse(investments: Investment[]) {
  const [state, setState] = useState<PulseState>({
    narrative: null,
    analysis: null,
    isLoading: false,
    error: null,
    lastGenerated: null,
  });

  const loadSavedPulse = useCallback(() => {
    try {
      const saved = localStorage.getItem(LAST_PULSE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setState(prev => ({
          ...prev,
          narrative: parsed.narrative,
          analysis: parsed.analysis,
          lastGenerated: new Date(parsed.timestamp),
        }));
      }
    } catch (err) {
      console.warn('Failed to load saved pulse:', err);
    }
  }, []);

  useEffect(() => {
    loadSavedPulse();
  }, [loadSavedPulse]);

  const generatePulse = useCallback(async () => {
    if (investments.length === 0) {
      setState(prev => ({
        ...prev,
        error: 'No investments in portfolio',
      }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // TODO: Load previous total from storage for period comparison
      const previousTotal = state.lastGenerated
        ? state.analysis?.metrics.totalValue
        : undefined;

      const analysis = analyzePortfolio(investments, { previousTotal });
      const narrative = generateWeeklyPulse(analysis);

      const pulseData = {
        narrative,
        analysis,
        timestamp: new Date().toISOString(),
      };

      localStorage.setItem(LAST_PULSE_KEY, JSON.stringify(pulseData));

      setState({
        narrative,
        analysis,
        isLoading: false,
        error: null,
        lastGenerated: new Date(),
      });
    } catch (err) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to generate pulse',
      }));
    }
  }, [investments, state.analysis?.metrics.totalValue, state.lastGenerated]);

  const getPulseHistory = useCallback(() => {
    try {
      const history: WeeklyPulseNarrative[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(STORAGE_KEY_PREFIX) && key !== LAST_PULSE_KEY) {
          const item = localStorage.getItem(key);
          if (item) {
            history.push(JSON.parse(item).narrative);
          }
        }
      }
      return history.sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    } catch (err) {
      console.warn('Failed to load pulse history:', err);
      return [];
    }
  }, []);

  const savePulse = useCallback((narrative: WeeklyPulseNarrative) => {
    try {
      const key = `${STORAGE_KEY_PREFIX}${Date.now()}`;
      localStorage.setItem(key, JSON.stringify({
        narrative,
        timestamp: new Date().toISOString(),
      }));
    } catch (err) {
      console.warn('Failed to save pulse:', err);
    }
  }, []);

  return {
    narrative: state.narrative,
    analysis: state.analysis,
    isLoading: state.isLoading,
    error: state.error,
    lastGenerated: state.lastGenerated,
    generatePulse,
    getPulseHistory,
    savePulse,
  };
}
