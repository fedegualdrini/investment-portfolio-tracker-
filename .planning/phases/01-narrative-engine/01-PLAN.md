# Phase 1 Plan: Narrative Engine

**Phase:** 01 - The Narrative Engine  
**Branch:** v2-narrative-engine  
**Created:** 2026-02-05

---

## Goal

Build a system that generates weekly portfolio observation narratives using local data analysis and template-based rendering.

**must_haves for this phase:**
- [ ] Portfolio analyzer calculates metrics locally (performance, allocation, trends)
- [ ] Narrative template system generates human-readable stories
- [ ] Weekly Pulse UI displays narratives with proper disclaimers
- [ ] All language is observational only (educational, not advisory)
- [ ] "Not Financial Advice" disclaimer visible on every pulse

---

## Wave 1: Portfolio Analysis Engine

### Plan 01.01: Create Portfolio Analyzer Module
---
wave: 1
depends_on: []
files_modified:
  - src/lib/analyzer/portfolioAnalyzer.ts
  - src/lib/analyzer/types.ts
  - tests/analyzer/portfolioAnalyzer.test.ts
autonomous: false
---

**Objective:** Create reusable functions to analyze portfolio data locally.

**Tasks:**
1. Create `src/lib/analyzer/types.ts` with analysis result types:
   - `PortfolioMetrics` (totalValue, totalInvested, gainLoss, gainLossPercent)
   - `AllocationBreakdown` (byAssetType, byHolding)
   - `TrendData` (bestPerformer, worstPerformer, milestones)

2. Create `src/lib/analyzer/portfolioAnalyzer.ts` with functions:
   - `calculatePerformance(portfolio, period)` - Calculate value changes over time
   - `calculateAllocation(portfolio)` - Break down by asset type and holding
   - `detectTrends(portfolio, historicalData)` - Find top movers, new highs
   - `detectMilestones(portfolio, previousValue)` - Check if thresholds crossed

3. Create tests for all analyzer functions with mock data

**Verification:**
- Tests pass for all calculation functions
- Functions handle edge cases (empty portfolio, single holding, zero values)
- Performance: calculations complete in < 50ms on test data

---

## Wave 2: Narrative Template System

### Plan 01.02: Create Narrative Template Engine
---
wave: 2
depends_on: ["01.01"]
files_modified:
  - src/lib/narrative/templateEngine.ts
  - src/lib/narrative/templates.json
  - src/lib/narrative/types.ts
  - tests/narrative/templateEngine.test.ts
autonomous: false
---

**Objective:** Build template-based narrative generation system.

**Tasks:**
1. Create `src/lib/narrative/types.ts`:
   - `Template` type with category, templates[], placeholders[]
   - `NarrativeSection` type with heading and body

2. Create `src/lib/narrative/templates.json` with templates:
   - Category: "performance" (5-7 templates)
   - Category: "allocation" (3-5 templates)
   - Category: "topMover" (4-5 templates)
   - Category: "milestone" (5-7 templates)
   - Category: "educationalContext" (3-5 templates)

3. Create `src/lib/narrative/templateEngine.ts`:
   - `loadTemplates()` - Read templates from JSON
   - `selectTemplate(category, data)` - Choose appropriate template
   - `renderTemplate(template, values)` - Replace placeholders with data
   - `generateNarrative(analysis)` - Assemble full narrative from sections

4. Create tests for template engine

**Verification:**
- Templates render correctly with test data
- No prohibited language in templates (audit checklist)
- Variety: Running 10 times produces different template selections

---

## Wave 3: Weekly Pulse UI

### Plan 01.03: Create Weekly Pulse Component
---
wave: 3
depends_on: ["01.02"]
files_modified:
  - src/components/WeeklyPulse.tsx
  - src/components/WeeklyPulse.css
  - src/components/PulseHistory.tsx
  - src/hooks/useWeeklyPulse.ts
autonomous: false
---

**Objective:** Build UI components for displaying portfolio narratives.

