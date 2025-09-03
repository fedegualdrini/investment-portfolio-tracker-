import React from 'react';
import { TrendingUp, Plus, Download, Upload, RefreshCw } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageToggle } from './LanguageToggle';
import { CurrencyDropdown } from './CurrencyDropdown';

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-600 dark:bg-purple-500 rounded-lg shadow-sm">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="brand-heading-md">{t('app.title')}</h1>
              <p className="brand-subtext-sm">Track your investments in real-time</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onBondAnalysis}
              className="group flex items-center space-x-2 px-3 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all duration-500 hover:pr-4"
              title="Bond Analysis"
            >
              <TrendingUp className="h-5 w-5" />
              <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 whitespace-nowrap">
                {t('bond.analysis.button')}
              </span>
            </button>

            <button
              onClick={onUpdatePrices}
              disabled={isLoading}
              className={`p-2 rounded-lg transition-colors ${
                isLoading
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                  : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
              title={t('update.prices')}
            >
              <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={onImport}
              className="p-2 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              title={t('import.portfolio')}
            >
              <Upload className="h-5 w-5" />
            </button>

            <button
              onClick={onExport}
              className="p-2 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              title={t('export.portfolio')}
            >
              <Download className="h-5 w-5" />
            </button>

            <CurrencyDropdown />
            <LanguageToggle />
            <ThemeToggle />

            <button
              onClick={onAddInvestment}
              className="brand-button-primary flex items-center space-x-2"
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