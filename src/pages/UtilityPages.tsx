import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { PageShell } from "@/components/system/PageShell";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Icon } from "@/components/ui/Icon";
import { SearchBar } from "@/components/ui/SearchBar";
import { useState } from "react";
import { useApp } from "@/store/useApp";
import { BOOKS, HADITHS, ARTICLES, AZKAR, BIOGRAPHIES } from "@/data/content";

type Hit = { type: string; title: string; subtitle?: string; path: string };

export function FavoritesPage() {
  const { t } = useTranslation();
  const favs = useApp((s) => s.favorites);

  const items = useMemo(() => {
    const list: Hit[] = [];
    favs.books.forEach((id) => {
      const b = BOOKS.find((x) => x.id === id);
      if (b) list.push({ type: "book", title: b.title, subtitle: b.author, path: `/books/reader/${b.id}` });
    });
    favs.azkar.forEach((id) => {
      const a = AZKAR.find((x) => x.id === id);
      if (a) list.push({ type: "azkar", title: a.title, subtitle: a.source, path: `/azkar/folder/${a.folder}` });
    });
    favs.hadith.forEach((id) => {
      const h = HADITHS.find((x) => x.id === id);
      if (h) list.push({ type: "hadith", title: h.text.slice(0, 60) + "…", subtitle: h.book, path: `/hadith/collection/${h.collectionId}` });
    });
    favs.articles.forEach((id) => {
      const a = ARTICLES.find((x) => x.id === id);
      if (a) list.push({ type: "article", title: a.title, subtitle: a.author, path: `/articles/view/${a.id}` });
    });
    favs.biographies.forEach((id) => {
      const b = BIOGRAPHIES.find((x) => x.id === id);
      if (b) list.push({ type: "biography", title: b.name, subtitle: b.description, path: `/biographies/view/${b.id}` });
    });
    return list;
  }, [favs]);

  return (
    <PageShell title={t("favorites.title")}>
      <div className="container-x pt-4">
        <SectionHeader title={t("favorites.title")} subtitle={t("favorites.subtitle")} />
        {items.length === 0 ? (
          <div className="paper p-10 text-center">
            <Icon name="Star" size={36} className="mx-auto text-amber-400" />
            <p className="mt-3 text-sm text-ink-soft">{t("favorites.empty")}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((it, i) => <FavRow key={i} item={it} />)}
          </div>
        )}
      </div>
    </PageShell>
  );
}

function FavRow({ item }: { item: Hit }) {
  return (
    <Link
      to={item.path}
      className="paper lift flex items-center gap-3 p-3"
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-900/10 text-emerald-800">
        <Icon name={iconFor(item.type)} size={16} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="line-clamp-1 text-sm font-semibold text-ink">{item.title}</div>
        {item.subtitle && <div className="line-clamp-1 text-xs text-ink-mute">{item.subtitle}</div>}
      </div>
      <Icon name="ChevronRight" size={14} className="text-ink-mute" />
    </Link>
  );
}

function iconFor(t: string) {
  return t === "book" ? "BookOpen" : t === "azkar" ? "Moon" : t === "hadith" ? "Quote" : t === "article" ? "FileText" : "User";
}

export function HistoryPage() {
  const { t } = useTranslation();
  const recents = useApp((s) => s.recents);
  const clear = useApp((s) => s.clearRecents);
  return (
    <PageShell title={t("history.title")}>
      <div className="container-x pt-4">
        <SectionHeader
          title={t("history.title")}
          subtitle={t("history.subtitle")}
          action={
            recents.length > 0 ? (
              <button onClick={clear} className="text-xs font-medium text-ink-mute hover:text-red-600">
                Очистить
              </button>
            ) : null
          }
        />
        {recents.length === 0 ? (
          <div className="paper p-10 text-center">
            <Icon name="Clock" size={36} className="mx-auto text-ink-mute" />
            <p className="mt-3 text-sm text-ink-soft">{t("history.empty")}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recents.map((r) => (
              <Link key={r.id + r.ts} to={r.path} className="paper lift flex items-center gap-3 p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400/15 text-amber-700">
                  <Icon name={iconFor(r.type)} size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="line-clamp-1 text-sm font-semibold text-ink">{r.title}</div>
                  <div className="text-[11px] text-ink-mute">{new Date(r.ts).toLocaleString()}</div>
                </div>
                <Icon name="ChevronRight" size={14} className="text-ink-mute" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}

export function SearchPage() {
  const { t } = useTranslation();
  const [q, setQ] = useState("");

  const hits = useMemo<Hit[]>(() => {
    if (!q.trim()) return [];
    const s = q.toLowerCase();
    const list: Hit[] = [];
    for (const b of BOOKS) {
      if ((b.title || "").toLowerCase().includes(s) || (b.author || "").toLowerCase().includes(s) || (b.description || "").toLowerCase().includes(s)) {
        list.push({ type: "book", title: b.title, subtitle: b.author, path: `/books/reader/${b.id}` });
      }
    }
    for (const a of AZKAR) {
      if ((a.title || "").toLowerCase().includes(s) || (a.translation || "").toLowerCase().includes(s)) {
        list.push({ type: "azkar", title: a.title, subtitle: a.source || "", path: `/azkar/folder/${a.folder}` });
      }
    }
    for (const h of HADITHS) {
      if ((h.text || "").toLowerCase().includes(s) || (h.narrator || "").toLowerCase().includes(s)) {
        list.push({ type: "hadith", title: h.text.slice(0, 70) + (h.text.length > 70 ? "…" : ""), subtitle: h.book || "", path: `/hadith/collection/${h.collectionId}` });
      }
    }
    for (const a of ARTICLES) {
      if ((a.title || "").toLowerCase().includes(s) || (a.excerpt || "").toLowerCase().includes(s)) {
        list.push({ type: "article", title: a.title, subtitle: a.author || "", path: `/articles/view/${a.id}` });
      }
    }
    for (const b of BIOGRAPHIES) {
      if ((b.name || "").toLowerCase().includes(s) || (b.description || "").toLowerCase().includes(s)) {
        list.push({ type: "biography", title: b.name, subtitle: b.description || "", path: `/biographies/view/${b.id}` });
      }
    }
    return list.slice(0, 50);
  }, [q]);

  return (
    <PageShell title={t("nav.search")} showBack>
      <div className="container-x pt-4">
        <SearchBar value={q} onChange={setQ} autoFocus className="mb-4" />
        {q.trim() && hits.length === 0 && (
          <div className="paper p-10 text-center text-sm text-ink-soft">
            Ничего не найдено по запросу «{q}»
          </div>
        )}
        <div className="space-y-2">
          {hits.map((h, i) => (
            <Link key={i} to={h.path} className="paper lift flex items-center gap-3 p-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-paper-2 text-ink-soft">
                <Icon name={iconFor(h.type)} size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="line-clamp-1 text-sm font-semibold text-ink">{h.title}</div>
                {h.subtitle && <div className="line-clamp-1 text-xs text-ink-mute">{h.subtitle}</div>}
              </div>
              <span className="rounded-full bg-paper-2 px-2 py-0.5 text-[10px] uppercase text-ink-mute">{h.type}</span>
            </Link>
          ))}
        </div>
      </div>
    </PageShell>
  );
}