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

    const apiKey = import.meta.env.VITE_FINNHUB_API_KEY;
    if (!apiKey) {
      setNews([]);
      setError('To enable News, set VITE_FINNHUB_API_KEY (Finnhub).');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await getNewsForPortfolio(symbols);
      setNews(data.slice(0, 10));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch news';
      setError(msg.includes('API key') ? 'News is enabled but the Finnhub API key is missing/invalid.' : msg);
    } finally {
      setIsLoading(false);
    }
  }, [symbols]);

  useEffect(() => {
    refreshNews();
  }, [refreshNews]);

  return { news, isLoading, error, refreshNews };
}
