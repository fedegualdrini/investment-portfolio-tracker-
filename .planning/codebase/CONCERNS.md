# Technical Concerns & Debt

> Generated: 2025-02-05  
> Focus: Concern Analysis for investment-portfolio-tracker

---

## 🔴 Critical

### No Automated Test Coverage
- **Status**: Zero application tests exist  
- **Evidence**: Only `node_modules/` test files found - no `*.test.ts` or `*.spec.ts` in `src/`  
- **Impact**: Changes cannot be safely made; regression risk is unquantified  
- **Fix Approach**: 
  - Add `vitest` or `jest` with `@testing-library/react`  
  - Target 80% coverage for services in `src/services/` first  
  - Create `src/__tests__/` or colocate `*.test.ts` files  

### Leftover Debug Code in Production
- **Files affected**:  
  - `src/pages/PerformanceComparisonPage.tsx` (lines 41-106) - 11 `console.log` statements  
  - `src/pages/ChatPage.tsx` (lines 225-312) - 9 `console.log`/`console.error` statements  
  - `src/components/BondCashFlow.tsx` (lines 174-186) - 6 debug logs  
- **Impact**: Performance overhead, noise in production logs, potential data leakage  
- **Fix Approach**: Replace with proper logging utility that respects `import.meta.env.MODE`

---

## 🟠 High

### Complex Service Files (Single Responsibility Violation)
| File | Lines | Issue |
|------|-------|-------|
| `src/services/bondAnalysisService.ts` | 701 | Handles pattern matching, yield analysis, payment calculations, scheduling, cache management |

- **Impact**: Difficult to test, modify, or extend bond analysis logic  
- **Fix Approach**: Split into `BondPatternMatcher`, `BondPaymentCalculator`, `BondScheduleGenerator`

### `any` Type Assertions Compromise Type Safety
- **Files affected**:  
  - `src/components/GoogleAnalytics.tsx:4` - `(import.meta as any).env.VITE_GA_TRACKING_ID`  
  - `src/contexts/LanguageContext.tsx:411` - `(translations[language] as any)[key]`  
- **Impact**: Runtime errors bypassed at compile time, brittle code  
- **Fix Approach**: 
  - Use proper Vite env type declarations (`src/vite-env.d.ts`)  
  - Add strict translation key typing for `LanguageContext`

### Fake/Hardcoded GA Tracking ID
- **File**: `src/components/GoogleAnalytics.tsx:4`  
- **Issue**: Defaults to `'G-XXXXXXXXXX'` placeholder, silently fails with console message  
- **Impact**: Analytics data loss in production if env var not set; no build-time validation  
- **Fix Approach**: Add build-time check or throw if `VITE_GA_TRACKING_ID` undefined

---

## 🟡 Medium

### Hardcoded Currency Exchange Rate
- **File**: `src/contexts/CurrencyContext.tsx:35-38`  
- **Code**: `return usdAmount * 1375;` (ARS rate from Feb 2025)  
- **Issue**: "This could be enhanced to fetch real-time rates" is a comment in code - not implemented  
- **Impact**: Currency display becomes inaccurate quickly  
- **Fix Approach**: Implement worker that caches DolarAPI response every 30 minutes

### Inconsistent Error Handling in Services
- **Pattern**: Services use `console.error` inconsistently; some swallow errors and return `null`  
- **Files affected**:  
  - `src/services/priceService.ts` - returns `null` on fetch failure  
  - `src/services/chatApiService.ts` - catches and throws inconsistently  
- **Impact**: Silent failures; no retry logic; poor UX  
- **Fix Approach**: Create unified error type `AppError` with user-facing vs debug variants

### Hardcoded Crypto Symbol Mapping
- **File**: `src/services/priceService.ts:4-15`  
- **Issue**: Limited 10-coin hardcoded map; `BTC`, `ETH` work but `PEPE`, `DOGE` are missing or difficult  
- **Impact**: Users cannot track many popular cryptocurrencies  
- **Fix Approach**: Dynamic CoinGecko symbol lookup or use CoinGecko's `/coins/list` endpoint

### No Error Boundaries
- **Status**: No `componentDidCatch` or React error boundaries anywhere  
- **Impact**: One component crash crashes entire app; no fallback UI  
- **Files to add**: `src/components/ErrorBoundary.tsx` wrapping `App.tsx`

### localStorage as Primary Data Store
- **Files affected**:  
  - `src/contexts/InvestmentContext.tsx` (lines 31, 45)  
  - `src/contexts/ThemeContext.tsx` (lines 15, 27)  
  - `src/pages/ChatPage.tsx` (lines 35, 51)  
  - `src/components/ChatBlob.tsx` (lines 66, 81)  
- **Issues**:  
  - 5MB browser limit; no migration path for data schema changes  
  - No backup/restore UX  
  - No encryption for sensitive portfolio data  
- **Impact**: Data loss risk; multi-device sync impossible  
- **Fix Approach**: Add export/import and consider IndexedDB wrapper like `localForage`

---

## 🟢 Low

### Unused CORS Headers in Vercel Config
- **File**: `vercel.json`  
- **Issue**: `Access-Control-Allow-Origin: *` conflicts with `config/vite.config.ts` proxy settings  
- **Fix**: Consolidate one source of truth

### Duplicate Chat History Logic
- **Files**: `src/pages/ChatPage.tsx` and `src/components/ChatBlob.tsx`  
- **Issue**: Both handle `localStorage` chat persistence independently  
- **Fix**: Extract to `useChatHistory()` hook in `src/hooks/`

### Date Objects Not UTC-Normalized
- **File**: `src/services/bondAnalysisService.ts` (multiple date calculations)  
- **Example**: `new Date(investment.maturityDate! + 'T12:00:00')`  
- **Risk**: Timezone edge cases could break payment date calculations  
- **Fix Approach**: Use `date-fns` consistently (already in deps); always store UTC dates

### Cache Duration Not Configurable
- **File**: `src/services/priceService.ts:7`  
- **Issue**: `CACHE_DURATION = 60000` hardcoded; no way to adjust per-asset type  
- **Fix**: Move to config or parameterize `PriceService` constructor

---

## 📊 Metrics

| Concern Category | Count |
|------------------|-------|
| No Test Coverage | 1 |
| Debug Code Left In | 3 files, 26 statements |
| `any` Type Assertions | 2 |
| Overlarge Files | 1 (701 lines) |
| localStorage Dependencies | 4 files |
| Hardcoded Config | 3 locations |

---

## 🔧 Refactor Priority

1. **Immediate**: Remove all `console.log` debug statements  
2. **This Sprint**: Add test coverage for `src/services/`  
3. **Next Sprint**: Split `bondAnalysisService.ts` into focused modules  
4. **Q1**: Add Error Boundary and proper error handling  
5. **Later**: Migrate from localStorage to proper backend or IndexedDB
