import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PageShell } from "@/components/system/PageShell";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { BookCard } from "@/components/ui/BookCard";
import { Icon } from "@/components/ui/Icon";
import { FolderCard } from "@/components/ui/FolderCard";
import { BOOK_FOLDERS } from "@/data/folders";
import { BOOKS } from "@/data/content";

export function BooksFoldersPage() {
  const { t } = useTranslation();
  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const b of BOOKS) map[b.category] = (map[b.category] || 0) + 1;
    return map;
  }, []);

  return (
    <PageShell title={t("books.title")}>
      <div className="container-x pt-4">
        <SectionHeader title={t("books.title")} subtitle={t("books.subtitle")} />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {BOOK_FOLDERS.map((f) => (
            <FolderCard
              key={f.id}
              folder={f}
              count={counts[f.key]}
              to={`/books/folder/${f.key}`}
            />
          ))}
        </div>
      </div>
    </PageShell>
  );
}

export function BookFolderPage() {
  const { t } = useTranslation();
  const { folderKey = "" } = useParams<{ folderKey: string }>();
  const nav = useNavigate();
  const folder = BOOK_FOLDERS.find((f) => f.key === folderKey);
  const books = useMemo(() => BOOKS.filter((b) => b.category === folderKey), [folderKey]);

  return (
    <PageShell title={folder?.label} showBack>
      <div className="container-x pt-4">
        <button
          onClick={() => nav("/books")}
          className="mb-3 flex items-center gap-1 text-xs font-medium text-ink-soft hover:text-emerald-800"
        >
          <Icon name="ArrowLeft" size={12} /> {t("books.back_to_folders")}
        </button>
        {folder && (
          <div className="paper mb-5 flex items-center gap-4 p-5">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl text-white"
              style={{ background: folder.coverColor }}
            >
              <Icon name={folder.iconKey} size={28} />
            </div>
            <div>
              <h2 className="font-serif text-2xl font-semibold text-ink">{folder.label}</h2>
              {folder.labelAr && <div className="arabic text-sm text-ink-mute">{folder.labelAr}</div>}
              {folder.description && <p className="mt-1 text-xs text-ink-soft">{folder.description}</p>}
            </div>
          </div>
        )}

        {books.length === 0 ? (
          <div className="paper p-10 text-center">
            <Icon name="Library" size={36} className="mx-auto text-ink-mute" />
            <p className="mt-3 text-sm text-ink-soft">{t("common.empty")}</p>
            <p className="mt-1 text-xs text-ink-mute">
              Добавьте PDF-книги в <code className="rounded bg-paper-2 px-1 py-0.5">public/books/</code> и записи в <code className="rounded bg-paper-2 px-1 py-0.5">public/data/books.json</code>
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {books.map((b) => <BookCard key={b.id} book={b} />)}
          </div>
        )}
      </div>
    </PageShell>
  );
}