import { useStore } from '../store/useStore';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Home, BookOpen, Users, Headphones, Sparkles,
  Search, Heart, Clock, Grid3X3, Settings,
  X, BookMarked, Star, Info, MessageSquare, Languages, BookOpenText
} from 'lucide-react';

const navItems = [
  { path: '/', icon: Home, label: 'Главная', key: 'home' },
  { path: '/dashboard', icon: BookOpen, label: 'Панель', key: 'dashboard' },
  { path: '/books', icon: BookOpen, label: 'Книги', key: 'books' },
  { path: '/azkar', icon: Sparkles, label: 'Азкары', key: 'azkar' },
  { path: '/book-languages', icon: Languages, label: 'Книги на разных языках', key: 'bookLanguages' },
  { path: '/articles', icon: BookOpenText, label: 'Статьи', key: 'articles' },
  { path: '/biographies', icon: Users, label: 'Биографии', key: 'biographies' },
  { path: '/categories', icon: Grid3X3, label: 'Категории', key: 'categories' },
];

const userItems = [
  { path: '/search', icon: Search, label: 'Поиск', key: 'search' },
  { path: '/favorites', icon: Heart, label: 'Избранное', key: 'favorites' },
  { path: '/history', icon: Clock, label: 'История', key: 'history' },
  { path: '/goals', icon: Sparkles, label: 'Цели', key: 'goals' },
  { path: '/reading-plans', icon: BookOpen, label: 'Планы', key: 'readingPlans' },
  { path: '/about', icon: Info, label: 'О проекте', key: 'about' },
  { path: '/report', icon: MessageSquare, label: 'Ошибка', key: 'report' },
];

export default function Sidebar() {
  const { t } = useTranslation();
  const { sidebarOpen, setSidebarOpen, favorites, books } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleNav = (path: string) => {
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
          background: 'linear-gradient(180deg, #0a1f12 0%, #091810 100%)',
          borderRight: '1px solid rgba(212, 175, 55, 0.1)',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.3s ease',
          overflowY: 'auto',
        }}
      >
        {/* Logo */}
        <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(212,175,55,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div
              style={{ cursor: 'pointer' }}
              onClick={() => handleNav('/')}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '4px',
              }}>
                <img
                  src="./logo-mark.svg"
                  alt="Salaf Library"
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '12px',
                    boxShadow: '0 4px 16px rgba(212, 175, 55, 0.28)',
                  }}
                />
                <div>
                  <div style={{
                    fontSize: '18px',
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #d4af37, #f0c84a)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    lineHeight: 1.1,
                  }}>
                    Salaf Library
                  </div>
                  <div style={{ fontSize: '10px', color: '#5a7a63', letterSpacing: '1px', textTransform: 'uppercase' }}>
                    Исламская библиотека
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              style={{
                background: 'none', border: 'none', color: '#5a7a63',
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
            color: '#9db8a3',
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
          borderBottom: '1px solid rgba(212,175,55,0.1)',
        }}>
          {[
            { icon: BookMarked, label: 'Книг', value: books.length + '+' },
            { icon: Star, label: 'Избранных', value: favorites.length },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} style={{
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '8px',
              padding: '8px 10px',
              border: '1px solid rgba(212,175,55,0.08)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#d4af37', marginBottom: '2px' }}>
                <Icon size={11} />
                <span style={{ fontSize: '10px', fontWeight: 600 }}>{label}</span>
              </div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#f0f4f1' }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Navigation */}
        <nav style={{ padding: '16px 12px', flex: 1 }}>
          <div style={{ marginBottom: '4px' }}>
            <div style={{
              fontSize: '10px',
              fontWeight: 700,
              color: '#5a7a63',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              padding: '0 8px 8px',
            }}>
              Библиотека
            </div>
            {navItems.map(({ path, icon: Icon, label, key }) => (
              <button
                key={path}
                onClick={() => handleNav(path)}
                className={`nav-link ${isActive(path) ? 'active' : ''}`}
              >
                <Icon size={16} />
                <span>{t(`nav.${key}`, label)}</span>
              </button>
            ))}
          </div>

          <div style={{ marginTop: '16px' }}>
            <div style={{
              fontSize: '10px',
              fontWeight: 700,
              color: '#5a7a63',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              padding: '0 8px 8px',
            }}>
              Личное
            </div>
            {userItems.map(({ path, icon: Icon, label, key }) => (
              <button
                key={path}
                onClick={() => handleNav(path)}
                className={`nav-link ${isActive(path) ? 'active' : ''}`}
              >
                <Icon size={16} />
                <span>{t(`nav.${key}`, label)}</span>
                {path === '/favorites' && favorites.length > 0 && (
                  <span style={{
                    marginLeft: 'auto',
                    background: 'rgba(212,175,55,0.2)',
                    color: '#d4af37',
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: '100px',
                  }}>
                    {favorites.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </nav>

        {/* Admin & Bottom */}
        <div style={{
          padding: '12px 12px 20px',
          borderTop: '1px solid rgba(212,175,55,0.1)',
        }}>
          <button
            onClick={() => handleNav('/admin')}
            className={`nav-link ${isActive('/admin') ? 'active' : ''}`}
          >
            <Settings size={16} />
            <span>{t('nav.admin', 'Админ-панель')}</span>
          </button>

          <div style={{
            marginTop: '16px',
            padding: '12px',
            background: 'rgba(212,175,55,0.05)',
            borderRadius: '10px',
            border: '1px solid rgba(212,175,55,0.1)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '11px', color: '#5a7a63', marginBottom: '4px' }}>
              Salaf Library v1.0
            </div>
            <div style={{ fontSize: '10px', color: '#3d5a45' }}>
              Работает офлайн
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
