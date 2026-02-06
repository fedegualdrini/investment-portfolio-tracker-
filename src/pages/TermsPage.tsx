import React from 'react';

export function TermsPage({ onBack }: { onBack: () => void }) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="brand-card-static p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="brand-heading-lg">Terms of Service</h1>
            <p className="brand-subtext-sm mt-1">Last updated: February 6, 2026</p>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="brand-button-secondary"
          >
            Back
          </button>
        </div>

        <div className="space-y-6 text-gray-700 dark:text-gray-300">
          <section>
            <h2 className="brand-heading-md mb-2">Not Financial Advice</h2>
            <p>
              This app provides educational and informational content only. It does not provide investment advice,
              recommendations, or suitability assessments.
            </p>
          </section>

          <section>
            <h2 className="brand-heading-md mb-2">Local Storage & Privacy</h2>
            <p>
              Portfolio data is stored locally in your browser. You are responsible for keeping backups of your data.
            </p>
          </section>

          <section>
            <h2 className="brand-heading-md mb-2">Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, we are not liable for any losses arising from use of the app.
              Past performance does not guarantee future results.
            </p>
          </section>

          <section>
            <h2 className="brand-heading-md mb-2">Your Responsibility</h2>
            <p>
              You are solely responsible for your investment decisions. Always consult a qualified professional when
              appropriate.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
