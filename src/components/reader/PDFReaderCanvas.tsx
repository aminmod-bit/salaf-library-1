import { useEffect, useRef, useState, useCallback } from "react";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { clamp } from "@/utils/helpers";

interface PDFReaderCanvasProps {
  fileUrl: string;
  title: string;
}

// Lightweight pdf.js types — we use a thin shim to keep things safe.
type PdfDoc = {
  numPages: number;
  getPage: (n: number) => Promise<PdfPage>;
};
type PdfPage = {
  getViewport: (opts: { scale: number }) => { width: number; height: number };
  render: (opts: { canvasContext: CanvasRenderingContext2D; viewport: any }) => { promise: Promise<void> };
};
type PdfJs = { getDocument: (src: { url: string } | { data: ArrayBuffer }) => { promise: Promise<PdfDoc> } };

let _pdfjs: PdfJs | null = null;
async function getPdfjs(): Promise<PdfJs> {
  if (_pdfjs) return _pdfjs;
  // pdfjs-dist v4 ESM. We import dynamically to keep it out of main bundle.
  const mod: any = await import("pdfjs-dist");
  // Use a CDN worker (avoid bundling worker). pdf.js auto-falls back.
  try {
    mod.GlobalWorkerOptions.workerSrc = "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs";
  } catch {}
  _pdfjs = mod as PdfJs;
  return _pdfjs;
}

export function PDFReaderCanvas({ fileUrl, title }: PDFReaderCanvasProps) {
  const [doc, setDoc] = useState<PdfDoc | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [page, setPage] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Load doc
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const pdfjs = await getPdfjs();
        const task = pdfjs.getDocument({ url: fileUrl });
        const d = await task.promise;
        if (cancelled) return;
        setDoc(d);
        setNumPages(d.numPages);
        setPage(1);
        setLoading(false);
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.message || "Ошибка загрузки PDF");
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [fileUrl]);

  // Render current page
  const renderPage = useCallback(async (pageNum: number, sc: number) => {
    if (!doc || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    try {
      const p = await doc.getPage(pageNum);
      // Fit to container width when sc <= 1
      const parentWidth = containerRef.current?.clientWidth || 800;
      const baseViewport = p.getViewport({ scale: 1 });
      const fitScale = sc === -1 ? (parentWidth - 16) / baseViewport.width : sc;
      const viewport = p.getViewport({ scale: fitScale });
      const dpr = window.devicePixelRatio || 1;
      const canvas = canvasRef.current;
      canvas.width = Math.floor(viewport.width * dpr);
      canvas.height = Math.floor(viewport.height * dpr);
      canvas.style.width = `${Math.floor(viewport.width)}px`;
      canvas.style.height = `${Math.floor(viewport.height)}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      await p.render({ canvasContext: ctx, viewport }).promise;
    } catch (e) {
      // swallow
    }
  }, [doc]);

  useEffect(() => {
    if (doc) renderPage(page, scale);
  }, [doc, page, scale, renderPage]);

  useEffect(() => {
    const onResize = () => { if (scale === -1) renderPage(page, -1); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [scale, page, renderPage]);

  // Keyboard nav
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!doc) return;
      if (e.key === "ArrowLeft" || e.key === "PageUp") setPage((p) => clamp(p - 1, 1, numPages));
      if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") setPage((p) => clamp(p + 1, 1, numPages));
      if (e.key === "+" || e.key === "=") setScale((s) => clamp(s + 0.1, 0.5, 3));
      if (e.key === "-") setScale((s) => clamp(s - 0.1, 0.5, 3));
      if (e.key === "0") setScale(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [doc, numPages]);

  const goPrev = () => setPage((p) => clamp(p - 1, 1, numPages));
  const goNext = () => setPage((p) => clamp(p + 1, 1, numPages));

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-ink-soft">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-700 border-t-transparent" />
          <span className="text-sm">Загружаем {title}…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-3 text-center">
        <Icon name="FileWarning" size={36} className="text-amber-500" />
        <p className="text-sm text-ink-soft">Не удалось открыть PDF: {error}</p>
        <a href={fileUrl} target="_blank" rel="noreferrer" className="text-xs text-emerald-700 underline">
          Скачать PDF
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Toolbar */}
      <div className="paper-soft sticky top-14 z-20 flex items-center gap-1 rounded-2xl border border-line px-2 py-2 backdrop-blur">
        <Button size="sm" variant="ghost" onClick={goPrev} disabled={page <= 1} icon={<Icon name="ChevronLeft" size={14} />}>
          <span className="hidden sm:inline">Назад</span>
        </Button>
        <span className="px-2 text-xs font-medium text-ink-soft">
          <span className="text-ink">{page}</span> / {numPages}
        </span>
        <Button size="sm" variant="ghost" onClick={goNext} disabled={page >= numPages} icon={<Icon name="ChevronRight" size={14} />}>
          <span className="hidden sm:inline">Вперёд</span>
        </Button>
        <div className="mx-1 h-5 w-px bg-line" />
        <Button size="sm" variant="ghost" onClick={() => setScale((s) => clamp(s - 0.15, 0.5, 3))} icon={<Icon name="ZoomOut" size={14} />} />
        <span className="px-1 text-xs font-medium text-ink-soft">{Math.round((scale === -1 ? 1 : scale) * 100)}%</span>
        <Button size="sm" variant="ghost" onClick={() => setScale((s) => clamp(s + 0.15, 0.5, 3))} icon={<Icon name="ZoomIn" size={14} />} />
        <Button size="sm" variant="ghost" onClick={() => setScale(-1)} icon={<Icon name="Maximize2" size={14} />} />
        <div className="ml-auto flex items-center gap-1">
          <a href={fileUrl} target="_blank" rel="noreferrer">
            <Button size="sm" variant="secondary" icon={<Icon name="Download" size={14} />}>
              <span className="hidden sm:inline">PDF</span>
            </Button>
          </a>
        </div>
      </div>

      {/* Page */}
      <div ref={containerRef} className="flex justify-center bg-paper-2/40 p-2 sm:p-4">
        <div className="reader-page overflow-hidden bg-white">
          <canvas ref={canvasRef} className="block" />
        </div>
      </div>

      {/* Bottom pager */}
      <div className="flex items-center justify-between gap-2 px-1 text-xs text-ink-mute">
        <span>{title}</span>
        <span>← / → для перелистывания · +/- для зума</span>
      </div>
    </div>
  );
}