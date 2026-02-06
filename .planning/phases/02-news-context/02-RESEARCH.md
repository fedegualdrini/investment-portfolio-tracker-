# Phase 2 Research: News & Context Engine

**Phase:** 2 - News & Context Engine  
**Research Date:** 2026-02-06

---

## Goal

Enhance the Weekly Pulse with relevant market context: news about holdings, educational content, and historical scenario analysis.

### Success Criteria
1. Fetch news for user's holdings without cost (free APIs only)
2. Display news in context within the Weekly Pulse
3. Educational content library accessible from Pulse
4. Historical scenario analysis ("what if" comparisons)
5. All data processing remains local (privacy-first)

---

## News API Options

### Option 1: Finnhub (Recommended)
**URL:** https://finnhub.io
**Pricing:** Free tier - 60 requests/minute, no daily limit
**Endpoints:**
- `GET /api/v1/company-news?symbol=AAPL&from=2024-01-01&to=2024-01-31` - Company news
- `GET /api/v1/news?category=general` - General market news
- `API Key:** Required (free signup)

**Pros:**
- Generous free tier
- Real-time news
- Covers stocks, crypto, forex
- JSON format

**Cons:**
- Requires API key
- Rate limited (60/min)

### Option 2: NewsAPI
**URL:** https://newsapi.org
**Pricing:** Free tier - 100 requests/day
**Endpoints:**
- `GET /v2/everything?q=Apple&from=2024-01-01&to=2024-01-31` - Search news
- `GET /v2/top-headlines?category=business` - Top headlines

**Pros:**
- Simple API
- Good for general financial news

**Cons:**
- Only 100 requests/day (limiting)
- Requires API key

### Option 3: RSS Feeds (No API Key)
**Sources:**
- Yahoo Finance RSS
- MarketWatch RSS
- Reddit r/investing
- Crypto news aggregators

**Pros:**
- No API key required
- Unlimited requests
- Free forever

**Cons:**
- XML parsing required
- Less structured data
- May need CORS proxy

### Recommendation: Start with Finnhub
- Best free tier for financial news
- Real-time data
- Easy JSON parsing
- Can implement RSS as fallback

---

## Architecture

### News Service Layer
```typescript
// src/services/newsService.ts
interface NewsItem {
  symbol: string;
  headline: string;
  source: string;
  url: string;
  publishedAt: string;
  summary?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
}

class NewsService {
  // Fetch news for a symbol
  async fetchNewsForSymbol(symbol: string, days: number): Promise<NewsItem[]>
  
  // Fetch general market news
  async fetchGeneralNews(): Promise<NewsItem[]>
  
  // Simple sentiment analysis (keyword-based, local)
  analyzeSentiment(headline: string): 'positive' | 'negative' | 'neutral'
}
```

### Simple Sentiment Analysis (Local)
No ML needed - keyword matching:
```typescript
const positiveWords = ['surges', 'gains', 'beats', 'rises', 'rally', 'bullish', 'growth'];
const negativeWords = ['falls', 'misses', 'drops', 'declines', 'bearish', 'crash', 'loss'];

function simpleSentiment(text: string): 'positive' | 'negative' | 'neutral' {
  const lower = text.toLowerCase();
  const posCount = positiveWords.filter(w => lower.includes(w)).length;
  const negCount = negativeWords.filter(w => lower.includes(w)).length;
  
  if (posCount > negCount) return 'positive';
  if (negCount > posCount) return 'negative';
  return 'neutral';
}
```

### News Cache Strategy
Since we have rate limits:
- Cache news for 1 hour in localStorage
- Only fetch when user explicitly clicks "Refresh News"
- Show cached news immediately, update in background

---

## Educational Content Library

### Built-in Content (No API)
Create a static library for investment education:

```typescript
// src/lib/education/content.json
{
  "topics": {
    "diversification": {
      "title": "What is Diversification?",
      "content": "Diversification is spreading investments across...",
      "relatedSymbols": []
    },
    "volatility": {
      "title": "Understanding Volatility",
      "content": "Volatility measures how much prices fluctuate...",
      "relatedSymbols": []
    },
    "sectorRotation": {
      "title": "Sector Rotation",
      "content": "Money flows between sectors based on economic cycles...",
      "relatedSymbols": []
    }
  }
}
```

### Contextual Education
Link education to user's holdings:
- If user has crypto → show "Crypto volatility explained"
- If user has bonds → show "How bond prices work"
- If user has high concentration → show "Understanding concentration risk"

---

## Historical Scenario Analysis

### What-If Scenarios
1. **"What if 2022 happened again?"**
   - Show how portfolio would have performed during 2022 bear market
   - Use historical prices from Yahoo Finance

2. **"10 years ago" comparison**
   - Compare current allocation versus 2015 prices

3. **Volatility comparison**
   - Compare user's volatility to market benchmarks

### Data Sources
- Yahoo Finance historical prices (already implemented)
- Store historical data when user adds investments
- Query historical prices for analysis

---

## UI Components Needed

### 1. NewsCard
```tsx
<NewsCard
  headline="Apple announces new AI features"
  source="Reuters"
  time="2 hours ago"
  sentiment="positive"
  symbol="AAPL"
/>
```

### 2. NewsPanel
- Section in Weekly Pulse
- "Recent News About Your Holdings"
- Group by symbol or chronologically
- Limit to 5-10 most relevant items

### 3. EducationTooltip
- Small info icon next to concepts in Pulse
- Hover to see explanation
- Click to learn more

### 4. ScenarioViewer
- Modal/drawer for historical scenarios
- "See how this performed in [year]"
- Simple chart comparison

---

## Implementation Plan

### Wave 1: News Service
- Create `newsService.ts`
- Implement Finnhub integration
- Add local caching
- Build NewsCard component

### Wave 2: News Panel
- Add NewsPanel to Weekly Pulse
- Display fetched news
- Sentiment indicators
- "Refresh News" button

### Wave 3: Educational Content
- Create education content library
- Add contextual tooltips
- Link concepts to holdings

### Wave 4: Historical Scenarios
- Implement scenario calculations
- Build ScenarioViewer component
- Add to Weekly Pulse

---

## API Keys Strategy

### Free Tier Management
- Finnhub: 60 requests/minute = 86,400/day max
- With caching: ~100 users * 1 refresh/day = 100 request/day = plenty of headroom
- NewsAPI: 100/day as backup only

### User Experience
- Provide setup instructions for API key
- Validate key on settings page
- Graceful degradation if no key (show cached/static content)

---

## Legal Considerations

### News Attribution
- Must display source attribution
- Link to original article
- Follow each API's terms of service

### Content Licensing
- Educational content is original (no copyright issues)
- Historical data from public sources

---

## Resources

### Helpful Documentation
- Finnhub API: https://finnhub.io/docs/api
- React Query for caching: https://tanstack.com/query/

### Required Dependencies
- None major - just fetch API calls
- Optional: date-fns for date formatting

---

## Summary

Phase 2 adds **context** to the existing narrative system:
1. **News** - Real-time but cached, from Finnhub (free)
2. **Education** - Built-in library, no API needed
3. **History** - Scenario analysis using existing data

All features maintain the **privacy-first, local-only** principle.

---

*Research Complete - Ready for Planning*
