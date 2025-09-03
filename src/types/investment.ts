export interface Investment {
  id: string;
  symbol: string;
  name: string;
  type: InvestmentType;
  quantity: number;
  purchasePrice: number;
  purchaseDate: string;
  currentPrice?: number;
  lastUpdated?: string;
  fixedYield?: number; // For bonds
  // Enhanced bond properties
  paymentFrequency?: PaymentFrequency;
  nextPaymentDate?: string;
  lastPaymentDate?: string; // When user received a payment after purchase
  maturityDate?: string;
  faceValue?: number;
  issuanceDate?: string;
  // Cash properties
  currency?: string;
  exchangeRate?: number; // Rate to USD for portfolio calculations
}

export interface PortfolioSummary {
  totalValue: number;
  totalInvested: number;
  totalGainLoss: number;
  totalGainLossPercentage: number;
  investmentsByType: Record<InvestmentType, number>;
}

export type InvestmentType = 'crypto' | 'stock' | 'bond' | 'etf' | 'commodity' | 'cash' | 'other';

export interface PriceData {
  symbol: string;
  price: number;
  change24h?: number;
  lastUpdated: string;
}

export type PaymentFrequency = 'monthly' | 'quarterly' | 'semi-annual' | 'annual' | 'zero-coupon' | 'unknown';

export interface PaymentEvent {
  date: string;
  amount: number;
  type: 'coupon' | 'principal' | 'maturity';
  description: string;
}

export interface BondPaymentInfo {
  paymentFrequency: PaymentFrequency;
  nextPaymentDate?: string;
  paymentAmount: number;
  totalAnnualPayments: number;
  confidence: number; // 0-1 scale for prediction confidence
}

export interface BondCashFlow {
  investmentId: string;
  symbol: string;
  upcomingPayments: PaymentEvent[];
  totalMonthlyIncome: number;
  totalQuarterlyIncome: number;
  totalAnnualIncome: number;
}