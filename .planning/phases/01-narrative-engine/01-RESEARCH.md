# Phase 1 Research: Narrative Engine

**Phase:** 1 - The Narrative Engine  
**Research Date:** 2026-02-05

---

## Goal Understanding

Build a system that generates weekly portfolio observation narratives. These are educational/informational stories about what happened in the user's portfolio - NOT investment advice.

### Success Criteria
1. Analyze portfolio data locally (no external API calls for analysis)
2. Generate human-readable narratives using templates
3. Include: performance summary, allocation highlights, achievements
4. Observational language only (never prescriptive)
5. Include proper legal disclaimers

---

## Technical Architecture

### Local Analysis Engine (No External APIs)

**Data Available Locally:**
- Current portfolio structure (stocks, bonds, crypto, cash)
- Historical transactions and prices (stored in localStorage)
- Real-time prices (already fetched via Yahoo/CoinGecko)

**Calculations Needed:**
1. **Performance Metrics**
   - Total portfolio value (current)
   - Total invested (cost basis)
   - Absolute gain/loss (value - invested)
   - Percentage return ((value - invested) / invested * 100)
   - Period comparison (week-over-week, month-over-month)

2. **Allocation Analysis**
   - Percentage by asset type (stocks, bonds, crypto, cash)
   - Percentage by individual holding
   - Sector allocation (if data available)
   - Largest single position

3. **Trend Detection**
   - Best performer (by % change period-over-period)
   - Worst performer
   - New highs/lows for holdings
   - Milestone achievements ($1K, $5K, $10K, etc.)

### Narrative Template System

**Template Categories:**

1. **Performance Templates**
   - "Your portfolio [value change] this week"
   - "Since last week, you're up/down [$amount] ([percentage])"
   - "Your portfolio value is now $[total]"

2. **Allocation Templates**
   - "[Asset type] makes up [percentage] of your portfolio"
   - "Your largest position is [symbol] at [percentage]"
   - "You have [N] different [asset types]"

3. **Top Mover Templates**
   - "[Symbol] had the biggest gain this week: +[percentage]%"
   - "[Symbol] was your worst performer: -[percentage]%"

4. **Milestone Templates**
   - "You've reached $[amount] total value!"
   - "[Symbol] crossed $[threshold] total value"

5. **Comparison Templates (Educational)**
   - "Tech stocks typically make up 28% of the S&P 500"
   - "Some investors keep single positions under 10% for diversification"

### Safe Language Rules

**ALLOWED (Observational):**
- "Your AAPL position gained 5% this week"
- "Tech stocks represent 60% of your holdings"
- "You have $10,000 in total portfolio value"
- "This week your portfolio increased by $500"

**PROHIBITED (Advisory):**
- "You should consider selling AAPL"
- "This is a good investment"
- "Rebalance your portfolio now"
- "Your portfolio is too risky"

---

## UI Components Needed

1. **Weekly Pulse Card**
   - Display generated narrative
   - Show key metrics as highlights
   - CTA to generate new pulse (manual refresh)
   - Timestamp of last generation

2. **Narrative History**
   - List of past pulses
   - Search/filter capability
   - Date-based navigation

3. **Email Settings (Pro only)**
   - Toggle auto-delivery
   - Day/time preferences
   - Email preview

---

## Email Delivery (Pro Feature)

**Frequency Options:**
- Weekly (default)
- Bi-weekly
- Monthly

**Content:**
- Same narrative as in-app
- Mobile-friendly template
- Unsubscribe link
- Disclaimer footer

**Technical:**
- Email service integration (SendGrid, Resend, etc.)
- Template with branding
- Scheduled delivery system

---

## Implementation Notes

### Performance Considerations
- Calculate metrics on-demand (not continuously)
- Cache calculated results for session
- LocalStorage only (no cloud)
- Computation must be fast (< 100ms on mobile)

### Templates as JSON
Easier to maintain, test, and version:
```json
{
  "category": "performance",
  "templates": [
    "Your portfolio {{direction}} {{amount}} this week ({{percentage}})",
    "Since last week, your portfolio is {{direction}} {{amount}}"
  ],
  "placeholders": ["direction", "amount", "percentage"]
}
```

### Testing Strategy
1. Unit tests for calculation functions
2. Template rendering tests with mock data
3. Narrative output review for prohibited language
4. Edge cases: empty portfolio, single holding, massive losses/gains

---

## Dependencies

**No new external dependencies for Phase 1** - all local processing.

**Existing to leverage:**
- Portfolio data layer (already implemented)
- Price fetching (Yahoo/CoinGecko integration)
- localStorage persistence
- React state management

---

## Open Questions

1. **Narrative freshness:** Should old prices trigger "data stale" warnings?
2. **Template variety:** How many templates per category to avoid repetition?
3. **Tone calibration:** How friendly vs. educational? (User said "mix of both")
4. **Milestone triggers:** What thresholds? ($100 increments up to $1K, then $1K increments?)

---

## Resources

**No external research needed** - this is domain knowledge + internal data analysis.

**Reference:**
- Current codebase structure in `src/`
- Portfolio types in existing code
- Current localStorage schema

---

*Research Complete - Ready for Planning*
