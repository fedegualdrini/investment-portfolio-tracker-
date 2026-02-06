import type { NewsItem, Sentiment, NewsFetchOptions } from '../lib/news/types';
import { getCachedNews, setCachedNews } from '../lib/news/cache';

const FINNHUB_API_URL = 'https://finnhub.io/api/v1';
const API_KEY = import.meta.env.VITE_FINNHUB_API_KEY || '';

// Simple keyword-based sentiment analysis
const POSITIVE_WORDS = [
  'surges', 'gains', 'rises', 'rally', 'bullish', 'beats', 'exceeds',
  'record', 'high', 'growth', 'profit', 'soars', 'jumps', 'strong',
  'positive', 'upgrade', 'outperform', 'success'
];

const NEGATIVE_WORDS = [
  'falls', 'drops', 'declines', 'bearish', 'misses', 'downgrade',
  'loss', 'crash', 'plunge', 'tumbles', 'weak', 'negative',
  'underperform', 'concern', 'warning', 'cut'
];

function analyzeSentiment(headline: string): Sentiment {
  const lower = headline.toLowerCase();
  let positive = 0;
  let negative = 0;

  POSITIVE_WORDS.forEach((word) => {
    if (lower.includes(word)) positive++;
  });

  NEGATIVE_WORDS.forEach((word) => {
    if (lower.includes(word)) negative++;
  });

  if (positive > negative) return 'positive';
  if (negative > positive) return 'negative';
  return 'neutral';
}

interface FinnhubNewsItem {
  datetime: number;
  headline: string;
  source: string;
  url: string;
  summary: string;
}

async function fetchFromFinnhub(
  endpoint: string,
  params: Record<string, string>
): Promise<any> {
  if (!API_KEY) {
    throw new Error('Finnhub API key not configured');
  }

  const queryParams = new URLSearchParams({ ...params, token: API_KEY });
  const url = `${FINNHUB_API_URL}${endpoint}?${queryParams}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Finnhub API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function fetchNewsForSymbol(
  symbol: string,
  options: NewsFetchOptions = {}
): Promise<NewsItem[]> {
  const { days = 7, forceRefresh = false } = options;

  // Check cache first
  if (!forceRefresh) {
    const cached = getCachedNews(symbol);
    if (cached) return cached;
  }

  // Calculate date range
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const fromStr = startDate.toISOString().split('T')[0];
  const toStr = endDate.toISOString().split('T')[0];

  try {
    const data: FinnhubNewsItem[] = await fetchFromFinnhub('/company-news', {
      symbol: symbol.toUpperCase(),
      from: fromStr,
      to: toStr,
    });

    const items: NewsItem[] = data.slice(0, 10).map((item) => ({
      symbol: symbol.toUpperCase(),
      headline: item.headline,
      source: item.source,
      url: item.url,
      publishedAt: new Date(item.datetime * 1000).toISOString(),
      summary: item.summary,
      sentiment: analyzeSentiment(item.headline),
    }));

    // Cache the results
    setCachedNews(symbol, items);

    return items;
  } catch (error) {
    console.error(`Failed to fetch news for ${symbol}:`, error);
    throw error;
  }
}

export async function fetchGeneralNews(): Promise<NewsItem[]> {
  // Check cache for general news (use 'GENERAL' as key)
  const cached = getCachedNews('GENERAL');
  if (cached) return cached;

  try {
    const data: FinnhubNewsItem[] = await fetchFromFinnhub('/news', {
      category: 'general',
    });

    const items: NewsItem[] = data.slice(0, 10).map((item) => ({
      symbol: 'MARKET',
      headline: item.headline,
      source: item.source,
      url: item.url,
      publishedAt: new Date(item.datetime * 1000).toISOString(),
      summary: item.summary,
      sentiment: analyzeSentiment(item.headline),
    }));

    setCachedNews('GENERAL', items);

    return items;
  } catch (error) {
    console.error('Failed to fetch general news:', error);
    throw error;
  }
}

export async function getNewsForPortfolio(
  symbols: string[],
  options: NewsFetchOptions = {}
): Promise<NewsItem[]> {
  // Fetch news for each symbol in parallel
  const promises = symbols.map((symbol) =>
    fetchNewsForSymbol(symbol, options).catch(() => [])
  );

  const results = await Promise.all(promises);

  // Flatten and sort by date (newest first)
  const allNews = results
    .flat()
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

  // Remove duplicates by URL
  const seen = new Set<string>();
  return allNews.filter((item) => {
    if (seen.has(item.url)) return false;
    seen.add(item.url);
    return true;
  });
}

export { analyzeSentiment };
export type { Sentiment };
