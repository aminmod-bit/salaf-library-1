import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Home, BookOpen, Headphones, Users, Star, Heart, History,
  LayoutDashboard, Settings, Shield, Menu, X, Search, Globe
} from 'lucide-react';
import { useAppStore } from '../store';
import { cn } from '../utils/cn';
import i18n from '../i18n';

const navItems = [
  { path: '/', icon: Home, key: 'home' },
  { path: '/books', icon: BookOpen, key: 'books' },
  { path: '/audio', icon: Headphones, key: 'audio' },
  { path: '/biographies', icon: Users, key: 'biographies' },
  { path: '/fawaid', icon: Star, key: 'fawaid' },
  { path: '/favorites', icon: Heart, key: 'favorites' },
  { path: '/history', icon: History, key: 'history' },
  { path: '/dashboard', icon: LayoutDashboard, key: 'dashboard' },
];

const bottomNavItems = [
  { path: '/settings', icon: Settings, key: 'settings' },
  { path: '/admin', icon: Shield, key: 'admin' },
];

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const { sidebarOpen, setSidebarOpen, language, setLanguage } = useAppStore();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname, setSidebarOpen]);

  const cycleLanguage = () => {
    const langs = ['ru', 'en', 'ar'];
    const next = langs[(langs.indexOf(language) + 1) % langs.length];
    setLanguage(next);
    i18n.changeLanguage(next);
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-full w-64 flex-col bg-slate-900 border-r border-slate-800/50 transition-transform duration-300 ease-out',
          'flex flex-col',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-800/50">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-900/30">
            <svg viewBox="0 0 36 36" fill="none" className="w-5 h-5">
              <rect x="4" y="4" width="10" height="28" rx="2" fill="rgba(255,255,255,0.9)"/>
              <rect x="16" y="4" width="10" height="28" rx="2" fill="rgba(255,255,255,0.7)"/>
              <rect x="28" y="6" width="4" height="24" rx="1" fill="rgba(255,255,255,0.5)"/>
            </svg>
          </div>
          <div>
            <div className="text-base font-semibold text-white tracking-wide">Maktabah</div>
            <div className="text-xs text-slate-500 font-medium">مكتبة</div>
          </div>
          <button
            className="ml-auto lg:hidden text-slate-400 hover:text-white p-1"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ path, icon: Icon, key }) => (
            <Link
              key={path}
              to={path}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                isActive(path)
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              )}
            >
              <Icon size={17} className={cn(isActive(path) ? 'text-amber-400' : 'text-slate-500')} />
              {t(key)}
            </Link>
          ))}
        </nav>

        {/* Bottom nav */}
        <div className="px-3 py-4 border-t border-slate-800/50 space-y-0.5">
          {bottomNavItems.map(({ path, icon: Icon, key }) => (
            <Link
              key={path}
              to={path}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                isActive(path)
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              )}
            >
              <Icon size={17} className={cn(isActive(path) ? 'text-amber-400' : 'text-slate-500')} />
              {t(key)}
            </Link>
          ))}

          <button
            onClick={cycleLanguage}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 transition-all duration-150"
          >
            <Globe size={17} className="text-slate-500" />
            <span>{language.toUpperCase()}</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-64 min-w-0">
        {/* Top bar */}
        <header
          className={cn(
            'sticky top-0 z-30 flex items-center gap-3 px-4 py-3 lg:px-6 border-b border-slate-800/50 transition-all duration-200',
            scrolled ? 'bg-slate-950/95 backdrop-blur-xl shadow-lg shadow-black/20' : 'bg-slate-950'
          )}
        >
          <button
            className="lg:hidden text-slate-400 hover:text-white p-2 -ml-2 rounded-lg hover:bg-slate-800/60 transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>

          {/* Page title based on route */}
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-semibold text-slate-200 truncate">
              {navItems.find(n => isActive(n.path))
                ? t(navItems.find(n => isActive(n.path))!.key)
                : bottomNavItems.find(n => isActive(n.path))
                ? t(bottomNavItems.find(n => isActive(n.path))!.key)
                : 'Maktabah'}
            </h1>
          </div>

          <Link
            to="/search"
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-400 bg-slate-800/60 hover:bg-slate-800 rounded-lg transition-colors border border-slate-700/50"
          >
            <Search size={15} />
            <span className="hidden sm:inline">{t('search')}</span>
          </Link>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-800/50 px-6 py-4 text-center">
          <p className="text-xs text-slate-600">
            <span className="text-amber-600 font-semibold">Maktabah</span>
            {' · '}
            <span>{t('footerTagline')}</span>
            {' · '}
            <span>© {new Date().getFullYear()}</span>
          </p>
        </footer>
      </div>
    </div>
  );
}
