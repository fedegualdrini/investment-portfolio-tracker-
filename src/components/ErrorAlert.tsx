import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { ErrorAlertProps } from '../types/performance';

export function ErrorAlert({ message, onRetry }: ErrorAlertProps) {
  return (
    <div className="glass-card-static" style={{ borderLeft: '3px solid #EF4444' }}>
      <div className="flex items-start p-4">
        <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-400">Error loading performance data</h3>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>{message}</p>
          <button onClick={onRetry} className="mt-3 btn-ghost text-red-400 hover:text-red-300 flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}
