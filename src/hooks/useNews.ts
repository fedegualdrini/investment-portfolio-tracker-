import { useState, useCallback, useEffect } from 'react';
import type { NewsItem } from '../lib/news/types';
import { getNewsForPortfolio } from '../services/newsService';

interface UseNewsReturn {
  news: NewsItem[];
  isLoading: boolean;
  error: string | null;
  refreshNews: () => Promise<void>;
}

export function useNews(symbols: string[]): UseNewsReturn {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshNews = useCallback(async () => {
    if (symbols.length === 0) {
      setNews([]);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await getNewsForPortfolio(symbols);
      setNews(data.slice(0, 10));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch news';
      setError(msg.includes('API key') ? 'News requires Finnhub API key' : msg);
    } finally {
      setIsLoading(false);
    }
  }, [symbols]);

  useEffect(() => {
    refreshNews();
  }, [refreshNews]);

  return { news, isLoading, error, refreshNews };
}
