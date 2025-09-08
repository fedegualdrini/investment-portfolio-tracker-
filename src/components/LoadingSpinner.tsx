import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'white';
  className?: string;
}

export function LoadingSpinner({ 
  size = 'md', 
  color = 'primary', 
  className = '' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  const colorClasses = {
    primary: 'text-purple-600 dark:text-purple-400',
    secondary: 'text-gray-600 dark:text-gray-400',
    white: 'text-white'
  };

  return (
    <div className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]} ${className}`}>
      <svg
        className="w-full h-full"
        fill="none"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
}

interface SkeletonProps {
  className?: string;
  lines?: number;
}

export function Skeleton({ className = '', lines = 1 }: SkeletonProps) {
  if (lines === 1) {
    return (
      <div className={`loading-skeleton h-4 rounded ${className}`} />
    );
  }

  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`loading-skeleton h-4 rounded ${
            index === lines - 1 ? 'w-3/4' : 'w-full'
          } ${className}`}
        />
      ))}
    </div>
  );
}

interface LoadingCardProps {
  className?: string;
}

export function LoadingCard({ className = '' }: LoadingCardProps) {
  return (
    <div className={`brand-card-static p-4 sm:p-6 animate-pulse ${className}`}>
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <div className="loading-skeleton h-5 w-16 rounded" />
            <div className="loading-skeleton h-5 w-12 rounded-full" />
          </div>
          <div className="loading-skeleton h-4 w-24 rounded" />
        </div>
        <div className="flex items-center space-x-1">
          <div className="loading-skeleton h-8 w-8 rounded-lg" />
          <div className="loading-skeleton h-8 w-8 rounded-lg" />
          <div className="loading-skeleton h-8 w-8 rounded-lg" />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <div className="loading-skeleton h-4 w-16 rounded" />
          <div className="loading-skeleton h-4 w-20 rounded" />
        </div>
        <div className="flex justify-between items-center">
          <div className="loading-skeleton h-4 w-20 rounded" />
          <div className="loading-skeleton h-4 w-24 rounded" />
        </div>
        <div className="flex justify-between items-center">
          <div className="loading-skeleton h-4 w-18 rounded" />
          <div className="loading-skeleton h-4 w-22 rounded" />
        </div>
        <hr className="border-gray-200 dark:border-gray-600" />
        <div className="flex justify-between items-center">
          <div className="loading-skeleton h-5 w-20 rounded" />
          <div className="loading-skeleton h-5 w-28 rounded" />
        </div>
        <div className="flex justify-between items-center">
          <div className="loading-skeleton h-4 w-24 rounded" />
          <div className="loading-skeleton h-4 w-16 rounded" />
        </div>
      </div>
    </div>
  );
}

interface LoadingButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export function LoadingButton({ className = '', children }: LoadingButtonProps) {
  return (
    <button
      disabled
      className={`brand-button-primary flex items-center justify-center space-x-2 opacity-75 cursor-not-allowed ${className}`}
    >
      <LoadingSpinner size="sm" color="white" />
      {children && <span>{children}</span>}
    </button>
  );
}
