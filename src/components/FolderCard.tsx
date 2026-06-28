import { ChevronRight, Folder } from 'lucide-react';

interface Props {
  title: string;
  subtitle?: string;
  count?: number;
  countLabel?: string;
  color?: string;
  disabled?: boolean;
  onClick?: () => void;
  meta?: string;
}

export default function FolderCard({ title, subtitle, count, countLabel = 'материалов', color = '#d4af37', disabled = false, onClick, meta }: Props) {
  return (
    <button
      className="folder-card"
      onClick={() => !disabled && onClick?.()}
      disabled={disabled}
      style={{
        width: '100%',
        textAlign: 'left',
        position: 'relative',
        overflow: 'hidden',
        padding: 22,
        borderRadius: 18,
        border: disabled ? '1px solid rgba(255,255,255,.07)' : '1px solid rgba(212,175,55,.16)',
        background: 'linear-gradient(180deg, rgba(17,42,26,.92), rgba(7,19,11,.88))',
        color: '#f0f4f1',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.52 : 1,
        transition: 'transform .25s ease, border-color .25s ease, box-shadow .25s ease',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,.04)',
      }}
      onMouseEnter={event => {
        if (disabled) return;
        event.currentTarget.style.transform = 'translateY(-3px)';
        event.currentTarget.style.borderColor = 'rgba(212,175,55,.45)';
        event.currentTarget.style.boxShadow = '0 18px 50px rgba(0,0,0,.28), 0 0 24px rgba(212,175,55,.08)';
      }}
      onMouseLeave={event => {
        event.currentTarget.style.transform = 'translateY(0)';
        event.currentTarget.style.borderColor = disabled ? 'rgba(255,255,255,.07)' : 'rgba(212,175,55,.16)';
        event.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,.04)';
      }}
    >
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 82% 8%, ${color}24, transparent 34%)`, pointerEvents: 'none' }} />
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', gap: 14, alignItems: 'flex-start' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ width: 48, height: 48, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${color}18`, color, marginBottom: 14 }}>
            <Folder size={24} strokeWidth={1.8} />
          </div>
          <h3 style={{ color: '#f0f4f1', fontSize: 18, lineHeight: 1.22, fontWeight: 850, marginBottom: 7 }}>{title}</h3>
          {subtitle && <p style={{ color: '#9db8a3', fontSize: 13, lineHeight: 1.55, marginBottom: 10 }}>{subtitle}</p>}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ display: 'inline-flex', border: '1px solid rgba(212,175,55,.18)', borderRadius: 999, padding: '3px 10px', color: count ? '#d4af37' : '#5a7a63', fontSize: 12, fontWeight: 800 }}>
              {typeof count === 'number' ? (count > 0 ? `${count} ${countLabel}` : 'Будет добавлено') : countLabel}
            </span>
            {meta && <span style={{ color: '#5a7a63', fontSize: 12 }}>{meta}</span>}
          </div>
        </div>
        {!disabled && <ChevronRight size={18} color="#d4af37" style={{ marginTop: 4, flexShrink: 0 }} />}
      </div>
    </button>
  );
}
