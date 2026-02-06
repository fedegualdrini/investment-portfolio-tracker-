# Phase 2 Plan: News & Context Engine

**Phase:** 02 - News & Context Engine  
**Branch:** v2-narrative-engine  
**Created:** 2026-02-06

---

## Goal

Add relevant market context to Weekly Pulse: news for holdings, educational content, and historical scenario analysis.

**must_haves for this phase:**
- [ ] News service fetches data from Finnhub (free tier)
- [ ] News panel displays relevant articles in Weekly Pulse
- [ ] Simple sentiment indicators (positive/negative/neutral)
- [ ] Educational content library with contextual tooltips
- [ ] Historical scenario analysis (2022 bear market comparison)
- [ ] All processing remains local, respects API rate limits

---

## Wave 1: News Service

### Plan 02.01: Create News Service Module
---
wave: 1
depends_on: []
files_modified:
  - src/services/newsService.ts
  - src/lib/news/types.ts
  - src/lib/news/cache.ts
autonomous: false
---

**Objective:** Build service to fetch and cache news from Finnhub.

**Tasks:**
1. Create `src/lib/news/types.ts`:
   - `NewsItem` interface (symbol, headline, source, url, publishedAt, sentiment)
   - `NewsCache` interface for localStorage

2. Create `src/lib/news/cache.ts`:
   - `getCachedNews(symbol)` - retrieve from localStorage
   - `setCachedNews(symbol, data)` - store with timestamp
   - `isCacheValid(symbol, maxAge)` - check if cache is fresh (1 hour)
   - `clearExpiredCache()` - cleanup old entries

3. Create `src/services/newsService.ts`:
   - `fetchNewsForSymbol(symbol, days)` - call Finnhub API
   - `fetchGeneralNews()` - get market-wide news
   - `analyzeSentiment(headline)` - keyword-based sentiment
   - `getNewsForPortfolio(symbols)` - batch fetch for all holdings
   - Handle API key from environment or settings

**Verification:**
- Service can fetch news for AAPL (test symbol)
- Caching works (second call uses cache)
- Sentiment analysis returns valid values
- Handles API errors gracefully

---

## Wave 2: News Panel UI

### Plan 02.02: Create News Card & Panel Components
---
wave: 2
depends_on: ["02.01"]
files_modified:
  - src/components/NewsCard.tsx
  - src/components/NewsPanel.tsx
  - src/hooks/useNews.ts
autonomous: false
---

**Objective:** Build UI to display news in Weekly Pulse.

**Tasks:**
1. Create `src/components/NewsCard.tsx`:
   - Display headline, source, time
   - Sentiment indicator (green/red/grey dot)
   - Link to original article
   - Compact card design matching app theme

2. Create `src/components/NewsPanel.tsx`:
   - Section header: "Recent News About Your Holdings"
   - List of NewsCards (max 10 items)
   - Group by symbol or chronological
   - "Refresh News" button with loading state
   - Empty state when no news available

3. Create `src/hooks/useNews.ts`:
   - `useNews(portfolioSymbols)` - fetch news for all holdings
   - `refreshNews()` - force refresh bypassing cache
   - Loading, error, data states

4. Add NewsPanel to WeeklyPulse component

**Verification:**
- News displays for portfolio holdings
- Refresh button fetches new data
- Sentiment colors show correctly
- Links open in new tab

---

## Wave 3: Educational Content Library

### Plan 02.03: Create Education Module
---
wave: 3
depends_on: []
files_modified:
  - src/lib/education/content.ts
  - src/lib/education/types.ts
  - src/components/EducationTooltip.tsx
autonomous: false
---

**Objective:** Add built-in educational content and contextual tooltips.

**Tasks:**
1. Create `src/lib/education/types.ts`:
   - `EducationTopic` interface (id, title, content, relatedSymbols)

2. Create `src/lib/education/content.ts`:
   - Static content for investment concepts:
     - "What is Diversification?"
     - "Understanding Volatility"
     - "What are Bonds?"
     - "Crypto Volatility Explained"
     - "Sector Rotation"
     - "Rebalancing Explained"
   - `getRelevantTopics(portfolio)` - return topics based on holdings
   - `getTopic(id)` - retrieve specific topic

