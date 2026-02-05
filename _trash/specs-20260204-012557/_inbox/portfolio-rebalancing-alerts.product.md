Title: Portfolio Rebalancing Alerts
Slug: portfolio-rebalancing-alerts

## Overview

**Problem:** Investors often let their portfolio drift from their target asset allocation due to market movements. Over time, this can lead to unintended risk exposure or missed opportunities for buying low/selling high. Users lack visibility into when their portfolio has materially drifted from their targets.

**Proposed Solution:** An automated rebalancing alert system that monitors portfolio drift against user-defined target allocations and sends timely notifications when thresholds are breached. Users can view drift percentages, set custom thresholds per asset class, and act on actionable recommendations.

**Why Now:** As portfolios grow more complex with multiple accounts and asset classes, manual tracking becomes error-prone. Proactive rebalancing helps users maintain discipline, reduce emotional decision-making, and optimize long-term returns.

## User stories

- As an investor, I want to set target allocations for each asset class in my portfolio so that I can maintain my desired risk profile.
- As an investor, I want to receive an alert when my actual allocation drifts more than X% from my target so that I can rebalance before exposure becomes excessive.
- As an investor, I want to see a visual representation of my current vs. target allocation so that I can quickly understand where drift has occurred.
- As an investor, I want to customize drift thresholds per asset class (e.g., bonds 5%, stocks 10%) so that alerts match my investment strategy.
- As an investor, I want to snooze or dismiss specific alerts so that I'm not overwhelmed by notifications during market volatility.
- As an investor, I want to see recommended rebalancing actions (buy/sell amounts) so that I can restore my target allocation efficiently.

## UX notes

- **Allocation Setup Screen:** Simple sliders or input fields for setting target percentages per asset class; real-time validation that totals sum to 100%.
- **Drift Visualization:** Horizontal bar charts showing target vs. actual with color coding (green = within tolerance, yellow = approaching threshold, red = threshold breached).
- **Alert Card:** Shows asset class, current %, target %, drift amount, and "View Recommendation" CTA.
- **Settings Panel:** Toggle alerts on/off, set global default threshold, configure per-asset thresholds, choose notification channels (in-app, email, push).
- **Quiet Hours:** Option to batch alerts and receive a daily digest instead of individual notifications.

## Acceptance criteria

1. User can define target allocations per asset class with validation that sum equals 100%.
2. System calculates real-time drift between actual portfolio holdings and target allocations.
3. User can configure a default drift threshold (e.g., 5%) and override per asset class.
4. Alert is triggered when any asset class exceeds its configured drift threshold.
5. Alert contains: asset class name, target %, actual %, drift %, and rebalancing recommendation.
6. User can view all current drift statuses in a dashboard view.
7. User can mark alerts as acknowledged/snoozed without deleting the underlying condition.
8. Alerts respect user notification preferences (in-app, email, push, or digest mode).
9. Historical drift data is retained for 90 days for trend analysis.
10. Feature gracefully handles incomplete data (e.g., missing asset classifications) with clear messaging.

## Open questions

1. Should we support automatic rebalancing calculation across multiple accounts (tax-efficient harvesting) or keep it simple (per-account)?
2. How should we handle cash positions—treat as separate asset class or ignore?
3. Should we provide a "one-click rebalance" feature that generates a trade list, or keep recommendations view-only?
4. What's the policy on alerting during market hours vs. after-hours (e.g., only alert on end-of-day drift)?
5. Should we integrate with brokerage APIs for direct trade execution, or stop at recommendations?
