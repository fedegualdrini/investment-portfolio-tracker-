Title: Tax Loss Harvesting Alerts
Slug: tax-loss-harvesting-alerts

## Overview

**Problem:**
Investors often miss opportunities to reduce their tax liability through tax loss harvesting. They either don't monitor their positions closely enough for unrealized losses, don't understand the wash sale rules, or simply aren't aware of the tax savings potential. This leads to paying more taxes than necessary and lower after-tax returns.

**Proposed solution:**
An intelligent alert system that continuously monitors the user's portfolio for tax loss harvesting opportunities. When an unrealized loss reaches a material threshold (dollar amount or percentage), the system sends a timely notification with the potential tax savings, wash sale warnings, and a one-click preview of the trade.

**Why now:**
- Tax season awareness is highest in Q1, creating natural user receptivity
- Many users experienced market volatility recently, creating unrealized loss scenarios
- Competitors (Wealthfront, Betterment) offer automated TLH but charge fees—this could be a differentiator for self-directed users
- Simple to implement with existing portfolio data infrastructure

## User stories

1. **As a** long-term investor with a diversified portfolio, **I want** to receive alerts when I have harvestable losses greater than $500, **so that** I can reduce my tax bill without constantly monitoring my positions.

2. **As a** busy professional who makes regular contributions, **I want** the system to warn me about potential wash sales before I trade, **so that** I don't accidentally invalidate my tax loss by repurchasing too soon.

3. **As a** tax-conscious investor preparing for year-end, **I want** to see a summary of my current harvestable losses and estimated tax savings, **so that** I can decide whether to realize losses before December 31.

4. **As a** new investor unfamiliar with tax loss harvesting, **I want** clear educational context with each alert, **so that** I understand why this matters and what actions to take.

## UX notes

- **Alert timing:** Send alerts Monday-Friday during market hours to enable same-day action; avoid weekends when markets are closed.
- **Threshold customization:** Default to $500 materiality threshold but allow users to adjust (e.g., $100, $250, $1,000, "any amount").
- **Alert format:** Push notification + in-app banner + email digest option. Include: ticker, current unrealized loss ($ and %), estimated tax savings, wash sale status, and CTA to preview trade.
- **Wash sale visualization:** Show red "warning" banner if buying the same/security within 30 days would trigger wash sale rule; suggest alternative ETFs or waiting period.
- **Educational layer:** Tooltips explaining TLH basics, wash sale rules, and "what happens next" after harvesting.
- **Settings panel:** Toggle alerts on/off, set thresholds, choose notification channels, set "do not disturb" for specific positions.

## Acceptance criteria

1. Given a user has positions with unrealized losses, when the loss amount exceeds their configured threshold, then an alert is generated and sent within 15 minutes during market hours.

2. Given a user views a TLH alert, when the position is within 30 days of a previous purchase, then the alert displays a prominent wash sale warning.

3. Given a user clicks "Preview Trade" on a TLH alert, when the modal opens, then it shows: sale proceeds, estimated tax savings (based on user's configured tax bracket), and wash sale countdown if applicable.

4. Given a user has TLH alerts enabled, when they make a purchase that would trigger wash sale with an existing position, then a warning is shown before order confirmation.

5. Given it is Q4 (October-December), when a user opens the app, then a year-end TLH summary card is displayed showing total harvestable losses YTD.

6. Given a user disables TLH alerts in settings, when new harvesting opportunities arise, then no notifications are sent and the feature is visibly disabled in the UI.

## Open questions

1. Should we integrate with external tax software (TurboTax, H&R Block) to import harvested losses automatically, or is CSV export sufficient for MVP?

2. Do we need to support tax loss harvesting across multiple accounts (taxable + IRA) or focus on taxable brokerage accounts only?

3. What's the best way to estimate "tax savings" without knowing the user's exact tax situation—should we ask for their tax bracket during onboarding or use a conservative default?

4. Should harvested losses be tracked in a separate "tax lots" view for easy reconciliation at tax time?

5. How should we handle mutual funds, which have different tax implications and less frequent pricing compared to ETFs/stocks?
