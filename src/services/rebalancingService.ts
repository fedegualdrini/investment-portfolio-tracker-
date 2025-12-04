import { Investment, InvestmentType, PortfolioSummary, TargetAllocation, RebalancingSuggestion } from '../types/investment';

export class RebalancingService {
    /**
     * Calculate rebalancing suggestions based on current portfolio and target allocations
     */
    calculateRebalancing(
        investments: Investment[],
        summary: PortfolioSummary,
        targetAllocations: TargetAllocation[]
    ): RebalancingSuggestion[] {
        if (!investments.length || !targetAllocations.length || summary.totalValue === 0) {
            return [];
        }

        const suggestions: RebalancingSuggestion[] = [];
        const currentAllocations = summary.investmentsByType;

        // Create a map of targets for easier lookup
        const targetMap = new Map(targetAllocations.map(t => [t.type, t.targetPercentage]));

        // Get all unique types from both current investments and targets
        const allTypes = new Set([
            ...Object.keys(currentAllocations) as InvestmentType[],
            ...targetAllocations.map(t => t.type)
        ]);

        allTypes.forEach(type => {
            const currentValue = currentAllocations[type] || 0;
            const currentPercentage = (currentValue / summary.totalValue) * 100;
            const targetPercentage = targetMap.get(type) || 0;

            // Skip if both current and target are 0
            if (currentPercentage === 0 && targetPercentage === 0) return;

            const difference = targetPercentage - currentPercentage;
            const amount = (Math.abs(difference) / 100) * summary.totalValue;

            let action: 'buy' | 'sell' | 'hold' = 'hold';
            let reason = '';

            // We use a small threshold to avoid suggesting negligible trades (e.g. < 0.1%)
            if (Math.abs(difference) < 0.1) {
                action = 'hold';
                reason = 'Allocation is within tolerance range';
            } else if (difference > 0) {
                action = 'buy';
                reason = `Allocation is ${Math.abs(difference).toFixed(2)}% below target`;
            } else {
                action = 'sell';
                reason = `Allocation is ${Math.abs(difference).toFixed(2)}% above target`;
            }

            suggestions.push({
                type,
                currentPercentage,
                targetPercentage,
                difference,
                action,
                amount,
                reason
            });
        });

        return suggestions.sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference));
    }
}
