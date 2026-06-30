import { useLocation, useNavigate } from 'react-router-dom';
import { Home, BookOpen, Sparkles, BookOpenText, Heart } from 'lucide-react';

const items = [
  { path: '/', icon: Home, label: 'Главная' },
  { path: '/books', icon: BookOpen, label: 'Книги' },
  { path: '/azkar', icon: Sparkles, label: 'Азкары' },
  { path: '/hadith', icon: BookOpenText, label: 'Хадисы' },
  { path: '/favorites', icon: Heart, label: 'Избранное' },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <style>{`
        .bottom-nav {
          display: none;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 90;
          background: var(--color-bg-glass);
          backdrop-filter: blur(20px);
          border-top: 1px solid var(--color-border);
          padding: 6px 0;
          padding-bottom: max(6px, env(safe-area-inset-bottom));
        }
        .bottom-nav-inner {
          display: flex;
          justify-content: space-around;
          max-width: 500px;
          margin: 0 auto;
        }
        .bottom-nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          padding: 6px 12px;
          border: none;
          background: none;
          color: var(--color-text-muted);
          font-size: 10px;
          font-weight: 600;
          cursor: pointer;
          border-radius: 12px;
          transition: all 0.2s ease;
          min-width: 56px;
        }
        .bottom-nav-item.active {
          color: var(--color-gold);
          background: rgba(212, 175, 55, 0.1);
        }
        .bottom-nav-item:active {
          transform: scale(0.92);
        }
        @media (max-width: 768px) {
          .bottom-nav {
            display: block;
          }
          .page-content {
            padding-bottom: 80px !important;
          }
          .audio-player-bar {
            left: 0 !important;
            bottom: 64px !important;
          }
        }
      `}</style>

      <nav className="bottom-nav">
        <div className="bottom-nav-inner">
          {items.map(({ path, icon: Icon, label }) => (
            <button
              key={path}
              className={`bottom-nav-item ${isActive(path) ? 'active' : ''}`}
              onClick={() => navigate(path)}
            >
              <Icon size={20} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}
