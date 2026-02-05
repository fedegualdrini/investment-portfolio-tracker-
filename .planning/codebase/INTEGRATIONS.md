# External Integrations

**Generated:** 2026-02-05

## Overview

| Service | Type | Purpose | Auth |
|---------|------|---------|------|
| **CoinGecko** | REST API | Cryptocurrency prices | None (free tier) |
| **Yahoo Finance** | REST API (proxied) | Stock/ETF prices | None |
| **DolarAPI** | REST API | ARS exchange rates | None |
| **Open Exchange Rates** | REST API | Multi-currency rates | None |
| **Vercel AI Gateway** | Serverless | AI assistant | API key |
| **Google Analytics 4** | Tracking | User analytics | Tracking ID |
| **Vercel Analytics** | SDK | Performance monitoring | None |

---

## Financial Data APIs

### CoinGecko API

**Base URL:** `https://api.coingecko.com/api/v3`

**Client-side integration** via `src/services/priceService.ts`:
```typescript
const COINGECKO_API = 'https://api.coingecko.com/api/v3';

async getCryptoPrice(symbol: string): Promise<number | null> {
  const coinId = CRYPTO_ID_MAP[symbol.toUpperCase()];
  const response = await fetch(
    `${COINGECKO_API}/simple/price?ids=${coinId}&vs_currencies=usd`
  );
  return data[coinId]?.usd;
}
```

**Crypto Symbol Mapping:**
| Symbol | CoinGecko ID |
|--------|-------------|
| BTC | bitcoin |
| ETH | ethereum |
| ADA | cardano |
| DOT | polkadot |
| LINK | chainlink |
| SOL | solana |
| MATIC | polygon |
| AVAX | avalanche-2 |
| ATOM | cosmos |

**Rate Limits:** 10-50 calls/minute (free tier)
**Caching:** 1-minute in-memory cache in PriceService

---

### Yahoo Finance API (Proxied)

**Base URL:** `https://query1.finance.yahoo.com`

**Proxy endpoint:** `api/yahoo.js`

**Vite dev proxy:**
```typescript
'/api/yahoo': {
  target: 'https://query1.finance.yahoo.com',
  changeOrigin: true,
  rewrite: path => path.replace(/^\/api\/yahoo/, '')
}
```

**Endpoint:** `GET /api/yahoo/v8/finance/chart/{symbol}`

**Query parameters:**
- `interval`: 1d (daily)
- `range`: 1d (current), 1y (historical)

**Usage:**
```typescript
const response = await fetch(
  `/api/yahoo/v8/finance/chart/${symbol}?interval=1d&range=1d`
);
const price = data.chart?.result?.[0]?.meta?.regularMarketPrice;
```

---

## Currency Exchange APIs

### DolarAPI (ARS Rates)

**Base URL:** `https://dolarapi.com/v1`

**Endpoint:** `GET /dolares/oficial`

**Response:**
```json
{
  "moneda": "USD",
  "casa": "oficial",
  "nombre": "Oficial",
  "compra": 1335,
  "venta": 1375,
  "fechaActualizacion": "2025-01-02T15:04:00.000Z"
}
```

**Implementation:** CurrencyService - 1-hour cache

---

### Open Exchange Rates

**Base URL:** `https://open.er-api.com/v6/latest`

**Endpoint:** `GET /{currency}`

**Supported Currencies:** USD, EUR, GBP, JPY, CAD, AUD, CHF, CNY, INR, BRL, MXN, ARS, KRW, RUB, ZAR, SEK, NOK, DKK, PLN, CZK, HUF, RON

**Fallback Rates:** Hardcoded in CurrencyService for offline operation

---

## AI Integration

### Vercel AI Gateway

**Endpoint:** `/api/chat.mjs` (serverless function)

**Model:** `openai/gpt-4o-mini`

**AI SDK Stack:**
```json
{
  "ai": "^5.0.33",
  "@ai-sdk/react": "^2.0.33",
  "@ai-sdk/openai": "^2.0.24",
  "@ai-sdk/gateway": "^1.0.18",
  "zod": "^4.1.5"
}
```

**Available Tools:**
| Tool | Description |
|------|-------------|
| `refreshPrices` | Update all investment prices |
| `addInvestment` | Create new investment from chat |
| `updateInvestment` | Modify existing investment |
| `removeInvestment` | Delete investment |
| `listInvestments` | Query portfolio |
| `analyzePortfolio` | Generate portfolio analysis |

**Environment Variable:**
```bash
AI_GATEWAY_API_KEY=<gateway_api_key>
```

**Max Duration:** 30 seconds

---

## Analytics Integrations

### Google Analytics 4

**Setup:** Environment variable `VITE_GA_TRACKING_ID`

**Tracked Events:**
| Event | Trigger |
|-------|---------|
| `add_investment` | Investment creation |
| `edit_investment` | Investment modification |
| `remove_investment` | Investment deletion |
| `refresh_prices` | Price update triggered |
| `chat_interaction` | Chat action |
| `bond_analysis` | Bond analysis view |
| `performance_analysis` | Performance view |
| `currency_change` | Currency toggle |
| `theme_toggle` | Theme switch |

### Vercel Analytics & Speed Insights

**Packages:** `@vercel/analytics`, `@vercel/speed-insights`

**Features:**
- Core Web Vitals tracking
- Real User Monitoring
- Performance insights

---

## API Proxy Configuration

### Vercel Rewrites

```json
{
  "source": "/api/yahoo/(.*)",
  "destination": "/api/yahoo?path=$1"
}
```

### CORS Headers (API Routes)

```javascript
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

### Security Headers (All Routes)

```javascript
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

---

## Required Environment Variables

```bash
# AI Gateway (required for chat features)
AI_GATEWAY_API_KEY=<your_key>

# Google Analytics (optional)
VITE_GA_TRACKING_ID=G-XXXXXXXXXX

# Search Console (optional)
VITE_SEARCH_CONSOLE_VERIFICATION=<code>
```

---

## Local Development

**Run local API server:**
```bash
npm run dev:api   # node run-api-local.mjs
```

**Run both frontend + API:**
```bash
npm run dev:full  # concurrently "npm run dev:api" "npm run dev"
```

**Local server:** Port 3001, proxied via Vite dev config
