# Product Spec: Transaction Ledger + Lot Tracking + Performance (TWR + XIRR)

## Overview

### Problem
Investors currently lack visibility into their true portfolio performance and tax liabilities. Without proper transaction tracking and lot-level cost basis, users cannot:
- Accurately calculate realized/unrealized gains for tax reporting
- Understand which lots to sell for tax-loss harvesting
- Measure performance independent of cash flow timing (TWR)
- Compare returns against benchmarks or alternative investments (XIRR)

### Solution
Build a comprehensive transaction ledger with automatic lot tracking and industry-standard performance calculations:
1. **Transaction Ledger**: Immutable record of all portfolio activity (buys, sells, dividends, splits, transfers)
2. **Lot Tracking**: FIFO/LIFO/Specific ID cost basis with wash sale detection
3. **TWR (Time-Weighted Return)**: Performance metric eliminating cash flow impact
4. **XIRR (Extended IRR)**: Annualized return accounting for irregular cash flows

### Why Now
- Tax season approaching — users need cost basis reports
- Competitive benchmark: most portfolio apps lack accurate TWR/XIRR
- Enables future advanced features: tax-loss harvesting, rebalancing suggestions

---

## User Stories

### Priority 1 (Must Have)
1. **As an** investor **I want to** record buys/sells with date, price, shares, fees **so that** I have a complete transaction history.
2. **As a** taxpayer **I want to** see my cost basis per lot **so that** I can accurately report capital gains.
3. **As a** portfolio manager **I want to** view TWR for any time period **so that** I can evaluate manager performance independent of my deposits/withdrawals.
4. **As an** investor **I want to** calculate XIRR for my portfolio **so that** I can compare returns against other investments.

### Priority 2 (Should Have)
5. **As a** trader **I want to** select specific lots when selling **so that** I can optimize tax outcomes.
6. **As a** investor **I want to** detect wash sales automatically **so that** I avoid tax penalties.
7. **As a** user **I want to** handle corporate actions (splits, mergers, spinoffs) **so that** my ledger stays accurate.
8. **As a** user **I want to** import transactions from broker CSV/QFX **so that** I don't manual enter data.

### Priority 3 (Could Have)
9. **As a** advisor **I want to** export tax reports (Form 8949 style) **so that** I can file taxes easily.
10. **As a** user **I want to** see unrealized gain/loss by lot **so that** I can identify tax-loss harvesting opportunities.

---

## UX Notes

### Transaction Entry
- Single-form entry with type selector (Buy/Sell/Dividend/Transfer/Split)
- Smart defaults: auto-fill symbol, suggest average price from recent lots
- Inline validation: prevent negative shares, flag wash sale warnings
- Bulk import: CSV template with preview before commit

### Lot Visualization
- Expandable position view showing individual lots
- Color coding: green (gain), red (loss), yellow (wash sale risk)
- Sort options: by date, by gain/loss amount, by gain/loss %
- Selection UI for specific lot selling (checkboxes with auto-calc preview)

### Performance Dashboard
- TWR card: show period selector (YTD, 1Y, 3Y, 5Y, All)
- XIRR card: annualized % with comparison to benchmark (S&P 500)
- Cash flow timeline: visual chart of deposits/withdrawals overlay with portfolio value
- Both metrics link to detailed calculation breakdown (hover for daily data points)

### Key Interactions
- "What if" mode: simulate selling specific lots to preview gains/losses
- One-click export: tax-year summary PDF
- Audit trail: show which lots were consumed by which sales

---

## Acceptance Criteria

### Transaction Ledger
- [ ] CRUD operations for transactions with immutable history (soft delete only)
- [ ] Support transaction types: BUY, SELL, DIVIDEND, INTEREST, SPLIT, TRANSFER_IN, TRANSFER_OUT, FEE
- [ ] Validate: date not future, shares > 0, price >= 0, fees >= 0
- [ ] Cascade updates: editing historical transaction recalculates all downstream lots and performance

### Lot Tracking
- [ ] Automatic lot creation on BUY/TRANSFER_IN
- [ ] Automatic lot consumption on SELL using configurable method (FIFO default, LIFO, HIFO, Specific ID)
- [ ] Track per lot: acquisition date, cost basis, shares remaining, realized gain when closed
- [ ] Handle partial lot sales (split lot into remaining + sold portions)
- [ ] Corporate actions: stock splits adjust shares and cost basis proportionally

### TWR (Time-Weighted Return)
- [ ] Calculate using Daily Valuation method (geometrically linked sub-period returns)
- [ ] Formula: TWR = [(1 + R₁) × (1 + R₂) × ... × (1 + Rₙ)] − 1
  - where Rₙ = (EV − BV − CF) / (BV + CF_weighted)
- [ ] Handle external cash flows (deposits/withdrawals) as day-boundary events
- [ ] Support custom date range calculation
- [ ] Display annualized TWR for periods > 1 year

### XIRR (Extended Internal Rate of Return)
- [ ] Calculate using Newton-Raphson or similar numerical method
- [ ] Include all cash flows: initial investment (negative), final value (positive), dividends (positive)
- [ ] Convergence tolerance: 0.0001% or max 100 iterations
- [ ] Display as annualized percentage
- [ ] Show both portfolio-level XIRR and per-holding XIRR

### Error Handling
- [ ] Detect and flag wash sales (30-day window before/after loss sale)
- [ ] Detect missing price data for valuation dates
- [ ] Detect orphaned lots (sell without corresponding buy)
- [ ] Show calculation audit log for debugging

### Performance Requirements
- [ ] TWR/XIRR calculation for 10-year daily data completes in < 500ms
- [ ] Lot calculations for 1000+ transactions complete in < 1s
- [ ] UI remains responsive during background recalculation

---

## Open Questions

### Product
1. **Cost basis methods**: Do we need to support every method (FIFO, LIFO, HIFO, Specific ID) or start with FIFO only?
2. **Wash sale handling**: Should we automatically adjust cost basis or just flag for user awareness?
3. **Benchmark comparison**: Which benchmarks to offer (S&P 500, total market, custom)? Who provides the data?
4. **Crypto support**: Cryptocurrency has different lot rules (no wash sale, can choose specific lots freely). Separate treatment needed?

### Technical
5. **Data storage**: Store pre-calculated daily valuations for TWR or compute on-demand? Storage vs. speed tradeoff?
6. **Price data**: Integration with which price provider? Handle delisted/split-adjusted historical data?
7. **Multi-currency**: How handle forex transactions? Convert at daily rate or transaction rate?
8. **Accuracy precision**: Decimal precision for calculations (4 decimals? 6?)?

### Compliance
9. **Tax reporting**: What format for export (CSV, PDF, direct TurboTax integration)? Which jurisdictions?
10. **Audit requirements**: How long retain calculation snapshots for IRS audit defense?

### Prioritization
11. **MVP scope**: Can we ship without corporate actions (splits, mergers) in v1?
12. **Mobile**: Full feature parity on mobile or desktop-first?

---

## Appendix: TWR vs. XIRR Decision Guide

| Use Case | Recommend Metric |
|----------|-----------------|
| Comparing to fund managers, indexes | TWR |
| Comparing to savings account, real estate | XIRR |
| Portfolio with frequent cash flows | Both |
| Tax planning | Neither (use raw gains) |
| Long-term performance tracking | Both (side-by-side) |

---

*Spec Version: 1.0*
*Target Release: MVP Tax Season Support*
