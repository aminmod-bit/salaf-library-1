import { useState, useMemo } from 'react';
import { Search, Play, Pause, Clock, Eye } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { AudioLesson } from '../store/useStore';

export default function AudioPage() {
  const { audioLessons, setCurrentAudio, setIsPlaying, currentAudio, isPlaying, addToHistory } = useStore();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  const categories = useMemo(() => {
    const cats = new Set(audioLessons.map(a => a.category));
    return Array.from(cats);
  }, [audioLessons]);

  const filtered = useMemo(() => {
    let result = [...audioLessons];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.author.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q)
      );
    }
    if (category !== 'all') {
      result = result.filter(a => a.category === category);
    }
    return result;
  }, [audioLessons, search, category]);

  const handlePlay = (audio: typeof audioLessons[0]) => {
    if (currentAudio?.id === audio.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentAudio(audio);
      setIsPlaying(true);
      addToHistory({
        id: audio.id, type: 'audio',
        title: audio.title, subtitle: audio.author,
        visitedAt: new Date().toISOString(),
        coverColor: audio.coverColor, coverEmoji: audio.coverEmoji,
      });
    }
  };

  // Group by series
  const series = useMemo(() => {
    const map = new Map<string, typeof audioLessons>();
    filtered.forEach(a => {
      if (a.series) {
        if (!map.has(a.series)) map.set(a.series, []);
        map.get(a.series)!.push(a);
      }
    });
    return map;
  }, [filtered]);

  const standalone = filtered.filter(a => !a.series);

  return (
    <div className="fade-in" style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#f0f4f1', marginBottom: '6px' }}>
          🎧 Аудиоуроки
        </h1>
        <p style={{ color: '#9db8a3', fontSize: '14px' }}>
          {filtered.length} уроков в каталоге
        </p>
      </div>

      {/* Filters */}
      <div style={{
        background: 'var(--color-bg-card)', border: '1px solid var(--color-border)',
        borderRadius: '16px', padding: '16px 20px', marginBottom: '20px',
        display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center',
      }}>
        <div style={{
          flex: 1, minWidth: '200px',
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '10px', padding: '8px 14px',
        }}>
          <Search size={15} color="#5a7a63" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Поиск уроков..."
            style={{ background: 'none', border: 'none', outline: 'none', color: '#f0f4f1', fontSize: '14px', fontFamily: 'inherit', width: '100%' }}
          />
        </div>
      </div>

      {/* Category tabs */}
      <div className="scroll-row" style={{ marginBottom: '28px', gap: '8px' }}>
        <button onClick={() => setCategory('all')} className={`tag ${category === 'all' ? 'active' : ''}`}>
          Все категории
        </button>
        {categories.map(c => (
          <button key={c} onClick={() => setCategory(c)} className={`tag ${category === c ? 'active' : ''}`}>
            {c}
          </button>
        ))}
      </div>

      {/* Series */}
      {category === 'all' && Array.from(series.entries()).map(([seriesName, lessons]) => (
        <div key={seriesName} style={{ marginBottom: '32px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px',
          }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#f0f4f1' }}>
              🎵 Серия: {seriesName}
            </h2>
            <span className="badge badge-gold">{lessons.length} уроков</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {lessons.sort((a, b) => (a.episode || 0) - (b.episode || 0)).map(audio => (
              <AudioRow key={audio.id} audio={audio} currentAudio={currentAudio} isPlaying={isPlaying} onPlay={handlePlay} />
            ))}
          </div>
        </div>
      ))}

      {/* Standalone */}
      {(standalone.length > 0 || category !== 'all') && (
        <div>
          {category === 'all' && standalone.length > 0 && (
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#f0f4f1', marginBottom: '14px' }}>
              🎤 Отдельные уроки
            </h2>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(category !== 'all' ? filtered : standalone).map(audio => (
              <AudioRow key={audio.id} audio={audio} currentAudio={currentAudio} isPlaying={isPlaying} onPlay={handlePlay} />
            ))}
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px', color: '#5a7a63' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎧</div>
          <div style={{ fontSize: '18px', fontWeight: 600, color: '#9db8a3' }}>Ничего не найдено</div>
        </div>
      )}
    </div>
  );
}

interface AudioRowProps {
  audio: AudioLesson;
  currentAudio: AudioLesson | null;
  isPlaying: boolean;
  onPlay: (a: AudioLesson) => void;
}

function AudioRow({ audio, currentAudio, isPlaying, onPlay }: AudioRowProps) {
  const isCurrentPlaying = currentAudio?.id === audio.id && isPlaying;
  const isCurrent = currentAudio?.id === audio.id;

  return (
    <div style={{
      display: 'flex', gap: '14px', padding: '14px 16px',
      background: isCurrent ? 'rgba(212,175,55,0.08)' : 'var(--color-bg-card)',
      border: `1px solid ${isCurrent ? 'rgba(212,175,55,0.4)' : 'var(--color-border)'}`,
      borderRadius: '12px', alignItems: 'center',
      transition: 'all 0.3s ease', cursor: 'pointer',
    }}
    onClick={() => onPlay(audio)}
    onMouseEnter={e => !isCurrent && ((e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,175,55,0.25)')}
    onMouseLeave={e => !isCurrent && ((e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)')}
    >
      {/* Play btn */}
      <div style={{
        width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0,
        background: isCurrent
          ? 'linear-gradient(135deg, #d4af37, #f0c84a)'
          : 'rgba(255,255,255,0.05)',
        border: isCurrent ? 'none' : '1px solid rgba(255,255,255,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.3s ease',
      }}>
        {isCurrentPlaying
          ? <Pause size={16} color={isCurrent ? '#0a1a0f' : '#9db8a3'} />
          : <Play size={16} color={isCurrent ? '#0a1a0f' : '#9db8a3'} />
        }
      </div>

      {/* Cover */}
      <div style={{
        width: '44px', height: '44px', borderRadius: '10px', flexShrink: 0,
        background: audio.coverColor || '#1a3a2a',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px',
      }}>
        {audio.coverEmoji || '🎧'}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: '14px', fontWeight: 600,
          color: isCurrent ? '#d4af37' : '#f0f4f1', marginBottom: '2px',
          display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {audio.episode ? `${audio.episode}. ` : ''}{audio.title}
        </div>
        <div style={{ fontSize: '12px', color: '#9db8a3' }}>
          {audio.author}
          {audio.year ? ` · ${audio.year}` : ''}
        </div>
      </div>

      {/* Meta */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
        {audio.views && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#5a7a63', fontSize: '12px' }}>
            <Eye size={12} /> {(audio.views / 1000).toFixed(1)}K
          </div>
        )}
        {audio.duration && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#5a7a63', fontSize: '12px' }}>
            <Clock size={12} /> {audio.duration}
          </div>
        )}
        <span className="badge badge-gold" style={{ fontSize: '10px' }}>{audio.category}</span>
        {audio.isNew && <span className="badge badge-green" style={{ fontSize: '10px' }}>Новый</span>}
      </div>
    </div>
  );
}
