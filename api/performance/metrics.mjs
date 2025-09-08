import { PerformanceMetricsCalculator } from '../../src/utils/performanceCalculations.js';

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
    const { performanceData } = req.body;

    if (!performanceData || !Array.isArray(performanceData)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required field: performanceData (array)' 
      });
    }

    const metrics = PerformanceMetricsCalculator.calculateAllMetrics(performanceData);

    res.status(200).json({ success: true, data: metrics });
  } catch (error) {
    console.error('Error in metrics API:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Internal server error' 
    });
  }
}
