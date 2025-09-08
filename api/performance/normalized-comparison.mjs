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

    // For now, let's use the existing portfolio-history and benchmark-data endpoints
    // to get the data and then combine them
    const portfolioResponse = await fetch(`${req.headers.origin || 'http://localhost:3000'}/api/performance/portfolio-history`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startDate,
        endDate,
        investments
      }),
    });

    if (!portfolioResponse.ok) {
      throw new Error(`Portfolio history API failed: ${portfolioResponse.status}`);
    }

    const portfolioResult = await portfolioResponse.json();
    if (!portfolioResult.success) {
      throw new Error(`Portfolio history API error: ${portfolioResult.error}`);
    }

    const benchmarkResponse = await fetch(`${req.headers.origin || 'http://localhost:3000'}/api/performance/benchmark-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startDate,
        endDate,
        benchmarkId
      }),
    });

    if (!benchmarkResponse.ok) {
      throw new Error(`Benchmark data API failed: ${benchmarkResponse.status}`);
    }

    const benchmarkResult = await benchmarkResponse.json();
    if (!benchmarkResult.success) {
      throw new Error(`Benchmark data API error: ${benchmarkResult.error}`);
    }

    console.log('✅ Got portfolio and benchmark data');

    // Simple normalization: ensure both start at the same value
    const portfolioData = portfolioResult.data;
    const benchmarkData = benchmarkResult.data;
    const benchmark = benchmarkResult.benchmark;

    if (portfolioData.length === 0 || benchmarkData.length === 0) {
      throw new Error('No data available for the selected period');
    }

    // Get starting values
    const startingPortfolioValue = portfolioData[0].portfolioValue;
    const startingBenchmarkPrice = benchmarkData[0].close;
    const benchmarkShares = startingPortfolioValue / startingBenchmarkPrice;

    console.log(`Starting portfolio value: ${startingPortfolioValue}`);
    console.log(`Starting benchmark price: ${startingBenchmarkPrice}`);
    console.log(`Benchmark shares: ${benchmarkShares}`);

    // Create normalized benchmark data
    const normalizedBenchmark = portfolioData.map((portfolioPoint, index) => {
      // Find corresponding benchmark data
      const benchmarkPoint = benchmarkData.find(bp => bp.date === portfolioPoint.date);
      
      if (!benchmarkPoint) {
        // If no exact date match, use the closest available price
        const closestBenchmark = benchmarkData.reduce((closest, current) => {
          const currentDiff = Math.abs(new Date(current.date).getTime() - new Date(portfolioPoint.date).getTime());
          const closestDiff = Math.abs(new Date(closest.date).getTime() - new Date(portfolioPoint.date).getTime());
          return currentDiff < closestDiff ? current : closest;
        });
        
        const benchmarkValue = benchmarkShares * closestBenchmark.close;
        const benchmarkReturn = index === 0 ? 0 : 
          (benchmarkValue - normalizedBenchmark[index - 1].benchmarkValue) / normalizedBenchmark[index - 1].benchmarkValue;
        
        return {
          date: portfolioPoint.date,
          portfolioValue: portfolioPoint.portfolioValue,
          benchmarkValue,
          portfolioReturn: portfolioPoint.portfolioReturn,
          benchmarkReturn,
          cumulativePortfolioReturn: portfolioPoint.cumulativePortfolioReturn,
          cumulativeBenchmarkReturn: index === 0 ? 0 : 
            (benchmarkValue - normalizedBenchmark[0].benchmarkValue) / normalizedBenchmark[0].benchmarkValue
        };
      }

      const benchmarkValue = benchmarkShares * benchmarkPoint.close;
      const benchmarkReturn = index === 0 ? 0 : 
        (benchmarkValue - normalizedBenchmark[index - 1].benchmarkValue) / normalizedBenchmark[index - 1].benchmarkValue;

      return {
        date: portfolioPoint.date,
        portfolioValue: portfolioPoint.portfolioValue,
        benchmarkValue,
        portfolioReturn: portfolioPoint.portfolioReturn,
        benchmarkReturn,
        cumulativePortfolioReturn: portfolioPoint.cumulativePortfolioReturn,
        cumulativeBenchmarkReturn: index === 0 ? 0 : 
          (benchmarkValue - normalizedBenchmark[0].benchmarkValue) / normalizedBenchmark[0].benchmarkValue
      };
    });

    // Calculate simple metrics
    const endingPortfolioValue = portfolioData[portfolioData.length - 1].portfolioValue;
    const endingBenchmarkValue = normalizedBenchmark[normalizedBenchmark.length - 1].benchmarkValue;
    
    const portfolioReturn = (endingPortfolioValue - startingPortfolioValue) / startingPortfolioValue;
    const benchmarkReturn = (endingBenchmarkValue - startingPortfolioValue) / startingPortfolioValue;
    const alpha = portfolioReturn - benchmarkReturn;

    const metrics = {
      portfolioReturn,
      benchmarkReturn,
      alpha,
      beta: 1, // Simplified
      sharpeRatio: 0, // Simplified
      maxDrawdown: 0 // Simplified
    };

    const normalizedComparison = {
      normalizedPortfolio: portfolioData,
      normalizedBenchmark,
      startingValue: startingPortfolioValue,
      benchmarkShares
    };

    console.log('✅ Normalization complete');

    res.status(200).json({
      success: true,
      data: {
        normalizedComparison,
        metrics,
        benchmark
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