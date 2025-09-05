# 🚀 Deployment Guide

## Overview

This guide covers deploying the Investment Portfolio Tracker to various platforms, with special attention to environment variable configuration for the AI chat functionality.

## 🌐 Vercel Deployment (Recommended)

### **Why Vercel?**
- **Serverless Functions**: Perfect for the AI chat API
- **Automatic Deployments**: GitHub integration with auto-deploy
- **Environment Variables**: Easy secure configuration
- **Global CDN**: Fast loading worldwide
- **Free Tier**: Generous limits for personal projects

### **Prerequisites**
- GitHub repository with your code
- OpenAI API key
- Vercel account (free)

### **Step-by-Step Deployment**

#### **1. Prepare Your Repository**

```bash
# Ensure all changes are committed
git add .
git commit -m "Add AI chat functionality and secure API key management"
git push origin main
```

#### **2. Connect to Vercel**

1. **Go to Vercel Dashboard**
   - Visit [vercel.com](https://vercel.com)
   - Sign up/Login with GitHub

2. **Import Project**
   - Click **"New Project"**
   - Select **"Import Git Repository"**
   - Choose your repository
   - Click **"Import"**

3. **Configure Project**
   - **Framework Preset**: Vite (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - Click **"Deploy"**

#### **3. Set Environment Variables**

1. **Go to Project Settings**
   - In your Vercel dashboard, select your project
   - Go to **Settings** tab
   - Click **Environment Variables** in the sidebar

2. **Add OpenAI API Key**
   - Click **"Add New"**
   - **Name**: `OPENAI_API_KEY`
   - **Value**: `your_openai_api_key_here`
   - **Environment**: Select all (Production, Preview, Development)
   - Click **Save**

3. **Optional: Add Other Variables**
   - `VITE_CURRENCY_API_KEY`: Your Open Exchange Rates API key
   - `VITE_APP_NAME`: Custom app name
   - `VITE_DEFAULT_CURRENCY`: Default currency (USD)
   - `VITE_DEFAULT_LANGUAGE`: Default language (en)

#### **4. Redeploy with Environment Variables**

After adding environment variables:
1. Go to **Deployments** tab
2. Click **"Redeploy"** on the latest deployment
3. Select **"Use existing Build Cache"** = No
4. Click **"Redeploy"**

### **Vercel CLI Alternative**

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Set environment variables
vercel env add OPENAI_API_KEY
# Enter your API key when prompted
# Select all environments

# Deploy
vercel --prod
```

### **Vercel Configuration**

The project includes a `vercel.json` file with:
- Serverless function configuration for `/api/chat`
- CORS headers for API requests
- Environment variable references

## 🔧 Environment Variables Reference

### **Required Variables**

| Variable | Description | Example |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API key for AI chat | `sk-proj-...` |

### **Optional Variables**

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `VITE_CURRENCY_API_KEY` | Open Exchange Rates API key | None | `your_key_here` |
| `VITE_DOLAR_API_URL` | DolarAPI endpoint | `https://dolarapi.com/v1/dolares/oficial` | URL |
| `VITE_APP_NAME` | Application name | `Investment Portfolio Tracker` | String |
| `VITE_DEFAULT_CURRENCY` | Default currency | `USD` | `USD` or `ARS` |
| `VITE_DEFAULT_LANGUAGE` | Default language | `en` | `en` or `es` |

## 🌍 Other Deployment Platforms

### **Netlify**

#### **Method 1: Netlify Dashboard**
1. Go to [netlify.com](https://netlify.com)
2. Click **"New site from Git"**
3. Connect your GitHub repository
4. **Build settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. **Environment variables**:
   - Go to Site settings → Environment variables
   - Add `OPENAI_API_KEY`
6. Deploy

#### **Method 2: Netlify CLI**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Build and deploy
npm run build
netlify deploy --prod --dir=dist

# Set environment variables
netlify env:set OPENAI_API_KEY your_api_key_here
```

### **GitHub Pages**

⚠️ **Note**: GitHub Pages only supports static sites. The AI chat functionality requires serverless functions, so this deployment method won't work for the full application.

### **Railway**

1. Go to [railway.app](https://railway.app)
2. Connect your GitHub repository
3. Set environment variables in Railway dashboard
4. Deploy

### **Render**

1. Go to [render.com](https://render.com)
2. Create new **Web Service**
3. Connect your GitHub repository
4. **Build Command**: `npm run build`
5. **Publish Directory**: `dist`
6. Set environment variables
7. Deploy

## 🔒 Security Best Practices

### **Environment Variables**
- ✅ Never commit API keys to Git
- ✅ Use `.env` files for local development
- ✅ Set environment variables in deployment platform
- ✅ Use different API keys for different environments
- ✅ Rotate API keys regularly

### **API Key Management**
- ✅ Use environment variables, not hardcoded values
- ✅ Restrict API key permissions when possible
- ✅ Monitor API usage and costs
- ✅ Set up billing alerts

### **CORS Configuration**
The application includes proper CORS headers:
```json
{
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
}
```

## 🧪 Testing Deployment

### **Local Testing**
```bash
# Test with environment variables
npm run dev:full

# Test production build
npm run build
npm run preview
```

### **Production Testing**
1. **Check Environment Variables**
   - Verify API key is set correctly
   - Test AI chat functionality
   - Check console for errors

2. **Test All Features**
   - Portfolio management
   - Bond analysis
   - AI chat
   - Currency conversion
   - Language switching

3. **Performance Testing**
   - Check loading times
   - Test on different devices
   - Verify responsive design

## 🐛 Troubleshooting

### **Common Issues**

#### **AI Chat Not Working**
- ✅ Check if `OPENAI_API_KEY` is set
- ✅ Verify API key is valid
- ✅ Check serverless function logs
- ✅ Ensure CORS is configured

#### **Build Failures**
- ✅ Check Node.js version (18+ required)
- ✅ Verify all dependencies are installed
- ✅ Check for TypeScript errors
- ✅ Review build logs

#### **Environment Variables Not Loading**
- ✅ Verify variable names match exactly
- ✅ Check if variables are set for correct environment
- ✅ Redeploy after adding variables
- ✅ Check for typos in variable names

### **Debugging Steps**

1. **Check Deployment Logs**
   - Vercel: Deployments → View Function Logs
   - Netlify: Functions → View Logs

2. **Test API Endpoints**
   ```bash
   # Test chat API
   curl -X POST https://your-app.vercel.app/api/chat \
     -H "Content-Type: application/json" \
     -d '{"messages":[{"role":"user","content":"Hello"}]}'
   ```

3. **Verify Environment Variables**
   ```javascript
   // Add to your API function temporarily
   console.log('Environment check:', {
     hasOpenAI: !!process.env.OPENAI_API_KEY,
     nodeEnv: process.env.NODE_ENV
   });
   ```

## 📊 Monitoring and Analytics

### **Vercel Analytics**
- Enable Vercel Analytics in dashboard
- Monitor performance metrics
- Track user interactions

### **Error Monitoring**
- Set up error tracking (Sentry, LogRocket)
- Monitor API usage and costs
- Set up alerts for failures

### **Performance Monitoring**
- Use Vercel's built-in analytics
- Monitor Core Web Vitals
- Track loading times

## 🔄 Continuous Deployment

### **GitHub Integration**
- Push to `main` branch triggers automatic deployment
- Pull requests create preview deployments
- Environment variables are inherited from production

### **Branch Strategy**
- `main`: Production deployments
- `develop`: Preview deployments
- `feature/*`: Preview deployments

### **Deployment Pipeline**
1. Code pushed to GitHub
2. Vercel detects changes
3. Builds application
4. Runs tests (if configured)
5. Deploys to preview/production
6. Sends notification

## 📈 Scaling Considerations

### **Vercel Limits**
- **Free Tier**: 100GB bandwidth, 100GB-hours serverless function execution
- **Pro Tier**: Higher limits, better performance
- **Enterprise**: Custom limits and features

### **OpenAI API Limits**
- Monitor usage and costs
- Set up billing alerts
- Consider rate limiting for high traffic

### **Database Considerations**
- Current: Local storage only
- Future: Consider external database for production
- Options: Vercel Postgres, PlanetScale, Supabase

---

**Need Help?** Check the [GitHub Issues](https://github.com/fedegualdrini/investment-portfolio-tracker-/issues) or create a new issue for deployment problems.
