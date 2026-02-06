import React from 'react';
import { AlertTriangle } from 'lucide-react';

export const DisclaimerFooter: React.FC<{ onOpenTerms?: () => void }> = ({ onOpenTerms }) => (
  <footer className="mt-8 pt-6 pb-4 border-t border-gray-200 dark:border-gray-700">
    <div className="max-w-4xl mx-auto px-4">
      <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800 dark:text-amber-200">
          <p className="font-semibold mb-1">Not Financial Advice</p>
          <p className="opacity-90">
            This application provides educational and informational content only.
            It does not provide investment advice, recommendations, or suitability assessments.
            Past performance does not guarantee future results.
            Always consult a qualified financial advisor before making investment decisions.
            {onOpenTerms ? (
              <button
                type="button"
                onClick={onOpenTerms}
                className="ml-1 underline hover:text-amber-600 dark:hover:text-amber-300"
              >
                Terms of Service
              </button>
            ) : (
              <a
                href="/terms.html"
                className="ml-1 underline hover:text-amber-600 dark:hover:text-amber-300"
                target="_blank"
                rel="noopener noreferrer"
              >
                Terms of Service
              </a>
            )}
          </p>
        </div>
      </div>
      <p className="text-center text-xs text-gray-500 dark:text-gray-600 mt-4">
        © {new Date().getFullYear()} Investment Portfolio Tracker. Educational use only.
      </p>
    </div>
  </footer>
);

export default DisclaimerFooter;
