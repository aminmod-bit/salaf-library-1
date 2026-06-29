import { useEffect, useRef, useState } from 'react';
import type { Book } from '../store/useStore';

interface Props {
  book: Pick<Book, 'title' | 'author' | 'category' | 'coverColor' | 'coverEmoji' | 'coverImage' | 'fileUrl'>;
  height?: string | number;
  width?: string | number;
  radius?: string | number;
  fontSize?: number;
  compact?: boolean;
}

let pdfWorkerReady = false;
let coverDbPromise: Promise<IDBDatabase> | null = null;
let activePdfCoverRenders = 0;
let totalPdfCoverRenders = 0;
const MAX_ACTIVE_PDF_COVER_RENDERS = 1;
const MAX_TOTAL_PDF_COVER_RENDERS = 18;

function openCoverDb() {
  if (coverDbPromise) return coverDbPromise;
  coverDbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open('salaf-library-pdf-covers', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('covers');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return coverDbPromise;
}

async function getCachedCover(key: string) {
  const db = await openCoverDb();
  return new Promise<Blob | undefined>((resolve) => {
    const tx = db.transaction('covers', 'readonly');
    const request = tx.objectStore('covers').get(key);
    request.onsuccess = () => resolve(request.result as Blob | undefined);
    request.onerror = () => resolve(undefined);
  });
}

async function setCachedCover(key: string, blob: Blob) {
  const db = await openCoverDb();
  return new Promise<void>((resolve) => {
    const tx = db.transaction('covers', 'readwrite');
    tx.objectStore('covers').put(blob, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => resolve();
  });
}

function darken(hex = '#1a3a2a', amount = 28) {
  try {
    const n = parseInt(hex.replace('#', ''), 16);
    const r = Math.max(0, (n >> 16) - amount);
    const g = Math.max(0, ((n >> 8) & 0xff) - amount);
    const b = Math.max(0, (n & 0xff) - amount);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  } catch {
    return '#0a1a0f';
  }
}

function toAbsoluteUrl(url: string) {
  try {
    return new URL(url, document.baseURI).toString();
  } catch {
    return url;
  }
}

function canRenderPdfCover() {
  if (typeof window === 'undefined') return false;
  const isSmallDevice = window.matchMedia('(max-width: 820px)').matches;
  const reduceData = window.matchMedia('(prefers-reduced-data: reduce)').matches;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (isSmallDevice || reduceData || reduceMotion) return false;
  if (activePdfCoverRenders >= MAX_ACTIVE_PDF_COVER_RENDERS) return false;
  if (totalPdfCoverRenders >= MAX_TOTAL_PDF_COVER_RENDERS) return false;
  return true;
}

export default function GeneratedCover({ book, height = '100%', width = '100%', radius = 0, fontSize = 14, compact = false }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [visible, setVisible] = useState(false);
  const [pdfRendered, setPdfRendered] = useState(false);
  const [pdfFailed, setPdfFailed] = useState(false);
  const [cachedCoverUrl, setCachedCoverUrl] = useState<string>('');

  useEffect(() => () => { if (cachedCoverUrl) URL.revokeObjectURL(cachedCoverUrl); }, [cachedCoverUrl]);

  useEffect(() => {
    const node = rootRef.current;
    if (!node || book.coverImage || !book.fileUrl || pdfFailed || cachedCoverUrl) return;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        setVisible(true);
        observer.disconnect();
      }
    }, { rootMargin: '520px' });
    observer.observe(node);
    return () => observer.disconnect();
  }, [book.coverImage, book.fileUrl, pdfFailed, cachedCoverUrl]);

  useEffect(() => {
    if (!visible || book.coverImage || !book.fileUrl || !canvasRef.current || pdfRendered || pdfFailed || cachedCoverUrl) return;
    if (!canRenderPdfCover()) return;
    let cancelled = false;
    let released = false;
    const releaseSlot = () => {
      if (released) return;
      released = true;
      activePdfCoverRenders = Math.max(0, activePdfCoverRenders - 1);
    };
    activePdfCoverRenders += 1;
    totalPdfCoverRenders += 1;

    async function renderFirstPage() {
      try {
        const cacheKey = toAbsoluteUrl(book.fileUrl!);
        const cached = await getCachedCover(cacheKey);
        if (cached && !cancelled) {
          setCachedCoverUrl(URL.createObjectURL(cached));
          setPdfRendered(true);
          return;
        }
        const [{ GlobalWorkerOptions, getDocument }, worker] = await Promise.all([
          import('pdfjs-dist'),
          import('pdfjs-dist/build/pdf.worker.mjs?url'),
        ]);
        if (!pdfWorkerReady) {
          GlobalWorkerOptions.workerSrc = worker.default;
          pdfWorkerReady = true;
        }
        const pdf = await getDocument({ url: toAbsoluteUrl(book.fileUrl!), withCredentials: false }).promise;
        if (cancelled) return;
        const page = await pdf.getPage(1);
        if (cancelled) return;
        const canvas = canvasRef.current;
        const host = rootRef.current;
        if (!canvas || !host) return;
        const rect = host.getBoundingClientRect();
        const targetWidth = Math.min(420, Math.max(180, rect.width || (compact ? 180 : 280)));
        const baseViewport = page.getViewport({ scale: 1 });
        const renderScale = targetWidth / baseViewport.width;
        const viewport = page.getViewport({ scale: renderScale });
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.floor(viewport.width * dpr);
        canvas.height = Math.floor(viewport.height * dpr);
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        await page.render({ canvas, canvasContext: ctx, viewport }).promise;
        if (!cancelled) {
          setPdfRendered(true);
          canvas.toBlob(blob => { if (blob) setCachedCover(cacheKey, blob); }, 'image/webp', 0.82);
        }
      } catch {
        if (!cancelled) setPdfFailed(true);
      } finally {
        releaseSlot();
      }
    }
    renderFirstPage();
    return () => { cancelled = true; releaseSlot(); };
  }, [book.coverImage, book.fileUrl, cachedCoverUrl, compact, pdfFailed, pdfRendered, visible]);

  if (book.coverImage) {
    return <img src={book.coverImage} alt={`Обложка книги ${book.title}`} loading="lazy" decoding="async" style={{ width, height, borderRadius: radius, objectFit: 'cover', display: 'block' }} />;
  }

  const base = book.coverColor || '#1a3a2a';
  const dark = darken(base, 38);

  return (
    <div ref={rootRef} aria-label={`Обложка книги ${book.title}`} style={{ width, height, borderRadius: radius, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: compact ? '10px 8px' : '18px 14px', background: `linear-gradient(155deg, ${base} 0%, ${dark} 100%)`, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12)', contain: 'layout paint' }}>
      {cachedCoverUrl && <img src={cachedCoverUrl} alt={`Авто-обложка книги ${book.title}`} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 5 }} />}
      {book.fileUrl && !pdfFailed && !cachedCoverUrl && <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: pdfRendered ? 1 : 0, transition: 'opacity .35s ease', background: '#fff', zIndex: 4 }} />}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 25% 15%, rgba(212,175,55,.24), transparent 34%), radial-gradient(circle at 80% 85%, rgba(255,255,255,.08), transparent 35%)' }} />
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: compact ? 5 : 8, background: 'linear-gradient(180deg, rgba(212,175,55,.85), rgba(146,117,28,.55))' }} />
      <div style={{ position: 'relative', zIndex: 1, color: '#d4af37', fontSize: compact ? 9 : 10, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', marginLeft: compact ? 4 : 8 }}>{book.category || 'Salaf Library'}</div>
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: compact ? '4px 2px' : '8px 4px' }}>
        <svg width={compact ? 24 : 34} height={compact ? 24 : 34} viewBox="0 0 24 24" fill="none" style={{ marginBottom: compact ? 4 : 8 }} aria-hidden="true">
          <path d="M5 5.5A2.5 2.5 0 0 1 7.5 3H20v16H7.5A2.5 2.5 0 0 0 5 21.5v-16Z" stroke="#f4e4b1" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M5 5.5A2.5 2.5 0 0 0 2.5 3H4v16h-.5A2.5 2.5 0 0 1 1 16.5v-13" stroke="#d4af37" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M8 7h8M8 10h7M8 13h5" stroke="#d4af37" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <div style={{ color: '#fff8dc', fontWeight: 800, fontSize, lineHeight: 1.18, textShadow: '0 2px 10px rgba(0,0,0,.45)', display: '-webkit-box', WebkitLineClamp: compact ? 3 : 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{book.title}</div>
      </div>
      <div style={{ position: 'relative', zIndex: 1, color: 'rgba(244,228,177,.86)', fontSize: compact ? 9 : 11, lineHeight: 1.25, textAlign: 'center', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{book.author || 'Автор не указан'}</div>
    </div>
  );
}
