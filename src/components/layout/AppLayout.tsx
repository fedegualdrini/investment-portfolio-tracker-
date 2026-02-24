import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { MobileBottomNav } from './MobileBottomNav';
import { useInvestmentContext } from '../../contexts/InvestmentContext';

export function AppLayout() {
  const navigate = useNavigate();
  const {
    exportPortfolio,
    importPortfolio,
    updatePrices,
    isLoading,
  } = useInvestmentContext();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem('sidebar-collapsed') === 'true';
  });

  // Listen for sidebar collapse changes
  useEffect(() => {
    const handleStorage = () => {
      setSidebarCollapsed(localStorage.getItem('sidebar-collapsed') === 'true');
    };

    // Use a MutationObserver-like approach: poll localStorage
    const interval = setInterval(handleStorage, 300);
    window.addEventListener('storage', handleStorage);
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        await importPortfolio(file);
      } catch (error) {
        console.error('Import failed:', error);
      }
    };
    input.click();
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Sidebar - hidden on mobile */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* TopBar - hidden on mobile */}
      <div className="hidden md:block">
        <TopBar
          onAddInvestment={() => navigate('/investment/new')}
          onExport={exportPortfolio}
          onImport={handleImport}
          onUpdatePrices={updatePrices}
          isLoading={isLoading}
          sidebarCollapsed={sidebarCollapsed}
        />
      </div>

      {/* Main content */}
      <main
        className="transition-all duration-300 px-4 sm:px-6 py-6 pb-20 md:pb-6"
      >
        <div className={`md:transition-all md:duration-300 ${sidebarCollapsed ? 'md:ml-[72px]' : 'md:ml-[240px]'}`}>
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom nav */}
      <MobileBottomNav />
    </div>
  );
}
