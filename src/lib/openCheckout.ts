interface LemonSqueezyCheckoutOptions {
  variantId?: string;
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

const env = import.meta.env as Record<string, string | undefined>;

function readEnvValue(...keys: string[]) {
  for (const key of keys) {
    const value = env[key];
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed) {
        return trimmed;
      }
    }
  }
  return undefined;
}

export const LEMON_SQUEEZY_VARIANT_ID = readEnvValue(
  'VITE_LEMONSQUEEZY_VARIANT_ID',
  'VITE_LEMON_SQUEEZY_VARIANT_ID',
  'LEMONSQUEEZY_VARIANT_ID',
  'LEMON_SQUEEZY_VARIANT_ID'
) ?? '1000932';

const DEFAULT_LEMON_SQUEEZY_FALLBACK_URL = `https://portfolio-tracker.lemonsqueezy.com/buy/${LEMON_SQUEEZY_VARIANT_ID}`;

export const LEMON_SQUEEZY_FALLBACK_URL = readEnvValue(
  'VITE_LEMONSQUEEZY_FALLBACK_URL',
  'VITE_LEMON_SQUEEZY_FALLBACK_URL',
  'LEMONSQUEEZY_FALLBACK_URL',
  'LEMON_SQUEEZY_FALLBACK_URL'
) ?? DEFAULT_LEMON_SQUEEZY_FALLBACK_URL;

function normalizeCheckoutString(value: unknown) {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed === '' ? undefined : trimmed;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? String(value) : undefined;
  }

  return undefined;
}

function getPayloadString(payload: Record<string, unknown>, key: string) {
  return normalizeCheckoutString(payload[key]);
}

function resolveLegacyProductUrl(productUrl: string | undefined, variantId?: string) {
  const sanitizedProductUrl = normalizeCheckoutString(productUrl) ?? LEMON_SQUEEZY_FALLBACK_URL;
  const sanitizedVariantId = normalizeCheckoutString(variantId);

  if (!sanitizedVariantId) {
    return sanitizedProductUrl;
  }

  try {
    const fallbackUrl = new URL(sanitizedProductUrl);
    const defaultUrl = new URL(DEFAULT_LEMON_SQUEEZY_FALLBACK_URL);

    const fallbackSegments = fallbackUrl.pathname.split('/').filter(Boolean);
    const defaultSegments = defaultUrl.pathname.split('/').filter(Boolean);

    if (
      fallbackUrl.origin === defaultUrl.origin &&
      fallbackSegments.length === defaultSegments.length &&
      fallbackSegments.slice(0, -1).every((segment, index) => segment === defaultSegments[index])
    ) {
      fallbackSegments[fallbackSegments.length - 1] = sanitizedVariantId;
      fallbackUrl.pathname = `/${fallbackSegments.join('/')}`;
      return fallbackUrl.toString();
    }

    return fallbackUrl.toString();
  } catch (error) {
    console.warn('Invalid Lemon Squeezy fallback product URL provided:', error);
    return sanitizedProductUrl;
  }
}

function buildLegacyCheckoutUrl(
  productUrl: string = LEMON_SQUEEZY_FALLBACK_URL,
  email?: string,
  userId?: string
) {
  const sanitizedProductUrl = normalizeCheckoutString(productUrl) ?? LEMON_SQUEEZY_FALLBACK_URL;
  const sanitizedEmail = normalizeCheckoutString(email);
  const sanitizedUserId = normalizeCheckoutString(userId);

  try {
    const url = new URL(sanitizedProductUrl);
    if (sanitizedEmail) {
      url.searchParams.set('checkout[email]', sanitizedEmail);
    }
    if (sanitizedUserId) {
      url.searchParams.set('checkout[custom]', sanitizedUserId);
    }
    return url.toString();
  } catch (error) {
    console.warn('Unable to construct Lemon Squeezy fallback URL:', error);
    return sanitizedProductUrl;
  }
}

function buildCheckoutRequestPayload(options: LemonSqueezyCheckoutOptions) {
  const {
    variantId = LEMON_SQUEEZY_VARIANT_ID,
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

  if (!variantId) {
    throw new Error('Lemon Squeezy variant ID is not configured.');
  }

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
    const fallbackVariantId =
      getPayloadString(payload, 'variantId') ??
      normalizeCheckoutString(options.variantId) ??
      LEMON_SQUEEZY_VARIANT_ID;

    const fallbackProductUrl = resolveLegacyProductUrl(
      LEMON_SQUEEZY_FALLBACK_URL,
      fallbackVariantId
    );

    const fallbackEmail =
      getPayloadString(payload, 'email') ?? normalizeCheckoutString(options.email);
    const fallbackUserId =
      getPayloadString(payload, 'userId') ?? normalizeCheckoutString(options.userId);

    if (fallbackProductUrl) {
      console.warn('Falling back to direct Lemon Squeezy checkout URL.');
      const fallbackUrl = openLemonSqueezyCheckoutLegacy(
        fallbackProductUrl,
        fallbackEmail,
        fallbackUserId
      );

      const payloadTestMode =
        typeof payload['testMode'] === 'boolean' ? (payload['testMode'] as boolean) : undefined;

      return {
        url: fallbackUrl,
        testMode: payloadTestMode ?? import.meta.env.DEV
      };
    }

    if (!import.meta.env.DEV) {
      alert('Unable to open checkout. Please try again or contact support.');
    }

    throw error;
  }
}

// Legacy function for backward compatibility
export function openLemonSqueezyCheckoutLegacy(
  productUrl: string = LEMON_SQUEEZY_FALLBACK_URL,
  email?: string,
  userId?: string
): string {
  const url = buildLegacyCheckoutUrl(productUrl, email, userId);
  window.open(url, '_blank', 'noopener');
  return url;
}



