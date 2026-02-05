# Tax-Loss Harvesting Opportunities Dashboard — Backend / Feasibility Spec

Slug: `tax-loss-harvesting-opportunities-dashboard`

Scope: backend/data + computation to surface harvestable unrealized losses by account/asset, estimate short-term (ST) vs long-term (LT) classification, and flag wash-sale risk (best-effort). Includes user thresholds, per-opportunity notes, and CSV/PDF export support.

Non-goals (backend): provide tax advice; guarantee wash-sale compliance; replace formal lot accounting from brokers/tax software.

---

## Backend / data considerations

### Required domain data (minimum viable)
1. **Accounts & holdings**
   - Account identifier, institution/broker metadata.
   - Current positions per account + symbol/asset identifier.
   - Current market price and price timestamp (for unrealized P/L calculations).

2. **Tax lots (preferred) or cost basis approximations (fallback)**
   - For each position, ideally lots with:
     - `lot_id`
     - `account_id`
     - `asset_id` (symbol/CUSIP/ISIN mapping)
     - `acquired_at` (trade/settlement date; decide one and be consistent)
     - `quantity` (remaining)
     - `cost_basis_total` (or per-share basis)
     - Optional: `source` (broker/import), `wash_adjusted_basis` if provided.
   - If lots are not available, degrade to an **estimated lot** model (e.g., average cost). This limits ST/LT and wash-sale accuracy; the UI should label results as “estimated”. Backend should carry an `is_estimate` flag per row.

3. **Transaction history (for wash-sale detection, best-effort)**
   - Equity/ETF: buys and sells with trade date, quantity, price, fees.
   - Corporate actions (splits, mergers) if available.
   - Transfers in/out; cost basis adjustments if provided.
   - Dividends/interest are not needed for TLH, but may affect basis in some systems; treat as out-of-scope unless your existing model encodes them.

4. **Asset master + normalization**
   - Canonical `asset_id` and symbol history.
   - Optional: asset type (stock/ETF/mutual fund/crypto), exchange, currency.
   - Optional: “substantially identical” group id (best-effort heuristic; see wash-sale section).

5. **User configuration & annotations**
   - TLH settings per user (and optionally per account):
     - `min_unrealized_loss_amount` (e.g., $500)
     - `min_unrealized_loss_pct` (e.g., 5%)
     - `max_position_value` filter (optional)
     - Include/exclude asset types (e.g., exclude mutual funds)
     - Sorting preference.
   - Notes on opportunities:
     - attach to `(user_id, account_id, asset_id, lot_id?)` with optional `as_of_date`.

### Data model sketch (conceptual)
- `accounts(id, user_id, name, broker, currency, created_at, ...)`
- `assets(id, symbol, name, type, currency, primary_identifier, ...)`
- `positions(id, account_id, asset_id, quantity, as_of, price, market_value, ...)` (optional if derived)
- `lots(id, account_id, asset_id, acquired_at, quantity_remaining, cost_basis_total, is_estimate, source, ...)`
- `transactions(id, account_id, asset_id, type, trade_date, settle_date, quantity, price, fees, external_id, ...)`
- `tsh_settings(user_id, jsonb_settings, updated_at)` (or normalized columns)
- `tsh_notes(id, user_id, account_id, asset_id, lot_id nullable, note, pinned bool, created_at, updated_at)`
- Optional computed cache table/materialized view:
  - `tsh_opportunities_cache(user_id, as_of, settings_hash, payload_json, computed_at, expires_at)`

### Access control / tenancy
- All reads/writes must be scoped by `user_id` (and account ownership).
- Exports (CSV/PDF) must be generated for the authenticated user only; store artifacts with user scoping and short retention.

### Observability
- Log computation duration, number of accounts/assets/lots evaluated.
- Log “degraded mode” counts (avg cost estimates, missing transactions).
- Track cache hit rate.

---

## Computation approach (loss calc, ST/LT, wash-sale risk best-effort)

### As-of date
- Default `as_of = now()` (or latest market data timestamp). Allow overriding with a date parameter for historical snapshots if the system supports historical prices.

### Unrealized loss calculation
Compute at the **lot level** when possible.

For each lot `L`:
- `current_price` = latest price for asset (as_of)
- `proceeds_estimate = L.quantity_remaining * current_price`
- `cost_basis = L.cost_basis_total` (for remaining shares)
- `unrealized_pl = proceeds_estimate - cost_basis`
- `unrealized_loss_amount = max(0, -unrealized_pl)`
- `unrealized_loss_pct = unrealized_loss_amount / max(cost_basis, epsilon)`

