const COINGECKO_API = 'https://api.coingecko.com/api/v3';

// Map of crypto symbols to CoinGecko IDs
const CRYPTO_ID_MAP = {
  'BTC': 'bitcoin',
  'ETH': 'ethereum',
  'ADA': 'cardano',
  'DOT': 'polkadot',
  'LINK': 'chainlink',
  'SOL': 'solana',
  'MATIC': 'polygon',
  'AVAX': 'avalanche-2',
  'ATOM': 'cosmos',
  'LUNA': 'terra-luna-2',
  'USDT': 'tether',
  'USDC': 'usd-coin',
  'BNB': 'binancecoin',
  'XRP': 'ripple',
  'DOGE': 'dogecoin',
  'LTC': 'litecoin',
  'BCH': 'bitcoin-cash',
  'EOS': 'eos',
  'TRX': 'tron',
  'XLM': 'stellar',
};

function getCoinId(symbol) {
  const upperSymbol = symbol.toUpperCase();
  return CRYPTO_ID_MAP[upperSymbol] || symbol.toLowerCase();
}

// Vercel serverless function for CoinGecko proxy
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { coinId, start, end } = req.query;

    if (!coinId || !start || !end) {
      res.status(400).json({
        error: 'Missing required parameters: coinId, start, end'
      });
      return;
    }

    // Convert coin symbol to CoinGecko ID
    const coinGeckoId = getCoinId(coinId);

    // Build CoinGecko API URL
    const apiUrl = `${COINGECKO_API}/coins/${coinGeckoId}/market_chart/range?vs_currency=usd&from=${start}&to=${end}`;

    console.log(`[CoinGecko Proxy] Fetching: ${apiUrl}`);

    // Add delay to respect rate limits (CoinGecko free tier: 10-50 calls/minute)
    await new Promise(resolve => setTimeout(resolve, 200));

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Investment-Tracker/1.0'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[CoinGecko Proxy] API Error: ${response.status} - ${errorText}`);

      // Handle rate limiting
      if (response.status === 429) {
        res.status(429).json({
          error: 'Rate limit exceeded. Please try again later.',
          retryAfter: response.headers.get('Retry-After') || '60'
        });
        return;
      }

      // Handle other errors
      res.status(response.status).json({
        error: `CoinGecko API error: ${response.status}`,
        details: errorText
      });
      return;
    }

    const data = await response.json();

    // Validate response structure
    if (!data || !data.prices || !Array.isArray(data.prices)) {
      console.error('[CoinGecko Proxy] Invalid response structure:', data);
      res.status(502).json({
        error: 'Invalid response from CoinGecko API'
      });
      return;
    }

    console.log(`[CoinGecko Proxy] Success: Retrieved ${data.prices.length} price points for ${coinGeckoId}`);

    // Return the data with additional metadata
    res.status(200).json({
      ...data,
      _metadata: {
        coinId: coinGeckoId,
        originalSymbol: coinId,
        timestamp: new Date().toISOString(),
        dataPoints: data.prices.length
      }
    });

  } catch (error) {
    console.error('[CoinGecko Proxy] Internal error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
