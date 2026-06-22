import { useEffect, useMemo, useState } from 'react';
import { Search, Repeat, Shield, Sparkles } from 'lucide-react';

interface Zikr {
  id: string; type: string; category: string; title: string; arabic: string; translationRu: string; source: string; repeat: number; benefit: string;
}

const types = [
  { id: 'all', label: 'Все' },
  { id: 'morning', label: 'Утро' },
  { id: 'evening', label: 'Вечер' },
  { id: 'sleep', label: 'Перед сном' },
  { id: 'after-prayer', label: 'После намаза' },
];

export default function AzkarPage() {
  const [azkar, setAzkar] = useState<Zikr[]>([]);
  const [type, setType] = useState('all');
  const [query, setQuery] = useState('');
  const [done, setDone] = useState<Record<string, number>>({});

  useEffect(() => {
    fetch('./data/azkar.json').then(r => r.json()).then(setAzkar).catch(() => setAzkar([]));
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return azkar.filter(item => (type === 'all' || item.type === type) && (!q || `${item.title} ${item.translationRu} ${item.source}`.toLowerCase().includes(q)));
  }, [azkar, type, query]);

  const increment = (id: string, max: number) => setDone(prev => ({ ...prev, [id]: Math.min((prev[id] || 0) + 1, max) }));
  const reset = (id: string) => setDone(prev => ({ ...prev, [id]: 0 }));

  return (
    <div className="fade-in" style={{ maxWidth: 1180, margin: '0 auto' }}>
      <section className="glass-card" style={{ padding: 32, marginBottom: 20, background: 'linear-gradient(135deg, rgba(13,42,24,.96), rgba(7,19,11,.94))' }}>
        <div style={{ color: '#d4af37', fontSize: 12, fontWeight: 900, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 10, display: 'flex', gap: 8, alignItems: 'center' }}><Shield size={16}/> Daily Azkar</div>
        <h1 style={{ color: '#f0f4f1', fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 950, lineHeight: 1.05, marginBottom: 12 }}>Азкары и дуа</h1>
        <p style={{ color: '#9db8a3', lineHeight: 1.75, maxWidth: 760 }}>Утренние и вечерние поминания, дуа перед сном и после намаза. Раздел подготовлен для постепенного наполнения проверенными текстами.</p>
      </section>

      <div className="glass-card" style={{ padding: 16, marginBottom: 20, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: 220, display: 'flex', gap: 8, alignItems: 'center', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(212,175,55,.14)', borderRadius: 12, padding: '9px 12px' }}>
          <Search size={15} color="#5a7a63" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Поиск азкаров..." style={{ flex: 1, background: 'transparent', border: 0, outline: 0, color: '#f0f4f1' }} />
        </div>
        <div className="scroll-row" style={{ gap: 8, paddingBottom: 0 }}>
          {types.map(item => <button key={item.id} className={`tag ${type === item.id ? 'active' : ''}`} onClick={() => setType(item.id)}>{item.label}</button>)}
        </div>
      </div>

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
                <div style={{ height: 8, background: 'rgba(255,255,255,.08)', borderRadius: 999, overflow: 'hidden' }}><div style={{ width: `${(count / item.repeat) * 100}%`, height: '100%', background: 'linear-gradient(90deg,#d4af37,#22c55e)' }} /></div>
                <button className="btn-primary" onClick={() => count >= item.repeat ? reset(item.id) : increment(item.id, item.repeat)}>{count >= item.repeat ? 'Сброс' : `${count}/${item.repeat}`}</button>
              </div>
              {item.benefit && <div style={{ marginTop: 12, color: '#9db8a3', fontSize: 13, display: 'flex', gap: 7 }}><Sparkles size={14} color="#d4af37"/> {item.benefit}</div>}
            </article>
          );
        })}
      </div>
    </div>
  );
}
