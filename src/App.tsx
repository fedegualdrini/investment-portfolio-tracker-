import React, { useState, useEffect, useRef } from 'react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Analytics } from '@vercel/analytics/react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { AddInvestmentForm } from './components/AddInvestmentForm';
import { EditInvestmentForm } from './components/EditInvestmentForm';
import { PortfolioStats } from './components/PortfolioStats';
import { BondAnalysisPage } from './pages/BondAnalysisPage';
import { ChatBlob } from './components/ChatBlob';
import GoogleAnalytics from './components/GoogleAnalytics';
import { useInvestmentContext } from './contexts/InvestmentContext';
import type { Investment } from './types/investment';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { InvestmentProvider } from './contexts/InvestmentContext';

function AppContent() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<string | null>(null);

  const [showBondAnalysis, setShowBondAnalysis] = useState(false);

  // Helper function to close all sections and return to home
  const closeAllSections = () => {
    setShowAddForm(false);
    setEditingInvestment(null);
    setShowBondAnalysis(false);
  };

  // Helper function to open a specific section (closes others)
  const openSection = (section: 'addForm' | 'editForm' | 'bondAnalysis') => {
    closeAllSections();
    switch (section) {
      case 'addForm':
        setShowAddForm(true);
        break;
      case 'editForm':
        // editForm is handled by setEditingInvestment
        break;
      case 'bondAnalysis':
        setShowBondAnalysis(true);
        break;
    }
  };
  
  // Refs for smooth scrolling
  const addFormRef = useRef<HTMLDivElement>(null);
  const editFormRef = useRef<HTMLDivElement>(null);
  
  const {
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
  } = useInvestmentContext();

  // Smooth scroll effect when forms are shown
  useEffect(() => {
    if (showAddForm) {
      // Scroll to top of page to ensure header doesn't cover the form
      window.scrollTo({ 
        top: 0, 
        behavior: 'smooth' 
      });
    }
  }, [showAddForm]);

  useEffect(() => {
    if (editingInvestment) {
      // Scroll to top of page to ensure header doesn't cover the form
      window.scrollTo({ 
        top: 0, 
        behavior: 'smooth' 
      });
    }
  }, [editingInvestment]);

  const handleAddInvestment = (investment: any) => {
    addInvestment(investment);
    closeAllSections();
  };

  const handleEditInvestment = (id: string, updates: Partial<Investment>) => {
    updateInvestment(id, updates);
    closeAllSections();
  };
  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        await importPortfolio(file);
        alert('Portfolio imported successfully!');
      } catch (error) {
        alert('Error importing portfolio. Please check the file format.');
      }
    };
    input.click();
  };

  const summary = calculatePortfolioSummary();
  const investmentToEdit = editingInvestment 
    ? investments.find(inv => inv.id === editingInvestment) 
    : null;

  return (
    <ThemeProvider>
      <LanguageProvider>
        <CurrencyProvider>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200" role="application" aria-label="Investment Portfolio Tracker">
        <GoogleAnalytics />
        <SpeedInsights />
        <Analytics />
        <Header
          onAddInvestment={() => openSection('addForm')}
          onExport={exportPortfolio}
          onImport={handleImport}
          onUpdatePrices={updatePrices}
          onBondAnalysis={() => openSection('bondAnalysis')}
          isLoading={isLoading}
        />

        {/* Main content */}
        <main className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
                  {showAddForm ? (
          <div ref={addFormRef} className="mb-8 mt-4 animate-fadeInUp">
            <AddInvestmentForm
              onAdd={handleAddInvestment}
              onCancel={closeAllSections}
            />
          </div>
        ) : null}

                  {editingInvestment && investmentToEdit ? (
          <div ref={editFormRef} className="mb-8 mt-4 animate-fadeInUp">
            <EditInvestmentForm
              investment={investmentToEdit}
              onSave={handleEditInvestment}
              onCancel={closeAllSections}
            />
          </div>
        ) : null}

          {!showAddForm && !editingInvestment && !showBondAnalysis && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              <div className="lg:col-span-3">
                <Dashboard
                  investments={investments}
                  summary={summary}
                  onUpdatePrices={updatePrices}
                  onRemoveInvestment={removeInvestment}
                  onEditInvestment={(id) => {
                    closeAllSections();
                    setEditingInvestment(id);
                  }}
                  isLoading={isLoading}
                  lastUpdate={lastUpdate}
                />
              </div>

              <div className="lg:col-span-1">
                <PortfolioStats summary={summary} />
              </div>
            </div>
          )}

          {/* Bond Analysis Page */}
          {showBondAnalysis && (
            <BondAnalysisPage
              investments={investments}
              onBack={closeAllSections}
            />
          )}

          {!showAddForm && !editingInvestment && !showBondAnalysis && investments.length > 0 && (
            <div className="mt-4 sm:mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 transition-colors duration-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">Quick Actions</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <button
                  onClick={updatePrices}
                  disabled={isLoading}
                  className={`p-4 rounded-lg border-2 border-dashed transition-all duration-200 ${
                    isLoading
                      ? 'border-gray-200 dark:border-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                      : 'border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-sm font-medium">Refresh Prices</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Update all investments</div>
                  </div>
                </button>

                <button
                  onClick={exportPortfolio}
                  className="p-4 rounded-lg border-2 border-dashed border-green-200 dark:border-green-700 text-green-600 dark:text-green-400 hover:border-green-300 dark:hover:border-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-200"
                >
                  <div className="text-center">
                    <div className="text-sm font-medium">Export Data</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Download JSON file</div>
                  </div>
                </button>

                <button
                  onClick={handleImport}
                  className="p-4 rounded-lg border-2 border-dashed border-purple-200 dark:border-purple-700 text-purple-600 dark:text-purple-400 hover:border-purple-300 dark:hover:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200"
                >
                  <div className="text-center">
                    <div className="text-sm font-medium">Import Data</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Upload JSON file</div>
                  </div>
                </button>
              </div>
            </div>
          )}
        </main>

        {/* ChatBlob - Floating chat interface */}
        <ChatBlob />
              </div>
          </CurrencyProvider>
      </LanguageProvider>
      </ThemeProvider>
    );
  }

function App() {
  return (
    <InvestmentProvider>
      <AppContent />
    </InvestmentProvider>
  );
}

export default App;