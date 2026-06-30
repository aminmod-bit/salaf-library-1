import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, Search } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useTranslation } from 'react-i18next';
import LiveStatsBadge from './LiveStatsBadge';
import ThemeToggle from './ThemeToggle';

const navItems = [
  { path: '/', label: 'Главная', key: 'home' },
  { path: '/books', label: 'Книги', key: 'books' },
  { path: '/hadith', label: 'Хадисы', key: 'hadith' },
  { path: '/azkar', label: 'Азкары', key: 'azkar' },
  { path: '/articles', label: 'Статьи', key: 'articles' },
  { path: '/about', label: 'О нас', key: 'about' },
];

export default function Header() {
  const { t } = useTranslation();
  const { setSidebarOpen } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchVal, setSearchVal] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/books?q=${encodeURIComponent(searchVal.trim())}`);
      setSearchVal('');
    }
  };

  return (
    <header className="site-topbar">
      <div className="site-brand" onClick={() => navigate('/')} role="button" tabIndex={0}>
        <img src="./logo-mark.svg" alt="Salaf Library" />
        <div>
          <strong>Salaf Library</strong>
          <span>Исламская библиотека</span>
        </div>
      </div>

      <nav className="site-nav" aria-label="Основная навигация">
        {navItems.map(item => (
          <Link key={item.path} to={item.path} className={location.pathname === item.path ? 'active' : ''}>
            {item.label}
          </Link>
        ))}
      </nav>

      <form onSubmit={handleSearch} className="site-search">
        <Search size={16} />
        <input value={searchVal} onChange={e => setSearchVal(e.target.value)} placeholder="Поиск книг..." />
      </form>

      <div className="site-actions">
        <LiveStatsBadge />
        <ThemeToggle />
        <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)} aria-label="Открыть меню"><Menu size={22}/></button>
      </div>
    </header>
  );
}
