import React from 'react';

export const RefundPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
            Refund Policy
          </h1>
          
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                1. Refund Eligibility
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We offer refunds for Premium subscriptions within 30 days of the initial purchase date. Refunds are processed through our payment processor, Paddle.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                2. Refund Process
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                To request a refund:
              </p>
              <ol className="list-decimal list-inside text-gray-700 dark:text-gray-300 mb-4">
                <li>Contact our support team at support@investmenttracker.com</li>
                <li>Provide your account email and subscription details</li>
                <li>Explain the reason for your refund request</li>
                <li>We will process your request within 5 business days</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                3. Refund Timeline
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Once approved, refunds are typically processed within 5-10 business days. The refund will appear on your original payment method. Processing times may vary depending on your bank or payment provider.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                4. Non-Refundable Items
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                The following are not eligible for refunds:
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4">
                <li>Refunds requested after 30 days from purchase</li>
                <li>Refunds for accounts that have violated our Terms of Service</li>
                <li>Refunds for accounts that have been terminated for abuse</li>
                <li>Partial refunds for unused portions of subscriptions</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                5. Cancellation vs Refund
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Cancelling your subscription stops future billing but does not automatically refund your current billing period. If you want a refund for your current period, you must specifically request it.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                6. Disputed Charges
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                If you dispute a charge with your bank or credit card company, please contact us first. We will work with you to resolve the issue and may provide a refund if appropriate.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                7. Account Access After Refund
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                After a refund is processed, your Premium features will be disabled and your account will revert to the Free plan. You will retain access to your portfolio data but lose access to Premium-only features.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                8. Special Circumstances
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We may consider refunds outside the 30-day window in special circumstances, such as technical issues that prevent you from using the service. Contact support to discuss your situation.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                9. Contact Information
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                For refund requests or questions about this policy, please contact us at:
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4">
                <li>Email: support@investmenttracker.com</li>
                <li>Subject: Refund Request</li>
                <li>Include your account email and purchase details</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                10. Changes to Refund Policy
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We reserve the right to modify this refund policy at any time. Changes will be posted on this page with an updated "Last updated" date. Continued use of our service after changes constitutes acceptance of the new policy.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};
