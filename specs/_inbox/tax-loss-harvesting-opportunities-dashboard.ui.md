# Tax-loss harvesting opportunities dashboard — UI implementation plan

> Note: This UI plan is written **without reading the product/backend spec files** (tooling constraint: one tool call). It is therefore framework-agnostic and uses explicit integration placeholders (endpoint names/fields) that should be aligned to the backend contract during implementation.

## Routes / navigation

### Primary route
- **Route:** `/tax-loss-harvesting` (or `/dashboard/tax-loss-harvesting` if dashboards are namespaced)
- **Page title:** “Tax-loss harvesting opportunities”
- **Breadcrumbs (if applicable):** `Dashboard → Tax-loss harvesting`

### Entry points
- Left nav / main nav item: “Tax-loss harvesting”
- Optional contextual entry:
  - From “Holdings” table row action: “View TLH opportunities” (pre-filters by symbol/account)
  - From “Realized gains” or “Transactions”: “Find losses to harvest” (pre-filters by tax year)

### URL state (shareable)
Persist key state in query params so links can be shared/bookmarked:
- `taxYear=YYYY`
- `accounts=a1,a2` (multi)
- `assetClass=equity|etf|mutual_fund|crypto|...`
- `minLoss=number` (currency)
- `minLossPct=number`
- `washWindow=on|off` (or `washSaleRisk=none|low|high`)
- `sort=field:dir`
- `page=1&perPage=25`
- `q=search`

### Navigation and deep links
- Row click navigates to an “Opportunity detail” drawer (preferred) or detail route:
  - Drawer: `?opportunityId=...`
  - Route: `/tax-loss-harvesting/opportunities/:id`
- “Back” behavior should restore previous filters/pagination via URL.

## Components & state

### Page layout
1. **Header bar**
   - Title + short helper text
   - Tax year picker
   - Primary actions: `Export`, `Refresh`
2. **Summary strip / KPIs**
   - Tiles: total opportunities, total unrealized loss, estimated tax benefit (if provided), number flagged wash-sale risk
3. **Filters panel** (collapsible)
4. **Opportunities table**
5. **Detail drawer** (row-driven)

### Component breakdown
- `TaxLossHarvestingDashboardPage`
  - owns route/queryparam sync, data fetching orchestration
- `TLHSummaryTiles`
  - render aggregated stats (from same response or separate summary endpoint)
- `TLHFiltersBar`
  - search input
  - filter chips (active filters summary)
  - “Clear all”
- `TLHFiltersPanel`
  - advanced filters (accounts, asset class, date ranges, thresholds)
- `TLHOpportunitiesTable`
  - virtualization optional if large datasets
  - column visibility menu optional
- `TLHOpportunityDrawer`
  - expanded info, rationale, wash-sale warnings, suggested actions
- `TLHExportDialog`
  - choose format (CSV/XLSX/PDF if supported), scope (current filters vs all), columns
- `AsyncState` utilities
  - skeletons, empty states, error banners

### State model
- **Server state** (via a query library or custom hook):
  - `opportunitiesQuery(filters, sort, page)`
  - optional: `summaryQuery(filters)`
- **UI state:**
  - `filtersOpen` (boolean)
  - `selectedOpportunityId` (string | null)
  - `exportDialogOpen` (boolean)
  - `columnConfig` (local storage)

### Data contracts (placeholders)
Map these to backend spec:
- `Opportunity` fields (example):
  - `id`, `symbol`, `name`, `accountName`, `quantity`, `costBasis`, `marketValue`, `unrealizedLoss`, `unrealizedLossPct`, `holdingPeriod` (short/long), `asOfDate`
  - wash-sale related: `washSaleRisk` enum + `washSaleReason` text
  - optional: `replacementCandidates[]` or `suggestedReplacement` text
  - optional: `estimatedTaxBenefit`

### Loading / error / empty
- **Loading:**
  - header visible immediately
  - summary tiles skeleton
  - table skeleton with 10 rows
- **Error:**
  - inline banner at top of table: “Couldn’t load opportunities” + `Retry`
  - preserve previous data if available (stale-while-revalidate)
- **Empty:**
  - If no data overall: “No opportunities found” with suggestions: adjust filters, increase date range, lower minimum loss threshold.

## Table/filters UX

### Table columns (recommended)
Prioritize decision-making + compliance:
- Symbol / Name
- Account
- Unrealized loss (currency)
- Unrealized loss (%)
- Holding period (Short/Long)
- Quantity
- Cost basis / Market value (optional expandable)
- Wash-sale risk (badge)
- Last updated / As of
- Actions column: `Details`, `Add to export` (optional)

### Sorting
- Default sort: **largest unrealized loss** descending.
- Allow sort on:
  - unrealized loss (abs), loss %, holding period, symbol, wash-sale risk.
