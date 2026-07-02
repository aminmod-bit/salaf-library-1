import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  ArrowLeft, Copy, Heart, Share2, Repeat, Search, Eye, EyeOff,
  Play, Pause, Volume2, Link2
} from 'lucide-react';
import toast from 'react-hot-toast';
import VantaCloudsBackground from '../components/effects/VantaCloudsBackground';

interface AzkarCategory {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  image: string;
  gradient: string;
  sourceUrl?: string;
}

interface AzkarItem {
  id: string;
  categorySlug: string;
  title?: string;
  arabic: string;
  translation: string;
  transliteration?: string;
  source?: string;
  repeat: number;
  audioUrl?: string;
  imageUrl?: string;
  tags: string[];
  sourceUrl?: string;
  needsReview?: boolean;
}

const ACCESSIBLE_KEY = 'salaf-accessible-mode';

// ─── Main categories page ────────────────────────────────────────────────────
export function AzkarCategoriesPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<AzkarCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('./data/azkar-categories.json')
      .then(r => r.json())
      .then(data => setCategories(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="fade-in" style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative' }}>
      <VantaCloudsBackground />

      {/* Content overlay for readability */}
      <div style={{ position: 'relative', zIndex: 1 }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px', paddingTop: '20px' }}>
        <div style={{ fontFamily: 'Amiri, serif', fontSize: '42px', color: 'var(--color-gold)', marginBottom: '12px', direction: 'rtl' }}>الأذكار</div>
        <h1 style={{ fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 900, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
          Азкары и поминания
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '15px', lineHeight: 1.6, maxWidth: '500px', margin: '0 auto' }}>
          Поминания на каждый день: утренние, вечерные, после намаза и другие
        </p>
      </div>

      {/* Categories grid - tiles like azkar.ru */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="shimmer" style={{ height: '160px', borderRadius: '16px' }} />
          ))}
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px',
        }}>
          {/* First two are large */}
          {categories.slice(0, 2).map(cat => (
            <TileCard key={cat.id} category={cat} large onClick={() => navigate(`/azkar/category/${cat.slug}`)} />
          ))}
          {/* Rest are smaller */}
          {categories.slice(2).map(cat => (
            <TileCard key={cat.id} category={cat} onClick={() => navigate(`/azkar/category/${cat.slug}`)} />
          ))}
        </div>
      )}

      {/* Responsive: 1 column on mobile */}
      <style>{`
        @media (max-width: 600px) {
          .azkar-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
      </div>{/* end content overlay */}
    </div>
  );
}

function TileCard({ category, large, onClick }: { category: AzkarCategory; large?: boolean; onClick: () => void }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      onClick={onClick}
      style={{
        position: 'relative',
        height: large ? '200px' : '160px',
        borderRadius: '16px',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'scale(1.02)';
        e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.3)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Background */}
      {!imgError && category.image ? (
        <img
          src={category.image}
          alt={category.title}
          onError={() => setImgError(true)}
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover',
          }}
        />
      ) : (
        <div style={{
          position: 'absolute', inset: 0,
          background: category.gradient || 'linear-gradient(135deg, #1a3a24 0%, #0d2218 100%)',
        }} />
      )}

      {/* Overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.5) 100%)',
      }} />

      {/* Content */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '20px', textAlign: 'center', zIndex: 1,
      }}>
        <h2 style={{
          fontSize: large ? '28px' : '22px',
          fontWeight: 800, color: '#ffffff',
          textShadow: '0 2px 8px rgba(0,0,0,0.5)',
          marginBottom: '4px',
        }}>
          {category.title}
        </h2>
        <p style={{
          fontSize: '13px', color: 'rgba(255,255,255,0.8)',
          textShadow: '0 1px 4px rgba(0,0,0,0.5)',
        }}>
          {category.subtitle}
        </p>
      </div>
    </div>
  );
}

// ─── Azkar Card Component ────────────────────────────────────────────────────
const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5];
const REPEAT_OPTIONS = [0, 1, 3, 7, Infinity];

function AzkarCard({ item, accessible, onToggleFavorite, isFav }: {
  item: AzkarItem;
  accessible: boolean;
  onToggleFavorite: (id: string) => void;
  isFav: boolean;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [repeatMode, setRepeatMode] = useState(0);
  const [repeatCount, setRepeatCount] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const location = useLocation();

  const buildShareText = useCallback(() => {
    let text = `${item.title || 'Азкар'}\n\n`;
    if (item.arabic) text += `${item.arabic}\n\n`;
    if (item.transliteration) text += `Транскрипция:\n${item.transliteration}\n\n`;
    if (item.translation) text += `Перевод:\n${item.translation}\n\n`;
    if (item.source) text += `Источник: ${item.source}\n\n`;
    text += `Ссылка: ${window.location.origin}${location.pathname}#${item.id}`;
    return text;
  }, [item, location]);

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    if (repeatMode === Infinity) {
      audioRef.current?.play();
    } else if (repeatMode > 0 && repeatCount < repeatMode) {
      setRepeatCount(c => c + 1);
      audioRef.current?.play();
    } else {
      setPlaying(false);
      setRepeatCount(0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Number(e.target.value);
      setCurrentTime(Number(e.target.value));
    }
  };

  const changeSpeed = () => {
    const idx = SPEEDS.indexOf(speed);
    const next = SPEEDS[(idx + 1) % SPEEDS.length];
    setSpeed(next);
    if (audioRef.current) audioRef.current.playbackRate = next;
  };

  const cycleRepeat = () => {
    const idx = REPEAT_OPTIONS.indexOf(repeatMode);
    const next = REPEAT_OPTIONS[(idx + 1) % REPEAT_OPTIONS.length];
    setRepeatMode(next);
    setRepeatCount(0);
  };

  const shareUrl = `${window.location.origin}${location.pathname}#${item.id}`;

  const shareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(buildShareText())}`, '_blank');
  };

  const shareTelegram = () => {
    window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(buildShareText())}`, '_blank');
  };

  const shareX = () => {
    window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(buildShareText())}`, '_blank');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(buildShareText());
    toast.success('Скопировано');
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const id = item.id;

  return (
    <div id={id} className="glass-card" style={{
      padding: accessible ? '20px' : '16px',
      borderLeft: '4px solid var(--color-accent)',
      transition: 'all 0.3s ease',
    }}>
      {/* Title */}
      {item.title && (
        <h3 style={{
          fontSize: accessible ? '18px' : '16px', fontWeight: 700,
          color: 'var(--color-accent)', marginBottom: '12px',
        }}>
          {item.title}
        </h3>
      )}

      {/* Arabic text */}
      {item.arabic && (
        <div style={{
          fontFamily: 'Amiri, serif', fontSize: accessible ? '26px' : '22px',
          lineHeight: accessible ? 2.2 : 1.8,
          color: 'var(--color-text-primary)', textAlign: 'center',
          direction: 'rtl', marginBottom: '12px', padding: '16px',
          background: 'var(--color-bg-hover)', borderRadius: '12px',
          wordBreak: 'break-word',
        }}>
          {item.arabic}
        </div>
      )}

      {/* Transliteration */}
      {item.transliteration && (
        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontStyle: 'italic', marginBottom: '8px', lineHeight: 1.5 }}>
          {item.transliteration}
        </p>
      )}

      {/* Translation */}
      {item.translation && (
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.7, marginBottom: '10px' }}>
          {item.translation}
        </p>
      )}

      {/* Source */}
      {item.source && (
        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '12px' }}>
          Источник: {item.source}
        </p>
      )}

      {/* Audio Player */}
      {item.audioUrl && (
        <div style={{
          background: 'var(--color-bg-hover)', borderRadius: '12px',
          padding: '12px', marginBottom: '12px', border: '1px solid var(--color-border)',
        }}>
          <audio
            ref={audioRef}
            src={item.audioUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleEnded}
            preload="metadata"
            style={{ display: 'none' }}
          />

          {/* Play + Progress */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <button onClick={handlePlayPause} style={{
              width: '40px', height: '40px', borderRadius: '50%', border: 'none',
              background: 'var(--color-gold)', color: '#111',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0,
            }}>
              {playing ? <Pause size={18} /> : <Play size={18} style={{ marginLeft: '2px' }} />}
            </button>
            <div style={{ flex: 1 }}>
              <input type="range" min={0} max={duration || 100} value={currentTime} onChange={handleSeek}
                style={{ width: '100%', height: '4px', accentColor: 'var(--color-gold)' }} />
            </div>
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', minWidth: '70px', textAlign: 'right' }}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Speed + Repeat */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <button onClick={changeSpeed} style={pillBtnStyle}>
              {speed}x
            </button>
            <button onClick={cycleRepeat} style={{
              ...pillBtnStyle,
              background: repeatMode > 0 ? 'rgba(212,175,55,0.15)' : undefined,
              color: repeatMode > 0 ? 'var(--color-gold)' : undefined,
            }}>
              <Repeat size={12} />
              {repeatMode === Infinity ? '∞' : repeatMode > 0 ? `${repeatMode}x` : 'Выкл'}
              {repeatMode > 0 && repeatMode !== Infinity && (
                <span style={{ fontSize: '10px', opacity: 0.7 }}>{repeatCount}/{repeatMode}</span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Share Panel */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        borderRadius: '10px', overflow: 'hidden',
        border: '1px solid var(--color-border)',
      }}>
        <button onClick={shareWhatsApp} style={shareBtnStyle} title="WhatsApp">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.941 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.793.372-.273.297-1.045 1.024-1.045 2.494s1.07 2.517 1.219 2.69c.149.198 2.12 3.237 5.144 4.473.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.628-.235-.374a9.87 9.87 0 01-1.51-5.29c0-5.46 4.44-9.9 9.9-9.9 2.65 0 5.14 1.03 7.01 2.89a9.83 9.83 0 012.89 7.01c0 5.46-4.44 9.9-9.9 9.9z"/></svg>
        </button>
        <button onClick={shareTelegram} style={shareBtnStyle} title="Telegram">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
        </button>
        <button onClick={shareX} style={shareBtnStyle} title="X / Twitter">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
        </button>
        <button onClick={copyLink} style={shareBtnStyle} title="Копировать ссылку">
          <Link2 size={16} />
        </button>
      </div>
    </div>
  );
}

const pillBtnStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '4px',
  padding: '4px 10px', borderRadius: '20px', border: '1px solid var(--color-border)',
  background: 'var(--color-bg-card)', color: 'var(--color-text-secondary)',
  cursor: 'pointer', fontSize: '11px', fontWeight: 600, transition: 'all 0.2s',
};

const shareBtnStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
  padding: '10px', border: 'none', borderRight: '1px solid var(--color-border)',
  background: 'transparent', color: 'var(--color-text-muted)',
  cursor: 'pointer', fontSize: '12px', transition: 'all 0.2s',
};

// ─── Category page ───────────────────────────────────────────────────────────
export function AzkarCategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<AzkarCategory[]>([]);
  const [azkar, setAzkar] = useState<AzkarItem[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [accessible, setAccessible] = useState(() => localStorage.getItem(ACCESSIBLE_KEY) === '1');
  const [loading, setLoading] = useState(true);

  const category = categories.find(c => c.slug === slug);

  useEffect(() => {
    Promise.all([
      fetch('./data/azkar-categories.json').then(r => r.json()),
      fetch('./data/azkar.json').then(r => r.json()),
    ]).then(([cats, items]) => {
      setCategories(cats);
      setAzkar(items.filter((a: AzkarItem) => a.categorySlug === slug));
    }).catch(() => {})
      .finally(() => setLoading(false));

    try {
      setCounts(JSON.parse(localStorage.getItem('salaf-azkar-counts') || '{}'));
      setFavorites(new Set(JSON.parse(localStorage.getItem('salaf-azkar-favorites') || '[]')));
    } catch {}
  }, [slug]);

  const toggleAccessible = () => {
    const next = !accessible;
    setAccessible(next);
    localStorage.setItem(ACCESSIBLE_KEY, next ? '1' : '0');
  };

  const toggleFavorite = (id: string) => {
    const next = new Set(favorites);
    if (next.has(id)) next.delete(id); else next.add(id);
    setFavorites(next);
    localStorage.setItem('salaf-azkar-favorites', JSON.stringify([...next]));
  };

  const incrementCount = (id: string, max: number) => {
    const current = counts[id] || 0;
    if (current >= max) return;
    const next = { ...counts, [id]: current + 1 };
    setCounts(next);
    localStorage.setItem('salaf-azkar-counts', JSON.stringify(next));
  };

  const resetCount = (id: string) => {
    const next = { ...counts };
    delete next[id];
    setCounts(next);
    localStorage.setItem('salaf-azkar-counts', JSON.stringify(next));
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Скопировано');
  };

  const shareText = (text: string) => {
    if (navigator.share) {
      navigator.share({ title: 'Азкар', text });
    } else {
      copyText(text);
    }
  };

  if (loading) {
    return (
      <div className="fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className="shimmer" style={{ height: '60px', borderRadius: '12px', marginBottom: '16px' }} />
        {[1,2,3].map(i => <div key={i} className="shimmer" style={{ height: '120px', borderRadius: '12px', marginBottom: '8px' }} />)}
      </div>
    );
  }

  if (!category) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', color: 'var(--color-text-muted)' }}>
        <p>Раздел не найден</p>
        <button className="btn-primary" onClick={() => navigate('/azkar')} style={{ marginTop: '16px' }}>Назад</button>
      </div>
    );
  }

  const fontScale = accessible ? 1.2 : 1;
  const arabicSize = accessible ? '26px' : '22px';
  const btnSize = accessible ? '10px' : '12px';

  return (
    <div className="fade-in" style={{
      maxWidth: '800px', margin: '0 auto',
      fontSize: `${fontScale}em`,
    }}>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <button onClick={() => navigate('/azkar')} style={{
            display: 'flex', alignItems: 'center', gap: '6px', background: 'none',
            border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '13px',
          }}>
            <ArrowLeft size={14} /> Все разделы
          </button>

          {/* Accessible toggle */}
          <label style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            fontSize: '12px', color: 'var(--color-text-secondary)', cursor: 'pointer',
          }}>
            {accessible ? <Eye size={14} /> : <EyeOff size={14} />}
            Для слабовидящих
            <div
              onClick={toggleAccessible}
              style={{
                width: '36px', height: '20px', borderRadius: '10px',
                background: accessible ? 'var(--color-gold)' : 'var(--color-bg-hover)',
                border: '1px solid var(--color-border)',
                position: 'relative', cursor: 'pointer', transition: 'background 0.2s',
              }}
            >
              <div style={{
                width: '16px', height: '16px', borderRadius: '50%',
                background: accessible ? '#111' : 'var(--color-text-muted)',
                position: 'absolute', top: '1px',
                left: accessible ? '18px' : '1px',
                transition: 'left 0.2s',
              }} />
            </div>
          </label>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text-primary)' }}>
            {category.title}
          </h1>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>{azkar.length} азкаров</p>
      </div>

      {/* Azkar list */}
      {azkar.length === 0 ? (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          <p>Азкары этого раздела скоро будут добавлены</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {azkar.map(item => (
            <AzkarCard
              key={item.id}
              item={item}
              accessible={accessible}
              onToggleFavorite={toggleFavorite}
              isFav={favorites.has(item.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
