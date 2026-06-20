import type { Book } from '../store/useStore';

interface Props {
  book: Pick<Book, 'title' | 'author' | 'category' | 'coverColor' | 'coverEmoji' | 'coverImage'>;
  height?: string | number;
  width?: string | number;
  radius?: string | number;
  fontSize?: number;
  compact?: boolean;
}

function darken(hex = '#1a3a2a', amount = 28) {
  try {
    const n = parseInt(hex.replace('#', ''), 16);
    const r = Math.max(0, (n >> 16) - amount);
    const g = Math.max(0, ((n >> 8) & 0xff) - amount);
    const b = Math.max(0, (n & 0xff) - amount);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  } catch {
    return '#0a1a0f';
  }
}

export default function GeneratedCover({ book, height = '100%', width = '100%', radius = 0, fontSize = 14, compact = false }: Props) {
  if (book.coverImage) {
    return (
      <img
        src={book.coverImage}
        alt={`Обложка книги ${book.title}`}
        loading="lazy"
        style={{ width, height, borderRadius: radius, objectFit: 'cover', display: 'block' }}
      />
    );
  }

  const base = book.coverColor || '#1a3a2a';
  const dark = darken(base, 38);

  return (
    <div
      aria-label={`Обложка книги ${book.title}`}
      style={{
        width,
        height,
        borderRadius: radius,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: compact ? '10px 8px' : '18px 14px',
        background: `linear-gradient(155deg, ${base} 0%, ${dark} 100%)`,
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12)',
      }}
    >
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 25% 15%, rgba(212,175,55,.24), transparent 34%), radial-gradient(circle at 80% 85%, rgba(255,255,255,.08), transparent 35%)' }} />
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: compact ? 5 : 8, background: 'linear-gradient(180deg, rgba(212,175,55,.85), rgba(146,117,28,.55))' }} />
      <div style={{ position: 'relative', zIndex: 1, color: '#d4af37', fontSize: compact ? 9 : 10, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', marginLeft: compact ? 4 : 8 }}>
        {book.category || 'Salaf Library'}
      </div>
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: compact ? '4px 2px' : '8px 4px' }}>
        <div style={{ fontSize: compact ? 22 : 32, marginBottom: compact ? 4 : 8 }}>{book.coverEmoji || '📖'}</div>
        <div
          style={{
            color: '#fff8dc',
            fontWeight: 800,
            fontSize,
            lineHeight: 1.18,
            textShadow: '0 2px 10px rgba(0,0,0,.45)',
            display: '-webkit-box',
            WebkitLineClamp: compact ? 3 : 4,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {book.title}
        </div>
      </div>
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          color: 'rgba(244,228,177,.86)',
          fontSize: compact ? 9 : 11,
          lineHeight: 1.25,
          textAlign: 'center',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {book.author || 'Автор не указан'}
      </div>
    </div>
  );
}
