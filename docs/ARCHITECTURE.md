# 🏗️ Technical Architecture

## Overview

The Investment Portfolio Tracker is built using a modern React architecture with TypeScript, leveraging React Context API for state management and a service-oriented approach for business logic. The application follows a component-based architecture with clear separation of concerns.

## 🏛️ Architecture Patterns

### **Component Architecture**
- **Functional Components**: All components use React hooks and functional patterns
- **Composition over Inheritance**: Reusable components composed together
- **Single Responsibility**: Each component has a single, well-defined purpose

### **State Management**
- **React Context API**: Lightweight state management for app-wide data
- **Local State**: Component-specific state managed with `useState`
- **Derived State**: Computed values using `useMemo` and `useCallback`

### **Data Flow**
```
User Action → Event Handler → State Update → Context Update → Component Re-render
     ↓
Service Layer → API Calls → Data Processing → State Update
```

## 🧩 Component Hierarchy

```
App
├── ThemeProvider
├── LanguageProvider
├── CurrencyProvider
├── Header
│   ├── CurrencyDropdown
│   ├── LanguageToggle
│   ├── ThemeToggle
│   └── Action Buttons
├── Main Content
│   ├── Dashboard (Portfolio Overview)
│   │   ├── Portfolio Summary Cards
│   │   └── Investment Grid
│   │       └── InvestmentCard[]
│   ├── PortfolioStats (Sidebar)
│   ├── BondAnalysisPage (Conditional)
│   │   └── BondCashFlow
│   └── ChatPage (Conditional)
│       ├── Chat Interface
│       ├── Message History
│       └── AI Response Display
└── Modals
    ├── AddInvestmentForm
    └── EditInvestmentForm
```

## 🛠️ Utility Functions & Modular Architecture

### **Utility Functions Structure**
```
src/utils/
├── paymentFrequencyUtils.ts    # Bond payment frequency calculations
├── portfolioCalculations.ts    # Portfolio summary and filtering
├── formValidation.ts          # Centralized form validation
└── investmentFilters.ts       # Investment filtering utilities
```

### **Shared Constants**
```
src/constants/
├── investmentTypes.ts         # Investment type definitions
└── paymentFrequencies.ts      # Payment frequency constants
```

### **Key Benefits of Modularization**
- **Code Reusability**: Common logic shared across components
- **Maintainability**: Centralized business logic easier to update
- **Type Safety**: Consistent TypeScript interfaces across utilities
- **Testing**: Isolated functions easier to unit test
- **Performance**: Reduced code duplication and bundle size

### **Utility Function Examples**

#### **Payment Frequency Utils**
```typescript
// Calculate payments per year based on frequency
export function getPaymentsPerYear(frequency: PaymentFrequency): number

// Calculate payment amount for bonds
export function calculatePaymentAmount(faceValue: number, annualYield: number, frequency: PaymentFrequency): number
```

#### **Portfolio Calculations**
```typescript
// Calculate complete portfolio summary
export function calculatePortfolioSummary(investments: Investment[]): PortfolioSummary

// Filter investments by type
export function getBonds(investments: Investment[]): Investment[]
export function getStocks(investments: Investment[]): Investment[]
```

#### **Form Validation**
```typescript
// Centralized investment form validation
export function validateInvestmentForm(formData: InvestmentFormData, requiredPaymentField: string): ValidationErrors
```

## 🔄 Context Architecture

### **Theme Context**
```typescript
interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}
```

**Responsibilities:**
- Theme state management (light/dark/system)
- CSS class application
- System preference detection

### **Language Context**
```typescript
interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}
```

**Responsibilities:**
- Internationalization state
- Translation lookup
- Language switching

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

**Responsibilities:**
- Display currency selection
- Currency conversion logic
- Formatting and localization

## 🛠️ Service Layer

### **Currency Service**
```typescript
class CurrencyService {
  private cache: Record<string, CurrencyRate>;
  private cacheExpiry: number;
  
  async getExchangeRate(fromCurrency: string): Promise<number>;
  async convertToUSD(amount: number, fromCurrency: string): Promise<number>;
  async convertFromUSD(amount: number, toCurrency: string): Promise<number>;
  private async getARSExchangeRate(): Promise<number>;
}
```

**Features:**
- Multi-currency support
- Caching with expiry
- Fallback rates
- DolarAPI integration for ARS

