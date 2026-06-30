import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Repeat, Search, Shield, Sparkles, Copy, Heart, Check,
  ArrowLeft, Sun, Moon, BookOpen, Home, Coffee, Plane, CloudRain, HeartPulse
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Zikr {
  id: string;
  type: string;
  category: string;
  title: string;
  arabic: string;
  transliteration?: string;
  translationRu: string;
  source: string;
  repeat: number;
  benefit: string;
}

const SECTIONS = [
  { id: 'morning', label: 'Утренние азкары', icon: Sun, description: 'Азкары на утро', color: '#f59e0b' },
  { id: 'evening', label: 'Вечерние азкары', icon: Moon, description: 'Азкары на вечер', color: '#6366f1' },
  { id: 'after-prayer', label: 'После намаза', icon: BookOpen, description: 'После каждого намаза', color: '#22c55e' },
  { id: 'sleep', label: 'Перед сном', icon: Coffee, description: 'При засыпании и пробуждении', color: '#8b5cf6' },
  { id: 'travel', label: 'Для путешествия', icon: Plane, description: 'При поездках', color: '#0ea5e9' },
  { id: 'rain', label: 'Во время дождя', icon: CloudRain, description: 'При дожде', color: '#3b82f6' },
  { id: 'illness', label: 'При болезни', icon: HeartPulse, description: 'Для больных', color: '#ef4444' },
  { id: 'before-food', label: 'Перед едой', icon: Coffee, description: 'Перед приёмом пищи', color: '#f97316' },
];

const FAVORITES_KEY = 'salaf-azkar-favorites';
const COUNTS_KEY = 'salaf-azkar-counts';

