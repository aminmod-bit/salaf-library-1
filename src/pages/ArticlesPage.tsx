import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PageShell } from "@/components/system/PageShell";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Icon } from "@/components/ui/Icon";
import { SearchBar } from "@/components/ui/SearchBar";
import { useState } from "react";
import { ARTICLE_FOLDERS } from "@/data/folders";
import { ARTICLES } from "@/data/content";
import { FolderCard } from "@/components/ui/FolderCard";

export function ArticlesFoldersPage() {
  const { t } = useTranslation();
  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const a of ARTICLES) map[a.folder] = (map[a.folder] || 0) + 1;
    return map;
  }, []);

  return (
    <PageShell title={t("articles.title")}>
      <div className="container-x pt-4">
        <SectionHeader title={t("articles.title")} subtitle={t("articles.subtitle")} />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {ARTICLE_FOLDERS.map((f) => (
            <FolderCard key={f.id} folder={f} count={counts[f.key]} to={`/articles/folder/${f.key}`} />
          ))}
        </div>
      </div>
    </PageShell>
  );
}

export function ArticleFolderPage() {
  const { t } = useTranslation();
  const { folderKey = "" } = useParams<{ folderKey: string }>();
  const nav = useNavigate();
  const folder = ARTICLE_FOLDERS.find((f) => f.key === folderKey);
  const list = useMemo(() => ARTICLES.filter((a) => a.folder === folderKey), [folderKey]);
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    if (!q.trim()) return list;
    const s = q.toLowerCase();
    return list.filter((a) => a.title.toLowerCase().includes(s) || a.excerpt.toLowerCase().includes(s));
  }, [list, q]);

  return (
    <PageShell title={folder?.label} showBack>
      <div className="container-x pt-4">
        <button onClick={() => nav("/articles")} className="mb-3 flex items-center gap-1 text-xs font-medium text-ink-soft hover:text-emerald-800">
          <Icon name="ArrowLeft" size={12} /> Все разделы
        </button>
        <SearchBar value={q} onChange={setQ} placeholder="Поиск по статьям…" className="mb-4" />
        {filtered.length === 0 ? (
          <div className="paper p-10 text-center">
            <Icon name="FileX" size={36} className="mx-auto text-ink-mute" />
            <p className="mt-3 text-sm text-ink-soft">{t("common.empty")}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((a) => (
              <button
                key={a.id}
                onClick={() => window.location.hash = `#/articles/view/${a.id}`}
                className="paper lift flex w-full flex-col gap-2 p-5 text-left"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-serif text-base font-semibold text-ink sm:text-lg">{a.title}</h3>
                  {a.readingTime && (
                    <span className="shrink-0 text-[11px] text-ink-mute">{a.readingTime} мин</span>
                  )}
                </div>
                <p className="text-sm text-ink-soft line-clamp-2">{a.excerpt}</p>
                <div className="mt-1 flex items-center gap-2 text-[11px] text-ink-mute">
                  {a.author && <span>{a.author}</span>}
                  {a.date && <span>· {a.date}</span>}
                  {a.tags && a.tags.length > 0 && (
                    <span className="ml-auto flex gap-1">
                      {a.tags.slice(0, 3).map((tg) => (
                        <span key={tg} className="rounded-full bg-paper-2 px-2 py-0.5">#{tg}</span>
                      ))}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}

export function ArticleViewPage() {
  const { t } = useTranslation();
  const { articleId = "" } = useParams<{ articleId: string }>();
  const nav = useNavigate();
  const article = ARTICLES.find((a) => a.id === articleId);
  if (!article) {
    return (
      <PageShell title={t("articles.title")} showBack>
        <div className="container-x py-10 text-center">
          <p className="text-sm text-ink-soft">Статья не найдена</p>
        </div>
      </PageShell>
    );
  }
  return (
    <PageShell title={article.title} showBack>
      <article className="container-x mx-auto max-w-3xl pt-4">
        <button onClick={() => nav(`/articles/folder/${article.folder}`)} className="mb-3 flex items-center gap-1 text-xs font-medium text-ink-soft hover:text-emerald-800">
          <Icon name="ArrowLeft" size={12} /> Назад к разделу
        </button>
        <div className="paper p-6 sm:p-8">
          <h1 className="font-serif text-2xl font-bold text-ink sm:text-3xl">{article.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-ink-mute">
            {article.author && <span>{article.author}</span>}
            {article.date && <span>· {article.date}</span>}
            {article.readingTime && <span>· {article.readingTime} мин чтения</span>}
          </div>
          <p className="mt-4 border-l-2 border-amber-400 pl-3 text-sm italic text-ink-soft">{article.excerpt}</p>
          <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-ink">
            {article.body.split("\n").map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </article>
    </PageShell>
  );
}