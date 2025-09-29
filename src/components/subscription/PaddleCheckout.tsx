import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface PaddleCheckoutProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const PaddleCheckout: React.FC<PaddleCheckoutProps> = ({ onSuccess, onError }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [paddleLoaded, setPaddleLoaded] = useState(false);

  useEffect(() => {
    // Load Paddle script
    const script = document.createElement('script');
    script.src = 'https://cdn.paddle.com/paddle/paddle.js';
    script.onload = () => setPaddleLoaded(true);
    document.head.appendChild(script);

    return () => {
      // Cleanup script on unmount
      const existingScript = document.querySelector('script[src="https://cdn.paddle.com/paddle/paddle.js"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  const handleUpgrade = async () => {
    if (!user) {
      onError?.('Please sign in to upgrade');
      return;
    }

    setLoading(true);

    try {
      // For now, we'll simulate the Paddle checkout
      // In production, you would integrate with Paddle's actual checkout
      const response = await fetch('/api/paddle/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { checkoutUrl } = await response.json();
      
      // Redirect to Paddle checkout
      window.location.href = checkoutUrl;
    } catch (error: any) {
      console.error('Paddle checkout error:', error);
      onError?.(error.message || 'Failed to start checkout process');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleUpgrade}
      disabled={loading || !paddleLoaded || !user}
      className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          Processing...
        </>
      ) : (
        'Upgrade to Premium - $5/year'
      )}
    </button>
  );
};
