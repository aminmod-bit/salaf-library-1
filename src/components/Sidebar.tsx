import { useStore } from '../store/useStore';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home, BookOpen, Users, Headphones, Sparkles,
  Search, Heart, Clock, Grid3X3, Settings,
  X, BookMarked, Star, Info, MessageSquare, Languages, BookOpenText, WifiOff, Trash2, FolderTree, Palette
} from 'lucide-react';
import Logo from './Logo';
import { clearAllCaches } from '../utils/cache';
import { socialLinks } from '../config/socialLinks';
import toast from 'react-hot-toast';

const navItems = [
  { path: '/', icon: Home, label: 'Главная', key: 'home' },
  { path: '/books', icon: BookOpen, label: 'Книги', key: 'books' },
  { path: '/categories', icon: FolderTree, label: 'Категории', key: 'categories' },
  { path: '/azkar', icon: Sparkles, label: 'Азкары', key: 'azkar' },
  { path: '/hadith', icon: BookOpenText, label: 'Хадисы', key: 'hadith' },
  { path: '/book-languages', icon: Languages, label: 'Книги на разных языках', key: 'bookLanguages' },
  { path: '/articles', icon: BookOpenText, label: 'Статьи', key: 'articles' },
  { path: '/biographies', icon: Users, label: 'Биографии', key: 'biographies' },
];

const userItems = [
  { path: '/favorites', icon: Heart, label: 'Избранное', key: 'favorites' },
  { path: '/offline', icon: WifiOff, label: 'Офлайн', key: 'offline' },
  { path: '/settings/themes', icon: Palette, label: 'Темы', key: 'themes' },
  { path: '/about', icon: Info, label: 'О нас', key: 'about' },
  { path: '/report', icon: MessageSquare, label: 'Ошибка', key: 'report' },
  { path: '__clearCache', icon: Trash2, label: 'Очистить кэш', key: 'clearCache' },
];

export default function Sidebar() {
  const { sidebarOpen, setSidebarOpen, favorites, books } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Filter favorites to only include books that exist
  const validFavorites = favorites.filter(id => books.some(b => b.id === id));

  const handleClearCache = async () => {
    if (!confirm('Очистить кэш приложения?\n\nБудет очищено:\n- Кэш браузера (Service Worker)\n- Сгенерированные обложки\n- Кэш метаданных\n\nНЕ будет удалено:\n- Избранное\n- Книги\n- Админские данные')) return;
    await clearAllCaches();
    toast.success('Кэш очищен. Страница перезагрузится.');
    setTimeout(() => window.location.reload(), 1500);
  };

  const handleNav = (path: string) => {
    if (path === '__clearCache') {
      handleClearCache();
      return;
    }
    navigate(path);
    setSidebarOpen(false);
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            zIndex: 85,
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={sidebarOpen ? 'sidebar-open' : ''}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          width: '260px',
          background: 'var(--color-sidebar-bg)',
          borderRight: '1px solid var(--color-border)',
          zIndex: 90,
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.3s ease, background 0.3s ease',
          overflowY: 'auto',
          transform: sidebarOpen ? 'translateX(0)' : undefined,
        }}
      >
        {/* Logo */}
        <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div
              style={{ cursor: 'pointer', flex: 1, display: 'flex', justifyContent: 'center' }}
              onClick={() => handleNav('/')}
            >
              <Logo size={42} showText />
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              style={{
                background: 'none', border: 'none', color: 'var(--color-text-muted)',
                cursor: 'pointer', padding: '4px', borderRadius: '6px',
                display: 'flex',
              }}
              className="lg:hidden"
            >
              <X size={18} />
            </button>
          </div>

          {/* Arabic text */}
          <div style={{
            marginTop: '12px',
            fontFamily: 'Amiri, serif',
            fontSize: '14px',
            color: 'var(--color-text-secondary)',
            textAlign: 'center',
            direction: 'rtl',
          }}>
            بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
          </div>
        </div>

        {/* Stats */}
        <div style={{
          padding: '12px 20px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px',
          borderBottom: '1px solid var(--color-border)',
        }}>
          {[
            { icon: BookMarked, label: 'Книг', value: books.length + '+' },
            { icon: Star, label: 'Избранных', value: validFavorites.length },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} style={{
              background: 'var(--color-bg-hover)',
              borderRadius: '8px',
              padding: '8px 10px',
              border: '1px solid var(--color-border)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--color-gold)', marginBottom: '2px' }}>
                <Icon size={11} />
                <span style={{ fontSize: '10px', fontWeight: 600 }}>{label}</span>
              </div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)' }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Navigation */}
        <nav style={{ padding: '16px 12px', flex: 1 }}>
          <div style={{ marginBottom: '4px' }}>
            <div style={{
              fontSize: '10px',
              fontWeight: 700,
              color: 'var(--color-text-muted)',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              padding: '0 8px 8px',
            }}>
              Библиотека
            </div>
            {navItems.map(({ path, icon: Icon, label }) => (
              <button
                key={path}
                onClick={() => handleNav(path)}
                className={`nav-link ${isActive(path) ? 'active' : ''}`}
              >
                <Icon size={16} />
                <span>{label}</span>
              </button>
            ))}
          </div>

          <div style={{ marginTop: '16px' }}>
            <div style={{
              fontSize: '10px',
              fontWeight: 700,
              color: 'var(--color-text-muted)',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              padding: '0 8px 8px',
            }}>
              Личное
            </div>
            {userItems.map(({ path, icon: Icon, label }) => (
              <button
                key={path}
                onClick={() => handleNav(path)}
                className={`nav-link ${isActive(path) ? 'active' : ''}`}
              >
                <Icon size={16} />
                <span>{label}</span>
                {path === '/favorites' && validFavorites.length > 0 && (
                  <span style={{
                    marginLeft: 'auto',
                    background: 'rgba(212,175,55,0.2)',
                    color: 'var(--color-gold)',
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: '100px',
                  }}>
                    {validFavorites.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </nav>

        {/* Admin & Bottom */}
        <div style={{
          padding: '12px 12px 20px',
          borderTop: '1px solid var(--color-border)',
        }}>
          <button
            onClick={() => handleNav('/admin')}
            className={`nav-link ${isActive('/admin') ? 'active' : ''}`}
          >
            <Settings size={16} />
            <span>Админ-панель</span>
          </button>

          <div style={{
            marginTop: '16px',
            padding: '12px',
            background: 'var(--color-bg-hover)',
            borderRadius: '10px',
            border: '1px solid var(--color-border)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
              Salaf Library v1.0
            </div>
            <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
              Работает офлайн
            </div>
            {/* Social links */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <a href={socialLinks.telegram} target="_blank" rel="noopener noreferrer"
                style={{ color: 'var(--color-text-muted)', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#2AABEE')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
              </a>
              <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer"
                style={{ color: 'var(--color-text-muted)', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#FF0000')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
              <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer"
                style={{ color: 'var(--color-text-muted)', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#E4405F')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.197-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
