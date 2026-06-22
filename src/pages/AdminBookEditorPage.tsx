import { useMemo, useState } from 'react';
import { Save, Search, ExternalLink, BookOpen, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useStore, type Book } from '../store/useStore';
import { getGitHubFile, hasGitHubSettings, loadGitHubSettings, upsertTextFile } from '../utils/githubApi';

const emptyPatch = { title: '', author: '', category: '', language: '', description: '', tags: '', year: '', featured: false, popular: false, isNew: false };

export default function AdminBookEditorPage() {
  const { books } = useStore();
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(books[0]?.id || '');
  const selected = books.find(b => b.id === selectedId);
  const [patch, setPatch] = useState(emptyPatch);
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return books.filter(b => `${b.title} ${b.author} ${b.category}`.toLowerCase().includes(q)).slice(0, 80);
  }, [books, query]);

  const loadBook = (book: Book) => {
    setSelectedId(book.id);
    setPatch({
      title: book.title || '', author: book.author || '', category: book.category || '', language: book.language || 'Русский',
      description: book.description || '', tags: book.tags?.join(', ') || '', year: book.year || '',
      featured: Boolean(book.featured), popular: Boolean(book.popular), isNew: Boolean(book.isNew),
    });
  };

  const active = selected ? { ...selected, ...patch, tags: patch.tags.split(',').map(t => t.trim()).filter(Boolean) } : null;

  const save = async () => {
    if (!active) return;
    if (!hasGitHubSettings()) {
      toast.error('Сначала подключите GitHub API в настройках');
      return;
    }
    if (!active.title.trim() || !active.category.trim()) {
      toast.error('Название и категория обязательны');
      return;
    }

    try {
      setSaving(true);
      const settings = loadGitHubSettings();
      const file = await getGitHubFile(settings, 'public/data/books.json');
      const remoteBooks: Book[] = file?.content ? JSON.parse(file.content) : books;
      const next = remoteBooks.map(book => book.id === active.id ? active : book);
      await upsertTextFile(settings, 'public/data/books.json', JSON.stringify(next, null, 2) + '\n', `Edit book metadata: ${active.title}`);
      toast.success('Книга сохранена в GitHub. Дождитесь GitHub Actions.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fade-in" style={{ maxWidth: 1380, margin: '0 auto' }}>
      <section className="glass-card" style={{ padding: 26, marginBottom: 18 }}>
        <h1 style={{ color: '#f0f4f1', fontSize: 30, fontWeight: 900, marginBottom: 8 }}>📚 Редактор книг</h1>
        <p style={{ color: '#9db8a3' }}>Редактируйте метаданные книг и сохраняйте изменения напрямую в GitHub через API.</p>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 18 }} className="editor-grid">
        <style>{`@media(max-width:920px){.editor-grid{grid-template-columns:1fr!important}}`}</style>
        <aside className="glass-card" style={{ padding: 14, maxHeight: '75vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '9px 12px', border: '1px solid rgba(212,175,55,.14)', borderRadius: 12, marginBottom: 12 }}>
            <Search size={15} color="#5a7a63" />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Поиск книги" style={{ flex: 1, background: 'transparent', border: 0, outline: 0, color: '#f0f4f1' }} />
          </div>
          <div style={{ overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map(book => (
              <button key={book.id} onClick={() => loadBook(book)} style={{ textAlign: 'left', padding: 12, borderRadius: 12, border: selectedId === book.id ? '1px solid rgba(212,175,55,.5)' : '1px solid rgba(212,175,55,.12)', background: selectedId === book.id ? 'rgba(212,175,55,.08)' : 'rgba(255,255,255,.03)', color: '#f0f4f1', cursor: 'pointer' }}>
                <b style={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{book.title}</b>
                <span style={{ color: '#9db8a3', fontSize: 12 }}>{book.author} · {book.category}</span>
              </button>
            ))}
          </div>
        </aside>

        <main className="glass-card" style={{ padding: 22 }}>
          {selected && active ? (
            <div style={{ display: 'grid', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} className="editor-form-grid">
                <Field label="Название" value={patch.title || selected.title} onChange={v => setPatch(p => ({ ...p, title: v }))} />
                <Field label="Автор" value={patch.author || selected.author} onChange={v => setPatch(p => ({ ...p, author: v }))} />
                <Field label="Категория" value={patch.category || selected.category} onChange={v => setPatch(p => ({ ...p, category: v }))} />
                <Field label="Язык" value={patch.language || selected.language || 'Русский'} onChange={v => setPatch(p => ({ ...p, language: v }))} />
                <Field label="Год" value={patch.year || selected.year || ''} onChange={v => setPatch(p => ({ ...p, year: v }))} />
                <Field label="Теги через запятую" value={patch.tags || selected.tags?.join(', ') || ''} onChange={v => setPatch(p => ({ ...p, tags: v }))} />
              </div>
              <label style={{ color: '#9db8a3', fontSize: 12, fontWeight: 800 }}>Описание</label>
              <textarea value={patch.description || selected.description} onChange={e => setPatch(p => ({ ...p, description: e.target.value }))} className="input-field" style={{ minHeight: 150, resize: 'vertical' }} />
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {(['featured','popular','isNew'] as const).map(key => <label key={key} style={{ color: '#9db8a3', display: 'flex', alignItems: 'center', gap: 8 }}><input type="checkbox" checked={Boolean((patch as any)[key])} onChange={e => setPatch(p => ({ ...p, [key]: e.target.checked }))} /> {key}</label>)}
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button className="btn-primary" onClick={save} disabled={saving}><Save size={16}/> {saving ? 'Сохранение...' : 'Сохранить в GitHub'}</button>
                <button className="btn-secondary" onClick={() => window.open(`/#/read/${selected.id}`, '_blank')}><BookOpen size={16}/> Читать</button>
                <button className="btn-ghost" onClick={() => window.open(`/#/books/${selected.id}`, '_blank')}><ExternalLink size={16}/> На сайте</button>
              </div>
            </div>
          ) : <div style={{ color: '#9db8a3', padding: 30 }}><AlertTriangle size={22}/> Выберите книгу</div>}
        </main>
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return <div><label style={{ color: '#9db8a3', fontSize: 12, fontWeight: 800, display: 'block', marginBottom: 6 }}>{label}</label><input className="input-field" value={value} onChange={e => onChange(e.target.value)} /></div>;
}
