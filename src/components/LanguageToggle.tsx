import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { trackInvestmentActions } from './GoogleAnalytics';

export function LanguageToggle() {
  const { language, setLanguage, t } = useLanguage();

  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'es' : 'en';
    trackInvestmentActions.languageToggle(newLanguage);
    setLanguage(newLanguage);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="btn-icon flex items-center gap-1.5"
      title={language === 'en' ? 'Cambiar a Español' : 'Switch to English'}
    >
      <Globe className="h-4 w-4" />
      <span className="text-xs font-medium">{language === 'en' ? 'ES' : 'EN'}</span>
    </button>
  );
}
