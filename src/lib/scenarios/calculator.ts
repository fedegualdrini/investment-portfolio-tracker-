import type { Investment } from '../../types/investment';
import type { ScenarioPeriod } from './data';

export interface ScenarioResult {
  scenario: ScenarioPeriod;
  note: string;
  // Placeholder fields for Phase 2 (real historical pricing can be added later)
  estimatedImpactText: string;
}

/**
 * Phase 2 minimal implementation:
 * We provide an educational viewer + placeholder explanation.
 * Real historical price simulation can be added in Phase 2 polish or Phase 3.
 */
export function calculateScenario(_investments: Investment[], scenario: ScenarioPeriod): ScenarioResult {
  return {
    scenario,
    note:
      'This is an educational preview. Historical price simulation for your exact holdings will be added next.',
    estimatedImpactText:
      `Scenario window: ${scenario.startDate} → ${scenario.endDate}. Use this to discuss how different asset classes can behave during stress.`,
  };
}
