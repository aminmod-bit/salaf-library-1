import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BookOpen, Upload, Download, Trash2, Check, X, Edit3,
  Search, Filter, Eye, Star, Clock, AlertCircle, Save,
  FileJson, RefreshCw, ChevronDown, Plus, Undo2
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { Book } from '../../store/useStore';
import { useStore } from '../../store/useStore';

interface DraftBook {
  id: string;
  title: string;
  author: string;
  category: string;
  categoryConfidence: number;
  language: string;
  size: string;
  tags: string[];
  description: string;
  slug: string;
  fileUrl?: string;
  coverImage?: string;
  year?: string;
  needsReview: boolean;
  reviewReason?: string;
  status: string;
  importedAt: string;
  sourceFile: string;
  [key: string]: any;
}

interface TrashItem {
  item: Book;
  removedAt: string;
  type: 'book';
}

const CATEGORIES = [
  'Акыда', 'Таухид', 'Манхадж', 'Тафсир', 'Хадисы', 'Фикх',
  'Сира', 'Биографии', 'Арабский язык', 'Дуа и зикр', 'Фаваиды', 'Общее'
];

const LANGUAGES = ['Русский', 'العربية', 'English', 'Тоҷикӣ', 'Uzbek', 'فارسی'];

export default function AdminContentPage() {
  const { books, setBooks } = useStore();
  const [tab, setTab] = useState<'books' | 'drafts' | 'trash'>('books');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [drafts, setDrafts] = useState<DraftBook[]>([]);
  const [trash, setTrash] = useState<TrashItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Book>>({});
  const [showJsonExport, setShowJsonExport] = useState(false);
  const [jsonExportData, setJsonExportData] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load drafts and trash from localStorage
  useEffect(() => {
    try {
      const savedDrafts = localStorage.getItem('salaf-drafts');
      if (savedDrafts) setDrafts(JSON.parse(savedDrafts));
      const savedTrash = localStorage.getItem('salaf-trash');
      if (savedTrash) setTrash(JSON.parse(savedTrash));
    } catch {}
  }, []);

  // Save drafts and trash
  const saveDrafts = useCallback((d: DraftBook[]) => {
    setDrafts(d);
    localStorage.setItem('salaf-drafts', JSON.stringify(d));
  }, []);

  const saveTrash = useCallback((t: TrashItem[]) => {
    setTrash(t);
    localStorage.setItem('salaf-trash', JSON.stringify(t));
  }, []);

  // Filtered books
  const filteredBooks = useMemo(() => {
    let result = [...books];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(b =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        (b.tags || []).some(t => t.toLowerCase().includes(q))
      );
    }
    if (categoryFilter !== 'all') {
      result = result.filter(b => b.category === categoryFilter);
    }
    return result;
  }, [books, search, categoryFilter]);

  // Edit handlers
  const startEdit = (book: Book) => {
    setEditingId(book.id);
    setEditData({ ...book });
  };

  const saveEdit = () => {
    if (!editingId || !editData) return;
    const updated = books.map(b => b.id === editingId ? { ...b, ...editData } : b);
    setBooks(updated);
    saveBooksJson(updated);
    setEditingId(null);
    setEditData({});
    toast.success('Книга сохранена');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  // Delete (soft)
  const deleteBook = (book: Book) => {
    if (!confirm(`Удалить "${book.title}"?`)) return;
    const updated = books.filter(b => b.id !== book.id);
    setBooks(updated);
    saveBooksJson(updated);
    saveTrash([{ item: book, removedAt: new Date().toISOString(), type: 'book' }, ...trash]);
    toast.success('Книга перемещена в корзину');
  };

  // Restore from trash
  const restoreBook = (item: TrashItem) => {
    const updated = [...books, item.item];
    setBooks(updated);
    saveBooksJson(updated);
    saveTrash(trash.filter(t => t.item.id !== item.item.id));
    toast.success('Книга восстановлена');
  };

  // Permanent delete
  const permanentDelete = (item: TrashItem) => {
    if (!confirm(`Удалить "${item.item.title}" навсегда?`)) return;
    saveTrash(trash.filter(t => t.item.id !== item.item.id));
    toast.success('Книга удалена навсегда');
  };

  // Import JSON
  const importJson = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string);
          if (Array.isArray(data)) {
            setBooks(data);
            saveBooksJson(data);
            toast.success(`Импортировано ${data.length} книг`);
          }
        } catch {
          toast.error('Невалидный JSON');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  // Export JSON
  const exportJson = () => {
    setJsonExportData(JSON.stringify(books, null, 2));
    setShowJsonExport(true);
  };

  // Import drafts from file
  const importDrafts = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string);
          if (Array.isArray(data)) {
            saveDrafts([...drafts, ...data]);
            toast.success(`Импортировано ${data.length} черновиков`);
          }
        } catch {
          toast.error('Невалидный JSON');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  // Publish draft
  const publishDraft = (draft: DraftBook) => {
    const book: Book = {
      id: draft.id,
      title: draft.title,
      author: draft.author,
      category: draft.category,
      language: draft.language,
      size: draft.size,
      tags: draft.tags,
      description: draft.description,
      slug: draft.slug,
      fileUrl: draft.fileUrl,
      coverImage: draft.coverImage,
      year: draft.year,
      rating: 5,
      downloads: 0,
      views: 0,
      featured: false,
      popular: false,
      isNew: true,
    };
    const updated = [...books, book];
    setBooks(updated);
    saveBooksJson(updated);
    saveDrafts(drafts.filter(d => d.id !== draft.id));
    toast.success(`"${draft.title}" опубликована`);
  };

  // Publish all reviewed drafts
  const publishAllReady = () => {
    const ready = drafts.filter(d => !d.needsReview);
    if (ready.length === 0) return toast('Нет черновиков готовых к публикации');

    const newBooks = ready.map(d => ({
      id: d.id, title: d.title, author: d.author, category: d.category,
      language: d.language, size: d.size, tags: d.tags, description: d.description,
      slug: d.slug, fileUrl: d.fileUrl, coverImage: d.coverImage, year: d.year,
      rating: 5, downloads: 0, views: 0, featured: false, popular: false, isNew: true,
    }));

    const updated = [...books, ...newBooks];
    setBooks(updated);
    saveBooksJson(updated);
    saveDrafts(drafts.filter(d => d.needsReview));
    toast.success(`Опубликовано ${ready.length} книг`);
  };

  // Save books.json to clipboard
  const saveBooksJson = (data: Book[]) => {
    // In a static site, we can only save to localStorage and offer download
    localStorage.setItem('salaf-books-data', JSON.stringify(data));
  };

  // Download books.json
  const downloadBooksJson = () => {
    const blob = new Blob([JSON.stringify(books, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'books.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Файл books.json скачан');
  };

  const stats = useMemo(() => ({
    total: books.length,
    featured: books.filter(b => b.featured).length,
    new: books.filter(b => b.isNew).length,
    drafts: drafts.length,
    needsReview: drafts.filter(d => d.needsReview).length,
    trash: trash.length,
  }), [books, drafts, trash]);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div className="glass-card" style={{ padding: '20px 24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text-primary)' }}>Управление контентом</h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', marginTop: '4px' }}>
              {stats.total} книг · {stats.drafts} черновиков · {stats.trash} в корзине
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button className="btn-secondary" onClick={importJson}><Upload size={14} /> Импорт JSON</button>
            <button className="btn-secondary" onClick={exportJson}><FileJson size={14} /> Экспорт JSON</button>
            <button className="btn-secondary" onClick={downloadBooksJson}><Download size={14} /> Скачать books.json</button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '16px', marginTop: '16px', flexWrap: 'wrap' }}>
          {[
            { label: 'Всего', value: stats.total, icon: BookOpen },
            { label: 'Рекомендуемых', value: stats.featured, icon: Star },
            { label: 'Новинок', value: stats.new, icon: Clock },
            { label: 'Черновиков', value: stats.drafts, icon: Edit3 },
            { label: 'Требуют проверки', value: stats.needsReview, icon: AlertCircle },
            { label: 'Корзина', value: stats.trash, icon: Trash2 },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} style={{
              padding: '8px 14px', borderRadius: '10px',
              background: 'var(--color-bg-hover)', border: '1px solid var(--color-border)',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <Icon size={14} style={{ color: 'var(--color-gold)' }} />
              <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>{label}:</span>
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)' }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', background: 'var(--color-bg-card)', borderRadius: '12px', padding: '4px', border: '1px solid var(--color-border)' }}>
        {([
          { id: 'books' as const, label: 'Книги', count: stats.total },
          { id: 'drafts' as const, label: 'Черновики', count: stats.drafts },
          { id: 'trash' as const, label: 'Корзина', count: stats.trash },
        ]).map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              background: tab === t.id ? 'var(--color-gold)' : 'transparent',
              color: tab === t.id ? '#0a1a0f' : 'var(--color-text-secondary)',
              fontWeight: 600, fontSize: '13px', transition: 'all 0.2s',
            }}
          >
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {/* Filters */}
      {tab === 'books' && (
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <div style={{
            flex: 1, minWidth: '200px', display: 'flex', alignItems: 'center', gap: '8px',
            background: 'var(--color-bg-card)', border: '1px solid var(--color-border)',
            borderRadius: '10px', padding: '8px 14px',
          }}>
            <Search size={15} style={{ color: 'var(--color-text-muted)' }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Поиск по названию, автору, тегам..."
              style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--color-text-primary)', fontSize: '14px', width: '100%' }}
            />
          </div>
          <select
            value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
            style={{
              padding: '8px 14px', borderRadius: '10px', border: '1px solid var(--color-border)',
              background: 'var(--color-bg-card)', color: 'var(--color-text-primary)', fontSize: '13px', cursor: 'pointer',
            }}
          >
            <option value="all">Все категории</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      )}

      {/* Books list */}
      {tab === 'books' && (
        <div style={{ display: 'grid', gap: '12px' }}>
          {filteredBooks.length === 0 && (
            <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
              <BookOpen size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
              <p>Нет книг для отображения</p>
            </div>
          )}
          {filteredBooks.map(book => (
            <div key={book.id} className="glass-card" style={{ padding: '16px' }}>
              {editingId === book.id ? (
                /* Edit mode */
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '12px' }}>
                    <input className="input-field" value={editData.title || ''} onChange={e => setEditData({ ...editData, title: e.target.value })} placeholder="Название" />
                    <input className="input-field" value={editData.author || ''} onChange={e => setEditData({ ...editData, author: e.target.value })} placeholder="Автор" />
                    <select className="input-field" value={editData.category || ''} onChange={e => setEditData({ ...editData, category: e.target.value })}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select className="input-field" value={editData.language || ''} onChange={e => setEditData({ ...editData, language: e.target.value })}>
                      {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                    <input className="input-field" value={editData.year || ''} onChange={e => setEditData({ ...editData, year: e.target.value })} placeholder="Год" />
                    <input className="input-field" value={editData.size || ''} onChange={e => setEditData({ ...editData, size: e.target.value })} placeholder="Размер" />
                  </div>
                  <textarea className="input-field" value={editData.description || ''} onChange={e => setEditData({ ...editData, description: e.target.value })} placeholder="Описание" rows={3} style={{ marginBottom: '10px', resize: 'vertical' }} />
                  <input className="input-field" value={(editData.tags || []).join(', ')} onChange={e => setEditData({ ...editData, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })} placeholder="Теги через запятую" style={{ marginBottom: '10px' }} />
                  <input className="input-field" value={editData.coverImage || ''} onChange={e => setEditData({ ...editData, coverImage: e.target.value })} placeholder="Путь к обложке (./covers/name.webp)" style={{ marginBottom: '10px' }} />
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
                      <input type="checkbox" checked={editData.featured || false} onChange={e => setEditData({ ...editData, featured: e.target.checked })} /> Рекомендуемая
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
                      <input type="checkbox" checked={editData.isNew || false} onChange={e => setEditData({ ...editData, isNew: e.target.checked })} /> Новинка
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
                      <input type="checkbox" checked={(editData as any).popular || false} onChange={e => setEditData({ ...editData, popular: e.target.checked } as any)} /> Популярная
                    </label>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn-primary" onClick={saveEdit}><Save size={14} /> Сохранить</button>
                    <button className="btn-ghost" onClick={cancelEdit}><X size={14} /> Отмена</button>
                  </div>
                </div>
              ) : (
                /* View mode */
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  {/* Cover preview */}
                  <div style={{
                    width: '60px', height: '80px', borderRadius: '8px', flexShrink: 0,
                    background: book.coverColor || 'var(--color-bg-secondary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '24px', overflow: 'hidden',
                  }}>
                    {book.coverEmoji || '📖'}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary)' }}>{book.title}</h3>
                      {book.featured && <span className="badge badge-gold">★</span>}
                      {book.isNew && <span className="badge badge-green">NEW</span>}
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>{book.author}</p>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', fontSize: '11px', color: 'var(--color-text-muted)' }}>
                      <span>{book.category}</span>
                      <span>·</span>
                      <span>{book.language}</span>
                      {book.year && <><span>·</span><span>{book.year}</span></>}
                      {book.size && <><span>·</span><span>{book.size}</span></>}
                    </div>
                    {book.tags && book.tags.length > 0 && (
                      <div style={{ display: 'flex', gap: '4px', marginTop: '6px', flexWrap: 'wrap' }}>
                        {book.tags.slice(0, 5).map(tag => (
                          <span key={tag} style={{
                            padding: '2px 8px', borderRadius: '100px', fontSize: '10px',
                            background: 'var(--color-bg-hover)', color: 'var(--color-text-muted)',
                            border: '1px solid var(--color-border)',
                          }}>{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                    <button onClick={() => startEdit(book)} title="Редактировать" style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-bg-hover)', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
                      <Edit3 size={14} />
                    </button>
                    <button onClick={() => deleteBook(book)} title="Удалить" style={{ padding: '8px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.05)', color: '#ef4444', cursor: 'pointer' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Drafts */}
      {tab === 'drafts' && (
        <div>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <button className="btn-primary" onClick={publishAllReady} disabled={drafts.filter(d => !d.needsReview).length === 0}>
              <Upload size={14} /> Опубликовать готовые ({drafts.filter(d => !d.needsReview).length})
            </button>
            <button className="btn-ghost" onClick={importDrafts}><Upload size={14} /> Импорт черновиков</button>
          </div>

          {drafts.length === 0 ? (
            <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
              <FileJson size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
              <p>Черновиков нет. Запустите <code>npm run content:scan</code></p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '12px' }}>
              {drafts.map(draft => (
                <div key={draft.id} className="glass-card" style={{
                  padding: '16px',
                  borderColor: draft.needsReview ? 'rgba(245,158,11,0.4)' : undefined,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary)' }}>{draft.title}</h3>
                        {draft.needsReview && <span className="badge badge-gold">⚠️ Проверить</span>}
                        {!draft.needsReview && <span className="badge badge-green">✅ Готово</span>}
                      </div>
                      <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>{draft.author} · {draft.category} · {draft.language}</p>
                      {draft.reviewReason && <p style={{ fontSize: '12px', color: 'var(--color-gold)', marginTop: '4px' }}>{draft.reviewReason}</p>}
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="btn-primary" onClick={() => publishDraft(draft)} style={{ padding: '8px 14px', fontSize: '12px' }}>
                        <Upload size={12} /> Опубликовать
                      </button>
                      <button onClick={() => saveDrafts(drafts.filter(d => d.id !== draft.id))} style={{ padding: '8px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.05)', color: '#ef4444', cursor: 'pointer' }}>
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Trash */}
      {tab === 'trash' && (
        <div>
          {trash.length === 0 ? (
            <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
              <Trash2 size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
              <p>Корзина пуста</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '12px' }}>
              {trash.map(item => (
                <div key={item.item.id} className="glass-card" style={{ padding: '16px', opacity: 0.7 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{item.item.title}</h3>
                      <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Удалена: {new Date(item.removedAt).toLocaleDateString('ru')}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="btn-secondary" onClick={() => restoreBook(item)} style={{ padding: '8px 14px', fontSize: '12px' }}>
                        <Undo2 size={12} /> Восстановить
                      </button>
                      <button onClick={() => permanentDelete(item)} style={{ padding: '8px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.1)', color: '#ef4444', cursor: 'pointer' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* JSON Export Modal */}
      {showJsonExport && (
        <div className="modal-overlay" onClick={() => setShowJsonExport(false)}>
          <div className="glass-card" style={{ padding: '24px', maxWidth: '700px', width: '100%', maxHeight: '80vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)' }}>Экспорт books.json</h2>
              <button onClick={() => setShowJsonExport(false)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <textarea
              readOnly
              value={jsonExportData}
              style={{
                width: '100%', height: '400px', fontFamily: 'monospace', fontSize: '12px',
                background: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border)', borderRadius: '8px', padding: '12px',
                resize: 'vertical',
              }}
            />
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <button className="btn-primary" onClick={() => { navigator.clipboard.writeText(jsonExportData); toast.success('Скопировано в буфер'); }}>
                Копировать
              </button>
              <button className="btn-secondary" onClick={() => {
                const blob = new Blob([jsonExportData], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a'); a.href = url; a.download = 'books.json'; a.click();
                URL.revokeObjectURL(url);
              }}>
                <Download size={14} /> Скачать
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
