import React from 'react';
import { Loader2 } from 'lucide-react';
import { LoadingSpinnerProps } from '../types/performance';

export function LoadingSpinner({ message = 'Loading performance data...' }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-emerald-500 mb-4" />
      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{message}</p>
    </div>
  );
}

// LoadingCard component for investment card placeholders
export function LoadingCard() {
  return (
    <div className="glass-card-static p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 shimmer-loading rounded-lg"></div>
          <div>
            <div className="h-4 shimmer-loading rounded w-20 mb-2"></div>
            <div className="h-3 shimmer-loading rounded w-16"></div>
          </div>
        </div>
        <div className="w-6 h-6 shimmer-loading rounded"></div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between">
          <div className="h-3 shimmer-loading rounded w-16"></div>
          <div className="h-3 shimmer-loading rounded w-20"></div>
        </div>
        <div className="flex justify-between">
          <div className="h-3 shimmer-loading rounded w-12"></div>
          <div className="h-3 shimmer-loading rounded w-16"></div>
        </div>
        <div className="flex justify-between">
          <div className="h-3 shimmer-loading rounded w-14"></div>
          <div className="h-3 shimmer-loading rounded w-18"></div>
        </div>
      </div>

      <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border-primary)' }}>
        <div className="h-3 shimmer-loading rounded w-24"></div>
      </div>
    </div>
  );
}