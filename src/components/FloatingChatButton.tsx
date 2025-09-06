import { Bot } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface FloatingChatButtonProps {
  onClick: () => void;
}

export function FloatingChatButton({ onClick }: FloatingChatButtonProps) {
  const { t } = useLanguage();

  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-50 animate-pulse hover:animate-none"
      title={t('chat.title')}
    >
      <Bot className="h-6 w-6" />
    </button>
  );
}