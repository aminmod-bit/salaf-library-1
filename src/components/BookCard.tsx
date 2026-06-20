import { useNavigate } from 'react-router-dom';
import { Heart, BookOpen, Download, Star } from 'lucide-react';
import { useStore, Book } from '../store/useStore';
import toast from 'react-hot-toast';

interface Props {
  book: Book;
  size?: 'sm' | 'md' | 'lg';
  horizontal?: boolean;
}

export default function BookCard({ book, size = 'md', horizontal = false }: Props) {
  const navigate = useNavigate();
  const { toggleFavorite, isFavorite, addToHistory } = useStore();
  const fav = isFavorite(book.id);

  const handleOpen = () => {
    addToHistory({
      id: book.id,
      type: 'book',
      title: book.title,
      subtitle: book.author,
      visitedAt: new Date().toISOString(),
      coverColor: book.coverColor,
      coverEmoji: book.coverEmoji,
      coverImage: book.coverImage,
    });
    navigate(`/books/${book.id}`);
  };

  const handleFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(book.id);
    toast(fav ? 'Удалено из избранного' : 'Добавлено в избранное', {
      icon: fav ? '💔' : '❤️',
    });
  };

  const coverH = size === 'sm' ? 160 : size === 'lg' ? 280 : 220;

  if (horizontal) {
    return (
      <div
        onClick={handleOpen}
        style={{
          display: 'flex',
          gap: '16px',
          padding: '16px',
          background: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
          borderRadius: '12px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          alignItems: 'flex-start',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,175,55,0.4)';
          (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)';
          (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
        }}
      >
        {/* Cover */}
        <div style={{
          width: '60px',
          height: '80px',
          background: book.coverColor || '#1a3a2a',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          flexShrink: 0,
          boxShadow: '4px 4px 12px rgba(0,0,0,0.4)',
        }}>
          {book.coverImage ? (
            <img src={book.coverImage} alt={`Обложка книги ${book.title}`} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            book.coverEmoji || '📖'
          )}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#f0f4f1',
            marginBottom: '4px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {book.title}
          </div>
          <div style={{ fontSize: '12px', color: '#9db8a3', marginBottom: '6px' }}>{book.author}</div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <span className="badge badge-gold" style={{ fontSize: '10px' }}>{book.category}</span>
            {book.pages && (
              <span style={{ fontSize: '10px', color: '#5a7a63' }}>{book.pages} стр.</span>
            )}
          </div>
        </div>

        {/* Fav */}
        <button
          onClick={handleFav}
          style={{
            background: 'none', border: 'none',
            color: fav ? '#ef4444' : '#5a7a63',
            cursor: 'pointer', padding: '4px',
          }}
        >
          <Heart size={16} fill={fav ? '#ef4444' : 'none'} />
        </button>
      </div>
    );
  }

  return (
    <div
      className="book-card fade-in"
      onClick={handleOpen}
      style={{ position: 'relative', width: size === 'sm' ? '130px' : size === 'lg' ? '200px' : '165px' }}
    >
      {/* Cover */}
      <div style={{
        width: '100%',
        height: coverH,
        background: `linear-gradient(160deg, ${book.coverColor || '#1a3a2a'} 0%, ${adjustColor(book.coverColor || '#1a3a2a')} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size === 'sm' ? '40px' : '56px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Pattern */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(212,175,55,0.08) 0%, transparent 60%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.03) 0%, transparent 50%)',
        }} />
        {book.coverImage ? (
          <img
            src={book.coverImage}
            alt={`Обложка книги ${book.title}`}
            loading="lazy"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 1 }}
          />
        ) : (
          <div style={{ position: 'relative', zIndex: 1 }}>{book.coverEmoji || '📖'}</div>
        )}

        {/* Badges */}
        {book.isNew && (
          <span style={{
            position: 'absolute', top: '8px', left: '8px',
            background: '#22c55e', color: '#fff',
            fontSize: '9px', fontWeight: 700,
            padding: '2px 6px', borderRadius: '4px',
          }}>
            НОВИНКА
          </span>
        )}
        {book.featured && !book.isNew && (
          <span style={{
            position: 'absolute', top: '8px', left: '8px',
            background: 'rgba(212,175,55,0.9)', color: '#0a1a0f',
            fontSize: '9px', fontWeight: 700,
            padding: '2px 6px', borderRadius: '4px',
          }}>
            ⭐ ТОП
          </span>
        )}

        {/* Fav button */}
        <button
          onClick={handleFav}
          style={{
            position: 'absolute', top: '8px', right: '8px',
            width: '28px', height: '28px',
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(8px)',
            border: 'none', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            color: fav ? '#ef4444' : '#9db8a3',
            transition: 'all 0.2s ease',
          }}
        >
          <Heart size={12} fill={fav ? '#ef4444' : 'none'} />
        </button>

        {/* Rating */}
        {book.rating && (
          <div style={{
            position: 'absolute', bottom: '8px', right: '8px',
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(8px)',
            borderRadius: '6px', padding: '2px 6px',
            display: 'flex', alignItems: 'center', gap: '3px',
          }}>
            <Star size={10} color="#d4af37" fill="#d4af37" />
            <span style={{ fontSize: '10px', color: '#d4af37', fontWeight: 600 }}>{book.rating}</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '10px 10px 12px' }}>
        <div style={{
          fontSize: size === 'sm' ? '12px' : '13px',
          fontWeight: 600,
          color: '#f0f4f1',
          marginBottom: '4px',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          lineHeight: 1.3,
        }}>
          {book.title}
        </div>
        <div style={{
          fontSize: '11px',
          color: '#9db8a3',
          marginBottom: '8px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {book.author}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={e => { e.stopPropagation(); handleOpen(); }}
            style={{
              flex: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
              padding: '5px 8px',
              background: 'linear-gradient(135deg, #d4af37, #f0c84a)',
              border: 'none', borderRadius: '7px',
              color: '#0a1a0f', fontSize: '11px', fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <BookOpen size={11} />
            Читать
          </button>
          <button
            onClick={e => {
              e.stopPropagation();
              if (book.downloadUrl || book.fileUrl) {
                window.open(book.downloadUrl || book.fileUrl, '_blank');
              } else {
                toast('PDF файл пока не добавлен', { icon: '📥' });
              }
            }}
            style={{
              width: '28px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '7px', cursor: 'pointer',
              color: '#9db8a3',
            }}
          >
            <Download size={11} />
          </button>
        </div>
      </div>
    </div>
  );
}

function adjustColor(hex: string): string {
  // Slightly darken the color
  try {
    const n = parseInt(hex.replace('#', ''), 16);
    const r = Math.max(0, (n >> 16) - 20);
    const g = Math.max(0, ((n >> 8) & 0xff) - 20);
    const b = Math.max(0, (n & 0xff) - 20);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  } catch {
    return hex;
  }
}
