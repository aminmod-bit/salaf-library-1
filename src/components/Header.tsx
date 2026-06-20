import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Menu, Bell, ChevronRight } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

const pageNames: Record<string, string> = {
  '/': 'Главная',
  '/books': 'Книги',
  '/biographies': 'Биографии',
  '/audio': 'Аудиоуроки',
  '/fawaid': 'Фаваиды',
  '/search': 'Поиск',
  '/favorites': 'Избранное',
  '/history': 'История',
  '/categories': 'Категории',
  '/admin': 'Админ-панель',
  '/about': 'О проекте',
  '/report': 'Сообщить об ошибке',
  '/quran': 'Коран',
  '/book-languages': 'Языки книг',
};

export default function Header() {
  const { t } = useTranslation();
  const { setSidebarOpen } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchVal, setSearchVal] = useState('');

  const pageNameRaw = pageNames[location.pathname] ||
    (location.pathname.startsWith('/books/') ? 'Книга' :
      location.pathname.startsWith('/biographies/') ? 'Биография' : 'Страница');
  const pageName = location.pathname === '/' ? t('nav.home', pageNameRaw)
    : location.pathname === '/books' ? t('nav.books', pageNameRaw)
    : location.pathname === '/quran' ? t('nav.quran', pageNameRaw)
    : location.pathname === '/book-languages' ? t('nav.bookLanguages', pageNameRaw)
    : location.pathname === '/biographies' ? t('nav.biographies', pageNameRaw)
    : location.pathname === '/audio' ? t('nav.audio', pageNameRaw)
    : location.pathname === '/fawaid' ? t('nav.fawaid', pageNameRaw)
    : location.pathname === '/search' ? t('nav.search', pageNameRaw)
    : location.pathname === '/favorites' ? t('nav.favorites', pageNameRaw)
    : location.pathname === '/history' ? t('nav.history', pageNameRaw)
    : location.pathname === '/about' ? t('nav.about', pageNameRaw)
    : location.pathname === '/report' ? t('nav.report', pageNameRaw)
    : pageNameRaw;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchVal.trim())}`);
      setSearchVal('');
    }
  };

  return (
    <header style={{
      height: '64px',
      background: 'rgba(10, 26, 15, 0.95)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(212, 175, 55, 0.1)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 24px',
      gap: '16px',
      position: 'sticky',
      top: 0,
      zIndex: 30,
    }}>
      {/* Mobile menu btn */}
      <button
        onClick={() => setSidebarOpen(true)}
        style={{
          background: 'none',
          border: 'none',
          color: '#9db8a3',
          cursor: 'pointer',
          padding: '6px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
        }}
        className="lg:hidden"
      >
        <Menu size={22} />
      </button>

      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
        <span style={{ fontSize: '12px', color: '#5a7a63' }}>Salaf Library</span>
        <ChevronRight size={12} color="#5a7a63" />
        <span style={{ fontSize: '14px', fontWeight: 600, color: '#f0f4f1' }}>{pageName}</span>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="header-search" style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(212,175,55,0.15)',
          borderRadius: '10px',
          padding: '6px 14px',
          width: '280px',
          transition: 'all 0.3s ease',
        }}>
          <Search size={15} color="#5a7a63" />
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="Поиск по библиотеке..."
            style={{
              background: 'none',
              border: 'none',
              outline: 'none',
              color: '#f0f4f1',
              fontSize: '14px',
              width: '100%',
              fontFamily: 'inherit',
            }}
          />
        </div>
      </form>

      {/* Notification */}
      <LanguageSwitcher />

      <style>{`@media (max-width: 720px) { .header-search { display: none !important; } }`}</style>

      <button style={{ 
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(212,175,55,0.15)',
        borderRadius: '10px',
        padding: '8px',
        color: '#9db8a3',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
      }}>
        <Bell size={18} />
        <span style={{
          position: 'absolute',
          top: '6px',
          right: '6px',
          width: '6px',
          height: '6px',
          background: '#d4af37',
          borderRadius: '50%',
        }} />
      </button>
    </header>
  );
}
