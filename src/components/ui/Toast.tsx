import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useToast, type Toast as ToastType } from '../../contexts/ToastContext';

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const colorMap = {
  success: {
    border: '#10B981',
    icon: '#10B981',
    bg: 'rgba(16,185,129,0.1)',
  },
  error: {
    border: '#EF4444',
    icon: '#EF4444',
    bg: 'rgba(239,68,68,0.1)',
  },
  info: {
    border: '#3B82F6',
    icon: '#3B82F6',
    bg: 'rgba(59,130,246,0.1)',
  },
  warning: {
    border: '#F59E0B',
    icon: '#F59E0B',
    bg: 'rgba(245,158,11,0.1)',
  },
};

function ToastItem({ toast }: { toast: ToastType }) {
  const { removeToast } = useToast();
  const [progress, setProgress] = useState(100);
  const [isExiting, setIsExiting] = useState(false);

  const Icon = iconMap[toast.type];
  const colors = colorMap[toast.type];

  useEffect(() => {
    const duration = 4000;
    const interval = 50;
    const decrement = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - decrement;
      });
    }, interval);

    return () => clearInterval(timer);
  }, []);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => removeToast(toast.id), 200);
  };

  return (
    <div
      className={`relative overflow-hidden rounded-lg shadow-glass transition-all duration-200 ${
        isExiting ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0 animate-slide-in-right'
      }`}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-primary)',
        borderLeft: `3px solid ${colors.border}`,
        maxWidth: '400px',
        width: '100%',
      }}
    >
      <div className="flex items-start gap-3 p-4">
        <div className="flex-shrink-0 mt-0.5">
          <Icon className="h-5 w-5" style={{ color: colors.icon }} />
        </div>
        <p className="flex-1 text-sm" style={{ color: 'var(--text-primary)' }}>
          {toast.message}
        </p>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 btn-icon p-1"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 h-0.5 transition-all duration-50 ease-linear"
        style={{
          width: `${progress}%`,
          background: colors.border,
          opacity: 0.5,
        }}
      />
    </div>
  );
}

export function ToastContainer() {
  const { toasts } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
