# 🔌 API Documentation

## Overview

The Investment Portfolio Tracker integrates with several external APIs for currency conversion and financial data. This document outlines all API integrations, endpoints, and data structures.

## 🌍 Currency Conversion APIs

### **DolarAPI - Argentine Peso (ARS)**

#### **Endpoint**
```
GET https://dolarapi.com/v1/dolares/oficial
```

#### **Response Format**
```json
{
  "moneda": "USD",
  "casa": "oficial",
  "nombre": "Oficial",
  "compra": 1335,
  "venta": 1375,
  "fechaActualizacion": "2025-01-02T15:04:00.000Z"
}
```

#### **Field Descriptions**
- **moneda**: Base currency (always "USD")
- **casa**: Exchange house (always "oficial")
- **nombre**: Rate name (always "Oficial")
- **compra**: Buy rate (ARS per USD)
- **venta**: Sell rate (ARS per USD) - **Used for conversions**
- **fechaActualizacion**: Last update timestamp

#### **Usage in Application**
```typescript
// Fetch ARS rate
const response = await fetch('https://dolarapi.com/v1/dolares/oficial');
const data = await response.json();

// Convert USD to ARS using sell rate
const usdPerARS = 1 / data.venta; // 1 USD = 0.00073 ARS
const arsAmount = usdAmount * data.venta; // USD 100 = ARS 137,500
```

#### **Error Handling**
```typescript
try {
  const response = await fetch('https://dolarapi.com/v1/dolares/oficial');
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return data.venta;
} catch (error) {
  console.error('Error fetching ARS rate:', error);
  // Fallback to approximate rate: 1 USD = 1375 ARS
  return 1375;
}
```

### **Open Exchange Rates - Multi-Currency**

#### **Endpoint**
```
GET https://open.er-api.com/v6/latest/{currency}
```

#### **Supported Currencies**
- EUR (Euro)
- GBP (British Pound)
- JPY (Japanese Yen)
- CAD (Canadian Dollar)
- AUD (Australian Dollar)
- CHF (Swiss Franc)
- CNY (Chinese Yuan)
- INR (Indian Rupee)
- BRL (Brazilian Real)
- MXN (Mexican Peso)

#### **Response Format**
```json
{
  "result": "success",
  "base_code": "EUR",
  "time_last_update_utc": "2025-01-02 15:04:00+00:00",
  "rates": {
    "USD": 1.08,
    "EUR": 1.0,
    "GBP": 0.85,
    "JPY": 158.76
  }
}
```

#### **Usage Example**
```typescript
// Fetch EUR to USD rate
const response = await fetch('https://open.er-api.com/v6/latest/EUR');
const data = await response.json();

if (data.result === 'success' && data.rates.USD) {
  const eurToUsd = data.rates.USD; // 1 EUR = 1.08 USD
  return eurToUsd;
}
```

## 🏗️ Internal Service APIs

### **Currency Service**

#### **Class Definition**
```typescript
export class CurrencyService {
  private baseUrl = 'https://open.er-api.com/v6/latest';
  private cache: Record<string, CurrencyRate> = {};
  private cacheExpiry = 1000 * 60 * 60; // 1 hour
}
```

#### **Public Methods**

##### **getExchangeRate(fromCurrency: string): Promise<number>**
Fetches exchange rate from specified currency to USD.

```typescript
const currencyService = new CurrencyService();
const usdRate = await currencyService.getExchangeRate('EUR'); // Returns 1.08
```

**Parameters:**
- `fromCurrency`: Source currency code (e.g., 'EUR', 'GBP', 'ARS')

**Returns:**
- `Promise<number>`: Exchange rate (amount in USD for 1 unit of source currency)

**Special Handling:**
- **USD**: Returns 1 (no conversion needed)
- **ARS**: Uses DolarAPI for real-time rates
- **Other currencies**: Uses Open Exchange Rates API

