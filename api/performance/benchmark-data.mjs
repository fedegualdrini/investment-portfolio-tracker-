import { BENCHMARKS } from '../../src/types/performance.js';
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

    const historicalDataService = createHistoricalDataService();
    const data = await historicalDataService.getHistoricalData(
      benchmark.symbol,
      startDate,
      endDate,
      benchmark.dataSource
    );

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Error in benchmark-data API:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Internal server error' 
    });
  }
}
