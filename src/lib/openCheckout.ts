interface LemonSqueezyCheckoutOptions {
  variantId: string;
  email?: string;
  userId?: string;
  name?: string;
  customData?: Record<string, unknown>;
  checkoutOptions?: Record<string, unknown>;
  productOptions?: Record<string, unknown>;
  returnUrl?: string;
  receiptLinkUrl?: string;
  receiptButtonText?: string;
  receiptThankYouNote?: string;
  testMode?: boolean;
}

interface LemonSqueezyCheckoutResponse {
  url: string;
  checkoutId?: string;
  testMode?: boolean;
}

const CHECKOUT_ENDPOINT = '/api/lemonsqueezy/create-checkout';

function buildCheckoutRequestPayload(options: LemonSqueezyCheckoutOptions) {
  const {
    variantId,
    email,
    userId,
    name,
    customData,
    checkoutOptions,
    productOptions,
    returnUrl,
    receiptLinkUrl,
    receiptButtonText,
    receiptThankYouNote,
    testMode
  } = options;

  const baseReturnUrl = returnUrl ?? `${window.location.origin}/`;
  const payload: Record<string, unknown> = {
    variantId,
    email,
    userId,
    name,
    customData,
    checkoutOptions,
    productOptions,
    returnUrl: baseReturnUrl,
    receiptLinkUrl: receiptLinkUrl ?? baseReturnUrl,
    receiptButtonText,
    receiptThankYouNote
  };

  if (typeof testMode === 'boolean') {
    payload.testMode = testMode;
  } else if (import.meta.env.DEV) {
    payload.testMode = true;
  }

  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => {
      if (value === undefined || value === null) {
        return false;
      }
      if (typeof value === 'object' && !Array.isArray(value)) {
        return Object.keys(value as Record<string, unknown>).length > 0;
      }
      return true;
    })
  );
}

export async function openLemonSqueezyCheckout(options: LemonSqueezyCheckoutOptions) {
  const payload = buildCheckoutRequestPayload(options);

  let response: Response;
  let result: Partial<LemonSqueezyCheckoutResponse> & { error?: string } | null = null;

  try {
    response = await fetch(CHECKOUT_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    try {
      result = await response.json();
    } catch (parseError) {
      console.error('Failed to parse Lemon Squeezy API response:', parseError);
      result = null;
    }

    if (!response.ok) {
      const errorMessage = result?.error || `Checkout creation failed: ${response.status} ${response.statusText}`;
      throw new Error(errorMessage);
    }

    const checkoutUrl = result?.url;

    if (!checkoutUrl) {
      throw new Error('No checkout URL returned from LemonSqueezy');
    }

    window.open(checkoutUrl, '_blank', 'noopener');
    return result as LemonSqueezyCheckoutResponse;
  } catch (error) {
    console.error('Error creating LemonSqueezy checkout:', error);
    throw error;
  }
}

// Legacy function for backward compatibility
export function openLemonSqueezyCheckoutLegacy(productUrl: string, email?: string, userId?: string) {
  const url = new URL(productUrl);
  if (email) url.searchParams.set('checkout[email]', email);
  if (userId) url.searchParams.set('checkout[custom][user_id]', userId);
  window.open(url.toString(), '_blank', 'noopener');
}



