import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, Users, Headphones, Sparkles, Feather,
  BarChart3, Plus, Edit3, Trash2, Download, Upload,
  LogOut, Save, X, Search, ChevronRight, Star, Clock,
  AlertCircle, FileText, BookMarked, Heart
} from 'lucide-react';
import { useStore } from '../store/useStore';
import type { Book, Biography, AudioLesson, Faidah, Category } from '../store/useStore';
import toast from 'react-hot-toast';

const ADMIN_PIN = '1234';
const PIN_KEY = 'salaf-admin-pin';

type Tab = 'dashboard' | 'books' | 'articles' | 'azkar' | 'audio' | 'fawaid' | 'biographies';

const CATEGORIES = [
  'Акыда', 'Таухид', 'Манхадж', 'Тафсир', 'Хадисы', 'Фикх',
  'Сира', 'Биографии', 'Арабский язык', 'Дуа и зикр', 'Фаваиды', 'Общее'
];

const LANGUAGES = ['Русский', 'العربية', 'English', 'Тоҷикӣ'];

// ─── PIN Gate ────────────────────────────────────────────────────────────────
function PinGate({ onUnlock }: { onUnlock: () => void }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
      localStorage.setItem(PIN_KEY, '1');
      onUnlock();
    } else {
      setError(true);
      setTimeout(() => setError(false), 1500);
    }
  };

  return (
    <div style={{
      minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <form onSubmit={handleSubmit} className="glass-card" style={{
        padding: '40px', width: '100%', maxWidth: '360px', textAlign: 'center',
      }}>
        <div style={{
          width: '64px', height: '64px', margin: '0 auto 20px', borderRadius: '16px',
          background: 'var(--color-bg-hover)', border: '1px solid var(--color-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <BookOpen size={28} style={{ color: 'var(--color-gold)' }} />
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
          Админ-панель
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '24px' }}>
          Введите PIN для доступа
        </p>
        <input
          type="password"
          value={pin}
          onChange={e => { setPin(e.target.value); setError(false); }}
          placeholder="PIN-код"
          autoFocus
          style={{
            width: '100%', padding: '14px', fontSize: '24px', textAlign: 'center',
            letterSpacing: '8px', background: 'var(--color-bg-card)', border: `2px solid ${error ? '#ef4444' : 'var(--color-border)'}`,
            borderRadius: '12px', color: 'var(--color-text-primary)', outline: 'none',
            transition: 'border-color 0.2s',
          }}
        />
        {error && (
          <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '8px' }}>Неверный PIN</p>
        )}
        <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '16px', justifyContent: 'center' }}>
          Войти
        </button>
        <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '16px' }}>
          Это локальная админка. Для настоящей защиты нужен backend.
        </p>
      </form>
    </div>
  );
}

