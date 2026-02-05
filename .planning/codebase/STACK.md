# Technology Stack

**Generated:** 2026-02-05

## Overview

The Investment Portfolio Tracker is a modern React-based web application for tracking and analyzing investment portfolios. It features advanced bond analysis, multi-currency support, real-time data integration, and AI-powered portfolio assistance.

---

## Core Technologies

### Frontend Framework

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | ^18.3.1 | UI library with hooks and functional components |
| **TypeScript** | ^5.5.3 | Type safety and IntelliSense |
| **Vite** | ^5.4.2 | Build tool and dev server |

### Build Configuration

- **Config Location:** `config/vite.config.ts`
- **Entry Point:** `src/main.tsx`
- **Build Output:** `dist/` (default Vite output)

```typescript
// config/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  css: { postcss: './config/postcss.config.js' },
  server: { /* proxy config for APIs */ }
});
```

---

## Styling

### Tailwind CSS

| Technology | Version | Purpose |
|------------|---------|---------|
| **Tailwind CSS** | ^3.4.1 | Utility-first CSS framework |
| **PostCSS** | ^8.4.35 | CSS processing |
| **autoprefixer** | ^10.4.18 | Browser prefix automation |

**Config:** `config/tailwind.config.js`

```javascript
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',  // Class-based dark mode toggle
  theme: { extend: {} }
}
```

### CSS Architecture

- **Dark Mode:** Enabled via `darkMode: 'class'` in Tailwind config
- **Theme Classes:** Applied via `ThemeContext` to `<html>` element
- **Custom Styles:** Located in `src/index.css`

---

## State Management

### React Context API

The application uses React Context for global state:

| Context | Purpose | Location |
|---------|---------|----------|
| **ThemeContext** | Light/dark mode toggle | `src/contexts/ThemeContext.tsx` |
| **LanguageContext** | i18n (English/Spanish) | `src/contexts/LanguageContext.tsx` |
| **CurrencyContext** | Currency display (USD/ARS) | `src/contexts/CurrencyContext.tsx` |
| **InvestmentContext** | Portfolio data management | `src/contexts/InvestmentContext.tsx` |

### Local Storage Persistence

All portfolio data is stored in `localStorage`:
- Key: `investment-portfolio-tracker`
- Type: JSON-serialized `Investment[]` array

---

## Data Visualization

| Library | Version | Purpose |
|---------|---------|---------|
| **Recharts** | ^2.8.0 | Portfolio charts and performance graphs |
| **react-tradingview-embed** | ^3.0.6 | TradingView widget integration |

### Chart Types Used

- `PriceChart` - Investment price history (Recharts LineChart)
- `PerformanceChart` - Time series comparison
- `CumulativeReturnsChart` - Cumulative performance

---

## Forms & UI Components

| Library | Version | Purpose |
|---------|---------|---------|
| **lucide-react** | ^0.344.0 | Icon library |
| **react-datepicker** | ^4.21.0 | Date input components |

### Component Patterns

- Functional components with hooks
- Props interface exported from each component file
- Form validation centralized in `src/utils/formValidation.ts`

---

## Deployment & Hosting

### Vercel

**Config:** `vercel.json`

```json
{
  "functions": {
    "api/chat.mjs": { "maxDuration": 30 },
    "api/coingecko.js": { "maxDuration": 30 },
    "api/yahoo.js": { "maxDuration": 30 }
  },
  "rewrites": [
    { "source": "/api/yahoo/(.*)", "destination": "/api/yahoo?path=$1" }
  ]
}
```

### Analytics Integration

| Service | Purpose | Package |
|---------|---------|---------|
| **Vercel Analytics** | Performance monitoring | `@vercel/analytics` ^1.5.0 |
| **Vercel Speed Insights** | Core Web Vitals | `@vercel/speed-insights` ^1.2.0 |
| **Google Analytics 4** | User behavior tracking | Via script tag + custom events |

---

## Development Tools

### Linting & Formatting

| Tool | Version | Config Location |
|------|---------|-----------------|
| **ESLint** | ^9.9.1 | `config/eslint.config.js` |
| **TypeScript ESLint** | ^8.3.0 | - |
| **Prettier** | Not listed | n/a |

### Testing

| Tool | Version | Purpose |
|------|---------|---------|
| **Playwright** | ^1.58.1 | E2E testing framework |

**Test Scripts:**
- `playwright-repro.mjs` - Test reproduction script
- `playwright-final.mjs` - Final test suite

---

## NPM Scripts

```bash
# Development
npm run dev              # Vite dev server
npm run dev:api          # Local API server (node run-api-local.mjs)
npm run dev:full         # Concurrent frontend + backend

# Build
npm run build            # Production build with Vite
npm run preview          # Preview production build

# Quality
npm run lint             # ESLint check
```

---

## Key Architecture Decisions

### Client-Side Only Architecture

- **No Database:** All data stored in `localStorage`
- **Privacy-First:** Investment data never leaves user's device
- **Offline Capable:** Works without internet after initial load

### API Proxy Pattern

- Vercel serverless functions proxy external APIs
- Solves CORS issues for Yahoo Finance and CoinGecko
- Keeps API keys server-side

---

## Source Code Organization

```
src/
├── App.tsx                    # Root component
├── main.tsx                   # Entry point
├── components/                # React components
│   ├── Dashboard.tsx          # Main dashboard
│   ├── AddInvestmentForm.tsx  # Investment creation
│   ├── EditInvestmentForm.tsx # Investment editing
│   ├── PriceChart.tsx         # Chart components
│   ├── Header.tsx             # Navigation header
│   └── ...
├── contexts/                  # React contexts
│   ├── CurrencyContext.tsx
│   ├── LanguageContext.tsx
│   ├── ThemeContext.tsx
│   └── InvestmentContext.tsx
├── services/                  # Business logic services
│   ├── currencyService.ts     # Currency conversion
│   ├── priceService.ts        # Price fetching
│   ├── portfolioService.ts    # Portfolio calculations
│   ├── chatApiService.ts      # AI assistant integration
│   └── bondAnalysisService.ts # Bond analysis
├── utils/                     # Utility functions
│   ├── dateUtils.ts
│   ├── portfolioCalculations.ts
│   └── formValidation.ts
├── types/                     # TypeScript interfaces
│   ├── investment.ts
│   └── performance.ts
└── constants/                 # Constants
    ├── investmentTypes.ts
    └── paymentFrequencies.ts
```

---

## Dependencies Summary

### Production Dependencies (18)

**Core:**
- `react`, `react-dom` - UI framework
- `react-datepicker` - Date inputs
- `lucide-react` - Icons

**Data & Visualization:**
- `recharts` - Charts
- `react-tradingview-embed` - TradingView widget
- `date-fns` - Date manipulation

**AI & API:**
- `ai` - AI SDK
- `@ai-sdk/react` - React hooks for AI
- `@ai-sdk/openai` - OpenAI integration
- `@ai-sdk/gateway` - AI Gateway
- `zod` - Schema validation

**Analytics:**
- `@vercel/analytics`
- `@vercel/speed-insights`

**Utilities:**
- `dotenv` - Environment variables

### Development Dependencies (12)

- `vite` + `@vitejs/plugin-react` - Build tool
- `typescript` + `typescript-eslint` - Type checking
- `tailwindcss` + `postcss` + `autoprefixer` - Styling
- `eslint` + plugins - Linting
- `concurrently` - Parallel process runner
- `globals` - Global type definitions
- `@playwright/test` - E2E testing
