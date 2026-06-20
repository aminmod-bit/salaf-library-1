import { useMemo, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BookOpen, FileText, Languages, Sparkles } from 'lucide-react';
import { useStore } from '../store/useStore';

const LANGS = [
  { key: 'ru', label: 'Русский', native: 'Русский', bookValue: 'Русский', color: '#22c55e' },
  { key: 'ar', label: 'Arabic', native: 'العربية', bookValue: 'Арабский', color: '#d4af37' },
  { key: 'tg', label: 'Tajik', native: 'Тоҷикӣ', bookValue: 'Таджикский', color: '#60a5fa' },
  { key: 'uz', label: 'Uzbek', native: 'O‘zbek', bookValue: 'Узбекский', color: '#a78bfa' },
  { key: 'fa', label: 'Persian', native: 'فارسی', bookValue: 'Персидский', color: '#f472b6' },
  { key: 'en', label: 'English', native: 'English', bookValue: 'Английский', color: '#fb923c' },
];

export default function BookLanguagesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { books, fawaid } = useStore();

  const stats = useMemo(() => LANGS.map(lang => {
    const bookCount = books.filter(book => book.language === lang.bookValue).length;
    // Пока фаваиды/статьи не имеют полноценного language-поля; существующий контент считается русским.
    const articleCount = lang.bookValue === 'Русский' ? fawaid.length : 0;
    return { ...lang, bookCount, articleCount };
  }), [books, fawaid]);

  return (
    <div className="fade-in" style={{ maxWidth: 1200, margin: '0 auto' }}>
      <section className="glass-card" style={{ padding: 32, marginBottom: 22, background: 'linear-gradient(135deg, rgba(13,42,24,.96), rgba(7,19,11,.94))' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#d4af37', fontSize: 12, fontWeight: 900, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 12 }}>
          <Languages size={16} /> {t('bookLanguages.eyebrow', 'Мультиязычная библиотека')}
        </div>
        <h1 style={{ color: '#f0f4f1', fontSize: 'clamp(30px, 5vw, 52px)', fontWeight: 950, lineHeight: 1.06, marginBottom: 12 }}>
          {t('bookLanguages.title', 'Книги и материалы по языкам')}
        </h1>
        <p style={{ color: '#9db8a3', lineHeight: 1.75, maxWidth: 820 }}>
          {t('bookLanguages.description', 'Здесь будут собраны книги, статьи, фаваиды и материалы по каждому языку. Мы не показываем искусственные переводы: если материала на языке нет, раздел честно отмечен как ожидающий наполнения.')}
        </p>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
        {stats.map(lang => {
          const hasContent = lang.bookCount > 0 || lang.articleCount > 0;
          return (
            <div key={lang.key} className="glass-card" style={{ padding: 22, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 80% 10%, ${lang.color}22, transparent 38%)`, pointerEvents: 'none' }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
                  <div>
                    <h2 style={{ color: '#f0f4f1', fontSize: 22, fontWeight: 900 }}>{lang.native}</h2>
                    <p style={{ color: '#5a7a63', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em' }}>{lang.label}</p>
                  </div>
                  <div style={{ width: 44, height: 44, borderRadius: 15, background: `${lang.color}22`, color: lang.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Languages size={21} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                  <Stat icon={<BookOpen size={15}/>} label={t('bookLanguages.books', 'Книги')} value={lang.bookCount} color={lang.color} />
                  <Stat icon={<FileText size={15}/>} label={t('bookLanguages.articles', 'Статьи')} value={lang.articleCount} color={lang.color} />
                </div>

                {hasContent ? (
                  <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => navigate(`/books?language=${encodeURIComponent(lang.bookValue)}`)}>
                    <BookOpen size={15} /> {t('bookLanguages.openBooks', 'Открыть книги')}
                  </button>
                ) : (
                  <div style={{ padding: '12px 14px', border: '1px dashed rgba(212,175,55,.22)', borderRadius: 12, color: '#9db8a3', fontSize: 13, textAlign: 'center' }}>
                    <Sparkles size={14} style={{ display: 'inline', marginRight: 6, color: '#d4af37' }} />
                    {t('bookLanguages.comingSoon', 'Материалы будут добавлены')}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}

function Stat({ icon, label, value, color }: { icon: ReactNode; label: string; value: number; color: string }) {
  return (
    <div style={{ padding: 12, borderRadius: 12, border: '1px solid rgba(212,175,55,.14)', background: 'rgba(255,255,255,.035)' }}>
      <div style={{ color, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>{icon}<b>{value}</b></div>
      <div style={{ color: '#5a7a63', fontSize: 11, fontWeight: 800 }}>{label}</div>
    </div>
  );
}
