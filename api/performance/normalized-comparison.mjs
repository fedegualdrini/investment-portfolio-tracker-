import { PerformanceComparisonService } from '../../src/services/performanceComparisonService.js';
import { createHistoricalDataService } from '../../src/services/historicalDataService.js';
import { BENCHMARKS } from '../../src/types/performance.js';

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
    const { startDate, endDate, investments, benchmarkId } = req.body;

    if (!startDate || !endDate || !investments || !Array.isArray(investments) || !benchmarkId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: startDate, endDate, investments, benchmarkId' 
      });
    }

    // Find the benchmark
    const benchmark = BENCHMARKS.find(b => b.id === benchmarkId);
    if (!benchmark) {
      return res.status(400).json({
        success: false,
        error: `Benchmark with id ${benchmarkId} not found`
      });
    }

    const historicalDataService = createHistoricalDataService();
    const performanceService = new PerformanceComparisonService(historicalDataService);

    // Get normalized comparison data
    const normalizedComparison = await performanceService.getNormalizedComparison(
      investments,
      benchmark,
      startDate,
      endDate
    );

    // Get performance metrics
    const metrics = await performanceService.getPerformanceMetrics(
      investments,
      benchmark,
      startDate,
      endDate
    );

    res.status(200).json({
      success: true,
      data: {
        normalizedComparison,
        metrics,
        benchmark
      }
    });

  } catch (error) {
    console.error('Error in normalized-comparison API:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}
