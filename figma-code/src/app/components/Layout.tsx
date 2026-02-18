import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { Home, History, TrendingUp, Settings as SettingsIcon } from 'lucide-react';
import { Button } from './ui/button';

export const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [
    { path: '/', icon: Home, label: 'Today' },
    { path: '/history', icon: History, label: 'History' },
    { path: '/trends', icon: TrendingUp, label: 'Trends' },
    { path: '/settings', icon: SettingsIcon, label: 'Settings' },
  ];

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[--sand]">
      {/* Header */}
      <header className="bg-[--bone] border-b border-[--dust] sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate('/')}
              className="text-2xl text-[--clay] hover:text-[--adobe] transition-colors duration-200"
              style={{ fontFamily: 'var(--font-canela)' }}
            >
              Attune
            </button>
            <nav className="hidden md:flex gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Button
                    key={item.path}
                    variant={isActive ? 'primary' : 'ghost'}
                    onClick={() => navigate(item.path)}
                    className="gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[--bone] border-t border-[--dust] z-10 shadow-lg">
        <div className="grid grid-cols-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center justify-center py-3 gap-1 transition-colors duration-200 ${
                  isActive
                    ? 'text-[--clay]'
                    : 'text-[--dust] hover:text-[--basalt]'
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={isActive ? 2 : 1.5} />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
