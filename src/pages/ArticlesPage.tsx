import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronDown, ChevronRight, Search, MessageCircle, Calendar,
  User, FolderOpen, BookOpen, ExternalLink, Plus
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ArticleCategory {
  id: string;
  title: string;
  parentId: string | null;
  icon?: string;
  children?: ArticleCategory[];
}

interface Article {
  id: string;
  title: string;
  excerpt: string;
  body?: string;
  category: string;
  subcategory?: string;
  author: string;
  date: string;
  image?: string;
  comments: number;
  sourceUrl?: string;
}

// Demo articles structure
const DEMO_ARTICLES: Article[] = [
  {
    id: 'a1',
    title: 'Единобожие — основа основ',
    excerpt: 'Разъяснение понятия таухид и его важности в жизни мусульманина.',
    category: 'sciences',
    subcategory: 'tawhid-science',
    author: 'Salaf Library',
    date: '2026-01-15',
    comments: 0,
  },
  {
    id: 'a2',
    title: 'Правила намаза для начинающих',
    excerpt: 'Подробное руководство по выполнению намаза с иллюстрациями.',
    category: 'rituals',
    subcategory: 'prayer',
    author: 'Salaf Library',
    date: '2026-02-10',
    comments: 0,
  },
  {
    id: 'a3',
    title: 'Исламское воспитание детей',
    excerpt: 'Методы воспитания детей в соответствии с Кораном и Сунной.',
    category: 'upbringing',
    subcategory: 'learning',
    author: 'Salaf Library',
    date: '2026-03-05',
    comments: 0,
  },
];

