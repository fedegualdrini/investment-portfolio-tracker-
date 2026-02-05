Title: Dividend Reinforcement Planner
Slug: dividend-reinforcement-planner

## Overview

**Problem:** Investors who receive regular dividend payments often struggle with the decision of whether to cash out or reinvest. Many lack a systematic approach to optimizing their reinvestment strategy based on portfolio goals, tax implications, and market conditions. This leads to suboptimal compounding and missed opportunities for portfolio growth.

**Proposed solution:** A Dividend Reinforcement Planner that automatically analyzes incoming dividend payments and suggests optimal reinvestment strategies. The feature would evaluate factors like portfolio allocation drift, tax-loss harvesting opportunities, and user-defined goals to recommend whether to reinvest in the source asset, rebalance into underweight positions, or accumulate cash for future opportunities.

**Why now:** As interest rates normalize and dividend-paying stocks become more attractive, users need smarter tools to maximize the compounding effect of their income-generating holdings. This feature differentiates the platform from basic tracking tools by adding intelligent portfolio management capabilities.

## User stories

- As a dividend-focused investor, I want to see projected dividend income for the next 12 months so I can plan my cash flow and reinvestment strategy.
- As a long-term investor, I want automated suggestions on which holdings to reinvest dividends into based on my target allocation so I can maintain portfolio balance without manual analysis.
- As a tax-conscious investor, I want the system to highlight tax-loss harvesting opportunities when dividends are received so I can optimize my tax position before reinvesting.
- As a hands-off investor, I want the option to enable auto-reinvestment rules based on my preferences so I don't have to make decisions for every dividend payment.

## UX notes

- Display a "Dividend Dashboard" showing upcoming ex-dividend dates, projected income, and reinvestment suggestions
- Use clear visual indicators (green/yellow/red) to show confidence level of each reinvestment suggestion
- Provide a one-click "Execute Plan" button for users who want to act on recommendations
- Include a "What If" simulator to let users model different reinvestment scenarios before committing
- Show tax impact estimates directly in the recommendation cards
- Allow users to set reinvestment rules at the account, asset class, or individual holding level

## Acceptance criteria

- [ ] System correctly projects dividend dates and amounts based on historical data and announced distributions
- [ ] Reinvestment suggestions account for current allocation vs. target allocation across all asset classes
- [ ] Tax-loss harvesting opportunities are flagged when applicable with estimated tax savings
- [ ] Users can configure reinvestment rules (auto-reinvest, accumulate cash, manual decision)
- [ ] One-click execution generates a clear summary of trades before confirmation
- [ ] Historical dividend tracking shows actual vs. projected amounts with variance analysis
- [ ] Mobile-responsive interface for reviewing and acting on dividend alerts

## Open questions

1. Should we integrate with broker APIs to execute trades directly, or generate orders for manual entry?
2. How should we handle dividends from assets that are no longer part of the target allocation (e.g., legacy holdings the user wants to wind down)?
3. What's the priority ranking when multiple reinvestment goals conflict (allocation rebalancing vs. tax optimization vs. yield maximization)?
4. Should we support fractional share reinvestment modeling for brokers that don't offer it?
5. How do we handle international dividend taxation and currency conversion considerations?
