# Architecture Overview

**Generated:** 2026-02-05

## High-Level Architecture

### Pattern: Client-First SPA with Serverless APIs

The Investment Portfolio Tracker follows a privacy-first architecture where all sensitive portfolio data remains in the browser, while external data fetching and AI capabilities are handled via Vercel serverless functions.

```
Browser (Client)
├── React 18 SPA
│   ├── Components (UI)
│   ├── Contexts (State)
│   ├── Services (Business Logic)
│   └── localStorage (Persistence)
│
└── Service Worker (Vercel)
    ├── /api/chat (AI Assistant)
    ├── /api/yahoo (Stock prices)
    └── /api/coingecko (Crypto prices)

External APIs
├── Yahoo Finance (Stocks/ETFs)
├── CoinGecko (Cryptocurrencies)
├── DolarAPI (ARS exchange rate)
└── OpenAI/Vercel AI (Chat)
```

---

## Application Layers

### 1. Presentation Layer

**Location:** `src/components/`, `src/pages/`

Functional React components with hooks pattern:
- **Dashboard** - Main investment grid view
- **AddInvestmentForm/EditInvestmentForm** - Investment CRUD forms
- **PortfolioStats** - Portfolio summary metrics
- **ChatBlob/ChatPage** - AI assistant interface

**Key Pattern:** Components consume state via custom context hooks:
```typescript
const { investments, addInvestment } = useInvestmentContext();
const { theme, toggleTheme } = useTheme();
```

---

### 2. State Management Layer

**Location:** `src/contexts/`

Four primary React Contexts manage global state:

| Context | Responsibility | Persistence |
|---------|---------------|-------------|
| InvestmentContext | Portfolio data, CRUD operations | localStorage |
| CurrencyContext | Display currency (USD/ARS), exchange rates | localStorage + API |
| LanguageContext | i18n (EN/ES translations) | localStorage |
| ThemeContext | Dark/light mode | localStorage |

**Data Flow:**
```
User Action
    ↓
Component calls Context Method
    ↓
Context updates State
    ↓
useEffect persists to localStorage
    ↓
Subscribed components re-render
```

**Key Code:** `src/contexts/InvestmentContext.tsx`
```typescript
// Load from storage
useEffect(() => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) setInvestments(JSON.parse(stored));
}, []);

// Persist to storage
useEffect(() => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(investments));
}, [investments]);
```

---

### 3. Service Layer

**Location:** `src/services/`

Class-based services with caching and API integrations:

| Service | Pattern | Cache |
|---------|---------|-------|
| PriceService | Class + in-memory Map | 1-minute TTL |
| PortfolioService | Pure calculation | Derived from state |
| BondAnalysisService | Payment scheduling | Computed on demand |
| CurrencyService | API + localStorage | 1-hour TTL |

**Caching Pattern:**
```typescript
class PriceService {
  private cache = new Map<string, { data: PriceData; timestamp: number }>();
  private CACHE_DURATION = 60000; // 1 minute

  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.CACHE_DURATION;
  }
}
```

---

### 4. Serverless Layer

**Location:** `api/`

Vercel Edge Functions with 30-second timeouts:

| Endpoint | Purpose | External API |
|----------|---------|--------------|
| `/api/chat` | AI assistant with tool calling | OpenAI (via Vercel AI) |
| `/api/yahoo` | Stock/ETF price proxy | Yahoo Finance |
| `/api/coingecko` | Crypto price proxy | CoinGecko |

**AI Tools:**
- `addInvestment` - Create investment from chat
- `updateInvestment` - Modify via chat
- `removeInvestment` - Delete via chat
- `refreshPrices` - Trigger price update
- `analyzePortfolio` - Generate analysis

---

## Data Flow Patterns

### Price Update Flow

```
User clicks "Update Prices"
    ↓
InvestmentContext.updatePrices()
    ↓
PriceService.updateAllPrices(investments)
    │
    ├─ Crypto ────────→ CoinGecko API
    ├─ Stock/ETF ─────→ /api/yahoo → Yahoo Finance
    ├─ Bond ──────────→ Yield calculation (local)
    └─ Other ─────────→ Keep current price
    │
    ↓
Cache fresh prices (1-min TTL)
    ↓
setInvestments(updated)
    ↓
localStorage persists
    ↓
UI re-renders with new prices
```

### Chat Flow

```
User sends message
    ↓
ChatBlob / ChatApiService
    ↓
POST /api/chat
    │
    ├─ Build portfolio context
    ├─ Call OpenAI with tools
    └─ Execute tools if triggered
    │
    ↓
Streaming response
    ↓
Display AI message
    ↓
If investment modified → sync to localStorage
```

---

## State Persistence

### Storage Strategy

| Data | Storage Key | Scope |
|------|-------------|-------|
| Investments | `investment-portfolio` | localStorage |
| Theme | `theme-preference` | localStorage |
| Language | `language-preference` | localStorage |
| Currency | `currency-preference` | localStorage |

**Privacy:** All portfolio data stays in browser. No server-side storage.

---

## API Architecture

### Vite Dev Proxy

```typescript
// config/vite.config.ts
server: {
  proxy: {
    '/api/yahoo': {
      target: 'https://query1.finance.yahoo.com',
      changeOrigin: true,
      rewrite: path => path.replace(/^\/api\/yahoo/, '')
    }
  }
}
```

### Vercel Production Routing

```json
// vercel.json
{
  "rewrites": [
    { "source": "/api/yahoo/(.*)", 
      "destination": "/api/yahoo?path=$1" }
  ],
  "headers": [
    { "source": "/api/*",
      "headers": [CORS, Security] }
  ]
}
```

---

## Key Architectural Decisions

### No Database (Privacy-First)

All investment data resides in `localStorage`. Trade-offs:
- **Pros:** Zero server data, works offline, no account needed
- **Cons:** 5MB limit, no cross-device sync, clear browser = data lost

### Service Classes Over Pure Functions

Services maintain internal state (caching) and are instantiated per request:
```typescript
const priceService = new PriceService(); // Single instance
```

### Context for Global State

React Context chosen over Redux/Zustand:
- Simpler setup
- No additional library weight
- Sufficient for current app complexity

### Serverless AI Chat

AI logic runs on Vercel to:
- Keep OpenAI API key server-side
- Enable tool execution (portfolio mutations)
- Allow streaming responses