##### **convertToUSD(amount: number, fromCurrency: string): Promise<number>**
Converts amount from source currency to USD.

```typescript
const usdAmount = await currencyService.convertToUSD(100, 'EUR'); // Returns 108
```

**Parameters:**
- `amount`: Amount in source currency
- `fromCurrency`: Source currency code

**Returns:**
- `Promise<number>`: Amount in USD

##### **convertFromUSD(amount: number, toCurrency: string): Promise<number>**
Converts amount from USD to target currency.

```typescript
const eurAmount = await currencyService.convertFromUSD(108, 'EUR'); // Returns 100
```

**Parameters:**
- `amount`: Amount in USD
- `toCurrency`: Target currency code

**Returns:**
- `Promise<number>`: Amount in target currency

##### **getARSRateDetails(): Promise<ARSRateDetails | null>**
Fetches detailed ARS rate information from DolarAPI.

```typescript
const arsDetails = await currencyService.getARSRateDetails();
if (arsDetails) {
  console.log(`Buy: ${arsDetails.compra}, Sell: ${arsDetails.venta}`);
}
```

**Returns:**
- `Promise<ARSRateDetails | null>`: Detailed rate information or null if failed

##### **getCachedRates(): Record<string, CurrencyRate>**
Returns all cached exchange rates.

```typescript
const cachedRates = currencyService.getCachedRates();
console.log('Cached currencies:', Object.keys(cachedRates));
```

**Returns:**
- `Record<string, CurrencyRate>`: Object with all cached rates

##### **clearCache(): void**
Clears all cached exchange rates.

```typescript
currencyService.clearCache(); // Forces fresh API calls
```

#### **Private Methods**

##### **getARSExchangeRate(): Promise<number>**
Internal method for fetching ARS rates from DolarAPI.

```typescript
private async getARSExchangeRate(): Promise<number> {
  try {
    const response = await fetch('https://dolarapi.com/v1/dolares/oficial');
    const data = await response.json();
    return 1 / data.venta; // Convert to USD per ARS
  } catch (error) {
    return 0.00073; // Fallback rate
  }
}
```

##### **isCacheValid(lastUpdated: string): boolean**
Checks if cached rate is still valid.

```typescript
private isCacheValid(lastUpdated: string): boolean {
  const lastUpdate = new Date(lastUpdated).getTime();
  const now = Date.now();
  return (now - lastUpdate) < this.cacheExpiry;
}
```

### **Bond Analysis Service**

#### **Class Definition**
```typescript
export class BondAnalysisService {
  private cache: Map<string, any> = new Map();
  private cacheExpiry = 1000 * 60 * 60; // 1 hour
}
```

#### **Public Methods**

##### **analyzeBond(investment: Investment): BondAnalysis**
Analyzes a bond investment and returns comprehensive analysis.

```typescript
const bondService = new BondAnalysisService();
const analysis = bondService.analyzeBond(bondInvestment);
```

**Parameters:**
- `investment`: Bond investment object

**Returns:**
- `BondAnalysis`: Object containing bond analysis results

**Analysis Results:**
```typescript
interface BondAnalysis {
  nextPaymentDate: string;
  paymentAmount: number;
  totalAnnualPayments: number;
  confidence: number;
  detectedFrequency: PaymentFrequency;
  maturityDate: Date;
  daysUntilMaturity: number;
  annualYield: number;
}
```

##### **generatePaymentSchedule(investment: Investment, months: number): PaymentEvent[]**
Generates payment schedule for specified number of months.

```typescript
const schedule = bondService.generatePaymentSchedule(bondInvestment, 12);
```

**Parameters:**
- `investment`: Bond investment object
- `months`: Number of months to generate schedule for

**Returns:**
- `PaymentEvent[]`: Array of payment events

**Payment Event Structure:**
```typescript
interface PaymentEvent {
  date: string;
  amount: number;
  type: 'coupon' | 'maturity';
  description: string;
}
```

