import React from 'react';
import { TrendingUp } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-purple-600 dark:bg-purple-500 rounded-lg shadow-sm">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Investment Portfolio Tracker
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Advanced portfolio analysis and tracking
                </p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm max-w-md">
              Track your investments with advanced analytics, bond analysis, and AI-powered insights. 
              Make informed investment decisions with comprehensive portfolio management tools.
            </p>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Legal
            </h4>
            <ul className="space-y-2">
              <li>
                <a 
                  href="/terms" 
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a 
                  href="/privacy" 
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a 
                  href="/refund" 
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                >
                  Refund Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Support
            </h4>
            <ul className="space-y-2">
              <li>
                <a 
                  href="mailto:support@investmenttracker.com" 
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                >
                  Contact Us
                </a>
              </li>
              <li>
                <a 
                  href="/pricing" 
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                >
                  Pricing
                </a>
              </li>
              <li>
                <a 
                  href="mailto:help@investmenttracker.com" 
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                >
                  Help Center
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              &copy; 2024 Investment Portfolio Tracker. All rights reserved.
            </p>
            <div className="mt-4 sm:mt-0">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Powered by Supabase & Paddle
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
