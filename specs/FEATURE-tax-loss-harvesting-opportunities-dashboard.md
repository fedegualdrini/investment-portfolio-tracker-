---
trelloTitle: "Tax-loss harvesting opportunities dashboard"
trelloSummary:
  - "Surface actionable tax-loss harvesting (TLH) opportunities across taxable portfolios, with clear estimated tax impact and replacement guidance."
  - "Compute unrealized loss lots and flag wash-sale risks using recent and pending trades."
  - "Provide filters/sorting by account, security, loss size, holding period, and wash-sale status."
  - "Enable a review → select lots → export/execute workflow while keeping an auditable record of recommendations."
  - "Ship behind a feature flag with validation against sample portfolios and monitored calculation accuracy/performance."
---

## Overview
This feature adds a **Tax-loss harvesting opportunities dashboard** that helps users identify positions/lots with unrealized losses that may be harvested to offset taxable gains, while minimizing wash-sale risk.

The dashboard:
- Aggregates holdings and lots across taxable accounts.
- Calculates unrealized P/L at lot level (and aggregates to security/account).
- Estimates potential tax benefit based on user-selected tax profile assumptions.
- Flags wash-sale risk using trades within the wash-sale window and planned/queued trades.
- Supports a workflow to **review**, **select**, and **export/execute** sell (and optional replacement) actions.

Non-goals (initial release):
- Automatic trade execution at broker (unless the product already supports it; otherwise export-only).
- Full tax filing support; this is decision support.
- Perfect wash-sale detection across all possible “substantially identical” instruments; start with same ticker/CUSIP (or internal security id) rules and document limitations.

## User stories
1. As a taxable investor, I want to see which holdings have meaningful unrealized losses so I can decide whether to harvest them.
2. As a user, I want to filter opportunities by account, ticker, loss amount/percent, and holding period so I can focus on the best candidates.
3. As a user, I want to understand wash-sale risk (recent buys, dividend reinvestments, recurring buys) so I don’t accidentally disallow losses.
4. As a user, I want suggested replacement securities (or “do not replace”) to maintain market exposure while harvesting a loss.
5. As a user, I want to choose which lots to sell (specific-lot selection) to maximize losses harvested.
6. As a user, I want an estimated tax impact (federal/state, short vs long term) so I can compare options.
7. As a user, I want to export a trade plan (CSV or broker order template) so I can execute it.
8. As a user, I want an audit trail (what was recommended, what I selected, when) so I can reconcile decisions later.
9. As a user, I want the page to load quickly and stay accurate as prices update.

## Technical design (backend/data)
### Data inputs
- **Positions/Holdings**: current quantity by account + security.
- **Tax lots**: per account/security with acquisition date, quantity, cost basis, (optional) original lot id.
- **Prices/Quotes**: latest price per security (EOD + optional intraday).
- **Transactions/Trades**: buys/sells/dividends/reinvestments with trade date and settle date where available.
- **Security master**: security id, symbol, name, asset class, identifiers (CUSIP/ISIN), and relationships (optional: replacement mapping).
- **User tax profile** (assumptions): filing status, marginal rates, state, short/long cap gains rates, preference for holding period threshold handling.

### Core calculations
**Unrealized P/L per lot**
- `market_value = quantity * current_price`
- `cost_basis_value = quantity * cost_basis_per_share`
- `unrealized_pl = market_value - cost_basis_value`
- `unrealized_pl_pct = unrealized_pl / cost_basis_value` (guard for zero)

**Holding period classification**
- Short-term if holding period < 365 days (or per jurisdiction setting)
- Long-term otherwise

**Opportunity scoring/eligibility**
- Candidate lots: `unrealized_pl < 0` and quantity > 0
- Apply minimum thresholds (configurable):
  - Minimum loss $ amount (e.g., $100)
  - Minimum loss % (optional)
  - Exclude positions below de minimis market value (optional)

**Wash-sale risk detection (v1)**
- Detect purchases of the **same security** (same internal security id) within the wash-sale window:
  - Buys in the **30 days before** the proposed sale date.
  - Buys in the **30 days after** the proposed sale date (future buys can be proxied by scheduled/recurring plans and DRIP flags).
- Consider these as purchase events:
  - Regular buys
  - Dividend reinvestments (DRIP)
  - Automated recurring buys
- Compute:
  - `wash_sale_risk = none | possible | likely` depending on observed purchases and whether they overlap with shares being sold.
- Document limitations: “substantially identical” coverage may expand later (ETF ↔ mutual fund share classes, etc.).

**Estimated tax impact (assumptions-based)**
- For each selected/eligible lot:
  - `tax_benefit = -unrealized_pl * applicable_rate` (since unrealized_pl is negative)
  - Rate selection:
    - Short-term losses offset at short-term (ordinary) marginal rate (assumption)
    - Long-term losses offset at long-term cap gains rate (assumption)
- Aggregate to:
  - per lot, per security, per account, and portfolio totals
- Surface as “estimated” with disclaimers.

### Backend services / API
Provide endpoints to support the dashboard and selection workflow.

Suggested API shape (adapt to existing conventions):
- `GET /api/tlh/opportunities?accountId=&asOf=&minLoss=&includeWashSale=&holdingPeriod=`
  - Returns list grouped by security with nested lots.
- `GET /api/tlh/opportunities/:securityId` (detail)
  - Returns lots, wash-sale context events, replacement suggestions.
