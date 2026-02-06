import type { NewsCache, NewsCacheStore, NewsItem } from './types';

const CACHE_KEY = 'portfolio-news-cache';
const DEFAULT_CACHE_MINUTES = 60;

function getStore(): NewsCacheStore {
  try {
    const stored = localStorage.getItem(CACHE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function saveStore(store: NewsCacheStore): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(store));
  } catch (e) {
    console.warn('Failed to save news cache:', e);
  }
}

export function getCachedNews(symbol: string): NewsItem[] | null {
  const store = getStore();
  const cached = store[symbol.toUpperCase()];

  if (!cached) return null;

  const now = new Date().toISOString();
  if (now > cached.expiresAt) {
    // Expired - remove it
    delete store[symbol.toUpperCase()];
    saveStore(store);
    return null;
  }

  return cached.items;
}

export function setCachedNews(symbol: string, items: NewsItem[]): void {
  const store = getStore();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + DEFAULT_CACHE_MINUTES * 60 * 1000);

  store[symbol.toUpperCase()] = {
    symbol: symbol.toUpperCase(),
    items,
    fetchedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };

  saveStore(store);
}

export function clearExpiredCache(): void {
  const store = getStore();
  const now = new Date().toISOString();
  let changed = false;

  Object.keys(store).forEach((key) => {
    if (store[key].expiresAt < now) {
      delete store[key];
      changed = true;
    }
  });

  if (changed) {
    saveStore(store);
  }
}

export function clearAllCache(): void {
  localStorage.removeItem(CACHE_KEY);
}
