import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, RefreshCw, Upload, Download } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { LanguageToggle } from '../LanguageToggle';
import { CurrencyDropdown } from '../CurrencyDropdown';

interface TopBarProps {
  onAddInvestment: () => void;
  onExport: () => void;
  onImport: () => void;
  onUpdatePrices: () => void;
  isLoading: boolean;
  sidebarCollapsed: boolean;
}

export function TopBar({ onAddInvestment, onExport, onImport, onUpdatePrices, isLoading, sidebarCollapsed }: TopBarProps) {
  const { t } = useLanguage();
  const location = useLocation();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return t('nav.dashboard');
      case '/performance': return t('nav.performance');
      case '/bonds': return t('nav.bonds');
      case '/investment/new': return t('nav.add.investment');
      default:
        if (location.pathname.startsWith('/investment/')) return t('edit');
        return t('nav.dashboard');
    }
  };

  return (
    <header
      className="sticky top-0 z-10 h-16 flex items-center justify-between px-6 transition-all duration-300"
      style={{
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-primary)',
        marginLeft: sidebarCollapsed ? '72px' : '240px',
      }}
    >
      {/* Page title */}
      <h1 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
        {getPageTitle()}
      </h1>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onUpdatePrices}
          disabled={isLoading}
          className={`btn-icon ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          title={t('update.prices')}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>

        <button onClick={onImport} className="btn-icon" title={t('import.portfolio')}>
          <Upload className="h-4 w-4" />
        </button>

        <button onClick={onExport} className="btn-icon" title={t('export.portfolio')}>
          <Download className="h-4 w-4" />
        </button>

        <div className="w-px h-6 mx-1" style={{ background: 'var(--border-primary)' }} />

        <CurrencyDropdown />
        <LanguageToggle />

        <button
          onClick={onAddInvestment}
          className="gradient-btn flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">{t('add.investment')}</span>
        </button>
      </div>
    </header>
  );
}
