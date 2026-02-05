Title: Tax-Loss Harvesting Opportunities Dashboard
Slug: tax-loss-harvesting-opportunities-dashboard

## Overview (Problem / Proposed solution / Why now)
**Problem**
Investors often miss tax-loss harvesting (TLH) opportunities because losses are spread across accounts/lots and require manual calculation against cost basis, current price, and holding period. This leads to avoidable tax drag, especially during volatile markets.

**Proposed solution**
Add a dedicated "Tax-Loss Harvesting" dashboard that scans holdings by tax lot (where available) or by aggregated position (fallback) to surface:
- Unrealized losses above a user-configurable threshold (e.g., $500 or 5%)
- Estimated short-term vs long-term loss classification
- "Harvest potential" summary (total harvestable losses, by account and by asset class)
- Wash-sale risk warnings based on user-defined related tickers/ETFs and recent transactions (best-effort)
- One-click action checklist (not trading execution): mark as “Plan to harvest”, add notes, export to CSV/PDF for accountant/broker

**Why now**
As portfolio trackers mature from performance-only views, users want actionable, tax-aware insights. TLH is a high-value workflow for taxable investors and can differentiate the product while increasing retention around market drawdowns and year-end planning.

## User stories
- As a taxable investor, I want to see which positions have meaningful unrealized losses so I can decide whether to harvest them.
- As a user with multiple brokerage accounts, I want a consolidated view of harvestable losses across all taxable accounts.
- As a user, I want to know whether a loss is likely short-term or long-term so I can understand potential tax impact.
- As a user, I want to flag wash-sale risk so I don’t accidentally disallow losses.
- As a user, I want to export a TLH report to share with my accountant.
- As a user, I want to customize thresholds and exclusions (e.g., ignore small losses or certain long-term holdings).

## UX notes
- Add a new nav item: **Insights → Tax-Loss Harvesting** (or **Planning → Taxes**).
- Top summary cards:
  - Total harvestable loss (ST / LT)
  - # of opportunities
  - Wash-sale risk count
  - Accounts affected
- Primary table (sortable/filterable):
  - Ticker / Name
  - Account
  - Quantity (or lot qty)
  - Cost basis
  - Current value
  - Unrealized P/L ($ and %)
  - Holding period badge: ST / LT / Unknown
  - Wash-sale risk badge: Low / Medium / High (with tooltip)
  - “Plan to harvest” toggle + notes icon
- Filters:
  - Account (taxable only by default)
  - Minimum loss ($ / %)
  - ST/LT
  - Asset type (stocks/ETFs/mutual funds/crypto—if supported)
  - Exclude tickers
- Empty/limited-data states:
  - If no lot-level data: show aggregated positions with clear label “Estimates (no lots)”.
  - If cost basis missing: prompt user to import/enter cost basis and explain why it’s required.
- Educational helper panel (collapsible):
  - TLH basics, wash-sale rule disclaimer, and “Not tax advice”.

## Acceptance criteria
- Dashboard lists harvest candidates using the user’s configured thresholds, defaulting to a reasonable preset (e.g., $500 OR 5%).
- For each candidate, the system displays unrealized loss in $ and % using available cost basis and latest price.
- Candidates are categorized as short-term vs long-term when purchase/lot date is known; otherwise marked “Unknown”.
- The dashboard provides an at-a-glance summary of total harvestable losses (overall and ST/LT split).
- Users can mark/unmark a position (or specific lot, if available) as “Plan to harvest” and add a note; this state persists.
- The system flags potential wash-sale risk when a user has recorded purchases of the same (or user-linked “substantially identical”) security within a lookback window (e.g., 30 days) and explains the reason in a tooltip.
- Users can export the displayed table (respecting filters) to CSV and a printable report format (PDF or print view).
- Clear disclaimers are shown that calculations are estimates and not tax advice.

## Open questions
- Do we already ingest lot-level cost basis and purchase dates, or only aggregated positions? What broker/import formats are supported?
- How are transactions represented (buys/sells/dividends/reinvestments), and do we have a reliable “trade date” history for wash-sale checks?
- Should we support user-defined replacement suggestions (e.g., alternate ETF) or keep the feature strictly informational?
- What jurisdictions do we support (US-focused wash-sale logic vs international tax rules)? Should this be gated by a “Tax country” setting?
- How should we handle ETFs/mutual funds where “substantially identical” is ambiguous—manual mapping only, or heuristic suggestions?
