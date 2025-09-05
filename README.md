# 📊 Investment Portfolio Tracker

A modern, feature-rich web application for tracking and analyzing investment portfolios with advanced bond analysis, multi-currency support, and real-time data integration.

![Portfolio Dashboard](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![React](https://img.shields.io/badge/React-18.0+-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.0+-blue)

## 🚀 Features

### 📈 **Core Portfolio Management**
- **Multi-Asset Support**: Stocks, ETFs, Bonds, Cryptocurrencies, Commodities, Cash
- **Real-time Tracking**: Live price updates and performance monitoring
- **Portfolio Analytics**: Comprehensive performance metrics and allocation analysis
- **Import/Export**: JSON-based portfolio data management

### 🏦 **Advanced Bond Analysis**
- **Smart Payment Detection**: AI-powered bond payment frequency detection
- **Cash Flow Projections**: Monthly, quarterly, and annual income forecasting
- **Maturity Tracking**: Automated maturity date calculations
- **Yield Optimization**: Fixed yield analysis and optimization tools

### 🤖 **AI Investment Assistant (Powered by Vercel AI Gateway)**
- **Portfolio-Aware Chat**: AI chatbot with full access to your portfolio data
- **Real-time Market Context**: AI has access to current market data and exchange rates
- **Bond Payment Insights**: Detailed bond coupon payment analysis and scheduling
- **Personalized Advice**: Data-driven investment recommendations based on your holdings
- **Multi-language Support**: AI assistant available in English and Spanish
- **High Reliability**: Automatic retries and fallbacks via Vercel AI Gateway
- **Cost Optimization**: Unified API with spend monitoring and budget controls

### 🌍 **Internationalization & Multi-Currency**
- **Language Support**: English and Spanish with full translations
- **Currency Conversion**: USD and ARS (Argentine Peso) support
- **Real-time Rates**: DolarAPI integration for accurate ARS conversions
- **Localized Formatting**: Currency and number formatting per locale

### 🎨 **Modern UI/UX**
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Dark/Light Themes**: Automatic theme switching with system preference detection
- **Interactive Components**: Collapsible sections, hover effects, and smooth animations
- **Accessibility**: ARIA labels, keyboard navigation, and screen reader support

## 🛠️ Technology Stack

### **Frontend Framework**
- **React 18**: Modern React with hooks and functional components
- **TypeScript**: Full type safety and enhanced developer experience
- **Vite**: Fast build tool and development server

### **Styling & UI**
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Beautiful, customizable icons
- **Responsive Design**: Mobile-first responsive layout

### **State Management**
- **React Context API**: Lightweight state management for app-wide data
- **Custom Hooks**: Reusable logic for currency, language, and theme management

### **External APIs**
- **DolarAPI**: Real-time Argentine Peso exchange rates
- **Open Exchange Rates**: Multi-currency conversion service
- **Vercel AI Gateway**: Unified AI API with OpenAI GPT-4o-mini for investment analysis

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.tsx      # Main navigation header
│   ├── Dashboard.tsx   # Portfolio overview dashboard
│   ├── InvestmentCard.tsx # Individual investment display
│   ├── PortfolioStats.tsx # Portfolio allocation statistics
│   ├── BondCashFlow.tsx   # Bond cash flow analysis
│   ├── CurrencyDropdown.tsx # Currency selection dropdown
│   ├── LanguageToggle.tsx   # Language switcher
│   └── ThemeToggle.tsx     # Theme switcher
├── contexts/           # React context providers
│   ├── LanguageContext.tsx # Internationalization context
│   ├── ThemeContext.tsx    # Theme management context
│   └── CurrencyContext.tsx # Currency conversion context
├── pages/              # Page components
│   ├── BondAnalysisPage.tsx # Dedicated bond analysis page
│   └── ChatPage.tsx    # AI investment assistant page
├── services/           # Business logic and API services
│   ├── currencyService.ts   # Currency conversion service
│   └── bondAnalysisService.ts # Bond analysis algorithms
├── types/              # TypeScript type definitions
│   └── investment.ts   # Investment and portfolio types
├── api/                # Vercel serverless functions
│   └── chat.js         # AI chat API endpoint
└── App.tsx             # Main application component
```

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18.0 or higher
- npm or yarn package manager

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/fedegualdrini/investment-portfolio-tracker-.git
   cd investment-portfolio-tracker-
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit .env and add your OpenAI API key
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Start development server**
   ```bash
   # Start both frontend and backend servers
   npm run dev:full
   
   # Or start them separately:
   # Terminal 1: npm run server
   # Terminal 2: npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

### **Build for Production**
```bash
npm run build
npm run preview
```

## 📖 Usage Guide

### **Adding Investments**

1. **Click "Add Investment"** in the header
2. **Fill in investment details**:
   - Symbol and name
   - Investment type (stock, bond, crypto, etc.)
   - Quantity and purchase price
   - Purchase date
   - Additional details based on type

3. **For Bonds**: Include fixed yield, payment frequency, and maturity date
4. **Click "Add"** to save

### **Portfolio Management**

- **View Overview**: Dashboard shows total value, gains/losses, and performance
- **Update Prices**: Click refresh button to fetch latest market prices
- **Export Data**: Download portfolio as JSON file
- **Import Data**: Upload previously exported portfolio files

### **Bond Analysis**

1. **Click "Bond Analysis"** in the header
2. **View Summary**: Total bond value, gains/losses, and annual income
3. **Cash Flow**: Monthly, quarterly, and annual income projections
4. **Payment Schedule**: Upcoming coupon payments and maturity dates

### **AI Investment Assistant**

1. **Click "Chat"** in the header
2. **Ask Questions**: Get personalized advice about your portfolio
3. **Bond Insights**: Ask about upcoming coupon payments and bond analysis
4. **Market Context**: AI has access to your real-time portfolio data and market information
5. **Multi-language**: Switch between English and Spanish for AI responses

### **Currency & Language**

- **Currency**: Use dropdown to switch between USD and ARS
- **Language**: Toggle between English and Spanish
- **Theme**: Switch between light, dark, and system themes

## 🔧 Configuration

### **Environment Variables**

Create a `.env` file in the root directory:

```env
# API Keys (optional - fallbacks available)
VITE_CURRENCY_API_KEY=your_open_exchange_rate_key
VITE_DOLAR_API_URL=https://dolarapi.com/v1/dolares/oficial

# AI Gateway Configuration (required for AI features)
AI_GATEWAY_API_KEY=your_ai_gateway_api_key

# App Configuration
VITE_APP_NAME=Investment Portfolio Tracker
VITE_DEFAULT_CURRENCY=USD
VITE_DEFAULT_LANGUAGE=en
```

### **Customization**

#### **Adding New Currencies**
1. Update `CurrencyContext.tsx` with new currency type
2. Add conversion logic in `convertForDisplay` method
3. Update `CurrencyDropdown.tsx` with new currency options
4. Add translations in `LanguageContext.tsx`

#### **Adding New Languages**
1. Add new language type in `LanguageContext.tsx`
2. Create translation dictionary for new language
3. Update language toggle component

#### **Adding New Investment Types**
1. Extend `InvestmentType` in `types/investment.ts`
2. Update form validation in `AddInvestmentForm.tsx`
3. Add type-specific logic in relevant components

## 📊 API Integration

### **Currency Conversion**

#### **DolarAPI (ARS)**
- **Endpoint**: `https://dolarapi.com/v1/dolares/oficial`
- **Rate**: Uses "venta" (sell) rate for conversions
- **Fallback**: 1 USD = 1375 ARS (approximate)

#### **Open Exchange Rates**
- **Endpoint**: `https://open.er-api.com/v6/latest/{currency}`
- **Supported**: EUR, GBP, JPY, CAD, AUD, CHF, CNY, INR, BRL, MXN
- **Caching**: 1-hour cache for performance

### **Data Flow**

```
User Input → Form Validation → Investment Creation → Portfolio Update
     ↓
Portfolio State → Context Providers → Component Re-renders
     ↓
Currency Conversion → Display Formatting → User Interface
```

## 🧪 Testing

### **Run Tests**
```bash
npm run test
```

### **Test Coverage**
```bash
npm run test:coverage
```

### **E2E Testing**
```bash
npm run test:e2e
```

## 🚀 Deployment

### **Build Optimization**
```bash
npm run build
```

### **Deploy to Vercel**

#### **Method 1: Vercel Dashboard (Recommended)**

1. **Connect your GitHub repository**
   - Go to [vercel.com](https://vercel.com) and log in
   - Click **"New Project"**
   - Import your GitHub repository

2. **Set up Environment Variables**
   - In your Vercel project dashboard, go to **Settings** → **Environment Variables**
   - Add the following variables:
     - **Name**: `AI_GATEWAY_API_KEY`
     - **Value**: `your_ai_gateway_api_key_here` (get this from Vercel AI Gateway dashboard)
     - **Environment**: Select all (Production, Preview, Development)
   - Click **Save**

3. **Deploy**
   - Vercel will automatically deploy your project
   - Your app will be available at `https://your-project-name.vercel.app`

#### **Method 2: Vercel CLI**

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Set environment variable
vercel env add OPENAI_API_KEY
# Enter your API key when prompted
# Select all environments (Production, Preview, Development)

# Deploy
vercel --prod
```

#### **Method 3: GitHub Integration**

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Add AI chat functionality and secure API key management"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click **"New Project"**
   - Select your GitHub repository
   - Vercel will automatically detect it's a Vite project

3. **Configure Environment Variables**
   - In Vercel dashboard, go to **Settings** → **Environment Variables**
   - Add `OPENAI_API_KEY` with your actual API key
   - Select all environments

4. **Deploy**
   - Vercel will automatically build and deploy your project
   - Future pushes to your main branch will trigger automatic deployments

📖 **For detailed deployment instructions, see [DEPLOYMENT.md](docs/DEPLOYMENT.md)**

### **Deploy to Netlify**
```bash
npm run build
# Upload dist/ folder to Netlify
```

## 🤝 Contributing

### **Development Workflow**

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Make changes** and commit: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Create Pull Request**

### **Code Standards**

- **TypeScript**: Strict mode enabled
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting
- **Conventional Commits**: Standardized commit messages

### **Testing Requirements**

- **Unit Tests**: Minimum 80% coverage
- **Integration Tests**: Critical user flows
- **E2E Tests**: Main user journeys

## 📝 API Documentation

### **Investment Types**

```typescript
interface Investment {
  id: string;
  symbol: string;
  name: string;
  type: InvestmentType;
  quantity: number;
  purchasePrice: number;
  purchaseDate: string;
  currentPrice?: number;
  currency?: string;
  fixedYield?: number;
  paymentFrequency?: PaymentFrequency;
  maturityDate?: string;
  faceValue?: number;
  lastPaymentDate?: string;
  nextPaymentDate?: string;
}
```

### **Portfolio Summary**

```typescript
interface PortfolioSummary {
  totalValue: number;
  totalInvested: number;
  totalGainLoss: number;
  totalGainLossPercentage: number;
  investmentsByType: Record<InvestmentType, number>;
}
```

### **Currency Context**

```typescript
interface CurrencyContextType {
  displayCurrency: DisplayCurrency;
  setDisplayCurrency: (currency: DisplayCurrency) => void;
  formatCurrency: (amount: number, currency?: string) => string;
  convertForDisplay: (usdAmount: number) => number;
  getCurrentARSRate: () => Promise<number>;
}
```

## 🔒 Security Considerations

### **Data Privacy**
- **Local Storage**: Portfolio data stored locally in browser
- **No External Storage**: Investment data never sent to external servers
- **API Keys**: Optional and stored in environment variables

### **Input Validation**
- **Form Validation**: Client-side validation for all inputs
- **Type Safety**: TypeScript prevents invalid data types
- **Sanitization**: Input sanitization for security

## 📈 Performance Optimization

### **React Optimizations**
- **Memoization**: `useMemo` and `useCallback` for expensive calculations
- **Lazy Loading**: Component lazy loading for better initial load
- **Context Optimization**: Minimal re-renders with context providers

### **Bundle Optimization**
- **Tree Shaking**: Unused code elimination
- **Code Splitting**: Route-based code splitting
- **Asset Optimization**: Optimized images and fonts

## 🐛 Troubleshooting

### **Common Issues**

#### **Currency Not Converting**
- Check internet connection for API calls
- Verify DolarAPI endpoint accessibility
- Check browser console for errors

#### **Bond Analysis Not Working**
- Ensure bonds have fixed yield values
- Check maturity date format (YYYY-MM-DD)
- Verify payment frequency selection

#### **Language Not Switching**
- Clear browser cache and local storage
- Check for JavaScript errors in console
- Verify translation keys exist

### **Debug Mode**

Enable debug mode in bond analysis:
1. Go to Bond Analysis page
2. Click debug button
3. Check browser console for detailed logs

## 📚 Additional Resources

### **Documentation**
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

### **APIs**
- [DolarAPI Documentation](https://dolarapi.com/)
- [Open Exchange Rates](https://openexchangerates.org/)

### **Tools**
- [Vite Documentation](https://vitejs.dev/)
- [Lucide Icons](https://lucide.dev/)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **DolarAPI**: For providing accurate Argentine Peso exchange rates
- **Open Exchange Rates**: For multi-currency conversion services
- **Lucide**: For beautiful, customizable icons
- **Tailwind CSS**: For the utility-first CSS framework

## 📞 Support

### **Issues & Questions**
- **GitHub Issues**: [Create an issue](https://github.com/fedegualdrini/investment-portfolio-tracker-/issues)
- **Discussions**: [Join discussions](https://github.com/fedegualdrini/investment-portfolio-tracker-/discussions)
- **Email**: fedegualdrini@github.com

### **Feature Requests**
- **GitHub Discussions**: Share ideas and suggestions
- **Roadmap**: Check planned features and timeline

---

**Made with ❤️ for investors worldwide**
