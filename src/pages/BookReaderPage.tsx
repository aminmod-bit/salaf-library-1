import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Bookmark, ChevronLeft, ChevronRight, Download, ExternalLink, Maximize2,
  Minus, Plus, Search, PanelLeft, X, Save, ListTree
} from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

type PDFDocumentProxy = pdfjsLib.PDFDocumentProxy;
type PDFPageProxy = pdfjsLib.PDFPageProxy;

interface ReaderBookmark { page: number; note: string; createdAt: string; }
interface OutlineItem { title: string; page?: number; items?: OutlineItem[]; }

function toAbsoluteUrl(url: string) {
  try { return new URL(url, document.baseURI).toString(); } catch { return url; }
}
function storageKey(id?: string) { return `salaf-library-reader:${id || 'unknown'}`; }
function bookmarksKey(id?: string) { return `salaf-library-bookmarks:${id || 'unknown'}`; }
function formatPct(page: number, total: number) { return total ? Math.min(100, Math.round((page / total) * 100)) : 0; }

export default function BookReaderPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { books, addToHistory, saveReadingProgress } = useStore();
  const book = books.find(b => b.id === id);
  const pdfUrl = useMemo(() => book?.fileUrl ? toAbsoluteUrl(book.fileUrl) : '', [book?.fileUrl]);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<pdfjsLib.RenderTask | null>(null);

  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [page, setPage] = useState(1);
  const [pageInput, setPageInput] = useState('1');
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.15);
  const [loading, setLoading] = useState(true);
  const [rendering, setRendering] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [outline, setOutline] = useState<OutlineItem[]>([]);
  const [bookmarks, setBookmarks] = useState<ReaderBookmark[]>([]);
  const [note, setNote] = useState('');
  const [query, setQuery] = useState('');
  const [matches, setMatches] = useState<number[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!book?.fileUrl) return;
    addToHistory({
      id: book.id,
      type: 'book',
      title: book.title,
      subtitle: book.author,
      visitedAt: new Date().toISOString(),
      coverColor: book.coverColor,
      coverEmoji: book.coverEmoji,
      coverImage: book.coverImage,
    });
  }, [addToHistory, book?.author, book?.coverColor, book?.coverEmoji, book?.coverImage, book?.fileUrl, book?.id, book?.title]);

  useEffect(() => {
    if (!id) return;
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey(id)) || '{}');
      if (saved.page) {
        setPage(saved.page);
        setPageInput(String(saved.page));
      }
      if (saved.scale) setScale(saved.scale);
      setBookmarks(JSON.parse(localStorage.getItem(bookmarksKey(id)) || '[]'));
    } catch { /* ignore */ }
  }, [id]);

  useEffect(() => {
    if (!pdfUrl) return;
    let cancelled = false;
    setLoading(true);
    setPdf(null);
    setOutline([]);

    pdfjsLib.getDocument({ url: pdfUrl, withCredentials: false }).promise
      .then(async (doc) => {
        if (cancelled) return;
        setPdf(doc);
        setTotalPages(doc.numPages);
        setPage(prev => Math.min(Math.max(prev, 1), doc.numPages));
        try {
          const raw = await doc.getOutline();
          if (raw) setOutline(await normalizeOutline(doc, raw));
        } catch { /* PDF has no readable outline */ }
      })
      .catch(() => toast.error('Не удалось открыть PDF. Попробуйте открыть в новой вкладке.'))
      .finally(() => !cancelled && setLoading(false));

    return () => { cancelled = true; };
  }, [pdfUrl]);

  useEffect(() => {
    if (!pdf || !canvasRef.current) return;
    let cancelled = false;

    async function render() {
      if (!pdf || !canvasRef.current) return;
      setRendering(true);
      try {
        renderTaskRef.current?.cancel();
        const pdfPage: PDFPageProxy = await pdf.getPage(page);
        if (cancelled) return;
        const viewport = pdfPage.getViewport({ scale });
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = Math.floor(viewport.width * dpr);
        canvas.height = Math.floor(viewport.height * dpr);
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const task = pdfPage.render({ canvas, canvasContext: ctx, viewport });
        renderTaskRef.current = task;
        await task.promise;
      } catch (error) {
        if (!(error instanceof Error && error.name === 'RenderingCancelledException')) console.error(error);
      } finally {
        if (!cancelled) setRendering(false);
      }
    }

    render();
    return () => { cancelled = true; renderTaskRef.current?.cancel(); };
  }, [pdf, page, scale]);

  useEffect(() => {
    setPageInput(String(page));
    if (!id || !book || !totalPages) return;
    localStorage.setItem(storageKey(id), JSON.stringify({ page, scale, updatedAt: new Date().toISOString() }));
    saveReadingProgress({
      bookId: book.id,
      page,
      totalPages,
      lastRead: new Date().toISOString(),
      title: book.title,
      author: book.author,
      coverColor: book.coverColor,
      coverEmoji: book.coverEmoji,
      coverImage: book.coverImage,
    });
  }, [book, id, page, saveReadingProgress, scale, totalPages]);

  const goToPage = (target: number) => setPage(Math.min(Math.max(target, 1), totalPages || 1));
  const fitWidth = async () => {
    if (!pdf || !containerRef.current) return;
    const p = await pdf.getPage(page);
    const viewport = p.getViewport({ scale: 1 });
    const available = Math.max(320, containerRef.current.clientWidth - 40);
    setScale(Math.min(2.6, Math.max(0.55, available / viewport.width)));
  };
  const toggleFullscreen = () => {
    const el = containerRef.current?.parentElement;
    if (!el) return;
    if (!document.fullscreenElement) el.requestFullscreen?.(); else document.exitFullscreen?.();
  };
  const addBookmark = () => {
    const next = [{ page, note: note.trim(), createdAt: new Date().toISOString() }, ...bookmarks.filter(b => b.page !== page)];
    setBookmarks(next);
    localStorage.setItem(bookmarksKey(id), JSON.stringify(next));
    setNote('');
    toast.success(`Закладка на странице ${page} сохранена`);
  };
  const removeBookmark = (target: number) => {
    const next = bookmarks.filter(b => b.page !== target);
    setBookmarks(next);
    localStorage.setItem(bookmarksKey(id), JSON.stringify(next));
  };
  const runSearch = async () => {
    if (!pdf || !query.trim()) return;
    setSearching(true);
    const q = query.toLowerCase();
    const found: number[] = [];
    try {
      for (let i = 1; i <= pdf.numPages; i++) {
        const p = await pdf.getPage(i);
        const content = await p.getTextContent();
        const text = content.items.map((item: any) => item.str || '').join(' ').toLowerCase();
        if (text.includes(q)) found.push(i);
      }
      setMatches(found);
      if (found[0]) goToPage(found[0]);
      toast(found.length ? `Найдено страниц: ${found.length}` : 'Ничего не найдено', { icon: '🔎' });
    } finally { setSearching(false); }
  };

  if (!book) return <ReaderEmpty onBack={() => navigate('/books')} />;
  const progress = formatPct(page, totalPages);

  return (
    <div className="reader-shell fade-in">
      <style>{readerCss}</style>
      <div className="reader-top glass-card">
        <button className="btn-ghost" onClick={() => navigate(-1)}><ArrowLeft size={16} /> Назад</button>
        <div className="reader-title"><strong>{book.title}</strong><span>{book.author}</span></div>
        <div className="reader-actions">
          <button className="btn-ghost" onClick={() => setSidebarOpen(v => !v)}><PanelLeft size={15} /> Панель</button>
          <button className="btn-secondary" onClick={() => window.open(pdfUrl, '_blank', 'noopener,noreferrer')}><ExternalLink size={15} /> Открыть</button>
          <button className="btn-primary" onClick={() => window.open(toAbsoluteUrl(book.downloadUrl || book.fileUrl || ''), '_blank', 'noopener,noreferrer')}><Download size={15} /> PDF</button>
        </div>
      </div>

      <div className="reader-main">
        <aside className={`reader-side glass-card ${sidebarOpen ? 'open' : ''}`}>
          <div className="side-head"><b>Навигация</b><button onClick={() => setSidebarOpen(false)}><X size={16}/></button></div>
          <div className="search-box">
            <Search size={14}/><input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter') runSearch(); }} placeholder="Поиск по PDF" />
            <button onClick={runSearch} disabled={searching}>{searching ? '...' : 'OK'}</button>
          </div>
          {matches.length > 0 && <div className="side-section"><b>Результаты</b>{matches.slice(0, 40).map(p => <button key={p} onClick={()=>goToPage(p)}>Страница {p}</button>)}</div>}
          <div className="side-section"><b><Bookmark size={14}/> Закладки</b>
            <textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="Заметка к странице" />
            <button className="gold-line" onClick={addBookmark}><Save size={14}/> Сохранить страницу {page}</button>
            {bookmarks.map(b => <div className="bookmark-row" key={b.createdAt}><button onClick={()=>goToPage(b.page)}>Стр. {b.page}<span>{b.note || 'Без заметки'}</span></button><button onClick={()=>removeBookmark(b.page)}><X size={12}/></button></div>)}
          </div>
          {outline.length > 0 && <div className="side-section"><b><ListTree size={14}/> Оглавление</b><OutlineList items={outline} goToPage={goToPage}/></div>}
        </aside>

        <section className="reader-stage glass-card">
          <div className="reader-toolbar">
            <button onClick={() => goToPage(page - 1)} disabled={page <= 1}><ChevronLeft size={18}/></button>
            <form onSubmit={e=>{e.preventDefault(); goToPage(Number(pageInput));}}><input value={pageInput} onChange={e=>setPageInput(e.target.value)} /> <span>/ {totalPages || '—'}</span></form>
            <button onClick={() => goToPage(page + 1)} disabled={page >= totalPages}><ChevronRight size={18}/></button>
            <div className="sep" />
            <button onClick={() => setScale(s => Math.max(.45, +(s - .15).toFixed(2)))}><Minus size={16}/></button>
            <span>{Math.round(scale * 100)}%</span>
            <button onClick={() => setScale(s => Math.min(3, +(s + .15).toFixed(2)))}><Plus size={16}/></button>
            <button onClick={fitWidth}>По ширине</button>
            <button onClick={toggleFullscreen}><Maximize2 size={16}/></button>
          </div>
          <div className="progress"><div style={{width:`${progress}%`}}/><span>{progress}% прочитано</span></div>
          <div className="canvas-wrap" ref={containerRef}>
            {loading && <div className="reader-loading">Загрузка PDF...</div>}
            {rendering && <div className="rendering">Рендеринг...</div>}
            <canvas ref={canvasRef} />
          </div>
        </section>
      </div>
    </div>
  );
}

