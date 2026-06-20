import { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, Database } from 'lucide-react';
import toast from 'react-hot-toast';
import { getGitHubFile, hasGitHubSettings, loadGitHubSettings, nextContentId, slugifyFileName, upsertBinaryFile, upsertTextFile } from '../../utils/githubApi';
import type { Book } from '../../store/useStore';

interface QueuedBook {
  file: File;
  title: string;
  author: string;
  category: string;
  description: string;
  tags: string;
}

function cleanTitle(fileName: string) {
  return fileName.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function detectCategory(title: string) {
  const value = title.toLowerCase();
  if (/дуа|зикр|мольб/.test(value)) return 'Дуа и зикр';
  if (/хадис|сунн/.test(value)) return 'Хадисы';
  if (/коран|тафсир|сур[аы]/.test(value)) return 'Коран';
  if (/таухид|акыд|основ|правил|ширк|вероубежд/.test(value)) return 'Акыда';
  if (/намаз|пост|рамадан|закят|хадж|фикх|омовен/.test(value)) return 'Фикх';
  if (/сира|пророк|сподвиж/.test(value)) return 'Сира';
  return 'Общее';
}

function fileSizeMb(file: File) {
  return `${(file.size / 1024 / 1024).toFixed(file.size < 10 * 1024 * 1024 ? 1 : 0)} МБ`;
}

export default function AdminImportPage() {
  const [books, setBooks] = useState<QueuedBook[]>([]);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [logs, setLogs] = useState<string[]>([]);

  const appendFiles = (incoming: File[]) => {
    const pdfs = incoming.filter(f => f.name.toLowerCase().endsWith('.pdf'));
    const mapped = pdfs.map((file) => {
      const title = cleanTitle(file.name);
      const category = detectCategory(title);
      return {
        file,
        title,
        author: 'Автор не указан',
        category,
        description: `Книга «${title}» добавлена в Salaf Library.`,
        tags: category.toLowerCase(),
      };
    });
    setBooks(prev => [...prev, ...mapped]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    appendFiles(Array.from(e.dataTransfer.files));
  };

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    appendFiles(Array.from(e.target.files || []));
    e.target.value = '';
  };

  const updateBook = (index: number, patch: Partial<QueuedBook>) => {
    setBooks(prev => prev.map((book, i) => i === index ? { ...book, ...patch } : book));
  };

  const processImport = async () => {
    if (!books.length) return;
    if (!hasGitHubSettings()) {
      toast.error('Сначала заполните GitHub Token и репозиторий в настройках');
      return;
    }

    const settings = loadGitHubSettings();
    setStatus('processing');
    setLogs(['Подключение к GitHub...', `Репозиторий: ${settings.repo}`, `Файлов к публикации: ${books.length}`]);

    try {
      const existingFile = await getGitHubFile(settings, 'public/data/books.json');
      const existingBooks: Book[] = existingFile?.content ? JSON.parse(existingFile.content) : [];
      const nextBooks = [...existingBooks];

      for (let i = 0; i < books.length; i += 1) {
        const item = books[i];
        const safeName = slugifyFileName(item.file.name);
        const publicPath = `public/books/${safeName}`;
        const sitePath = `./books/${safeName}`;

        setLogs(prev => [...prev, `⬆️ Загрузка PDF: ${item.file.name}`]);
        await upsertBinaryFile(settings, publicPath, item.file, `Upload book PDF: ${item.title}`);

        const id = nextContentId(nextBooks, 'b');
        nextBooks.push({
          id,
          title: item.title,
          author: item.author || 'Автор не указан',
          category: item.category || 'Общее',
          language: 'Русский',
          size: fileSizeMb(item.file),
          description: item.description || `Книга «${item.title}» добавлена в Salaf Library.`,
          coverColor: '#1a3a2a',
          coverEmoji: '📖',
          tags: item.tags.split(',').map(tag => tag.trim()).filter(Boolean),
          fileUrl: sitePath,
          downloadUrl: sitePath,
          year: String(new Date().getFullYear()),
          rating: 5,
          downloads: 0,
          views: 0,
          featured: false,
          popular: false,
          isNew: true,
        });

        setLogs(prev => [...prev, `✅ Добавлено в каталог: ${item.title}`]);
      }

      setLogs(prev => [...prev, '📝 Обновление public/data/books.json...']);
      await upsertTextFile(
        settings,
        'public/data/books.json',
        JSON.stringify(nextBooks, null, 2) + '\n',
        `Import ${books.length} book(s) from admin panel`
      );

      setStatus('success');
      setLogs(prev => [...prev, '✅ Импорт завершён. GitHub Actions сейчас опубликует сайт.']);
      toast.success('Книги отправлены в GitHub');
      setBooks([]);
    } catch (error) {
      setStatus('error');
      const message = error instanceof Error ? error.message : 'Ошибка импорта';
      setLogs(prev => [...prev, `❌ ${message}`]);
      toast.error(message);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-white font-bold text-xl flex items-center gap-2">
        <Upload size={20} className="text-amber-400" />
        Импорт книг в GitHub
      </h2>

      <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-100 text-sm flex gap-3">
        <Database size={18} className="text-blue-300 flex-shrink-0 mt-0.5" />
        <div>
          Эта панель загружает PDF прямо в репозиторий через GitHub API и обновляет <b>public/data/books.json</b>.
          Перед импортом заполните токен в разделе <b>Админка → Настройки</b>.
        </div>
      </div>

      <div
        onDragOver={e => e.preventDefault()}
        onDrop={handleDrop}
        className="border-2 border-dashed border-slate-700/50 rounded-2xl p-8 text-center hover:border-amber-500/30 transition-colors bg-[#0c2240]/40"
      >
        <Upload size={40} className="text-slate-600 mx-auto mb-4" />
        <p className="text-slate-400 text-sm mb-2">Перетащите PDF файлы сюда — можно сразу много</p>
        <p className="text-slate-600 text-xs mb-4">или</p>
        <label className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-xl text-sm cursor-pointer hover:bg-amber-500/20 transition-colors">
          <FileText size={16} />
          Выбрать PDF файлы
          <input type="file" accept=".pdf" multiple className="hidden" onChange={handleSelect} />
        </label>
      </div>

      {books.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <p className="text-slate-400 text-sm">{books.length} файлов выбрано</p>
            <button
              onClick={processImport}
              disabled={status === 'processing'}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-xl text-sm font-medium hover:bg-amber-400 transition-colors disabled:opacity-50"
            >
              {status === 'processing' ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
              Опубликовать в GitHub
            </button>
          </div>

          <div className="space-y-3">
            {books.map((book, i) => (
              <div key={`${book.file.name}-${i}`} className="p-4 bg-[#0c2240]/60 rounded-xl border border-slate-700/30 space-y-3">
                <div className="flex items-center gap-3">
                  <FileText size={16} className="text-amber-400" />
                  <span className="text-slate-300 text-sm flex-1 truncate">{book.file.name}</span>
                  <span className="text-slate-600 text-xs">{fileSizeMb(book.file)}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input value={book.title} onChange={e => updateBook(i, { title: e.target.value })} className="bg-[#07182e]/60 border border-slate-700/30 rounded-lg px-3 py-2 text-white text-sm" placeholder="Название" />
                  <input value={book.author} onChange={e => updateBook(i, { author: e.target.value })} className="bg-[#07182e]/60 border border-slate-700/30 rounded-lg px-3 py-2 text-white text-sm" placeholder="Автор" />
                  <input value={book.category} onChange={e => updateBook(i, { category: e.target.value })} className="bg-[#07182e]/60 border border-slate-700/30 rounded-lg px-3 py-2 text-white text-sm" placeholder="Категория" />
                  <input value={book.tags} onChange={e => updateBook(i, { tags: e.target.value })} className="bg-[#07182e]/60 border border-slate-700/30 rounded-lg px-3 py-2 text-white text-sm" placeholder="Теги через запятую" />
                </div>
                <textarea value={book.description} onChange={e => updateBook(i, { description: e.target.value })} className="w-full bg-[#07182e]/60 border border-slate-700/30 rounded-lg px-3 py-2 text-white text-sm min-h-[70px]" placeholder="Описание" />
              </div>
            ))}
          </div>
        </div>
      )}

      {status === 'success' && (
        <div className="flex items-center gap-2 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm">
          <CheckCircle size={18} />
          Импорт завершён успешно. Подождите GitHub Actions.
        </div>
      )}

      {status === 'error' && (
        <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
          <AlertCircle size={18} />
          Ошибка импорта
        </div>
      )}

      {logs.length > 0 && (
        <div className="p-4 bg-[#0c2240]/60 rounded-xl border border-slate-700/30">
          <h3 className="text-slate-400 text-xs font-medium uppercase mb-2">Лог</h3>
          <div className="space-y-1 font-mono text-xs">
            {logs.map((log, i) => (
              <p key={i} className="text-slate-500">{log}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
