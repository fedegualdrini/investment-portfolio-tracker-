import { PerformanceComparisonService } from '../../src/services/performanceComparisonService.js';

// Mock services for API endpoints
const mockYahooService = {
  getBatchHistoricalData: async (symbols, startDate, endDate) => {
    // Mock implementation - replace with actual Yahoo Finance API calls
    const mockData = new Map();
    symbols.forEach(symbol => {
      mockData.set(symbol, generateMockHistoricalData(startDate, endDate));
    });
    return mockData;
  },
  getHistoricalData: async (symbol, startDate, endDate) => {
    return generateMockHistoricalData(startDate, endDate);
  }
};

const mockCoinGeckoService = {
  getBatchHistoricalData: async (symbols, startDate, endDate) => {
    const mockData = new Map();
    symbols.forEach(symbol => {
      mockData.set(symbol, generateMockHistoricalData(startDate, endDate));
    });
    return mockData;
  },
  getHistoricalData: async (symbol, startDate, endDate) => {
    return generateMockHistoricalData(startDate, endDate);
  }
};

const mockPortfolioService = {};

// Mock data generator
function generateMockHistoricalData(startDate, endDate) {
  const data = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  
  let basePrice = 100;
  for (let i = 0; i < days; i++) {
    const date = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
    const change = (Math.random() - 0.5) * 0.05; // ±2.5% daily change
    basePrice *= (1 + change);
    
    data.push({
      date: date.toISOString().split('T')[0],
      open: basePrice * 0.99,
      high: basePrice * 1.02,
      low: basePrice * 0.98,
      close: basePrice,
      volume: Math.floor(Math.random() * 1000000) + 100000
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

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { startDate, endDate, investments } = req.body;

    if (!startDate || !endDate || !investments || !Array.isArray(investments)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: startDate, endDate, investments' 
      });
    }

    const performanceService = new PerformanceComparisonService(
      mockYahooService,
      mockCoinGeckoService,
      mockPortfolioService
    );

    const data = await performanceService.getPortfolioHistoricalData(
      investments,
      startDate,
      endDate
    );

    // Convert Map to Object for JSON serialization
    const serializedData = {};
    data.forEach((value, key) => {
      serializedData[key] = value;
    });

    res.status(200).json({ success: true, data: serializedData });
  } catch (error) {
    console.error('Error in portfolio-history API:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Internal server error' 
    });
  }
}
