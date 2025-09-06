import React from 'react';
import { AdvancedChart } from 'react-tradingview-embed';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import type { Investment } from '../types/investment';
import { X } from 'lucide-react';

interface PriceChartProps {
  investment: Investment;
  isVisible: boolean;
  onClose: () => void;
}

export function PriceChart({ investment, isVisible, onClose }: PriceChartProps) {
  const { language, t } = useLanguage();
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  if (!isVisible) return null;

  // Map investment types to TradingView symbols
  const getTradingViewSymbol = (investment: Investment): string => {
    const symbol = investment.symbol.toUpperCase();
    
    switch (investment.type) {
      case 'stock':
        // Let TradingView auto-detect the correct exchange (NYSE, NASDAQ, etc.)
        return symbol;
      
      case 'crypto':
        // For crypto, use BINANCE exchange format
        return `BINANCE:${symbol}USDT`;
      
      default:
        return symbol;
    }
  };

  const tradingViewSymbol = getTradingViewSymbol(investment);

  const chartProps = {
    symbol: tradingViewSymbol,
    theme: isDarkMode ? 'dark' : 'light',
    locale: language === 'es' ? 'es' : 'en',
    autosize: true,
    width: "100%",
    height: "100%",
    hide_side_toolbar: false,
    allow_symbol_change: true,
    save_image: false,
    container_id: `tradingview_${investment.id}_${isDarkMode ? 'dark' : 'light'}`,
    studies: [],
    disabled_features: [
      'use_localstorage_for_settings',
      'volume_force_overlay'
    ],
    enabled_features: [
      'side_toolbar_in_fullscreen_mode',
      'header_in_fullscreen_mode'
    ],
    enable_publishing: false,
    withdateranges: true,
    hide_volume: true,
    hide_top_toolbar: false,
    hide_legend: false,
    range: "YTD",
    interval: "D",
    timezone: "exchange",
    style: "1",
    toolbar_bg: isDarkMode ? "#1f2937" : "#f0f2f5",
    watchlist: [],
    details: false,
    news: ["headlines"],
    calendar: false,
    hotlist: false
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex flex-col">
      {/* Header - Fixed at top */}
      <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
            <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {investment.symbol} - {investment.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
              {investment.type} • {t('price.history')}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Chart Content - Takes up all remaining space */}
      <div className="flex-1 min-h-0 bg-white dark:bg-gray-800 overflow-hidden">
        <div className="w-full h-full">
          <AdvancedChart
            key={`${investment.id}_${isDarkMode ? 'dark' : 'light'}`}
            widgetProps={chartProps}
          />
        </div>
      </div>

      {/* Footer - Fixed at bottom */}
      <div className="p-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-4">
            <span>{t('chart.powered.by')}</span>
            <span>•</span>
            <span>{t('chart.real.time')}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>{t('chart.symbol')}: {tradingViewSymbol}</span>
          </div>
        </div>
      </div>
    </div>
  );
}