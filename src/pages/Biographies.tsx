import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, Users } from 'lucide-react';
import { useAppStore } from '../store';
import { cn } from '../utils/cn';
import type { Biography } from '../types';

const typeLabels: Record<string, string> = {
  prophet: 'Пророки',
  companion: 'Сподвижники',
  tabiin: 'Табиины',
  scholar: 'Учёные',
  modern: 'Современные',
};

function BioCard({ bio }: { bio: Biography }) {
  return (
    <Link
      to={`/biographies/${bio.id}`}
      className="group bg-slate-900 border border-slate-800/50 rounded-xl p-5 hover:border-amber-500/20 transition-all duration-200 flex gap-4"
    >
      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
        style={{ backgroundColor: bio.coverColor }}
      >
        <span>{bio.coverEmoji}</span>
      </div>
      <div className="flex-1 min-w-0">
        {bio.nameAr && (
          <p className="text-amber-400/70 text-xs mb-0.5 text-right" dir="rtl">{bio.nameAr}</p>
        )}
        <h3 className="text-sm font-semibold text-white group-hover:text-amber-100 transition-colors leading-tight">{bio.name}</h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-md">
            {typeLabels[bio.type] || bio.type}
          </span>
          {bio.birthYear && (
            <span className="text-xs text-slate-500">{bio.birthYear}–{bio.deathYear || '...'}</span>
          )}
        </div>
        <p className="text-xs text-slate-400 mt-2 line-clamp-2">{bio.description}</p>
      </div>
    </Link>
  );
}

export default function Biographies() {
  const { t } = useTranslation();
  const { biographies } = useAppStore();
  const [query, setQuery] = useState('');
  const [type, setType] = useState('');

  const types = useMemo(() => [...new Set(biographies.map(b => b.type))], [biographies]);

  const filtered = useMemo(() => {
    return biographies.filter(b => {
      const matchesQuery = !query ||
        b.name.toLowerCase().includes(query.toLowerCase()) ||
        (b.nameAr && b.nameAr.includes(query));
      const matchesType = !type || b.type === type;
      return matchesQuery && matchesType;
    });
  }, [biographies, query, type]);

  return (
    <div className="px-4 lg:px-6 py-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-3">
          <Users size={24} className="text-amber-400" />
          {t('biographies')}
        </h1>
        <p className="text-slate-400 text-sm">{filtered.length} из {biographies.length} биографий</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Поиск учёных..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-700/50 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 transition-colors"
          />
        </div>
        <select
          value={type}
          onChange={e => setType(e.target.value)}
          className="px-3 py-2.5 bg-slate-900 border border-slate-700/50 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-amber-500/50 transition-colors"
        >
          <option value="">Все типы</option>
          {types.map(tp => (
            <option key={tp} value={tp}>{typeLabels[tp] || tp}</option>
          ))}
        </select>
      </div>

      {/* Type tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {['', ...types].map(tp => (
          <button
            key={tp}
            onClick={() => setType(tp)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
              type === tp
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/50'
            )}
          >
            {tp ? typeLabels[tp] : 'Все'}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-500">{t('noResults')}</div>
      ) : (
        <div className="space-y-3">
          {filtered.map(bio => (
            <BioCard key={bio.id} bio={bio} />
          ))}
        </div>
      )}
    </div>
  );
}
