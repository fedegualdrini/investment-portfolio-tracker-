import React, { useEffect, useState } from 'react';
import { Newspaper, ExternalLink, RefreshCw } from 'lucide-react';
import { NewsArticle } from '../types/news';
import { newsService } from '../services/newsService';
import { Investment } from '../types/investment';
import { useLanguage } from '../contexts/LanguageContext';

interface NewsFeedProps {
    investments: Investment[];
}

export function NewsFeed({ investments }: NewsFeedProps) {
    const [news, setNews] = useState<NewsArticle[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const { t } = useLanguage();

    const fetchNews = async () => {
        setIsLoading(true);
        try {
            // Extract unique symbols from investments
            const symbols = Array.from(new Set(investments.map(inv => inv.symbol)));
            const articles = await newsService.fetchNews(symbols);
            setNews(articles);
            setLastUpdated(new Date());
        } catch (error) {
            console.error('Failed to fetch news:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNews();
    }, [investments.length]); // Refetch when investments change (added/removed)

    if (investments.length === 0) {
        return null;
    }

    return (
        <div className="brand-card p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <Newspaper className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    <h2 className="brand-heading-md">Market News</h2>
                </div>
                <button
                    onClick={fetchNews}
                    disabled={isLoading}
                    className={`brand-button-icon ${isLoading
                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed'
                            : 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30'
                        }`}
                    title="Refresh News"
                >
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {isLoading && news.length === 0 ? (
                    // Loading skeletons
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="animate-pulse space-y-3">
                            <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                        </div>
                    ))
                ) : news.length > 0 ? (
                    news.map((article, index) => {
                        // Skip articles with invalid URLs (like "#" from mock data)
                        if (!article.url || article.url === '#' || article.url.startsWith('#')) {
                            return (
                                <div
                                    key={index}
                                    className="group block h-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                                >
                                    {article.urlToImage && (
                                        <div className="h-40 overflow-hidden">
                                            <img
                                                src={article.urlToImage}
                                                alt={article.title}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                }}
                                            />
                                        </div>
                                    )}
                                    <div className="p-4 flex flex-col h-[calc(100%-10rem)]">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                                                {article.source.name}
                                            </span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                {new Date(article.publishedAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
                                            {article.title}
                                        </h3>
                                        <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-3 mb-4 flex-grow">
                                            {article.description}
                                        </p>
                                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 font-medium mt-auto">
                                            Sample article (no link available)
                                        </div>
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <a
                                key={index}
                                href={article.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group block h-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all duration-200 hover:border-purple-300 dark:hover:border-purple-700 cursor-pointer"
                            >
                            {article.urlToImage && (
                                <div className="h-40 overflow-hidden">
                                    <img
                                        src={article.urlToImage}
                                        alt={article.title}
                                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                                        onError={(e) => {
                                            // Fallback if image fails to load
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                </div>
                            )}
                            <div className="p-4 flex flex-col h-[calc(100%-10rem)]">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                                        {article.source.name}
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {new Date(article.publishedAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                    {article.title}
                                </h3>
                                <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-3 mb-4 flex-grow">
                                    {article.description}
                                </p>
                                <div className="flex items-center text-xs text-purple-600 dark:text-purple-400 font-medium mt-auto">
                                    Read more <ExternalLink className="h-3 w-3 ml-1" />
                                </div>
                            </div>
                        </a>
                        );
                    })
                ) : (
                    <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
                        No news available for your portfolio symbols.
                    </div>
                )}
            </div>

            {lastUpdated && (
                <div className="mt-4 text-right">
                    <p className="brand-subtext-xs">
                        Last updated: {lastUpdated.toLocaleTimeString()}
                    </p>
                </div>
            )}
        </div>
    );
}