### **Bond Analysis Service**
```typescript
class BondAnalysisService {
  private cache: Map<string, any>;
  
  analyzeBond(investment: Investment): BondAnalysis;
  generatePaymentSchedule(investment: Investment, months: number): PaymentEvent[];
  detectPaymentFrequency(investment: Investment): PaymentFrequency;
  calculateNextPayment(investment: Investment): Date;
}
```

**Features:**
- Smart payment frequency detection
- Payment schedule generation
- Maturity calculations
- Yield analysis

## 📊 Data Models

### **Core Types**
```typescript
type InvestmentType = 'stock' | 'bond' | 'etf' | 'crypto' | 'commodity' | 'cash' | 'other';
type PaymentFrequency = 'monthly' | 'quarterly' | 'semi-annual' | 'annual' | 'zero-coupon';
type DisplayCurrency = 'USD' | 'ARS';
type Language = 'en' | 'es';
type Theme = 'light' | 'dark' | 'system';
```

### **Investment Interface**
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
  
  // Bond-specific properties
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

## 🔌 API Integration

### **External APIs**

#### **DolarAPI (ARS Conversion)**
```typescript
interface ARSRateDetails {
  compra: number;      // Buy rate (ARS per USD)
  venta: number;       // Sell rate (ARS per USD)
  nombre: string;      // Rate name
  fechaActualizacion: string; // Last update
}
```

**Endpoint**: `https://dolarapi.com/v1/dolares/oficial`
**Usage**: Real-time ARS exchange rates
**Fallback**: 1 USD = 1375 ARS

#### **Open Exchange Rates**
```typescript
interface ExchangeRateResponse {
  result: string;
  rates: Record<string, number>;
  base_code: string;
  time_last_update_utc: string;
}
```

**Endpoint**: `https://open.er-api.com/v6/latest/{currency}`
**Usage**: Multi-currency conversion
**Caching**: 1-hour cache

#### **OpenAI API (AI Assistant)**
```typescript
interface ChatRequest {
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  portfolioContext: PortfolioContext;
}
```

**Endpoint**: `https://api.openai.com/v1/chat/completions`
**Usage**: AI-powered investment assistance
**Model**: GPT-4o-mini
**Context**: Full portfolio data and market information

### **Data Flow for Currency Conversion**
```
User selects ARS → CurrencyContext.setDisplayCurrency('ARS')
     ↓
All USD amounts → convertForDisplay() → multiply by ARS rate
     ↓
formatCurrency() → Intl.NumberFormat('es-AR', { currency: 'ARS' })
     ↓
Display in ARS format
```

## 🎨 UI/UX Architecture

### **Design System**
- **Tailwind CSS**: Utility-first CSS framework
- **Color Palette**: Consistent color scheme with dark/light variants
- **Typography**: Hierarchical text sizing and weights
- **Spacing**: Consistent spacing scale (4px base unit)

### **Responsive Design**
```css
/* Mobile First Approach */
.container {
  @apply px-4;           /* Mobile: 16px */
  @apply sm:px-6;        /* Small: 24px */
  @apply lg:px-8;        /* Large: 32px */
}
```

### **Component States**
- **Default**: Base styling
- **Hover**: Interactive feedback
- **Active**: Pressed state
- **Disabled**: Non-interactive state
- **Loading**: Async operation state

## 🔒 Security Architecture

### **Data Privacy**
- **Local Storage**: All data stored locally in browser
- **No External Storage**: Investment data never leaves user's device
- **API Keys**: Optional and stored in environment variables

### **Input Validation**
```typescript
// Form validation example
const validateInvestment = (data: Partial<Investment>): ValidationResult => {
  const errors: string[] = [];
  
  if (!data.symbol?.trim()) errors.push('Symbol is required');
  if (!data.name?.trim()) errors.push('Name is required');
  if (data.quantity <= 0) errors.push('Quantity must be positive');
  if (data.purchasePrice <= 0) errors.push('Price must be positive');
  
  return { isValid: errors.length === 0, errors };
};
```

### **Type Safety**
- **TypeScript Strict Mode**: Prevents runtime type errors
- **Interface Validation**: Ensures data structure integrity
- **Generic Types**: Reusable type definitions

## 📈 Performance Architecture

### **React Optimizations**
```typescript
// Memoization for expensive calculations
const portfolioSummary = useMemo(() => {
  return calculatePortfolioSummary(investments);
}, [investments]);

// Callback optimization
const handleInvestmentUpdate = useCallback((id: string, updates: Partial<Investment>) => {
  setInvestments(prev => prev.map(inv => 
    inv.id === id ? { ...inv, ...updates } : inv
  ));
}, []);
```

