import { config } from 'dotenv';

// Load environment variables for local development. Vercel provides them automatically in production.
config({ path: '.env.local', override: true });

const LEMON_SQUEEZY_API_URL = 'https://api.lemonsqueezy.com/v1/checkouts';

function parseBody(body) {
  if (!body) return {};
  if (typeof body === 'string') {
    try {
      return JSON.parse(body);
    } catch (error) {
      console.error('Unable to parse request body as JSON:', error);
      return {};
    }
  }
  return body;
}

function buildCustomFields(userId, customData) {
  const customFields = {};

  if (customData && typeof customData === 'object') {
    for (const [key, value] of Object.entries(customData)) {
      if (value !== undefined) {
        customFields[key] = value;
      }
    }
  }

  if (userId) {
    customFields.user_id = userId;
  }

  return Object.keys(customFields).length > 0 ? customFields : undefined;
}

function createCheckoutPayload({
  variantId,
  storeId,
  email,
  name,
  userId,
  customData,
  checkoutOptions,
  productOptions,
  returnUrl,
  receiptLinkUrl,
  receiptButtonText,
  receiptThankYouNote,
  testMode
}) {
  const checkoutData = {};

  if (email) checkoutData.email = email;
  if (name) checkoutData.name = name;

  const customFields = buildCustomFields(userId, customData);
  if (customFields) {
    checkoutData.custom = customFields;
  }

  const defaultReturnUrl = returnUrl ?? receiptLinkUrl ?? null;

  const payload = {
    data: {
      type: 'checkouts',
      attributes: {
        checkout_data: checkoutData,
        checkout_options: {
          embed: false,
          media: false,
          logo: false,
          ...(checkoutOptions && typeof checkoutOptions === 'object' ? checkoutOptions : {})
        },
        product_options: {
          ...(productOptions && typeof productOptions === 'object' ? productOptions : {}),
          redirect_url: productOptions?.redirect_url ?? defaultReturnUrl ?? undefined,
          receipt_link_url: productOptions?.receipt_link_url ?? defaultReturnUrl ?? undefined,
          receipt_button_text: receiptButtonText ?? productOptions?.receipt_button_text ?? 'Return to App',
          receipt_thank_you_note: receiptThankYouNote ?? productOptions?.receipt_thank_you_note ?? 'Thank you for your purchase!'
        },
        test_mode: testMode
      },
      relationships: {
        store: {
          data: {
            type: 'stores',
            id: storeId
          }
        },
        variant: {
          data: {
            type: 'variants',
            id: variantId
          }
        }
      }
    }
  };

  // Lemon Squeezy requires the enabled_variants when using product_options
  if (!payload.data.attributes.product_options.enabled_variants) {
    payload.data.attributes.product_options.enabled_variants = [variantId];
  }

  // Clean up any undefined values inside checkout_data
  if (Object.keys(payload.data.attributes.checkout_data).length === 0) {
    delete payload.data.attributes.checkout_data;
  }

  // Remove undefined product option fields to avoid API validation errors
  payload.data.attributes.product_options = Object.fromEntries(
    Object.entries(payload.data.attributes.product_options).filter(([, value]) => value !== undefined && value !== null)
  );

  return payload;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  const body = parseBody(req.body);
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
  } = body;

  if (!variantId) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'variantId is required' }));
    return;
  }

  const apiKey = process.env.LEMONSQUEEZY_API_KEY;
  const storeId = process.env.LEMONSQUEEZY_STORE_ID;

  if (!apiKey || !storeId) {
    console.error('Missing Lemon Squeezy credentials. Ensure LEMONSQUEEZY_API_KEY and LEMONSQUEEZY_STORE_ID are set.');
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Lemon Squeezy is not configured on the server' }));
    return;
  }

  const vercelEnv = process.env.VERCEL_ENV;
  const nodeEnv = process.env.NODE_ENV;
  const envTestMode = process.env.LEMONSQUEEZY_TEST_MODE === 'true';
  const resolvedTestMode = typeof testMode === 'boolean'
    ? testMode
    : (typeof vercelEnv === 'string'
      ? vercelEnv !== 'production'
      : nodeEnv !== 'production') || envTestMode;

  const payload = createCheckoutPayload({
    variantId,
    storeId,
    email,
    name,
    userId,
    customData,
    checkoutOptions,
    productOptions,
    returnUrl,
    receiptLinkUrl,
    receiptButtonText,
    receiptThankYouNote,
    testMode: resolvedTestMode
  });

  try {
    const response = await fetch(LEMON_SQUEEZY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/vnd.api+json',
        Accept: 'application/vnd.api+json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json().catch(() => null);

    if (!response.ok) {
      console.error('Lemon Squeezy checkout creation failed:', result);
      res.writeHead(response.status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: result?.errors?.[0]?.detail || 'Failed to create Lemon Squeezy checkout',
        details: result
      }));
      return;
    }

    const checkoutUrl = result?.data?.attributes?.url;

    if (!checkoutUrl) {
      console.error('No checkout URL returned from Lemon Squeezy:', result);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'No checkout URL returned from Lemon Squeezy', details: result }));
      return;
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      url: checkoutUrl,
      checkoutId: result?.data?.id,
      testMode: resolvedTestMode
    }));
  } catch (error) {
    console.error('Error creating Lemon Squeezy checkout:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Unexpected error creating checkout' }));
  }
}
