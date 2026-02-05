# Roadmap: Investment Portfolio Tracker v2.0

**Generated:** 2026-02-05
**Focus:** Portfolio Narrator - Educational insights (not advice)

---

## Overview

3-phase build: Narrative Engine → News & Context → Monetization & Polish

**Legal Position:** This app provides educational and informational content only. It does not provide investment advice, recommendations, or suitability assessments.

---

## Phase 1: The Narrative Engine

**Goal:** Generate weekly portfolio stories from data

**Requirements:** EDU-01, EDU-02, EDU-03

### Success Criteria
1. System analyzes portfolio and generates weekly observation narrative
2. Narrative includes: performance summary, allocation highlights, milestone alerts
3. User can view narrative in-app or receive via email (Pro)
4. Language is observational only (never advisory)

### Key Components
- Portfolio analyzer (local calculations)
- Narrative template engine
- Weekly Pulse UI component
- Email delivery system (Pro feature)
- Disclaimer integration

### Narrative Examples (Safe)
- "Your portfolio gained 3.2% this week"
- "Tech stocks represent 60% of your holdings"
- "You have reached $10,000 total value"
- "AAPL is your largest position at 25%"
- Never: "You should sell" or "Buy more"

---

## Phase 2: News & Context Engine

**Goal:** Add relevant market context to portfolio view

**Requirements:** EDU-04, EDU-05, EDU-06

### Success Criteria
1. System fetches news for user's holdings (free tier)
2. News is displayed in context with portfolio
3. Educational content library (what is diversification, rebalancing, etc.)
4. Historical context (how did similar portfolios perform in past conditions)

### Key Components
- News aggregation (RSS + free APIs: Finnhub, NewsAPI)
- News-to-holdings mapping
- Educational content database
- Historical scenario viewer
- Context panel in UI

### Educational Content (Examples)
- "What is portfolio diversification?"
- "Understanding volatility"
- "The difference between growth and value stocks"
- "How bonds affect portfolio stability"

---

## Phase 3: Monetization & Polish

**Goal:** Launch Pro tiers with premium features

**Requirements:** MON-01, MON-02, MON-03

### Success Criteria
1. Free tier functional with manual refresh
2. Pro tier ($4.99/mo) with auto-features active
3. Power tier ($9.99/mo) with advanced features
4. Clear upgrade paths and paywalls
5. Complete terms of service and disclaimers in place

### Key Components
- Subscription management
- Feature gating system
- Paywall UI components
- Terms of Service & Privacy Policy
- Disclaimers throughout app
- Pricing page

---

## Feature Matrix (Monetization)

| Feature | Free | Pro $4.99/mo | Power $9.99/mo |
|---------|------|--------------|----------------|
| Track investments | Unlimited | Unlimited | Unlimited |
| Basic charts | Yes | Yes | Yes |
| Manual Pulse generation | Yes | Yes | Yes |
| **Auto Weekly Pulse** | - | Yes | Yes |
| **Email delivery** | - | Yes | Yes |
| **News feed for holdings** | Basic | Full | Full + alerts |
| **Educational content** | Generic | Personalized | Advanced |
| **Historical scenarios** | 3/month | Unlimited | Unlimited |
| **Portfolio Health Score** | - | Yes | Yes |
| **Export** | JSON | PDF reports | Tax-ready reports |
| **Support** | - | Email | Priority |

---

## Build Order

```
Phase 1 (Narrative Engine - 3 weeks)
├── Portfolio analyzer (local calculations)
├── Narrative template system
├── Weekly Pulse UI
├── Email integration (for Pro)
├── Disclaimer system
└── Testing & refinement

Phase 2 (News & Context - 3 weeks)
├── News aggregation setup
├── News-to-holdings mapper
├── Educational content library
├── Historical data viewer
├── Context panel UI
└── Integration testing

Phase 3 (Monetization - 2 weeks)
├── Subscription system
├── Feature gating
├── Paywall UI
├── Terms & Privacy Policy
├── Pricing page
└── Launch preparation
```

---

## Legal Compliance Checklist

### Must Have Before Launch
- [ ] Terms of Service with liability disclaimer
- [ ] Privacy Policy
- [ ] "Not Financial Advice" disclaimer in app (footer of every page)
- [ ] Disclaimer in all emails
- [ ] User acknowledgment on signup
- [ ] All narratives reviewed to ensure observational tone
- [ ] No buy/sell/hold recommendations anywhere

### Ongoing
- [ ] Regular content audit for advisory language
- [ ] Monitor user feedback for compliance issues
- [ ] Update disclaimers if features change

---

## State

| Variable | Value |
|----------|-------|
| Current Phase | 1 (Narrative Engine) |
| Phase 1 Status | Not started - awaiting user approval |
| Phase 2 Status | Not started |
| Phase 3 Status | Not started |
| Monetization Strategy | Pro tier subscription ($4.99/mo) |
| Legal Review | Required before Phase 3 |

---

## Next Action

**User approval needed to proceed with Phase 1 planning.**

Once approved, run: `/gsd:plan-phase 1` to create detailed execution plans.

---

*Last updated: 2026-02-05*
*Legal position: Educational/observational tool only - not investment advice*
