import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const { books, categories } = useStore();
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState(searchParams.get('category') || 'all');
  const [sort, setSort] = useState(searchParams.get('filter') === 'new' ? 'new' : 'popular');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [lang, setLang] = useState(searchParams.get('language') || 'all');

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

  const categoryStats = useMemo(() => {
    const counts = books.reduce<Record<string, number>>((acc, book) => {
      acc[book.category] = (acc[book.category] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [books]);

  const authorsCount = useMemo(() => new Set(books.map(b => b.author).filter(Boolean)).size, [books]);

  return (
    <div className="fade-in" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div className="glass-card" style={{ marginBottom: '24px', padding: '28px', background: 'linear-gradient(135deg, rgba(13,42,24,.96), rgba(7,19,11,.94))' }}>
        <div style={{ color: '#d4af37', fontSize: 12, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 10 }}>
          {t('booksPage.eyebrow', 'Каталог Salaf Library')}
        </div>
        <h1 style={{ fontSize: 'clamp(30px, 5vw, 46px)', fontWeight: 900, color: '#f0f4f1', marginBottom: '10px', lineHeight: 1.08 }}>
          📚 {t('booksPage.title', 'Книги для онлайн-чтения')}
        </h1>
        <p style={{ color: '#9db8a3', fontSize: '15px', lineHeight: 1.7, maxWidth: 760 }}>
          {filtered.length} / {books.length}. {t('booksPage.description', 'Используйте поиск, категории и сортировку, чтобы быстро найти нужный материал.')}
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 18 }}>
          {[
            [t('booksPage.books', 'Книг'), books.length],
            [t('booksPage.authors', 'Авторов'), authorsCount],
            [t('booksPage.categories', 'Категорий'), categoryStats.length],
            [t('booksPage.withPdf', 'С PDF'), books.filter(b => b.fileUrl).length],
          ].map(([label, value]) => (
            <div key={label} style={{ padding: '10px 14px', border: '1px solid rgba(212,175,55,.18)', borderRadius: 12, background: 'rgba(255,255,255,.035)' }}>
              <div style={{ color: '#d4af37', fontWeight: 900, fontSize: 18 }}>{value}</div>
              <div style={{ color: '#5a7a63', fontSize: 11, fontWeight: 700 }}>{label}</div>
            </div>
          ))}
        </div>
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
            placeholder={t('booksPage.searchPlaceholder', 'Поиск книг...')}
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
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value} style={{ background: '#112a1a' }}>{t(`booksPage.sort${o.value.charAt(0).toUpperCase() + o.value.slice(1)}`, o.label)}</option>)}
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
          <option value="all" style={{ background: '#112a1a' }}>{t('common.allLanguages', 'Все языки')}</option>
          <option value="Русский" style={{ background: '#112a1a' }}>{t('common.russian', 'Русский')}</option>
          <option value="Арабский" style={{ background: '#112a1a' }}>{t('common.arabic', 'Арабский')}</option>
          <option value="Английский" style={{ background: '#112a1a' }}>{t('common.english', 'Английский')}</option>
          <option value="Таджикский" style={{ background: '#112a1a' }}>{t('common.tajik', 'Таджикский')}</option>
          <option value="Узбекский" style={{ background: '#112a1a' }}>{t('common.uzbek', 'Узбекский')}</option>
          <option value="Персидский" style={{ background: '#112a1a' }}>{t('common.persian', 'Персидский')}</option>
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
          {t('booksPage.allCategories', 'Все категории')}
        </button>
        {categoryStats.map(cat => (
          <button
            key={cat.name}
            onClick={() => setSelectedCat(cat.name)}
            className={`tag ${selectedCat === cat.name ? 'active' : ''}`}
          >
            {cat.name} · {cat.count}
          </button>
        ))}
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#5a7a63' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
          <div style={{ fontSize: '18px', fontWeight: 600, color: '#9db8a3', marginBottom: '8px' }}>{t('booksPage.notFound', 'Ничего не найдено')}</div>
          <div style={{ fontSize: '14px' }}>{t('booksPage.notFoundHint', 'Попробуйте изменить фильтры')}</div>
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
