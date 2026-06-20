import { useNavigate } from 'react-router-dom';
import { Heart, BookOpen } from 'lucide-react';
import { useStore } from '../store/useStore';
import BookCard from '../components/BookCard';

export default function FavoritesPage() {
  const navigate = useNavigate();
  const { books, favorites } = useStore();
  const favoriteBooks = books.filter(b => favorites.includes(b.id));

  return (
    <div className="fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#f0f4f1', marginBottom: '6px' }}>
          ❤️ Избранное
        </h1>
        <p style={{ color: '#9db8a3', fontSize: '14px' }}>
          {favoriteBooks.length} книг в вашем избранном
        </p>
      </div>

      {favoriteBooks.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '80px',
          background: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
          borderRadius: '20px',
        }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>💔</div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#9db8a3', marginBottom: '8px' }}>
            Избранное пусто
          </div>
          <p style={{ fontSize: '14px', color: '#5a7a63', marginBottom: '24px' }}>
            Добавляйте книги в избранное, нажимая на сердечко
          </p>
          <button className="btn-primary" onClick={() => navigate('/books')}>
            <BookOpen size={16} /> Перейти к книгам
          </button>
        </div>
      ) : (
        <div className="books-grid">
          {favoriteBooks.map(book => <BookCard key={book.id} book={book} />)}
        </div>
      )}
    </div>
  );
}
