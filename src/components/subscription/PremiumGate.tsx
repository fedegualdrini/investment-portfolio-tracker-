import React from 'react';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { Crown, Lock } from 'lucide-react';

interface PremiumGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgradePrompt?: boolean;
}

export const PremiumGate: React.FC<PremiumGateProps> = ({ 
  children, 
  fallback, 
  showUpgradePrompt = true 
}) => {
  const { isPremium, loading } = useSubscription();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!isPremium) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (showUpgradePrompt) {
      return <UpgradePrompt />;
    }

    return null;
  }

  return <>{children}</>;
};

const UpgradePrompt: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-6 text-center">
      <div className="flex items-center justify-center mb-4">
        <div className="bg-purple-100 dark:bg-purple-900/30 rounded-full p-3">
          <Crown className="h-8 w-8 text-purple-600 dark:text-purple-400" />
        </div>
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
        Premium Feature
      </h3>
      
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        This feature is available with a Premium subscription. Upgrade to unlock advanced portfolio analysis tools.
      </p>
      
      <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
        <Lock className="h-4 w-4" />
        <span>Premium required</span>
      </div>
      
      <button
        onClick={() => window.location.href = '/pricing'}
        className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200"
      >
        Upgrade to Premium - $5/year
      </button>
    </div>
  );
};
