import React, { useState } from 'react';
import { useGoals } from '../contexts/GoalsContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useInvestmentContext } from '../contexts/InvestmentContext';
import { Plus, Target, Trash2, TrendingUp, Calendar, DollarSign, ArrowLeft } from 'lucide-react';
import type { Goal } from '../types/goals';

interface GoalsPageProps {
    onBack: () => void;
}

export function GoalsPage({ onBack }: GoalsPageProps) {
    const { t, language } = useLanguage();
    const { goals, addGoal, removeGoal, calculateGoalProgress } = useGoals();
    const { investments } = useInvestmentContext();

    const [showAddForm, setShowAddForm] = useState(false);
    const [newGoal, setNewGoal] = useState<Partial<Goal>>({
        type: 'total_portfolio',
        targetAmount: 0,
        name: '',
        targetDate: '',
    });

    const handleAddGoal = (e: React.FormEvent) => {
        e.preventDefault();
        if (newGoal.name && newGoal.targetAmount && newGoal.targetDate) {
            addGoal({
                name: newGoal.name,
                targetAmount: Number(newGoal.targetAmount),
                targetDate: newGoal.targetDate,
                type: newGoal.type as any,
                linkedAssets: newGoal.linkedAssets || [],
                currentAmount: newGoal.currentAmount,
            });
            setShowAddForm(false);
            setNewGoal({
                type: 'total_portfolio',
                targetAmount: 0,
                name: '',
                targetDate: '',
            });
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat(language === 'es' ? 'es-ES' : 'en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                        aria-label={t('go.back')}
                    >
                        <ArrowLeft className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                            {t('goals.title')}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            {t('goals.subtitle')}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setShowAddForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                    <Plus className="h-5 w-5" />
                    {t('goals.add')}
                </button>
            </div>

            {showAddForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6 animate-fadeInUp">
                        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">{t('goals.add_new')}</h2>
                        <form onSubmit={handleAddGoal} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    {t('goals.name')}
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={newGoal.name}
                                    onChange={e => setNewGoal(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-purple-500 focus:border-purple-500"
                                    placeholder={t('goals.placeholder.name')}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    {t('goals.target_amount')}
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 dark:text-gray-400">$</span>
                                    </div>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={newGoal.targetAmount || ''}
                                        onChange={e => setNewGoal(prev => ({ ...prev, targetAmount: Number(e.target.value) }))}
                                        className="w-full pl-7 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-purple-500 focus:border-purple-500"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    {t('goals.target_date')}
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={newGoal.targetDate}
                                    onChange={e => setNewGoal(prev => ({ ...prev, targetDate: e.target.value }))}
                                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-purple-500 focus:border-purple-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    {t('goals.type')}
                                </label>
                                <select
                                    value={newGoal.type}
                                    onChange={e => setNewGoal(prev => ({ ...prev, type: e.target.value as any }))}
                                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-purple-500 focus:border-purple-500"
                                >
                                    <option value="total_portfolio">{t('goals.type.total_portfolio')}</option>
                                    <option value="manual">{t('goals.type.manual')}</option>
                                    {/* Future: specific_assets */}
                                </select>
                            </div>

                            {newGoal.type === 'manual' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        {t('goals.current_amount')}
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-gray-500 dark:text-gray-400">$</span>
                                        </div>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            value={newGoal.currentAmount || ''}
                                            onChange={e => setNewGoal(prev => ({ ...prev, currentAmount: Number(e.target.value) }))}
                                            className="w-full pl-7 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-purple-500 focus:border-purple-500"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowAddForm(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    {t('cancel')}
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                >
                                    {t('save')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {goals.map(goal => {
                    const progress = calculateGoalProgress(goal);
                    return (
                        <div key={goal.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-all hover:shadow-md">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{goal.name}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                                        <Calendar className="h-3 w-3" />
                                        {formatDate(goal.targetDate)}
                                    </p>
                                </div>
                                <button
                                    onClick={() => removeGoal(goal.id)}
                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                    aria-label={t('delete')}
                                >
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-600 dark:text-gray-300">{t('goals.progress')}</span>
                                        <span className="font-medium text-gray-900 dark:text-white">{progress.percentage.toFixed(1)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                                        <div
                                            className="bg-purple-600 h-2.5 rounded-full transition-all duration-500"
                                            style={{ width: `${progress.percentage}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-2">
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{t('goals.current')}</p>
                                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {formatCurrency(progress.currentValue)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{t('goals.target')}</p>
                                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {formatCurrency(goal.targetAmount)}
                                        </p>
                                    </div>
                                </div>

                                {progress.remainingAmount > 0 && (
                                    <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                                        <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1">
                                            <TrendingUp className="h-4 w-4 text-green-500" />
                                            <span>{t('goals.remaining')}: </span>
                                            <span className="font-medium">{formatCurrency(progress.remainingAmount)}</span>
                                        </p>
                                    </div>
                                )}

                                {progress.isCompleted && (
                                    <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                                        <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1 font-medium">
                                            <Target className="h-4 w-4" />
                                            {t('goals.completed')}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}

                {goals.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-12 text-center bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                        <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-4">
                            <Target className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{t('goals.no_goals')}</h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-6">
                            {t('goals.no_goals_desc')}
                        </p>
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                            {t('goals.create_first')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