Aggregate views:
- **By asset/account**: sum of lots (loss and gain) but TLH “opportunity” should typically focus on **loss lots** only.
- Provide both:
  - `loss_lots`: count and total loss
  - `net_unrealized_pl`: for context

Filtering by user thresholds:
- Candidate lot if:
  - `unrealized_loss_amount >= min_loss_amount` AND/OR `unrealized_loss_pct >= min_loss_pct`
  - Additional optional filters (asset types, min holding period, etc.)

Fallback without lots:
- Use position-level average cost basis and treat as a single synthetic lot with `acquired_at = null`, `is_estimate = true`.
- ST/LT classification becomes `unknown`.

### ST/LT classification estimate
For each lot with `acquired_at`:
- Determine holding period between `acquired_at` and `as_of`.
- Classification:
  - ST if holding period < 365 days (or <= 1 year depending on your jurisdictional rule; choose one and document).
  - LT otherwise.

Notes:
- Use trade date vs settlement date consistently. If only one exists, use it.
- If partial lot has been sold, classification applies to remaining shares same as lot’s acquisition.

Output fields per lot:
- `term`: `short_term | long_term | unknown`
- `days_held`
- `acquired_at`

### Wash-sale risk (best-effort)
Wash-sale rules are complex and jurisdiction-dependent. Backend should implement a **conservative risk flag**:

**Goal:** Flag situations where selling a loss lot *may* be disallowed because of purchases of the same/substantially identical security within the wash window.

Define wash window:
- Standard US heuristic: **30 days before to 30 days after** a hypothetical sale date.
- For a dashboard, assume sale date = `as_of` (or the user-provided sale date if you support).

Inputs needed:
- Loss lots candidates.
- Transaction history for purchases (and optionally dividend reinvestments) around window.

Best-effort algorithm (per candidate asset/lot):
1. Compute `window_start = sale_date - 30d`, `window_end = sale_date + 30d`.
2. Identify **buy transactions** in `[window_start, window_end]` for:
   - Same `asset_id`, and optionally
   - Same “substantially identical group” if available.
3. If any buys exist:
   - Set `wash_sale_risk = true`.
   - Provide `risk_reasons` with counts and dates of buys.
4. If you have cross-account visibility for the same user:
   - Include buys in other accounts (taxable + IRA/401k if tracked). Mark separately because IRA wash sale treatment differs; still flag as risk.
5. If transaction history is incomplete/missing:
   - Set `wash_sale_risk = unknown` and include `data_gaps` indicator.

Substantially identical heuristic (optional, best-effort):
- Maintain `assets.substantially_identical_group_id` (manual/curated), OR
- Use a ruleset:
  - same issuer + same class (hard),
  - ETFs tracking same index (requires metadata),
  - do **not** attempt fuzzy matching without reliable metadata.

Limitations (must be explicit in payload):
- Cannot fully determine wash sale without complete transaction coverage, corporate actions, and accurate lot accounting.
- The “after sale” window cannot be known on a static dashboard; only *potential risk* based on scheduled/recurring buys (if modeled) or recent automatic buys.

Output fields:
- `wash_sale_risk`: `none | possible | unknown`
- `wash_sale_window_start/end`
- `wash_sale_related_buys`: summary list (date, qty, account_id, asset_id)
- `wash_sale_basis_adjustment_estimate`: not computed (unless you have full lot-level matching; likely out-of-scope)

---

## API surfaces (if any) and caching

### Read API (dashboard)
A single endpoint can serve the dashboard with server-side computation.

- `GET /api/tlh/opportunities?as_of=YYYY-MM-DD&account_id=...&sort=...`
  - Auth required.
  - Returns computed opportunities grouped by account/asset, with per-lot rows.

Response shape (example fields):
- `as_of`, `currency`
- `settings_applied` (echo)
- `opportunities[]` each with:
  - `account_id`, `account_name`
  - `asset_id`, `symbol`, `asset_name`, `asset_type`
  - `position_qty`, `market_value`
  - `loss_total`, `loss_lot_count`
  - `wash_sale_risk` (aggregate)
  - `lots[]`: per-lot loss details + ST/LT + wash info
  - `data_quality`: { `has_lots`, `has_txns`, `price_as_of` }

### Write APIs (settings + notes)
- `PUT /api/tlh/settings` (idempotent)
  - Save thresholds and filters.
- `POST /api/tlh/notes` / `PUT /api/tlh/notes/:id` / `DELETE /api/tlh/notes/:id`
  - Notes scoped to user.

### Export APIs
Prefer asynchronous export if dataset can be large.

