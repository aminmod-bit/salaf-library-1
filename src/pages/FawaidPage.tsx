import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Heart, Share2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';

const contentLanguage: Record<string, string> = { ru: 'Русский', ar: 'Арабский', en: 'Английский', tg: 'Таджикский', uz: 'Узбекский', fa: 'Персидский' };

export default function FawaidPage() {
  const { i18n } = useTranslation();
  const activeLang = contentLanguage[(i18n.resolvedLanguage || i18n.language || 'ru').split('-')[0]] || 'Русский';
  const { fawaid } = useStore();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [authorFilter, setAuthorFilter] = useState('all');

  const categories = useMemo(() => {
    const cats = new Set(fawaid.filter(f => (f.language || 'Русский') === activeLang).map(f => f.category));
    return Array.from(cats);
  }, [fawaid, activeLang]);

  const authors = useMemo(() => {
    const a = new Set(fawaid.filter(f => (f.language || 'Русский') === activeLang).map(f => f.author));
    return Array.from(a);
  }, [fawaid, activeLang]);

  const filtered = useMemo(() => {
    let result = fawaid.filter(f => (f.language || 'Русский') === activeLang);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(f =>
        f.text.toLowerCase().includes(q) ||
        f.author.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q)
      );
    }
    if (category !== 'all') result = result.filter(f => f.category === category);
    if (authorFilter !== 'all') result = result.filter(f => f.author === authorFilter);
    return result;
  }, [fawaid, search, category, authorFilter, activeLang]);

  const handleShare = (f: typeof fawaid[0]) => {
    const text = `"${f.text}"\n— ${f.author}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      toast('Фаида скопирована!', { icon: '📋' });
    }
  };

  return (
    <div className="fade-in" style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '6px' }}>
          Фаваиды
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
          {filtered.length} фаваидов из {fawaid.length} — мудрость учёных ислама
        </p>
      </div>

      {/* Filters */}
      <div style={{
        background: 'var(--color-bg-card)', border: '1px solid var(--color-border)',
        borderRadius: '16px', padding: '16px 20px', marginBottom: '20px',
        display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center',
      }}>
        <div style={{
          flex: 1, minWidth: '200px',
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'var(--color-bg-hover)', border: '1px solid var(--color-border)',
          borderRadius: '10px', padding: '8px 14px',
        }}>
          <Search size={15} style={{ color: 'var(--color-text-muted)' }} />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Поиск фаваидов..."
            style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--color-text-primary)', fontSize: '14px', fontFamily: 'inherit', width: '100%' }}
          />
        </div>

        <select
          value={authorFilter} onChange={e => setAuthorFilter(e.target.value)}
          style={{
            background: 'var(--color-bg-hover)', border: '1px solid var(--color-border)',
            borderRadius: '10px', padding: '8px 14px', color: 'var(--color-text-primary)',
            fontSize: '13px', fontFamily: 'inherit', outline: 'none', cursor: 'pointer',
          }}
        >
          <option value="all" style={{ background: 'var(--color-bg-card)' }}>Все авторы</option>
          {authors.map(a => <option key={a} value={a} style={{ background: 'var(--color-bg-card)' }}>{a}</option>)}
        </select>
      </div>

      {/* Category tabs */}
      <div className="scroll-row" style={{ marginBottom: '28px', gap: '8px' }}>
        <button onClick={() => setCategory('all')} className={`tag ${category === 'all' ? 'active' : ''}`}>
          Все темы
        </button>
        {categories.map(c => (
          <button key={c} onClick={() => setCategory(c)} className={`tag ${category === c ? 'active' : ''}`}>
            {c}
          </button>
        ))}
      </div>

      {/* Fawaid grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#5a7a63' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>💎</div>
          <div style={{ fontSize: '18px', fontWeight: 600, color: '#9db8a3' }}>Ничего не найдено</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {filtered.map(f => (
            <div
              key={f.id}
              style={{
                padding: '24px',
                background: 'linear-gradient(135deg, var(--color-bg-card) 0%, rgba(17, 42, 26, 0.7) 100%)',
                border: f.isFeatured ? '1px solid rgba(212,175,55,0.35)' : '1px solid var(--color-border)',
                borderRadius: '16px',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,175,55,0.45)';
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = f.isFeatured ? 'rgba(212,175,55,0.35)' : 'var(--color-border)';
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
              }}
            >
              {/* Decorative quote */}
              <div style={{
                position: 'absolute', top: '10px', right: '14px',
                fontSize: '60px', color: 'rgba(212,175,55,0.06)',
                lineHeight: 1, fontFamily: 'Amiri, serif',
                pointerEvents: 'none',
              }}>
                "
              </div>

              {f.isFeatured && (
                <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
                  <span className="badge badge-gold" style={{ fontSize: '9px' }}>✨ Избранное</span>
                </div>
              )}

              {/* Arabic text */}
              {f.textAr && (
                <div style={{
                  fontFamily: 'Amiri, serif',
                  fontSize: '18px', color: '#d4af37',
                  direction: 'rtl', lineHeight: 1.8,
                  marginBottom: '14px',
                  marginTop: f.isFeatured ? '20px' : '0',
                  padding: '12px',
                  background: 'rgba(212,175,55,0.05)',
                  borderRadius: '8px',
                  border: '1px solid rgba(212,175,55,0.1)',
                }}>
                  {f.textAr}
                </div>
              )}

              {/* Russian text */}
              <p style={{
                fontSize: '14px', color: '#c0d4c8', lineHeight: 1.7,
                marginBottom: '16px',
                marginTop: !f.textAr && f.isFeatured ? '20px' : '0',
              }}>
                {f.text}
              </p>

              {/* Footer */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#d4af37' }}>
                    — {f.author}
                  </div>
                  {f.source && (
                    <div style={{ fontSize: '10px', color: '#5a7a63', marginTop: '2px' }}>
                      {f.source}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="badge badge-green" style={{ fontSize: '10px' }}>{f.category}</span>
                  <button
                    onClick={() => handleShare(f)}
                    style={{
                      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px', padding: '5px 8px',
                      color: '#5a7a63', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                      fontSize: '11px', transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#9db8a3')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#5a7a63')}
                  >
                    <Share2 size={11} /> Копировать
                  </button>
                </div>
              </div>

              {/* Tags */}
              {f.tags.length > 0 && (
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '10px' }}>
                  {f.tags.map(tag => (
                    <span key={tag} style={{
                      fontSize: '10px', color: '#5a7a63',
                      background: 'rgba(255,255,255,0.03)',
                      padding: '2px 7px', borderRadius: '4px',
                    }}>
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
