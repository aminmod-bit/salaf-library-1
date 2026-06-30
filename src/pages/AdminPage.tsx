import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, Users, Headphones, Sparkles, Feather,
  BarChart3, Plus, Edit3, Trash2, Download, Upload,
  LogOut, Save, X, Search, ChevronRight, Star, Clock,
  AlertCircle, FileText, CheckSquare, Square, Check,
  Image, FolderOpen, Package, Eye, Heart, Wand2
} from 'lucide-react';
import { useStore } from '../store/useStore';
import type { Book } from '../store/useStore';
import { analyzePdf, generateCoverFromPdf } from '../utils/pdfAnalysis';
import { saveGeneratedCover, saveBookMetadata, dispatchDataUpdated } from '../utils/cache';
import toast from 'react-hot-toast';

const ADMIN_PIN = '1234';
const PIN_KEY = 'salaf-admin-pin';
const DRAFTS_KEY = 'salaf-admin-drafts';
const LOCAL_BOOKS_KEY = 'salaf-admin-books';

type Tab = 'dashboard' | 'books' | 'drafts' | 'articles' | 'azkar' | 'audio' | 'fawaid' | 'biographies';

const CATEGORIES = [
  'Акыда', 'Таухид', 'Манхадж', 'Тафсир', 'Хадисы', 'Фикх',
  'Сира', 'Биографии', 'Арабский язык', 'Дуа и зикр', 'Фаваиды', 'Общее'
];

const LANGUAGES: { value: string; label: string; code: string }[] = [
  { value: 'Русский', label: 'Русский', code: 'ru' },
  { value: 'English', label: 'English', code: 'en' },
  { value: 'Тоҷикӣ', label: 'Тоҷикӣ', code: 'tg' },
  { value: 'العربية', label: 'العربية', code: 'ar' },
];

// ─── Auto-detect helpers ─────────────────────────────────────────────────────
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'Акыда': ['акыда', 'aqeedah', 'aqida', 'акида', 'таухид', 'tawhid', 'иман', 'вероучение'],
  'Хадисы': ['хадис', 'hadith', 'sahih', 'сахих', 'сунан', 'bukhari', 'муслим', 'навави', 'nawawi'],
  'Фикх': ['фикх', 'fiqh', 'намаз', 'пост', 'закят', 'хадж', 'ramadan', 'рамадан', 'zakat', 'hajj'],
  'Дуа и зикр': ['дуа', 'dua', 'azkar', 'adhkar', 'zikr', 'зикр', 'азкар'],
  'Сира': ['сира', 'seerah', 'пророк', 'prophet', 'мухаммад', 'muhammad'],
  'Арабский язык': ['arabic', 'арабский', 'nahw', 'sarf', 'грамматика'],
  'Тафсир': ['тафсир', 'tafsir', 'толкование', 'коран', 'quran'],
  'Манхадж': ['манхадж', 'manhaj', 'методология', 'сунна', 'sunnah'],
  'Фаваиды': ['fawaid', 'فوائد', 'польза', 'мудрость'],
  'Биографии': ['биография', 'biography', 'учёный', 'имам', 'imam'],
};

function detectCategory(filename: string): string {
  const lower = filename.toLowerCase();
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) return cat;
  }
  return 'Общее';
}

function detectLanguage(filename: string): { value: string; code: string } {
  const lower = filename.toLowerCase();
  if (/араб|arab|العربية/.test(lower)) return { value: 'العربية', code: 'ar' };
  if (/таджик|тоҷик|tajik|tj/.test(lower)) return { value: 'Тоҷикӣ', code: 'tg' };
  if (/англ|english|eng/.test(lower)) return { value: 'English', code: 'en' };
  // Check for cyrillic dominance
  const cyrillicCount = (filename.match(/[а-яёА-ЯЁ]/g) || []).length;
  const latinCount = (filename.match(/[a-zA-Z]/g) || []).length;
  if (cyrillicCount > latinCount) return { value: 'Русский', code: 'ru' };
  return { value: 'English', code: 'en' };
}

function parseAuthorTitle(filename: string): { title: string; author: string } {
  const name = filename.replace(/\.[^.]+$/, '').replace(/[_]+/g, ' ').trim();

  // Pattern: "Author - Title" or "Author — Title"
  const dashMatch = name.match(/^(.+?)\s*[-–—]\s*(.+)$/);
  if (dashMatch) {
    const part1 = dashMatch[1].trim();
    const part2 = dashMatch[2].trim();
    // If first part looks like a name (short, has spaces or known patterns)
    if (part1.length < 50 && (part1.includes(' ') || /ибн|аль|bin|ibn|imam|sheikh|шейх|имам/i.test(part1))) {
      return { author: part1, title: part2 };
    }
    return { title: part1, author: part2 };
  }

  return { title: name, author: 'Автор не указан' };
}

