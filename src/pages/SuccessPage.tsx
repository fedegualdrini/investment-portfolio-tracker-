import React from 'react';
import { CheckCircle, ArrowLeft } from 'lucide-react';

export const SuccessPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-green-100 dark:bg-green-900/20 rounded-full p-4">
              <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Payment Successful!
          </h1>
          
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            Thank you for upgrading to Premium! Your subscription is now active and you have access to all premium features.
          </p>
          
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-4 mb-8">
            <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2">
              Premium Features Unlocked
            </h3>
            <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
              <li>✓ Advanced Bond Analysis</li>
              <li>✓ Performance Comparison Tools</li>
              <li>✓ AI Portfolio Assistant</li>
              <li>✓ Priority Support</li>
            </ul>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.location.href = '/'}
              className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </button>
            
            <button
              onClick={() => window.location.href = '/pricing'}
              className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Manage Subscription
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
