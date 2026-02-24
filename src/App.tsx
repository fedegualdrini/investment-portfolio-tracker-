import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Analytics } from '@vercel/analytics/react';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './components/Dashboard';
import { AddInvestmentForm } from './components/AddInvestmentForm';
import { EditInvestmentForm } from './components/EditInvestmentForm';
import { BondAnalysisPage } from './pages/BondAnalysisPage';
import { PerformanceComparisonPage } from './pages/PerformanceComparisonPage';
import { ChatBlob } from './components/ChatBlob';
import GoogleAnalytics from './components/GoogleAnalytics';
import { useInvestmentContext } from './contexts/InvestmentContext';
import type { Investment } from './types/investment';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { InvestmentProvider } from './contexts/InvestmentContext';
import { ToastProvider } from './contexts/ToastContext';
import { ToastContainer } from './components/ui/Toast';

function DashboardPage() {
  const {
    investments,
    removeInvestment,
    updatePrices,
    calculatePortfolioSummary,
    isLoading,
    lastUpdate,
  } = useInvestmentContext();
  const navigate = useNavigate();
  const summary = calculatePortfolioSummary();

  return (
    <Dashboard
      investments={investments}
      summary={summary}
      onUpdatePrices={updatePrices}
      onRemoveInvestment={removeInvestment}
      onEditInvestment={(id) => navigate(`/investment/${id}/edit`)}
      isLoading={isLoading}
      lastUpdate={lastUpdate}
    />
  );
}

function AddInvestmentPage() {
  const { addInvestment } = useInvestmentContext();
  const navigate = useNavigate();

  const handleAdd = (investment: Omit<Investment, 'id'>) => {
    addInvestment(investment);
    navigate('/');
  };

  return (
    <AddInvestmentForm
      onAdd={handleAdd}
      onCancel={() => navigate('/')}
    />
  );
}

function EditInvestmentPage() {
  const { investments, updateInvestment } = useInvestmentContext();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const investment = investments.find(inv => inv.id === id);

  if (!investment) {
    return (
      <div className="text-center py-12">
        <p style={{ color: 'var(--text-secondary)' }}>Investment not found.</p>
        <button onClick={() => navigate('/')} className="gradient-btn mt-4">
          Back to Dashboard
        </button>
      </div>
    );
  }

  const handleSave = (investmentId: string, updates: Partial<Investment>) => {
    updateInvestment(investmentId, updates);
    navigate('/');
  };

  return (
    <EditInvestmentForm
      investment={investment}
      onSave={handleSave}
      onCancel={() => navigate('/')}
    />
  );
}

function BondAnalysisRoute() {
  const { investments } = useInvestmentContext();
  const navigate = useNavigate();

  return (
    <BondAnalysisPage
      investments={investments}
      onBack={() => navigate('/')}
    />
  );
}

function PerformanceRoute() {
  const navigate = useNavigate();

  return (
    <PerformanceComparisonPage
      onBack={() => navigate('/')}
    />
  );
}

function AppRoutes() {
  return (
    <>
      <GoogleAnalytics />
      <SpeedInsights />
      <Analytics />
      <ToastContainer />
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/performance" element={<PerformanceRoute />} />
          <Route path="/bonds" element={<BondAnalysisRoute />} />
          <Route path="/investment/new" element={<AddInvestmentPage />} />
          <Route path="/investment/:id/edit" element={<EditInvestmentPage />} />
        </Route>
      </Routes>
      <ChatBlob />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <InvestmentProvider>
        <ThemeProvider>
          <LanguageProvider>
            <CurrencyProvider>
              <ToastProvider>
                <AppRoutes />
              </ToastProvider>
            </CurrencyProvider>
          </LanguageProvider>
        </ThemeProvider>
      </InvestmentProvider>
    </BrowserRouter>
  );
}

export default App;
