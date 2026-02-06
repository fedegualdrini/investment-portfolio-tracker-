import React, { useState, useEffect, useRef } from 'react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Analytics } from '@vercel/analytics/react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { AddInvestmentForm } from './components/AddInvestmentForm';
import { EditInvestmentForm } from './components/EditInvestmentForm';
import { PortfolioStats } from './components/PortfolioStats';
import { WeeklyPulse } from './components/WeeklyPulse';
import { DisclaimerFooter } from './components/Footer';
import { BondAnalysisPage } from './pages/BondAnalysisPage';
import { PerformanceComparisonPage } from './pages/PerformanceComparisonPage';
import { TermsPage } from './pages/TermsPage';
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
  const [showPerformanceComparison, setShowPerformanceComparison] = useState(false);
  const [showWeeklyPulse, setShowWeeklyPulse] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const closeAllSections = () => {
    setShowAddForm(false);
    setEditingInvestment(null);
    setShowBondAnalysis(false);
    setShowPerformanceComparison(false);
    setShowWeeklyPulse(false);
    setShowTerms(false);
  };

  const openSection = (section: 'addForm' | 'editForm' | 'bondAnalysis' | 'performanceComparison' | 'weeklyPulse' | 'terms') => {
    closeAllSections();
    switch (section) {
      case 'addForm':
        setShowAddForm(true);
        break;
      case 'editForm':
        break;
      case 'bondAnalysis':
        setShowBondAnalysis(true);
        break;
      case 'performanceComparison':
        setShowPerformanceComparison(true);
        break;
      case 'weeklyPulse':
        setShowWeeklyPulse(true);
        break;
      case 'terms':
        setShowTerms(true);
        break;
    }
  };

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

  useEffect(() => {
    if (showAddForm) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [showAddForm]);

  useEffect(() => {
    if (editingInvestment) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
          <div
            className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200"
            role="application"
            aria-label="Investment Portfolio Tracker"
          >
            <GoogleAnalytics />
            <SpeedInsights />
            <Analytics />
            <Header
              onAddInvestment={() => openSection('addForm')}
              onExport={exportPortfolio}
              onImport={handleImport}
              onUpdatePrices={updatePrices}
              onBondAnalysis={() => openSection('bondAnalysis')}
              onPerformanceComparison={() => openSection('performanceComparison')}
              onWeeklyPulse={() => openSection('weeklyPulse')}
              isLoading={isLoading}
            />

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

              {!showAddForm && !editingInvestment && !showBondAnalysis &&
               !showPerformanceComparison && !showWeeklyPulse && !showTerms && (
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

              {showWeeklyPulse && (
                <>
                  <WeeklyPulse onBack={closeAllSections} />
                  <DisclaimerFooter onOpenTerms={() => openSection('terms')} />
                </>
              )}

              {showTerms && (
                <TermsPage onBack={closeAllSections} />
              )}

              {showBondAnalysis && (
                <BondAnalysisPage
                  investments={investments}
                  onBack={closeAllSections}
                />
              )}

              {showPerformanceComparison && (
                <PerformanceComparisonPage onBack={closeAllSections} />
              )}

              {!showAddForm && !editingInvestment && !showBondAnalysis &&
               !showPerformanceComparison && !showWeeklyPulse && !showTerms && <ChatBlob />}
            </main>
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
