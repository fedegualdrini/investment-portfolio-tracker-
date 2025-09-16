interface LemonSqueezyCheckoutOptions {
  variantId: string;
  email?: string;
  userId?: string;
  name?: string;
  customData?: Record<string, any>;
}

export async function openLemonSqueezyCheckout(options: LemonSqueezyCheckoutOptions) {
  const { variantId, email, userId, name, customData } = options;
  
  try {
    // Create checkout using LemonSqueezy API
    const checkoutData = {
      data: {
        type: 'checkouts',
        attributes: {
          checkout_data: {
            email: email || undefined,
            name: name || undefined,
            custom: userId ? [userId] : undefined,
            ...customData
          },
          product_options: {
            enabled_variants: [variantId],
            redirect_url: `${window.location.origin}/`,
            receipt_link_url: `${window.location.origin}/`,
            receipt_button_text: 'Return to App',
            receipt_thank_you_note: 'Thank you for your purchase!'
          },
          checkout_options: {
            embed: false,
            media: false,
            logo: false
          },
          preview: false,
          test_mode: import.meta.env.DEV
        },
        relationships: {
          store: {
            data: {
              type: 'stores',
              id: import.meta.env.VITE_LEMONSQUEEZY_STORE_ID
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

    const response = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/vnd.api+json',
        'Accept': 'application/vnd.api+json',
        'Authorization': `Bearer ${import.meta.env.VITE_LEMONSQUEEZY_API_KEY}`
      },
      body: JSON.stringify(checkoutData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('LemonSqueezy checkout creation failed:', errorData);
      throw new Error(`Checkout creation failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    const checkoutUrl = result.data.attributes.url;
    
    if (checkoutUrl) {
      window.open(checkoutUrl, '_blank', 'noopener');
    } else {
      throw new Error('No checkout URL returned from LemonSqueezy');
    }
  } catch (error) {
    console.error('Error creating LemonSqueezy checkout:', error);
    
    // Fallback to direct URL approach for development
    if (import.meta.env.DEV) {
      const fallbackUrl = `https://portfolio-tracker.lemonsqueezy.com/buy/${variantId}`;
      const url = new URL(fallbackUrl);
      if (email) url.searchParams.set('checkout[email]', email);
      if (userId) url.searchParams.set('checkout[custom]', userId);
      window.open(url.toString(), '_blank', 'noopener');
    } else {
      // In production, show user-friendly error
      alert('Unable to open checkout. Please try again or contact support.');
    }
  }
}

// Legacy function for backward compatibility
export function openLemonSqueezyCheckoutLegacy(productUrl: string, email?: string, userId?: string) {
  const url = new URL(productUrl);
  if (email) url.searchParams.set('checkout[email]', email);
  if (userId) url.searchParams.set('checkout[custom]', userId);
  window.open(url.toString(), '_blank', 'noopener');
}



