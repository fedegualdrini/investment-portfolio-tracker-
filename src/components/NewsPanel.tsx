import React from 'react';
import { RefreshCw, Newspaper, AlertCircle } from 'lucide-react';
import { NewsCard } from './NewsCard';
import { useNews } from '../hooks/useNews';

interface NewsPanelProps {
  symbols: string[];
}

export const NewsPanel: React.FC<NewsPanelProps> = ({ symbols }) => {
  const { news, isLoading, error, refreshNews } = useNews(symbols);

  if (symbols.length === 0) return null;

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Recent News About Your Holdings</h3>
        </div>
        <button
          onClick={refreshNews}
          disabled={isLoading}
          className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 rounded-lg text-gray-300 text-sm"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-amber-900/20 border border-amber-700/30 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <p className="text-sm text-amber-200/80">{error}</p>
          </div>
        </div>
      )}

      {isLoading && news.length === 0 && (
        <div className="text-center py-8 bg-gray-800/30 rounded-lg">
          <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-3" />
          <p className="text-gray-400">Loading news...</p>
        </div>
      )}

      {!isLoading && news.length === 0 && !error && (
        <div className="text-center py-8 bg-gray-800/30 rounded-lg">
          <p className="text-gray-400">No recent news found.</p>
        </div>
      )}

      {news.length > 0 && (
        <div className="space-y-3">
          {news.map((item, i) => (
            <NewsCard key={i} news={item} />
          ))}
        </div>
      )}
    </div>
  );
};
