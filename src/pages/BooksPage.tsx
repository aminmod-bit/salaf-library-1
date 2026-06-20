import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, Grid3X3, List, SlidersHorizontal } from 'lucide-react';
import { useStore } from '../store/useStore';
import BookCard from '../components/BookCard';

const SORT_OPTIONS = [
  { value: 'popular', label: 'По популярности' },
  { value: 'new', label: 'Новинки' },
  { value: 'title', label: 'По названию' },
  { value: 'author', label: 'По автору' },
  { value: 'rating', label: 'По рейтингу' },
];

export default function BooksPage() {
  const [searchParams] = useSearchParams();
  const { books, categories } = useStore();
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState(searchParams.get('category') || 'all');
  const [sort, setSort] = useState(searchParams.get('filter') === 'new' ? 'new' : 'popular');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [lang, setLang] = useState('all');

  const filtered = useMemo(() => {
    let result = [...books];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(b =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q) ||
        b.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    if (selectedCat !== 'all') {
      result = result.filter(b => b.category === selectedCat);
    }

    if (lang !== 'all') {
      result = result.filter(b => b.language === lang);
    }

    switch (sort) {
      case 'popular': result.sort((a, b) => (b.views || 0) - (a.views || 0)); break;
      case 'new': result = result.filter(b => b.isNew).concat(result.filter(b => !b.isNew)); break;
      case 'title': result.sort((a, b) => a.title.localeCompare(b.title)); break;
      case 'author': result.sort((a, b) => a.author.localeCompare(b.author)); break;
      case 'rating': result.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
    }

    return result;
  }, [books, search, selectedCat, sort, lang]);

  const bookCategories = useMemo(() => {
    const cats = new Set(books.map(b => b.category));
    return Array.from(cats);
  }, [books]);

  return (
    <div className="fade-in" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#f0f4f1', marginBottom: '6px' }}>
          📚 Книги
        </h1>
        <p style={{ color: '#9db8a3', fontSize: '14px' }}>
          {filtered.length} книг из {books.length} в каталоге
        </p>
      </div>

      {/* Filters bar */}
      <div style={{
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: '16px',
        padding: '16px 20px',
        marginBottom: '24px',
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        alignItems: 'center',
      }}>
        {/* Search */}
        <div style={{
          flex: 1, minWidth: '200px',
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '10px', padding: '8px 14px',
        }}>
          <Search size={15} color="#5a7a63" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Поиск книг..."
            style={{
              background: 'none', border: 'none', outline: 'none',
              color: '#f0f4f1', fontSize: '14px', fontFamily: 'inherit', width: '100%',
            }}
          />
        </div>

        {/* Sort */}
        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '10px', padding: '8px 14px',
            color: '#f0f4f1', fontSize: '14px', fontFamily: 'inherit',
            outline: 'none', cursor: 'pointer',
          }}
        >
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value} style={{ background: '#112a1a' }}>{o.label}</option>)}
        </select>

        {/* Lang filter */}
        <select
          value={lang}
          onChange={e => setLang(e.target.value)}
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '10px', padding: '8px 14px',
            color: '#f0f4f1', fontSize: '14px', fontFamily: 'inherit',
            outline: 'none', cursor: 'pointer',
          }}
        >
          <option value="all" style={{ background: '#112a1a' }}>Все языки</option>
          <option value="Русский" style={{ background: '#112a1a' }}>Русский</option>
          <option value="Арабский" style={{ background: '#112a1a' }}>Арабский</option>
        </select>

        {/* View toggle */}
        <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '4px' }}>
          <button
            onClick={() => setView('grid')}
            style={{
              background: view === 'grid' ? 'rgba(212,175,55,0.2)' : 'none',
              border: 'none', borderRadius: '7px', padding: '6px 10px',
              color: view === 'grid' ? '#d4af37' : '#5a7a63', cursor: 'pointer',
            }}
          >
            <Grid3X3 size={16} />
          </button>
          <button
            onClick={() => setView('list')}
            style={{
              background: view === 'list' ? 'rgba(212,175,55,0.2)' : 'none',
              border: 'none', borderRadius: '7px', padding: '6px 10px',
              color: view === 'list' ? '#d4af37' : '#5a7a63', cursor: 'pointer',
            }}
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Category tabs */}
      <div className="scroll-row" style={{ marginBottom: '24px', gap: '8px' }}>
        <button
          onClick={() => setSelectedCat('all')}
          className={`tag ${selectedCat === 'all' ? 'active' : ''}`}
        >
          Все категории
        </button>
        {bookCategories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCat(cat)}
            className={`tag ${selectedCat === cat ? 'active' : ''}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#5a7a63' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
          <div style={{ fontSize: '18px', fontWeight: 600, color: '#9db8a3', marginBottom: '8px' }}>Ничего не найдено</div>
          <div style={{ fontSize: '14px' }}>Попробуйте изменить фильтры</div>
        </div>
      ) : view === 'grid' ? (
        <div className="books-grid">
          {filtered.map(book => <BookCard key={book.id} book={book} />)}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.map(book => <BookCard key={book.id} book={book} horizontal />)}
        </div>
      )}
    </div>
  );
}
