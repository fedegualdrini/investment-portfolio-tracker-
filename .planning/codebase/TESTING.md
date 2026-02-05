# TESTING

Date: 2026-02-05

This repository does not contain a conventional unit-test setup (no `*.test.*` / `*.spec.*` files detected in `src/`, and no `test` script in `package.json`). Testing that exists is primarily **Playwright-driven scripted verification** stored as ad-hoc `.mjs` runners plus captured evidence under `test-evidence/`.

## What test tooling exists

### Playwright

- Dependency present: `@playwright/test` (see `devDependencies` in `package.json`).
- No Playwright config detected:
  - No `playwright.config.ts` / `playwright.config.js` in repo root.
- Instead, repo contains Playwright runner scripts:
  - `playwright-final.mjs`
  - `playwright-repro.mjs`
  - `playwright-repro-v2.mjs`
  - `playwright-repro-v3.mjs`
  - `test-repro.mjs`
  - `test-repro2.mjs`

#### Pattern used by these scripts

From `playwright-final.mjs`:
- Imports Playwright from `@playwright/test`:
  - `import { chromium } from '@playwright/test';`
- Launches a headless browser and navigates to a local dev server:
  - `const BASE_URL = 'http://127.0.0.1:5173';`
- Uses **role-based locators** (good for resilience):
  - `page.getByRole('button', { name: /import/i }).click()`
- Captures:
  - console logs via `context.on('console', ...)`
  - network failures via `page.on('response', ...)` and `response.ok()`
  - screenshots via `page.screenshot({ fullPage: true })`
- Produces a structured JSON report:
  - Writes to `test-evidence/final-results.json` via `fs.writeFileSync(...)`.

#### Evidence artifacts

- Evidence directory: `test-evidence/`
  - Example outputs:
    - `test-evidence/results.json`
    - `test-evidence/final-results.json`
    - screenshots referenced in evidence JSON (e.g. `test-evidence/05-bonds.png` appears in `test-evidence/results.json`).

## How to run the existing Playwright scripts (current-state)

There is no single canonical command in `package.json`, so scripts are currently run manually.

Typical workflow implied by `playwright-final.mjs`:

1. Start the Vite dev server (uses explicit config path):
   - `npm run dev`
   - This runs `vite --config config/vite.config.ts` (see `package.json`).
2. Ensure any required local API/proxy services are running if needed:
   - `npm run dev:api` (runs `node run-api-local.mjs`)
   - Or `npm run dev:full` (runs both via `concurrently`).
3. Run the Playwright script:
   - `node playwright-final.mjs`

**Note:** `playwright-final.mjs` references an absolute JSON import path:
- `const JSON_PATH = '/home/ubuntu/.openclaw/media/inbound/file_11---4bf706c3-17c0-4a39-8bed-d2b1fdd907bd.json';`
This means the script is currently environment-specific and will fail if that file does not exist.

## What is being tested

From `playwright-final.mjs` and `test-evidence/results.json`, the scripted checks include:

- **Portfolio import flow**
  - Opens app at `http://127.0.0.1:5173`.
  - Clicks an Import button and uploads JSON.
  - Verifies import success by checking page content contains `BTC` and does not contain `No investments yet`.

- **Performance comparison benchmark selection**
  - Navigates via header buttons.
  - Interacts with a `select` element to choose a BTC/Bitcoin benchmark.
  - Captures screenshot (`test-evidence/btc-error.png` in `playwright-final.mjs`).

- **Bond analysis page i18n inspection**
  - Navigates to `http://127.0.0.1:5173/bond-analysis`.
  - Captures screenshot (`test-evidence/bond-analysis.png`).
  - Scrapes the page text and looks for untranslated dot-notation keys like `bond.analysis`.

## Current gaps (important for future test additions)

- No `npm test` script (see `package.json`).
- No unit-test runner configured (no Jest/Vitest config found; no `vitest.config.*` / `jest.config.*`).
- No colocated test files in `src/` detected.
- Existing Playwright checks are **not** integrated into CI via `package.json` scripts and are **not** organized using Playwright’s default `tests/` + `playwright.config.*` conventions.

## Conventions to follow when adding/expanding tests

To match existing patterns in this repo:

1. Prefer **Playwright role-based locators** for UI interactions.
   - Example: `page.getByRole('button', { name: /import/i })` in `playwright-final.mjs`.
2. Save artifacts under `test-evidence/`:
   - Screenshots and summary JSON results.
3. Capture console and network failures for debugging:
   - Console via `context.on('console', ...)`
   - Network via `page.on('response', ...)` and `!response.ok()`
4. If a script requires test data, avoid hard-coded absolute paths; prefer relative paths within repo (current scripts do use absolute paths).

