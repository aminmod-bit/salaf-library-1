import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BookOpen, Grid3X3, List, Search } from 'lucide-react';
import FolderCard from '../components/FolderCard';
import { useStore } from '../store/useStore';
import BookCard from '../components/BookCard';

const SORT_OPTIONS = [
  { value: 'popular', label: 'По популярности' },
  { value: 'new', label: 'Новинки' },
  { value: 'title', label: 'По названию' },
  { value: 'author', label: 'По автору' },
  { value: 'rating', label: 'По рейтингу' },
];

const SECTION_ORDER = [
  'Акыда', 'Таухид', 'Манхадж', 'Хадисы', 'Сира', 'Фикх', 'Тафсир', 'Азкары', 'Дуа',
  'Арабский язык', 'Воспитание', 'История', 'Биографии', 'Детские книги', 'Даава', 'Другие разделы'
];

function normalizeSection(category: string) {
  if (/дуа|зикр/i.test(category)) return 'Дуа';
  if (/хадис/i.test(category)) return 'Хадисы';
  if (/сира/i.test(category)) return 'Сира';
  if (/араб/i.test(category)) return 'Арабский язык';
  if (/акыд/i.test(category)) return 'Акыда';
  if (/фаваид|общее/i.test(category)) return 'Другие разделы';
  return category || 'Другие разделы';
}

