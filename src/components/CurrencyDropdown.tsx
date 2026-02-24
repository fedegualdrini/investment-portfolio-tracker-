import React, { useState } from 'react';
import { ChevronDown, DollarSign } from 'lucide-react';
import { useCurrency } from '../contexts/CurrencyContext';
import { useLanguage } from '../contexts/LanguageContext';
import { trackInvestmentActions } from './GoogleAnalytics';

export function CurrencyDropdown() {
  const { displayCurrency, setDisplayCurrency } = useCurrency();
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
    { code: 'ARS', name: 'Argentine Peso', symbol: 'AR$', flag: '🇦🇷' },
  ];

  const selectedCurrency = currencies.find(c => c.code === displayCurrency);

  const handleCurrencyChange = (currencyCode: 'USD' | 'ARS') => {
    trackInvestmentActions.currencyChange(displayCurrency, currencyCode);
    setDisplayCurrency(currencyCode);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn-ghost flex items-center gap-1.5"
        title={t('currency.display')}
      >
        <DollarSign className="h-4 w-4" />
        <span className="text-sm font-medium">{selectedCurrency?.code}</span>
        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-48 glass-card-static z-20 py-1">
              {currencies.map((currency) => (
                <button
                  key={currency.code}
                  onClick={() => handleCurrencyChange(currency.code as 'USD' | 'ARS')}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors duration-200 flex items-center space-x-3 ${
                    displayCurrency === currency.code
                      ? 'text-emerald-500 bg-emerald-500/[0.08]'
                      : ''
                  }`}
                  style={{ color: displayCurrency === currency.code ? undefined : 'var(--text-primary)' }}
                >
                  <span className="text-lg">{currency.flag}</span>
                  <div className="flex-1">
                    <div className="font-medium">{currency.code}</div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {currency.name}
                    </div>
                  </div>
                  {displayCurrency === currency.code && (
                    <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                  )}
                </button>
              ))}
          </div>
        </>
      )}
    </div>
  );
}
