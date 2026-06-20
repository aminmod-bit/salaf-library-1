import { useParams, useNavigate } from 'react-router-dom';
import { Heart, Download, BookOpen, ArrowLeft, Star, Eye, Tag, Clock, Globe, FileText } from 'lucide-react';
import { useStore } from '../store/useStore';
import BookCard from '../components/BookCard';
import toast from 'react-hot-toast';

export default function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { books, toggleFavorite, isFavorite, addToHistory, saveReadingProgress } = useStore();

  const book = books.find(b => b.id === id);

  if (!book) {
    return (
      <div style={{ textAlign: 'center', padding: '80px', color: '#5a7a63' }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>📕</div>
        <div style={{ fontSize: '20px', fontWeight: 600, color: '#9db8a3' }}>Книга не найдена</div>
        <button className="btn-secondary" style={{ marginTop: '20px' }} onClick={() => navigate('/books')}>
          <ArrowLeft size={16} /> Назад к книгам
        </button>
      </div>
    );
  }

  const fav = isFavorite(book.id);
  const relatedBooks = books.filter(b => book.relatedBooks?.includes(b.id));
  const authorBooks = books.filter(b => b.author === book.author && b.id !== book.id).slice(0, 4);

  const handleRead = () => {
    addToHistory({
      id: book.id, type: 'book',
      title: book.title, subtitle: book.author,
      visitedAt: new Date().toISOString(),
      coverColor: book.coverColor, coverEmoji: book.coverEmoji, coverImage: book.coverImage,
    });
    if (book.fileUrl) {
      window.open(book.fileUrl, '_blank');
    } else {
      toast('PDF файл недоступен в демо-режиме', { icon: '📖' });
    }
  };

  const handleFav = () => {
    toggleFavorite(book.id);
    toast(fav ? 'Удалено из избранного' : 'Добавлено в избранное', { icon: fav ? '💔' : '❤️' });
  };

  return (
    <div className="fade-in" style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: 'none', border: 'none',
          color: '#9db8a3', fontSize: '14px', cursor: 'pointer', marginBottom: '24px',
        }}
      >
        <ArrowLeft size={16} /> Назад
      </button>

      {/* Main info */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '240px 1fr',
        gap: '40px',
        marginBottom: '40px',
      }}
      className="book-detail-grid"
      >
        <style>{`
          @media (max-width: 768px) {
            .book-detail-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>

        {/* Cover */}
        <div>
          <div style={{
            width: '100%',
            aspectRatio: '3/4',
            background: `linear-gradient(160deg, ${book.coverColor || '#1a3a2a'}, ${book.coverColor || '#1a3a2a'}aa)`,
            borderRadius: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '80px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
            position: 'relative',
            overflow: 'hidden',
            marginBottom: '16px',
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: 'radial-gradient(circle at 30% 30%, rgba(212,175,55,0.1) 0%, transparent 60%)',
            }} />
            {book.coverImage ? (
              <img
                src={book.coverImage}
                alt={`Обложка книги ${book.title}`}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 1 }}
              />
            ) : (
              <span style={{ position: 'relative', zIndex: 1 }}>{book.coverEmoji || '📖'}</span>
            )}
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button className="btn-primary" onClick={handleRead} style={{ width: '100%', justifyContent: 'center' }}>
              <BookOpen size={16} /> Читать книгу
            </button>
            <button
              className="btn-secondary"
              onClick={() => {
                if (book.downloadUrl || book.fileUrl) {
                  window.open(book.downloadUrl || book.fileUrl, '_blank');
                } else {
                  toast('PDF файл пока не добавлен', { icon: '📥' });
                }
              }}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <Download size={16} /> Скачать PDF
            </button>
            <button
              className="btn-ghost"
              onClick={handleFav}
              style={{ width: '100%', justifyContent: 'center', color: fav ? '#ef4444' : undefined }}
            >
              <Heart size={16} fill={fav ? '#ef4444' : 'none'} />
              {fav ? 'В избранном' : 'В избранное'}
            </button>
          </div>

          {/* Stats */}
          <div style={{
            marginTop: '16px',
            padding: '16px',
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            borderRadius: '12px',
            display: 'flex', flexDirection: 'column', gap: '10px',
          }}>
            {book.rating && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#5a7a63' }}>Рейтинг</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} size={12}
                      color="#d4af37"
                      fill={s <= Math.round(book.rating!) ? '#d4af37' : 'none'}
                    />
                  ))}
                  <span style={{ fontSize: '12px', color: '#d4af37', marginLeft: '4px' }}>{book.rating}</span>
                </div>
              </div>
            )}
            {book.views && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', color: '#5a7a63', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Eye size={11} /> Просмотры
                </span>
                <span style={{ fontSize: '12px', color: '#9db8a3' }}>{book.views.toLocaleString()}</span>
              </div>
            )}
            {book.downloads && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', color: '#5a7a63', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Download size={11} /> Скачивания
                </span>
                <span style={{ fontSize: '12px', color: '#9db8a3' }}>{book.downloads.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div>
          {/* Category badge */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <span className="badge badge-gold">{book.category}</span>
            {book.isNew && <span className="badge badge-green">Новинка</span>}
            {book.featured && <span className="badge badge-gold">⭐ Избранное</span>}
          </div>

          {/* Title */}
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#f0f4f1', marginBottom: '6px', lineHeight: 1.2 }}>
            {book.title}
          </h1>
          {book.titleAr && (
            <div style={{
              fontFamily: 'Amiri, serif',
              fontSize: '22px', color: '#d4af37',
              direction: 'rtl', marginBottom: '12px',
            }}>
              {book.titleAr}
            </div>
          )}

          {/* Author */}
          <div
            style={{ fontSize: '16px', color: '#22c55e', fontWeight: 600, marginBottom: '20px', cursor: 'pointer' }}
            onClick={() => navigate(`/biographies`)}
          >
            {book.author}
          </div>

          {/* Metadata grid */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px',
            marginBottom: '24px',
          }}>
            {[
              { icon: Globe, label: 'Язык', value: book.language },
              { icon: FileText, label: 'Страниц', value: book.pages ? `${book.pages} стр.` : '—' },
              { icon: Clock, label: 'Год', value: book.year || '—' },
              { icon: Download, label: 'Размер', value: book.size || '—' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} style={{
                padding: '12px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--color-border)',
                borderRadius: '10px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#5a7a63', marginBottom: '4px' }}>
                  <Icon size={11} />
                  <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
                </div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#f0f4f1' }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Description */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#f0f4f1', marginBottom: '10px' }}>Описание</h3>
            <p style={{ fontSize: '15px', color: '#9db8a3', lineHeight: 1.7 }}>{book.description}</p>
          </div>

          {/* Tags */}
          {book.tags.length > 0 && (
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {book.tags.map(tag => (
                <span key={tag} className="tag">
                  <Tag size={10} /> {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Author's other books */}
      {authorBooks.length > 0 && (
        <div style={{ marginBottom: '36px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#f0f4f1', marginBottom: '16px' }}>
            📚 Другие книги автора
          </h2>
          <div className="scroll-row">
            {authorBooks.map(b => (
              <div key={b.id} style={{ flexShrink: 0 }}>
                <BookCard book={b} size="sm" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related books */}
      {relatedBooks.length > 0 && (
        <div style={{ marginBottom: '36px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#f0f4f1', marginBottom: '16px' }}>
            🔗 Похожие книги
          </h2>
          <div className="scroll-row">
            {relatedBooks.map(b => (
              <div key={b.id} style={{ flexShrink: 0 }}>
                <BookCard book={b} size="sm" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
