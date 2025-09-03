// Vercel API route to proxy Yahoo Finance API calls
// This solves CORS issues by making the request server-side

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Extract the path and query parameters
    const { path, ...queryParams } = req.query;
    
    // Construct the Yahoo Finance URL
    const yahooPath = Array.isArray(path) ? path.join('/') : path;
    const yahooUrl = `https://query1.finance.yahoo.com/${yahooPath}`;
    
    // Add query parameters if they exist
    const url = new URL(yahooUrl);
    Object.entries(queryParams).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    console.log('Fetching from Yahoo Finance:', url.toString());

    // Make the request to Yahoo Finance
    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Yahoo Finance API error:', response.status, response.statusText);
      return res.status(response.status).json({ 
        error: 'Failed to fetch from Yahoo Finance',
        status: response.status,
        statusText: response.statusText
      });
    }

    const data = await response.json();
    
    // Set CORS headers to allow frontend access
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Cache the response for 1 minute
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
    
    // Return the data
    res.status(200).json(data);

  } catch (error) {
    console.error('API route error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
