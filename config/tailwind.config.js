/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        fintech: {
          dark: '#0B0F19',
          darker: '#070A12',
          card: '#131825',
          'card-hover': '#1A2035',
          border: 'rgba(255,255,255,0.06)',
          'border-hover': 'rgba(255,255,255,0.12)',
        },
        accent: {
          emerald: '#10B981',
          cyan: '#06B6D4',
          violet: '#8B5CF6',
        },
        gain: {
          DEFAULT: '#10B981',
          bg: 'rgba(16,185,129,0.1)',
          'bg-strong': 'rgba(16,185,129,0.2)',
        },
        loss: {
          DEFAULT: '#EF4444',
          bg: 'rgba(239,68,68,0.1)',
          'bg-strong': 'rgba(239,68,68,0.2)',
        },
        type: {
          crypto: '#F97316',
          stock: '#8B5CF6',
          bond: '#3B82F6',
          etf: '#10B981',
          commodity: '#F59E0B',
          cash: '#14B8A6',
          other: '#6B7280',
        },
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0,0,0,0.12)',
        'glass-lg': '0 16px 48px rgba(0,0,0,0.2)',
        'glow-emerald': '0 0 20px rgba(16,185,129,0.15)',
        'glow-cyan': '0 0 20px rgba(6,182,212,0.15)',
        'glow-accent': '0 0 30px rgba(16,185,129,0.2), 0 0 60px rgba(6,182,212,0.1)',
      },
      backgroundImage: {
        'gradient-accent': 'linear-gradient(135deg, #10B981, #06B6D4)',
        'gradient-accent-hover': 'linear-gradient(135deg, #059669, #0891B2)',
        'gradient-card': 'linear-gradient(135deg, rgba(16,185,129,0.05), rgba(6,182,212,0.05))',
        'gradient-dark': 'linear-gradient(180deg, #0B0F19, #070A12)',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.4s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-in-up': 'slideInUp 0.3s ease-out',
        'shimmer': 'shimmer 2s infinite',
        'spin-slow': 'spin 2s linear infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(-16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInUp: {
          '0%': { opacity: '0', transform: 'translateY(100%)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200px 0' },
          '100%': { backgroundPosition: 'calc(200px + 100%) 0' },
        },
      },
    },
  },
  plugins: [],
};
