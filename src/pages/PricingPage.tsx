import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { PaddleCheckout } from '../components/subscription/PaddleCheckout';
import { Check, Crown, Star } from 'lucide-react';

export const PricingPage: React.FC = () => {
  const { user } = useAuth();
  const { subscription, isPremium } = useSubscription();

  const features = {
    free: [
      'Basic portfolio tracking',
      'Add/edit investments',
      'Basic analytics',
      'Export/import data',
      'Real-time price updates'
    ],
    premium: [
      'Everything in Free',
      'Bond analysis tools',
      'Performance comparison',
      'Advanced analytics',
      'AI portfolio assistant',
      'Priority support'
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Unlock advanced portfolio analysis tools and take your investment tracking to the next level
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Free
              </h3>
              <div className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                $0
                <span className="text-lg font-normal text-gray-500 dark:text-gray-400">/year</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Perfect for getting started
              </p>
            </div>

            <ul className="space-y-3 mb-8">
              {features.free.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              disabled
              className="w-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-medium py-3 px-6 rounded-lg cursor-not-allowed"
            >
              {subscription?.plan === 'free' ? 'Current Plan' : 'Free Plan'}
            </button>
          </div>

          {/* Premium Plan */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 border-purple-500 relative p-8">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center">
                <Star className="h-4 w-4 mr-1" />
                Most Popular
              </div>
            </div>

            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-2">
                <Crown className="h-6 w-6 text-purple-500 mr-2" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Premium
                </h3>
              </div>
              <div className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                $5
                <span className="text-lg font-normal text-gray-500 dark:text-gray-400">/year</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Advanced tools for serious investors
              </p>
            </div>

            <ul className="space-y-3 mb-8">
              {features.premium.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                </li>
              ))}
            </ul>

            {isPremium ? (
              <div className="w-full bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 font-medium py-3 px-6 rounded-lg text-center">
                ✓ Premium Active
              </div>
            ) : (
              <PaddleCheckout />
            )}
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Why Choose Premium?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Premium subscribers get access to advanced bond analysis, performance comparison tools, 
              and AI-powered portfolio insights that help you make better investment decisions.
            </p>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              All plans include secure data storage and regular backups
            </div>
          </div>
        </div>

        {/* Legal Links */}
        <div className="mt-8 text-center">
          <div className="flex justify-center space-x-6 text-sm">
            <a href="/terms" className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300">
              Terms of Service
            </a>
            <a href="/privacy" className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300">
              Privacy Policy
            </a>
            <a href="/refund" className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300">
              Refund Policy
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
