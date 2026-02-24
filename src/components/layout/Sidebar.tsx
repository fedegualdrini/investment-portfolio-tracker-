import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, BarChart3, Landmark, Settings, ChevronLeft, ChevronRight, TrendingUp, Sun, Moon, Globe } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const { t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(() => {
    const stored = localStorage.getItem('sidebar-collapsed');
    return stored === 'true';
  });

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', String(collapsed));
  }, [collapsed]);

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: t('nav.dashboard') },
    { path: '/performance', icon: BarChart3, label: t('nav.performance') },
    { path: '/bonds', icon: Landmark, label: t('nav.bonds') },
  ];

  return (
    <aside
      className={`fixed left-0 top-0 h-screen z-20 flex flex-col transition-all duration-300 ${
        collapsed ? 'w-[72px]' : 'w-[240px]'
      } ${className || ''}`}
      style={{ background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border-primary)' }}
    >
      {/* Logo area */}
      <div className={`flex items-center h-16 px-4 ${collapsed ? 'justify-center' : 'gap-3'}`}>
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
          <TrendingUp className="h-5 w-5 text-white" />
        </div>
        {!collapsed && (
          <span className="font-bold text-sm gradient-text truncate">
            InvestTracker
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer group ${
                isActive
                  ? 'text-emerald-500 bg-emerald-500/[0.08]'
                  : 'hover:bg-[var(--bg-card-hover)]'
              } ${collapsed ? 'justify-center' : ''}`
            }
            style={({ isActive }) => isActive ? {
              borderLeft: '3px solid',
              borderImage: 'linear-gradient(to bottom, #10B981, #06B6D4) 1',
              paddingLeft: '9px'
            } : { color: 'var(--text-secondary)' }}
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span>{item.label}</span>}
            {collapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 rounded-md text-xs font-medium opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}>
                {item.label}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="px-3 py-4 space-y-1" style={{ borderTop: '1px solid var(--border-primary)' }}>
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer w-full ${
            collapsed ? 'justify-center' : ''
          }`}
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-card-hover)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
        >
          {theme === 'light' ? <Moon className="h-5 w-5 flex-shrink-0" /> : <Sun className="h-5 w-5 flex-shrink-0" />}
          {!collapsed && <span>{theme === 'light' ? 'Dark mode' : 'Light mode'}</span>}
        </button>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer w-full ${
            collapsed ? 'justify-center' : ''
          }`}
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-card-hover)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          title={collapsed ? t('sidebar.expand') : t('sidebar.collapse')}
        >
          {collapsed ? <ChevronRight className="h-5 w-5 flex-shrink-0" /> : <ChevronLeft className="h-5 w-5 flex-shrink-0" />}
          {!collapsed && <span>{t('sidebar.collapse')}</span>}
        </button>
      </div>
    </aside>
  );
}