function OutlineList({ items, goToPage }: { items: OutlineItem[]; goToPage: (page: number) => void }) {
  return <>{items.map((item, idx) => <div key={`${item.title}-${idx}`} className="outline-item"><button disabled={!item.page} onClick={() => item.page && goToPage(item.page)}>{item.title}</button>{item.items?.length ? <div className="outline-child"><OutlineList items={item.items} goToPage={goToPage}/></div> : null}</div>)}</>;
}

async function normalizeOutline(doc: PDFDocumentProxy, raw: any[]): Promise<OutlineItem[]> {
  return Promise.all(raw.map(async item => {
    let page: number | undefined;
    try {
      const dest = typeof item.dest === 'string' ? await doc.getDestination(item.dest) : item.dest;
      if (dest?.[0]) {
        const index = await doc.getPageIndex(dest[0]);
        page = index + 1;
      }
    } catch { /* ignore */ }
    return { title: item.title || 'Раздел', page, items: item.items?.length ? await normalizeOutline(doc, item.items) : [] };
  }));
}

function ReaderEmpty({ onBack }: { onBack: () => void }) {
  return <div style={{ textAlign: 'center', padding: '80px', color: '#5a7a63' }}><div style={{ fontSize: '64px', marginBottom: '16px' }}>📕</div><div style={{ fontSize: '20px', fontWeight: 600, color: '#9db8a3' }}>Книга не найдена</div><button className="btn-secondary" style={{ marginTop: '20px' }} onClick={onBack}><ArrowLeft size={16} /> Назад к книгам</button></div>;
}

