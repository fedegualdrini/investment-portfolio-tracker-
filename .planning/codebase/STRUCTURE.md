# Project Structure

**Generated:** 2026-02-05

## Directory Overview

```
investment-portfolio-tracker/
├── api/                      # Vercel serverless functions
├── config/                   # Build configuration files
├── docs/                     # Additional documentation
├── public/                   # Static assets
├── src/
│   ├── components/           # React UI components
│   ├── constants/            # Static constants/enums
│   ├── contexts/             # React Context providers
│   ├── hooks/                # Custom React hooks
│   ├── pages/                # Page-level route components
│   ├── services/             # Business logic services
│   ├── types/                # TypeScript type definitions
│   └── utils/                # Pure utility functions
├── test-evidence/            # Test artifacts and screenshots
├── vercel.json               # Vercel deployment config
├── package.json              # NPM dependencies
└── run-api-local.mjs         # Local dev API server
```

---

## `/api/` - Serverless Functions

Vercel edge functions for external API proxy and AI chat.

| File | Purpose |
|------|---------|
| `chat.mjs` | AI assistant endpoint (GPT-4o-mini + tool calling) |
| `coingecko.js` | CoinGecko API proxy with rate limiting |
| `yahoo.js` | Yahoo Finance API proxy (CORS bypass) |
| `performance/*.mjs` | Portfolio performance & benchmark data endpoints |

---

## `/config/` - Build Configuration

| File | Purpose |
|------|---------|
| `eslint.config.js` | ESLint rules & plugins |
| `postcss.config.js` | PostCSS plugins (Tailwind, autoprefixer) |
| `tailwind.config.js` | Tailwind theme & custom classes |
| `tsconfig.app.json` | TypeScript app config |
| `tsconfig.json` | TypeScript project references |
| `tsconfig.node.json` | TypeScript node config |
| `vite.config.ts` | Vite build + dev server config |

---

## `/src/components/` - React Components

### Core UI Components
| Component | Purpose |
|-----------|---------|
| `AddInvestmentForm.tsx` | Form for creating new investments |
| `EditInvestmentForm.tsx` | Form for editing existing investments |
| `Dashboard.tsx` | Main dashboard view with investment grid |
| `Header.tsx` | Navigation header with actions |
| `PortfolioStats.tsx` | Sidebar portfolio summary stats |
| `InvestmentCard.tsx` | Individual investment display card |

### Chart Components
| Component | Purpose |
|-----------|---------|
| `PriceChart.tsx` | Historical price chart (Recharts) |
| `PerformanceChart.tsx` | Performance comparison chart |
| `CumulativeReturnsChart.tsx` | Cumulative returns visualization |
| `BondCashFlow.tsx` | Bond payment schedule display |

### Interactive Components
| Component | Purpose |
|-----------|---------|
| `ChatBlob.tsx` | AI chat interface (floating) |
| `FloatingChatButton.tsx` | Chat toggle button |
| `ChatPage.tsx` | Dedicated chat view |

### Utility Components
| Component | Purpose |
|-----------|---------|
| `CurrencyDropdown.tsx` | Currency selector (USD/ARS) |
| `ThemeToggle.tsx` | Dark/light mode toggle |
| `LanguageToggle.tsx` | Language switch (EN/ES) |
| `DateRangePicker.tsx` | Date range selection |
| `BenchmarkSelector.tsx` | Performance benchmark selector |
| `MetricCard.tsx` | KPI metric display card |
| `LoadingSpinner.tsx` | Loading state indicator |
| `ErrorAlert.tsx` | Error message display |
| `Breadcrumbs.tsx` | Navigation breadcrumbs |

### SEO Components
| Component | Purpose |
|-----------|---------|
| `SEOHead.tsx` | Helmet-style meta tags |
| `SEOLandingPage.tsx` | SEO landing page content |
| `StructuredData.tsx` | JSON-LD structured data |
| `GoogleAnalytics.tsx` | GA4 tracking integration |

---

## `/src/constants/` - Static Constants

| File | Purpose |
|------|---------|
| `investmentTypes.ts` | Investment type options & labels |
| `paymentFrequencies.ts` | Bond payment frequency options |

---

## `/src/contexts/` - State Management

| Context | File | Purpose |
|---------|------|---------|
| InvestmentContext | `InvestmentContext.tsx` | Portfolio data, CRUD operations, localStorage persistence |
| CurrencyContext | `CurrencyContext.tsx` | Currency display & exchange rates |
| LanguageContext | `LanguageContext.tsx` | i18n translations (EN/ES) |
| ThemeContext | `ThemeContext.tsx` | Dark/light mode preference |

---

## `/src/hooks/` - Custom Hooks

| Hook | File | Purpose |
|------|------|---------|
| useInvestments | `useInvestments.ts` | Investment data management hook |

---

## `/src/pages/` - Route Pages

| Page | File | Purpose |
|------|------|---------|
| Bond Analysis | `BondAnalysisPage.tsx` | Bond investment analysis & payment schedule |
| Performance Comparison | `PerformanceComparisonPage.tsx` | Portfolio vs benchmark analysis |
| Chat | `ChatPage.tsx` | Full-page AI chat interface |

---

## `/src/services/` - Business Logic Services

| Service | File | Purpose |
|---------|------|---------|
| PriceService | `priceService.ts` | Live price fetching (Yahoo/CoinGecko) + caching |
| PortfolioService | `portfolioService.ts` | Portfolio calculations & summaries |
| BondAnalysisService | `bondAnalysisService.ts` | Bond payment calculations |
| ChatApiService | `chatApiService.ts` | AI chat API client |
| CurrencyService | `currencyService.ts` | Exchange rate fetching |
| AnalysisService | `analysisService.ts` | Portfolio performance analysis |

### Historical Services
| Service | File | Purpose |
|---------|------|---------|
| YahooHistoricalService | `yahooHistoricalService.ts` | Yahoo Finance historical data |
| CoinGeckoHistoricalService | `coinGeckoHistoricalService.ts` | CoinGecko historical data |

---

## `/src/types/` - Type Definitions

| File | Types |
|------|-------|
| `investment.ts` | Investment, InvestmentType, PortfolioSummary, PriceData |
| `performance.ts` | PerformanceMetrics, Benchmark, DateRange |

---

## `/src/utils/` - Utility Functions

| File | Purpose |
|------|---------|
| `portfolioCalculations.ts` | Portfolio value/gain calculations |
| `paymentFrequencyUtils.ts` | Bond payment frequency utilities |
| `investmentFilters.ts` | Investment filtering utilities |
| `formValidation.ts` | Form validation helpers |
| `dateUtils.ts` | Date formatting utilities |
| `analytics.ts` | GA4 event tracking |

---

## `/public/` - Static Assets

| File | Purpose |
|------|---------|
| `sitemap.xml` | SEO sitemap |
| `robots.txt` | Crawler instructions |
| `manifest.json` | PWA manifest |

---

## Configuration Files Reference

### Build & Deploy
- `vercel.json` - Function timeouts, rewrites, headers, caching
- `package.json` - Scripts, dependencies, metadata
- `run-api-local.mjs` - Local API dev server script

### Test Evidence
- `test-evidence/results.json` - Test run results
- `test-evidence/final-results.json` - Final test suite results
- Screenshots for visual regression testing
