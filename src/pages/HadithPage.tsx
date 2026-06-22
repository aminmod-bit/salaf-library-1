import { useEffect, useMemo, useState } from 'react';
import { BookOpenText, ExternalLink, Search, ShieldCheck } from 'lucide-react';

interface HadithBook { id: string; title: string; titleAr: string; slug: string; sourceUrl: string; description: string; count: number; }

export default function HadithPage() {
  const [books, setBooks] = useState<HadithBook[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    fetch('./data/hadith-books.json').then(r => r.json()).then(setBooks).catch(() => setBooks([]));
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return books;
    return books.filter(book => `${book.title} ${book.titleAr} ${book.description}`.toLowerCase().includes(q));
  }, [books, query]);

  return (
    <div className="fade-in" style={{ maxWidth: 1280, margin: '0 auto' }}>
      <section className="glass-card" style={{ padding: 32, marginBottom: 22, background: 'linear-gradient(135deg, rgba(13,42,24,.96), rgba(7,19,11,.94))' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#d4af37', fontSize: 12, fontWeight: 900, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 12 }}>
          <BookOpenText size={16} /> Hadith Navigator
        </div>
        <h1 style={{ color: '#f0f4f1', fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 950, lineHeight: 1.05, marginBottom: 12 }}>Хадисы</h1>
        <p style={{ color: '#9db8a3', maxWidth: 820, lineHeight: 1.75 }}>
          Раздел хадисов построен как навигационная витрина по сборникам. Полные тексты хадисов открываются через первоисточник Isnād. В следующих релизах можно добавить локальный индекс глав и хадисов при наличии разрешённого источника данных.
        </p>
      </section>

      <div className="glass-card" style={{ padding: 16, marginBottom: 20, display: 'flex', gap: 10, alignItems: 'center' }}>
        <Search size={16} color="#5a7a63" />
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Поиск по сборникам хадисов..." style={{ flex: 1, background: 'transparent', border: 0, outline: 0, color: '#f0f4f1' }} />
      </div>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 16 }}>
        {filtered.map(book => (
          <article key={book.id} className="glass-card" style={{ padding: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
              <div>
                <h2 style={{ color: '#f0f4f1', fontSize: 20, fontWeight: 900, lineHeight: 1.25 }}>{book.title}</h2>
                <div dir="rtl" style={{ fontFamily: 'Amiri, serif', color: '#d4af37', fontSize: 20, marginTop: 4 }}>{book.titleAr}</div>
              </div>
              <div style={{ width: 42, height: 42, borderRadius: 14, background: 'rgba(212,175,55,.12)', color: '#d4af37', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ShieldCheck size={20}/></div>
            </div>
            <p style={{ color: '#9db8a3', lineHeight: 1.65, marginBottom: 16 }}>{book.description}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
              <span className="badge badge-gold">{book.count ? `${book.count} хадисов` : 'Сборник'}</span>
              <a className="btn-secondary" href={book.sourceUrl} target="_blank" rel="noreferrer"><ExternalLink size={14}/> Isnād</a>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
