import { PerformanceComparisonService } from '../../src/services/performanceComparisonService.js';
import { createHistoricalDataService } from '../../src/services/historicalDataService.js';

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

    const historicalDataService = createHistoricalDataService();
    const performanceService = new PerformanceComparisonService(historicalDataService);

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