function detectTags(filename: string, category: string): string[] {
  const tags: string[] = [];
  const lower = filename.toLowerCase();
  if (category !== 'Общее') tags.push(category.toLowerCase());
  if (/таухид|tawhid/.test(lower)) tags.push('таухид');
  if (/хадис|hadith/.test(lower)) tags.push('хадисы');
  if (/фикх|fiqh/.test(lower)) tags.push('фикх');
  if (/дуа|dua/.test(lower)) tags.push('дуа');
  if (/коран|quran/.test(lower)) tags.push('коран');
  if (/сира|seerah/.test(lower)) tags.push('сира');
  return [...new Set(tags)];
}

function generateId(): string {
  return 'b' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

const CYRILLIC_MAP: Record<string, string> = {'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'yo','ж':'zh','з':'z','и':'i','й':'y','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f','х':'kh','ц':'ts','ч':'ch','ш':'sh','щ':'sch','ъ':'','ы':'y','ь':'','э':'e','ю':'yu','я':'ya'};

function slugify(text: string): string {
  return text.toLowerCase()
    .replace(/[а-яё]/g, c => CYRILLIC_MAP[c] || c)
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function fileSizeStr(bytes: number): string {
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' КБ';
  return (bytes / (1024 * 1024)).toFixed(1) + ' МБ';
}

function createDraftFromFile(file: File, existingIds: Set<string>): Book {
  const { title, author } = parseAuthorTitle(file.name);
  const category = detectCategory(file.name);
  const lang = detectLanguage(file.name);
  const needsReview = author === 'Автор не указан' || category === 'Общее';

  return {
    id: generateId(),
    title,
    author,
    category,
    language: lang.value,
    languageCode: lang.code as any,
    size: fileSizeStr(file.size),
    description: `Книга «${title}» добавлена в Salaf Library.`,
    tags: detectTags(file.name, category),
    fileUrl: `./books/${slugify(title)}.${file.name.split('.').pop()}`,
    downloadUrl: `./books/${slugify(title)}.${file.name.split('.').pop()}`,
    year: String(new Date().getFullYear()),
    featured: false,
    isNew: true,
    popular: false,
    rating: 5,
    downloads: 0,
    views: 0,
  } as Book;
}

// ─── PIN Gate ────────────────────────────────────────────────────────────────
function PinGate({ onUnlock }: { onUnlock: () => void }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <form onSubmit={e => { e.preventDefault(); if (pin === ADMIN_PIN) { localStorage.setItem(PIN_KEY, '1'); onUnlock(); } else { setError(true); setTimeout(() => setError(false), 1500); } }}
        className="glass-card" style={{ padding: '40px', width: '100%', maxWidth: '360px', textAlign: 'center' }}>
        <div style={{ width: '64px', height: '64px', margin: '0 auto 20px', borderRadius: '16px', background: 'var(--color-bg-hover)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <BookOpen size={28} style={{ color: 'var(--color-gold)' }} />
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '4px' }}>Админ-панель</h2>
        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '24px' }}>Введите PIN для доступа</p>
        <input type="password" value={pin} onChange={e => { setPin(e.target.value); setError(false); }} placeholder="PIN-код" autoFocus
          style={{ width: '100%', padding: '14px', fontSize: '24px', textAlign: 'center', letterSpacing: '8px', background: 'var(--color-bg-card)', border: `2px solid ${error ? '#ef4444' : 'var(--color-border)'}`, borderRadius: '12px', color: 'var(--color-text-primary)', outline: 'none' }} />
        {error && <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '8px' }}>Неверный PIN</p>}
        <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '16px', justifyContent: 'center' }}>Войти</button>
        <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '16px' }}>PIN: 1234. Это локальная админка. Для настоящей защиты нужен backend.</p>
      </form>
    </div>
  );
}

