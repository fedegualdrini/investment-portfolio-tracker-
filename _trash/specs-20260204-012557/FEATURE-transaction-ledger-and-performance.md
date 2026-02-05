# Transaction Ledger + Lot Tracking + Performance (TWR / XIRR)

## Overview
- **Problem:** The app tracks holdings as a single “position” per asset (quantity + purchase price/date). That makes it hard to represent real investing behavior (multiple buys/sells over time, dividends/interest, fees, taxes, partial sales) and prevents accurate performance calculations.
- **Proposed solution:** Introduce a Transaction Ledger as the source of truth (buys, sells, dividends/interest, fees, taxes, deposits/withdrawals, splits). From the ledger, derive lots (for cost basis), positions, realized/unrealized P&L, and portfolio performance metrics (TWR and XIRR).
- **Why now:** This is the biggest gap vs serious portfolio tools; it unlocks correctness (returns), richer insights (income, taxes, cashflows), and a clean path to multi-device sync later.

## User stories
- As a user, I can add multiple transactions for the same asset (buys/sells over time) and see my current position updated automatically.
- As a user, I can record dividends/interest and fees/taxes and see how they affect realized returns.
- As a user, I can see my portfolio performance as **time-weighted return (TWR)** and **money-weighted return (XIRR)** over selectable periods.
- As a user, I can import/export my portfolio including the full transaction history.
- As a user, I can edit or delete a transaction and the app recomputes positions and metrics consistently.

## UX notes
- Entry points:
  - Add a new header nav item (or route) for **Transactions**.
  - Add “Add transaction” from an investment details view.
- Primary flows:
  - Transactions table (filter by asset/type/date; add/edit/delete).
  - “Position view” stays simple, but is derived from transactions.
  - Performance page shows portfolio-level charts + table of contributions/withdrawals and return metrics.
- Empty/loading/error states:
  - If no transactions exist: prompt to import or add first transaction.
  - If legacy investments exist without transactions: provide a one-time migration wizard.
- Accessibility considerations:
  - Transactions table must be keyboard navigable; modal dialogs must trap focus and close on Escape.

## Data model
- Entities/fields:
  - `Transaction`
    - `id`, `timestamp` (ISO), `type` (BUY/SELL/DIVIDEND/INTEREST/FEE/TAX/DEPOSIT/WITHDRAWAL/SPLIT)
    - `assetId` (symbol + type), `quantity` (for trades), `price` (per unit), `currency`, `fxRateToBase?`
    - `amount` (for cash-only events), `notes?`
  - `Lot` (derived)
    - `lotId`, `assetId`, `openQty`, `costBasisBase`, `openedAt`, `method` (FIFO default; later allow AvgCost)
  - `Position` (derived)
    - `assetId`, `qty`, `avgCostBase`, `marketValueBase`, `unrealizedPnlBase`, `realizedPnlBase`
- Validation rules:
  - Transactions must be immutable IDs; editing rewrites fields but keeps ID stable.
  - No negative quantities for BUY; SELL cannot exceed available quantity unless we support shorts (out of scope for v1).
- Migration notes:
  - Legacy `Investment` entries become a synthetic BUY transaction at the recorded purchase date/price.

## API / backend
- For v1 local-first: keep computation in frontend services + persist to localStorage.
- If/when using `/api`:
  - Optional serverless helper endpoints for heavy calculations or caching.
- Auth / abuse:
  - If AI tools touch the ledger, ensure prompt context is summarized and rate-limited.

## Frontend implementation plan
- Routes/pages:
  - `/transactions` (ledger table + add/edit form)
  - `/performance` update to include TWR + XIRR and cashflow timeline
- Components/pages to add/change:
  - `TransactionsPage`, `TransactionForm`, `TransactionsTable`
  - `PerformanceComparisonPage` → expand into `PerformancePage` or add sections
  - Update existing `InvestmentContext` to store `transactions` and derive `investments/positions`.
- State management:
  - Introduce `TransactionContext` (or extend existing context) with derived selectors.
- i18n/currency formatting impacts:
  - Ensure transaction amounts and returns are formatted per selected display currency; persist base-currency amounts for calculations.

## Edge cases
- Corporate actions (splits) and their effect on lots.
- Multi-currency transactions and FX conversion at transaction time.
- Rounding issues across long transaction histories.

## Rollout plan
- Start with v1: BUY/SELL/DIVIDEND/FEE + derived positions, plus basic TWR/XIRR.
- Add later: taxes, interest, deposits/withdrawals, splits, lot-method choices.
- Provide a migration wizard from legacy investments.

## Acceptance criteria
- [ ] User can create/edit/delete BUY/SELL transactions and see position quantity update correctly.
- [ ] App computes realized + unrealized P&L from the ledger.
- [ ] App displays portfolio-level TWR and XIRR for a selected date range.
- [ ] Import/export includes full transaction history.

## Open questions
- Should v1 use FIFO only, or allow AvgCost immediately?
- How should we represent deposits/withdrawals (portfolio-level cashflows) vs per-asset events?
- Should FX rates be captured per transaction (recommended) or inferred from historical FX API calls?

## Notes
This spec was created via the intended pipeline (Product Strategist → Backend Architect → UI Implementation Specialist), but their first-run outputs were incomplete; we’ll refine the agent prompts/tasks after this test run.
