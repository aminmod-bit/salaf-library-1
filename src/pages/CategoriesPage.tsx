import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';

export default function CategoriesPage() {
  const navigate = useNavigate();
  const { categories, books } = useStore();

  return (
    <div className="fade-in" style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#f0f4f1', marginBottom: '6px' }}>
          📂 Категории
        </h1>
        <p style={{ color: '#9db8a3', fontSize: '14px' }}>
          {categories.length} категорий в библиотеке
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
        {categories.map(cat => {
          const count = books.filter(b => b.category === cat.name).length;
          return (
            <div
              key={cat.id}
              onClick={() => navigate(`/books?category=${cat.name}`)}
              style={{
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
                borderRadius: '16px', padding: '24px',
                cursor: 'pointer', transition: 'all 0.3s ease',
                position: 'relative', overflow: 'hidden',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,175,55,0.4)';
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 40px rgba(0,0,0,0.4), 0 0 20px rgba(212,175,55,0.1)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)';
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
              }}
            >
              {/* Background */}
              <div style={{
                position: 'absolute', top: '-20px', right: '-20px',
                width: '100px', height: '100px',
                background: `${cat.color}20`,
                borderRadius: '50%',
              }} />

              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>{cat.icon}</div>
                <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#f0f4f1', marginBottom: '4px' }}>
                  {cat.name}
                </h3>
                {cat.nameAr && (
                  <div style={{
                    fontFamily: 'Amiri, serif', fontSize: '14px',
                    color: '#d4af37', direction: 'rtl', marginBottom: '8px',
                  }}>
                    {cat.nameAr}
                  </div>
                )}
                {cat.description && (
                  <p style={{ fontSize: '12px', color: '#9db8a3', lineHeight: 1.5, marginBottom: '12px' }}>
                    {cat.description}
                  </p>
                )}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="badge badge-gold">
                    {count > 0 ? `${count} книг` : cat.count ? `${cat.count}+` : '0'}
                  </span>
                  <span style={{ fontSize: '12px', color: '#5a7a63' }}>Открыть →</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