### **Bundle Optimization**
- **Tree Shaking**: Unused code elimination
- **Code Splitting**: Route-based lazy loading
- **Asset Optimization**: Optimized images and fonts

### **Caching Strategy**
```typescript
// Currency rate caching
private isCacheValid(lastUpdated: string): boolean {
  const lastUpdate = new Date(lastUpdated).getTime();
  const now = Date.now();
  return (now - lastUpdate) < this.cacheExpiry; // 1 hour
}
```

## 🧪 Testing Architecture

### **Testing Strategy**
- **Unit Tests**: Individual component and function testing
- **Integration Tests**: Component interaction testing
- **E2E Tests**: User journey testing

### **Test Structure**
```
tests/
├── components/          # Component tests
├── services/           # Service layer tests
├── utils/              # Utility function tests
└── e2e/               # End-to-end tests
```

### **Mocking Strategy**
```typescript
// API mocking
jest.mock('../services/currencyService', () => ({
  CurrencyService: jest.fn().mockImplementation(() => ({
    getExchangeRate: jest.fn().mockResolvedValue(0.0012),
    convertToUSD: jest.fn().mockResolvedValue(1000),
  }))
}));
```

## 🚀 Deployment Architecture

### **Build Process**
```bash
# Development
npm run dev          # Vite dev server

# Production Build
npm run build        # Optimized production build
npm run preview      # Preview production build
```

### **Environment Configuration**
```typescript
// Environment variables
const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'https://api.example.com',
  defaultCurrency: import.meta.env.VITE_DEFAULT_CURRENCY || 'USD',
  defaultLanguage: import.meta.env.VITE_DEFAULT_LANGUAGE || 'en',
};
```

### **Deployment Targets**
- **Vercel**: Serverless deployment
- **Netlify**: Static site hosting
- **GitHub Pages**: Free hosting for open source
- **Docker**: Containerized deployment

## 🔄 State Management Flow

### **Portfolio State Flow**
```
User adds investment → AddInvestmentForm → App state update
     ↓
Portfolio recalculation → Summary update → Dashboard re-render
     ↓
Stats update → PortfolioStats re-render
     ↓
Bond analysis update → BondCashFlow re-render (if applicable)
```

### **Currency Change Flow**
```
User changes currency → CurrencyDropdown → CurrencyContext update
     ↓
All components using formatCurrency → Re-render with new currency
     ↓
Amount conversion → Display update
```

### **Language Change Flow**
```
User changes language → LanguageToggle → LanguageContext update
     ↓
All components using t() → Re-render with new language
     ↓
Text translation → UI update
```

## 🔧 Configuration Management

### **Feature Flags**
```typescript
const features = {
  bondAnalysis: true,
  multiCurrency: true,
  internationalization: true,
  darkMode: true,
  exportImport: true,
};
```

### **API Configuration**
```typescript
const apiConfig = {
  currency: {
    baseUrl: 'https://open.er-api.com/v6/latest',
    timeout: 5000,
    retries: 3,
  },
  dolarAPI: {
    url: 'https://dolarapi.com/v1/dolares/oficial',
    timeout: 3000,
  },
};
```

## 📊 Monitoring & Analytics

### **Performance Monitoring**
- **Bundle Size**: Track JavaScript bundle size
- **Load Time**: Monitor initial page load performance
- **Runtime Performance**: Track component render times

### **Error Tracking**
```typescript
// Global error boundary
class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Application Error:', error, errorInfo);
    // Send to error tracking service
  }
}
```

### **User Analytics**
- **Feature Usage**: Track which features are most used
- **Performance Metrics**: Monitor user experience metrics
- **Error Rates**: Track application stability

## 🔮 Future Architecture Considerations

### **Scalability Improvements**
- **State Management**: Consider Redux Toolkit for complex state
- **API Layer**: Implement GraphQL for flexible data fetching
- **Caching**: Add service worker for offline support

### **Performance Enhancements**
- **Virtual Scrolling**: For large investment lists
- **Lazy Loading**: Component and route-based code splitting
- **Web Workers**: For heavy calculations

### **Architecture Evolution**
- **Micro-frontends**: Split into smaller, focused applications
- **Server-side Rendering**: For SEO and performance
- **Progressive Web App**: Offline capabilities and mobile app-like experience
