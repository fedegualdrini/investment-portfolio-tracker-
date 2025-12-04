export interface Goal {
    id: string;
    name: string;
    targetAmount: number;
    targetDate: string; // ISO date string
    currentAmount?: number; // For manual tracking or override
    linkedAssets?: string[]; // IDs of investments to track
    type: 'total_portfolio' | 'specific_assets' | 'manual';
    createdAt: string;
}

export interface GoalProgress {
    currentValue: number;
    percentage: number;
    remainingAmount: number;
    isCompleted: boolean;
    projectedCompletionDate?: string;
}
