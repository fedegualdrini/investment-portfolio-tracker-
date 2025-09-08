export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    console.log('🔥 Normalized comparison API called');
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    const { startDate, endDate, investments, benchmarkId } = req.body;

    if (!startDate || !endDate || !investments || !Array.isArray(investments) || !benchmarkId) {
      console.log('❌ Missing required fields');
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: startDate, endDate, investments, benchmarkId' 
      });
    }

    console.log('✅ All required fields present');

    // For now, let's return a simple response to test if the API is working
    // We'll implement the full logic step by step
    
    const mockNormalizedComparison = {
      normalizedPortfolio: [
        {
          date: startDate,
          portfolioValue: 10000,
          benchmarkValue: 10000,
          portfolioReturn: 0,
          benchmarkReturn: 0,
          cumulativePortfolioReturn: 0,
          cumulativeBenchmarkReturn: 0
        },
        {
          date: endDate,
          portfolioValue: 11000,
          benchmarkValue: 10500,
          portfolioReturn: 0.1,
          benchmarkReturn: 0.05,
          cumulativePortfolioReturn: 0.1,
          cumulativeBenchmarkReturn: 0.05
        }
      ],
      normalizedBenchmark: [
        {
          date: startDate,
          portfolioValue: 10000,
          benchmarkValue: 10000,
          portfolioReturn: 0,
          benchmarkReturn: 0,
          cumulativePortfolioReturn: 0,
          cumulativeBenchmarkReturn: 0
        },
        {
          date: endDate,
          portfolioValue: 11000,
          benchmarkValue: 10500,
          portfolioReturn: 0.1,
          benchmarkReturn: 0.05,
          cumulativePortfolioReturn: 0.1,
          cumulativeBenchmarkReturn: 0.05
        }
      ],
      startingValue: 10000,
      benchmarkShares: 100
    };

    const mockMetrics = {
      portfolioReturn: 0.1,
      benchmarkReturn: 0.05,
      alpha: 0.05,
      beta: 1,
      sharpeRatio: 0.5,
      maxDrawdown: 0.02
    };

    const mockBenchmark = {
      id: benchmarkId,
      name: 'S&P 500',
      symbol: 'SPY',
      description: 'SPDR S&P 500 ETF Trust',
      dataSource: 'yahoo',
      type: 'stock'
    };

    console.log('✅ Returning mock data for testing');

    res.status(200).json({
      success: true,
      data: {
        normalizedComparison: mockNormalizedComparison,
        metrics: mockMetrics,
        benchmark: mockBenchmark
      }
    });

  } catch (error) {
    console.error('❌ Error in normalized-comparison API:', error);
    console.error('❌ Error details:', error.message);
    console.error('❌ Error stack:', error.stack);
    
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}