Option A (simple):
- `GET /api/tlh/opportunities.csv?as_of=...` returns CSV stream.
- `GET /api/tlh/opportunities.pdf?as_of=...` returns PDF.

Option B (robust async):
- `POST /api/tlh/exports` with `{format: csv|pdf, as_of, filters}` → returns `export_id`
- `GET /api/tlh/exports/:export_id` → status + download URL
- Store export artifact in object storage with short TTL (e.g., 24h).

### Caching strategy
Computation may be moderately heavy (lots + txns).

Cache key:
- `(user_id, as_of_date (or price timestamp bucket), settings_hash, account_filter_hash)`

Cache layers:
1. **In-memory** (per instance) for short TTL (e.g., 30–120s) to speed repeated UI refresh.
2. **Shared cache / DB cache table** with TTL (e.g., 5–15 min) if multiple instances.

Invalidation triggers:
- New transactions imported/created for user.
- Updated lots/cost basis.
- Updated price snapshot.
- Settings changed.

If you already have a background pricing pipeline, consider caching per asset price and reusing.

---

## Risks / edge cases

1. **Missing/incorrect lot data**
   - Many brokers provide lots; some imports do not. Average cost fallback can misclassify ST/LT and misstate harvestable loss.
   - Mitigation: `is_estimate` flags; `data_quality` section; allow filtering to “only show when lots available”.

2. **Corporate actions and basis adjustments**
   - Splits/mergers/spinoffs can distort basis if not applied.
   - Mitigation: rely on broker-provided adjusted lots when possible; otherwise mark risk/unknown.

3. **Multi-currency assets/accounts**
   - Unrealized P/L depends on FX rates at purchase and as-of.
   - Mitigation: if system is single-currency only, explicitly restrict. If multi-currency, require FX rate history or at least as-of conversions; otherwise mark estimates.

4. **Wash sale complexity**
   - Requires full trade history and matching replacement shares, includes IRAs, spouse accounts, options, DRIPs.
   - Mitigation: implement only “possible/unknown” risk flag with clear data gap reporting; do not compute disallowed loss amounts unless confident.

5. **Partial lot sales and lot selection**
   - Actual realized loss depends on which lots are sold (FIFO/LIFO/specific ID).
   - Mitigation: dashboard is “opportunities” on current loss lots; do not assume user’s broker will sell specific lots unless supported.

6. **Stale prices / market hours**
   - As-of price timestamps matter; outside market hours prices may be stale.
   - Mitigation: include price timestamp; optionally allow selecting previous close.

7. **Performance**
   - Users with long histories may have many transactions.
   - Mitigation: pre-index transactions by `(user_id, account_id, asset_id, trade_date)`; restrict wash-sale scan to relevant assets only; cache results.

8. **Privacy/security**
   - Export artifacts may leak data if URLs are guessable.
   - Mitigation: signed URLs + TTL; enforce auth on download; avoid embedding account numbers.

---

## Acceptance criteria (backend)

1. **Opportunities computation**
   - Given accounts with lots and current prices, the backend returns per-lot unrealized loss amounts and percentages.
   - Results can be grouped by account/asset and include totals.
   - Filters by user thresholds (amount and/or percent) are applied deterministically.

2. **ST/LT estimation**
   - For lots with `acquired_at`, backend labels `short_term` vs `long_term` based on days held at `as_of`.
   - For missing `acquired_at`, backend returns `unknown` and marks row as estimated.

3. **Wash-sale risk flag (best-effort)**
   - For a candidate loss lot, if any buy transaction of the same asset (and/or same group when configured) exists within ±30 days of `sale_date`, backend returns `wash_sale_risk=possible` and includes a summary of the triggering buys.
   - If transaction history is missing/incomplete for the window, backend returns `wash_sale_risk=unknown` and includes `data_gaps`.

4. **Settings & notes persistence**
   - Backend exposes endpoints to save/retrieve user TLH settings.
   - Backend supports CRUD for per-opportunity notes, scoped to the authenticated user.

5. **Export**
   - Backend can generate a CSV export for the same computed dataset as the dashboard (same filters/as_of), with stable columns.
   - If PDF export is implemented, it is generated successfully for the same dataset (sync or async), and downloads are access-controlled.

6. **Caching & correctness**
   - Repeated requests with identical `user_id`, `as_of`, and settings hit cache (measurable via logs/metrics).
   - Cache invalidates (or expires) on new transactions/lots/prices or settings changes.

7. **Security**
   - All endpoints enforce authorization and only return data belonging to the requesting user.
   - Export artifacts (if stored) are private, time-limited, and cannot be accessed by other users.
