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

export default function FolderCard({ title, subtitle, count, countLabel = 'материалов', color, disabled = false, onClick, meta }: Props) {
  return (
    <button
      className="folder-card glow-hover"
      onClick={() => !disabled && onClick?.()}
      disabled={disabled}
      style={{
        width: '100%',
        textAlign: 'left',
        position: 'relative',
        overflow: 'hidden',
        padding: 22,
        borderRadius: 18,
        border: disabled ? '1px solid var(--color-border)' : '1px solid var(--color-border)',
        background: 'var(--color-bg-card)',
        color: 'var(--color-text-primary)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.52 : 1,
        transition: 'transform .25s ease, border-color .25s ease, box-shadow .25s ease',
      }}
      onMouseEnter={event => {
        if (disabled) return;
        event.currentTarget.style.transform = 'translateY(-3px)';
        event.currentTarget.style.borderColor = 'var(--color-border-hover)';
      }}
      onMouseLeave={event => {
        event.currentTarget.style.transform = 'translateY(0)';
        event.currentTarget.style.borderColor = 'var(--color-border)';
      }}
    >
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', gap: 14, alignItems: 'flex-start' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ width: 48, height: 48, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-hover)', color: 'var(--color-gold)', marginBottom: 14 }}>
            <Folder size={24} strokeWidth={1.8} />
          </div>
          <h3 style={{ color: 'var(--color-text-primary)', fontSize: 18, lineHeight: 1.22, fontWeight: 850, marginBottom: 7 }}>{title}</h3>
          {subtitle && <p style={{ color: 'var(--color-text-secondary)', fontSize: 13, lineHeight: 1.55, marginBottom: 10 }}>{subtitle}</p>}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ display: 'inline-flex', border: '1px solid var(--color-border)', borderRadius: 999, padding: '3px 10px', color: count && count > 0 ? 'var(--color-gold)' : 'var(--color-text-muted)', fontSize: 12, fontWeight: 800 }}>
              {typeof count === 'number' ? (count > 0 ? `${count} ${countLabel}` : 'Будет добавлено') : countLabel}
            </span>
            {meta && <span style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>{meta}</span>}
          </div>
        </div>
        {!disabled && <ChevronRight size={18} style={{ color: 'var(--color-gold)', marginTop: 4, flexShrink: 0 }} />}
      </div>
    </button>
  );
}
