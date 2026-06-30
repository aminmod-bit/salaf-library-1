import { useEffect, useState } from 'react';
import { Palette, Check } from 'lucide-react';
import { useStore } from '../store/useStore';

export interface ThemeOption {
  id: string;
  name: string;
  bg: string;
  accent: string;
}

export const THEMES: ThemeOption[] = [
  { id: 'medina-night', name: 'Ночь Медины', bg: '#0a1a0f', accent: '#22c55e' },
  { id: 'olive-sand', name: 'Олива и песок', bg: '#1a1f14', accent: '#a3c55e' },
  { id: 'sky-marble', name: 'Небо и мрамор', bg: '#12101e', accent: '#a78bfa' },
  { id: 'qibla-gold', name: 'Золото киблы', bg: '#1a1508', accent: '#d4af37' },
  { id: 'tender-rose', name: 'Нежная роза', bg: '#1e0f18', accent: '#f472b6' },
  { id: 'lilac-pearl', name: 'Лиловый жемчуг', bg: '#16101e', accent: '#b89cef' },
  { id: 'ivory', name: 'Слоновая кость', bg: '#f5f0e8', accent: '#8b7355' },
  { id: 'cream-mint', name: 'Кремовая мята', bg: '#f0f5f0', accent: '#3ba562' },
];

function applyTheme(themeId: string) {
  document.documentElement.setAttribute('data-theme', themeId);
}

export default function ThemeToggle() {
  const { theme, setTheme } = useStore();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const current = THEMES.find(t => t.id === theme) || THEMES[0];

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        title="Выбрать тему"
        style={{
          background: current.bg,
          border: `2px solid ${current.accent}`,
          borderRadius: '10px',
          padding: '7px',
          color: current.accent,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
          width: '34px',
          height: '34px',
        }}
      >
        <Palette size={16} />
      </button>

      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 999 }} onClick={() => setOpen(false)} />
          <div style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '8px',
            width: '260px',
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            borderRadius: '16px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
            zIndex: 1000,
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '14px 16px',
              borderBottom: '1px solid var(--color-border)',
              fontSize: '13px',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
            }}>
              Внешний вид
            </div>
            {THEMES.map(t => (
              <button
                key={t.id}
                onClick={() => { setTheme(t.id as any); setOpen(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  padding: '12px 16px',
                  border: 'none',
                  background: theme === t.id ? 'var(--color-bg-hover)' : 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => { if (theme !== t.id) e.currentTarget.style.background = 'var(--color-bg-hover)'; }}
                onMouseLeave={e => { if (theme !== t.id) e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background: t.bg,
                  border: `2px solid ${t.accent}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: t.accent,
                  }} />
                </div>
                <span style={{
                  flex: 1,
                  fontSize: '14px',
                  fontWeight: theme === t.id ? 600 : 400,
                  color: 'var(--color-text-primary)',
                }}>
                  {t.name}
                </span>
                {theme === t.id && (
                  <Check size={16} style={{ color: 'var(--color-gold)' }} />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
