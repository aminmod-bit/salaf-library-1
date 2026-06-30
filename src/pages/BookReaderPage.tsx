import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Bookmark, BookOpen, ChevronLeft, ChevronRight, Download, ExternalLink,
  Focus, ListTree, Maximize2, Minus, PanelLeft, Plus, Save, Search, X, Settings, Moon, Sun
} from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

type PDFDocumentProxy = pdfjsLib.PDFDocumentProxy;
type FitMode = 'page' | 'width' | 'custom';
type PanelTab = 'search' | 'bookmarks' | 'toc' | 'settings';
type ReaderTheme = 'dark' | 'light' | 'sepia';

interface BookmarkItem { page: number; note: string; createdAt: string; }
interface OutlineItem { title: string; page?: number; items?: OutlineItem[]; }

function toAbsoluteUrl(url: string) {
  try { return new URL(url, document.baseURI).toString(); } catch { return url; }
}
function storageKey(id?: string) { return `sr:pos:${id}`; }
function bookmarksKey(id?: string) { return `sr:bm:${id}`; }
function settingsKey(id?: string) { return `sr:cfg:${id}`; }
function clamp(v: number, min: number, max: number) { return Math.min(max, Math.max(min, v)); }

const THEME_BG: Record<ReaderTheme, string> = { dark: '#111111', light: '#f5f0e8', sepia: '#f4ecd8' };
const THEME_TEXT: Record<ReaderTheme, string> = { dark: '#e0e0e0', light: '#1a1a1a', sepia: '#3d3422' };
const THEME_PANEL: Record<ReaderTheme, string> = { dark: '#1a1a1a', light: '#ffffff', sepia: '#efe8d8' };
const THEME_BORDER: Record<ReaderTheme, string> = { dark: '#333', light: '#ddd', sepia: '#d4c9a8' };

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
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [note, setNote] = useState('');
  const [query, setQuery] = useState('');
  const [matches, setMatches] = useState<number[]>([]);
  const [searching, setSearching] = useState(false);
  const [chromeHidden, setChromeHidden] = useState(false);
  const [twoPages, setTwoPages] = useState(() => window.innerWidth > 900);
  const [readerTheme, setReaderTheme] = useState<ReaderTheme>(() => {
    try { return (JSON.parse(localStorage.getItem(settingsKey(id)) || '{}').theme) || 'dark'; } catch { return 'dark'; }
  });
  const [fontSize, setFontSize] = useState(() => {
    try { return (JSON.parse(localStorage.getItem(settingsKey(id)) || '{}').fontSize) || 18; } catch { return 18; }
  });
  const [loadError, setLoadError] = useState<string | null>(null);

  const progress = totalPages ? Math.min(100, Math.round((page / totalPages) * 100)) : 0;
  const bg = THEME_BG[readerTheme];
  const textColor = THEME_TEXT[readerTheme];

  // Save settings
  useEffect(() => {
    localStorage.setItem(settingsKey(id), JSON.stringify({ theme: readerTheme, fontSize }));
  }, [id, readerTheme, fontSize]);

  // Load saved state
  useEffect(() => {
    if (!id) return;
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey(id)) || '{}');
      if (saved.page) setPage(saved.page);
      if (saved.scale) setScale(saved.scale);
      if (saved.fitMode) setFitMode(saved.fitMode);
      setBookmarks(JSON.parse(localStorage.getItem(bookmarksKey(id)) || '[]'));
    } catch {}
  }, [id]);

  // History
  useEffect(() => {
    if (!book?.fileUrl) return;
    addToHistory({
      id: book.id, type: 'book', title: book.title, subtitle: book.author,
      visitedAt: new Date().toISOString(), coverColor: book.coverColor,
      coverEmoji: book.coverEmoji, coverImage: book.coverImage,
    });
  }, [addToHistory, book]);

  // Load PDF
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
        setLoadError(null);
        setPage(prev => clamp(prev, 1, doc.numPages));
        try {
          const raw = await doc.getOutline();
          if (raw) setOutline(await normalizeOutline(doc, raw));
        } catch {}
      })
      .catch((err) => {
        const msg = err?.message || '';
        if (msg.includes('CORS') || msg.includes('network') || msg.includes('Failed to fetch')) {
          setLoadError('cors');
        } else {
          setLoadError('load');
        }
        toast.error('Не удалось открыть PDF');
      })
      .finally(() => !cancelled && setLoading(false));

    return () => { cancelled = true; renderTaskRef.current?.cancel(); };
  }, [pdfUrl]);

  // Fit scale
  const calculateFitScale = useCallback(async (mode: FitMode, targetPage = page) => {
    if (!pdf || !stageRef.current) return scale;
    const pdfPage = await pdf.getPage(targetPage);
    const viewport = pdfPage.getViewport({ scale: 1 });
    const rect = stageRef.current.getBoundingClientRect();
    const isMobile = window.innerWidth <= 760;
    const horizontalPadding = isMobile ? 24 : panelOpen ? 52 : 72;
    const verticalPadding = isMobile ? 118 : 128;
    const cols = twoPages && !isMobile ? 2 : 1;
    const availableWidth = Math.max(280, (rect.width - horizontalPadding) / cols);
    const availableHeight = Math.max(360, rect.height - verticalPadding);

    if (mode === 'width') return clamp(availableWidth / viewport.width, 0.45, isMobile ? 2.4 : 2.1);
    if (mode === 'page') return clamp(Math.min(availableWidth / viewport.width, availableHeight / viewport.height), 0.42, isMobile ? 1.65 : 1.35);
    return scale;
  }, [pdf, page, panelOpen, scale, twoPages]);

  const applyFit = useCallback(async (mode: FitMode, targetPage = page) => {
    const next = await calculateFitScale(mode, targetPage);
    setFitMode(mode);
    setScale(next);
  }, [calculateFitScale, page]);

  const goToPage = useCallback((target: number) => {
    setPage(clamp(target, 1, totalPages || 1));
  }, [totalPages]);

  // Resize observer
  useEffect(() => {
    if (!pdf) return;
    const ro = new ResizeObserver(() => { if (fitMode !== 'custom') applyFit(fitMode); });
    if (stageRef.current) ro.observe(stageRef.current);
    applyFit(fitMode);
    return () => ro.disconnect();
  }, [pdf, fitMode, applyFit, twoPages]);

  // Render page(s)
  useEffect(() => {
    if (!pdf || !canvasRef.current) return;
    let cancelled = false;

    async function render() {
      if (!pdf || !canvasRef.current) return;
      setRendering(true);
      try {
        renderTaskRef.current?.cancel();
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
        const pagesToRender = twoPages ? [page, page + 1].filter(p => p <= totalPages) : [page];

        let totalWidth = 0;
        let maxHeight = 0;
        const pageData: { canvas: HTMLCanvasElement; width: number; height: number }[] = [];

        for (const p of pagesToRender) {
          const pdfPage = await pdf.getPage(p);
          if (cancelled) return;
          const viewport = pdfPage.getViewport({ scale });
          totalWidth += viewport.width;
          if (viewport.height > maxHeight) maxHeight = viewport.height;
          pageData.push({ canvas: document.createElement('canvas'), width: viewport.width, height: viewport.height });
        }

        const gap = pagesToRender.length > 1 ? 16 : 0;
        canvas.width = Math.floor((totalWidth + gap) * dpr);
        canvas.height = Math.floor(maxHeight * dpr);
        canvas.style.width = `${totalWidth + gap}px`;
        canvas.style.height = `${maxHeight}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        let offsetX = 0;
        for (let i = 0; i < pagesToRender.length; i++) {
          const pdfPage = await pdf.getPage(pagesToRender[i]);
          if (cancelled) return;
          const viewport = pdfPage.getViewport({ scale });
          const tmpCanvas = pageData[i].canvas;
          tmpCanvas.width = Math.floor(viewport.width * dpr);
          tmpCanvas.height = Math.floor(viewport.height * dpr);
          const tmpCtx = tmpCanvas.getContext('2d');
          if (!tmpCtx) continue;
          tmpCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
          const task = pdfPage.render({ canvas: tmpCanvas, canvasContext: tmpCtx, viewport });
          renderTaskRef.current = task;
          await task.promise;
          ctx.drawImage(tmpCanvas, offsetX, 0, viewport.width, viewport.height);
          offsetX += viewport.width + gap;
        }
      } catch (error) {
        if (!(error instanceof Error && error.name === 'RenderingCancelledException')) console.error(error);
      } finally {
        if (!cancelled) setRendering(false);
      }
    }

    render();
    return () => { cancelled = true; renderTaskRef.current?.cancel(); };
  }, [pdf, page, scale, twoPages, totalPages]);

  // Save progress
  useEffect(() => {
    setPageInput(String(page));
    if (!id || !book || !totalPages) return;
    localStorage.setItem(storageKey(id), JSON.stringify({ page, scale, fitMode }));
    saveReadingProgress({
      bookId: book.id, page, totalPages, lastRead: new Date().toISOString(),
      title: book.title, author: book.author, coverColor: book.coverColor,
      coverEmoji: book.coverEmoji, coverImage: book.coverImage,
    });
  }, [book, fitMode, id, page, saveReadingProgress, scale, totalPages]);

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') goToPage(page + (twoPages ? 2 : 1));
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') goToPage(page - (twoPages ? 2 : 1));
      if (e.key === 'f') applyFit('page');
      if (e.key === 'w') applyFit('width');
      if (e.key === 'Escape') setPanelOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [applyFit, goToPage, page, twoPages]);

  // Bookmarks
  const addBookmark = () => {
    const next = [{ page, note: note.trim(), createdAt: new Date().toISOString() }, ...bookmarks.filter(b => b.page !== page)];
    setBookmarks(next);
    localStorage.setItem(bookmarksKey(id), JSON.stringify(next));
    setNote('');
    toast.success(`Закладка: стр. ${page}`);
  };

  const removeBookmark = (target: number) => {
    const next = bookmarks.filter(b => b.page !== target);
    setBookmarks(next);
    localStorage.setItem(bookmarksKey(id), JSON.stringify(next));
  };

  // Search
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
      toast(found.length ? `Найдено: ${found.length} стр.` : 'Ничего не найдено');
    } finally { setSearching(false); }
  };

  // Download
  const downloadPdf = () => {
    if (!book) return;
    window.open(toAbsoluteUrl(book.downloadUrl || book.fileUrl || ''), '_blank', 'noopener,noreferrer');
  };

  const toggleFullscreen = () => {
    const el = shellRef.current;
    if (!el) return;
    if (!document.fullscreenElement) el.requestFullscreen?.(); else document.exitFullscreen?.();
  };

  if (!book) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111', color: '#999', flexDirection: 'column', gap: '16px' }}>
      <div style={{ fontSize: '48px' }}>📕</div>
      <div style={{ fontSize: '18px', fontWeight: 600 }}>Книга не найдена</div>
      <button onClick={() => navigate('/books')} style={{ padding: '10px 20px', background: '#d4af37', color: '#111', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Назад к книгам</button>
    </div>
  );

  return (
    <div ref={shellRef} style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: bg, color: textColor, fontFamily: 'Inter, system-ui, sans-serif', overflow: 'hidden' }}>
      {/* Header */}
      {!chromeHidden && (
        <header style={{ height: '52px', display: 'flex', alignItems: 'center', gap: '10px', padding: '0 16px', background: THEME_PANEL[readerTheme], borderBottom: `1px solid ${THEME_BORDER[readerTheme]}`, flexShrink: 0, zIndex: 20 }}>
          <button onClick={() => navigate(-1)} style={iconBtnStyle}><ArrowLeft size={18} /></button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '14px', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{book.title}</div>
            <div style={{ fontSize: '11px', opacity: 0.6 }}>{book.author}</div>
          </div>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <button onClick={() => { setPanelOpen(true); setPanelTab('toc'); }} style={iconBtnStyle}><ListTree size={16} /></button>
            <button onClick={() => { setPanelOpen(true); setPanelTab('bookmarks'); }} style={iconBtnStyle}><Bookmark size={16} /></button>
            <button onClick={() => { setPanelOpen(true); setPanelTab('search'); }} style={iconBtnStyle}><Search size={16} /></button>
            <button onClick={() => { setPanelOpen(true); setPanelTab('settings'); }} style={iconBtnStyle}><Settings size={16} /></button>
            <button onClick={downloadPdf} style={{ ...iconBtnStyle, background: 'var(--color-gold)', color: '#111' }}><Download size={16} /></button>
            <button onClick={toggleFullscreen} style={iconBtnStyle}><Maximize2 size={16} /></button>
            <button onClick={() => setChromeHidden(true)} style={iconBtnStyle}><Focus size={16} /></button>
          </div>
        </header>
      )}

      {/* Chrome-hidden click area */}
      {chromeHidden && (
        <div onClick={() => setChromeHidden(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '40px', zIndex: 100, cursor: 'pointer' }} />
      )}

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        {/* Side panel */}
        {panelOpen && (
          <aside style={{ width: '320px', background: THEME_PANEL[readerTheme], borderRight: `1px solid ${THEME_BORDER[readerTheme]}`, display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderBottom: `1px solid ${THEME_BORDER[readerTheme]}` }}>
              <div style={{ display: 'flex', gap: '4px' }}>
                {(['toc', 'bookmarks', 'search', 'settings'] as PanelTab[]).map(t => (
                  <button key={t} onClick={() => setPanelTab(t)} style={{ ...tabBtnStyle, background: panelTab === t ? 'var(--color-gold)' : 'transparent', color: panelTab === t ? '#111' : undefined }}>
                    {{ toc: <ListTree size={13} />, bookmarks: <Bookmark size={13} />, search: <Search size={13} />, settings: <Settings size={13} /> }[t]}
                    <span style={{ fontSize: '11px' }}>{{ toc: 'Оглавл.', bookmarks: 'Закладки', search: 'Поиск', settings: 'Настр.' }[t]}</span>
                  </button>
                ))}
              </div>
              <button onClick={() => setPanelOpen(false)} style={iconBtnStyle}><X size={16} /></button>
            </div>

            <div style={{ flex: 1, overflow: 'auto', padding: '12px' }}>
              {panelTab === 'toc' && (
                outline.length ? <OutlineList items={outline} goToPage={goToPage} /> : <div style={{ textAlign: 'center', padding: '20px', opacity: 0.5, fontSize: '13px' }}>Оглавление недоступно</div>
              )}

              {panelTab === 'bookmarks' && (
                <div>
                  <textarea value={note} onChange={e => setNote(e.target.value)} placeholder={`Заметка к стр. ${page}`}
                    style={{ width: '100%', padding: '8px', borderRadius: '8px', border: `1px solid ${THEME_BORDER[readerTheme]}`, background: bg, color: textColor, fontSize: '13px', resize: 'vertical', minHeight: '50px', marginBottom: '8px', boxSizing: 'border-box' }} />
                  <button onClick={addBookmark} style={{ ...goldBtnStyle, width: '100%' }}><Save size={13} /> Закладка стр. {page}</button>
                  <div style={{ marginTop: '12px' }}>
                    {bookmarks.length === 0 && <div style={{ textAlign: 'center', padding: '16px', opacity: 0.5, fontSize: '13px' }}>Нет закладок</div>}
                    {bookmarks.map((b, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px', borderRadius: '6px', marginBottom: '4px', background: b.page === page ? 'rgba(212,175,55,0.15)' : 'transparent', cursor: 'pointer' }}
                        onClick={() => goToPage(b.page)}>
                        <div><div style={{ fontSize: '13px', fontWeight: 600 }}>Стр. {b.page}</div>{b.note && <div style={{ fontSize: '11px', opacity: 0.6 }}>{b.note}</div>}</div>
                        <button onClick={e => { e.stopPropagation(); removeBookmark(b.page); }} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}><X size={12} /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {panelTab === 'search' && (
                <div>
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                    <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') runSearch(); }}
                      placeholder="Поиск по тексту..."
                      style={{ flex: 1, padding: '8px 10px', borderRadius: '8px', border: `1px solid ${THEME_BORDER[readerTheme]}`, background: bg, color: textColor, fontSize: '13px' }} />
                    <button onClick={runSearch} disabled={searching} style={goldBtnStyle}>{searching ? '...' : 'OK'}</button>
                  </div>
                  {matches.map(p => (
                    <button key={p} onClick={() => goToPage(p)}
                      style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px', borderRadius: '6px', border: 'none', background: p === page ? 'rgba(212,175,55,0.15)' : 'transparent', color: textColor, cursor: 'pointer', fontSize: '13px', marginBottom: '2px' }}>
                      Стр. {p}
                    </button>
                  ))}
                </div>
              )}

              {panelTab === 'settings' && (
                <div>
                  <label style={labelStyle}>Тема</label>
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
                    {(['dark', 'light', 'sepia'] as ReaderTheme[]).map(t => (
                      <button key={t} onClick={() => setReaderTheme(t)}
                        style={{ flex: 1, padding: '8px', borderRadius: '8px', border: `2px solid ${readerTheme === t ? 'var(--color-gold)' : THEME_BORDER[readerTheme]}`, background: THEME_BG[t], color: THEME_TEXT[t], cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>
                        {{ dark: 'Тёмная', light: 'Светлая', sepia: 'Сепия' }[t]}
                      </button>
                    ))}
                  </div>

                  <label style={labelStyle}>Размер шрифта: {fontSize}px</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <button onClick={() => setFontSize((s: number) => Math.max(12, s - 2))} style={iconBtnStyle}><Minus size={14} /></button>
                    <input type="range" min={12} max={32} value={fontSize} onChange={e => setFontSize(Number(e.target.value))} style={{ flex: 1 }} />
                    <button onClick={() => setFontSize((s: number) => Math.min(32, s + 2))} style={iconBtnStyle}><Plus size={14} /></button>
                  </div>

                  <label style={labelStyle}>Режим страниц</label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => setTwoPages(false)} style={{ ...tabBtnStyle, flex: 1, background: !twoPages ? 'var(--color-gold)' : 'transparent', color: !twoPages ? '#111' : undefined }}>1 страница</button>
                    <button onClick={() => setTwoPages(true)} style={{ ...tabBtnStyle, flex: 1, background: twoPages ? 'var(--color-gold)' : 'transparent', color: twoPages ? '#111' : undefined }}>2 страницы</button>
                  </div>
                </div>
              )}
            </div>
          </aside>
        )}

        {/* Reading area */}
        <main ref={stageRef} style={{ flex: 1, overflow: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}
          onTouchStart={e => { touchStartX.current = e.touches[0]?.clientX || null; }}
          onTouchEnd={e => {
            if (touchStartX.current == null) return;
            const diff = (e.changedTouches[0]?.clientX || 0) - touchStartX.current;
            if (Math.abs(diff) > 70) goToPage(diff < 0 ? page + (twoPages ? 2 : 1) : page - (twoPages ? 2 : 1));
            touchStartX.current = null;
          }}>

          {/* Side arrows */}
          <button onClick={() => goToPage(page - (twoPages ? 2 : 1))} disabled={page <= 1}
            style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', ...navArrowStyle, opacity: page <= 1 ? 0.2 : 0.5 }}><ChevronLeft size={32} /></button>
          <button onClick={() => goToPage(page + (twoPages ? 2 : 1))} disabled={page >= totalPages}
            style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', ...navArrowStyle, opacity: page >= totalPages ? 0.2 : 0.5 }}><ChevronRight size={32} /></button>

          {loading && !loadError && <div style={{ position: 'absolute', padding: '12px 24px', background: 'rgba(0,0,0,0.7)', borderRadius: '20px', fontSize: '14px', color: '#fff' }}>Загрузка PDF...</div>}
          {rendering && <div style={{ position: 'absolute', bottom: '20px', padding: '8px 16px', background: 'rgba(0,0,0,0.5)', borderRadius: '12px', fontSize: '12px', color: '#aaa' }}>...</div>}

          {loadError && !loading && (
            <div style={{ textAlign: 'center', padding: '40px 20px', maxWidth: '500px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                {loadError === 'cors' ? '🔒' : '📕'}
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: textColor, marginBottom: '8px' }}>
                {loadError === 'cors' ? 'Файл недоступен напрямую' : 'Не удалось открыть PDF'}
              </h3>
              <p style={{ fontSize: '14px', opacity: 0.7, marginBottom: '20px', lineHeight: 1.5 }}>
                {loadError === 'cors'
                  ? 'PDF-файл находится на внешнем сервере и не может быть загружен из браузера из-за ограничений CORS. Откройте файл в новой вкладке или скачайте.'
                  : 'Файл повреждён или недоступен. Попробуйте скачать его.'}
              </p>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button onClick={() => window.open(pdfUrl, '_blank')} style={goldBtnStyle}>
                  <ExternalLink size={14} /> Открыть в новой вкладке
                </button>
                <button onClick={downloadPdf} style={goldBtnStyle}>
                  <Download size={14} /> Скачать
                </button>
                <button onClick={() => navigate(-1)} style={{ ...goldBtnStyle, background: 'var(--color-bg-hover)', color: textColor, border: `1px solid ${THEME_BORDER[readerTheme]}` }}>
                  <ArrowLeft size={14} /> Назад
                </button>
              </div>
            </div>
          )}

          <canvas ref={canvasRef} style={{ maxWidth: '100%', cursor: 'pointer', boxShadow: readerTheme === 'dark' ? '0 4px 40px rgba(0,0,0,0.5)' : '0 4px 20px rgba(0,0,0,0.15)' }}
            onClick={() => applyFit(fitMode === 'page' ? 'width' : 'page')} />
        </main>
      </div>

      {/* Bottom bar */}
      {!chromeHidden && (
        <footer style={{ height: '44px', display: 'flex', alignItems: 'center', gap: '8px', padding: '0 16px', background: THEME_PANEL[readerTheme], borderTop: `1px solid ${THEME_BORDER[readerTheme]}`, flexShrink: 0, fontSize: '13px' }}>
          <button onClick={() => goToPage(page - (twoPages ? 2 : 1))} disabled={page <= 1} style={iconBtnSmall}><ChevronLeft size={16} /></button>
          <form onSubmit={e => { e.preventDefault(); goToPage(Number(pageInput)); }} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <input value={pageInput} onChange={e => setPageInput(e.target.value)}
              style={{ width: '40px', padding: '4px', textAlign: 'center', borderRadius: '6px', border: `1px solid ${THEME_BORDER[readerTheme]}`, background: bg, color: textColor, fontSize: '13px' }} />
            <span style={{ opacity: 0.5 }}>/ {totalPages || '—'}</span>
          </form>
          <button onClick={() => goToPage(page + (twoPages ? 2 : 1))} disabled={page >= totalPages} style={iconBtnSmall}><ChevronRight size={16} /></button>

          <input type="range" min={1} max={totalPages || 1} value={page} onChange={e => goToPage(Number(e.target.value))}
            style={{ flex: 1, height: '4px', accentColor: 'var(--color-gold)' }} />

          <span style={{ opacity: 0.5, fontSize: '12px', minWidth: '32px', textAlign: 'right' }}>{progress}%</span>

          <button onClick={() => applyFit('page')} style={{ ...tabBtnStyle, background: fitMode === 'page' ? 'var(--color-gold)' : 'transparent', color: fitMode === 'page' ? '#111' : undefined }}>
            <BookOpen size={13} /> Вся
          </button>
          <button onClick={() => applyFit('width')} style={{ ...tabBtnStyle, background: fitMode === 'width' ? 'var(--color-gold)' : 'transparent', color: fitMode === 'width' ? '#111' : undefined }}>
            Ширина
          </button>

          <button onClick={() => { setFitMode('custom'); setScale(s => clamp(+(s - 0.12).toFixed(2), 0.35, 3)); }} style={iconBtnSmall}><Minus size={14} /></button>
          <span style={{ fontSize: '11px', opacity: 0.5, minWidth: '32px', textAlign: 'center' }}>{Math.round(scale * 100)}%</span>
          <button onClick={() => { setFitMode('custom'); setScale(s => clamp(+(s + 0.12).toFixed(2), 0.35, 3)); }} style={iconBtnSmall}><Plus size={14} /></button>
        </footer>
      )}
    </div>
  );
}

// ─── Outline ─────────────────────────────────────────────────────────────────
function OutlineList({ items, goToPage }: { items: OutlineItem[]; goToPage: (p: number) => void }) {
  return <>{items.map((item, idx) => (
    <div key={`${item.title}-${idx}`}>
      <button disabled={!item.page} onClick={() => item.page && goToPage(item.page)}
        style={{ display: 'block', width: '100%', textAlign: 'left', padding: '6px 8px', borderRadius: '6px', border: 'none', background: 'transparent', cursor: item.page ? 'pointer' : 'default', fontSize: '13px', opacity: item.page ? 1 : 0.5 }}>
        {item.title}
      </button>
      {item.items?.length ? <div style={{ paddingLeft: '12px' }}><OutlineList items={item.items} goToPage={goToPage} /></div> : null}
    </div>
  ))}</>;
}

async function normalizeOutline(doc: PDFDocumentProxy, raw: any[]): Promise<OutlineItem[]> {
  return Promise.all(raw.map(async item => {
    let page: number | undefined;
    try {
      const dest = typeof item.dest === 'string' ? await doc.getDestination(item.dest) : item.dest;
      if (dest?.[0]) page = (await doc.getPageIndex(dest[0])) + 1;
    } catch {}
    return { title: item.title || 'Раздел', page, items: item.items?.length ? await normalizeOutline(doc, item.items) : [] };
  }));
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const iconBtnStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', width: '34px', height: '34px',
  borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-bg-hover)',
  color: 'var(--color-text-primary)', cursor: 'pointer', flexShrink: 0,
};

const iconBtnSmall: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px',
  borderRadius: '6px', border: 'none', background: 'transparent', color: 'var(--color-text-primary)',
  cursor: 'pointer', flexShrink: 0,
};

const tabBtnStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px', borderRadius: '6px',
  border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-text-secondary)',
  cursor: 'pointer', fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap',
};

const goldBtnStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
  padding: '8px 14px', borderRadius: '8px', border: 'none',
  background: 'linear-gradient(135deg, #d4af37, #f0c84a)', color: '#111',
  fontWeight: 700, fontSize: '13px', cursor: 'pointer',
};

const navArrowStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', width: '44px', height: '44px',
  borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,0.3)', color: '#fff',
  cursor: 'pointer', transition: 'opacity 0.2s', zIndex: 5,
};

const labelStyle: React.CSSProperties = { display: 'block', fontSize: '12px', fontWeight: 600, opacity: 0.7, marginBottom: '6px' };
