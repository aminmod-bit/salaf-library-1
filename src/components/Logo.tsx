interface LogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

export default function Logo({ size = 38, showText = false, className }: LogoProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }} className={className}>
      <svg
        viewBox="0 0 128 128"
        width={size}
        height={size}
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: 'drop-shadow(0 4px 12px rgba(212,175,55,0.3))' }}
      >
        <defs>
          <linearGradient id="lg-gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f5d76e"/>
            <stop offset="100%" stopColor="#c9a227"/>
          </linearGradient>
        </defs>
        {/* Rounded square */}
        <rect x="16" y="16" width="96" height="96" rx="24" fill="url(#lg-gold)"/>
        {/* Book icon */}
        <g transform="translate(64, 64)">
          <path d="M-4-20 Q-20-20-26-8 L-26 22 Q-20 10-4 4 Z" fill="#1a3a24" opacity="0.9"/>
          <path d="M4-20 Q20-20 26-8 L26 22 Q20 10 4 4 Z" fill="#1a3a24" opacity="0.75"/>
          <line x1="0" y1="-22" x2="0" y2="24" stroke="#1a3a24" strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="-22" y1="0" x2="-8" y2="-6" stroke="#f5d76e" strokeWidth="1.2" opacity="0.5"/>
          <line x1="-22" y1="6" x2="-8" y2="0" stroke="#f5d76e" strokeWidth="1.2" opacity="0.5"/>
          <line x1="-22" y1="12" x2="-8" y2="6" stroke="#f5d76e" strokeWidth="1.2" opacity="0.5"/>
          <line x1="8" y1="-6" x2="22" y2="0" stroke="#f5d76e" strokeWidth="1.2" opacity="0.4"/>
          <line x1="8" y1="0" x2="22" y2="6" stroke="#f5d76e" strokeWidth="1.2" opacity="0.4"/>
          <line x1="8" y1="6" x2="22" y2="12" stroke="#f5d76e" strokeWidth="1.2" opacity="0.4"/>
        </g>
      </svg>

      {showText && (
        <div>
          <div style={{
            fontSize: `${Math.max(14, size * 0.47)}px`,
            fontWeight: 800,
            background: 'linear-gradient(135deg, var(--color-gold), var(--color-gold-light))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            lineHeight: 1.1,
          }}>
            Salaf Library
          </div>
          <div style={{
            fontSize: `${Math.max(8, size * 0.26)}px`,
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
