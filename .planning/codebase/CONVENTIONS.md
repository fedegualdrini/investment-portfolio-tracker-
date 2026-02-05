# CONVENTIONS

Date: 2026-02-05

This repo is a Vite + React + TypeScript app. Conventions below reflect current code patterns and config.

## Language / Module system

- **TypeScript for app code** under `src/`.
  - Example entry: `src/main.tsx`
  - App root component: `src/App.tsx`
- **ESM modules** (`"type": "module"` in `package.json`).
  - Tooling/scripts in root are `.mjs` (e.g. `playwright-final.mjs`, `run-api-local.mjs`).
- Serverless endpoints in `api/` are JavaScript (e.g. `api/coingecko.js`, `api/yahoo.js`).

## TypeScript compiler settings

Configured via `config/tsconfig.app.json`:

- `strict: true`
- `noUnusedLocals: true`
- `noUnusedParameters: true`
- `noFallthroughCasesInSwitch: true`
- `jsx: "react-jsx"`
- `moduleResolution: "bundler"`

**Practical guidance:** keep types tight and avoid unused variables/params; TypeScript is configured to be strict.

## Linting

ESLint config: `config/eslint.config.js`

- Base rules:
  - `@eslint/js` recommended
  - `typescript-eslint` recommended
- React-specific linting:
  - `eslint-plugin-react-hooks` recommended rules are enabled.
  - `eslint-plugin-react-refresh` rule:
    - `react-refresh/only-export-components`: `warn` with `{ allowConstantExport: true }`.
- Lint script:
  - `npm run lint` runs `eslint . --config config/eslint.config.js` (see `package.json`).

**Practical guidance:**
- Follow the Rules of Hooks; the linter enforces them.
- Keep React component exports compatible with React Refresh (avoid exporting non-components from component modules unless constant exports).

## Formatting (Prettier/Biome)

- No Prettier or Biome config detected in the repository root (no `.prettierrc`, `biome.json` found during scan).

**De-facto formatting based on code style:**
- 2-space indentation.
- Semicolons are used.
- Single quotes are used for strings in TS/JS (e.g. `src/main.tsx`, `src/services/priceService.ts`).

## File & folder structure conventions

- App code is organized by responsibility in `src/`:
  - Components: `src/components/*.tsx` (named exports)
  - Pages: `src/pages/*.tsx`
  - Context providers: `src/contexts/*.tsx`
  - Hooks: `src/hooks/*.ts`
  - Services: `src/services/*.ts` (often classes)
  - Utils: `src/utils/*.ts` (pure functions)
  - Types: `src/types/*.ts` (interfaces, type aliases, constants)
  - Constants: `src/constants/*.ts`

**Naming:**
- React components: **PascalCase** file names and exported symbols.
  - Example: `src/components/AddInvestmentForm.tsx` exports `AddInvestmentForm`.
- Hooks: **camelCase** prefixed with `use`.
  - Example: `src/hooks/useInvestments.ts` exports `useInvestments`.
- Services: **camelCase** file name; class is **PascalCase**.
  - Example: `src/services/performanceComparisonService.ts` exports `PerformanceComparisonService`.
- Contexts: `SomethingContext.tsx` and provider `SomethingProvider`.
  - Example: `src/contexts/InvestmentContext.tsx` exports `InvestmentProvider` and `useInvestmentContext`.

## Import style

- Uses ES imports.
- Mix of value imports and `import type` for type-only imports.
  - Example: `src/App.tsx` uses `import type { Investment } from './types/investment';`
  - Example: `src/hooks/useInvestments.ts` uses `import type { Investment, PortfolioSummary } from '../types/investment';`

**Relative imports** are used throughout (no TS path aliases configured in `config/tsconfig.app.json`).

## React component conventions

- Components are primarily **function components**.
  - Example: `src/components/AddInvestmentForm.tsx` defines `export function AddInvestmentForm(...) { ... }`.
- State management with `useState`, side effects with `useEffect`, memoization with `useMemo`, stable callbacks with `useCallback`.
- Conditional rendering commonly uses ternaries and boolean short-circuiting.
  - Example: `src/App.tsx` toggles sections using booleans like `showAddForm`, `showBondAnalysis`.

### Props typing

- Props are typically defined as an interface in the same file.
  - Example: `src/components/AddInvestmentForm.tsx` uses `interface AddInvestmentFormProps { ... }`.

### Event typing

- React events are explicitly typed when needed.
  - Example: `src/components/AddInvestmentForm.tsx` uses `React.FormEvent` and `React.ChangeEvent<HTMLInputElement | HTMLSelectElement>`.

## State / persistence conventions

- Local persistence uses `localStorage`.
  - Key is duplicated in multiple places as `STORAGE_KEY = 'investment-portfolio'`.
  - Examples:
    - `src/hooks/useInvestments.ts`
    - `src/contexts/InvestmentContext.tsx`
- Storage writes currently only happen when there is at least one investment.
  - Example: `src/hooks/useInvestments.ts` only calls `localStorage.setItem` if `investments.length > 0`.

## Service layer conventions

- Many services are classes with instance state (cache, config).
  - Example: `src/services/performanceComparisonService.ts` maintains a `cache: Map<string, any>` with timestamps.
  - Example: `src/services/priceService.ts` caches `PriceData` for 1 minute.

### Error handling

- Most services catch errors, `console.error(...)`, and either return `null` or rethrow depending on context.
  - Example: `src/services/priceService.ts` returns `null` on fetch errors.
  - Example: `src/services/performanceComparisonService.ts` logs then `throw error`.

## Utility & constants conventions

- Utilities are pure functions with JSDoc-style comments.
  - Example: `src/utils/paymentFrequencyUtils.ts`
- Constants modules often export:
  - A function that accepts the i18n translator and returns labeled options.
  - A default options array (non-i18n).
  - A canonical list of values.
  - Example: `src/constants/investmentTypes.ts`

## Styling conventions

- Tailwind CSS is used.
  - Tailwind config: `config/tailwind.config.js`
  - PostCSS config: `config/postcss.config.js`
- Project defines custom Tailwind component classes (`brand-*`) in `src/index.css` using `@layer components`.
  - Examples used across components:
    - `brand-card`, `brand-input`, `brand-button-primary` in `src/components/AddInvestmentForm.tsx`

**Practical guidance:** prefer reusing `brand-*` classes instead of duplicating long Tailwind class strings.

## Accessibility conventions

- Components sometimes use ARIA roles/labels.
  - Example: `src/App.tsx` sets `role="application"` and `aria-label="Investment Portfolio Tracker"` on the outer container.

## API / serverless code conventions

- Vercel-style handlers in `api/*.js`.
  - Example: `api/coingecko.js` exports `default async function handler(req, res) { ... }`.
- Explicit CORS headers for serverless endpoints.
  - Example: `api/coingecko.js` sets `Access-Control-Allow-*` headers.

## Scripts / evidence artifacts

- There is a `test-evidence/` directory with JSON evidence files (e.g. `test-evidence/results.json`, `test-evidence/final-results.json`). These are generated artifacts (not unit tests).

