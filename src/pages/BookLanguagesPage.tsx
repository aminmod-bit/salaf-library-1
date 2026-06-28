import { useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, BookOpen, FileText, Folder, Languages, Sparkles } from 'lucide-react';
import FolderCard from '../components/FolderCard';
import { useStore } from '../store/useStore';

const LANGS = [
  { key: 'ru', label: 'Русский', native: 'Русский', bookValue: 'Русский', color: '#22c55e' },
  { key: 'ar', label: 'Arabic', native: 'العربية', bookValue: 'Арабский', color: '#d4af37' },
  { key: 'tg', label: 'Tajik', native: 'Тоҷикӣ', bookValue: 'Таджикский', color: '#60a5fa' },
  { key: 'uz', label: 'Uzbek', native: 'O‘zbek', bookValue: 'Узбекский', color: '#a78bfa' },
  { key: 'fa', label: 'Persian', native: 'فارسی', bookValue: 'Персидский', color: '#f472b6' },
  { key: 'en', label: 'English', native: 'English', bookValue: 'Английский', color: '#fb923c' },
];

const BOOK_FOLDERS = [
  'Акыда',
  'Таухид',
  'Манхадж',
  'Хадисы',
  'Сира',
  'Фикх',
  'Тафсир',
  'Азкары',
  'Дуа',
  'Арабский язык',
  'Воспитание',
  'История',
  'Биографии',
  'Детские книги',
  'Даава',
  'Другие разделы',
];

function normalizeSection(category: string) {
  if (/дуа|зикр/i.test(category)) return 'Дуа';
  if (/хадис/i.test(category)) return 'Хадисы';
  if (/сира/i.test(category)) return 'Сира';
  if (/араб/i.test(category)) return 'Арабский язык';
  if (/акыд/i.test(category)) return 'Акыда';
  if (/таухид/i.test(category)) return 'Таухид';
  if (/манхадж/i.test(category)) return 'Манхадж';
  if (/фикх/i.test(category)) return 'Фикх';
  if (/тафсир/i.test(category)) return 'Тафсир';
  if (/истор/i.test(category)) return 'История';
  if (/биограф/i.test(category)) return 'Биографии';
  if (/воспит/i.test(category)) return 'Воспитание';
  if (/даава|дауа/i.test(category)) return 'Даава';
  return category || 'Другие разделы';
}

export default function BookLanguagesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { books, fawaid } = useStore();
  const [selectedLang, setSelectedLang] = useState<string | null>(null);

  const stats = useMemo(() => LANGS.map(lang => {
    const languageBooks = books.filter(book => book.language === lang.bookValue);
    const bookCount = languageBooks.length;
    const articleCount = lang.bookValue === 'Русский' ? fawaid.length : 0;
    const folderStats = BOOK_FOLDERS.map(folder => ({
      name: folder,
      count: languageBooks.filter(book => normalizeSection(book.category) === folder).length,
    }));
    return { ...lang, bookCount, articleCount, folderStats };
  }), [books, fawaid]);

  const selected = selectedLang ? stats.find(lang => lang.key === selectedLang) : null;

  return (
    <div className="fade-in" style={{ maxWidth: 1200, margin: '0 auto' }}>
      <section className="glass-card" style={{ padding: 32, marginBottom: 22, background: 'linear-gradient(135deg, rgba(13,42,24,.96), rgba(7,19,11,.94))' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#d4af37', fontSize: 12, fontWeight: 900, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 12 }}>
          <Languages size={16} /> {t('bookLanguages.eyebrow', 'Мультиязычная библиотека')}
        </div>
        <h1 style={{ color: '#f0f4f1', fontSize: 'clamp(30px, 5vw, 52px)', fontWeight: 950, lineHeight: 1.06, marginBottom: 12 }}>
          {selected ? `${selected.native} — папки книг` : t('bookLanguages.title', 'Книги на разных языках')}
        </h1>
        <p style={{ color: '#9db8a3', lineHeight: 1.75, maxWidth: 820 }}>
          {selected
            ? 'Внутри каждого языка книги разделены по тематическим папкам. Если папка пустая, она остаётся подготовленной для будущего наполнения.'
            : t('bookLanguages.description', 'Здесь будут собраны книги, статьи, фаваиды и материалы по каждому языку. Мы не показываем искусственные переводы: если материала на языке нет, раздел честно отмечен как ожидающий наполнения.')}
        </p>
      </section>

      {selected ? (
        <>
          <div style={{ marginBottom: 18 }}>
            <button className="btn-ghost" onClick={() => setSelectedLang(null)}>
              <ArrowLeft size={16} /> Все языки
            </button>
          </div>

          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 16 }}>
            {selected.folderStats.map(folder => (
              <FolderCard
                key={folder.name}
                title={folder.name}
                subtitle={`Папка языка: ${selected.native}`}
                count={folder.count}
                countLabel="книг"
                color={selected.color}
                disabled={folder.count === 0}
                onClick={() => navigate(`/books?language=${encodeURIComponent(selected.bookValue)}&category=${encodeURIComponent(folder.name)}`)}
              />
            ))}
          </section>
        </>
      ) : (
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

                  <button className={hasContent ? 'btn-primary' : 'btn-ghost'} style={{ width: '100%', justifyContent: 'center' }} onClick={() => setSelectedLang(lang.key)}>
                    <Folder size={15} /> {hasContent ? 'Открыть папки' : t('bookLanguages.comingSoon', 'Материалы будут добавлены')}
                  </button>
                </div>
              </div>
            );
          })}
        </section>
      )}
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
