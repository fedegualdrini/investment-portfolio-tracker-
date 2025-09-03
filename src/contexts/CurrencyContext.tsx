import React, { createContext, useContext, useState, ReactNode } from 'react';

export type DisplayCurrency = 'USD' | 'ARS';

interface CurrencyContextType {
  displayCurrency: DisplayCurrency;
  setDisplayCurrency: (currency: DisplayCurrency) => void;
  formatCurrency: (amount: number, currency?: string) => string;
  convertForDisplay: (usdAmount: number) => number;
  getCurrentARSRate: () => Promise<number>;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [displayCurrency, setDisplayCurrency] = useState<DisplayCurrency>('USD');

  // Convert USD amount to display currency
  const convertForDisplay = (usdAmount: number): number => {
    if (displayCurrency === 'USD') {
      return usdAmount;
    }
    
    // For ARS, we'll use a fixed rate for now
    // In a real app, you'd fetch this from the currency service
    if (displayCurrency === 'ARS') {
      // Using approximate rate: 1 USD = 1375 ARS (from DolarAPI)
      // This could be enhanced to fetch real-time rates
      return usdAmount * 1375;
    }
    
    return usdAmount;
  };

  // Format currency for display
  const formatCurrency = (amount: number, currency?: string): string => {
    const displayAmount = currency === 'USD' ? amount : convertForDisplay(amount);
    
    if (displayCurrency === 'ARS') {
      return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(displayAmount);
    }
    
    // Default USD formatting
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(displayAmount);
  };

  // Get current ARS rate from DolarAPI
  const getCurrentARSRate = async (): Promise<number> => {
    try {
      const response = await fetch('https://dolarapi.com/v1/dolares/oficial');
      if (!response.ok) {
        throw new Error('Failed to fetch ARS rate from DolarAPI');
      }
      
      const data = await response.json();
      // DolarAPI returns ARS per USD, so we need USD per ARS
      return 1 / data.venta; // Using sell rate
    } catch (error) {
      console.error('Error fetching ARS rate:', error);
      // Return fallback rate
      return 1 / 1375;
    }
  };

  return (
    <CurrencyContext.Provider value={{ 
      displayCurrency, 
      setDisplayCurrency, 
      formatCurrency,
      convertForDisplay,
      getCurrentARSRate
    }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
