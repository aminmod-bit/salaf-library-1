import { useStore } from '../store/useStore';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home, BookOpen, Users, Headphones, Sparkles,
  Search, Heart, Clock, Grid3X3, Settings,
  X, BookMarked, Star, Info, MessageSquare, Languages, BookOpenText, WifiOff, Trash2, FolderTree
} from 'lucide-react';
import Logo from './Logo';
import { clearAllCaches } from '../utils/cache';
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
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
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
          zIndex: 50,
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
            <div style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
              Работает офлайн
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
