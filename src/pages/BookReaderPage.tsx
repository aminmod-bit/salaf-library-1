import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Bookmark, BookOpen, ChevronLeft, ChevronRight, Download, ExternalLink,
  Focus, ListTree, Maximize2, Minus, PanelLeft, Plus, Save, Search, X
} from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

type PDFDocumentProxy = pdfjsLib.PDFDocumentProxy;
type PDFPageProxy = pdfjsLib.PDFPageProxy;
type FitMode = 'page' | 'width' | 'custom';
type PanelTab = 'search' | 'bookmarks' | 'toc';

interface ReaderBookmark { page: number; note: string; createdAt: string; }
interface OutlineItem { title: string; page?: number; items?: OutlineItem[]; }

function toAbsoluteUrl(url: string) {
  try { return new URL(url, document.baseURI).toString(); } catch { return url; }
}
function storageKey(id?: string) { return `salaf-library-reader:${id || 'unknown'}`; }
function bookmarksKey(id?: string) { return `salaf-library-bookmarks:${id || 'unknown'}`; }
function clamp(value: number, min: number, max: number) { return Math.min(max, Math.max(min, value)); }
function pct(page: number, total: number) { return total ? Math.min(100, Math.round((page / total) * 100)) : 0; }

export default function BookReaderPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { books, addToHistory, saveReadingProgress } = useStore();
  const book = books.find(b => b.id === id);
  const pdfUrl = useMemo(() => book?.fileUrl ? toAbsoluteUrl(book.fileUrl) : '', [book?.fileUrl]);

  const shellRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<pdfjsLib.RenderTask | null>(null);
  const touchStartX = useRef<number | null>(null);

  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [page, setPage] = useState(1);
  const [pageInput, setPageInput] = useState('1');
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1);
  const [fitMode, setFitMode] = useState<FitMode>('page');
  const [loading, setLoading] = useState(true);
  const [rendering, setRendering] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelTab, setPanelTab] = useState<PanelTab>('bookmarks');
  const [outline, setOutline] = useState<OutlineItem[]>([]);
  const [bookmarks, setBookmarks] = useState<ReaderBookmark[]>([]);
  const [note, setNote] = useState('');
  const [query, setQuery] = useState('');
  const [matches, setMatches] = useState<number[]>([]);
  const [searching, setSearching] = useState(false);
  const [chromeHidden, setChromeHidden] = useState(false);

  const progress = pct(page, totalPages);

  useEffect(() => {
    if (!book?.fileUrl) return;
    addToHistory({
      id: book.id, type: 'book', title: book.title, subtitle: book.author,
      visitedAt: new Date().toISOString(), coverColor: book.coverColor,
      coverEmoji: book.coverEmoji, coverImage: book.coverImage,
    });
  }, [addToHistory, book?.author, book?.coverColor, book?.coverEmoji, book?.coverImage, book?.fileUrl, book?.id, book?.title]);

  useEffect(() => {
    if (!id) return;
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey(id)) || '{}');
      if (saved.page) setPage(saved.page);
      if (saved.scale) setScale(saved.scale);
      if (saved.fitMode) setFitMode(saved.fitMode);
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
      .then(async doc => {
        if (cancelled) return;
        setPdf(doc);
        setTotalPages(doc.numPages);
        setPage(prev => clamp(prev, 1, doc.numPages));
        try {
          const raw = await doc.getOutline();
          if (raw) setOutline(await normalizeOutline(doc, raw));
        } catch { /* no outline */ }
      })
      .catch(() => toast.error('Не удалось открыть PDF. Попробуйте открыть файл в новой вкладке.'))
      .finally(() => !cancelled && setLoading(false));

    return () => { cancelled = true; renderTaskRef.current?.cancel(); };
  }, [pdfUrl]);

  const calculateFitScale = useCallback(async (mode: FitMode, targetPage = page) => {
    if (!pdf || !stageRef.current) return scale;
    const pdfPage = await pdf.getPage(targetPage);
    const viewport = pdfPage.getViewport({ scale: 1 });
    const rect = stageRef.current.getBoundingClientRect();
    const isMobile = window.innerWidth <= 760;
    const horizontalPadding = isMobile ? 24 : panelOpen ? 52 : 72;
    const verticalPadding = isMobile ? 118 : 128;
    const availableWidth = Math.max(280, rect.width - horizontalPadding);
    const availableHeight = Math.max(360, rect.height - verticalPadding);

    if (mode === 'width') return clamp(availableWidth / viewport.width, 0.45, isMobile ? 2.4 : 2.1);
    if (mode === 'page') return clamp(Math.min(availableWidth / viewport.width, availableHeight / viewport.height), 0.42, isMobile ? 1.65 : 1.35);
    return scale;
  }, [pdf, page, panelOpen, scale]);

  const applyFit = useCallback(async (mode: FitMode, targetPage = page) => {
    const next = await calculateFitScale(mode, targetPage);
    setFitMode(mode);
    setScale(next);
  }, [calculateFitScale, page]);

  const goToPage = useCallback((target: number) => {
    setPage(clamp(target, 1, totalPages || 1));
  }, [totalPages]);

  useEffect(() => {
    if (!pdf) return;
    const ro = new ResizeObserver(() => { if (fitMode !== 'custom') applyFit(fitMode); });
    if (stageRef.current) ro.observe(stageRef.current);
    applyFit(fitMode);
    return () => ro.disconnect();
  }, [pdf, fitMode, applyFit]);

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
        const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
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
    localStorage.setItem(storageKey(id), JSON.stringify({ page, scale, fitMode, updatedAt: new Date().toISOString() }));
    saveReadingProgress({
      bookId: book.id, page, totalPages, lastRead: new Date().toISOString(),
      title: book.title, author: book.author, coverColor: book.coverColor,
      coverEmoji: book.coverEmoji, coverImage: book.coverImage,
    });
  }, [book, fitMode, id, page, saveReadingProgress, scale, totalPages]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
      if (event.key === 'ArrowRight' || event.key === 'PageDown') goToPage(page + 1);
      if (event.key === 'ArrowLeft' || event.key === 'PageUp') goToPage(page - 1);
      if (event.key === 'f') applyFit('page');
      if (event.key === 'w') applyFit('width');
      if (event.key === 'Escape') setPanelOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [applyFit, goToPage, page]);

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
    setPanelTab('search');
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

  const toggleFullscreen = () => {
    const el = shellRef.current;
    if (!el) return;
    if (!document.fullscreenElement) el.requestFullscreen?.(); else document.exitFullscreen?.();
  };

  if (!book) return <ReaderEmpty onBack={() => navigate('/books')} />;

  return (
    <div ref={shellRef} className={`reader-app fade-in ${chromeHidden ? 'focus-mode' : ''}`}>
      <style>{readerCss}</style>

      <header className="reader-header">
        <button className="reader-icon-btn" onClick={() => navigate(-1)} aria-label="Назад"><ArrowLeft size={18} /></button>
        <div className="reader-book-meta">
          <strong>{book.title}</strong>
          <span>{book.author}</span>
        </div>
        <div className="reader-header-actions">
          <button className="reader-soft-btn" onClick={() => { setPanelOpen(true); setPanelTab('bookmarks'); }}><Bookmark size={15}/> Закладки</button>
          <button className="reader-soft-btn hide-sm" onClick={() => window.open(pdfUrl, '_blank', 'noopener,noreferrer')}><ExternalLink size={15}/> Открыть</button>
          <button className="reader-gold-btn" onClick={() => window.open(toAbsoluteUrl(book.downloadUrl || book.fileUrl || ''), '_blank', 'noopener,noreferrer')}><Download size={15}/> PDF</button>
        </div>
      </header>

      <div className="reader-body">
        <aside className={`reader-panel ${panelOpen ? 'open' : ''}`}>
          <div className="reader-panel-head">
            <div className="reader-tabs">
              <button className={panelTab === 'bookmarks' ? 'active' : ''} onClick={() => setPanelTab('bookmarks')}><Bookmark size={14}/> Закладки</button>
              <button className={panelTab === 'search' ? 'active' : ''} onClick={() => setPanelTab('search')}><Search size={14}/> Поиск</button>
              <button className={panelTab === 'toc' ? 'active' : ''} onClick={() => setPanelTab('toc')}><ListTree size={14}/> Оглавление</button>
            </div>
            <button className="reader-icon-btn" onClick={() => setPanelOpen(false)}><X size={16}/></button>
          </div>

          {panelTab === 'search' && (
            <div className="panel-section">
              <div className="reader-search-box"><Search size={15}/><input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter') runSearch(); }} placeholder="Поиск по PDF" /><button onClick={runSearch}>{searching ? '...' : 'OK'}</button></div>
              {matches.map(p => <button className="panel-row" key={p} onClick={() => goToPage(p)}>Страница {p}</button>)}
            </div>
          )}

          {panelTab === 'bookmarks' && (
            <div className="panel-section">
              <textarea value={note} onChange={e=>setNote(e.target.value)} placeholder={`Заметка к странице ${page}`} />
              <button className="reader-gold-btn full" onClick={addBookmark}><Save size={14}/> Сохранить страницу {page}</button>
              {bookmarks.length === 0 && <div className="empty-panel">Пока нет закладок</div>}
              {bookmarks.map(b => <div className="bookmark-row" key={b.createdAt}><button onClick={()=>goToPage(b.page)}>Страница {b.page}<span>{b.note || 'Без заметки'}</span></button><button onClick={()=>removeBookmark(b.page)}><X size={12}/></button></div>)}
            </div>
          )}

          {panelTab === 'toc' && (
            <div className="panel-section">
              {outline.length ? <OutlineList items={outline} goToPage={goToPage}/> : <div className="empty-panel">В этом PDF нет встроенного оглавления</div>}
            </div>
          )}
        </aside>

        <main
          className="reader-stage-pro"
          ref={stageRef}
          onDoubleClick={() => applyFit(fitMode === 'page' ? 'width' : 'page')}
          onTouchStart={e => { touchStartX.current = e.touches[0]?.clientX || null; }}
          onTouchEnd={e => {
            if (touchStartX.current == null) return;
            const diff = (e.changedTouches[0]?.clientX || 0) - touchStartX.current;
            if (Math.abs(diff) > 70) goToPage(diff < 0 ? page + 1 : page - 1);
            touchStartX.current = null;
          }}
        >
          <button className="page-zone left" onClick={() => goToPage(page - 1)} aria-label="Предыдущая страница"><ChevronLeft size={28}/></button>
          <button className="page-zone right" onClick={() => goToPage(page + 1)} aria-label="Следующая страница"><ChevronRight size={28}/></button>

          <div className="reader-page-wrap">
            {loading && <div className="reader-pill">Загрузка PDF...</div>}
            {rendering && <div className="reader-pill secondary">Подготовка страницы...</div>}
            <canvas ref={canvasRef} />
          </div>
        </main>
      </div>

      <footer className="reader-bottom-bar">
        <button className="reader-icon-btn" onClick={() => { setPanelOpen(true); setPanelTab('toc'); }}><PanelLeft size={17}/></button>
        <button className="reader-icon-btn" onClick={() => goToPage(page - 1)} disabled={page <= 1}><ChevronLeft size={18}/></button>
        <form className="page-form" onSubmit={e=>{e.preventDefault(); goToPage(Number(pageInput));}}>
          <input value={pageInput} onChange={e=>setPageInput(e.target.value)} />
          <span>/ {totalPages || '—'}</span>
        </form>
        <button className="reader-icon-btn" onClick={() => goToPage(page + 1)} disabled={page >= totalPages}><ChevronRight size={18}/></button>
        <input className="page-slider" type="range" min={1} max={totalPages || 1} value={page} onChange={e=>goToPage(Number(e.target.value))} />
        <span className="progress-label">{progress}%</span>
        <button className={`reader-soft-btn ${fitMode === 'page' ? 'active' : ''}`} onClick={() => applyFit('page')}><BookOpen size={15}/> Страница</button>
        <button className={`reader-soft-btn ${fitMode === 'width' ? 'active' : ''}`} onClick={() => applyFit('width')}>По ширине</button>
        <button className="reader-icon-btn" onClick={() => { setFitMode('custom'); setScale(s => clamp(+(s - .12).toFixed(2), .35, 3)); }}><Minus size={16}/></button>
        <span className="zoom-label">{Math.round(scale * 100)}%</span>
        <button className="reader-icon-btn" onClick={() => { setFitMode('custom'); setScale(s => clamp(+(s + .12).toFixed(2), .35, 3)); }}><Plus size={16}/></button>
        <button className="reader-icon-btn" onClick={() => setChromeHidden(v => !v)}><Focus size={16}/></button>
        <button className="reader-icon-btn" onClick={toggleFullscreen}><Maximize2 size={16}/></button>
      </footer>
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
      if (dest?.[0]) page = (await doc.getPageIndex(dest[0])) + 1;
    } catch { /* ignore */ }
    return { title: item.title || 'Раздел', page, items: item.items?.length ? await normalizeOutline(doc, item.items) : [] };
  }));
}

