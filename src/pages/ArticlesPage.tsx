import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpenText, Calendar, Search, Tag } from 'lucide-react';

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

export default function ArticlesPage() {
  const { i18n, t } = useTranslation();
  const activeLanguage = langMap[(i18n.resolvedLanguage || i18n.language || 'ru').split('-')[0]] || 'Русский';
  const [articles, setArticles] = useState<Article[]>([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');

  useEffect(() => {
    fetch('./data/articles.json').then(r => r.json()).then(setArticles).catch(() => setArticles([]));
  }, []);

  const current = useMemo(() => articles.filter(a => a.language === activeLanguage), [articles, activeLanguage]);
  const categories = useMemo(() => Array.from(new Set(current.map(a => a.category))), [current]);
  const filtered = useMemo(() => {
    let result = [...current];
    const q = query.trim().toLowerCase();
    if (q) result = result.filter(a => `${a.title} ${a.summary} ${a.content} ${a.author} ${a.tags.join(' ')}`.toLowerCase().includes(q));
    if (category !== 'all') result = result.filter(a => a.category === category);
    return result.sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || b.date.localeCompare(a.date));
  }, [current, query, category]);

  return (
    <div className="fade-in" style={{ maxWidth: 1180, margin: '0 auto' }}>
      <section className="glass-card" style={{ padding: 30, marginBottom: 20, background: 'linear-gradient(135deg, rgba(13,42,24,.96), rgba(7,19,11,.94))' }}>
        <div style={{ color: '#d4af37', fontSize: 12, fontWeight: 900, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 10, display: 'flex', gap: 8, alignItems: 'center' }}><BookOpenText size={16}/> {t('articles.eyebrow', 'Материалы')}</div>
        <h1 style={{ color: '#f0f4f1', fontSize: 'clamp(30px, 5vw, 50px)', lineHeight: 1.06, fontWeight: 950 }}>{t('articles.title', 'Статьи и материалы')}</h1>
        <p style={{ color: '#9db8a3', lineHeight: 1.75, maxWidth: 760, marginTop: 12 }}>
          {t('articles.description', 'Раздел для статей, ответов, пояснений и полезных материалов по выбранному языку. Контент не переводится искусственно: показываются только реально добавленные материалы.')}
        </p>
      </section>

      <div className="glass-card" style={{ padding: 16, display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
        <div style={{ flex: 1, minWidth: 220, display: 'flex', gap: 8, alignItems: 'center', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(212,175,55,.14)', borderRadius: 12, padding: '9px 12px' }}>
          <Search size={15} color="#5a7a63" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder={t('articles.search', 'Поиск статей...')} style={{ flex: 1, background: 'transparent', border: 0, outline: 0, color: '#f0f4f1' }} />
        </div>
        <select className="input-field" style={{ width: 'auto' }} value={category} onChange={e => setCategory(e.target.value)}>
          <option value="all">{t('common.all', 'Все')}</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card" style={{ padding: 46, textAlign: 'center', color: '#9db8a3' }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>📄</div>
          <h2 style={{ color: '#f0f4f1', fontWeight: 850, marginBottom: 8 }}>{t('articles.emptyTitle', 'Материалы на этом языке пока не добавлены')}</h2>
          <p>{t('articles.emptyText', 'Когда появятся статьи на выбранном языке, они будут отображаться здесь.')}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {filtered.map(article => (
            <article key={article.id} className="glass-card" style={{ padding: 22 }}>
              {article.featured && <span className="badge badge-gold" style={{ marginBottom: 12 }}>✨ {t('common.featured', 'Избранное')}</span>}
              <h2 style={{ color: '#f0f4f1', fontSize: 19, fontWeight: 900, lineHeight: 1.25, marginBottom: 10 }}>{article.title}</h2>
              <p style={{ color: '#9db8a3', lineHeight: 1.65, marginBottom: 14 }}>{article.summary}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#5a7a63', fontSize: 12, flexWrap: 'wrap' }}>
                <span><Calendar size={12} style={{ display: 'inline', marginRight: 4 }} />{article.date}</span>
                <span><Tag size={12} style={{ display: 'inline', marginRight: 4 }} />{article.category}</span>
              </div>
              <details style={{ marginTop: 14 }}>
                <summary style={{ cursor: 'pointer', color: '#d4af37', fontWeight: 800 }}>{t('common.read', 'Читать')}</summary>
                <p style={{ color: '#c0d4c8', lineHeight: 1.75, marginTop: 12 }}>{article.content}</p>
              </details>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