##### **detectPaymentFrequency(investment: Investment): PaymentFrequency**
Automatically detects bond payment frequency.

```typescript
const frequency = bondService.detectPaymentFrequency(bondInvestment);
```

**Returns:**
- `PaymentFrequency`: Detected payment frequency

**Detection Logic:**
1. **User Specified**: If user provided frequency, use that
2. **Maturity Date Analysis**: Analyze maturity date patterns
3. **Market Standards**: Apply common bond frequency rules
4. **Confidence Scoring**: Rate detection confidence

##### **calculateNextPayment(investment: Investment): Date**
Calculates the next payment date for a bond.

```typescript
const nextPayment = bondService.calculateNextPayment(bondInvestment);
```

**Returns:**
- `Date`: Next payment date

**Calculation Logic:**
1. **Last Payment Date**: Use if provided
2. **Purchase Date**: Start from purchase date
3. **Frequency**: Apply payment frequency rules
4. **Maturity**: Ensure not past maturity

##### **clearAllCache(): void**
Clears all cached bond analysis data.

```typescript
bondService.clearAllCache(); // Forces fresh calculations
```

## 📊 Data Models

### **Currency Rate Interface**
```typescript
export interface CurrencyRate {
  currency: string;
  rate: number;
  lastUpdated: string;
  source?: string; // Track the source of the rate
}
```

### **ARS Rate Details Interface**
```typescript
export interface ARSRateDetails {
  compra: number; // Buy rate (ARS per USD)
  venta: number;  // Sell rate (ARS per USD)
  nombre: string; // Rate name (e.g., "Oficial")
  fechaActualizacion: string; // Last update timestamp
}
```

### **Payment Event Interface**
```typescript
export interface PaymentEvent {
  date: string;
  amount: number;
  type: 'coupon' | 'maturity';
  description: string;
}
```

### **Bond Analysis Interface**
```typescript
export interface BondAnalysis {
  nextPaymentDate: string;
  paymentAmount: number;
  totalAnnualPayments: number;
  confidence: number;
  detectedFrequency: PaymentFrequency;
  maturityDate: Date;
  daysUntilMaturity: number;
  annualYield: number;
}
```

## 🔄 API Integration Patterns

### **Error Handling Strategy**
```typescript
// Three-tier error handling
try {
  // Primary API call
  const data = await primaryAPI();
  return data;
} catch (error) {
  try {
    // Fallback API call
    const fallbackData = await fallbackAPI();
    return fallbackData;
  } catch (fallbackError) {
    // Hardcoded fallback values
    return getHardcodedFallback();
  }
}
```

### **Caching Strategy**
```typescript
// Cache with expiry
const cacheKey = `${currency}_${Date.now()}`;
const cached = this.cache[cacheKey];

if (cached && this.isCacheValid(cached.lastUpdated)) {
  return cached.rate; // Use cached value
}

// Fetch fresh data and cache
const freshRate = await this.fetchFromAPI();
this.cache[cacheKey] = {
  rate: freshRate,
  lastUpdated: new Date().toISOString()
};
```

### **Rate Limiting**
```typescript
// Simple rate limiting
const lastCall = this.lastAPICall.get(currency);
const now = Date.now();

if (lastCall && (now - lastCall) < this.rateLimit) {
  throw new Error('Rate limit exceeded');
}

this.lastAPICall.set(currency, now);
```

## 🧪 Testing APIs

### **Mock API Responses**
```typescript
// Mock DolarAPI response
const mockDolarAPIResponse = {
  moneda: "USD",
  casa: "oficial",
  nombre: "Oficial",
  compra: 1335,
  venta: 1375,
  fechaActualizacion: "2025-01-02T15:04:00.000Z"
};

// Mock Open Exchange Rates response
const mockExchangeRatesResponse = {
  result: "success",
  base_code: "EUR",
  time_last_update_utc: "2025-01-02 15:04:00+00:00",
  rates: {
    USD: 1.08,
    EUR: 1.0,
    GBP: 0.85
  }
};
```

