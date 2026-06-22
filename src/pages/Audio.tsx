import { useState, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Play, Pause, Heart, Clock, Headphones } from 'lucide-react';
import { useAppStore } from '../store';
import { cn } from '../utils/cn';
import type { AudioItem } from '../types';

function AudioCard({ item }: { item: AudioItem }) {
  const { toggleFavorite, isFavorite, addToHistory } = useAppStore();
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const favorite = isFavorite(item.id);

  const handlePlay = () => {
    if (!item.fileUrl) return;

    if (!audioRef.current) {
      const el = document.createElement('audio');
      el.src = item.fileUrl;
      el.onended = () => setPlaying(false);
      audioRef.current = el;
    }

    const el = audioRef.current;
    if (!el) return;

    if (playing) {
      el.pause();
      setPlaying(false);
    } else {
      el.play().catch(() => {});
      setPlaying(true);
      addToHistory({
        id: Date.now().toString(),
        type: 'audio',
        itemId: item.id,
        title: item.title,
        timestamp: Date.now(),
      });
    }
  };

  return (
    <div className="group bg-slate-900 border border-slate-800/50 rounded-xl p-4 hover:border-amber-500/20 transition-all duration-200 flex items-start gap-4">
      {/* Cover */}
      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 relative"
        style={{ backgroundColor: item.coverColor }}
      >
        <span className="select-none">{item.coverEmoji}</span>
        {playing && (
          <div className="absolute inset-0 rounded-xl bg-amber-500/20 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-amber-400 animate-pulse" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 mb-1">
          <h3 className="text-sm font-semibold text-white leading-tight truncate">{item.title}</h3>
          {item.isNew && (
            <span className="flex-shrink-0 text-[9px] font-bold px-1.5 py-0.5 bg-emerald-500 text-white rounded">NEW</span>
          )}
        </div>
        <p className="text-xs text-slate-400 truncate">{item.author}</p>
        {item.series && (
          <p className="text-xs text-slate-500 mt-0.5 truncate">{item.series} — Урок {item.episode}</p>
        )}
        <div className="flex items-center gap-3 mt-2">
          <span className="flex items-center gap-1 text-xs text-slate-500">
            <Clock size={11} />
            {item.duration}
          </span>
          <span className="text-xs text-slate-600">{item.category}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => toggleFavorite(item.id)}
          className={cn(
            'w-8 h-8 flex items-center justify-center rounded-lg transition-colors',
            favorite ? 'text-red-400 bg-red-500/10' : 'text-slate-500 hover:text-red-400 bg-slate-800'
          )}
        >
          <Heart size={14} fill={favorite ? 'currentColor' : 'none'} />
        </button>

        {item.fileUrl && (
          <button
            onClick={handlePlay}
            className={cn(
              'w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-150',
              playing
                ? 'bg-amber-500 text-slate-900 shadow-lg shadow-amber-900/30'
                : 'bg-slate-800 text-slate-300 hover:bg-amber-500 hover:text-slate-900'
            )}
          >
            {playing ? <Pause size={16} /> : <Play size={16} />}
          </button>
        )}
      </div>
    </div>
  );
}

export default function Audio() {
  const { t } = useTranslation();
  const { audio } = useAppStore();
  const [query, setQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('');

  const cats = useMemo(() => [...new Set(audio.map(a => a.category))], [audio]);

  const filtered = useMemo(() => {
    return audio.filter(a => {
      const matchesQuery = !query ||
        a.title.toLowerCase().includes(query.toLowerCase()) ||
        a.author.toLowerCase().includes(query.toLowerCase());
      const matchesCat = !selectedCat || a.category === selectedCat;
      return matchesQuery && matchesCat;
    });
  }, [audio, query, selectedCat]);

  return (
    <div className="px-4 lg:px-6 py-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-3">
          <Headphones size={24} className="text-amber-400" />
          {t('audio')}
        </h1>
        <p className="text-slate-400 text-sm">{filtered.length} из {audio.length} лекций</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Поиск аудио..."
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
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <p>{t('noResults')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(item => (
            <AudioCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
