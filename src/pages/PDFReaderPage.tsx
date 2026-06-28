import { lazy, Suspense, useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PageShell } from "@/components/system/PageShell";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { BOOKS } from "@/data/content";
import { useApp } from "@/store/useApp";

// Lazy-load the PDF reader — keeps pdf.js out of the main bundle
const PDFReaderCanvas = lazy(() => import("@/components/reader/PDFReaderCanvas").then(m => ({ default: m.PDFReaderCanvas })));

export default function BookReaderPage() {
  const { t } = useTranslation();
  const { bookId = "" } = useParams<{ bookId: string }>();
  const nav = useNavigate();
  const addRecent = useApp((s) => s.addRecent);
  const book = BOOKS.find((b) => b.id === bookId);
  const [opened, setOpened] = useState(false);
  const startedRef = useRef(false);

  useEffect(() => {
    if (book && !startedRef.current) {
      startedRef.current = true;
      addRecent({ id: book.id, type: "book", title: book.title, path: `/books/reader/${book.id}` });
    }
  }, [book, addRecent]);

  if (!book) {
    return (
      <PageShell title={t("common.book")} showBack>
        <div className="container-x py-16 text-center">
          <Icon name="BookX" size={36} className="mx-auto text-ink-mute" />
          <p className="mt-3 text-sm text-ink-soft">Книга не найдена</p>
          <Button className="mt-4" onClick={() => nav("/books")}>{t("nav.books")}</Button>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell title={book.title} showBack>
      <div className="container-x pt-4">
        {!opened ? (
          <div className="paper relative overflow-hidden p-6 sm:p-10">
            <div
              className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-amber-300/15"
              style={{ filter: "blur(20px)" }}
            />
            <div className="relative grid gap-6 sm:grid-cols-[180px_1fr]">
              <div className="flex justify-center sm:justify-start">
                <div
                  className="flex h-56 w-40 flex-col items-center justify-center rounded-2xl border border-line text-center text-white shadow-xl"
                  style={{
                    background: `linear-gradient(160deg, ${book.coverColor || "#0f3d2e"} 0%, ${book.coverColor || "#0f3d2e"}cc 100%)`,
                  }}
                >
                  <div className="text-4xl">{book.coverEmoji || "📖"}</div>
                  <div className="mt-3 px-3 text-[10px] font-medium uppercase leading-tight tracking-wide text-white/90 line-clamp-3">
                    {book.title}
                  </div>
                </div>
              </div>
              <div className="min-w-0">
                <h1 className="font-serif text-2xl font-semibold text-ink sm:text-3xl">{book.title}</h1>
                {book.titleAr && <div className="arabic mt-1 text-lg text-ink-soft">{book.titleAr}</div>}
                <div className="mt-1 text-sm text-ink-soft">{book.author}{book.authorAr && <span className="arabic"> · {book.authorAr}</span>}</div>

                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  {book.pages && (
                    <span className="flex items-center gap-1 rounded-full bg-paper-2 px-3 py-1 text-ink-soft">
                      <Icon name="Layers" size={12} /> {book.pages} {t("common.pages")}
                    </span>
                  )}
                  {book.year && (
                    <span className="flex items-center gap-1 rounded-full bg-paper-2 px-3 py-1 text-ink-soft">
                      <Icon name="Calendar" size={12} /> {book.year}
                    </span>
                  )}
                  <span className="flex items-center gap-1 rounded-full bg-paper-2 px-3 py-1 text-ink-soft">
                    <Icon name="Languages" size={12} /> {book.language}
                  </span>
                  {book.publisher && (
                    <span className="flex items-center gap-1 rounded-full bg-paper-2 px-3 py-1 text-ink-soft">
                      <Icon name="Building" size={12} /> {book.publisher}
                    </span>
                  )}
                </div>

                {book.description && (
                  <p className="mt-5 text-sm leading-relaxed text-ink-soft">{book.description}</p>
                )}

                <div className="mt-6 flex flex-wrap gap-2">
                  <Button
                    variant="primary"
                    icon={<Icon name="BookOpen" size={16} />}
                    onClick={() => setOpened(true)}
                  >
                    {t("common.read")}
                  </Button>
                  {book.fileUrl && (
                    <Button
                      variant="secondary"
                      icon={<Icon name="Download" size={16} />}
                      onClick={() => window.open(book.fileUrl, "_blank")}
                    >
                      {t("common.download")}
                    </Button>
                  )}
                </div>

                {!book.fileUrl && (
                  <p className="mt-3 text-[11px] text-ink-mute">
                    PDF-файл не подключён. Добавьте <code>fileUrl</code> в books.json, чтобы открыть читалку.
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : book.fileUrl ? (
          <div className="paper overflow-hidden p-2 sm:p-4">
            <Suspense
              fallback={
                <div className="flex h-[70vh] items-center justify-center">
                  <div className="flex flex-col items-center gap-3 text-ink-soft">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-700 border-t-transparent" />
                    <span className="text-sm">Загружаем читалку…</span>
                  </div>
                </div>
              }
            >
              <PDFReaderCanvas fileUrl={book.fileUrl} title={book.title} />
            </Suspense>
          </div>
        ) : (
          <div className="paper p-10 text-center">
            <Icon name="FileWarning" size={36} className="mx-auto text-amber-500" />
            <p className="mt-3 text-sm text-ink-soft">PDF-файл пока не подключён к этой книге.</p>
            <Button className="mt-4" onClick={() => setOpened(false)}>{t("common.back")}</Button>
          </div>
        )}
      </div>
    </PageShell>
  );
}