### **API Testing Utilities**
```typescript
// Test helper for API calls
export const testAPI = {
  mockFetch: (response: any, status: number = 200) => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: status === 200,
      status,
      json: async () => response
    });
  },
  
  mockFetchError: (error: string) => {
    global.fetch = jest.fn().mockRejectedValue(new Error(error));
  },
  
  clearMocks: () => {
    jest.clearAllMocks();
  }
};
```

## 🔒 Security Considerations

### **API Key Management**
```typescript
// Environment variable configuration
const apiKey = import.meta.env.VITE_CURRENCY_API_KEY;
const apiUrl = import.meta.env.VITE_DOLAR_API_URL;

// Secure API calls
const headers = apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {};
const response = await fetch(apiUrl, { headers });
```

### **Input Validation**
```typescript
// Validate currency codes
const validateCurrency = (currency: string): boolean => {
  const validCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'ARS'];
  return validCurrencies.includes(currency.toUpperCase());
};

// Validate amounts
const validateAmount = (amount: number): boolean => {
  return typeof amount === 'number' && amount > 0 && isFinite(amount);
};
```

### **Rate Limiting**
```typescript
// Implement rate limiting
class RateLimiter {
  private calls: Map<string, number[]> = new Map();
  private maxCalls = 100; // Max calls per hour
  private windowMs = 60 * 60 * 1000; // 1 hour
  
  canCall(api: string): boolean {
    const now = Date.now();
    const calls = this.calls.get(api) || [];
    
    // Remove old calls outside window
    const recentCalls = calls.filter(time => now - time < this.windowMs);
    
    if (recentCalls.length >= this.maxCalls) {
      return false;
    }
    
    recentCalls.push(now);
    this.calls.set(api, recentCalls);
    return true;
  }
}
```

## 📈 Performance Optimization

### **Batch API Calls**
```typescript
// Batch multiple currency requests
async batchGetRates(currencies: string[]): Promise<Record<string, number>> {
  const promises = currencies.map(currency => 
    this.getExchangeRate(currency)
  );
  
  const rates = await Promise.all(promises);
  return currencies.reduce((acc, currency, index) => {
    acc[currency] = rates[index];
    return acc;
  }, {} as Record<string, number>);
}
```

### **Connection Pooling**
```typescript
// Reuse fetch connections
class APIConnectionPool {
  private connections = new Map<string, AbortController>();
  
  async fetch(url: string, options: RequestInit = {}) {
    const controller = new AbortController();
    this.connections.set(url, controller);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      return response;
    } finally {
      this.connections.delete(url);
    }
  }
  
  cancelAll() {
    this.connections.forEach(controller => controller.abort());
    this.connections.clear();
  }
}
```

## 🔮 Future API Enhancements

### **WebSocket Integration**
```typescript
// Real-time rate updates
class RealTimeRates {
  private ws: WebSocket;
  
  constructor() {
    this.ws = new WebSocket('wss://api.example.com/rates');
    this.ws.onmessage = this.handleRateUpdate.bind(this);
  }
  
  private handleRateUpdate(event: MessageEvent) {
    const rate = JSON.parse(event.data);
    this.updateRate(rate);
  }
}
```

### **GraphQL Integration**
```typescript
// GraphQL query for rates
const GET_RATES = `
  query GetRates($currencies: [String!]!) {
    rates(currencies: $currencies) {
      currency
      rate
      lastUpdated
      source
    }
  }
`;

const rates = await graphqlClient.request(GET_RATES, {
  currencies: ['EUR', 'GBP', 'JPY']
});
```

### **Service Worker Caching**
```typescript
// Offline rate caching
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/rates/')) {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request);
      })
    );
  }
});
```

---

**For more information about specific API integrations, refer to the individual service documentation.**
