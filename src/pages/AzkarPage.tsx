import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Copy, Heart, Share2, Repeat, Search, Eye, EyeOff
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
        <div style={{ display: 'grid', gap: '12px' }}>
          {azkar.map(item => {
            const currentCount = counts[item.id] || 0;
            const isComplete = currentCount >= item.repeat;
            const isFav = favorites.has(item.id);
            const progress = item.repeat ? (currentCount / item.repeat) * 100 : 0;

            return (
              <div key={item.id} className="glass-card" style={{
                padding: accessible ? '20px' : '16px',
                borderColor: isComplete ? 'var(--color-accent-light)' : undefined,
                transition: 'all 0.3s ease',
              }}>
                {/* Arabic text */}
                {item.arabic && (
                  <div style={{
                    fontFamily: 'Amiri, serif', fontSize: arabicSize, lineHeight: accessible ? 2.2 : 1.8,
                    color: 'var(--color-text-primary)', textAlign: 'right',
                    direction: 'rtl', marginBottom: '12px', padding: '14px',
                    background: 'var(--color-bg-hover)', borderRadius: '12px',
                  }}>
                    {item.arabic}
                  </div>
                )}

                {/* Transliteration */}
                {item.transliteration && (
                  <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontStyle: 'italic', marginBottom: '8px' }}>
                    {item.transliteration}
                  </p>
                )}

                {/* Translation */}
                {item.translation && (
                  <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '10px' }}>
                    {item.translation}
                  </p>
                )}

                {/* Source */}
                {item.source && (
                  <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginBottom: '10px' }}>
                    Источник: {item.source}
                  </p>
                )}

                {/* Progress bar */}
                {item.repeat > 0 && (
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                      <span>{currentCount} / {item.repeat}</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <div style={{ height: '4px', background: 'var(--color-bg-hover)', borderRadius: '999px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${progress}%`, background: isComplete ? 'var(--color-accent-light)' : 'var(--color-gold)', borderRadius: '999px', transition: 'width 0.3s' }} />
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                  {item.repeat > 0 && (
                    <>
                      <button
                        onClick={() => incrementCount(item.id, item.repeat)}
                        disabled={isComplete}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '4px',
                          padding: `${accessible ? 10 : 8}px ${accessible ? 16 : 12}px`,
                          borderRadius: '8px', border: 'none',
                          background: isComplete ? 'var(--color-accent-light)' : 'var(--color-gold)',
                          color: isComplete ? '#fff' : '#111', fontWeight: 700, fontSize: btnSize,
                          cursor: isComplete ? 'default' : 'pointer', transition: 'all 0.2s',
                        }}
                      >
                        <Repeat size={accessible ? 16 : 14} />
                        {isComplete ? 'Готово' : `Повторить (${item.repeat})`}
                      </button>
                      <button onClick={() => resetCount(item.id)} style={{
                        padding: `${accessible ? 10 : 8}px`, borderRadius: '8px', border: '1px solid var(--color-border)',
                        background: 'var(--color-bg-hover)', color: 'var(--color-text-muted)', cursor: 'pointer',
                      }}>
                        <Repeat size={accessible ? 16 : 14} />
                      </button>
                    </>
                  )}
                  <button onClick={() => copyText(item.arabic || item.translation)} style={{
                    padding: `${accessible ? 10 : 8}px`, borderRadius: '8px', border: '1px solid var(--color-border)',
                    background: 'var(--color-bg-hover)', color: 'var(--color-text-muted)', cursor: 'pointer',
                  }} title="Копировать">
                    <Copy size={accessible ? 16 : 14} />
                  </button>
                  <button onClick={() => shareText(item.arabic || item.translation)} style={{
                    padding: `${accessible ? 10 : 8}px`, borderRadius: '8px', border: '1px solid var(--color-border)',
                    background: 'var(--color-bg-hover)', color: 'var(--color-text-muted)', cursor: 'pointer',
                  }} title="Поделиться">
                    <Share2 size={accessible ? 16 : 14} />
                  </button>
                  <button onClick={() => toggleFavorite(item.id)} style={{
                    padding: `${accessible ? 10 : 8}px`, borderRadius: '8px', border: '1px solid var(--color-border)',
                    background: isFav ? 'rgba(239,68,68,0.1)' : 'var(--color-bg-hover)',
                    color: isFav ? '#ef4444' : 'var(--color-text-muted)', cursor: 'pointer',
                  }}>
                    <Heart size={accessible ? 16 : 14} fill={isFav ? '#ef4444' : 'none'} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
