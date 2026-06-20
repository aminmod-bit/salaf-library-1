import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, BookOpen, Headphones } from 'lucide-react';
import { useStore } from '../store/useStore';
import BookCard from '../components/BookCard';

const TYPE_MAP: Record<string, string> = {
  prophet: '🌟 Пророк',
  companion: '⚔️ Сподвижник',
  tabiin: '📜 Табиин',
  scholar: '📚 Учёный',
  modern: '🎖️ Современный учёный',
};

export default function BiographyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { biographies, books, audioLessons } = useStore();

  const bio = biographies.find(b => b.id === id);

  if (!bio) {
    return (
      <div style={{ textAlign: 'center', padding: '80px', color: '#5a7a63' }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>👤</div>
        <div style={{ fontSize: '20px', fontWeight: 600, color: '#9db8a3' }}>Биография не найдена</div>
        <button className="btn-secondary" style={{ marginTop: '20px' }} onClick={() => navigate('/biographies')}>
          <ArrowLeft size={16} /> Назад
        </button>
      </div>
    );
  }

  const relatedBooks = books.filter(b => bio.relatedBooks?.includes(b.id));
  const relatedAudio = audioLessons.filter(a => bio.relatedAudio?.includes(a.id));

  return (
    <div className="fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: 'none', border: 'none', color: '#9db8a3',
          fontSize: '14px', cursor: 'pointer', marginBottom: '24px',
        }}
      >
        <ArrowLeft size={16} /> Назад
      </button>

      {/* Hero */}
      <div style={{
        background: `linear-gradient(135deg, ${bio.coverColor || '#1a3a2a'}33 0%, var(--color-bg-card) 100%)`,
        border: '1px solid rgba(212,175,55,0.2)',
        borderRadius: '20px',
        padding: '32px',
        marginBottom: '32px',
        display: 'flex',
        gap: '28px',
        alignItems: 'flex-start',
      }}
      className="bio-hero"
      >
        <style>{`
          @media (max-width: 640px) {
            .bio-hero { flex-direction: column !important; align-items: center !important; text-align: center; }
          }
        `}</style>

        {/* Avatar */}
        <div style={{
          width: '120px', height: '120px', borderRadius: '50%', flexShrink: 0,
          background: `linear-gradient(135deg, ${bio.coverColor || '#1a3a2a'}, ${bio.coverColor || '#1a3a2a'}88)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '52px', border: '3px solid rgba(212,175,55,0.3)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}>
          {bio.coverEmoji || '👤'}
        </div>

        {/* Info */}
        <div style={{ flex: 1 }}>
          <span className="badge badge-gold" style={{ marginBottom: '10px', display: 'inline-flex' }}>
            {TYPE_MAP[bio.type] || bio.type}
          </span>

          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#f0f4f1', marginBottom: '6px', lineHeight: 1.2 }}>
            {bio.name}
          </h1>
          {bio.nameAr && (
            <div style={{
              fontFamily: 'Amiri, serif', fontSize: '22px',
              color: '#d4af37', direction: 'rtl', marginBottom: '12px',
            }}>
              {bio.nameAr}
            </div>
          )}

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '16px' }}>
            {bio.birthYear && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#9db8a3', fontSize: '13px' }}>
                <Calendar size={13} />
                {bio.birthYear}{bio.deathYear ? ` — ${bio.deathYear}` : ''}
              </div>
            )}
            {bio.birthPlace && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#9db8a3', fontSize: '13px' }}>
                <MapPin size={13} />
                {bio.birthPlace}
              </div>
            )}
          </div>

          <p style={{ fontSize: '15px', color: '#9db8a3', lineHeight: 1.7 }}>
            {bio.description}
          </p>
        </div>
      </div>

      {/* Full biography */}
      {bio.fullBio && (
        <div style={{
          background: 'var(--color-bg-card)', border: '1px solid var(--color-border)',
          borderRadius: '16px', padding: '28px', marginBottom: '28px',
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#f0f4f1', marginBottom: '16px' }}>
            📖 Подробная биография
          </h2>
          <p style={{ fontSize: '15px', color: '#9db8a3', lineHeight: 1.8 }}>
            {bio.fullBio}
          </p>
        </div>
      )}

      {/* Tags */}
      {bio.tags.length > 0 && (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '28px' }}>
          {bio.tags.map(tag => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>
      )}

      {/* Related books */}
      {relatedBooks.length > 0 && (
        <div style={{ marginBottom: '28px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#f0f4f1', marginBottom: '16px' }}>
            <BookOpen size={18} style={{ display: 'inline', marginRight: '8px' }} />
            Связанные книги
          </h2>
          <div className="scroll-row">
            {relatedBooks.map(b => (
              <div key={b.id} style={{ flexShrink: 0 }}>
                <BookCard book={b} size="sm" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related audio */}
      {relatedAudio.length > 0 && (
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#f0f4f1', marginBottom: '16px' }}>
            <Headphones size={18} style={{ display: 'inline', marginRight: '8px' }} />
            Связанные уроки
          </h2>
          {/* Audio list */}
        </div>
      )}
    </div>
  );
}