// ─── Book Edit Form ──────────────────────────────────────────────────────────
function BookForm({ book, onSave, onCancel }: { book: Partial<Book>; onSave: (data: Partial<Book>) => void; onCancel: () => void }) {
  const [form, setForm] = useState(book);
  const [tagsStr, setTagsStr] = useState((book.tags || []).join(', '));

  const fieldStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', background: 'var(--color-bg-card)',
    border: '1px solid var(--color-border)', borderRadius: '10px',
    color: 'var(--color-text-primary)', fontSize: '14px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' as const,
  };

  return (
    <form onSubmit={e => { e.preventDefault(); onSave({ ...form, tags: tagsStr.split(',').map(t => t.trim()).filter(Boolean) }); }}
      className="glass-card" style={{ padding: '20px', marginBottom: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)' }}>{book.id ? 'Редактировать' : 'Добавить книгу'}</h3>
        <button type="button" onClick={onCancel} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}><X size={18} /></button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
        <div><label style={labelStyle}>Название *</label><input required style={fieldStyle} value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
        <div><label style={labelStyle}>Автор *</label><input required style={fieldStyle} value={form.author || ''} onChange={e => setForm({ ...form, author: e.target.value })} /></div>
        <div><label style={labelStyle}>Категория</label><select style={fieldStyle} value={form.category || ''} onChange={e => setForm({ ...form, category: e.target.value })}>{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
        <div><label style={labelStyle}>Язык</label><select style={fieldStyle} value={form.language || ''} onChange={e => setForm({ ...form, language: e.target.value })}>{LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}</select></div>
        <div><label style={labelStyle}>Год</label><input style={fieldStyle} value={form.year || ''} onChange={e => setForm({ ...form, year: e.target.value })} /></div>
        <div><label style={labelStyle}>Размер</label><input style={fieldStyle} value={form.size || ''} onChange={e => setForm({ ...form, size: e.target.value })} /></div>
        <div><label style={labelStyle}>Обложка (путь)</label><input style={fieldStyle} value={form.coverImage || ''} onChange={e => setForm({ ...form, coverImage: e.target.value })} placeholder="./covers/name.webp" /></div>
        <div><label style={labelStyle}>fileUrl</label><input style={fieldStyle} value={form.fileUrl || ''} onChange={e => setForm({ ...form, fileUrl: e.target.value })} /></div>
      </div>
      <div style={{ marginTop: '10px' }}><label style={labelStyle}>Описание</label><textarea style={{ ...fieldStyle, minHeight: '60px', resize: 'vertical' }} value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
      <div style={{ marginTop: '10px' }}><label style={labelStyle}>Теги (через запятую)</label><input style={fieldStyle} value={tagsStr} onChange={e => setTagsStr(e.target.value)} /></div>
      <div style={{ marginTop: '10px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        {[{ key: 'featured', label: 'Рекомендуемая' }, { key: 'isNew', label: 'Новинка' }, { key: 'popular', label: 'Популярная' }].map(({ key, label }) => (
          <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
            <input type="checkbox" checked={!!(form as any)[key]} onChange={e => setForm({ ...form, [key]: e.target.checked })} />{label}
          </label>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
        <button type="submit" className="btn-primary"><Save size={14} /> Сохранить</button>
        <button type="button" className="btn-ghost" onClick={onCancel}><X size={14} /> Отмена</button>
      </div>
    </form>
  );
}

const labelStyle: React.CSSProperties = { fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px', display: 'block' };

// ─── Main Admin Page ─────────────────────────────────────────────────────────
export default function AdminPage() {
  const navigate = useNavigate();
  const { books, setBooks, biographies, audioLessons, fawaid } = useStore();
  const [unlocked, setUnlocked] = useState(() => localStorage.getItem(PIN_KEY) === '1');
  const [tab, setTab] = useState<Tab>('dashboard');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  // Local books (for preview on site)
  const [localBooks, setLocalBooks] = useState<Book[]>(() => {
    try { return JSON.parse(localStorage.getItem(LOCAL_BOOKS_KEY) || 'null') || books; } catch { return books; }
  });

  // Drafts (from file picker)
  const [drafts, setDrafts] = useState<Book[]>(() => {
    try { return JSON.parse(localStorage.getItem(DRAFTS_KEY) || '[]'); } catch { return []; }
  });

  // Cover files
  const [coverFiles, setCoverFiles] = useState<Record<string, string>>({});

  // Selection for bulk actions
  const [selectedDrafts, setSelectedDrafts] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<{ type: string; value: string } | null>(null);

  // File input refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  // Persist drafts
  useEffect(() => { localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts)); }, [drafts]);

  // Current books = local override or store
  const currentBooks = localBooks.length > 0 ? localBooks : books;

  const logout = () => { localStorage.removeItem(PIN_KEY); setUnlocked(false); };

  if (!unlocked) return <PinGate onUnlock={() => setUnlocked(true)} />;

  // ─── File handling ──────────────────────────────────────────────────────
  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const existingIds = new Set(drafts.map(d => d.id));
    const newDrafts: Book[] = [];

    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (!['pdf', 'epub', 'txt', 'md', 'html', 'htm', 'docx', 'fb2'].includes(ext || '')) {
        toast.error(`Пропущен: ${file.name} (неподдерживаемый формат)`);
        continue;
      }
      newDrafts.push(createDraftFromFile(file, existingIds));
    }

    if (newDrafts.length > 0) {
      setDrafts(prev => [...prev, ...newDrafts]);
      setTab('drafts');
      toast.success(`Создано ${newDrafts.length} черновиков`);
    }
  };

  const handleCovers = (files: FileList | null) => {
    if (!files) return;
    const newCovers: Record<string, string> = {};
    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (!['webp', 'png', 'jpg', 'jpeg'].includes(ext || '')) continue;
      const name = file.name.replace(/\.[^.]+$/, '').toLowerCase();
      newCovers[name] = URL.createObjectURL(file);
    }
    setCoverFiles(prev => ({ ...prev, ...newCovers }));
    toast.success(`Загружено ${Object.keys(newCovers).length} обложек`);
  };

  // Auto-match covers to drafts
  useEffect(() => {
    if (Object.keys(coverFiles).length === 0) return;
    setDrafts(prev => prev.map(d => {
      const slug = slugify(d.title).toLowerCase();
      const matched = Object.keys(coverFiles).find(k => k.includes(slug) || slug.includes(k));
      if (matched && !d.coverImage) return { ...d, coverImage: coverFiles[matched] };
      return d;
    }));
  }, [coverFiles]);

  // ─── Draft operations ──────────────────────────────────────────────────
  const updateDraft = (id: string, patch: Partial<Book>) => {
    setDrafts(prev => prev.map(d => d.id === id ? { ...d, ...patch } : d));
  };

  const deleteDraft = (id: string) => {
    setDrafts(prev => prev.filter(d => d.id !== id));
    setSelectedDrafts(prev => { const next = new Set(prev); next.delete(id); return next; });
  };

  const publishDraft = (draft: Book) => {
    const updated = [...currentBooks, draft];
    setLocalBooks(updated);
    setBooks(updated);
    localStorage.setItem(LOCAL_BOOKS_KEY, JSON.stringify(updated));
    setDrafts(prev => prev.filter(d => d.id !== draft.id));
    toast.success(`"${draft.title}" добавлена`);
  };

  const publishAll = () => {
    const ready = drafts.filter(d => !d.needsReview);
    if (ready.length === 0) { toast('Нет черновиков без пометки needsReview'); return; }
    const updated = [...currentBooks, ...ready];
    setLocalBooks(updated);
    setBooks(updated);
    localStorage.setItem(LOCAL_BOOKS_KEY, JSON.stringify(updated));
    setDrafts(prev => prev.filter(d => d.needsReview));
    toast.success(`Опубликовано ${ready.length} книг`);
  };

  // ─── Bulk actions ──────────────────────────────────────────────────────
  const toggleSelect = (id: string) => {
    setSelectedDrafts(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelectedDrafts(new Set(drafts.map(d => d.id)));
  const deselectAll = () => setSelectedDrafts(new Set());

  const applyBulk = () => {
    if (!bulkAction || selectedDrafts.size === 0) return;
    setDrafts(prev => prev.map(d => {
      if (!selectedDrafts.has(d.id)) return d;
      if (bulkAction.type === 'category') return { ...d, category: bulkAction.value };
      if (bulkAction.type === 'language') {
        return { ...d, language: bulkAction.value };
      }
      if (bulkAction.type === 'author') return { ...d, author: bulkAction.value };
      if (bulkAction.type === 'tag') return { ...d, tags: [...new Set([...(d.tags || []), bulkAction.value])] };
      return d;
    }));
    setBulkAction(null);
    toast.success('Применено к ' + selectedDrafts.size + ' книгам');
  };

  const deleteSelected = () => {
    if (!confirm(`Удалить ${selectedDrafts.size} черновиков?`)) return;
    setDrafts(prev => prev.filter(d => !selectedDrafts.has(d.id)));
    setSelectedDrafts(new Set());
    toast.success('Удалено');
  };

  // ─── Books operations ──────────────────────────────────────────────────
  const filteredBooks = useMemo(() => {
    if (!search) return currentBooks;
    const q = search.toLowerCase();
    return currentBooks.filter(b => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q));
  }, [currentBooks, search]);

  const saveLocal = () => {
    localStorage.setItem(LOCAL_BOOKS_KEY, JSON.stringify(currentBooks));
    setBooks(currentBooks);
    toast.success('Сохранено локально — книги видны на сайте');
  };

  const clearLocal = () => {
    if (!confirm('Удалить все локальные книги? Сайт снова будет читать books.json')) return;
    localStorage.removeItem(LOCAL_BOOKS_KEY);
    localStorage.removeItem('salaf-admin-drafts');
    setLocalBooks([]);
    toast.success('Локальные книги очищены. Обновите страницу.');
  };

  const exportJson = (data: any[], filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
    toast.success(`${filename} скачан`);
  };

  const importJson = () => {
    importInputRef.current?.click();
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (Array.isArray(data)) {
          setLocalBooks(data);
          setBooks(data);
          localStorage.setItem(LOCAL_BOOKS_KEY, JSON.stringify(data));
          toast.success(`Импортировано ${data.length} книг`);
        }
      } catch { toast.error('Невалидный JSON'); }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleAddBook = (data: Partial<Book>) => {
    const book: Book = { ...data, id: generateId(), rating: 5, downloads: 0, views: 0 } as Book;
    const updated = [...currentBooks, book];
    setLocalBooks(updated);
    setBooks(updated);
    localStorage.setItem(LOCAL_BOOKS_KEY, JSON.stringify(updated));
    setShowForm(false);
    toast.success('Книга добавлена');
  };

  const handleEditBook = (data: Partial<Book>) => {
    if (!editingBook) return;
    const updated = currentBooks.map(b => b.id === editingBook.id ? { ...b, ...data } : b);
    setLocalBooks(updated);
    setBooks(updated);
    localStorage.setItem(LOCAL_BOOKS_KEY, JSON.stringify(updated));
    setEditingBook(null);
    toast.success('Книга обновлена');
  };

  const handleDeleteBook = (book: Book) => {
    if (!confirm(`Удалить "${book.title}"?`)) return;
    const updated = currentBooks.filter(b => b.id !== book.id);
    setLocalBooks(updated);
    setBooks(updated);
    localStorage.setItem(LOCAL_BOOKS_KEY, JSON.stringify(updated));
    toast.success('Книга удалена');
  };

  // ─── Auto-detect metadata from PDF ──────────────────────────────────────
  const autoDetectMetadata = async (bookId: string) => {
    const book = drafts.find(d => d.id === bookId) || currentBooks.find(b => b.id === bookId);
    if (!book?.fileUrl) { toast.error('Нет fileUrl для анализа'); return; }

    toast.loading('Анализ PDF...', { id: 'analyze' });
    try {
      const url = book.fileUrl.startsWith('http') ? book.fileUrl : new URL(book.fileUrl, window.location.origin).toString();
      const analysis = await analyzePdf(url);
      toast.success(`Уверенность: ${analysis.confidence}%`, { id: 'analyze' });

      // Show suggested values as a toast or update draft
      const source = drafts.find(d => d.id === bookId);
      if (source) {
        updateDraft(bookId, {
          title: analysis.suggestedTitle !== 'Без названия' ? analysis.suggestedTitle : source.title,
          author: analysis.suggestedAuthor !== 'Автор не указан' ? analysis.suggestedAuthor : source.author,
          category: analysis.suggestedCategory !== 'Общее' ? analysis.suggestedCategory : source.category,
          language: analysis.suggestedLanguage,
          tags: analysis.suggestedTags.length > 0 ? analysis.suggestedTags : source.tags,
        });
        saveBookMetadata(bookId, {
          title: analysis.suggestedTitle,
          author: analysis.suggestedAuthor,
          publisher: analysis.suggestedPublisher,
          category: analysis.suggestedCategory,
          language: analysis.suggestedLanguage,
          tags: analysis.suggestedTags,
          confidence: analysis.confidence,
        });
        toast.success('Данные обновлены. Проверьте и отредактируйте.');
      }
    } catch (e) {
      toast.error('Не удалось проанализировать PDF', { id: 'analyze' });
    }
  };

  const autoDetectAll = async () => {
    if (drafts.length === 0) { toast.error('Нет черновиков'); return; }
    toast.loading(`Анализ ${drafts.length} книг...`, { id: 'analyze-all' });
    let done = 0;
    for (const draft of drafts) {
      if (!draft.fileUrl) continue;
      try {
        const url = draft.fileUrl.startsWith('http') ? draft.fileUrl : new URL(draft.fileUrl, window.location.origin).toString();
        const analysis = await analyzePdf(url);
        updateDraft(draft.id, {
          title: analysis.suggestedTitle !== 'Без названия' ? analysis.suggestedTitle : draft.title,
          author: analysis.suggestedAuthor !== 'Автор не указан' ? analysis.suggestedAuthor : draft.author,
          category: analysis.suggestedCategory !== 'Общее' ? analysis.suggestedCategory : draft.category,
          language: analysis.suggestedLanguage,
          tags: analysis.suggestedTags.length > 0 ? analysis.suggestedTags : draft.tags,
        });
        done++;
      } catch {}
    }
    toast.success(`Обновлено ${done} из ${drafts.length}`, { id: 'analyze-all' });
  };

  // ─── Auto-cover from PDF ────────────────────────────────────────────────
  const generateCover = async (bookId: string) => {
    const book = drafts.find(d => d.id === bookId) || currentBooks.find(b => b.id === bookId);
    if (!book?.fileUrl) { toast.error('Нет fileUrl'); return; }

    toast.loading('Генерация обложки...', { id: 'cover' });
    try {
      const url = book.fileUrl.startsWith('http') ? book.fileUrl : new URL(book.fileUrl, window.location.origin).toString();
      const dataUrl = await generateCoverFromPdf(url);
      if (dataUrl) {
        const source = drafts.find(d => d.id === bookId);
        if (source) {
          updateDraft(bookId, { coverImage: dataUrl });
          saveGeneratedCover(bookId, dataUrl);
          toast.success('Обложка сгенерирована', { id: 'cover' });
        } else {
          // For published books, update directly
          const updated = currentBooks.map(b => b.id === bookId ? { ...b, coverImage: dataUrl } : b);
          setLocalBooks(updated);
          setBooks(updated);
          localStorage.setItem(LOCAL_BOOKS_KEY, JSON.stringify(updated));
          saveGeneratedCover(bookId, dataUrl);
          toast.success('Обложка сгенерирована', { id: 'cover' });
        }
      } else {
        toast.error('Не удалось сгенерировать обложку', { id: 'cover' });
      }
    } catch {
      toast.error('Ошибка генерации обложки', { id: 'cover' });
    }
  };

  const generateCoversAll = async () => {
    const booksWithoutCover = drafts.filter(d => !d.coverImage && d.fileUrl);
    if (booksWithoutCover.length === 0) { toast.error('Нет книг для генерации обложек'); return; }
    toast.loading(`Генерация ${booksWithoutCover.length} обложек...`, { id: 'covers-all' });
    let done = 0;
    for (const book of booksWithoutCover) {
      try {
        const url = book.fileUrl!.startsWith('http') ? book.fileUrl! : new URL(book.fileUrl!, window.location.origin).toString();
        const dataUrl = await generateCoverFromPdf(url);
        if (dataUrl) {
          updateDraft(book.id, { coverImage: dataUrl });
          done++;
        }
      } catch {}
    }
    toast.success(`Обложки сгенерированы: ${done}/${booksWithoutCover.length}`, { id: 'covers-all' });
  };

  // ─── Stats ──────────────────────────────────────────────────────────────
  const stats = [
    { label: 'Книг', value: currentBooks.length, icon: BookOpen, color: 'var(--color-gold)' },
    { label: 'Черновиков', value: drafts.length, icon: FileText, color: '#3b82f6' },
    { label: 'Аудио', value: audioLessons.length, icon: Headphones, color: '#ef4444' },
    { label: 'Фаваидов', value: fawaid.length, icon: Heart, color: '#f472b6' },
    { label: 'Биографий', value: biographies.length, icon: Users, color: '#22c55e' },
  ];

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Hidden inputs */}
      <input ref={fileInputRef} type="file" multiple accept=".pdf,.epub,.txt,.md,.html,.htm,.docx,.fb2" style={{ display: 'none' }} onChange={e => handleFiles(e.target.files)} />
      <input ref={coverInputRef} type="file" multiple accept=".webp,.png,.jpg,.jpeg" style={{ display: 'none' }} onChange={e => handleCovers(e.target.files)} />
      <input ref={importInputRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleImportJson} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text-primary)' }}>Админ-панель</h1>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button className="btn-ghost" onClick={() => navigate('/')} style={{ fontSize: '12px' }}>На сайт</button>
          <button className="btn-ghost" onClick={logout} style={{ fontSize: '12px', color: '#ef4444' }}><LogOut size={14} /> Выйти</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '3px', marginBottom: '20px', background: 'var(--color-bg-card)', borderRadius: '12px', padding: '3px', border: '1px solid var(--color-border)', overflowX: 'auto' }}>
        {([
          { id: 'dashboard' as Tab, label: 'Обзор', icon: BarChart3 },
          { id: 'books' as Tab, label: `Книги (${currentBooks.length})`, icon: BookOpen },
          { id: 'drafts' as Tab, label: `Черновики (${drafts.length})`, icon: FileText },
          { id: 'audio' as Tab, label: 'Аудио', icon: Headphones },
        ]).map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); setShowForm(false); setEditingBook(null); }}
            style={{ flex: '1 1 auto', padding: '9px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: tab === t.id ? 'var(--color-gold)' : 'transparent', color: tab === t.id ? '#0a1a0f' : 'var(--color-text-secondary)', fontWeight: 600, fontSize: '12px', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '5px', justifyContent: 'center' }}>
            <t.icon size={13} />{t.label}
          </button>
        ))}
      </div>

      {/* ─── Dashboard ──────────────────────────────────────────────────── */}
      {tab === 'dashboard' && (
        <div className="fade-in">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px', marginBottom: '20px' }}>
            {stats.map(s => (
              <div key={s.label} className="glass-card glow-hover" style={{ padding: '14px', textAlign: 'center', cursor: 'pointer' }}
                onClick={() => setTab(s.label === 'Книг' ? 'books' : s.label === 'Черновиков' ? 'drafts' : 'dashboard')}>
                <s.icon size={20} style={{ color: s.color, margin: '0 auto 6px' }} />
                <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-text-primary)' }}>{s.value}</div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Quick actions */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px' }}>
            <button className="glass-card glow-hover" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', textAlign: 'left', border: '1px solid var(--color-border)', background: 'var(--color-bg-card)', borderRadius: '12px' }}
              onClick={() => fileInputRef.current?.click()}>
              <Package size={18} style={{ color: 'var(--color-gold)' }} />
              <div><div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>Добавить файлы</div><div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>PDF, EPUB и др.</div></div>
            </button>
            <button className="glass-card glow-hover" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', textAlign: 'left', border: '1px solid var(--color-border)', background: 'var(--color-bg-card)', borderRadius: '12px' }}
              onClick={() => { setTab('books'); setShowForm(true); setEditingBook(null); }}>
              <Plus size={18} style={{ color: 'var(--color-accent-light)' }} />
              <div><div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>Добавить вручную</div><div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Одна книга</div></div>
            </button>
            <button className="glass-card glow-hover" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', textAlign: 'left', border: '1px solid var(--color-border)', background: 'var(--color-bg-card)', borderRadius: '12px' }}
              onClick={() => setTab('drafts')}>
              <FileText size={18} style={{ color: '#3b82f6' }} />
              <div><div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>Черновики</div><div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{drafts.length} шт.</div></div>
            </button>
            <button className="glass-card glow-hover" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', textAlign: 'left', border: '1px solid var(--color-border)', background: 'var(--color-bg-card)', borderRadius: '12px' }}
              onClick={saveLocal}>
              <Save size={18} style={{ color: 'var(--color-green-light)' }} />
              <div><div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>Сохранить локально</div><div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Видно на сайте</div></div>
            </button>
            <button className="glass-card glow-hover" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', textAlign: 'left', border: '1px solid rgba(239,68,68,0.2)', background: 'var(--color-bg-card)', borderRadius: '12px' }}
              onClick={clearLocal}>
              <Trash2 size={18} style={{ color: '#ef4444' }} />
              <div><div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>Очистить локальные</div><div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Вернуть к books.json</div></div>
            </button>
          </div>
        </div>
      )}

      {/* ─── Books ──────────────────────────────────────────────────────── */}
      {tab === 'books' && (
        <div className="fade-in">
          <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={() => { setShowForm(true); setEditingBook(null); }}><Plus size={14} /> Вручную</button>
            <button className="btn-primary" onClick={() => fileInputRef.current?.click()}><Upload size={14} /> Файлы</button>
            <button className="btn-ghost" onClick={saveLocal}><Save size={14} /> Сохранить локально</button>
            <button className="btn-ghost" onClick={() => exportJson(currentBooks, 'books.json')}><Download size={14} /> Экспорт JSON</button>
            <button className="btn-ghost" onClick={importJson}><Upload size={14} /> Импорт JSON</button>
          </div>

          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <AlertCircle size={11} /> Экспорт → замена public/data/books.json → npm run build → git push
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: '10px', padding: '8px 14px' }}>
            <Search size={14} style={{ color: 'var(--color-text-muted)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск..." style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--color-text-primary)', fontSize: '13px', width: '100%' }} />
          </div>

          {showForm && <BookForm book={{}} onSave={handleAddBook} onCancel={() => setShowForm(false)} />}
          {editingBook && <BookForm book={editingBook} onSave={handleEditBook} onCancel={() => setEditingBook(null)} />}

          <div style={{ display: 'grid', gap: '6px' }}>
            {filteredBooks.length === 0 && <div className="glass-card" style={{ padding: '30px', textAlign: 'center', color: 'var(--color-text-muted)' }}>Нет книг</div>}
            {filteredBooks.map(book => (
              <div key={book.id} className="glass-card" style={{ padding: '12px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <div style={{ width: '40px', height: '54px', borderRadius: '6px', flexShrink: 0, background: book.coverColor || 'var(--color-bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', overflow: 'hidden' }}>{book.coverEmoji || '📖'}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{book.title}</div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>{book.author} · {book.category} · {book.language}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                    <button onClick={() => { setEditingBook(book); setShowForm(false); }} style={{ padding: '6px', borderRadius: '6px', border: '1px solid var(--color-border)', background: 'var(--color-bg-hover)', color: 'var(--color-text-secondary)', cursor: 'pointer' }}><Edit3 size={12} /></button>
                    <button onClick={() => handleDeleteBook(book)} style={{ padding: '6px', borderRadius: '6px', border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.05)', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={12} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Drafts ──────────────────────────────────────────────────────── */}
      {tab === 'drafts' && (
        <div className="fade-in">
          {/* Actions */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={() => fileInputRef.current?.click()}><Upload size={14} /> Добавить файлы</button>
            <button className="btn-primary" onClick={() => coverInputRef.current?.click()}><Image size={14} /> Обложки</button>
            <button className="btn-ghost" onClick={autoDetectAll} disabled={drafts.length === 0}><Wand2 size={14} /> Определить данные</button>
            <button className="btn-ghost" onClick={generateCoversAll} disabled={drafts.filter(d => !d.coverImage && d.fileUrl).length === 0}><Image size={14} /> Генерировать обложки</button>
            <button className="btn-ghost" onClick={publishAll} disabled={drafts.filter(d => !d.needsReview).length === 0}><Package size={14} /> Опубликовать готовые ({drafts.filter(d => !d.needsReview).length})</button>
            <button className="btn-ghost" onClick={() => exportJson(drafts, 'books-drafts.json')}><Download size={14} /> Экспорт</button>
          </div>

          {/* Instructions */}
          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginBottom: '12px', padding: '10px', background: 'var(--color-bg-card)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
            <strong>Как добавить книги:</strong><br/>
            1. Нажмите «Добавить файлы» и выберите PDF/EPUB (можно 5-100 шт.)<br/>
            2. Отредактируйте название, автора, категорию<br/>
            3. Нажмите «Опубликовать готовые» или «Сохранить локально»<br/>
            4. Экспорт → замена public/data/books.json → npm run build<br/>
            <strong>Обложки:</strong> положите в public/covers/ с именем как у книги, нажмите «Обложки»
          </div>

          {/* Bulk actions */}
          {selectedDrafts.size > 0 && (
            <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', padding: '10px', background: 'rgba(212,175,55,0.08)', borderRadius: '8px', border: '1px solid var(--color-border)', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--color-gold)', fontWeight: 600 }}>Выбрано: {selectedDrafts.size}</span>
              <select style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--color-border)', background: 'var(--color-bg-card)', color: 'var(--color-text-primary)', fontSize: '11px' }}
                onChange={e => { if (e.target.value) setBulkAction({ type: 'category', value: e.target.value }); e.target.value = ''; }}>
                <option value="">Категория...</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--color-border)', background: 'var(--color-bg-card)', color: 'var(--color-text-primary)', fontSize: '11px' }}
                onChange={e => { if (e.target.value) setBulkAction({ type: 'language', value: e.target.value }); e.target.value = ''; }}>
                <option value="">Язык...</option>
                {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
              <button className="btn-ghost" onClick={selectAll} style={{ fontSize: '11px', padding: '4px 8px' }}>Все</button>
              <button className="btn-ghost" onClick={deselectAll} style={{ fontSize: '11px', padding: '4px 8px' }}>Снять</button>
              <button className="btn-ghost" onClick={deleteSelected} style={{ fontSize: '11px', padding: '4px 8px', color: '#ef4444' }}>Удалить</button>
              {bulkAction && <button className="btn-primary" onClick={applyBulk} style={{ fontSize: '11px', padding: '4px 8px' }}>Применить</button>}
            </div>
          )}

          {/* Drafts list */}
          <div style={{ display: 'grid', gap: '6px' }}>
            {drafts.length === 0 && (
              <div className="glass-card" style={{ padding: '30px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                <FolderOpen size={28} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                <p>Черновиков нет. Нажмите «Добавить файлы»</p>
              </div>
            )}
            {drafts.map(draft => (
              <div key={draft.id} className="glass-card" style={{
                padding: '12px',
                borderColor: draft.needsReview ? 'rgba(245,158,11,0.3)' : undefined,
              }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button onClick={() => toggleSelect(draft.id)} style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', padding: '2px' }}>
                    {selectedDrafts.has(draft.id) ? <CheckSquare size={16} style={{ color: 'var(--color-gold)' }} /> : <Square size={16} />}
                  </button>
                  <div style={{ width: '36px', height: '48px', borderRadius: '6px', flexShrink: 0, background: draft.coverImage ? `url(${draft.coverImage}) center/cover` : 'var(--color-bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
                    {!draft.coverImage && '📖'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{draft.title}</span>
                      {draft.needsReview && <span style={{ fontSize: '9px', padding: '1px 5px', borderRadius: '4px', background: 'rgba(245,158,11,0.15)', color: '#f59e0b', fontWeight: 600 }}>⚠️</span>}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>{draft.author} · {draft.category} · {draft.language} · {draft.size}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                    <button onClick={() => autoDetectMetadata(draft.id)} title="Определить данные из PDF" style={{ padding: '6px', borderRadius: '6px', border: '1px solid var(--color-border)', background: 'var(--color-bg-hover)', color: 'var(--color-gold)', cursor: 'pointer' }}><Wand2 size={12} /></button>
                    <button onClick={() => generateCover(draft.id)} title="Сгенерировать обложку" style={{ padding: '6px', borderRadius: '6px', border: '1px solid var(--color-border)', background: 'var(--color-bg-hover)', color: 'var(--color-gold)', cursor: 'pointer' }}><Image size={12} /></button>
                    <button onClick={() => publishDraft(draft)} title="Опубликовать" style={{ padding: '6px', borderRadius: '6px', border: '1px solid var(--color-border)', background: 'var(--color-bg-hover)', color: 'var(--color-accent-light)', cursor: 'pointer' }}><Check size={12} /></button>
                    <button onClick={() => { setEditingBook(draft); }} title="Редактировать" style={{ padding: '6px', borderRadius: '6px', border: '1px solid var(--color-border)', background: 'var(--color-bg-hover)', color: 'var(--color-text-secondary)', cursor: 'pointer' }}><Edit3 size={12} /></button>
                    <button onClick={() => deleteDraft(draft.id)} title="Удалить" style={{ padding: '6px', borderRadius: '6px', border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.05)', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={12} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Other tabs (stubs) ─────────────────────────────────────────── */}
      {(['articles', 'azkar', 'audio', 'fawaid', 'biographies'] as Tab[]).includes(tab) && (
        <div className="fade-in">
          <div className="glass-card" style={{ padding: '30px', textAlign: 'center' }}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>
              {tab === 'audio' && '🎧'}{tab === 'articles' && '📝'}{tab === 'azkar' && '✨'}{tab === 'fawaid' && '💎'}{tab === 'biographies' && '👤'}
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '6px' }}>
              {tab === 'audio' && 'Аудио'}{tab === 'articles' && 'Статьи'}{tab === 'azkar' && 'Азкары'}{tab === 'fawaid' && 'Фаваиды'}{tab === 'biographies' && 'Биографии'}
            </h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', marginBottom: '16px' }}>Раздел в разработке. Пока используйте редактирование JSON.</p>
            <button className="btn-ghost" onClick={() => {
              const dataMap: Record<string, any[]> = { audio: audioLessons, fawaid: fawaid, biographies: biographies, articles: [], azkar: [] };
              exportJson(dataMap[tab] || [], `${tab}.json`);
            }}><Download size={14} /> Экспорт JSON</button>
          </div>
        </div>
      )}
    </div>
  );
}
