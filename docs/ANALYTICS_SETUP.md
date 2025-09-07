# Analytics Setup Guide

This document explains how to set up Google Analytics 4 (GA4) and Google Search Console for your Investment Portfolio Tracker.

## 🎯 Overview

The app includes comprehensive tracking for:
- **Page views** and **user sessions**
- **Investment actions** (add, edit, remove, refresh prices)
- **AI assistant interactions**
- **Bond analysis usage**
- **Settings changes** (theme, language, currency)
- **Performance analytics**

## 📊 Google Analytics 4 Setup

### Step 1: Create GA4 Property

1. Go to [Google Analytics](https://analytics.google.com/)
2. Click **Admin** (gear icon)
3. Click **Create Property**
4. Enter property details:
   - **Property name**: Investment Portfolio Tracker
   - **Reporting time zone**: Your timezone
   - **Currency**: Your preferred currency
5. Click **Next** and complete setup

### Step 2: Get Tracking ID

1. In GA4, go to **Admin** > **Data Streams**
2. Click **Add stream** > **Web**
3. Enter your website URL: `https://investment-portfolio-tracker.vercel.app`
4. Enter stream name: **Investment Tracker Web**
5. Copy the **Measurement ID** (format: `G-XXXXXXXXXX`)

### Step 3: Configure Environment Variables

Create a `.env.local` file in your project root:

```env
# Google Analytics 4 Tracking ID
VITE_GA_TRACKING_ID=G-XXXXXXXXXX

# Replace with your actual tracking ID from Step 2
```

### Step 4: Deploy and Test

1. Deploy your app with the new environment variable
2. Visit your live site
3. Check GA4 Real-time reports to verify tracking works

## 🔍 Google Search Console Setup

### Step 1: Add Property

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Click **Add Property**
3. Select **URL prefix**
4. Enter your domain: `https://investment-portfolio-tracker.vercel.app`

### Step 2: Verify Ownership

1. Choose **HTML tag** verification method
2. Copy the verification code (the content value)
3. Update `index.html`:

```html
<!-- Replace REPLACE_WITH_YOUR_VERIFICATION_CODE with your actual code -->
<meta name="google-site-verification" content="your-verification-code-here" />
```

4. Deploy your app
5. Click **Verify** in Search Console

### Step 3: Submit Sitemap

1. In Search Console, go to **Sitemaps**
2. Add sitemap URL: `https://investment-portfolio-tracker.vercel.app/sitemap.xml`
3. Click **Submit**

## 📈 Analytics Events Tracked

### Portfolio Actions
- `add_investment` - When user adds new investment
- `edit_investment` - When user edits existing investment
- `remove_investment` - When user removes investment
- `refresh_prices` - When user manually refreshes prices

### AI Assistant
- `chat_interaction` - When user interacts with AI assistant

### Analysis Features
- `bond_analysis` - When user views bond analysis
- `performance_analysis` - When user views performance metrics

### Settings
- `currency_change` - When user changes currency
- `theme_toggle` - When user toggles dark/light theme
- `language_toggle` - When user changes language

## 📊 Key Metrics to Monitor

### User Engagement
- **Sessions** - Total user sessions
- **Session Duration** - How long users stay
- **Pages per Session** - User navigation depth
- **Bounce Rate** - Single-page sessions

### Feature Usage
- **Event Count** by event type
- **Portfolio Actions** - Most used features
- **AI Assistant Usage** - Chat interactions
- **Analysis Tools** - Bond vs performance analysis

### Performance
- **Page Load Time** - Site speed metrics
- **Core Web Vitals** - Google's performance metrics
- **Device Types** - Mobile vs desktop usage

## 🎯 Search Console Metrics

### Search Performance
- **Impressions** - How often your site appears in search
- **Clicks** - Actual visits from search results
- **CTR (Click-through Rate)** - Clicks ÷ Impressions
- **Average Position** - Your ranking for keywords

### Technical Health
- **Coverage** - Pages successfully indexed
- **Mobile Usability** - Mobile-friendly issues
- **Core Web Vitals** - Real user experience data
- **Security Issues** - Any security problems

## 🔧 Testing Your Setup

### GA4 Testing
1. Open your live site
2. Perform some actions (add investment, toggle theme)
3. Check GA4 **Real-time** > **Events** (may take 5-10 minutes)
4. Verify custom events appear

### Search Console Testing
1. Wait 24-48 hours after verification
2. Check **Performance** for search impressions
3. Use **URL Inspection** to test page indexing
4. Submit pages for re-indexing if needed

## 🚨 Troubleshooting

### GA4 Not Working
- ✅ Check tracking ID format (`G-XXXXXXXXXX`)
- ✅ Verify environment variable deployment
- ✅ Check browser console for errors
- ✅ Disable ad blockers for testing

### Search Console Issues
- ✅ Verify meta tag is in `<head>` section
- ✅ Check verification code hasn't changed
- ✅ Ensure HTTPS is working properly
- ✅ Wait 24-48 hours for data to appear

### Events Not Tracking
- ✅ Check browser developer tools > Network tab
- ✅ Look for gtag requests to Google Analytics
- ✅ Verify event names match expected format
- ✅ Test in incognito mode

## 📋 Monthly Review Checklist

### GA4 Review
- [ ] Check total sessions vs previous month
- [ ] Review top events and user flows
- [ ] Analyze device and geographic data
- [ ] Monitor conversion goals (if set up)

### Search Console Review
- [ ] Review search query performance
- [ ] Check for coverage errors
- [ ] Monitor Core Web Vitals scores
- [ ] Submit new pages to index

### Performance Actions
- [ ] Identify most popular features
- [ ] Find pages with high bounce rates
- [ ] Optimize based on user behavior data
- [ ] Plan improvements based on metrics

## 🎉 Next Steps

Once analytics are working:

1. **Set up Goals** in GA4 for key actions
2. **Create Custom Reports** for investment-specific metrics
3. **Set up Alerts** for significant traffic changes
4. **Monitor SEO Performance** in Search Console
5. **Use Data** to guide feature development

## 📞 Support

If you need help with analytics setup:
1. Check GA4 documentation: https://support.google.com/analytics
2. Search Console help: https://support.google.com/webmasters
3. Review this guide's troubleshooting section
4. Test in different browsers and devices

Remember: Analytics data takes 24-48 hours to appear in reports, so be patient after initial setup!
