import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BarChart3, Landmark, Plus } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export function MobileBottomNav() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: t('nav.dashboard') },
    { path: '/performance', icon: BarChart3, label: t('nav.performance') },
    { path: '/bonds', icon: Landmark, label: t('nav.bonds') },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-20 md:hidden flex items-center justify-around h-16 safe-area-bottom"
      style={{
        background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-primary)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === '/'}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors ${
              isActive ? 'text-emerald-500' : ''
            }`
          }
          style={({ isActive }) => isActive ? {} : { color: 'var(--text-muted)' }}
        >
          <item.icon className="h-5 w-5" />
          <span className="text-[10px] font-medium">{item.label}</span>
        </NavLink>
      ))}

      {/* Add button */}
      <button
        onClick={() => navigate('/investment/new')}
        className="flex flex-col items-center justify-center gap-1 px-3 py-2"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
          <Plus className="h-4 w-4 text-white" />
        </div>
        <span className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>{t('add')}</span>
      </button>
    </nav>
  );
}
