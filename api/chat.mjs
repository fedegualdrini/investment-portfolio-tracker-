import { generateText } from 'ai';

export default async function handler(req, res) {
  // IMMEDIATE LOGGING - This should show up if function is called
  console.log('🔥 FUNCTION CALLED - api/chat.mjs handler started');
  console.log('🔥 Request method:', req.method);
  console.log('🔥 Request URL:', req.url);
  console.log('🔥 Request headers:', JSON.stringify(req.headers, null, 2));
  
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

    // Check if AI Gateway API key is available
    console.log('🚀 Starting AI request...');
    console.log('Environment check - AI_GATEWAY_API_KEY exists:', !!process.env.AI_GATEWAY_API_KEY);
    console.log('Environment check - AI_GATEWAY_API_KEY length:', process.env.AI_GATEWAY_API_KEY?.length || 0);
    
    if (!process.env.AI_GATEWAY_API_KEY) {
      console.error('❌ AI_GATEWAY_API_KEY is not set in environment variables');
      return res.status(500).json({ 
        error: 'AI Gateway API key not configured',
        content: "I'm currently having trouble connecting to the AI service. Please try again in a moment."
      });
    }

    // Build system prompt with portfolio context
    let systemPrompt = `You are an advanced AI investment assistant with access to the user's portfolio data and real-time market information. Your role is to provide personalized, data-driven insights, analysis, and recommendations.

PORTFOLIO CONTEXT:
The user has a diversified investment portfolio with the following holdings:

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

    // Add detailed investment information by type
    if (portfolioContext?.investments?.length > 0) {
      const investments = portfolioContext.investments;
      
      // Group investments by type
      const cryptoInvestments = investments.filter(inv => inv.type === 'crypto');
      const stockInvestments = investments.filter(inv => inv.type === 'stock');
      const bondInvestments = investments.filter(inv => inv.type === 'bond');
      const cashInvestments = investments.filter(inv => inv.type === 'cash');
      
      if (cryptoInvestments.length > 0) {
        systemPrompt += `\n\nCRYPTOCURRENCY (${cryptoInvestments.length} investment${cryptoInvestments.length > 1 ? 's' : ''}):`;
        cryptoInvestments.forEach(inv => {
          const gainLoss = inv.currentPrice - inv.purchasePrice;
          const gainLossPercent = ((gainLoss / inv.purchasePrice) * 100).toFixed(2);
          systemPrompt += `\n- ${inv.symbol} (${inv.name}): ${inv.quantity} units at $${inv.purchasePrice} purchase price, currently $${inv.currentPrice} (${gainLossPercent}% ${gainLoss >= 0 ? 'gain' : 'loss'})`;
        });
      }
      
      if (stockInvestments.length > 0) {
        systemPrompt += `\n\nSTOCKS (${stockInvestments.length} investment${stockInvestments.length > 1 ? 's' : ''}):`;
        stockInvestments.forEach(inv => {
          const gainLoss = inv.currentPrice - inv.purchasePrice;
          const gainLossPercent = ((gainLoss / inv.purchasePrice) * 100).toFixed(2);
          systemPrompt += `\n- ${inv.symbol} (${inv.name}): ${inv.quantity} units at $${inv.purchasePrice} purchase price, currently $${inv.currentPrice} (${gainLossPercent}% ${gainLoss >= 0 ? 'gain' : 'loss'})`;
        });
      }
      
      if (bondInvestments.length > 0) {
        systemPrompt += `\n\nBONDS (${bondInvestments.length} investment${bondInvestments.length > 1 ? 's' : ''}):`;
        bondInvestments.forEach(inv => {
          const gainLoss = inv.currentPrice - inv.purchasePrice;
          const gainLossPercent = ((gainLoss / inv.purchasePrice) * 100).toFixed(2);
          let bondInfo = `\n- ${inv.symbol} (${inv.name}): ${inv.quantity} units at $${inv.purchasePrice}, currently $${inv.currentPrice} (${gainLossPercent}% ${gainLoss >= 0 ? 'gain' : 'loss'}), ${inv.fixedYield}% yield, ${inv.paymentFrequency} payments, matures ${inv.maturityDate}`;
          
          if (inv.nextPaymentDate) {
            bondInfo += `, next payment ${inv.nextPaymentDate}`;
          } else if (inv.lastPaymentDate) {
            bondInfo += `, last payment ${inv.lastPaymentDate}`;
          }
          
          systemPrompt += bondInfo;
        });
      }
      
      if (cashInvestments.length > 0) {
        systemPrompt += `\n\nCASH (${cashInvestments.length} holding${cashInvestments.length > 1 ? 's' : ''}):`;
        cashInvestments.forEach(inv => {
          systemPrompt += `\n- ${inv.name}: $${inv.quantity.toFixed(2)}`;
        });
      }
    }

    // Add bond payment information if available
    if (portfolioContext?.portfolioAnalysis?.allBondPayments?.length > 0) {
      systemPrompt += `\n\nBOND PAYMENT SCHEDULE:`;
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
      systemPrompt += `\n\nUpcoming payments: ${portfolioContext.portfolioAnalysis.upcomingBondPayments.map(payment => `${payment.symbol} (${payment.nextPaymentDate})`).join(', ')}`;
    }

    systemPrompt += `\n\nCore Responsibilities:
- Portfolio Analysis: Calculate performance (absolute, % gains, IRR, Sharpe ratio) and compare against benchmarks (S&P 500, Bitcoin, global bond index, etc.)
- Rebalancing Strategies: Suggest allocation adjustments based on risk tolerance, target asset mix, and market conditions
- Bond Intelligence: Track coupons, maturity dates, yield to maturity (YTM), yield to call (YTC), and projected cash flows. Provide a bond payment calendar and simulate reinvestment strategies
- Cash Flow Forecasting: Project semi-annual bond payments, dividends, and interest, and estimate expected monthly/annual passive income
- Scenario Modeling: Run "what if" simulations (e.g., BTC drops 20%, bonds roll down the curve, Fed rate hike). Show the impact on total portfolio value
- Risk Management: Highlight concentration risk, volatility, and downside exposure. Suggest hedging strategies (e.g., via cash, defensive sectors, options)
- Macro Insights: Summarize relevant market news (inflation, commodities, interest rates, Argentina-specific developments) and explain their portfolio impact

Advanced Features:
- Currency Awareness: Convert between USD, ARS, EUR, and BTC for valuation and compare local vs. international returns
- Dividend & Coupon Reinvestment: Estimate compounding returns if payments are reinvested
- Goal Tracking: Help user track specific income goals (e.g., $2,000/month in passive income by 2028) and measure progress
- Tax Awareness (high-level): Provide general considerations about capital gains, interest income, and withholding taxes (never specific tax advice, but highlight where it matters)
- Comparison Engine: Contrast user holdings with alternatives (e.g., other Argentine ONs, U.S. Treasuries, MSCI Emerging Markets ETF)
- Alerts & Signals: Detect unusual moves (bond price drops, crypto volatility spikes, stock dividend suspensions) and explain why they matter
- Kelly Criterion & Betting Overlays (if user applies to betting strategies): Provide expected value (EV) calculations, bankroll risk percentages, and optimal bet sizing

Interaction Style:
- Always use the actual portfolio context provided
- Be data-driven, specific, and clear. Show numbers, percentages, dates, and comparisons
- Explain reasoning transparently, not just conclusions
- Avoid generic advice—tie everything to the user's actual portfolio
- Provide both short-term tactical insights (market trends, signals) and long-term strategy guidance (retirement, compounding, rebalancing)

Example Queries You Can Handle:
- "How much passive income will I receive from my bonds in 2026?"
- "What happens to my portfolio if BTC drops 15%?"
- "Compare my Edenor bond to YPF in terms of YTM and risk."
- "Am I too concentrated in crypto?"
- "How close am I to my $2,000/month passive income target?"
- "Simulate rebalancing to 50% bonds, 30% crypto, 20% stocks."

Always provide specific, data-driven insights based on the user's actual portfolio holdings and current market conditions.`;

    // Generate AI response using AI Gateway (auto-routed)
    console.log('🤖 Generating AI response through AI Gateway...');
    console.log('🔑 AI_GATEWAY_API_KEY present:', !!process.env.AI_GATEWAY_API_KEY);
    console.log('🔑 AI_GATEWAY_API_KEY starts with:', process.env.AI_GATEWAY_API_KEY?.substring(0, 10) + '...');
    console.log('📝 Model being used: openai/gpt-4o-mini');
    console.log('📊 Messages count:', messages.length);
    console.log('📏 System prompt length:', systemPrompt.length);
    
    const result = await generateText({
      model: 'openai/gpt-4o-mini',
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

    console.log('✅ AI Response generated successfully');
    console.log('📊 AI Gateway usage:', result.usage);
    console.log('🔍 Response length:', result.text?.length || 0);
    console.log('🔍 Full result object keys:', Object.keys(result));
    console.log('🔍 Usage details:', JSON.stringify(result.usage, null, 2));

    res.status(200).json({
      content: result.text,
      usage: result.usage
    });

  } catch (error) {
    console.error('❌ Error in chat API:', error);
    console.error('❌ Error details:', error.message);
    console.error('❌ Error stack:', error.stack);
    
    // Check if it's an AI Gateway specific error
    if (error.message?.includes('AI_GATEWAY_API_KEY') || error.message?.includes('gateway')) {
      console.error('❌ AI Gateway authentication error');
      return res.status(500).json({
        error: 'AI Gateway authentication failed',
        content: "I'm having trouble connecting to the AI service. Please try again in a moment."
      });
    }
    
    // Check if it's a model-specific error
    if (error.message?.includes('model') || error.message?.includes('openai')) {
      console.error('❌ Model configuration error');
      return res.status(500).json({
        error: 'Model configuration error',
        content: "I'm having trouble with the AI model configuration. Please try again in a moment."
      });
    }
    
    // Generic error fallback
    res.status(500).json({
      error: 'Internal server error',
      content: "I'm currently having trouble connecting to the AI service. Please try again in a moment."
    });
  }
}