// Main sections page
export function AzkarSectionsPage() {
  const navigate = useNavigate();

  return (
    <div className="fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <section className="glass-card islamic-pattern" style={{ padding: '32px', marginBottom: '24px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>🤲</div>
        <h1 style={{ color: 'var(--color-text-primary)', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 900, marginBottom: '8px' }}>
          Азкары и поминания
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '15px', lineHeight: 1.6, maxWidth: '500px', margin: '0 auto' }}>
          Поминания на каждый день: утренние, вечерные, после намаза, перед сном и другие
        </p>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '14px' }}>
        {SECTIONS.map(section => (
          <button
            key={section.id}
            onClick={() => navigate(`/azkar/${section.id}`)}
            style={{
              padding: '20px', borderRadius: '16px', border: '1px solid var(--color-border)',
              background: 'var(--color-bg-card)', cursor: 'pointer', textAlign: 'left',
              transition: 'all 0.2s', display: 'flex', flexDirection: 'column', gap: '10px',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = section.color; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <div style={{
              width: '44px', height: '44px', borderRadius: '12px',
              background: `${section.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <section.icon size={22} style={{ color: section.color }} />
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)' }}>{section.label}</div>
              <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '2px' }}>{section.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// Section page (individual azkar list)
export function AzkarSectionPage() {
  const { sectionId } = useParams<{ sectionId: string }>();
  const navigate = useNavigate();
  const [azkar, setAzkar] = useState<Zikr[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const section = SECTIONS.find(s => s.id === sectionId);

  useEffect(() => {
    fetch('./data/azkar.json').then(r => r.json()).then(data => {
      const filtered = data.filter((z: Zikr) => z.type === sectionId || z.category === sectionId);
      setAzkar(filtered);
    }).catch(() => setAzkar([]));

    try {
      setCounts(JSON.parse(localStorage.getItem(COUNTS_KEY) || '{}'));
      setFavorites(new Set(JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]')));
    } catch {}
  }, [sectionId]);

  const toggleFavorite = (id: string) => {
    const next = new Set(favorites);
    if (next.has(id)) next.delete(id); else next.add(id);
    setFavorites(next);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify([...next]));
  };

  const incrementCount = (id: string, max: number) => {
    const current = counts[id] || 0;
    if (current >= max) return;
    const next = { ...counts, [id]: current + 1 };
    setCounts(next);
    localStorage.setItem(COUNTS_KEY, JSON.stringify(next));
  };

  const resetCount = (id: string) => {
    const next = { ...counts };
    delete next[id];
    setCounts(next);
    localStorage.setItem(COUNTS_KEY, JSON.stringify(next));
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Скопировано');
  };

  if (!section) return (
    <div style={{ textAlign: 'center', padding: '60px', color: 'var(--color-text-muted)' }}>
      Раздел не найден
      <button onClick={() => navigate('/azkar')} className="btn-primary" style={{ marginTop: '16px' }}>Назад</button>
    </div>
  );

  return (
    <div className="fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => navigate('/azkar')} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '13px', marginBottom: '12px' }}>
          <ArrowLeft size={14} /> Все разделы
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${section.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <section.icon size={22} style={{ color: section.color }} />
          </div>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text-primary)' }}>{section.label}</h1>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>{azkar.length} азкаров</p>
          </div>
        </div>
      </div>

      {azkar.length === 0 ? (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          <Sparkles size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
          <p>Азкары этого раздела скоро будут добавлены</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '12px' }}>
          {azkar.map(zikr => {
            const currentCount = counts[zikr.id] || 0;
            const isComplete = currentCount >= zikr.repeat;
            const isFav = favorites.has(zikr.id);
            const progress = zikr.repeat ? (currentCount / zikr.repeat) * 100 : 0;

            return (
              <div key={zikr.id} className="glass-card" style={{
                padding: '16px',
                borderColor: isComplete ? 'var(--color-accent-light)' : undefined,
                opacity: isComplete ? 0.7 : 1,
              }}>
                {/* Arabic text */}
                {zikr.arabic && (
                  <div style={{
                    fontFamily: 'Amiri, serif', fontSize: '22px', lineHeight: 1.8,
                    color: 'var(--color-text-primary)', textAlign: 'right',
                    direction: 'rtl', marginBottom: '10px', padding: '12px',
                    background: 'var(--color-bg-hover)', borderRadius: '12px',
                  }}>
                    {zikr.arabic}
                  </div>
                )}

                {/* Translation */}
                {zikr.translationRu && (
                  <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '10px' }}>
                    {zikr.translationRu}
                  </p>
                )}

                {/* Source & benefit */}
                {zikr.source && (
                  <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '10px' }}>
                    Источник: {zikr.source}
                  </p>
                )}
                {zikr.benefit && (
                  <p style={{ fontSize: '12px', color: 'var(--color-gold)', marginBottom: '10px' }}>
                    {zikr.benefit}
                  </p>
                )}

                {/* Progress bar */}
                {zikr.repeat > 0 && (
                  <div style={{ marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                      <span>{currentCount} / {zikr.repeat}</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <div style={{ height: '4px', background: 'var(--color-bg-hover)', borderRadius: '999px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${progress}%`, background: isComplete ? 'var(--color-accent-light)' : 'var(--color-gold)', borderRadius: '999px', transition: 'width 0.3s' }} />
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                  {zikr.repeat > 0 && (
                    <>
                      <button
                        onClick={() => incrementCount(zikr.id, zikr.repeat)}
                        disabled={isComplete}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '4px',
                          padding: '8px 14px', borderRadius: '8px', border: 'none',
                          background: isComplete ? 'var(--color-accent-light)' : 'var(--color-gold)',
                          color: isComplete ? '#fff' : '#111', fontWeight: 700, fontSize: '13px',
                          cursor: isComplete ? 'default' : 'pointer', transition: 'all 0.2s',
                        }}
                      >
                        {isComplete ? <Check size={14} /> : <Repeat size={14} />}
                        {isComplete ? 'Готово' : `Повторить (${zikr.repeat})`}
                      </button>
                      <button onClick={() => resetCount(zikr.id)} style={{
                        padding: '8px', borderRadius: '8px', border: '1px solid var(--color-border)',
                        background: 'var(--color-bg-hover)', color: 'var(--color-text-muted)', cursor: 'pointer',
                      }}>
                        <Repeat size={14} />
                      </button>
                    </>
                  )}
                  <button onClick={() => copyText(zikr.arabic || zikr.translationRu)} style={{
                    padding: '8px', borderRadius: '8px', border: '1px solid var(--color-border)',
                    background: 'var(--color-bg-hover)', color: 'var(--color-text-muted)', cursor: 'pointer',
                  }} title="Копировать">
                    <Copy size={14} />
                  </button>
                  <button onClick={() => toggleFavorite(zikr.id)} style={{
                    padding: '8px', borderRadius: '8px', border: '1px solid var(--color-border)',
                    background: isFav ? 'rgba(239,68,68,0.1)' : 'var(--color-bg-hover)',
                    color: isFav ? '#ef4444' : 'var(--color-text-muted)', cursor: 'pointer',
                  }}>
                    <Heart size={14} fill={isFav ? '#ef4444' : 'none'} />
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