- `POST /api/tlh/plans` (create plan)
  - Body: selected lots, intended sale date, replacement selections, notes.
- `GET /api/tlh/plans/:planId` (audit/review)
- `GET /api/tlh/plans/:planId/export?format=csv`

### Data model additions
If not already present:
- `tlh_plan`
  - id, user_id, created_at, as_of, intended_sale_date, status (draft/exported/executed/archived), notes
- `tlh_plan_item`
  - plan_id, account_id, security_id, lot_id (nullable if aggregated), quantity, estimated_loss, holding_period, wash_sale_risk, replacement_security_id (nullable)
- Optional: `security_replacement_map` (curated mapping)
  - security_id, replacement_security_id, rationale, confidence

### Performance & correctness
- Precompute opportunities daily (EOD) and recompute on demand for latest quotes.
- Use pagination and server-side sorting for large portfolios.
- Ensure idempotent calculations for the same `asOf` timestamp.
- Add unit tests for:
  - lot P/L math
  - holding period classification
  - wash-sale window boundaries
  - aggregation totals

### Security & privacy
- Authenticate all endpoints; authorize by user_id → account ownership.
- Avoid exposing tax profile details in logs.
- Store plan exports as generated-on-demand (or short-lived signed URLs) rather than permanently storing files.

## UI/UX plan
### Information architecture
- New navigation item under **Tax** or **Insights**: “Tax-loss harvesting”.
- Main dashboard page with:
  1) Summary cards
  2) Opportunities table
  3) Opportunity detail drawer
  4) Selection + export panel

### Dashboard components
**Summary cards**
- Total unrealized losses (eligible)
- Estimated tax benefit (range or point estimate)
- Count of opportunities (securities / lots)
- Wash-sale risk counts

**Opportunities table (grouped by security)**
Columns (suggested):
- Security (symbol + name)
- Account(s)
- Total loss ($)
- Loss (%)
- Lots eligible (count)
- Holding period mix (ST/LT)
- Wash-sale risk badge
- Suggested replacement (if available)
- Actions: “Review”

**Filters & sorting**
- Account selector (multi)
- Asset class (optional)
- Loss $ slider/min input
- Holding period: Short-term / Long-term / All
- Wash-sale risk: hide risky / show all
- Search by symbol/name
- Sort by largest loss, largest tax benefit, wash-sale risk, etc.

**Detail drawer / modal**
- Lot list with checkboxes and per-lot fields:
  - acquisition date, quantity, cost basis, current price, unrealized loss, ST/LT
- Wash-sale context timeline:
  - recent buys/DRIP events with dates and quantities
- Replacement selection:
  - dropdown with recommended alternatives + “No replacement”
- Quantity selection:
  - full lot or partial (if supported); default full-lot

**Selection tray / plan builder**
- Shows selected lots, totals (loss, est. tax benefit), warnings
- CTA: “Create plan” → “Export CSV” (and/or “Mark as executed”)

### UX copy & disclaimers
- Prominent disclaimer: “Estimates only. Not tax advice.”
- Explain wash-sale: “Buying the same security within 30 days can disallow the loss.”
- If data incomplete (missing lots/cost basis): show a warning and exclude from totals.

### Accessibility & responsiveness
- Table supports keyboard navigation and screen reader labels.
- Mobile: collapse into cards per security, with expandable lots.

## Rollout plan
1. **Phase 0 (internal)**
   - Feature flag: `tlhDashboard`
   - Enable for internal users / test portfolios.
   - Validate calculations vs known scenarios.
2. **Phase 1 (beta)**
   - Limited cohort of taxable users.
   - Collect feedback on clarity of wash-sale warnings and replacement suggestions.
3. **Phase 2 (GA)**
   - Enable for all eligible users.
   - Add onboarding tooltip and help article.
4. **Phase 3 (enhancements)**
   - Expand wash-sale detection (substantially identical mapping).
   - Broker execution integration (if roadmap).
   - Smarter replacement recommendations and risk-aware constraints.

## Acceptance criteria
- Dashboard lists securities/lots with unrealized losses using current prices and available cost basis.
- Users can filter/sort opportunities by account, loss size, and holding period.
- Each opportunity shows a wash-sale risk indicator based on detected purchase events within the wash-sale window.
- Users can open a detail view and select specific lots/quantities for a harvesting plan.
- UI shows aggregated totals (selected loss and estimated tax benefit) that match backend calculations.
- Users can create a TLH plan and export it (CSV at minimum) with all required fields (account, symbol, quantity, lot acquisition date, estimated loss).
- All endpoints are authenticated and scoped to the current user.
- Feature is gated behind a flag and does not affect users when disabled.
- Automated tests cover calculation logic and at least one API integration path.

## Open questions
- What is the authoritative source of cost basis and lot identifiers (broker import vs manual entry), and how do we handle missing/partial lots?
- Should wash-sale detection include “substantially identical” rules beyond exact security id in v1? If yes, what mapping source?
- Do we consider settle date vs trade date for wash-sale windows, and do we expose the assumption?
- What tax profile inputs are available today (rates, filing status, state)? Should we support a “simple mode” (single marginal rate) first?
- Will we support partial-lot sales and/or specific-lot identification constraints per broker?
- What export formats are needed (generic CSV, broker-specific templates, OFX)?
- Should we persist price snapshots used for plan creation for auditability?
