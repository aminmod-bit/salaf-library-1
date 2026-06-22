import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';
import { useAppStore } from '../store';
import BookCard from '../components/BookCard';

export default function Books() {
  const { t } = useTranslation();
  const { books } = useAppStore();
  const [query, setQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [lang, setLang] = useState('');

  const langs = useMemo(() => [...new Set(books.map(b => b.language))], [books]);
  const bookCategories = useMemo(() => [...new Set(books.map(b => b.category))], [books]);

  const filtered = useMemo(() => {
    return books.filter(b => {
      const matchesQuery = !query ||
        b.title.toLowerCase().includes(query.toLowerCase()) ||
        b.author.toLowerCase().includes(query.toLowerCase()) ||
        b.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()));
      const matchesCat = !selectedCat || b.category === selectedCat;
      const matchesLang = !lang || b.language === lang;
      return matchesQuery && matchesCat && matchesLang;
    });
  }, [books, query, selectedCat, lang]);

  return (
    <div className="px-4 lg:px-6 py-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">{t('books')}</h1>
        <p className="text-slate-400 text-sm">{filtered.length} из {books.length} книг</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-700/50 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 transition-colors"
          />
        </div>

        <select
          value={selectedCat}
          onChange={e => setSelectedCat(e.target.value)}
          className="px-3 py-2.5 bg-slate-900 border border-slate-700/50 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-amber-500/50 transition-colors"
        >
          <option value="">{t('allCategories')}</option>
          {bookCategories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <select
          value={lang}
          onChange={e => setLang(e.target.value)}
          className="px-3 py-2.5 bg-slate-900 border border-slate-700/50 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-amber-500/50 transition-colors"
        >
          <option value="">Все языки</option>
          {langs.map(l => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </div>

      {/* Books grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <p className="text-lg">{t('noResults')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map(book => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </div>
  );
}
