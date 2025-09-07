
import React from 'react';
import { TrendingUp, Plus, Download, Upload, RefreshCw, MessageCircle } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageToggle } from './LanguageToggle';
import { CurrencyDropdown } from './CurrencyDropdown';
import { trackInvestmentActions } from './GoogleAnalytics';

interface HeaderProps {
  onAddInvestment: () => void;
  onExport: () => void;
  onImport: () => void;
  onUpdatePrices: () => void;
  onBondAnalysis: () => void;
  isLoading: boolean;
}

export function Header({ 
  onAddInvestment, 
  onExport, 
  onImport, 
  onUpdatePrices, 
  onBondAnalysis,
  isLoading 
}: HeaderProps) {
  const { t } = useLanguage();
  
  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 transition-colors duration-200 shadow-sm">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-3 sm:py-0 sm:h-16 gap-3 sm:gap-0">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <div className="p-2 bg-purple-600 dark:bg-purple-500 rounded-lg shadow-sm flex-shrink-0">
              <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="mobile-title brand-heading truncate">{t('app.title')}</h1>
              <p className="mobile-subtitle brand-subtext truncate">{t('app.subtitle')}</p>
            </div>
          </div>

          <div className="mobile-nav w-full sm:w-auto">
            <button
              onClick={() => {
                trackInvestmentActions.bondAnalysis();
                onBondAnalysis();
              }}
              className="group flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all duration-500 hover:pr-3 sm:hover:pr-4"
              title="Bond Analysis"
              aria-label="Bond Analysis"
            >
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 whitespace-nowrap text-sm sm:text-base" aria-hidden="true">
                {t('bond.analysis.button')}
              </span>
            </button>


            <button
              onClick={() => {
                trackInvestmentActions.refreshPrices();
                onUpdatePrices();
              }}
              disabled={isLoading}
              className={`p-2 rounded-lg transition-colors ${
                isLoading
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed'
                  : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
              title={t('update.prices')}
              aria-label={t('update.prices')}
            >
              <RefreshCw className={`h-4 w-4 sm:h-5 sm:w-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={onImport}
              className="p-2 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              title={t('import.portfolio')}
              aria-label={t('import.portfolio')}
            >
              <Upload className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>

            <button
              onClick={onExport}
              className="p-2 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              title={t('export.portfolio')}
              aria-label={t('export.portfolio')}
            >
              <Download className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>

            <CurrencyDropdown />
            <LanguageToggle />
            <ThemeToggle />

            <button
              onClick={() => {
                trackInvestmentActions.addInvestment('form_open');
                onAddInvestment();
              }}
              className="brand-button-primary flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 text-sm sm:text-base"
              aria-label={t('add.investment')}
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">{t('add.investment')}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}