import { useMemo, useState } from 'react';
import { AlertCircle, CheckCircle, FileText, Loader2, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  commitGitHubFiles,
  fileToBase64,
  getGitHubFile,
  hasGitHubSettings,
  loadGitHubSettings,
  slugifyFileName,
  type GitHubCommitFile,
} from '../../utils/githubApi';
import { extractMetadataFromPdfFile, renderPdfFirstPageImages, type ExtractedPdfMetadata } from '../../utils/pdfMetadata';
import type { Biography, Book } from '../../store/useStore';

interface ImportBook {
  uid: string;
  file: File;
  status: 'queued' | 'analyzing' | 'ready' | 'review' | 'error';
  progress: string;
  title: string;
  originalTitle?: string;
  author: string;
  authorId?: string;
  category: string;
  categoryConfidence: number;
  needsReview: boolean;
  language: string;
  pages?: number;
  size: string;
  createdAt?: string;
  isbn?: string;
  publisher?: string;
  translator?: string;
  editor?: string;
  tags: string[];
  description: string;
  slug: string;
  folder: string;
  cover?: Blob;
  thumb?: Blob;
  error?: string;
}

interface Report {
  imported: number;
  authorsFound: number;
  newAuthors: number;
  categoriesAuto: number;
  needsReview: number;
  covers: number;
}

const CATEGORY_TO_FOLDER: Record<string, string> = {
  'Акыда': 'Aqeedah',
  'Таухид': 'Tawhid',
  'Манхадж': 'Manhaj',
  'Тафсир': 'Tafsir',
  'Хадисы': 'Hadith',
  'Сира': 'Seerah',
  'Фикх': 'Fiqh',
  'Азкары': 'Azkar',
  'Дуа': 'Dua',
  'Биографии': 'Biography',
  'История': 'History',
  'Арабский язык': 'Arabic',
  'Воспитание': 'Tarbiyah',
  'Даава': 'Dawah',
  'Другое': 'Other',
  'Другие разделы': 'Other',
};

const REVIEW_CATEGORIES = Object.keys(CATEGORY_TO_FOLDER);

