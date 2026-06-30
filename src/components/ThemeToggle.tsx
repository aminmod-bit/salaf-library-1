import { useCallback, useEffect } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { ThemeMode } from '../store/useStore';

const themeIcons: Record<ThemeMode, React.ReactNode> = {
  dark: <Moon size={18} />,
  light: <Sun size={18} />,
  system: <Monitor size={18} />,
};

const themeLabels: Record<ThemeMode, string> = {
  dark: 'Тёмная',
  light: 'Светлая',
  system: 'Системная',
};

export default function ThemeToggle() {
  const { theme, setTheme } = useStore();

  const applyTheme = useCallback((mode: ThemeMode) => {
    let resolved: 'dark' | 'light' = 'dark';
    if (mode === 'system') {
      resolved = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    } else {
      resolved = mode;
    }
    document.documentElement.setAttribute('data-theme', resolved);
    document.documentElement.style.colorScheme = resolved;
  }, []);

  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  useEffect(() => {
    if (theme !== 'system') return;
    const listener = (e: MediaQueryListEvent) => {
      applyTheme('system');
    };
    const mq = window.matchMedia('(prefers-color-scheme: light)');
    mq.addEventListener('change', listener);
    return () => mq.removeEventListener('change', listener);
  }, [theme, applyTheme]);

  const cycleTheme = () => {
    const order: ThemeMode[] = ['dark', 'light', 'system'];
    const next = order[(order.indexOf(theme) + 1) % order.length];
    setTheme(next);
  };

  return (
    <button
      onClick={cycleTheme}
      title={`Тема: ${themeLabels[theme]}`}
      style={{
        background: 'var(--color-bg-hover)',
        border: '1px solid var(--color-border)',
        borderRadius: '10px',
        padding: '8px',
        color: 'var(--color-text-secondary)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border-hover)';
        (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text-primary)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border)';
        (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text-secondary)';
      }}
    >
      {themeIcons[theme]}
    </button>
  );
}
