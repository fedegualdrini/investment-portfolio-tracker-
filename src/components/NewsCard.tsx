import React from 'react';
import { ExternalLink } from 'lucide-react';
import type { NewsItem, Sentiment } from '../lib/news/types';

interface NewsCardProps {
  news: NewsItem;
}

const sentimentColors: Record<Sentiment, string> = {
  positive: 'bg-emerald-500',
  negative: 'bg-red-500',
  neutral: 'bg-gray-500',
};

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export const NewsCard: React.FC<NewsCardProps> = ({ news }) => (
  <a
    href={news.url}
    target="_blank"
    rel="noopener noreferrer"
    className="block bg-gray-800/50 border border-gray-700 hover:border-gray-600 rounded-lg p-4 transition-colors group"
  >
    <div className="flex items-start gap-3">
      <div className={`w-2 h-2 rounded-full mt-2 ${sentimentColors[news.sentiment]}`} />
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-gray-100 group-hover:text-emerald-400 line-clamp-2">
          {news.headline}
        </h4>
        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
          <span className="text-gray-400">{news.source}</span>
          <span>•</span>
          <span>{formatTimeAgo(news.publishedAt)}</span>
          {news.symbol !== 'MARKET' && (
            <>
              <span>•</span>
              <span className="px-1.5 py-0.5 bg-gray-700 rounded">{news.symbol}</span>
            </>
          )}
        </div>
      </div>
      <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-gray-400 flex-shrink-0" />
    </div>
  </a>
);