function cleanTitle(fileName: string) {
  return fileName.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function slugBase(value: string) {
  return slugifyFileName(`${value}.pdf`).replace(/\.pdf$/, '') || 'book';
}

function uid(file: File) {
  return `${file.name}-${file.lastModified}-${file.size}`;
}

function fileSizeMb(file: File) {
  return `${(file.size / 1024 / 1024).toFixed(file.size < 10 * 1024 * 1024 ? 1 : 0)} МБ`;
}

function folderFor(category: string) {
  return CATEGORY_TO_FOLDER[category] || 'Other';
}

function nextAuthorId(authors: Biography[]) {
  const max = authors.reduce((acc, item) => {
    const match = String(item.id || '').match(/a(\d+)/);
    return match ? Math.max(acc, Number(match[1])) : acc;
  }, 0);
  return `a${String(max + 1).padStart(3, '0')}`;
}

function findOrCreateAuthor(authorName: string, authors: Biography[]) {
  const normalized = authorName.trim().toLowerCase();
  if (!normalized || normalized === 'автор не указан') return { authorId: undefined, authors, created: false, found: false };
  const existing = authors.find(author => author.name.toLowerCase() === normalized || (author.nameAr || '').toLowerCase() === normalized);
  if (existing) return { authorId: existing.id, authors, created: false, found: true };
  const author: Biography = {
    id: nextAuthorId(authors),
    name: authorName.trim(),
    type: 'scholar',
    description: `Автор добавлен автоматически при импорте книги.`,
    tags: ['автор'],
    coverColor: '#1a3a2a',
    coverEmoji: '👤',
    featured: false,
  };
  return { authorId: author.id, authors: [...authors, author], created: true, found: false };
}

function createInitialBook(file: File): ImportBook {
  const title = cleanTitle(file.name);
  return {
    uid: uid(file),
    file,
    status: 'queued',
    progress: 'Ожидает анализа',
    title,
    author: 'Автор не указан',
    category: 'Другое',
    categoryConfidence: 0,
    needsReview: true,
    language: 'Русский',
    size: fileSizeMb(file),
    tags: ['другое'],
    description: `Книга «${title}» добавлена в Salaf Library.`,
    slug: slugBase(title),
    folder: 'Other',
  };
}

function applyMetadata(item: ImportBook, meta: ExtractedPdfMetadata): ImportBook {
  const title = meta.title || item.title;
  const author = meta.author || item.author;
  const category = meta.category || item.category;
  const slug = slugBase(title);
  return {
    ...item,
    status: meta.needsReview ? 'review' : 'ready',
    progress: meta.needsReview ? 'Требует проверки' : 'Готово к импорту',
    title,
    originalTitle: meta.originalTitle,
    author,
    category,
    categoryConfidence: meta.categoryConfidence || 0,
    needsReview: Boolean(meta.needsReview),
    language: meta.language || item.language,
    pages: meta.pages,
    size: meta.size || item.size,
    createdAt: meta.createdAt,
    isbn: meta.isbn,
    publisher: meta.publisher,
    translator: meta.translator,
    editor: meta.editor,
    tags: meta.tags?.length ? meta.tags : item.tags,
    description: `Книга «${title}» добавлена в Salaf Library.${author && author !== 'Автор не указан' ? ` Автор: ${author}.` : ''} Раздел: ${category}.`,
    slug,
    folder: folderFor(category),
  };
}

async function blobToBase64(blob: Blob) {
  return fileToBase64(new File([blob], 'blob.webp', { type: blob.type || 'image/webp' }));
}

function chunk<T>(items: T[], size: number) {
  const result: T[][] = [];
  for (let i = 0; i < items.length; i += size) result.push(items.slice(i, i + size));
  return result;
}

export default function AdminImportPage() {
  const [items, setItems] = useState<ImportBook[]>([]);
  const [status, setStatus] = useState<'idle' | 'analyzing' | 'processing' | 'success' | 'error'>('idle');
  const [logs, setLogs] = useState<string[]>([]);
  const [report, setReport] = useState<Report | null>(null);

  const summary = useMemo(() => ({
    total: items.length,
    ready: items.filter(item => item.status === 'ready').length,
    review: items.filter(item => item.needsReview).length,
    covers: items.filter(item => item.cover).length,
  }), [items]);

  const patchItem = (uidValue: string, patch: Partial<ImportBook>) => {
    setItems(prev => prev.map(item => item.uid === uidValue ? { ...item, ...patch } : item));
  };

  const analyzeFiles = async (files: File[]) => {
    const pdfs = files.filter(file => file.name.toLowerCase().endsWith('.pdf'));
    if (!pdfs.length) return;

    const initial = pdfs.map(createInitialBook);
    setItems(prev => [...prev, ...initial]);
    setStatus('analyzing');
    setLogs(prev => [...prev, `Выбрано PDF: ${pdfs.length}`]);

    for (const item of initial) {
      patchItem(item.uid, { status: 'analyzing', progress: 'Анализ первых страниц PDF...' });
      try {
        const knownAuthors: string[] = [];
        const meta = await extractMetadataFromPdfFile(item.file, item.title, knownAuthors);
        let next = applyMetadata(item, meta);
        patchItem(item.uid, next);
        setLogs(prev => [...prev, `✓ ${next.title}: ${next.author}, ${next.category} (${next.categoryConfidence}%)`]);

        try {
          patchItem(item.uid, { progress: 'Создание cover.webp и thumb.webp...' });
          const images = await renderPdfFirstPageImages(item.file);
          patchItem(item.uid, { cover: images.cover, thumb: images.thumb, progress: next.needsReview ? 'Требует проверки' : 'Готово к импорту' });
        } catch {
          patchItem(item.uid, { progress: next.needsReview ? 'Требует проверки; обложка будет fallback' : 'Готово; обложка будет fallback' });
        }
      } catch (error) {
        patchItem(item.uid, { status: 'error', error: error instanceof Error ? error.message : 'Ошибка анализа', progress: 'Ошибка анализа' });
        setLogs(prev => [...prev, `! ${item.file.name}: не удалось проанализировать PDF`]);
      }
    }

    setStatus('idle');
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    analyzeFiles(Array.from(event.dataTransfer.files));
  };

  const handleSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    analyzeFiles(Array.from(event.target.files || []));
    event.target.value = '';
  };

  const updateItem = (index: number, patch: Partial<ImportBook>) => {
    setItems(prev => prev.map((item, i) => {
      if (i !== index) return item;
      const category = patch.category || item.category;
      return { ...item, ...patch, folder: patch.category ? folderFor(category) : item.folder, needsReview: patch.category ? false : item.needsReview };
    }));
  };

  const processImport = async () => {
    if (!items.length) return;
    if (!hasGitHubSettings()) {
      toast.error('Сначала заполните GitHub Token и репозиторий в настройках');
      return;
    }

    setStatus('processing');
    setLogs(prev => [...prev, 'Подключение к GitHub...']);
    const settings = loadGitHubSettings();

    try {
      const existingBooksFile = await getGitHubFile(settings, 'public/data/books.json');
      const existingAuthorsFile = await getGitHubFile(settings, 'public/data/biographies.json');
      const existingBooks: Book[] = existingBooksFile?.content ? JSON.parse(existingBooksFile.content) : [];
      let authors: Biography[] = existingAuthorsFile?.content ? JSON.parse(existingAuthorsFile.content) : [];
      const nextBooks = [...existingBooks];

      let authorsFound = 0;
      let newAuthors = 0;
      let categoriesAuto = 0;
      let needsReview = 0;
      let covers = 0;
      const files: GitHubCommitFile[] = [];

      for (const item of items) {
        const folder = item.folder || folderFor(item.category);
        const pdfPath = `Books/${folder}/${item.slug}.pdf`;
        const coverPath = `Books/${folder}/${item.slug}.cover.webp`;
        const thumbPath = `Books/${folder}/${item.slug}.thumb.webp`;
        const sidecarPath = `Books/${folder}/${item.slug}.json`;
        const publicPdfPath = `./books/${slugifyFileName(folder).replace(/\.[^.]+$/, '')}/${item.slug}.pdf`;

        const authorResult = findOrCreateAuthor(item.author, authors);
        authors = authorResult.authors;
        if (authorResult.found) authorsFound += 1;
        if (authorResult.created) newAuthors += 1;
        if (!item.needsReview) categoriesAuto += 1;
        if (item.needsReview) needsReview += 1;
        if (item.cover) covers += 1;

        const book: Book = {
          id: item.uid.startsWith('b') ? item.uid : `b${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`,
          title: item.title,
          originalTitle: item.originalTitle,
          slug: item.slug,
          author: item.author || 'Автор не указан',
          authorId: authorResult.authorId,
          category: item.category || 'Другое',
          language: item.language,
          pages: item.pages,
          size: item.size,
          description: item.description,
          coverColor: '#1a3a2a',
          coverEmoji: '📖',
          coverImage: item.cover ? `./covers/${slugifyFileName(folder).replace(/\.[^.]+$/, '')}/${item.slug}.cover.webp` : undefined,
          tags: item.tags,
          fileUrl: publicPdfPath,
          downloadUrl: publicPdfPath,
          year: String(new Date().getFullYear()),
          publisher: item.publisher,
          isbn: item.isbn,
          translator: item.translator,
          editor: item.editor,
          sourceFolder: pdfPath,
          needsReview: item.needsReview,
          categoryConfidence: item.categoryConfidence,
          rating: 5,
          downloads: 0,
          views: 0,
          featured: false,
          popular: false,
          isNew: true,
        };

        nextBooks.push(book);
        files.push({ path: pdfPath, contentBase64: await fileToBase64(item.file) });
        if (item.cover) files.push({ path: coverPath, contentBase64: await blobToBase64(item.cover) });
        if (item.thumb) files.push({ path: thumbPath, contentBase64: await blobToBase64(item.thumb) });
        files.push({ path: sidecarPath, contentBase64: btoa(unescape(encodeURIComponent(JSON.stringify(book, null, 2) + '\n'))) });
      }

      files.push({ path: 'public/data/books.json', contentBase64: btoa(unescape(encodeURIComponent(JSON.stringify(nextBooks, null, 2) + '\n'))) });
      files.push({ path: 'public/data/biographies.json', contentBase64: btoa(unescape(encodeURIComponent(JSON.stringify(authors, null, 2) + '\n'))) });
      files.push({ path: 'public/data/search-index.json', contentBase64: btoa(unescape(encodeURIComponent(JSON.stringify({ books: nextBooks.map(book => ({ id: book.id, title: book.title, author: book.author, category: book.category, tags: book.tags })) }, null, 2) + '\n'))) });

      const batches = chunk(files, 35);
      for (let i = 0; i < batches.length; i += 1) {
        setLogs(prev => [...prev, `Коммит batch ${i + 1}/${batches.length}: ${batches[i].length} файлов`]);
        await commitGitHubFiles(settings, batches[i], `Import books batch ${i + 1}/${batches.length}`);
      }

      const finalReport = { imported: items.length, authorsFound, newAuthors, categoriesAuto, needsReview, covers };
      setReport(finalReport);
      setStatus('success');
      setItems([]);
      setLogs(prev => [...prev, `Импортировано: ${finalReport.imported}`, `Авторы найдены: ${finalReport.authorsFound}`, `Новые авторы: ${finalReport.newAuthors}`, `Категории автоматически: ${finalReport.categoriesAuto}`, `Требуют проверки: ${finalReport.needsReview}`]);
      toast.success('Пакетный импорт завершён. Дождитесь GitHub Actions.');
    } catch (error) {
      setStatus('error');
      const message = error instanceof Error ? error.message : 'Ошибка импорта';
      setLogs(prev => [...prev, `Ошибка: ${message}`]);
      toast.error(message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-card" style={{ padding: 26 }}>
        <h1 style={{ color: '#f0f4f1', fontSize: 28, fontWeight: 900, marginBottom: 8 }}>Автоматический импорт книг</h1>
        <p style={{ color: '#9db8a3', lineHeight: 1.7 }}>Выберите PDF-файлы. Система сама прочитает первые страницы, определит название, автора, язык, страницы, категорию, теги, создаст cover.webp/thumb.webp, JSON и отправит всё в правильную папку Books/*.</p>
      </div>

      <div onDragOver={e => e.preventDefault()} onDrop={handleDrop} className="border-2 border-dashed border-slate-700/50 rounded-2xl p-8 text-center hover:border-amber-500/30 transition-colors bg-[#0c2240]/40">
        <Upload size={42} className="text-slate-600 mx-auto mb-4" />
        <p className="text-slate-400 text-sm mb-2">Перетащите PDF файлы сюда — можно пакетно</p>
        <p className="text-slate-600 text-xs mb-4">10 / 50 / 100 / 500 PDF — система обработает очередь автоматически</p>
        <label className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-xl text-sm cursor-pointer hover:bg-amber-500/20 transition-colors">
          <FileText size={16} /> Выбрать PDF
          <input type="file" accept=".pdf" multiple className="hidden" onChange={handleSelect} />
        </label>
      </div>

      {summary.total > 0 && (
        <div className="glass-card" style={{ padding: 18, display: 'grid', gap: 12 }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', color: '#9db8a3' }}>
            <b style={{ color: '#d4af37' }}>Всего: {summary.total}</b>
            <span>Готово: {summary.ready}</span>
            <span>Требуют проверки: {summary.review}</span>
            <span>Обложки: {summary.covers}</span>
          </div>
          <button onClick={processImport} disabled={status === 'processing' || status === 'analyzing'} className="btn-primary" style={{ justifyContent: 'center' }}>
            {status === 'processing' ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />} Импортировать автоматически
          </button>
        </div>
      )}

      {items.length > 0 && (
        <div style={{ display: 'grid', gap: 12 }}>
          {items.map((item, index) => (
            <div key={item.uid} className="glass-card" style={{ padding: 16, borderColor: item.needsReview ? 'rgba(245,158,11,.45)' : undefined }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
                <div><b style={{ color: '#f0f4f1' }}>{item.title}</b><div style={{ color: '#9db8a3', fontSize: 12 }}>{item.file.name} · {item.progress}</div></div>
                <span className={item.needsReview ? 'badge badge-gold' : 'badge badge-green'}>{item.needsReview ? 'Проверить' : 'Авто' } · {item.categoryConfidence}%</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 10 }}>
                <input className="input-field" value={item.title} onChange={e => updateItem(index, { title: e.target.value, slug: slugBase(e.target.value) })} placeholder="Название" />
                <input className="input-field" value={item.author} onChange={e => updateItem(index, { author: e.target.value })} placeholder="Автор" />
                <select className="input-field" value={item.category} onChange={e => updateItem(index, { category: e.target.value })}>{REVIEW_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select>
                <input className="input-field" value={item.language} onChange={e => updateItem(index, { language: e.target.value })} placeholder="Язык" />
              </div>
              <div style={{ marginTop: 10, color: '#5a7a63', fontSize: 12 }}>
                Страниц: {item.pages || '—'} · Размер: {item.size} · ISBN: {item.isbn || '—'} · Издательство: {item.publisher || '—'} · Переводчик: {item.translator || '—'} · Редактор: {item.editor || '—'} · Папка: Books/{item.folder}
              </div>
            </div>
          ))}
        </div>
      )}

      {report && (
        <div className="glass-card" style={{ padding: 18, color: '#9db8a3', display: 'grid', gap: 6 }}>
          <div style={{ color: '#22c55e', fontWeight: 900 }}><CheckCircle size={16} style={{ display: 'inline', marginRight: 6 }} />Отчёт импорта</div>
          <div>✔ Импортировано: {report.imported}</div>
          <div>✔ Авторы найдены: {report.authorsFound}</div>
          <div>✔ Новые авторы: {report.newAuthors}</div>
          <div>✔ Категории определены автоматически: {report.categoriesAuto}</div>
          <div>✔ Требуют проверки: {report.needsReview}</div>
          <div>✔ Обложки созданы: {report.covers}</div>
        </div>
      )}

      {status === 'error' && <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm"><AlertCircle size={18} /> Ошибка импорта</div>}

      {logs.length > 0 && (
        <div className="glass-card" style={{ padding: 16 }}>
          <h3 style={{ color: '#9db8a3', fontSize: 12, textTransform: 'uppercase', marginBottom: 8 }}>Лог</h3>
          <div style={{ display: 'grid', gap: 4, fontFamily: 'monospace', fontSize: 12 }}>{logs.slice(-80).map((log, i) => <p key={i} style={{ color: '#5a7a63' }}>{log}</p>)}</div>
        </div>
      )}
    </div>
  );
}
