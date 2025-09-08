import React, { useEffect } from 'react';

// Google Analytics 4 tracking ID - replace with your actual tracking ID
const GA_TRACKING_ID = (import.meta as any).env.VITE_GA_TRACKING_ID || 'G-XXXXXXXXXX';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

// Initialize Google Analytics
export const initGA = () => {
  // Only initialize if tracking ID is provided and not in development
  if (!GA_TRACKING_ID || GA_TRACKING_ID === 'G-XXXXXXXXXX') {
    console.log('Google Analytics not initialized: Missing or invalid tracking ID');
    return;
  }

  // Initialize dataLayer first
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) {
    window.dataLayer.push(args);
  }
  window.gtag = gtag;

  // Create script tag for gtag
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
  
  // Wait for script to load before configuring
  script.onload = () => {
    gtag('js', new Date());
    gtag('config', GA_TRACKING_ID, {
      page_title: document.title,
      page_location: window.location.href,
    });
  };
  
  document.head.appendChild(script);
};

// Track page views
export const trackPageView = (path: string, title?: string) => {
  if (typeof window.gtag !== 'function') return;
  
  window.gtag('config', GA_TRACKING_ID, {
    page_path: path,
    page_title: title || document.title,
  });
};

// Track custom events
export const trackEvent = (
  eventName: string,
  parameters?: {
    event_category?: string;
    event_label?: string;
    value?: number;
    [key: string]: any;
  }
) => {
  if (typeof window.gtag !== 'function') return;
  
  window.gtag('event', eventName, {
    event_category: parameters?.event_category || 'engagement',
    event_label: parameters?.event_label,
    value: parameters?.value,
    ...parameters,
  });
};

// Predefined event tracking functions for common actions
export const trackInvestmentActions = {
  addInvestment: (type: string, symbol?: string) => {
    trackEvent('add_investment', {
      event_category: 'portfolio',
      event_label: type,
      custom_parameter_1: symbol,
    });
  },
  
  editInvestment: (type: string, symbol?: string) => {
    trackEvent('edit_investment', {
      event_category: 'portfolio',
      event_label: type,
      custom_parameter_1: symbol,
    });
  },
  
  removeInvestment: (type: string, symbol?: string) => {
    trackEvent('remove_investment', {
      event_category: 'portfolio',
      event_label: type,
      custom_parameter_1: symbol,
    });
  },
  
  refreshPrices: () => {
    trackEvent('refresh_prices', {
      event_category: 'portfolio',
      event_label: 'manual_refresh',
    });
  },
  
  chatInteraction: (action: string) => {
    trackEvent('chat_interaction', {
      event_category: 'ai_assistant',
      event_label: action,
    });
  },
  
  bondAnalysis: (symbol?: string) => {
    trackEvent('bond_analysis', {
      event_category: 'analysis',
      event_label: 'bond_details',
      custom_parameter_1: symbol,
    });
  },
  
  performanceAnalysis: () => {
    trackEvent('performance_analysis', {
      event_category: 'analysis',
      event_label: 'portfolio_performance',
    });
  },
  
  currencyChange: (fromCurrency: string, toCurrency: string) => {
    trackEvent('currency_change', {
      event_category: 'settings',
      event_label: `${fromCurrency}_to_${toCurrency}`,
    });
  },
  
  themeToggle: (theme: string) => {
    trackEvent('theme_toggle', {
      event_category: 'settings',
      event_label: theme,
    });
  },
  
  languageToggle: (language: string) => {
    trackEvent('language_toggle', {
      event_category: 'settings',
      event_label: language,
    });
  },
};

// React component for Google Analytics
const GoogleAnalytics: React.FC = () => {
  useEffect(() => {
    // Initialize GA on component mount
    initGA();
    
    // Track initial page view
    trackPageView(window.location.pathname + window.location.search, document.title);
  }, []);

  return null; // This component doesn't render anything
};

export default GoogleAnalytics;
