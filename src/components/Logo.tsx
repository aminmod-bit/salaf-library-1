interface LogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

export default function Logo({ size = 38, showText = false, className }: LogoProps) {
  const s = size;
  const iconSize = s * 0.65;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }} className={className}>
      <svg
        viewBox="0 0 128 128"
        width={s}
        height={s}
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: 'drop-shadow(0 4px 12px rgba(212,175,55,0.3))' }}
      >
        <defs>
          <linearGradient id="logo-gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f0c84a" />
            <stop offset="100%" stopColor="#d4af37" />
          </linearGradient>
          <linearGradient id="logo-dark" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1a3a24" />
            <stop offset="100%" stopColor="#0d2218" />
          </linearGradient>
        </defs>
        {/* Book shape */}
        <rect x="22" y="18" width="84" height="92" rx="8" fill="url(#logo-dark)" stroke="url(#logo-gold)" strokeWidth="3" />
        {/* Spine line */}
        <line x1="64" y1="24" x2="64" y2="104" stroke="url(#logo-gold)" strokeWidth="2" opacity="0.5" />
        {/* Left pages */}
        <path d="M28 30 h32 v76 h-32 a4 4 0 0 1-4-4 v-68 a4 4 0 0 1 4-4z" fill="none" stroke="url(#logo-gold)" strokeWidth="1.5" opacity="0.3" />
        {/* Right pages */}
        <path d="M68 30 h32 v68 a4 4 0 0 1-4 4 h-32 v-76 a4 4 0 0 1 4-4z" fill="none" stroke="url(#logo-gold)" strokeWidth="1.5" opacity="0.3" />
        {/* Decorative diamond */}
        <path d="M64 50 l8 10 -8 10 -8-10z" fill="url(#logo-gold)" opacity="0.9" />
        {/* Bottom line */}
        <line x1="36" y1="100" x2="92" y2="100" stroke="url(#logo-gold)" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
        {/* Top accent */}
        <path d="M44 22 h40" stroke="url(#logo-gold)" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      </svg>
      {showText && (
        <div>
          <div style={{
            fontSize: `${Math.max(14, s * 0.47)}px`,
            fontWeight: 800,
            background: 'linear-gradient(135deg, #d4af37, #f0c84a)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            lineHeight: 1.1,
          }}>
            Salaf Library
          </div>
          <div style={{
            fontSize: `${Math.max(8, s * 0.26)}px`,
            color: 'var(--color-text-muted)',
            letterSpacing: '1px',
            textTransform: 'uppercase',
          }}>
            Исламская библиотека
          </div>
        </div>
      )}
    </div>
  );
}
