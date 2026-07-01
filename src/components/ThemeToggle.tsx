import { useEffect, useState } from 'react';
import { Palette, Check } from 'lucide-react';
import { useStore } from '../store/useStore';

export interface ThemeOption {
  id: string;
  name: string;
  description: string;
  bg: string;
  accent: string;
  preview: string[];
}

export const THEMES: ThemeOption[] = [
  {
    id: 'medina-night',
    name: 'Ночь Медины',
    description: 'Тёмно-зелёная классика',
    bg: '#0a1a0f',
    accent: '#22c55e',
    preview: ['#0a1a0f', '#112a1a', '#d4af37'],
  },
  {
    id: 'olive-sand',
    name: 'Олива и песок',
    description: 'Тёплые оливковые тона',
    bg: '#1a1f14',
    accent: '#a3c55e',
    preview: ['#1a1f14', '#2a3322', '#a3c55e'],
  },
  {
    id: 'sky-marble',
    name: 'Небо и мрамор',
    description: 'Фиолетовый холодный',
    bg: '#12101e',
    accent: '#a78bfa',
    preview: ['#12101e', '#221e3a', '#a78bfa'],
  },
  {
    id: 'qibla-gold',
    name: 'Золото киблы',
    description: 'Тёмно-золотой',
    bg: '#1a1508',
    accent: '#d4af37',
    preview: ['#1a1508', '#2e2814', '#d4af37'],
  },
  {
    id: 'tender-rose',
    name: 'Нежная роза',
    description: 'Розовый тёмный',
    bg: '#1e0f18',
    accent: '#f472b6',
    preview: ['#1e0f18', '#381c2c', '#f472b6'],
  },
  {
    id: 'lilac-pearl',
    name: 'Лиловый жемчуг',
    description: 'Лиловый тёмный',
    bg: '#16101e',
    accent: '#b89cef',
    preview: ['#16101e', '#281e3e', '#b89cef'],
  },
  {
    id: 'ivory',
    name: 'Слоновая кость',
    description: 'Светлый тёплый',
    bg: '#f5f0e8',
    accent: '#8b7355',
    preview: ['#f5f0e8', '#ffffff', '#8b7355'],
  },
  {
    id: 'cream-mint',
    name: 'Кремовая мята',
    description: 'Светлый мятный',
    bg: '#f0f5f0',
    accent: '#3ba562',
    preview: ['#f0f5f0', '#ffffff', '#3ba562'],
  },
  {
    id: 'editorial',
    name: 'Editorial',
    description: 'Чистый минимализм',
    bg: '#ffffff',
    accent: '#181818',
    preview: ['#ffffff', '#181818', '#6d6d6d'],
  },
];

function applyTheme(themeId: string) {
  // Disable transitions for instant switch
  document.documentElement.classList.add('no-transition');
  document.documentElement.setAttribute('data-theme', themeId);
  // Re-enable transitions after a frame
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.documentElement.classList.remove('no-transition');
    });
  });
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
            width: '300px',
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
                  padding: '10px 16px',
                  border: 'none',
                  background: theme === t.id ? 'var(--color-bg-hover)' : 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => { if (theme !== t.id) e.currentTarget.style.background = 'var(--color-bg-hover)'; }}
                onMouseLeave={e => { if (theme !== t.id) e.currentTarget.style.background = 'transparent'; }}
              >
                {/* Color preview */}
                <div style={{
                  display: 'flex',
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  border: `2px solid ${theme === t.id ? 'var(--color-gold)' : 'var(--color-border)'}`,
                  flexShrink: 0,
                }}>
                  {t.preview.map((color, i) => (
                    <div key={i} style={{ flex: 1, background: color }} />
                  ))}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: theme === t.id ? 600 : 400, color: 'var(--color-text-primary)' }}>
                    {t.name}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                    {t.description}
                  </div>
                </div>
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
