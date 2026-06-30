import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpenText, Calendar, Search, Tag } from 'lucide-react';
import FolderCard from '../components/FolderCard';

interface Article {
  id: string;
  language: string;
  title: string;
  category: string;
  author: string;
  date: string;
  summary: string;
  content: string;
  tags: string[];
  featured?: boolean;
}

const langMap: Record<string, string> = { ru: 'Русский', en: 'Английский', ar: 'Арабский', tg: 'Таджикский', uz: 'Узбекский', fa: 'Персидский' };
const ARTICLE_FOLDERS = ['Акыда', 'Манхадж', 'Фикх', 'Тафсир', 'Хадис', 'Воспитание', 'Семья', 'Даава', 'История', 'Ответы на вопросы', 'Полезные статьи', 'О нас', 'Помощь'];

export default function ArticlesPage() {
  const { i18n, t } = useTranslation();
  const activeLanguage = langMap[(i18n.resolvedLanguage || i18n.language || 'ru').split('-')[0]] || 'Русский';
  const [articles, setArticles] = useState<Article[]>([]);
  const [query, setQuery] = useState('');
  const [folder, setFolder] = useState('');

  useEffect(() => {
    fetch('./data/articles.json').then(r => r.json()).then(setArticles).catch(() => setArticles([]));
  }, []);

  const current = useMemo(() => articles.filter(a => a.language === activeLanguage), [articles, activeLanguage]);
  const folderStats = useMemo(() => ARTICLE_FOLDERS.map(name => ({ name, count: current.filter(a => a.category === name).length })), [current]);
  const filtered = useMemo(() => {
    let result = folder ? current.filter(a => a.category === folder) : [];
    const q = query.trim().toLowerCase();
    if (q) result = current.filter(a => `${a.title} ${a.summary} ${a.content} ${a.author} ${a.tags.join(' ')}`.toLowerCase().includes(q));
    return result.sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || b.date.localeCompare(a.date));
  }, [current, query, folder]);

  const showFolders = !folder && !query.trim();

  return (
    <div className="fade-in" style={{ maxWidth: 1180, margin: '0 auto' }}>
      <section className="glass-card" style={{ padding: 30, marginBottom: 20, background: 'linear-gradient(135deg, var(--color-bg-secondary), var(--color-bg-card))' }}>
        <div style={{ color: 'var(--color-gold)', fontSize: 12, fontWeight: 900, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 10, display: 'flex', gap: 8, alignItems: 'center' }}><BookOpenText size={16}/> {t('articles.eyebrow', 'Материалы')}</div>
        <h1 style={{ color: 'var(--color-text-primary)', fontSize: 'clamp(30px, 5vw, 50px)', lineHeight: 1.06, fontWeight: 950 }}>{showFolders ? 'Разделы статей' : folder || t('articles.title', 'Статьи и материалы')}</h1>
        <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.75, maxWidth: 760, marginTop: 12 }}>
          {showFolders ? 'Выберите тематическую папку. Материалы показываются только на активном языке.' : t('articles.description', 'Раздел для статей, ответов, пояснений и полезных материалов по выбранному языку.')}
        </p>
      </section>

      <div className="glass-card" style={{ padding: 16, display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
        <div style={{ flex: 1, minWidth: 220, display: 'flex', gap: 8, alignItems: 'center', background: 'var(--color-bg-hover)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '9px 12px' }}>
          <Search size={15} color="#5a7a63" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder={t('articles.search', 'Поиск статей...')} style={{ flex: 1, background: 'transparent', border: 0, outline: 0, color: 'var(--color-text-primary)' }} />
        </div>
        {!showFolders && <button className="btn-ghost" onClick={() => { setFolder(''); setQuery(''); }}>Все папки</button>}
      </div>

      {showFolders ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
          {folderStats.map(item => (
            <FolderCard
              key={item.name}
              title={item.name}
              subtitle="Тематический раздел статей"
              count={item.count}
              countLabel="материалов"
              disabled={item.count === 0}
              onClick={() => setFolder(item.name)}
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card" style={{ padding: 46, textAlign: 'center', color: 'var(--color-text-secondary)' }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>📄</div>
          <h2 style={{ color: 'var(--color-text-primary)', fontWeight: 850, marginBottom: 8 }}>{t('articles.emptyTitle', 'Материалы пока не добавлены')}</h2>
          <p>{t('articles.emptyText', 'Когда появятся материалы на выбранном языке, они будут отображаться здесь.')}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {filtered.map(article => (
            <article key={article.id} className="glass-card" style={{ padding: 22 }}>
              {article.featured && <span className="badge badge-gold" style={{ marginBottom: 12 }}>Избранное</span>}
              <h2 style={{ color: 'var(--color-text-primary)', fontSize: 19, fontWeight: 900, lineHeight: 1.25, marginBottom: 10 }}>{article.title}</h2>
              <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.65, marginBottom: 14 }}>{article.summary}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--color-text-muted)', fontSize: 12, flexWrap: 'wrap' }}>
                <span><Calendar size={12} style={{ display: 'inline', marginRight: 4 }} />{article.date}</span>
                <span><Tag size={12} style={{ display: 'inline', marginRight: 4 }} />{article.category}</span>
              </div>
              <details style={{ marginTop: 14 }}>
                <summary style={{ cursor: 'pointer', color: 'var(--color-gold)', fontWeight: 800 }}>{t('common.read', 'Читать')}</summary>
                <p style={{ color: '#c0d4c8', lineHeight: 1.75, marginTop: 12 }}>{article.content}</p>
              </details>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