export default function BooksPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const { books } = useStore();
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [selectedCat, setSelectedCat] = useState(searchParams.get('category') || '');
  const [sort, setSort] = useState(searchParams.get('filter') === 'new' ? 'new' : 'popular');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [lang, setLang] = useState(searchParams.get('language') || 'all');
  const [visibleCount, setVisibleCount] = useState(24);

  useEffect(() => {
    setSearch(searchParams.get('q') || '');
    setSelectedCat(searchParams.get('category') || '');
    setLang(searchParams.get('language') || 'all');
  }, [searchParams]);

  const sectionStats = useMemo(() => {
    const counts = books.reduce<Record<string, number>>((acc, book) => {
      const section = normalizeSection(book.category);
      acc[section] = (acc[section] || 0) + 1;
      return acc;
    }, {});
    for (const section of SECTION_ORDER) counts[section] ||= 0;
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .filter(item => item.count > 0 || SECTION_ORDER.includes(item.name))
      .sort((a, b) => {
        const ai = SECTION_ORDER.indexOf(a.name);
        const bi = SECTION_ORDER.indexOf(b.name);
        return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi) || b.count - a.count;
      });
  }, [books]);

  const authorsCount = useMemo(() => new Set(books.map(b => b.author).filter(Boolean)).size, [books]);

  const filtered = useMemo(() => {
    let result = [...books];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(b =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q) ||
        b.tags.some(tag => tag.toLowerCase().includes(q))
      );
    }
    if (selectedCat) result = result.filter(b => normalizeSection(b.category) === selectedCat);
    if (lang !== 'all') result = result.filter(b => b.language === lang);

    switch (sort) {
      case 'popular': result.sort((a, b) => (b.views || 0) - (a.views || 0)); break;
      case 'new': result = result.filter(b => b.isNew).concat(result.filter(b => !b.isNew)); break;
      case 'title': result.sort((a, b) => a.title.localeCompare(b.title)); break;
      case 'author': result.sort((a, b) => a.author.localeCompare(b.author)); break;
      case 'rating': result.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
    }
    return result;
  }, [books, search, selectedCat, sort, lang]);

  useEffect(() => setVisibleCount(24), [search, selectedCat, sort, lang, view]);
  const visibleBooks = filtered.slice(0, visibleCount);
  const showFolders = !selectedCat && !search.trim();

  return (
    <div className="fade-in" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <div className="glass-card" style={{ marginBottom: 24, padding: 28, background: 'linear-gradient(135deg, var(--color-bg-secondary), var(--color-bg-card))' }}>
        <div style={{ color: 'var(--color-gold)', fontSize: 12, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 10 }}>
          {t('booksPage.eyebrow', 'Каталог Salaf Library')}
        </div>
        <h1 style={{ fontSize: 'clamp(30px, 5vw, 46px)', fontWeight: 900, color: 'var(--color-text-primary)', marginBottom: 10, lineHeight: 1.08 }}>
          {showFolders ? 'Разделы библиотеки' : selectedCat || t('booksPage.title', 'Книги для онлайн-чтения')}
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 15, lineHeight: 1.7, maxWidth: 760 }}>
          {showFolders
            ? 'Сначала выберите тематический раздел. Такая структура удобна для тысяч книг и не перегружает экран.'
            : `${filtered.length} / ${books.length}. ${t('booksPage.description', 'Используйте поиск, категории и сортировку, чтобы быстро найти нужный материал.')}`}
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 18 }}>
          {[[t('booksPage.books', 'Книг'), books.length], [t('booksPage.authors', 'Авторов'), authorsCount], [t('booksPage.categories', 'Категорий'), sectionStats.filter(s => s.count > 0).length], [t('booksPage.withPdf', 'С PDF'), books.filter(b => b.fileUrl).length]].map(([label, value]) => (
            <div key={String(label)} style={{ padding: '10px 14px', border: '1px solid var(--color-border)', borderRadius: 12, background: 'var(--color-bg-hover)' }}>
              <div style={{ color: 'var(--color-gold)', fontWeight: 900, fontSize: 18 }}>{value}</div>
              <div style={{ color: 'var(--color-text-muted)', fontSize: 11, fontWeight: 700 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card" style={{ borderRadius: 16, padding: '16px 20px', marginBottom: 24, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: 220, display: 'flex', alignItems: 'center', gap: 8, background: 'var(--color-bg-hover)', border: '1px solid var(--color-border)', borderRadius: 10, padding: '8px 14px' }}>
          <Search size={15} style={{ color: 'var(--color-text-muted)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('booksPage.searchPlaceholder', 'Поиск книг...')} style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--color-text-primary)', fontSize: 14, fontFamily: 'inherit', width: '100%' }} />
        </div>
        {!showFolders && <button className="btn-ghost" onClick={() => setSelectedCat('')}>Все разделы</button>}
        <select value={sort} onChange={e => setSort(e.target.value)} className="input-field" style={{ width: 'auto' }}>
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{t(`booksPage.sort${o.value.charAt(0).toUpperCase() + o.value.slice(1)}`, o.label)}</option>)}
        </select>
        <select value={lang} onChange={e => setLang(e.target.value)} className="input-field" style={{ width: 'auto' }}>
          <option value="all">{t('common.allLanguages', 'Все языки')}</option>
          {['Русский', 'Арабский', 'Английский', 'Таджикский', 'Узбекский', 'Персидский'].map(value => <option key={value} value={value}>{value}</option>)}
        </select>
        <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 4 }}>
          <button onClick={() => setView('grid')} style={toggleStyle(view === 'grid')}><Grid3X3 size={16}/></button>
          <button onClick={() => setView('list')} style={toggleStyle(view === 'list')}><List size={16}/></button>
        </div>
      </div>

      {showFolders ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
          {sectionStats.map(section => (
            <FolderCard
              key={section.name}
              title={section.name}
              subtitle="Тематическая папка библиотеки"
              count={section.count}
              countLabel="книг"
              disabled={section.count === 0}
              onClick={() => setSelectedCat(section.name)}
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--color-text-muted)' }}>
          <BookOpen size={44} style={{ margin: '0 auto 16px' }} />
          <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 8 }}>{t('booksPage.notFound', 'Ничего не найдено')}</div>
          <div style={{ fontSize: 14 }}>{t('booksPage.notFoundHint', 'Попробуйте изменить фильтры')}</div>
        </div>
      ) : view === 'grid' ? (
        <div className="books-grid stagger-in">{visibleBooks.map(book => <BookCard key={book.id} book={book} />)}</div>
      ) : (
        <div className="stagger-in" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{visibleBooks.map(book => <BookCard key={book.id} book={book} horizontal />)}</div>
      )}

      {!showFolders && filtered.length > visibleCount && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 28 }}>
          <button className="btn-secondary" onClick={() => setVisibleCount(count => count + 24)}>Показать ещё {Math.min(24, filtered.length - visibleCount)}</button>
        </div>
      )}
    </div>
  );
}

function toggleStyle(active: boolean): CSSProperties {
  return { background: active ? 'rgba(212,175,55,0.2)' : 'none', border: 'none', borderRadius: 7, padding: '6px 10px', color: active ? 'var(--color-gold)' : 'var(--color-text-muted)', cursor: 'pointer' };
}
