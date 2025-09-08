import { BENCHMARKS } from '../../src/types/performance.js';

// Mock services for API endpoints
const mockYahooService = {
  getHistoricalData: async (symbol, startDate, endDate) => {
    return generateMockHistoricalData(startDate, endDate);
  }
};

const mockCoinGeckoService = {
  getHistoricalData: async (symbol, startDate, endDate) => {
    return generateMockHistoricalData(startDate, endDate);
  }
};

// Mock data generator
function generateMockHistoricalData(startDate, endDate) {
  const data = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  
  let basePrice = 100;
  for (let i = 0; i < days; i++) {
    const date = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
    const change = (Math.random() - 0.5) * 0.03; // ±1.5% daily change for benchmarks
    basePrice *= (1 + change);
    
    data.push({
      date: date.toISOString().split('T')[0],
      open: basePrice * 0.99,
      high: basePrice * 1.01,
      low: basePrice * 0.99,
      close: basePrice,
      volume: Math.floor(Math.random() * 10000000) + 1000000
    });
  }
  
  return data;
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { benchmarkId, startDate, endDate } = req.query;

    if (!benchmarkId || !startDate || !endDate) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required query parameters: benchmarkId, startDate, endDate' 
      });
    }

    const benchmark = BENCHMARKS.find(b => b.id === benchmarkId);
    if (!benchmark) {
      return res.status(400).json({ 
        success: false, 
        error: `Invalid benchmark ID: ${benchmarkId}` 
      });
    }

    let data = [];
    
    if (benchmark.dataSource === 'yahoo') {
      data = await mockYahooService.getHistoricalData(
        benchmark.symbol,
        startDate,
        endDate
      );
    } else if (benchmark.dataSource === 'coingecko') {
      data = await mockCoinGeckoService.getHistoricalData(
        benchmark.symbol,
        startDate,
        endDate
      );
    }

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Error in benchmark-data API:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Internal server error' 
    });
  }
}