- Sorting must be reflected in query params.

### Pagination
- Server-side pagination recommended.
- `perPage` options: 25 / 50 / 100.
- Show total count if provided.

### Filters (progressive disclosure)
- **Always-visible (top bar):**
  - Search by symbol/name
  - Tax year selector
  - Accounts multiselect
  - Minimum loss ($)
  - Wash-sale risk (All / Exclude risky / Only risky)
- **Advanced (panel):**
  - Asset class / security type
  - Holding period (Short/Long)
  - Date range / as-of date (if backend supports)
  - Minimum loss (%)
  - “Exclude positions with recent buys within wash window” toggle
  - “Only show positions eligible to harvest” toggle (if backend returns eligibility)

### Filter chips
- Show active filters as chips under header.
- Each chip removable; “Clear all” resets to defaults.

### Row interactions
- Row click opens detail drawer.
- Keyboard: Enter/Space on focused row opens drawer.
- Detail drawer content:
  - Top: symbol/name, account
  - Key numbers: cost basis, market value, loss, holding period
  - Compliance block: wash-sale risk with explanation and “What triggers this?” link
  - If replacement suggestions exist: show list with disclaimers.

### Disclaimers / compliance
- Persistent disclaimer near header: “Not tax advice. Consider consult with a tax professional.”
- If wash-sale risk flagged, visually emphasize with warning color + tooltip.

## A11y + responsiveness

### Accessibility (WCAG-minded)
- Use semantic landmarks: `main`, `header`, `nav`.
- Table:
  - Use proper `<table>` semantics (or ARIA grid only if necessary).
  - Column headers with sort buttons (`aria-sort`).
  - Provide screen-reader text for badges (e.g., “Wash-sale risk: High”).
- Filters:
  - All form controls labeled with `<label>`.
  - Multiselects must support keyboard navigation and announce selections.
- Drawer/dialog:
  - Focus trap, escape to close, restore focus to invoking row.
  - Announce via `aria-labelledby` / `aria-describedby`.
- Color contrast:
  - Ensure loss values (often red) still meet contrast; don’t rely solely on color.
- Loading state:
  - Skeletons should not be read as content; use `aria-busy` on table region.

### Responsiveness
- Desktop:
  - Filters in a left panel or top collapsible panel.
  - Table with full columns.
- Tablet:
  - Collapse less-important columns behind “More” expander.
  - Filters open as overlay panel.
- Mobile:
  - Prefer **card list** rendering instead of wide table:
    - Each opportunity card shows: symbol, account, loss, wash-sale badge; tap for drawer.
  - Sticky actions: Export in overflow menu.

## Export UX

### Export entry points
- Header button: `Export`
- Optional: “Export current view” from table toolbar.

### Export dialog
- Options:
  - Format: CSV (default), XLSX (if supported)
  - Scope:
    - “Current filters (all pages)”
    - “Current page only”
    - Optional: “Selected rows only”
  - Columns checklist (persist preference)
  - Include disclaimers footer (if PDF) / notes column (if CSV)
- Confirm and start export.

### Progress + completion
- If synchronous download: trigger file download and toast “Export started”.
- If async job:
  - Show inline progress indicator and non-blocking toast.
  - Provide “Download” link when ready.
  - If backend exposes export history, show “Recent exports” section.

### Export naming
- Default filename: `tlf-opportunities-<taxYear>-<YYYY-MM-DD>.csv` (adapt to format).

## Acceptance criteria (UI)

1. **Route + deep link**
   - Navigating to the dashboard route renders header, filters, and opportunities list.
   - Filters/sort/pagination are reflected in the URL and restore correctly on reload.

2. **Data states**
   - Loading state displays skeletons and does not shift layout excessively.
   - Error state shows a recoverable message and retry action.
   - Empty state provides guidance and a clear “Clear filters” action.

3. **Filtering + sorting**
   - Users can filter by at least: tax year, accounts, minimum loss, search.
   - Sorting works on unrealized loss and is communicated in the UI.
   - Active filters are visible as chips and can be removed individually.

4. **Table/list usability**
   - Rows are clickable to open details.
   - Wash-sale risk is clearly indicated with badge + accessible text.
   - The UI supports pagination with configurable page size.

5. **Detail view**
   - Opening an opportunity shows key numbers and any compliance/wash-sale notes.
   - The drawer/dialog is keyboard accessible with focus management.

6. **Export**
   - Export dialog allows choosing format and scope.
   - Export uses current filters (unless user selects page-only).
   - Successful export triggers a download (or provides a ready-to-download link) and a confirmation toast.

7. **Accessibility + responsive**
   - All interactive elements are keyboard reachable with visible focus.
   - The page works on mobile: opportunities remain readable and actionable (table collapses to cards).
   - Contrast and non-color cues are used for risk and negative values.
