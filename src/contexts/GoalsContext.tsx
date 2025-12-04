import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { Goal, GoalProgress } from '../types/goals';
import { useInvestmentContext } from './InvestmentContext';

const STORAGE_KEY = 'financial-goals';

interface GoalsContextType {
    goals: Goal[];
    addGoal: (goal: Omit<Goal, 'id' | 'createdAt'>) => void;
    updateGoal: (id: string, updates: Partial<Goal>) => void;
    removeGoal: (id: string) => void;
    calculateGoalProgress: (goal: Goal) => GoalProgress;
}

const GoalsContext = createContext<GoalsContextType | undefined>(undefined);

export function GoalsProvider({ children }: { children: ReactNode }) {
    const [goals, setGoals] = useState<Goal[]>([]);
    const { investments, calculatePortfolioSummary } = useInvestmentContext();

    // Load goals from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const parsedGoals = JSON.parse(stored);
                setGoals(parsedGoals);
            } catch (error) {
                console.error('Error parsing stored goals:', error);
            }
        }
    }, []);

    // Save to localStorage whenever goals change
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
    }, [goals]);

    const addGoal = useCallback((goal: Omit<Goal, 'id' | 'createdAt'>) => {
        const newGoal: Goal = {
            ...goal,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
        };
        setGoals(prev => [...prev, newGoal]);
    }, []);

    const updateGoal = useCallback((id: string, updates: Partial<Goal>) => {
        setGoals(prev =>
            prev.map(goal =>
                goal.id === id ? { ...goal, ...updates } : goal
            )
        );
    }, []);

    const removeGoal = useCallback((id: string) => {
        setGoals(prev => prev.filter(goal => goal.id !== id));
    }, []);

    const calculateGoalProgress = useCallback((goal: Goal): GoalProgress => {
        let currentValue = 0;

        if (goal.type === 'manual') {
            currentValue = goal.currentAmount || 0;
        } else if (goal.type === 'total_portfolio') {
            const summary = calculatePortfolioSummary();
            currentValue = summary.totalValue;
        } else if (goal.type === 'specific_assets' && goal.linkedAssets) {
            currentValue = investments
                .filter(inv => goal.linkedAssets?.includes(inv.id))
                .reduce((sum, inv) => sum + ((inv.currentPrice || inv.purchasePrice) * inv.quantity), 0);
        }

        const percentage = Math.min(100, Math.max(0, (currentValue / goal.targetAmount) * 100));
        const remainingAmount = Math.max(0, goal.targetAmount - currentValue);
        const isCompleted = currentValue >= goal.targetAmount;

        // Simple projection: Linear extrapolation based on current value and creation date?
        // Or maybe based on portfolio performance? For now, let's leave projection simple or null.
        // We can enhance this later with historical data if available.

        return {
            currentValue,
            percentage,
            remainingAmount,
            isCompleted,
        };
    }, [investments, calculatePortfolioSummary]);

    const value: GoalsContextType = {
        goals,
        addGoal,
        updateGoal,
        removeGoal,
        calculateGoalProgress,
    };

    return (
        <GoalsContext.Provider value={value}>
            {children}
        </GoalsContext.Provider>
    );
}

export function useGoals() {
    const context = useContext(GoalsContext);
    if (context === undefined) {
        throw new Error('useGoals must be used within a GoalsProvider');
    }
    return context;
}
