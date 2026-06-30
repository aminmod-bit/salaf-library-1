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
        style={{ filter: 'drop-shadow(0 4px 12px rgba(212,175,55,0.25))' }}
      >
        <defs>
          <linearGradient id="lg-gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f0c84a"/>
            <stop offset="50%" stopColor="#d4af37"/>
            <stop offset="100%" stopColor="#b8960e"/>
          </linearGradient>
          <linearGradient id="lg-dark" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1a3a24"/>
            <stop offset="100%" stopColor="#0d2218"/>
          </linearGradient>
        </defs>

        {/* Arch / Mihrab */}
        <path d="M20 92 Q20 22 64 14 Q108 22 108 92 L108 116 Q108 120 104 120 L24 120 Q20 120 20 116 Z"
              fill="url(#lg-dark)" stroke="url(#lg-gold)" strokeWidth="2.5"/>

        {/* Inner arch */}
        <path d="M30 90 Q30 32 64 24 Q98 32 98 90"
              fill="none" stroke="url(#lg-gold)" strokeWidth="1.2" opacity="0.4"/>

        {/* Open book */}
        <g transform="translate(64, 72)">
          <path d="M0 0 Q-22-6-32 6 L-32 30 Q-22 18 0 12 Z" fill="#f8f5ec" opacity="0.95"/>
          <path d="M0 0 Q22-6 32 6 L32 30 Q22 18 0 12 Z" fill="#ede8da" opacity="0.9"/>
          <line x1="0" y1="-2" x2="0" y2="32" stroke="url(#lg-gold)" strokeWidth="1.8"/>
          <line x1="-28" y1="10" x2="-6" y2="4" stroke="#ccc5b0" strokeWidth="0.8" opacity="0.6"/>
          <line x1="-28" y1="16" x2="-6" y2="10" stroke="#ccc5b0" strokeWidth="0.8" opacity="0.6"/>
          <line x1="-28" y1="22" x2="-6" y2="16" stroke="#ccc5b0" strokeWidth="0.8" opacity="0.6"/>
          <line x1="6" y1="4" x2="28" y2="10" stroke="#ccc5b0" strokeWidth="0.8" opacity="0.5"/>
          <line x1="6" y1="10" x2="28" y2="16" stroke="#ccc5b0" strokeWidth="0.8" opacity="0.5"/>
          <line x1="6" y1="16" x2="28" y2="22" stroke="#ccc5b0" strokeWidth="0.8" opacity="0.5"/>
        </g>

        {/* Diamond ornament */}
        <path d="M64 18 l5 7-5 7-5-7z" fill="url(#lg-gold)" opacity="0.85"/>

        {/* Bottom line */}
        <line x1="34" y1="110" x2="94" y2="110" stroke="url(#lg-gold)" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>

        {/* Corner dots */}
        <circle cx="34" cy="110" r="1.5" fill="url(#lg-gold)" opacity="0.6"/>
        <circle cx="94" cy="110" r="1.5" fill="url(#lg-gold)" opacity="0.6"/>
      </svg>

      {showText && (
        <div>
          <div style={{
            fontSize: `${Math.max(14, size * 0.47)}px`,
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
