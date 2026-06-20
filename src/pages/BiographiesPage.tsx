import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useStore } from '../store/useStore';

const TYPE_LABELS: Record<string, string> = {
  all: 'Все',
  prophet: '🌟 Пророки',
  companion: '⚔️ Сподвижники',
  tabiin: '📜 Табиины',
  scholar: '📚 Учёные',
  modern: '🎖️ Современные',
};

export default function BiographiesPage() {
  const navigate = useNavigate();
  const { biographies } = useStore();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const filtered = useMemo(() => {
    let result = [...biographies];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(b =>
        b.name.toLowerCase().includes(q) ||
        (b.nameAr || '').includes(q) ||
        b.description.toLowerCase().includes(q)
      );
    }
    if (typeFilter !== 'all') {
      result = result.filter(b => b.type === typeFilter);
    }
    return result;
  }, [biographies, search, typeFilter]);

  return (
    <div className="fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#f0f4f1', marginBottom: '6px' }}>
          👤 Биографии
        </h1>
        <p style={{ color: '#9db8a3', fontSize: '14px' }}>
          {filtered.length} биографий — пророки, сподвижники, табиины и учёные
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
            placeholder="Поиск по биографиям..."
            style={{ background: 'none', border: 'none', outline: 'none', color: '#f0f4f1', fontSize: '14px', fontFamily: 'inherit', width: '100%' }}
          />
        </div>
      </div>

      {/* Type tabs */}
      <div className="scroll-row" style={{ marginBottom: '24px', gap: '8px' }}>
        {Object.entries(TYPE_LABELS).map(([value, label]) => (
          <button
            key={value}
            onClick={() => setTypeFilter(value)}
            className={`tag ${typeFilter === value ? 'active' : ''}`}
            style={{ whiteSpace: 'nowrap' }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#5a7a63' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>👤</div>
          <div style={{ fontSize: '18px', fontWeight: 600, color: '#9db8a3' }}>Ничего не найдено</div>
        </div>
      ) : (
        <div className="cards-grid">
          {filtered.map(bio => (
            <div
              key={bio.id}
              onClick={() => navigate(`/biographies/${bio.id}`)}
              style={{
                background: 'var(--color-bg-card)', border: '1px solid var(--color-border)',
                borderRadius: '14px', overflow: 'hidden', cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,175,55,0.4)';
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)';
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
              }}
            >
              {/* Avatar */}
              <div style={{
                width: '100px', flexShrink: 0,
                background: `linear-gradient(160deg, ${bio.coverColor || '#1a3a2a'}, ${bio.coverColor || '#1a3a2a'}88)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '40px',
              }}>
                {bio.coverEmoji || '👤'}
              </div>

              {/* Info */}
              <div style={{ padding: '16px', flex: 1 }}>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '6px', flexWrap: 'wrap' }}>
                  <span className="badge badge-gold" style={{ fontSize: '10px' }}>
                    {TYPE_LABELS[bio.type]?.replace(/^[^\s]+ /, '') || bio.type}
                  </span>
                  {bio.featured && <span className="badge badge-green" style={{ fontSize: '10px' }}>Избранный</span>}
                </div>

                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#f0f4f1', marginBottom: '2px' }}>
                  {bio.name}
                </h3>
                {bio.nameAr && (
                  <div style={{
                    fontFamily: 'Amiri, serif', fontSize: '14px',
                    color: '#d4af37', direction: 'rtl', marginBottom: '4px',
                  }}>
                    {bio.nameAr}
                  </div>
                )}
                {(bio.birthYear || bio.deathYear) && (
                  <div style={{ fontSize: '11px', color: '#5a7a63', marginBottom: '8px' }}>
                    {bio.birthYear}{bio.deathYear ? ` — ${bio.deathYear}` : ''}
                    {bio.birthPlace ? ` · ${bio.birthPlace}` : ''}
                  </div>
                )}
                <p style={{
                  fontSize: '12px', color: '#9db8a3', lineHeight: 1.5,
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                  {bio.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
