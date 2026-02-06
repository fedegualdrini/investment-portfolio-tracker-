/**
 * Types for news service
 */

export type Sentiment = 'positive' | 'negative' | 'neutral';

export interface NewsItem {
  symbol: string;
  headline: string;
  source: string;
  url: string;
  publishedAt: string;
  summary?: string;
  sentiment: Sentiment;
}

export interface NewsCache {
  symbol: string;
  items: NewsItem[];
  fetchedAt: string;
  expiresAt: string;
}

export interface NewsCacheStore {
  [symbol: string]: NewsCache;
}

export interface NewsFetchOptions {
  days?: number;
  forceRefresh?: boolean;
}
