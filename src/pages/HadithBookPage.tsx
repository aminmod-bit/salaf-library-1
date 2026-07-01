import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, BookOpen, ExternalLink } from 'lucide-react';

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
}

interface Hadith {
  id: string;
  collectionId: string;
  slug: string;
  number: number;
  titleRu: string;
  titleAr: string;
  arabic: string;
  russian: string;
  narrator: string;
  source: string;
  grade: string;
  tags: string[];
}

export default function HadithBookPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [collection, setCollection] = useState<HadithCollection | null>(null);
  const [hadiths, setHadiths] = useState<Hadith[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('./data/hadith-collections.json').then(r => r.json()),
      fetch('./data/hadiths.json').then(r => r.json()),
    ]).then(([cols, hads]) => {
      setCollection(cols.find((c: HadithCollection) => c.slug === slug) || null);
      setHadiths(hads.filter((h: Hadith) => {
        const col = cols.find((c: HadithCollection) => c.slug === slug);
        return col && h.collectionId === col.id;
      }));
    }).catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  const filtered = useMemo(() => {
    if (!search) return hadiths;
    const q = search.toLowerCase();
    return hadiths.filter(h =>
      h.titleRu.toLowerCase().includes(q) ||
      h.titleAr.includes(q) ||
      h.arabic.includes(q) ||
      h.russian.toLowerCase().includes(q) ||
      h.source.toLowerCase().includes(q) ||
      String(h.number).includes(q)
    );
  }, [hadiths, search]);

  if (loading) {
    return (
      <div className="fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div className="shimmer" style={{ height: '120px', borderRadius: '16px', marginBottom: '16px' }} />
        {[1,2,3].map(i => <div key={i} className="shimmer" style={{ height: '80px', borderRadius: '12px', marginBottom: '8px' }} />)}
      </div>
    );
  }

  if (!collection) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', color: 'var(--color-text-muted)' }}>
        <BookOpen size={40} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '8px' }}>Сборник не найден</h3>
        <button className="btn-primary" onClick={() => navigate('/hadith')} style={{ marginTop: '16px' }}>
          <ArrowLeft size={14} /> Назад к хадисам
        </button>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => navigate('/hadith')} style={{
          display: 'flex', alignItems: 'center', gap: '6px', background: 'none',
          border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '13px', marginBottom: '12px',
        }}>
          <ArrowLeft size={14} /> Ко всем сборникам
        </button>

        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                {collection.titleRu}
              </h1>
              <div style={{ fontFamily: 'Amiri, serif', fontSize: '20px', color: 'var(--color-gold)', direction: 'rtl', textAlign: 'right', marginBottom: '8px' }}>
                {collection.titleAr}
              </div>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
                {collection.author}
              </p>
              <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                {collection.description}
              </p>
            </div>
            {collection.sourceUrl && (
              <a href={collection.sourceUrl} target="_blank" rel="noopener noreferrer" style={{
                display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px',
                borderRadius: '10px', border: '1px solid var(--color-border)',
                background: 'var(--color-bg-hover)', color: 'var(--color-text-secondary)',
                textDecoration: 'none', fontSize: '13px', fontWeight: 600, flexShrink: 0,
              }}>
                <ExternalLink size={14} /> Источник
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Search */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px',
        background: 'var(--color-bg-card)', border: '1px solid var(--color-border)',
        borderRadius: '12px', padding: '10px 16px',
      }}>
        <Search size={16} style={{ color: 'var(--color-text-muted)' }} />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Поиск по хадисам..."
          style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--color-text-primary)', fontSize: '14px' }}
        />
        {search && <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{filtered.length}</span>}
      </div>

      {/* Hadiths list */}
      {filtered.length === 0 ? (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          {hadiths.length === 0 ? (
            <>
              <BookOpen size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
              <p>Хадисы этого сборника скоро будут добавлены</p>
              {collection.sourceUrl && (
                <a href={collection.sourceUrl} target="_blank" rel="noopener noreferrer" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '12px',
                  color: 'var(--color-gold)', textDecoration: 'none', fontSize: '14px',
                }}>
                  Читать в источнике <ExternalLink size={14} />
                </a>
              )}
            </>
          ) : (
            <p>Ничего не найдено</p>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '8px' }}>
          {filtered.map(hadith => (
            <div
              key={hadith.id}
              className="glass-card glow-hover"
              style={{ padding: '16px', cursor: 'pointer' }}
              onClick={() => navigate(`/hadith/book/${slug}/${hadith.slug}`)}
            >
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                {/* Number */}
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                  background: 'var(--color-gold)', color: '#111',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '14px', fontWeight: 800,
                }}>
                  {hadith.number}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                    {hadith.titleRu}
                  </h3>
                  <p style={{
                    fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5,
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  }}>
                    {hadith.russian || hadith.arabic}
                  </p>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
                    {hadith.source && (
                      <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                        {hadith.source}
                      </span>
                    )}
                    {hadith.grade && (
                      <span style={{
                        fontSize: '10px', padding: '1px 6px', borderRadius: '100px',
                        background: hadith.grade === 'sahih' ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.15)',
                        color: hadith.grade === 'sahih' ? 'var(--color-accent-light)' : '#f59e0b',
                      }}>
                        {hadith.grade}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
