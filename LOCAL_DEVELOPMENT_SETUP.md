# 🚀 Local Development Setup

## ⚠️ **IMPORTANT: Environment Variables Required**

The application requires Supabase environment variables to function. Without them, the app will show a blank page.

## 🔧 **Setup Steps**

### **Step 1: Get Your Supabase Keys**

1. Go to your **new Supabase project** dashboard
2. Navigate to **Settings** → **API**
3. Copy these values:
   - **Project URL** (e.g., `https://your-project-ref.supabase.co`)
   - **anon public** key
   - **service_role** key (secret)

### **Step 2: Create Local Environment File**

Create a `.env.local` file in the project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
SUPABASE_JWT_SECRET=your-jwt-secret-here

# Database Configuration (if using direct connection)
POSTGRES_URL=your-postgres-url
POSTGRES_USER=your-postgres-user
POSTGRES_HOST=your-postgres-host
POSTGRES_PASSWORD=your-postgres-password
POSTGRES_DATABASE=your-postgres-database
POSTGRES_PRISMA_URL=your-postgres-prisma-url
POSTGRES_URL_NON_POOLING=your-postgres-url-non-pooling

# Paddle Configuration (for testing)
PADDLE_VENDOR_ID=your-paddle-vendor-id
PADDLE_API_KEY=your-paddle-api-key
PADDLE_WEBHOOK_SECRET=your-paddle-webhook-secret
PADDLE_ENVIRONMENT=sandbox

# JWT Secret
JWT_SECRET=your-jwt-secret
```

### **Step 3: Start Development Server**

```bash
npm run dev
```

## 🔒 **Security Notes**

- **NEVER commit `.env.local`** to version control
- **NEVER use fallback secrets** in production code
- **Environment variables are required** - no fallbacks
- **Use different keys** for development vs production

## 🐛 **Troubleshooting**

### **Blank Page Issue**
- Check browser console for errors
- Verify environment variables are set
- Ensure Supabase project is active

### **Authentication Issues**
- Verify Supabase keys are correct
- Check if Supabase project is accessible
- Ensure database tables exist

### **Build Errors**
- Run `npm run build` to check for TypeScript errors
- Verify all imports are correct
- Check for missing dependencies

## 📋 **Required Environment Variables**

### **Minimum Required:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### **Optional (for full functionality):**
- `SUPABASE_JWT_SECRET`
- `POSTGRES_URL`
- `PADDLE_VENDOR_ID`
- `PADDLE_API_KEY`
- `JWT_SECRET`

## ✅ **Verification**

After setting up environment variables:

1. **Start dev server**: `npm run dev`
2. **Open browser**: `http://localhost:5173`
3. **Check console**: No Supabase errors
4. **Test navigation**: All pages should work
5. **Test authentication**: Sign in/up should work

## 🚨 **Security Reminder**

- **No hardcoded secrets** in code
- **No fallback values** for production
- **Environment variables only**
- **Different keys** for dev/prod
