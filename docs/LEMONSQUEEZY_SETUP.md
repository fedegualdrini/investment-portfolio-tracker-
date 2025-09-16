# 🍋 LemonSqueezy Integration Setup

## Overview

This guide explains how to set up LemonSqueezy for subscription management in your Investment Portfolio Tracker. The integration handles premium feature access and subscription status tracking.

## 🔧 Required Setup

### 1. LemonSqueezy Account Setup

1. **Create LemonSqueezy Account**
   - Go to [lemonsqueezy.com](https://lemonsqueezy.com)
   - Sign up for a free account
   - Complete account verification

2. **Create a Store**
   - In your LemonSqueezy dashboard, create a new store
   - Note your **Store ID** (you'll need this later)

3. **Create a Product**
   - Create a new product for your premium subscription
   - Set up pricing (e.g., $9.99/month)
   - Note the **Variant ID** (you'll need this later)

### 2. Get API Credentials

1. **Generate API Key**
   - Go to Settings → API in your LemonSqueezy dashboard
   - Click "Create API Key"
   - Copy the generated API key
   - **Important**: Keep this key secure and never commit it to version control

2. **Find Store ID**
   - In your store settings, copy the Store ID
   - This is usually a long string like `12345`

### 3. Environment Variables

Create a `.env.local` file in your project root with the following variables:

```bash
# LemonSqueezy Configuration
VITE_LEMONSQUEEZY_API_KEY=your_api_key_here
VITE_LEMONSQUEEZY_STORE_ID=your_store_id_here

# Other existing variables...
OPENAI_API_KEY=your_openai_api_key_here
```

### 4. Update Variant ID

In `src/components/Header.tsx`, replace the hardcoded variant ID with your actual variant ID:

```typescript
// Replace this line in both checkout buttons:
variantId: '6ea39e2c-da56-46cf-a1f5-d2df1bd30f9f',
// With your actual variant ID:
variantId: 'your_actual_variant_id_here',
```

## 🚀 How It Works

### Checkout Flow

1. **User clicks "Upgrade" button**
2. **System creates LemonSqueezy checkout** using the API
3. **User completes payment** on LemonSqueezy's secure checkout page
4. **Webhook updates subscription status** in your database
5. **User gains access** to premium features

### Webhook Integration

The system includes a Supabase Edge Function that handles LemonSqueezy webhooks:

- **Location**: `supabase/functions/lemonsqueezy-webhook/index.ts`
- **Purpose**: Updates subscription status when payments are processed
- **Triggers**: Payment success, subscription changes, cancellations

### Database Schema

The webhook expects a `subscriptions` table with these columns:

```sql
CREATE TABLE subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  ls_subscription_id TEXT UNIQUE,
  status TEXT,
  variant_id TEXT,
  customer_id TEXT,
  email TEXT,
  renewal_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 🔒 Security Considerations

### API Key Security
- ✅ Never commit API keys to version control
- ✅ Use environment variables for all sensitive data
- ✅ Rotate API keys regularly
- ✅ Use different keys for development/production

### Webhook Security
- ✅ Verify webhook signatures using the webhook secret
- ✅ Use HTTPS for all webhook endpoints
- ✅ Validate all incoming webhook data

## 🧪 Testing

### Development Testing

1. **Test Mode**: The checkout automatically uses test mode in development
2. **Fallback**: If API fails, falls back to direct URL method
3. **Error Handling**: Comprehensive error logging and user feedback

### Production Testing

1. **Use test cards** provided by LemonSqueezy
2. **Verify webhook delivery** in LemonSqueezy dashboard
3. **Test subscription status updates** in your app

## 🐛 Troubleshooting

### Common Issues

#### 401 Unauthorized
- **Cause**: Invalid or missing API key
- **Solution**: Verify `VITE_LEMONSQUEEZY_API_KEY` is correct

#### 422 Unprocessable Content
- **Cause**: Invalid request data or missing store ID
- **Solution**: Check `VITE_LEMONSQUEEZY_STORE_ID` and variant ID

#### Webhook Not Working
- **Cause**: Webhook URL not configured or secret mismatch
- **Solution**: 
  1. Deploy the Supabase Edge Function
  2. Configure webhook URL in LemonSqueezy dashboard
  3. Set `LS_WEBHOOK_SECRET` environment variable

### Debug Mode

Enable debug logging by checking the browser console for detailed error messages.

## 📚 Additional Resources

- [LemonSqueezy API Documentation](https://docs.lemonsqueezy.com/api)
- [LemonSqueezy Webhooks Guide](https://docs.lemonsqueezy.com/help/webhooks)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)

## 🔄 Migration from Direct URL

If you're migrating from the old direct URL method:

1. **Update imports** in components using checkout
2. **Replace function calls** with new API-based approach
3. **Test thoroughly** before deploying to production
4. **Keep legacy function** as fallback during transition

The new implementation is backward compatible and includes automatic fallback to the legacy method if the API fails.
