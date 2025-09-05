import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, portfolioContext } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OPENAI_API_KEY is not set in environment variables');
      return res.status(500).json({ 
        error: 'OpenAI API key not configured',
        content: "I'm currently having trouble connecting to the AI service. Please try again in a moment."
      });
    }

    // Build system prompt with portfolio context
    let systemPrompt = `You are an AI investment assistant with access to the user's portfolio data. You can help with investment strategies, portfolio analysis, bond calculations, market insights, and more.

Current Date and Time: ${portfolioContext?.currentDateFormatted || 'Not available'} (${portfolioContext?.currentTime || 'Not available'})

Portfolio Summary:
- Total Value: $${portfolioContext?.totalValue?.toFixed(2) || '0.00'}
- Total Invested: $${portfolioContext?.totalInvested?.toFixed(2) || '0.00'}
- Total Gain/Loss: $${portfolioContext?.totalGainLoss?.toFixed(2) || '0.00'} (${portfolioContext?.totalGainLossPercentage?.toFixed(2) || '0.00'}%)

Portfolio Analysis:
- Bonds: ${portfolioContext?.portfolioAnalysis?.bondCount || 0} holdings
- Stocks: ${portfolioContext?.portfolioAnalysis?.stockCount || 0} holdings
- Crypto: ${portfolioContext?.portfolioAnalysis?.cryptoCount || 0} holdings
- Cash: ${portfolioContext?.portfolioAnalysis?.cashCount || 0} holdings
- Total Bond Value: $${portfolioContext?.portfolioAnalysis?.totalBondValue?.toFixed(2) || '0.00'}
- Total Annual Coupon Income: $${portfolioContext?.portfolioAnalysis?.totalAnnualCouponIncome?.toFixed(2) || '0.00'}`;

    // Add bond payment information if available
    if (portfolioContext?.portfolioAnalysis?.allBondPayments?.length > 0) {
      systemPrompt += `\n\nAll Bond Payment Information:\n${portfolioContext.portfolioAnalysis.allBondPayments.map(payment => {
        let paymentInfo = `- ${payment.symbol} (${payment.name}): $${payment.paymentAmount?.toFixed(2) || '0.00'} annual coupon`;
        
        if (payment.hasSpecificDate) {
          paymentInfo += ` - Next payment: ${payment.nextPaymentDate} (${payment.paymentFrequency}) - ${payment.relativeTiming || 'Not specified'}${payment.isOverdue ? ' ⚠️ OVERDUE' : ''}`;
        } else {
          paymentInfo += ` - Payment date: ${payment.nextPaymentDate} (${payment.paymentFrequency})`;
        }
        
        paymentInfo += ` - Maturity: ${payment.maturityDate} - Yield: ${payment.fixedYield}%`;
        
        return paymentInfo;
      }).join('\n')}`;
    }

    if (portfolioContext?.portfolioAnalysis?.upcomingBondPayments?.length > 0) {
      systemPrompt += `\n\nUpcoming Bond Payments (with specific dates):\n${portfolioContext.portfolioAnalysis.upcomingBondPayments.map(payment => {
        let paymentInfo = `- ${payment.symbol} (${payment.name}): $${payment.paymentAmount?.toFixed(2) || '0.00'} on ${payment.nextPaymentDate} (${payment.paymentFrequency}) - ${payment.relativeTiming || 'Not specified'}${payment.isOverdue ? ' ⚠️ OVERDUE' : ''}`;
        return paymentInfo;
      }).join('\n')}`;
    }

    systemPrompt += `\n\nInstructions:
- Always be helpful and provide accurate information based on the user's actual portfolio data
- Use the current date context for any time-based calculations
- If asked about bond payments, provide information for ALL bonds - those with specific dates and those without
- If asked about bond payment schedules, include all bonds and clearly indicate which ones have specific dates vs. which ones don't
- If asked about time-sensitive information, use the current date context to provide accurate relative timing
- Always be specific with their actual data when relevant and use the current date for any time-based calculations
- When discussing bond payments, always mention all bonds in their portfolio, not just those with upcoming payment dates
- Respond in the same language as the user's question
- Be concise but comprehensive in your responses`;

    // Generate AI response
    const result = await generateText({
      model: openai('gpt-4o-mini'),
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        ...messages
      ],
      maxTokens: 2000,
      temperature: 0.7,
    });

    console.log('AI Response generated successfully');

    res.status(200).json({
      content: result.text,
      usage: result.usage
    });

  } catch (error) {
    console.error('Error in chat API:', error);
    
    // Return a fallback response
    res.status(500).json({
      error: 'Internal server error',
      content: "I'm currently having trouble connecting to the AI service. Please try again in a moment."
    });
  }
}