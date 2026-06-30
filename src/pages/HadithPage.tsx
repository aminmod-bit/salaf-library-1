import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, BookOpenText, ExternalLink, Search } from 'lucide-react';
import FolderCard from '../components/FolderCard';

interface HadithBook { id: string; title: string; titleAr: string; slug: string; sourceUrl: string; description: string; count: number; }

export default function HadithPage() {
  const [books, setBooks] = useState<HadithBook[]>([]);
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState('');

  useEffect(() => {
    fetch('./data/hadith-books.json').then(r => r.json()).then(setBooks).catch(() => setBooks([]));
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return books;
    return books.filter(book => `${book.title} ${book.titleAr} ${book.description}`.toLowerCase().includes(q));
  }, [books, query]);

  const selected = selectedId ? books.find(book => book.id === selectedId) : null;

  return (
    <div className="fade-in" style={{ maxWidth: 1280, margin: '0 auto' }}>
      <section className="glass-card" style={{ padding: 32, marginBottom: 22, background: 'linear-gradient(135deg, var(--color-bg-secondary), var(--color-bg-card))' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--color-gold)', fontSize: 12, fontWeight: 900, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 12 }}>
          <BookOpenText size={16} /> Hadith Library
        </div>
        <h1 style={{ color: 'var(--color-text-primary)', fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 950, lineHeight: 1.05, marginBottom: 12 }}>
          {selected ? selected.title : 'Папки хадисов'}
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', maxWidth: 820, lineHeight: 1.75 }}>
          {selected ? 'Страница сборника подготовлена для будущего наполнения главами и хадисами.' : 'Сначала выберите сборник хадисов. Каждый сборник является отдельной папкой, готовой для дальнейшего наполнения.'}
        </p>
      </section>

      <div className="glass-card" style={{ padding: 16, marginBottom: 20, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        {selected && <button className="btn-ghost" onClick={() => setSelectedId('')}><ArrowLeft size={16}/> Все сборники</button>}
        <div style={{ flex: 1, minWidth: 220, display: 'flex', gap: 10, alignItems: 'center' }}>
          <Search size={16} color="#5a7a63" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Поиск по сборникам хадисов..." style={{ flex: 1, background: 'transparent', border: 0, outline: 0, color: 'var(--color-text-primary)' }} />
        </div>
      </div>

      {selected ? (
        <section className="glass-card" style={{ padding: 24 }}>
          <div dir="rtl" style={{ fontFamily: 'Amiri, serif', color: 'var(--color-gold)', fontSize: 30, marginBottom: 12 }}>{selected.titleAr}</div>
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7, marginBottom: 18 }}>{selected.description}</p>
          <div style={{ padding: 20, border: '1px dashed rgba(212,175,55,.24)', borderRadius: 16, color: 'var(--color-text-secondary)', marginBottom: 18 }}>
            Главы и хадисы будут добавлены позже в структуру <b>Hadith/{selected.slug}</b>. Сейчас доступна ссылка на первоисточник.
          </div>
          <a className="btn-secondary" href={selected.sourceUrl} target="_blank" rel="noreferrer"><ExternalLink size={14}/> Открыть на Isnād</a>
        </section>
      ) : (
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {filtered.map(book => (
            <FolderCard
              key={book.id}
              title={book.title}
              subtitle={book.titleAr}
              count={book.count}
              countLabel="хадисов"
              onClick={() => setSelectedId(book.id)}
            />
          ))}
        </section>
      )}
    </div>
  );
}