3. Create `src/components/EducationTooltip.tsx`:
   - Info icon with hover tooltip
   - Shows brief explanation
   - "Learn more" link to full content
   - Dark theme compatible

4. Add tooltips to WeeklyPulse sections:
   - Allocation section → Diversification tooltip
   - Performance section → Volatility tooltip
   - Contextual based on portfolio composition

**Verification:**
- Tooltips appear on hover
- Content is educational (not advisory)
- Topics match portfolio holdings
- Full content readable in modal/drawer

---

## Wave 4: Historical Scenario Analysis

### Plan 02.04: Create Scenario Analysis Module
---
wave: 4
depends_on: []
files_modified:
  - src/lib/scenarios/calculator.ts
  - src/lib/scenarios/data.ts
  - src/components/ScenarioViewer.tsx
autonomous: false
---

**Objective:** Add "what-if" historical analysis to Weekly Pulse.

**Tasks:**
1. Create `src/lib/scenarios/data.ts`:
   - Store key historical periods:
     - 2022 Bear Market (Jan-Dec 2022)
     - COVID Crash (Feb-Mar 2020)
     - 2018 Correction
   - `getHistoricalPrices(symbol, startDate, endDate)` - from existing Yahoo service

2. Create `src/lib/scenarios/calculator.ts`:
   - `calculateScenario(portfolio, period)` - simulate portfolio in historical period
   - `compareToCurrent(portfolio, period)` - show difference
   - Returns: hypothetical value, gain/loss, comparison to actual

3. Create `src/components/ScenarioViewer.tsx`:
   - Drawer/modal with scenario selector
   - "What if 2022 happened again?" preset
   - Show hypothetical portfolio value
   - Comparison chart (scenario vs actual timeline)
   - Add to WeeklyPulse as "Explore Scenarios" link

**Verification:**
- Scenario calculates correctly for test portfolio
- Comparison shows meaningful data
- UI responsive and themed correctly
- Educational tone (shows risk, not predictions)

---

## Wave 5: Integration & Polish

### Plan 02.05: Final Integration & Performance
---
wave: 5
depends_on: ["02.02", "02.03", "02.04"]
files_modified:
  - src/components/WeeklyPulse.tsx (updates)
  - src/components/Settings/NewsSettings.tsx (optional)
autonomous: false
---

**Objective:** Integrate all components and optimize performance.

**Tasks:**
1. Update WeeklyPulse layout:
   - Add NewsPanel section
   - Add Education tooltips
   - Add "Explore Scenarios" CTA
   - Ensure proper spacing
   - Mobile responsive

2. Add loading states for news fetch
3. Add error handling for API failures
4. Cache optimization (respect Finnhub 60 req/min limit)

5. Optional: News settings component:
   - API key input
   - Cache duration setting
   - Enable/disable news feature

**Verification:**
- Weekly Pulse renders all sections
- News loads and displays
- Tooltips work
- Scenarios calculate
- Mobile layout works
- No console errors

---

## Success Criteria Summary

| # | Criteria | How Verified |
|---|----------|--------------|
| 1 | News fetched from Finnhub | Manual test with valid symbol |
| 2 | News displays in Pulse | Visual inspection |
| 3 | Sentiment indicators show | Check positive/negative icons |
| 4 | Education tooltips work | Hover test |
| 5 | Scenarios calculate | Test with 2022 scenario |
| 6 | All features respect rate limits | Cache behavior verified |
| 7 | Mobile responsive | Resize test |

---

## API Key Setup

Users need to obtain free Finnhub API key:
1. Visit https://finnhub.io/register
2. Get free API key
3. Add to app settings
4. Or use environment variable: `VITE_FINNHUB_API_KEY=xxx`

---

## Next Phase Preview

**Phase 3: Monetization**
- Pro tier paywall ($4.99/mo)
- Email delivery of Weekly Pulse
- Advanced scenarios (unlimited)

---

*Ready for execution*
