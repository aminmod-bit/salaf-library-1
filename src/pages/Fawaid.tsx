import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Star } from 'lucide-react';
import { useAppStore } from '../store';
import FawaidCard from '../components/FawaidCard';
import { cn } from '../utils/cn';

export default function Fawaid() {
  const { t } = useTranslation();
  const { fawaid } = useAppStore();
  const [query, setQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [showFeatured, setShowFeatured] = useState(false);

  const cats = useMemo(() => [...new Set(fawaid.map(f => f.category))], [fawaid]);

  const filtered = useMemo(() => {
    return fawaid.filter(f => {
      const matchesQuery = !query ||
        f.text.toLowerCase().includes(query.toLowerCase()) ||
        f.author.toLowerCase().includes(query.toLowerCase()) ||
        (f.textAr && f.textAr.includes(query));
      const matchesCat = !selectedCat || f.category === selectedCat;
      const matchesFeatured = !showFeatured || f.isFeatured;
      return matchesQuery && matchesCat && matchesFeatured;
    });
  }, [fawaid, query, selectedCat, showFeatured]);

  return (
    <div className="px-4 lg:px-6 py-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-3">
          <Star size={24} className="text-amber-400" />
          {t('fawaidTitle')}
        </h1>
        <p className="text-slate-400 text-sm">{t('fawaidDescription')} · {filtered.length} из {fawaid.length}</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Поиск фаваидов..."
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
          {cats.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <button
          onClick={() => setShowFeatured(!showFeatured)}
          className={cn(
            'px-4 py-2.5 rounded-xl text-sm font-medium transition-colors border',
            showFeatured
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              : 'bg-slate-900 text-slate-400 border-slate-700/50 hover:text-slate-200'
          )}
        >
          ★ {t('featured')}
        </button>
      </div>

      {/* Category chips */}
      <div className="flex gap-2 flex-wrap mb-6">
        {['', ...cats].map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCat(cat)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
              selectedCat === cat
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/50'
            )}
          >
            {cat || 'Все'}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-500">{t('noResults')}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(f => (
            <FawaidCard key={f.id} item={f} />
          ))}
        </div>
      )}
    </div>
  );
}
