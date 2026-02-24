import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { trackInvestmentActions } from './GoogleAnalytics';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={() => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        trackInvestmentActions.themeToggle(newTheme);
        toggleTheme();
      }}
      className="btn-icon"
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5" />
      )}
    </button>
  );
}
