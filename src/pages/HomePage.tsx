import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, BookOpen, Users, Sparkles, BookOpenText,
  ArrowRight, Star, Clock, TrendingUp, ChevronRight,
  Heart, Library, Feather
} from 'lucide-react';
import { useStore } from '../store/useStore';

const quickLinks = [
  { path: '/books', icon: BookOpen, label: 'Книги', color: 'var(--color-green-primary)', desc: 'Электронная библиотека' },
  { path: '/azkar', icon: Sparkles, label: 'Азкары', color: '#2563eb', desc: 'Поминания и дуа' },
  { path: '/hadith', icon: BookOpenText, label: 'Хадисы', color: '#9333ea', desc: 'Сборники хадисов' },
  { path: '/biographies', icon: Users, label: 'Биографии', color: '#dc2626', desc: 'Учёные и сподвижники' },
  { path: '/articles', icon: Feather, label: 'Статьи', color: '#ea580c', desc: 'Полезные материалы' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { books, isLoading } = useStore();
  const [searchVal, setSearchVal] = useState('');

  const featured = books.filter(b => b.featured).slice(0, 6);
  const newBooks = books.filter(b => b.isNew).slice(0, 6);
  const popular = [...books].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 6);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/books?q=${encodeURIComponent(searchVal.trim())}`);
    }
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="pulse-gold" style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-gold)' }}>
          Salaf Library
        </div>
      </div>
    );
  }

  return (
    <main className="fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Hero Section */}
      <section style={{
        position: 'relative',
        borderRadius: '24px',
        overflow: 'hidden',
        marginBottom: '40px',
        padding: '60px 40px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, var(--color-bg-secondary) 0%, var(--color-bg-card) 100%)',
        border: '1px solid var(--color-border)',
      }}>
        {/* Geometric pattern overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.06,
          backgroundImage: `radial-gradient(circle at 1px 1px, var(--color-gold) 1px, transparent 0)`,
          backgroundSize: '32px 32px',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            width: '64px',
            height: '64px',
            margin: '0 auto 20px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, var(--color-gold), var(--color-gold-light))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(212, 175, 55, 0.3)',
          }}>
            <Library size={32} color="#0a1a0f" />
          </div>

          <h1 style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: 'clamp(28px, 5vw, 48px)',
            fontWeight: 900,
            color: 'var(--color-text-primary)',
            marginBottom: '12px',
            lineHeight: 1.1,
          }}>
            Salaf Library
          </h1>

          <p style={{
            fontSize: '16px',
            color: 'var(--color-text-secondary)',
            maxWidth: '500px',
            margin: '0 auto 28px',
            lineHeight: 1.6,
          }}>
            Достоверные исламские книги, хадисы и исследования в соответствии с пониманием праведных предшественников
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} style={{
            maxWidth: '520px',
            margin: '0 auto',
            display: 'flex',
            gap: '8px',
          }}>
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '14px 18px',
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
              borderRadius: '14px',
              transition: 'border-color 0.2s',
            }}>
              <Search size={18} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
              <input
                value={searchVal}
                onChange={e => setSearchVal(e.target.value)}
                placeholder="Поиск книг, авторов, тем..."
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  color: 'var(--color-text-primary)',
                  fontSize: '15px',
                }}
              />
            </div>
            <button type="submit" className="btn-primary" style={{ padding: '14px 24px' }}>
              Найти
            </button>
          </form>

          {/* Stats */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '32px',
            marginTop: '28px',
            flexWrap: 'wrap',
          }}>
            {[
              { value: books.length, label: 'Книг' },
              { value: '5+', label: 'Разделов' },
              { value: '24/7', label: 'Доступ' },
            ].map(({ value, label }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-gold)' }}>{value}</div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
          {quickLinks.map(({ path, icon: Icon, label, color, desc }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              style={{
                flex: '1 1 180px',
                minWidth: '180px',
                padding: '20px',
                borderRadius: '16px',
                border: '1px solid var(--color-border)',
                background: 'var(--color-bg-card)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                transition: 'all 0.2s ease',
                textAlign: 'left',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--color-border-hover)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--color-border)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Icon size={20} color="#fff" />
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary)' }}>{label}</div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>{desc}</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Featured Books */}
      {featured.length > 0 && (
        <section style={{ marginBottom: '40px' }}>
          <SectionHeader icon={Star} title="Рекомендуем" count={featured.length} onSeeAll={() => navigate('/books')} />
          <div className="books-grid">
            {featured.map(book => (
              <BookCard key={book.id} book={book} onClick={() => navigate(`/books/${book.id}`)} />
            ))}
          </div>
        </section>
      )}

      {/* New Arrivals */}
      {newBooks.length > 0 && (
        <section style={{ marginBottom: '40px' }}>
          <SectionHeader icon={Clock} title="Новинки" count={newBooks.length} onSeeAll={() => navigate('/books')} />
          <div className="books-grid">
            {newBooks.map(book => (
              <BookCard key={book.id} book={book} onClick={() => navigate(`/books/${book.id}`)} />
            ))}
          </div>
        </section>
      )}

      {/* Popular */}
      {popular.length > 0 && (
        <section style={{ marginBottom: '40px' }}>
          <SectionHeader icon={TrendingUp} title="Популярные" count={popular.length} onSeeAll={() => navigate('/books')} />
          <div className="books-grid">
            {popular.map(book => (
              <BookCard key={book.id} book={book} onClick={() => navigate(`/books/${book.id}`)} />
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {books.length === 0 && (
        <section style={{
          padding: '60px 20px',
          textAlign: 'center',
          border: '1px dashed var(--color-border)',
          borderRadius: '20px',
          marginBottom: '40px',
        }}>
          <Library size={48} style={{ color: 'var(--color-text-muted)', margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
            Библиотека готова к наполнению
          </h3>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '20px', maxWidth: '400px', margin: '0 auto 20px' }}>
            Добавьте PDF-книги через админ-панель или папку Books/
          </p>
          <button className="btn-primary" onClick={() => navigate('/books')}>
            Открыть библиотеку
          </button>
        </section>
      )}

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '24px',
        color: 'var(--color-text-muted)',
        fontSize: '13px',
        borderTop: '1px solid var(--color-border)',
      }}>
        &copy; 2026 Salaf Library. Все права защищены.
      </footer>
    </main>
  );
}

function SectionHeader({ icon: Icon, title, count, onSeeAll }: {
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  title: string;
  count: number;
  onSeeAll: () => void;
}) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '20px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Icon size={20} style={{ color: 'var(--color-gold)' }} />
        <h2 style={{
          fontSize: '20px',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
        }}>{title}</h2>
        <span style={{
          fontSize: '12px',
          color: 'var(--color-text-muted)',
          background: 'var(--color-bg-hover)',
          padding: '2px 8px',
          borderRadius: '100px',
        }}>{count}</span>
      </div>
      <button
        onClick={onSeeAll}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          background: 'none',
          border: 'none',
          color: 'var(--color-gold)',
          fontSize: '13px',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Все <ChevronRight size={14} />
      </button>
    </div>
  );
}

function BookCard({ book, onClick }: {
  book: {
    id: string;
    title: string;
    author: string;
    category?: string;
    coverColor?: string;
    coverEmoji?: string;
    rating?: number;
    isNew?: boolean;
    description?: string;
  };
  onClick: () => void;
}) {
  return (
    <div
      className="book-card"
      onClick={onClick}
      style={{ padding: '0', cursor: 'pointer' }}
    >
      {/* Cover */}
      <div style={{
        height: '180px',
        background: book.coverColor || 'linear-gradient(135deg, var(--color-bg-secondary), var(--color-bg-primary))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.08,
          backgroundImage: `radial-gradient(circle at 1px 1px, var(--color-gold) 1px, transparent 0)`,
          backgroundSize: '20px 20px',
        }} />
        <span style={{ fontSize: '40px', position: 'relative', zIndex: 1 }}>{book.coverEmoji || '📖'}</span>
        {book.isNew && (
          <span style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            padding: '3px 8px',
            borderRadius: '6px',
            background: 'var(--color-gold)',
            color: '#0a1a0f',
            fontSize: '10px',
            fontWeight: 700,
            zIndex: 2,
          }}>NEW</span>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '14px' }}>
        <h3 style={{
          fontSize: '14px',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          marginBottom: '4px',
          lineHeight: 1.3,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>{book.title}</h3>
        <p style={{
          fontSize: '12px',
          color: 'var(--color-text-secondary)',
          marginBottom: '8px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>{book.author}</p>
        {book.rating && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Star size={12} style={{ color: 'var(--color-gold)', fill: 'var(--color-gold)' }} />
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-gold)' }}>{book.rating}</span>
          </div>
        )}
      </div>
    </div>
  );
}
