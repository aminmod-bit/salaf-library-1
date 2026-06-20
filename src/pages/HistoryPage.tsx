import { useNavigate } from 'react-router-dom';
import { Trash2, BookOpen, Headphones, Users, Sparkles } from 'lucide-react';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';

const TYPE_ICONS: Record<string, string> = {
  book: '📖',
  audio: '🎧',
  bio: '👤',
  faidah: '💎',
};

const TYPE_LABELS: Record<string, string> = {
  book: 'Книга',
  audio: 'Аудио',
  bio: 'Биография',
  faidah: 'Фаида',
};

const TYPE_PATHS: Record<string, string> = {
  book: 'books',
  audio: 'audio',
  bio: 'biographies',
  faidah: 'fawaid',
};

export default function HistoryPage() {
  const navigate = useNavigate();
  const { history, clearHistory } = useStore();

  const handleClear = () => {
    clearHistory();
    toast('История очищена', { icon: '🗑️' });
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (hours < 1) return 'Только что';
    if (hours < 24) return `${hours} ч. назад`;
    if (days < 7) return `${days} д. назад`;
    return d.toLocaleDateString('ru-RU');
  };

  return (
    <div className="fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#f0f4f1', marginBottom: '6px' }}>
            🕐 История
          </h1>
          <p style={{ color: '#9db8a3', fontSize: '14px' }}>
            {history.length} недавно просмотренных материалов
          </p>
        </div>
        {history.length > 0 && (
          <button
            className="btn-ghost"
            onClick={handleClear}
            style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }}
          >
            <Trash2 size={14} /> Очистить
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '80px',
          background: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
          borderRadius: '20px',
        }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🕐</div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#9db8a3', marginBottom: '8px' }}>
            История пуста
          </div>
          <p style={{ fontSize: '14px', color: '#5a7a63', marginBottom: '24px' }}>
            Начните читать книги и слушать уроки
          </p>
          <button className="btn-primary" onClick={() => navigate('/')}>
            <BookOpen size={16} /> На главную
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {history.map((item, idx) => (
            <div
              key={item.id + item.visitedAt + idx}
              onClick={() => navigate(`/${TYPE_PATHS[item.type] || item.type}/${item.id}`)}
              style={{
                display: 'flex', gap: '14px', padding: '14px 16px',
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
                borderRadius: '12px', cursor: 'pointer',
                transition: 'all 0.3s ease', alignItems: 'center',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(212,175,55,0.4)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
            >
              {/* Icon */}
              <div style={{
                width: '48px', height: '48px', borderRadius: '12px',
                background: item.coverColor || '#1a3a2a',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '20px', flexShrink: 0,
              }}>
                {item.coverEmoji || TYPE_ICONS[item.type] || '📄'}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#f0f4f1', marginBottom: '2px' }}>
                  {item.title}
                </div>
                <div style={{ fontSize: '12px', color: '#9db8a3' }}>
                  {item.subtitle}
                </div>
              </div>

              {/* Meta */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                <span className="badge badge-gold" style={{ fontSize: '10px' }}>
                  {TYPE_LABELS[item.type] || item.type}
                </span>
                <span style={{ fontSize: '11px', color: '#5a7a63' }}>
                  {formatDate(item.visitedAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