**Tasks:**
1. Create `src/components/WeeklyPulse.tsx`:
   - Card layout with header ("Portfolio Pulse - [Date]")
   - Narrative text sections
   - Key metrics highlights (total value, % change, allocation)
   - "Generate New Pulse" button (triggers manual analysis)
   - Loading state during generation
   - Disclaimer footer: "This is educational information only. Not financial advice."

2. Create `src/components/WeeklyPulse.css`:
   - Dark theme consistent with app
   - Typography for readable narratives
   - Visual hierarchy for sections
   - Responsive design

3. Create `src/components/PulseHistory.tsx`:
   - List of past pulses
   - Date-based filtering
   - Expand/collapse details

4. Create `src/hooks/useWeeklyPulse.ts`:
   - `generatePulse()` - Trigger analysis and narrative generation
   - `getPulseHistory()` - Retrieve saved narratives
   - `savePulse(narrative)` - Persist to localStorage
   - State management for loading/error states

**Verification:**
- WeeklyPulse renders with sample data
- Generate button triggers full flow end-to-end
- History displays previously saved pulses
- Disclaimer visible on every pulse view

---

## Wave 4: Integration & Navigation

### Plan 01.04: Integrate into Main App
---
wave: 4
depends_on: ["01.03"]
files_modified:
  - src/App.tsx (or routing config)
  - src/components/Navigation.tsx
  - src/pages/Dashboard.tsx (add Pulse card)
autonomous: false
---

**Objective:** Add Weekly Pulse to main navigation and dashboard.

**Tasks:**
1. Add navigation item: "Pulse" or "Insights"
   - Icon: pulse or chart icon
   - Route: /pulse or /insights

2. Add WeeklyPulse preview card to Dashboard:
   - Latest pulse summary
   - CTA to view full pulse
   - "Generate new pulse" shortcut

3. Ensure proper route handling and lazy loading

4. Test navigation flow end-to-end

**Verification:**
- Pulse page accessible via navigation
- Dashboard shows pulse preview
- Navigation persists active state correctly

---

## Wave 5: Legal Compliance & Polish

### Plan 01.05: Add Legal Disclaimers and Compliance
---
wave: 5
depends_on: ["01.04"]
files_modified:
  - src/components/Disclaimer.tsx
  - src/components/WeeklyPulse.tsx (update)
  - src/components/Footer.tsx (or add to layout)
  - src/lib/narrative/compliance.ts
autonomous: false
---

**Objective:** Ensure all legal requirements are met for educational tool.

**Tasks:**
1. Create `src/lib/narrative/compliance.ts`:
   - `validateNarrative(text)` - Check for prohibited language
   - `containsAdvice(text)` - Detect advisory patterns
   - List of flagged words/phrases to avoid

2. Create `src/components/Disclaimer.tsx`:
   - Reusable disclaimer component
   - "Not Financial Advice" text
   - Link to educational resources

3. Update WeeklyPulse with:
   - Disclaimer in footer of every pulse
   - Terms acceptance reminder for new features

4. Add app-wide footer disclaimer if not present

5. Create compliance audit checklist document

**Verification:**
- All pulses show disclaimer
- Narrative validation flags prohibited language in tests
- Compliance audit document reviewed

---

## Success Criteria Summary

| # | Criteria | How Verified |
|---|----------|--------------|
| 1 | Portfolio analysis works locally | Unit tests pass for analyzer functions |
| 2 | Templates generate varied narratives | 10 runs produce different outputs |
| 3 | No prohibited advisory language | Compliance validation in tests |
| 4 | Weekly Pulse UI functional | Manual testing of generate/view flows |
| 5 | Disclaimer visible everywhere | Visual inspection of all screens |
| 6 | Navigation integrated | End-to-end navigation test |

---

## Next Phase Preview

**Phase 2:** News & Context Engine
- Add news aggregation for user holdings
- Build educational content library
- Historical scenario viewer

---

*Ready for execution - Run `/gsd:execute-phase 01` to start*
