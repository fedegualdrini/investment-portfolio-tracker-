import { useState, useEffect, useCallback } from 'react';
import type { Investment, PortfolioSummary } from '../types/investment';
import { PriceService } from '../services/priceService';

const STORAGE_KEY = 'investment-portfolio';
const priceService = new PriceService();

export function useInvestments() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Load investments from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsedInvestments = JSON.parse(stored);
        setInvestments(parsedInvestments);
      } catch (error) {
        console.error('Error parsing stored investments:', error);
      }
    }
  }, []);

  // Save to localStorage whenever investments change
  useEffect(() => {
    if (investments.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(investments));
    }
  }, [investments]);

  const addInvestment = useCallback((investment: Omit<Investment, 'id'>) => {
    const newInvestment: Investment = {
      ...investment,
      id: crypto.randomUUID(),
    };
    setInvestments(prev => [...prev, newInvestment]);
  }, []);

  const updateInvestment = useCallback((id: string, updates: Partial<Investment>) => {
    setInvestments(prev =>
      prev.map(investment =>
        investment.id === id ? { ...investment, ...updates } : investment
      )
    );
  }, []);

  const removeInvestment = useCallback((id: string) => {
    setInvestments(prev => prev.filter(investment => investment.id !== id));
  }, []);

  const updatePrices = useCallback(async () => {
    if (investments.length === 0) return;
    
    setIsLoading(true);
    try {
      const updatedInvestments = await priceService.updateAllPrices(investments);
      setInvestments(updatedInvestments);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error updating prices:', error);
    } finally {
      setIsLoading(false);
    }
  }, [investments]);

  const calculatePortfolioSummary = useCallback((): PortfolioSummary => {
    let totalValue = 0;
    let totalInvested = 0;
    const investmentsByType: Record<string, number> = {};

    investments.forEach(investment => {
      const currentValue = (investment.currentPrice || investment.purchasePrice) * investment.quantity;
      const investedValue = investment.purchasePrice * investment.quantity;
      
      totalValue += currentValue;
      totalInvested += investedValue;
      
      investmentsByType[investment.type] = (investmentsByType[investment.type] || 0) + currentValue;
    });

    const totalGainLoss = totalValue - totalInvested;
    const totalGainLossPercentage = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;

    return {
      totalValue,
      totalInvested,
      totalGainLoss,
      totalGainLossPercentage,
      investmentsByType: investmentsByType as Record<any, number>,
    };
  }, [investments]);

  const exportPortfolio = useCallback(() => {
    const portfolio = {
      investments,
      summary: calculatePortfolioSummary(),
      exportDate: new Date().toISOString(),
      version: '1.0.0',
    };

    const blob = new Blob([JSON.stringify(portfolio, null, 2)], {
      type: 'application/json',
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `portfolio-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  }, [investments, calculatePortfolioSummary]);

  const importPortfolio = useCallback((file: File) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const portfolio = JSON.parse(content);
          
          if (portfolio.investments && Array.isArray(portfolio.investments)) {
            setInvestments(portfolio.investments);
            resolve();
          } else {
            reject(new Error('Invalid portfolio format'));
          }
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Error reading file'));
      reader.readAsText(file);
    });
  }, []);

  return {
    investments,
    addInvestment,
    updateInvestment,
    removeInvestment,
    updatePrices,
    calculatePortfolioSummary,
    exportPortfolio,
    importPortfolio,
    isLoading,
    lastUpdate,
  };
}