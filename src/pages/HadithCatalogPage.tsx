import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, BookOpen, ExternalLink, ChevronRight } from 'lucide-react';

interface HadithCollection {
  id: string;
  slug: string;
  titleRu: string;
  titleAr: string;
  author: string;
  description: string;
  sourceUrl: string;
  count: number;
  available: boolean;
  coverColor?: string;
  coverEmoji?: string;
}

export default function HadithCatalogPage() {
  const navigate = useNavigate();
  const [collections, setCollections] = useState<HadithCollection[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('./data/hadith-collections.json')
      .then(r => r.json())
      .then(data => setCollections(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!search) return collections;
    const q = search.toLowerCase();
    return collections.filter(c =>
      c.titleRu.toLowerCase().includes(q) ||
      c.titleAr.includes(q) ||
      c.author.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q)
    );
  }, [collections, search]);

  return (
    <div className="fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <section className="glass-card islamic-pattern" style={{ padding: '32px', marginBottom: '24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '12px', flexWrap: 'wrap' }}>
          <h1 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, color: 'var(--color-text-primary)' }}>
            Хадисы
          </h1>
          <span style={{
            fontFamily: 'Amiri, serif', fontSize: '28px', color: 'var(--color-gold)',
            direction: 'rtl',
          }}>
            الأحاديث
          </span>
        </div>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '15px', lineHeight: 1.6 }}>
          Хадисы пророка Мухаммада ﷺ — сборники и извлечения
        </p>
      </section>

      {/* Search */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px',
        background: 'var(--color-bg-card)', border: '1px solid var(--color-border)',
        borderRadius: '14px', padding: '12px 18px',
      }}>
        <Search size={18} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Поиск по сборникам, авторам..."
          style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--color-text-primary)', fontSize: '15px' }}
        />
      </div>

      {/* Collections grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {[1,2,3,4].map(i => (
            <div key={i} className="shimmer" style={{ height: '180px', borderRadius: '16px' }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <BookOpen size={40} style={{ color: 'var(--color-text-muted)', margin: '0 auto 16px', opacity: 0.5 }} />
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
            Ничего не найдено
          </h3>
          <p style={{ color: 'var(--color-text-secondary)' }}>Попробуйте изменить запрос</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {filtered.map(collection => (
            <div
              key={collection.id}
              className="glass-card glow-hover"
              style={{ cursor: 'pointer', overflow: 'hidden' }}
              onClick={() => {
                if (collection.available) {
                  navigate(`/hadith/book/${collection.slug}`);
                } else if (collection.sourceUrl) {
                  window.open(collection.sourceUrl, '_blank');
                }
              }}
            >
              {/* Cover */}
              <div style={{
                height: '120px',
                background: collection.coverColor || 'var(--color-bg-secondary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative',
              }}>
                <div style={{
                  position: 'absolute', inset: 0, opacity: 0.08,
                  backgroundImage: 'radial-gradient(circle at 1px 1px, var(--color-gold) 1px, transparent 0)',
                  backgroundSize: '20px 20px',
                }} />
                <span style={{ fontSize: '40px', position: 'relative', zIndex: 1 }}>{collection.coverEmoji || '📚'}</span>
                {!collection.available && (
                  <div style={{
                    position: 'absolute', top: '10px', right: '10px',
                    padding: '3px 8px', borderRadius: '6px',
                    background: 'rgba(245,158,11,0.9)', color: '#111',
                    fontSize: '10px', fontWeight: 700, zIndex: 2,
                  }}>
                    Скоро
                  </div>
                )}
              </div>

              {/* Info */}
              <div style={{ padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '2px' }}>
                      {collection.titleRu}
                    </h3>
                    <div style={{ fontFamily: 'Amiri, serif', fontSize: '14px', color: 'var(--color-gold)', direction: 'rtl', textAlign: 'right' }}>
                      {collection.titleAr}
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
                  {collection.author}
                </p>

                <p style={{
                  fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: 1.5,
                  marginBottom: '12px',
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                  {collection.description}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{
                    fontSize: '12px', padding: '3px 10px', borderRadius: '100px',
                    background: 'var(--color-bg-hover)', color: 'var(--color-text-muted)',
                    border: '1px solid var(--color-border)',
                  }}>
                    {collection.count.toLocaleString()} хадисов
                  </span>
                  {collection.available ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--color-gold)' }}>
                      Читать <ChevronRight size={14} />
                    </span>
                  ) : collection.sourceUrl ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                      Источник <ExternalLink size={12} />
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
