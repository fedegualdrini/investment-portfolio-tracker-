import React from 'react';
import { Loader2 } from 'lucide-react';
import { LoadingSpinnerProps } from '../types/performance';

export function LoadingSpinner({ message = 'Loading performance data...' }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-purple-600 dark:text-purple-400 mb-4" />
      <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>
    </div>
  );
}