// ─── Book Form ───────────────────────────────────────────────────────────────
function BookForm({ book, onSave, onCancel }: {
  book?: Book;
  onSave: (data: Partial<Book>) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<Partial<Book>>(book || {
    title: '', author: '', category: 'Общее', language: 'Русский',
    tags: [], description: '', year: String(new Date().getFullYear()),
    featured: false, isNew: true, popular: false,
  });
  const [tagsStr, setTagsStr] = useState((book?.tags || []).join(', '));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...form, tags: tagsStr.split(',').map(t => t.trim()).filter(Boolean) });
  };

  const fieldStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', background: 'var(--color-bg-card)',
    border: '1px solid var(--color-border)', borderRadius: '10px',
    color: 'var(--color-text-primary)', fontSize: '14px', fontFamily: 'inherit',
    outline: 'none', boxSizing: 'border-box',
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
          {book ? 'Редактировать книгу' : 'Добавить книгу'}
        </h3>
        <button type="button" onClick={onCancel} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}>
          <X size={20} />
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
        <div>
          <label style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px', display: 'block' }}>Название *</label>
          <input required style={fieldStyle} value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} />
        </div>
        <div>
          <label style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px', display: 'block' }}>Автор *</label>
          <input required style={fieldStyle} value={form.author || ''} onChange={e => setForm({ ...form, author: e.target.value })} />
        </div>
        <div>
          <label style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px', display: 'block' }}>Категория *</label>
          <select style={fieldStyle} value={form.category || ''} onChange={e => setForm({ ...form, category: e.target.value })}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px', display: 'block' }}>Язык</label>
          <select style={fieldStyle} value={form.language || ''} onChange={e => setForm({ ...form, language: e.target.value })}>
            {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px', display: 'block' }}>Год</label>
          <input style={fieldStyle} value={form.year || ''} onChange={e => setForm({ ...form, year: e.target.value })} />
        </div>
        <div>
          <label style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px', display: 'block' }}>Размер</label>
          <input style={fieldStyle} value={form.size || ''} onChange={e => setForm({ ...form, size: e.target.value })} placeholder="напр. 2.4 МБ" />
        </div>
        <div>
          <label style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px', display: 'block' }}>Страниц</label>
          <input style={fieldStyle} type="number" value={form.pages || ''} onChange={e => setForm({ ...form, pages: Number(e.target.value) || undefined })} />
        </div>
        <div>
          <label style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px', display: 'block' }}>Обложка (путь)</label>
          <input style={fieldStyle} value={form.coverImage || ''} onChange={e => setForm({ ...form, coverImage: e.target.value })} placeholder="./covers/name.webp" />
        </div>
      </div>

      <div style={{ marginTop: '12px' }}>
        <label style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px', display: 'block' }}>Описание</label>
        <textarea style={{ ...fieldStyle, minHeight: '80px', resize: 'vertical' }} value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} />
      </div>

      <div style={{ marginTop: '12px' }}>
        <label style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px', display: 'block' }}>Теги (через запятую)</label>
        <input style={fieldStyle} value={tagsStr} onChange={e => setTagsStr(e.target.value)} placeholder="таухид, акыда, основы" />
      </div>

      <div style={{ marginTop: '12px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        {[
          { key: 'featured', label: 'Рекомендуемая' },
          { key: 'isNew', label: 'Новинка' },
          { key: 'popular', label: 'Популярная' },
        ].map(({ key, label }) => (
          <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
            <input type="checkbox" checked={!!(form as any)[key]} onChange={e => setForm({ ...form, [key]: e.target.checked })} />
            {label}
          </label>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
        <button type="submit" className="btn-primary"><Save size={14} /> Сохранить</button>
        <button type="button" className="btn-ghost" onClick={onCancel}><X size={14} /> Отмена</button>
      </div>
    </form>
  );
}

// ─── Main Admin Page ─────────────────────────────────────────────────────────
export default function AdminPage() {
  const navigate = useNavigate();
  const { books, biographies, audioLessons, fawaid, categories, setBooks, setBiographies, setAudioLessons, setFawaid } = useStore();
  const [unlocked, setUnlocked] = useState(() => localStorage.getItem(PIN_KEY) === '1');
  const [tab, setTab] = useState<Tab>('dashboard');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [localBooks, setLocalBooks] = useState<Book[]>(() => {
    try { return JSON.parse(localStorage.getItem('salaf-admin-books') || 'null') || []; } catch { return []; }
  });

  // Sync local books with store on mount
  useEffect(() => {
    if (localBooks.length > 0 && books.length === 0) {
      setBooks(localBooks);
    }
  }, []);

  const logout = () => {
    localStorage.removeItem(PIN_KEY);
    setUnlocked(false);
  };

  if (!unlocked) return <PinGate onUnlock={() => setUnlocked(true)} />;

  // ─── Books management ────────────────────────────────────────────────────
  const currentBooks = books.length > 0 ? books : localBooks;

  const filteredBooks = useMemo(() => {
    if (!search) return currentBooks;
    const q = search.toLowerCase();
    return currentBooks.filter(b =>
      b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)
    );
  }, [currentBooks, search]);

  const saveLocal = (updatedBooks: Book[]) => {
    setBooks(updatedBooks);
    setLocalBooks(updatedBooks);
    localStorage.setItem('salaf-admin-books', JSON.stringify(updatedBooks));
    toast.success('Сохранено локально');
  };

  const handleAddBook = (data: Partial<Book>) => {
    const id = 'b' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const book: Book = {
      id, title: data.title || '', author: data.author || '',
      category: data.category || 'Общее', language: data.language || 'Русский',
      description: data.description || '', tags: data.tags || [],
      size: data.size, pages: data.pages, year: data.year,
      coverImage: data.coverImage, featured: data.featured, isNew: data.isNew,
      popular: data.popular, rating: 5, downloads: 0, views: 0,
    };
    const updated = [...currentBooks, book];
    saveLocal(updated);
    setShowForm(false);
    toast.success('Книга добавлена');
  };

  const handleEditBook = (data: Partial<Book>) => {
    if (!editingBook) return;
    const updated = currentBooks.map(b => b.id === editingBook.id ? { ...b, ...data } : b);
    saveLocal(updated);
    setEditingBook(null);
    toast.success('Книга обновлена');
  };

  const handleDeleteBook = (book: Book) => {
    if (!confirm(`Удалить "${book.title}"?`)) return;
    const updated = currentBooks.filter(b => b.id !== book.id);
    saveLocal(updated);
    toast.success('Книга удалена');
  };

  const exportJson = (data: any[], filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
    toast.success(`${filename} скачан`);
  };

  const importJson = (callback: (data: any[]) => void) => {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string);
          if (Array.isArray(data)) callback(data);
          else toast.error('Ожидается массив');
        } catch { toast.error('Невалидный JSON'); }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  // ─── Stats ───────────────────────────────────────────────────────────────
  const stats = [
    { label: 'Книг', value: currentBooks.length, icon: BookOpen, color: 'var(--color-gold)' },
    { label: 'Статей', value: 0, icon: Feather, color: '#3b82f6' },
    { label: 'Азкаров', value: 0, icon: Sparkles, color: '#8b5cf6' },
    { label: 'Аудио', value: audioLessons.length, icon: Headphones, color: '#ef4444' },
    { label: 'Фаваидов', value: fawaid.length, icon: Heart, color: '#f472b6' },
    { label: 'Биографий', value: biographies.length, icon: Users, color: '#22c55e' },
  ];

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-text-primary)' }}>Админ-панель</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-ghost" onClick={() => navigate('/')} style={{ fontSize: '12px' }}>
            На сайт
          </button>
          <button className="btn-ghost" onClick={logout} style={{ fontSize: '12px', color: '#ef4444' }}>
            <LogOut size={14} /> Выйти
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="stagger-in" style={{ display: 'flex', gap: '4px', marginBottom: '24px', background: 'var(--color-bg-card)', borderRadius: '12px', padding: '4px', border: '1px solid var(--color-border)', overflowX: 'auto' }}>
        {([
          { id: 'dashboard' as Tab, label: 'Обзор', icon: BarChart3 },
          { id: 'books' as Tab, label: 'Книги', icon: BookOpen },
          { id: 'articles' as Tab, label: 'Статьи', icon: Feather },
          { id: 'azkar' as Tab, label: 'Азкары', icon: Sparkles },
          { id: 'audio' as Tab, label: 'Аудио', icon: Headphones },
          { id: 'fawaid' as Tab, label: 'Фаваиды', icon: Heart },
          { id: 'biographies' as Tab, label: 'Биографии', icon: Users },
        ]).map(t => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); setShowForm(false); setEditingBook(null); }}
            style={{
              flex: '1 1 auto', padding: '10px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              background: tab === t.id ? 'var(--color-gold)' : 'transparent',
              color: tab === t.id ? '#0a1a0f' : 'var(--color-text-secondary)',
              fontWeight: 600, fontSize: '12px', whiteSpace: 'nowrap',
              display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center',
            }}
          >
            <t.icon size={14} />
            <span className="hide-mobile">{t.label}</span>
          </button>
        ))}
      </div>

      {/* ─── Dashboard ──────────────────────────────────────────────────── */}
      {tab === 'dashboard' && (
        <div className="fade-in">
          <div className="stagger-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px', marginBottom: '24px' }}>
            {stats.map(s => (
              <div key={s.label} className="glass-card glow-hover" style={{ padding: '16px', textAlign: 'center', cursor: 'pointer' }}
                onClick={() => { if (s.value > 0) setTab(s.label === 'Книг' ? 'books' : s.label === 'Аудио' ? 'audio' : s.label === 'Биографий' ? 'biographies' : 'fawaid'); }}>
                <s.icon size={24} style={{ color: s.color, margin: '0 auto 8px' }} />
                <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text-primary)' }}>{s.value}</div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div className="stagger-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
            {stats.map(s => (
              <button key={s.label} className="glass-card glow-hover" style={{
                padding: '14px', display: 'flex', alignItems: 'center', gap: '10px',
                border: '1px solid var(--color-border)', background: 'var(--color-bg-card)',
                cursor: 'pointer', textAlign: 'left', borderRadius: '12px',
              }}
                onClick={() => {
                  const tabMap: Record<string, Tab> = { 'Книг': 'books', 'Статей': 'articles', 'Азкаров': 'azkar', 'Аудио': 'audio', 'Фаваидов': 'fawaid', 'Биографий': 'biographies' };
                  setTab(tabMap[s.label] || 'books');
                }}>
                <s.icon size={18} style={{ color: s.color }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>Управление {s.label.toLowerCase()}</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{s.value} записей</div>
                </div>
                <ChevronRight size={14} style={{ color: 'var(--color-text-muted)' }} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ─── Books ──────────────────────────────────────────────────────── */}
      {tab === 'books' && (
        <div className="fade-in">
          {/* Actions bar */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={() => { setShowForm(true); setEditingBook(null); }}>
              <Plus size={14} /> Добавить книгу
            </button>
            <button className="btn-ghost" onClick={() => exportJson(currentBooks, 'books.json')}>
              <Download size={14} /> Экспорт JSON
            </button>
            <button className="btn-ghost" onClick={() => importJson((data) => {
              setBooks(data); setLocalBooks(data);
              localStorage.setItem('salaf-admin-books', JSON.stringify(data));
              toast.success(`Импортировано ${data.length} книг`);
            })}>
              <Upload size={14} /> Импорт JSON
            </button>
          </div>

          {/* Search */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px',
            background: 'var(--color-bg-card)', border: '1px solid var(--color-border)',
            borderRadius: '10px', padding: '8px 14px',
          }}>
            <Search size={15} style={{ color: 'var(--color-text-muted)' }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Поиск по названию или автору..."
              style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--color-text-primary)', fontSize: '14px', width: '100%' }}
            />
          </div>

          {/* Info */}
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertCircle size={12} />
            Чтобы изменения стали постоянными, экспортируйте JSON, замените public/data/books.json, затем npm run build && git push
          </div>

          {/* Book form */}
          {showForm && <div style={{ marginBottom: '16px' }}><BookForm onSave={handleAddBook} onCancel={() => setShowForm(false)} /></div>}
          {editingBook && <div style={{ marginBottom: '16px' }}><BookForm book={editingBook} onSave={handleEditBook} onCancel={() => setEditingBook(null)} /></div>}

          {/* Books list */}
          <div style={{ display: 'grid', gap: '8px' }}>
            {filteredBooks.length === 0 && (
              <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                <BookOpen size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                <p>{search ? 'Ничего не найдено' : 'Нет книг. Добавьте первую!'}</p>
              </div>
            )}
            {filteredBooks.map(book => (
              <div key={book.id} className="glass-card" style={{ padding: '14px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  {/* Cover */}
                  <div style={{
                    width: '48px', height: '64px', borderRadius: '8px', flexShrink: 0,
                    background: book.coverColor || 'var(--color-bg-secondary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px',
                    overflow: 'hidden',
                  }}>
                    {book.coverEmoji || '📖'}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{book.title}</span>
                      {book.featured && <Star size={12} style={{ color: 'var(--color-gold)', fill: 'var(--color-gold)' }} />}
                      {book.isNew && <span style={{ fontSize: '9px', padding: '1px 5px', borderRadius: '4px', background: 'var(--color-accent)', color: '#fff', fontWeight: 700 }}>NEW</span>}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{book.author}</div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                      {book.category} · {book.language}{book.year ? ` · ${book.year}` : ''}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                    <button onClick={() => { setEditingBook(book); setShowForm(false); }} title="Редактировать" style={{
                      padding: '8px', borderRadius: '8px', border: '1px solid var(--color-border)',
                      background: 'var(--color-bg-hover)', color: 'var(--color-text-secondary)', cursor: 'pointer',
                    }}>
                      <Edit3 size={14} />
                    </button>
                    <button onClick={() => handleDeleteBook(book)} title="Удалить" style={{
                      padding: '8px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)',
                      background: 'rgba(239,68,68,0.05)', color: '#ef4444', cursor: 'pointer',
                    }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Stub pages for other content types ─────────────────────────── */}
      {['articles', 'azkar', 'audio', 'fawaid', 'biographies'].includes(tab) && (
        <div className="fade-in">
          <div className="glass-card" style={{ padding: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>
              {tab === 'articles' && '📝'}
              {tab === 'azkar' && '✨'}
              {tab === 'audio' && '🎧'}
              {tab === 'fawaid' && '💎'}
              {tab === 'biographies' && '👤'}
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
              {tab === 'articles' && 'Управление статьями'}
              {tab === 'azkar' && 'Управление азкарами'}
              {tab === 'audio' && 'Управление аудио'}
              {tab === 'fawaid' && 'Управление фаваидами'}
              {tab === 'biographies' && 'Управление биографиями'}
            </h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
              Раздел в разработке. Пока используйте редактирование JSON-файлов напрямую.
            </p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn-ghost" onClick={() => {
                const dataMap: Record<string, { data: any[], file: string }> = {
                  articles: { data: [], file: 'articles.json' },
                  azkar: { data: [], file: 'azkar.json' },
                  audio: { data: audioLessons, file: 'audio.json' },
                  fawaid: { data: fawaid, file: 'fawaid.json' },
                  biographies: { data: biographies, file: 'biographies.json' },
                };
                const { data, file } = dataMap[tab];
                exportJson(data, file);
              }}>
                <Download size={14} /> Экспорт JSON
              </button>
              <button className="btn-ghost" onClick={() => toast('Раздел в разработке')}>
                <Upload size={14} /> Импорт JSON
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
