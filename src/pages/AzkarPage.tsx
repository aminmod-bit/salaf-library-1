import { useEffect, useMemo, useState } from 'react';
import { Repeat, Search, Shield, Sparkles } from 'lucide-react';
import FolderCard from '../components/FolderCard';

interface Zikr {
  id: string; type: string; category: string; title: string; arabic: string; translationRu: string; source: string; repeat: number; benefit: string;
}

const folders = [
  { id: 'all', label: 'Все азкары' },
  { id: 'featured', label: 'Избранные' },
  { id: 'morning', label: 'Утренние' },
  { id: 'evening', label: 'Вечерние' },
  { id: 'sleep', label: 'Перед сном' },
  { id: 'after-prayer', label: 'После молитвы' },
  { id: 'after-prayer', label: 'После намаза' },
  { id: 'istikharah', label: 'Истихара' },
  { id: 'before-food', label: 'Перед едой' },
  { id: 'after-food', label: 'После еды' },
  { id: 'enter-home', label: 'При входе в дом' },
  { id: 'leave-home', label: 'При выходе из дома' },
  { id: 'enter-masjid', label: 'При входе в мечеть' },
  { id: 'leave-masjid', label: 'При выходе из мечети' },
  { id: 'travel', label: 'Для путешествия' },
  { id: 'rain', label: 'Во время дождя' },
  { id: 'illness', label: 'При болезни' },
  { id: 'misc', label: 'Разные азкары' },
];

export default function AzkarPage() {
  const [azkar, setAzkar] = useState<Zikr[]>([]);
  const [folder, setFolder] = useState('');
  const [query, setQuery] = useState('');
  const [done, setDone] = useState<Record<string, number>>({});

  useEffect(() => {
    fetch('./data/azkar.json').then(r => r.json()).then(setAzkar).catch(() => setAzkar([]));
  }, []);

  const folderStats = useMemo(() => folders.map(item => ({ ...item, count: item.id === 'all' ? azkar.length : item.id === 'featured' ? Math.min(azkar.length, 2) : azkar.filter(z => z.type === item.id).length })), [azkar]);

  const filtered = useMemo(() => {
    let result = folder === 'all' || !folder ? azkar : folder === 'featured' ? azkar.slice(0, 2) : azkar.filter(item => item.type === folder);
    const q = query.toLowerCase().trim();
    if (q) result = azkar.filter(item => `${item.title} ${item.translationRu} ${item.source}`.toLowerCase().includes(q));
    return result;
  }, [azkar, folder, query]);

  const increment = (id: string, max: number) => setDone(prev => ({ ...prev, [id]: Math.min((prev[id] || 0) + 1, max) }));
  const reset = (id: string) => setDone(prev => ({ ...prev, [id]: 0 }));
  const showFolders = !folder && !query.trim();

  return (
    <div className="fade-in" style={{ maxWidth: 1180, margin: '0 auto' }}>
      <section className="glass-card islamic-pattern" style={{ padding: 32, marginBottom: 20 }}>
        <div style={{ color: 'var(--color-gold)', fontSize: 12, fontWeight: 900, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 10, display: 'flex', gap: 8, alignItems: 'center' }}><Shield size={16}/> Daily Azkar</div>
        <h1 style={{ color: 'var(--color-text-primary)', fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 950, lineHeight: 1.05, marginBottom: 12 }}>{showFolders ? 'Папки азкаров и дуа' : folders.find(f => f.id === folder)?.label || 'Азкары и дуа'}</h1>
        <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.75, maxWidth: 760 }}>Сначала выберите папку: утренние, вечерние, перед сном, после намаза и другие разделы.</p>
      </section>

      <div className="glass-card" style={{ padding: 16, marginBottom: 20, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: 220, display: 'flex', gap: 8, alignItems: 'center', background: 'var(--color-bg-hover)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '9px 12px' }}>
          <Search size={15} style={{ color: 'var(--color-text-muted)' }} />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Поиск азкаров..." style={{ flex: 1, background: 'transparent', border: 0, outline: 0, color: 'var(--color-text-primary)' }} />
        </div>
        {!showFolders && <button className="btn-ghost" onClick={() => { setFolder(''); setQuery(''); }}>Все папки</button>}
      </div>

      {showFolders ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 16 }}>
          {folderStats.map(item => (
            <FolderCard
              key={`${item.id}-${item.label}`}
              title={item.label}
              subtitle="Папка азкаров и дуа"
              count={item.count}
              countLabel="записей"
              disabled={item.count === 0}
              onClick={() => setFolder(item.id)}
            />
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {filtered.map(item => {
            const count = done[item.id] || 0;
            return (
              <article key={item.id} className="glass-card" style={{ padding: 22 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start', marginBottom: 14 }}>
                  <div><span className="badge badge-gold">{item.category}</span><h2 style={{ color: '#f0f4f1', fontSize: 20, fontWeight: 900, marginTop: 10 }}>{item.title}</h2></div>
                  <div style={{ color: '#d4af37', display: 'flex', gap: 5, alignItems: 'center', fontWeight: 900 }}><Repeat size={16}/>{item.repeat}x</div>
                </div>
                <p dir="rtl" style={{ fontFamily: 'Amiri, serif', fontSize: 25, lineHeight: 2, color: '#f8efd1', textAlign: 'right', padding: 14, border: '1px solid rgba(212,175,55,.12)', borderRadius: 14, background: 'rgba(212,175,55,.04)' }}>{item.arabic}</p>
                <p style={{ color: '#9db8a3', lineHeight: 1.75, marginTop: 12 }}>{item.translationRu}</p>
                <p style={{ color: '#5a7a63', fontSize: 12, marginTop: 8 }}>{item.source}</p>
                <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '1fr auto', gap: 10, alignItems: 'center' }}>
                  <div style={{ height: 8, background: 'rgba(255,255,255,.08)', borderRadius: 999, overflow: 'hidden' }}><div style={{ width: `${(count / item.repeat) * 100}%`, height: '100%', background: 'linear-gradient(90deg,var(--color-gold),var(--color-accent-light))' }} /></div>
                  <button className="btn-primary" onClick={() => count >= item.repeat ? reset(item.id) : increment(item.id, item.repeat)}>{count >= item.repeat ? 'Сброс' : `${count}/${item.repeat}`}</button>
                </div>
                {item.benefit && <div style={{ marginTop: 12, color: '#9db8a3', fontSize: 13, display: 'flex', gap: 7 }}><Sparkles size={14} color="#d4af37"/> {item.benefit}</div>}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