export default function ArticlesPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null);
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [articles, setArticles] = useState<Article[]>(DEMO_ARTICLES);

  useEffect(() => {
    fetch('./data/article-categories.json')
      .then(r => r.json())
      .then(data => setCategories(data))
      .catch(() => {});
  }, []);

  const toggleMenu = (id: string) => {
    const next = new Set(expandedMenus);
    if (next.has(id)) next.delete(id); else next.add(id);
    setExpandedMenus(next);
  };

  const filteredArticles = useMemo(() => {
    let result = [...articles];
    if (activeCategory) result = result.filter(a => a.category === activeCategory);
    if (activeSubcategory) result = result.filter(a => a.subcategory === activeSubcategory);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(a => a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q));
    }
    return result;
  }, [articles, activeCategory, activeSubcategory, search]);

  const getCategoryTitle = (id: string) => {
    for (const cat of categories) {
      if (cat.id === id) return cat.title;
      const child = cat.children?.find(c => c.id === id);
      if (child) return child.title;
    }
    return id;
  };

  return (
    <div className="fade-in" style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header */}
      <section className="glass-card islamic-pattern" style={{ padding: '32px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <BookOpen size={28} style={{ color: 'var(--color-gold)' }} />
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-text-primary)' }}>Статьи</h1>
        </div>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
          Научно-исследовательские статьи по вопросам Ислама
        </p>
      </section>

      {/* Category menu */}
      <div style={{
        display: 'flex', gap: '4px', marginBottom: '20px', flexWrap: 'wrap',
        background: 'var(--color-bg-card)', borderRadius: '14px', padding: '6px',
        border: '1px solid var(--color-border)',
      }}>
        {categories.map(cat => (
          <div key={cat.id} style={{ position: 'relative' }}>
            <button
              onClick={() => {
                if (cat.children && cat.children.length > 0) {
                  toggleMenu(cat.id);
                } else {
                  setActiveCategory(activeCategory === cat.id ? null : cat.id);
                  setActiveSubcategory(null);
                }
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                padding: '8px 14px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                background: activeCategory === cat.id ? 'var(--color-gold)' : 'transparent',
                color: activeCategory === cat.id ? '#111' : 'var(--color-text-secondary)',
                fontWeight: 600, fontSize: '13px', whiteSpace: 'nowrap',
                transition: 'all 0.2s',
              }}
            >
              {cat.title}
              {cat.children && cat.children.length > 0 && (
                <ChevronDown size={12} style={{
                  transform: expandedMenus.has(cat.id) ? 'rotate(180deg)' : 'rotate(0)',
                  transition: 'transform 0.2s',
                }} />
              )}
            </button>

            {/* Dropdown */}
            {expandedMenus.has(cat.id) && cat.children && cat.children.length > 0 && (
              <>
                <div onClick={() => toggleMenu(cat.id)} style={{ position: 'fixed', inset: 0, zIndex: 10 }} />
                <div style={{
                  position: 'absolute', top: '100%', left: 0, marginTop: '4px',
                  minWidth: '220px', background: 'var(--color-bg-card)', border: '1px solid var(--color-border)',
                  borderRadius: '12px', boxShadow: '0 12px 40px rgba(0,0,0,0.3)', zIndex: 20,
                  overflow: 'hidden',
                }}>
                  {cat.children.map(child => (
                    <button
                      key={child.id}
                      onClick={() => {
                        setActiveCategory(cat.id);
                        setActiveSubcategory(child.id);
                        setExpandedMenus(new Set());
                      }}
                      style={{
                        display: 'block', width: '100%', textAlign: 'left',
                        padding: '10px 16px', border: 'none', cursor: 'pointer',
                        background: activeSubcategory === child.id ? 'var(--color-bg-hover)' : 'transparent',
                        color: 'var(--color-text-primary)', fontSize: '13px',
                        borderBottom: '1px solid var(--color-border)',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-bg-hover)'; }}
                      onMouseLeave={e => { if (activeSubcategory !== child.id) e.currentTarget.style.background = 'transparent'; }}
                    >
                      {child.title}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px',
        background: 'var(--color-bg-card)', border: '1px solid var(--color-border)',
        borderRadius: '10px', padding: '8px 14px',
      }}>
        <Search size={15} style={{ color: 'var(--color-text-muted)' }} />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Поиск статей..."
          style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--color-text-primary)', fontSize: '14px' }}
        />
      </div>

      {/* Active filter */}
      {activeCategory && (
        <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
            {getCategoryTitle(activeCategory)}
            {activeSubcategory && ` / ${getCategoryTitle(activeSubcategory)}`}
          </span>
          <button onClick={() => { setActiveCategory(null); setActiveSubcategory(null); }}
            style={{ fontSize: '12px', color: 'var(--color-gold)', background: 'none', border: 'none', cursor: 'pointer' }}>
            Сбросить
          </button>
        </div>
      )}

      {/* Articles grid */}
      {filteredArticles.length === 0 ? (
        <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <BookOpen size={40} style={{ color: 'var(--color-text-muted)', margin: '0 auto 16px', opacity: 0.5 }} />
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
            Статей пока нет
          </h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
            Добавьте статьи через админ-панель
          </p>
          <button className="btn-primary" onClick={() => navigate('/admin')}>
            <Plus size={14} /> Добавить статью
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {filteredArticles.map(article => (
            <div key={article.id} className="glass-card glow-hover" style={{
              overflow: 'hidden', cursor: 'pointer',
            }}
              onClick={() => {
                if (article.sourceUrl) window.open(article.sourceUrl, '_blank');
                else toast('Статья пока не доступна для чтения');
              }}
            >
              {/* Image placeholder */}
              <div style={{
                height: '160px',
                background: article.image ? `url(${article.image}) center/cover` : 'linear-gradient(135deg, var(--color-bg-secondary), var(--color-bg-card))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative',
              }}>
                {!article.image && (
                  <BookOpen size={32} style={{ color: 'var(--color-text-muted)', opacity: 0.3 }} />
                )}
              </div>

              {/* Content */}
              <div style={{ padding: '16px' }}>
                <h3 style={{
                  fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)',
                  marginBottom: '8px', lineHeight: 1.3,
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                  {article.title}
                </h3>
                <p style={{
                  fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5,
                  marginBottom: '12px',
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                  {article.excerpt}
                </p>

                {/* Meta */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Calendar size={12} /> {new Date(article.date).toLocaleDateString('ru')}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <User size={12} /> {article.author}
                    </span>
                  </div>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <MessageCircle size={12} /> {article.comments}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
