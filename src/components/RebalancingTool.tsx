import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Target, DollarSign, Percent } from 'lucide-react';
import { useInvestmentContext } from '../contexts/InvestmentContext';
import { RebalancingService } from '../services/rebalancingService';
import { InvestmentType, RebalancingSuggestion } from '../types/investment';
import { useLanguage } from '../contexts/LanguageContext';
import { useCurrency } from '../contexts/CurrencyContext';

const rebalancingService = new RebalancingService();

const INVESTMENT_TYPES: InvestmentType[] = ['crypto', 'stock', 'bond', 'etf', 'commodity', 'cash', 'other'];

export function RebalancingTool() {
    const { investments, targetAllocations, updateTargetAllocation, calculatePortfolioSummary } = useInvestmentContext();
    const { t } = useLanguage();
    const { formatCurrency } = useCurrency();
    const [suggestions, setSuggestions] = useState<RebalancingSuggestion[]>([]);

    const summary = calculatePortfolioSummary();

    const handleTargetChange = (type: InvestmentType, value: string) => {
        const percentage = parseFloat(value) || 0;
        updateTargetAllocation(type, percentage);
    };

    const calculateRebalancing = () => {
        const result = rebalancingService.calculateRebalancing(investments, summary, targetAllocations);
        setSuggestions(result);
    };

    const getTargetPercentage = (type: InvestmentType): number => {
        const target = targetAllocations.find(t => t.type === type);
        return target?.targetPercentage || 0;
    };

    const getCurrentPercentage = (type: InvestmentType): number => {
        const currentValue = summary.investmentsByType[type] || 0;
        return summary.totalValue > 0 ? (currentValue / summary.totalValue) * 100 : 0;
    };

    const totalTargetPercentage = targetAllocations.reduce((sum, t) => sum + t.targetPercentage, 0);
    const isValidTarget = Math.abs(totalTargetPercentage - 100) < 0.01;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="brand-card p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                        <h2 className="brand-heading-lg">Portfolio Rebalancing</h2>
                        <p className="brand-subtext">Set target allocations and get rebalancing suggestions</p>
                    </div>
                </div>

                {/* Portfolio Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <p className="brand-subtext-sm">Total Value</p>
                        <p className="brand-heading-md">{formatCurrency(summary.totalValue)}</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <p className="brand-subtext-sm">Total Invested</p>
                        <p className="brand-heading-md">{formatCurrency(summary.totalInvested)}</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <p className="brand-subtext-sm">Gain/Loss</p>
                        <p className={`brand-heading-md ${summary.totalGainLoss >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {formatCurrency(summary.totalGainLoss)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Target Allocations Input */}
            <div className="brand-card p-6">
                <h3 className="brand-heading-md mb-4">Set Target Allocations</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {INVESTMENT_TYPES.map(type => (
                        <div key={type} className="space-y-2">
                            <label className="brand-label capitalize">{type}</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    value={getTargetPercentage(type)}
                                    onChange={(e) => handleTargetChange(type, e.target.value)}
                                    className="brand-input flex-1"
                                    placeholder="0"
                                />
                                <Percent className="h-4 w-4 text-gray-400" />
                            </div>
                            <p className="brand-subtext-xs">
                                Current: {getCurrentPercentage(type).toFixed(2)}%
                            </p>
                        </div>
                    ))}
                </div>

                {/* Total Validation */}
                <div className="mt-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex items-center justify-between">
                        <span className="brand-label">Total Target Allocation:</span>
                        <span className={`brand-heading-md ${isValidTarget ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {totalTargetPercentage.toFixed(2)}%
                        </span>
                    </div>
                    {!isValidTarget && (
                        <p className="brand-subtext-xs text-red-600 dark:text-red-400 mt-2">
                            Target allocations must sum to 100%
                        </p>
                    )}
                </div>

                <button
                    onClick={calculateRebalancing}
                    disabled={!isValidTarget || investments.length === 0}
                    className="brand-button-primary w-full mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Calculate Rebalancing
                </button>
            </div>

            {/* Rebalancing Suggestions */}
            {suggestions.length > 0 && (
                <div className="brand-card p-6">
                    <h3 className="brand-heading-md mb-4">Rebalancing Suggestions</h3>
                    <div className="space-y-3">
                        {suggestions.map((suggestion) => (
                            <div
                                key={suggestion.type}
                                className="p-4 rounded-lg border border-gray-200 dark:border-gray-700"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h4 className="brand-heading-sm capitalize">{suggestion.type}</h4>
                                            {suggestion.action === 'buy' && (
                                                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                                            )}
                                            {suggestion.action === 'sell' && (
                                                <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                                            )}
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div>
                                                <span className="brand-subtext-xs">Current:</span>
                                                <span className="ml-1 font-medium">{suggestion.currentPercentage.toFixed(2)}%</span>
                                            </div>
                                            <div>
                                                <span className="brand-subtext-xs">Target:</span>
                                                <span className="ml-1 font-medium">{suggestion.targetPercentage.toFixed(2)}%</span>
                                            </div>
                                        </div>
                                        <p className="brand-subtext-xs mt-2">{suggestion.reason}</p>
                                    </div>
                                    <div className="text-right ml-4">
                                        <div className={`text-lg font-semibold ${suggestion.action === 'buy' ? 'text-green-600 dark:text-green-400' :
                                                suggestion.action === 'sell' ? 'text-red-600 dark:text-red-400' :
                                                    'text-gray-600 dark:text-gray-400'
                                            }`}>
                                            {suggestion.action === 'hold' ? 'Hold' : formatCurrency(suggestion.amount)}
                                        </div>
                                        <div className="brand-subtext-xs capitalize">{suggestion.action}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {suggestions.length === 0 && investments.length === 0 && (
                <div className="brand-card p-12 text-center">
                    <DollarSign className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="brand-heading-sm mb-2">No Investments Yet</h3>
                    <p className="brand-subtext">Add investments to your portfolio to use the rebalancing tool</p>
                </div>
            )}
        </div>
    );
}
