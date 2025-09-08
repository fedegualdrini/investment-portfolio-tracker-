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

    // Get the base URL for internal API calls
    const baseUrl = req.headers.origin || 'http://localhost:3000';
    console.log('Base URL:', baseUrl);

    // Step 1: Get portfolio historical data
    console.log('📊 Fetching portfolio data...');
    const portfolioResponse = await fetch(`${baseUrl}/api/performance/portfolio-history`, {
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

    console.log('✅ Portfolio data received:', portfolioResult.data.length, 'data points');

    // Step 2: Get benchmark historical data
    console.log('📈 Fetching benchmark data...');
    const benchmarkResponse = await fetch(`${baseUrl}/api/performance/benchmark-data`, {
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

    console.log('✅ Benchmark data received:', benchmarkResult.data.length, 'data points');

    const portfolioData = portfolioResult.data;
    const benchmarkData = benchmarkResult.data;
    const benchmark = benchmarkResult.benchmark;

    if (portfolioData.length === 0 || benchmarkData.length === 0) {
      throw new Error('No data available for the selected period');
    }

    console.log('📊 Starting normalization process...');

    // Step 3: Normalize the data
    // Get starting values
    const startingPortfolioValue = portfolioData[0].portfolioValue;
    const startingBenchmarkPrice = benchmarkData[0].close;
    const benchmarkShares = startingPortfolioValue / startingBenchmarkPrice;

    console.log(`Starting portfolio value: ${startingPortfolioValue}`);
    console.log(`Starting benchmark price: ${startingBenchmarkPrice}`);
    console.log(`Benchmark shares: ${benchmarkShares}`);

    // Create a map of benchmark data for quick lookup
    const benchmarkMap = new Map();
    benchmarkData.forEach(point => {
      benchmarkMap.set(point.date, point);
    });

    // Create normalized benchmark data that matches portfolio dates
    const normalizedBenchmark = [];
    let previousBenchmarkValue = startingPortfolioValue;

    for (let i = 0; i < portfolioData.length; i++) {
      const portfolioPoint = portfolioData[i];
      const date = portfolioPoint.date;
      
      // Find benchmark data for this date
      let benchmarkPoint = benchmarkMap.get(date);
      
      // If no exact match, find the closest available date
      if (!benchmarkPoint) {
        const availableDates = Array.from(benchmarkMap.keys()).sort();
        const targetDate = new Date(date);
        
        // Find the closest date (within 7 days)
        let closestDate = null;
        let minDiff = Infinity;
        
        for (const availableDate of availableDates) {
          const diff = Math.abs(new Date(availableDate).getTime() - targetDate.getTime());
          if (diff < minDiff && diff <= 7 * 24 * 60 * 60 * 1000) { // 7 days
            minDiff = diff;
            closestDate = availableDate;
          }
        }
        
        if (closestDate) {
          benchmarkPoint = benchmarkMap.get(closestDate);
        }
      }

      if (!benchmarkPoint) {
        console.warn(`No benchmark data found for date ${date}, using previous value`);
        // Use previous benchmark value if no data available
        const benchmarkValue = previousBenchmarkValue;
        const benchmarkReturn = 0;
        
        normalizedBenchmark.push({
          date,
          portfolioValue: portfolioPoint.portfolioValue,
          benchmarkValue,
          portfolioReturn: portfolioPoint.portfolioReturn,
          benchmarkReturn,
          cumulativePortfolioReturn: portfolioPoint.cumulativePortfolioReturn,
          cumulativeBenchmarkReturn: i === 0 ? 0 : 
            (benchmarkValue - normalizedBenchmark[0].benchmarkValue) / normalizedBenchmark[0].benchmarkValue
        });
        
        continue;
      }

      // Calculate normalized benchmark value
      const benchmarkValue = benchmarkShares * benchmarkPoint.close;
      const benchmarkReturn = i === 0 ? 0 : 
        (benchmarkValue - previousBenchmarkValue) / previousBenchmarkValue;

      normalizedBenchmark.push({
        date,
        portfolioValue: portfolioPoint.portfolioValue,
        benchmarkValue,
        portfolioReturn: portfolioPoint.portfolioReturn,
        benchmarkReturn,
        cumulativePortfolioReturn: portfolioPoint.cumulativePortfolioReturn,
        cumulativeBenchmarkReturn: i === 0 ? 0 : 
          (benchmarkValue - normalizedBenchmark[0].benchmarkValue) / normalizedBenchmark[0].benchmarkValue
      });

      previousBenchmarkValue = benchmarkValue;
    }

    console.log('✅ Normalization complete');

    // Step 4: Calculate performance metrics
    const endingPortfolioValue = portfolioData[portfolioData.length - 1].portfolioValue;
    const endingBenchmarkValue = normalizedBenchmark[normalizedBenchmark.length - 1].benchmarkValue;
    
    const portfolioReturn = (endingPortfolioValue - startingPortfolioValue) / startingPortfolioValue;
    const benchmarkReturn = (endingBenchmarkValue - startingPortfolioValue) / startingPortfolioValue;
    const alpha = portfolioReturn - benchmarkReturn;

    // Calculate additional metrics
    const portfolioReturns = portfolioData.slice(1).map((point, index) => 
      (point.portfolioValue - portfolioData[index].portfolioValue) / portfolioData[index].portfolioValue
    );
    
    const benchmarkReturns = normalizedBenchmark.slice(1).map((point, index) => 
      (point.benchmarkValue - normalizedBenchmark[index].benchmarkValue) / normalizedBenchmark[index].benchmarkValue
    );

    // Calculate volatility (annualized)
    const avgPortfolioReturn = portfolioReturns.reduce((sum, ret) => sum + ret, 0) / portfolioReturns.length;
    const portfolioVariance = portfolioReturns.reduce((sum, ret) => sum + Math.pow(ret - avgPortfolioReturn, 2), 0) / portfolioReturns.length;
    const portfolioVolatility = Math.sqrt(portfolioVariance) * Math.sqrt(252); // Annualized

    // Calculate Sharpe ratio (simplified)
    const riskFreeRate = 0.02; // 2% risk-free rate
    const sharpeRatio = portfolioVolatility > 0 ? (avgPortfolioReturn - riskFreeRate) / portfolioVolatility : 0;

    // Calculate maximum drawdown
    let maxDrawdown = 0;
    let peak = startingPortfolioValue;
    
    for (const point of portfolioData) {
      if (point.portfolioValue > peak) {
        peak = point.portfolioValue;
      }
      const drawdown = (peak - point.portfolioValue) / peak;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }

    const metrics = {
      portfolioReturn,
      benchmarkReturn,
      alpha,
      beta: 1, // Simplified for now
      sharpeRatio,
      maxDrawdown
    };

    const normalizedComparison = {
      normalizedPortfolio: portfolioData,
      normalizedBenchmark,
      startingValue: startingPortfolioValue,
      benchmarkShares
    };

    console.log('✅ All calculations complete');
    console.log('Portfolio return:', (portfolioReturn * 100).toFixed(2) + '%');
    console.log('Benchmark return:', (benchmarkReturn * 100).toFixed(2) + '%');
    console.log('Alpha:', (alpha * 100).toFixed(2) + '%');

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