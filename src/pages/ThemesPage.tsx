import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Palette } from 'lucide-react';
import { useStore } from '../store/useStore';
import { THEMES } from '../components/ThemeToggle';

export default function ThemesPage() {
  const { theme, setTheme } = useStore();
  const navigate = useNavigate();

  return (
    <div className="fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <button onClick={() => navigate(-1)} style={{
          display: 'flex', alignItems: 'center', gap: '6px', background: 'none',
          border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '13px', marginBottom: '12px',
        }}>
          <ArrowLeft size={14} /> Назад
        </button>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '6px' }}>
          🎨 Темы оформления
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
          Выберите тему, которая вам нравится. Настройки сохраняются автоматически.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
        {THEMES.map(t => (
          <button
            key={t.id}
            onClick={() => setTheme(t.id as any)}
            style={{
              padding: '0',
              borderRadius: '16px',
              border: `2px solid ${theme === t.id ? 'var(--color-gold)' : 'var(--color-border)'}`,
              background: 'var(--color-bg-card)',
              cursor: 'pointer',
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              textAlign: 'left',
            }}
            onMouseEnter={e => {
              if (theme !== t.id) e.currentTarget.style.borderColor = 'var(--color-border-hover)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              if (theme !== t.id) e.currentTarget.style.borderColor = 'var(--color-border)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {/* Color preview */}
            <div style={{
              height: '80px',
              display: 'flex',
              position: 'relative',
            }}>
              {t.preview.map((color, i) => (
                <div key={i} style={{ flex: 1, background: color }} />
              ))}
              {theme === t.id && (
                <div style={{
                  position: 'absolute', top: '8px', right: '8px',
                  width: '24px', height: '24px', borderRadius: '50%',
                  background: 'var(--color-gold)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Check size={14} color="#fff" />
                </div>
              )}
            </div>

            {/* Info */}
            <div style={{ padding: '14px 16px' }}>
              <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '2px' }}>
                {t.name}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                {t.description}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Current theme info */}
      <div className="glass-card" style={{ padding: '20px', marginTop: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Palette size={18} style={{ color: 'var(--color-gold)' }} />
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
              Текущая тема: {THEMES.find(t => t.id === theme)?.name || theme}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
              Настройки сохраняются в браузере и применяются автоматически
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