const readerCss = `
.reader-shell{max-width:1600px;margin:0 auto;height:calc(100vh - 112px);min-height:650px;display:flex;flex-direction:column;gap:14px}.reader-top{padding:14px 16px;display:flex;align-items:center;justify-content:space-between;gap:12px}.reader-title{min-width:0;flex:1}.reader-title strong{display:block;color:#f0f4f1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.reader-title span{font-size:12px;color:#9db8a3}.reader-actions{display:flex;gap:8px;flex-wrap:wrap}.reader-main{display:grid;grid-template-columns:320px 1fr;gap:14px;min-height:0;flex:1}.reader-side{padding:16px;overflow:auto}.side-head{display:flex;justify-content:space-between;align-items:center;color:#f0f4f1;margin-bottom:12px}.side-head button,.reader-toolbar button,.side-section button{border:1px solid rgba(212,175,55,.16);background:rgba(255,255,255,.04);color:#d7e6da;border-radius:10px;padding:8px;cursor:pointer}.search-box{display:flex;gap:6px;align-items:center;background:rgba(255,255,255,.04);border:1px solid rgba(212,175,55,.14);border-radius:12px;padding:8px;margin-bottom:14px}.search-box input{flex:1;min-width:0;background:transparent;border:0;outline:0;color:#f0f4f1}.side-section{display:flex;flex-direction:column;gap:8px;margin:18px 0}.side-section b{display:flex;align-items:center;gap:6px;color:#d4af37;font-size:13px}.side-section textarea{min-height:70px;background:rgba(0,0,0,.18);border:1px solid rgba(212,175,55,.14);color:#f0f4f1;border-radius:12px;padding:10px;resize:vertical}.gold-line{display:flex!important;align-items:center;gap:6px;justify-content:center;color:#d4af37!important}.bookmark-row{display:grid;grid-template-columns:1fr auto;gap:6px}.bookmark-row span{display:block;color:#9db8a3;font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.outline-item button{text-align:left;width:100%;font-size:12px}.outline-child{padding-left:12px;border-left:1px solid rgba(212,175,55,.14);margin-left:8px}.reader-stage{display:flex;flex-direction:column;overflow:hidden}.reader-toolbar{display:flex;align-items:center;justify-content:center;gap:8px;padding:10px;border-bottom:1px solid rgba(212,175,55,.12);flex-wrap:wrap}.reader-toolbar button:disabled{opacity:.4;cursor:not-allowed}.reader-toolbar form{display:flex;align-items:center;gap:6px;color:#9db8a3}.reader-toolbar input{width:58px;background:rgba(255,255,255,.06);border:1px solid rgba(212,175,55,.16);border-radius:9px;color:#f0f4f1;padding:8px;text-align:center}.sep{width:1px;height:24px;background:rgba(212,175,55,.18)}.progress{height:22px;position:relative;background:rgba(255,255,255,.035);overflow:hidden}.progress>div{height:100%;background:linear-gradient(90deg,rgba(212,175,55,.45),rgba(34,197,94,.35))}.progress span{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:11px;color:#f4e4b1}.canvas-wrap{position:relative;flex:1;overflow:auto;text-align:center;padding:22px;background:#0b120d}.canvas-wrap canvas{background:white;box-shadow:0 18px 70px rgba(0,0,0,.55);border-radius:4px;max-width:none}.reader-loading,.rendering{position:absolute;top:18px;left:50%;transform:translateX(-50%);z-index:2;background:rgba(7,19,11,.86);border:1px solid rgba(212,175,55,.22);color:#d4af37;border-radius:999px;padding:8px 14px;font-size:12px}.rendering{top:58px;color:#9db8a3}@media(max-width:900px){.reader-shell{height:calc(100vh - 92px);min-height:560px}.reader-main{grid-template-columns:1fr}.reader-side{display:none;position:fixed;inset:80px 12px 12px;z-index:200}.reader-side.open{display:block}.reader-top{align-items:flex-start}.reader-actions .btn-secondary{display:none}.canvas-wrap{padding:12px}.reader-toolbar{justify-content:flex-start;overflow-x:auto;flex-wrap:nowrap}.reader-toolbar button{white-space:nowrap}.reader-title strong{font-size:14px}}`;