function ReaderEmpty({ onBack }: { onBack: () => void }) {
  return <div style={{ textAlign: 'center', padding: '80px', color: '#5a7a63' }}><div style={{ fontSize: '64px', marginBottom: '16px' }}>📕</div><div style={{ fontSize: '20px', fontWeight: 600, color: '#9db8a3' }}>Книга не найдена</div><button className="btn-secondary" style={{ marginTop: '20px' }} onClick={onBack}><ArrowLeft size={16} /> Назад к книгам</button></div>;
}

const readerCss = `
.reader-app{height:calc(100vh - 88px);min-height:620px;display:grid;grid-template-rows:auto 1fr auto;background:linear-gradient(180deg,#07130b,#050b07);border:1px solid rgba(212,175,55,.14);border-radius:22px;overflow:hidden;box-shadow:0 24px 80px rgba(0,0,0,.42)}.reader-header{height:62px;display:flex;align-items:center;gap:12px;padding:10px 14px;background:rgba(9,24,16,.94);border-bottom:1px solid rgba(212,175,55,.12);backdrop-filter:blur(18px)}.reader-book-meta{min-width:0;flex:1}.reader-book-meta strong{display:block;color:#f0f4f1;font-weight:850;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.reader-book-meta span{display:block;color:#9db8a3;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.reader-header-actions{display:flex;gap:8px;align-items:center}.reader-icon-btn,.reader-soft-btn,.reader-gold-btn{border:1px solid rgba(212,175,55,.16);background:rgba(255,255,255,.045);color:#d7e6da;border-radius:12px;padding:9px 11px;display:inline-flex;align-items:center;gap:6px;cursor:pointer;font-weight:750}.reader-icon-btn{width:40px;height:40px;justify-content:center;padding:0}.reader-icon-btn:disabled{opacity:.35;cursor:not-allowed}.reader-soft-btn.active{background:rgba(212,175,55,.14);color:#d4af37}.reader-gold-btn{background:linear-gradient(135deg,#d4af37,#f0c84a);color:#07130b;border:0}.reader-gold-btn.full{width:100%;justify-content:center}.reader-body{min-height:0;display:grid;grid-template-columns:0 1fr;transition:grid-template-columns .22s ease}.reader-body:has(.reader-panel.open){grid-template-columns:330px 1fr}.reader-panel{min-width:0;overflow:hidden;background:rgba(9,24,16,.96);border-right:1px solid rgba(212,175,55,.12);display:flex;flex-direction:column}.reader-panel.open{min-width:330px}.reader-panel-head{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:12px;border-bottom:1px solid rgba(212,175,55,.1)}.reader-tabs{display:flex;gap:5px;overflow:auto}.reader-tabs button{border:0;background:transparent;color:#9db8a3;border-radius:10px;padding:8px;display:flex;align-items:center;gap:5px;cursor:pointer;font-size:12px;font-weight:750}.reader-tabs button.active{background:rgba(212,175,55,.12);color:#d4af37}.panel-section{padding:14px;overflow:auto;display:flex;flex-direction:column;gap:10px}.reader-search-box{display:flex;gap:7px;align-items:center;border:1px solid rgba(212,175,55,.14);border-radius:12px;background:rgba(255,255,255,.04);padding:8px}.reader-search-box input{min-width:0;flex:1;background:transparent;border:0;outline:0;color:#f0f4f1}.reader-search-box button,.panel-row{border:1px solid rgba(212,175,55,.16);background:rgba(255,255,255,.04);color:#d4af37;border-radius:10px;padding:8px;cursor:pointer}.panel-section textarea{min-height:90px;background:rgba(255,255,255,.04);border:1px solid rgba(212,175,55,.14);color:#f0f4f1;border-radius:12px;padding:10px;resize:vertical}.empty-panel{padding:18px;text-align:center;color:#5a7a63;border:1px dashed rgba(212,175,55,.16);border-radius:12px}.bookmark-row{display:grid;grid-template-columns:1fr auto;gap:7px}.bookmark-row button{border:1px solid rgba(212,175,55,.14);background:rgba(255,255,255,.035);color:#f0f4f1;border-radius:10px;padding:9px;text-align:left;cursor:pointer}.bookmark-row span{display:block;color:#9db8a3;font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.outline-item button{width:100%;text-align:left;border:1px solid rgba(212,175,55,.12);background:rgba(255,255,255,.03);color:#d7e6da;border-radius:10px;padding:9px;margin-bottom:6px;cursor:pointer}.outline-child{padding-left:12px;border-left:1px solid rgba(212,175,55,.14)}.reader-stage-pro{position:relative;min-width:0;overflow:auto;display:flex;align-items:center;justify-content:center;padding:28px;background:radial-gradient(circle at 50% 10%,rgba(212,175,55,.055),transparent 35%),#0b120d}.reader-page-wrap{position:relative;min-width:min-content}.reader-page-wrap canvas{display:block;background:#fff;border-radius:6px;box-shadow:0 22px 70px rgba(0,0,0,.58)}.reader-pill{position:absolute;left:50%;top:16px;transform:translateX(-50%);z-index:4;border:1px solid rgba(212,175,55,.22);background:rgba(7,19,11,.9);color:#d4af37;border-radius:999px;padding:8px 14px;font-size:12px;white-space:nowrap}.reader-pill.secondary{top:56px;color:#9db8a3}.page-zone{position:fixed;top:50%;transform:translateY(-50%);z-index:3;width:54px;height:92px;border:1px solid rgba(212,175,55,.12);background:rgba(7,19,11,.28);color:rgba(212,175,55,.45);border-radius:18px;display:flex;align-items:center;justify-content:center;cursor:pointer;opacity:.32;transition:.2s}.page-zone:hover{opacity:1;background:rgba(7,19,11,.72)}.page-zone.left{left:calc(260px + 24px)}.page-zone.right{right:24px}.reader-bottom-bar{min-height:66px;display:flex;align-items:center;gap:8px;padding:10px 14px;background:rgba(9,24,16,.96);border-top:1px solid rgba(212,175,55,.12);backdrop-filter:blur(18px)}.page-form{display:flex;align-items:center;gap:6px;color:#9db8a3}.page-form input{width:56px;background:rgba(255,255,255,.06);border:1px solid rgba(212,175,55,.16);border-radius:10px;color:#f0f4f1;padding:8px;text-align:center}.page-slider{flex:1;min-width:90px;accent-color:#d4af37}.progress-label,.zoom-label{font-size:12px;color:#d4af37;font-weight:850;min-width:42px;text-align:center}.focus-mode .reader-header{display:none}.focus-mode{height:calc(100vh - 36px)}@media(max-width:1024px){.page-zone.left{left:18px}.reader-body:has(.reader-panel.open){grid-template-columns:300px 1fr}.reader-panel.open{min-width:300px}}@media(max-width:760px){.reader-app{height:calc(100vh - 78px);border-radius:0;border-left:0;border-right:0}.reader-header{height:auto;align-items:flex-start}.reader-header-actions{gap:5px}.hide-sm{display:none}.reader-soft-btn{font-size:0}.reader-soft-btn svg{margin:0}.reader-body,.reader-body:has(.reader-panel.open){display:block}.reader-panel{display:none}.reader-panel.open{display:flex;position:fixed;z-index:40;inset:86px 10px 76px;min-width:0;border:1px solid rgba(212,175,55,.18);border-radius:18px;box-shadow:0 20px 80px rgba(0,0,0,.55)}.reader-stage-pro{height:100%;padding:12px;align-items:center}.page-zone{display:none}.reader-bottom-bar{overflow-x:auto;gap:6px}.reader-bottom-bar .reader-soft-btn{font-size:12px;white-space:nowrap}.reader-bottom-bar .reader-soft-btn svg{display:none}.zoom-label{display:none}.page-slider{min-width:120px}.reader-page-wrap canvas{border-radius:4px;box-shadow:0 12px 42px rgba(0,0,0,.55)}}`;
