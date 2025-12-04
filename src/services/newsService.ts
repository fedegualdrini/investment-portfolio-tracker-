import { NewsArticle } from '../types/news';

const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY;
const BASE_URL = 'https://newsapi.org/v2/everything';

// Mock data for development/fallback
const MOCK_NEWS: NewsArticle[] = [
    {
        title: "Market Rally Continues as Tech Stocks Surge",
        description: "Major indices hit new highs as investors bet on AI revolution.",
        url: "https://www.ft.com/content/example-tech-stocks-surge",
        urlToImage: "https://images.unsplash.com/photo-1611974765270-ca1258634369?auto=format&fit=crop&q=80&w=200",
        publishedAt: new Date().toISOString(),
        source: { name: "Financial Times" }
    },
    {
        title: "Fed Signals Potential Rate Cuts Later This Year",
        description: "Central bank officials suggest inflation is cooling faster than expected.",
        url: "https://www.bloomberg.com/news/articles/example-fed-rate-cuts",
        urlToImage: "https://images.unsplash.com/photo-1526304640152-d4619684e484?auto=format&fit=crop&q=80&w=200",
        publishedAt: new Date(Date.now() - 86400000).toISOString(),
        source: { name: "Bloomberg" }
    },
    {
        title: "Crypto Markets Volatile Amid Regulatory Uncertainty",
        description: "Bitcoin and Ethereum see sharp swings as new regulations loom.",
        url: "https://www.coindesk.com/markets/example-crypto-volatility",
        urlToImage: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?auto=format&fit=crop&q=80&w=200",
        publishedAt: new Date(Date.now() - 172800000).toISOString(),
        source: { name: "CoinDesk" }
    }
];

export const newsService = {
    async fetchNews(symbols: string[]): Promise<NewsArticle[]> {
        // Debug logging
        console.log('📰 News Service Debug:', {
            hasApiKey: !!NEWS_API_KEY,
            apiKeyLength: NEWS_API_KEY?.length || 0,
            apiKeyPreview: NEWS_API_KEY ? NEWS_API_KEY.substring(0, 10) + '...' : 'N/A',
            symbolsCount: symbols.length,
            symbols: symbols
        });

        // If no API key or no symbols, return mock data
        if (!NEWS_API_KEY || symbols.length === 0) {
            const reason = !NEWS_API_KEY ? 'No API key found' : 'No symbols provided';
            console.log(`⚠️ Using mock news data - Reason: ${reason}`);
            return new Promise((resolve) => {
                setTimeout(() => resolve(MOCK_NEWS), 500);
            });
        }

        try {
            // Create a query string from symbols (e.g., "AAPL OR TSLA OR BTC")
            // Limit to first 5 symbols to avoid too long query
            const query = symbols.slice(0, 5).join(' OR ');
            const apiUrl = `${BASE_URL}?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&apiKey=${NEWS_API_KEY}`;
            
            console.log('🌐 Fetching news from NewsAPI...', { query, url: apiUrl.replace(NEWS_API_KEY, '***') });

            const response = await fetch(apiUrl);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ NewsAPI HTTP Error:', response.status, response.statusText, errorText);
                throw new Error(`NewsAPI error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            // Check if NewsAPI returned an error in the response
            if (data.status === 'error') {
                console.error('❌ NewsAPI Error Response:', data.message || data.code);
                throw new Error(data.message || 'NewsAPI returned an error');
            }

            // Check if articles array exists
            if (!data.articles || !Array.isArray(data.articles)) {
                console.error('❌ Invalid NewsAPI response format:', data);
                throw new Error('Invalid response format from NewsAPI');
            }

            console.log(`✅ Successfully fetched ${data.articles.length} articles from NewsAPI`);

            // Transform API response to our interface if needed
            // NewsAPI response format matches our interface mostly
            const articles = data.articles.map((article: any) => ({
                title: article.title,
                description: article.description,
                url: article.url,
                urlToImage: article.urlToImage,
                publishedAt: article.publishedAt,
                source: {
                    name: article.source.name
                }
            })).slice(0, 6); // Limit to 6 articles

            return articles;

        } catch (error) {
            console.error('❌ Error fetching news:', error);
            console.log('⚠️ Falling back to mock news data');
            return MOCK_NEWS; // Fallback to mock data on error
        }
    }
};
