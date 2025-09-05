import express from 'express';
import cors from 'cors';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

// Check if OpenAI API key is provided
if (!process.env.OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY is not set in environment variables');
  console.error('Please create a .env file with your OpenAI API key:');
  console.error('OPENAI_API_KEY=your_api_key_here');
  process.exit(1);
}

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Chat API endpoint
app.post('/api/chat', async (req, res) => {
  console.log('Chat API called with:', req.body);
  
  try {
    const { messages, portfolioContext } = req.body;

    // Build enhanced system prompt with portfolio context
    let systemPrompt = `You are a helpful AI assistant for an Investment Portfolio Tracker application. 
    You can help users with:
    - Investment advice and strategies
    - Portfolio analysis and optimization
    - Bond analysis and calculations
    - Market insights and trends
    - Risk management
    - Financial planning
    
    Be professional, helpful, and provide accurate financial information while reminding users that this is not personalized financial advice and they should consult with qualified professionals for important decisions.`;

    // Add portfolio context if available
    if (portfolioContext && portfolioContext.investments && portfolioContext.investments.length > 0) {
      const { investments, totalValue, totalInvested, totalGainLoss, totalGainLossPercentage, currency, lastUpdated, portfolioAnalysis, currentDate, currentDateFormatted, currentTime } = portfolioContext;
      
      systemPrompt += `\n\nIMPORTANT: You have access to the user's comprehensive portfolio data:

**Current Date and Time:**
- Today is: ${currentDateFormatted}
- Current time: ${currentTime}
- ISO Date: ${currentDate}

**Portfolio Summary:**
- Total Value: $${totalValue.toFixed(2)} USD (${currency} equivalent)
- Total Invested: $${totalInvested.toFixed(2)} USD
- Total Gain/Loss: $${totalGainLoss.toFixed(2)} USD (${totalGainLossPercentage.toFixed(2)}%)
- Portfolio Currency: ${currency}
- Last Updated: ${lastUpdated || 'Never'}

**Portfolio Composition:**
- Bonds: ${portfolioAnalysis.bondCount} holdings ($${portfolioAnalysis.totalBondValue.toFixed(2)} total value)
- Stocks: ${portfolioAnalysis.stockCount} holdings
- Crypto: ${portfolioAnalysis.cryptoCount} holdings
- Cash: ${portfolioAnalysis.cashCount} holdings
- Total Annual Coupon Income: $${portfolioAnalysis.totalAnnualCouponIncome.toFixed(2)} USD

**Detailed Holdings:**
${investments.map(inv => {
  let holdingInfo = `- ${inv.symbol} (${inv.name}): ${inv.quantity} ${inv.type}s
    Purchase Price: $${inv.purchasePrice.toFixed(2)} | Current: $${inv.currentPrice.toFixed(2)}
    Total Value: $${inv.currentValue.toFixed(2)} | Gain/Loss: $${inv.gainLoss.toFixed(2)} (${inv.gainLossPercent.toFixed(2)}%)
    Purchase Date: ${inv.purchaseDate} | Currency: ${inv.currency || 'USD'}`;
  
  // Add bond-specific information
  if (inv.type === 'bond') {
    holdingInfo += `
    BOND DETAILS:
    - Fixed Yield: ${inv.fixedYield || 'N/A'}%
    - Face Value: $${inv.faceValue || inv.purchasePrice.toFixed(2)}
    - Annual Coupon Payment: $${inv.annualCouponPayment.toFixed(2)}
    - Payment Frequency: ${inv.paymentFrequency || 'Unknown'}
    - Next Payment Date: ${inv.nextPaymentDate || 'Not specified'}
    - Last Payment Date: ${inv.lastPaymentDate || 'Not specified'}
    - Maturity Date: ${inv.maturityDate || 'Not specified'}
    - Issuance Date: ${inv.issuanceDate || 'Not specified'}`;
    
    if (inv.paymentSchedule) {
      holdingInfo += `
    PAYMENT SCHEDULE:
    - Frequency: ${inv.paymentSchedule.frequency}
    - Next Payment: ${inv.paymentSchedule.nextPayment || 'Not specified'}
    - Last Payment: ${inv.paymentSchedule.lastPayment || 'Not specified'}
    - Maturity: ${inv.paymentSchedule.maturity || 'Not specified'}
    - Annual Rate: ${inv.paymentSchedule.annualRate || 'N/A'}%
    - Face Value: $${inv.paymentSchedule.faceValue || 'N/A'}`;
    }
  }
  
  return holdingInfo;
}).join('\n')}

**All Bond Payment Information:**
${portfolioAnalysis.allBondPayments.length > 0 ? 
  portfolioAnalysis.allBondPayments.map(payment => {
    let paymentInfo = `- ${payment.symbol} (${payment.name}): $${payment.paymentAmount.toFixed(2)} annual coupon`;
    
    if (payment.hasSpecificDate) {
      paymentInfo += ` - Next payment: ${payment.nextPaymentDate} (${payment.paymentFrequency}) - ${payment.relativeTiming}${payment.isOverdue ? ' ⚠️ OVERDUE' : ''}`;
    } else {
      paymentInfo += ` - Payment date: ${payment.nextPaymentDate} (${payment.paymentFrequency})`;
    }
    
    paymentInfo += ` - Maturity: ${payment.maturityDate} - Yield: ${payment.fixedYield}%`;
    
    return paymentInfo;
  }).join('\n') : 
  'No bond information available'}

**Upcoming Bond Payments (with specific dates):**
${portfolioAnalysis.upcomingBondPayments.length > 0 ? 
  portfolioAnalysis.upcomingBondPayments.map(payment => {
    let paymentInfo = `- ${payment.symbol} (${payment.name}): $${payment.paymentAmount.toFixed(2)} on ${payment.nextPaymentDate} (${payment.paymentFrequency}) - ${payment.relativeTiming}${payment.isOverdue ? ' ⚠️ OVERDUE' : ''}`;
    
    return paymentInfo;
  }).join('\n') : 
  'No upcoming bond payments with specific dates scheduled'}

**API Data Sources:**
- Real-time prices from Yahoo Finance and CoinGecko APIs
- Currency exchange rates from DolarAPI and Open Exchange Rates
- Bond payment schedules and yield information from user input
- Portfolio calculations updated in real-time

When answering questions, you can reference this comprehensive portfolio data to provide personalized insights. For example:
- If asked about portfolio performance, reference the actual numbers and calculations
- If asked about specific investments, mention the symbols they own with detailed information
- If asked about diversification, analyze their current allocation across asset types
- If asked about bonds, reference ALL bond holdings, including those with and without specific payment dates
- If asked about coupon payments, provide information for ALL bonds - those with specific dates and those without
- If asked about bond payment schedules, include all bonds and clearly indicate which ones have specific dates vs. which ones don't
- If asked about time-sensitive information, use the current date context to provide accurate relative timing
- Always be specific with their actual data when relevant and use the current date for any time-based calculations
- When discussing bond payments, always mention all bonds in their portfolio, not just those with upcoming payment dates

**Time Context:** Always use the current date (${currentDateFormatted}) as your reference point for any time-based calculations, relative dates, or scheduling information.

Remember to still include general disclaimers about seeking professional advice for major financial decisions.`;
    }

    // Use OpenAI GPT-4 with enhanced context
    const result = await generateText({
      model: openai('gpt-4o-mini'),
      messages: messages,
      system: systemPrompt,
    });

    console.log('AI Response generated successfully');
    
    res.json({ 
      content: result.text,
      role: 'assistant'
    });
  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Chat API server running on http://localhost:${PORT}`);
});
