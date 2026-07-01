import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, Share2, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';

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
  explanation?: string;
  tags: string[];
  sourceUrl?: string;
}

interface HadithCollection {
  id: string;
  slug: string;
  titleRu: string;
  titleAr: string;
}

export default function HadithDetailPage() {
  const { bookSlug, hadithSlug } = useParams<{ bookSlug: string; hadithSlug: string }>();
  const navigate = useNavigate();
  const [hadith, setHadith] = useState<Hadith | null>(null);
  const [collection, setCollection] = useState<HadithCollection | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('./data/hadith-collections.json').then(r => r.json()),
      fetch('./data/hadiths.json').then(r => r.json()),
    ]).then(([cols, hads]) => {
      const col = cols.find((c: HadithCollection) => c.slug === bookSlug);
      setCollection(col || null);
      if (col) {
        setHadith(hads.find((h: Hadith) => h.collectionId === col.id && h.slug === hadithSlug) || null);
      }
    }).catch(() => {})
      .finally(() => setLoading(false));
  }, [bookSlug, hadithSlug]);

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Скопировано');
  };

  const shareText = () => {
    if (navigator.share) {
      navigator.share({
        title: hadith?.titleRu || 'Хадис',
        text: `${hadith?.titleRu}\n\n${hadith?.russian}\n\n${hadith?.arabic}`,
      });
    } else {
      copyText(`${hadith?.titleRu}\n\n${hadith?.russian}\n\n${hadith?.arabic}`);
    }
  };

  if (loading) {
    return (
      <div className="fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div className="shimmer" style={{ height: '60px', borderRadius: '12px', marginBottom: '16px' }} />
        <div className="shimmer" style={{ height: '300px', borderRadius: '16px' }} />
      </div>
    );
  }

  if (!hadith) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', color: 'var(--color-text-muted)' }}>
        <BookOpen size={40} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '8px' }}>Хадис не найден</h3>
        <button className="btn-primary" onClick={() => navigate(`/hadith/book/${bookSlug}`)} style={{ marginTop: '16px' }}>
          <ArrowLeft size={14} /> Назад к сборнику
        </button>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <button onClick={() => navigate(`/hadith/book/${bookSlug}`)} style={{
          display: 'flex', alignItems: 'center', gap: '6px', background: 'none',
          border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '13px',
        }}>
          <ArrowLeft size={14} /> {collection?.titleRu || 'Назад'}
        </button>

        <div style={{ display: 'flex', gap: '6px' }}>
          <button onClick={() => copyText(hadith.russian)} style={{
            padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-border)',
            background: 'var(--color-bg-hover)', color: 'var(--color-text-secondary)',
            cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px',
          }}>
            <Copy size={12} /> Русский
          </button>
          <button onClick={() => copyText(hadith.arabic)} style={{
            padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-border)',
            background: 'var(--color-bg-hover)', color: 'var(--color-text-secondary)',
            cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px',
          }}>
            <Copy size={12} /> Арабский
          </button>
          <button onClick={shareText} style={{
            padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-border)',
            background: 'var(--color-bg-hover)', color: 'var(--color-text-secondary)',
            cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px',
          }}>
            <Share2 size={12} /> Поделиться
          </button>
        </div>
      </div>

      {/* Arabic title */}
      <div style={{
        textAlign: 'center', marginBottom: '24px',
        fontFamily: 'Amiri, serif', fontSize: '24px', color: 'var(--color-gold)',
        direction: 'rtl',
      }}>
        {hadith.titleAr}
      </div>

      {/* Number and title */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '6px 14px', borderRadius: '100px',
          background: 'var(--color-bg-hover)', border: '1px solid var(--color-border)',
          marginBottom: '8px',
        }}>
          <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--color-gold)' }}>{hadith.number}</span>
        </div>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
          {hadith.titleRu}
        </h1>
      </div>

      {/* Content */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        {/* Russian */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
            Перевод
          </div>
          <p style={{ fontSize: '15px', lineHeight: 1.8, color: 'var(--color-text-primary)' }}>
            {hadith.russian}
          </p>
          {hadith.narrator && (
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '12px', fontStyle: 'italic' }}>
              Передал: {hadith.narrator}
            </p>
          )}
        </div>

        {/* Arabic */}
        <div className="glass-card" style={{ padding: '20px', direction: 'rtl' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px', textAlign: 'left' }}>
            النص العربي
          </div>
          <p style={{
            fontFamily: 'Amiri, serif', fontSize: '20px', lineHeight: 2,
            color: 'var(--color-text-primary)', textAlign: 'right',
          }}>
            {hadith.arabic}
          </p>
        </div>
      </div>

      {/* Mobile: stacked layout */}
      <style>{`
        @media (max-width: 768px) {
          .hadith-content-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Meta */}
      <div className="glass-card" style={{ padding: '16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '13px' }}>
          {hadith.source && (
            <div>
              <span style={{ color: 'var(--color-text-muted)' }}>Источник: </span>
              <span style={{ color: 'var(--color-text-primary)' }}>{hadith.source}</span>
            </div>
          )}
          {hadith.grade && (
            <div>
              <span style={{ color: 'var(--color-text-muted)' }}>Степень: </span>
              <span style={{
                padding: '2px 8px', borderRadius: '100px', fontSize: '12px',
                background: hadith.grade === 'sahih' ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.15)',
                color: hadith.grade === 'sahih' ? 'var(--color-accent-light)' : '#f59e0b',
              }}>
                {hadith.grade}
              </span>
            </div>
          )}
          {hadith.narrator && (
            <div>
              <span style={{ color: 'var(--color-text-muted)' }}>Рассказчик: </span>
              <span style={{ color: 'var(--color-text-primary)' }}>{hadith.narrator}</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {hadith.tags && hadith.tags.length > 0 && (
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '12px' }}>
            {hadith.tags.map(tag => (
              <span key={tag} style={{
                padding: '3px 10px', borderRadius: '100px', fontSize: '11px',
                background: 'var(--color-bg-hover)', color: 'var(--color-text-muted)',
                border: '1px solid var(--color-border)',
              }}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Source link */}
      {hadith.sourceUrl && (
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <a href={hadith.sourceUrl} target="_blank" rel="noopener noreferrer" style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            color: 'var(--color-gold)', textDecoration: 'none', fontSize: '13px',
          }}>
            Читать в источнике <BookOpen size={14} />
          </a>
        </div>
      )}
    </div>
  );
}
