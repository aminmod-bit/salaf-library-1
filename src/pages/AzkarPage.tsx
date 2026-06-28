import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
// (useNavigate retained for child page)
import { useTranslation } from "react-i18next";
import { PageShell } from "@/components/system/PageShell";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { FolderCard } from "@/components/ui/FolderCard";
import { SearchBar } from "@/components/ui/SearchBar";
import { AZKAR_FOLDERS } from "@/data/folders";
import { AZKAR } from "@/data/content";
import { useApp } from "@/store/useApp";

export function AzkarFoldersPage() {
  const { t } = useTranslation();
  const favs = useApp((s) => s.favorites.azkar);
  const counts = useMemo(() => {
    const map: Record<string, number> = { all: AZKAR.length, favorites: favs.length };
    for (const a of AZKAR) map[a.folder] = (map[a.folder] || 0) + 1;
    return map;
  }, [favs.length]);

  return (
    <PageShell title={t("azkar.title")}>
      <div className="container-x pt-4">
        <SectionHeader title={t("azkar.title")} subtitle={t("azkar.subtitle")} />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {AZKAR_FOLDERS.map((f) => (
            <FolderCard
              key={f.id}
              folder={f}
              count={counts[f.key]}
              to={`/azkar/folder/${f.key}`}
            />
          ))}
        </div>
      </div>
    </PageShell>
  );
}

export function AzkarFolderPage() {
  const { t } = useTranslation();
  const { folderKey = "" } = useParams<{ folderKey: string }>();
  const nav = useNavigate();
  const folder = AZKAR_FOLDERS.find((f) => f.key === folderKey);
  const favs = useApp((s) => s.favorites.azkar);
  const isFav = folderKey === "favorites";
  const list = useMemo(() => {
    if (isFav) return AZKAR.filter((a) => favs.includes(a.id));
    if (folderKey === "all") return AZKAR;
    return AZKAR.filter((a) => a.folder === folderKey);
  }, [folderKey, favs, isFav]);
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    if (!query.trim()) return list;
    const q = query.toLowerCase();
    return list.filter((a) =>
      (a.title || "").toLowerCase().includes(q) ||
      (a.translation || "").toLowerCase().includes(q) ||
      (a.arabic || "").includes(query)
    );
  }, [list, query]);

  return (
    <PageShell title={folder?.label} showBack>
      <div className="container-x pt-4">
        <button onClick={() => nav("/azkar")} className="mb-3 flex items-center gap-1 text-xs font-medium text-ink-soft hover:text-emerald-800">
          <Icon name="ArrowLeft" size={12} /> Все разделы
        </button>
        <SearchBar value={query} onChange={setQuery} placeholder="Поиск по азкарам…" className="mb-4" />
        {filtered.length === 0 ? (
          <div className="paper p-10 text-center">
            <Icon name="BookX" size={36} className="mx-auto text-ink-mute" />
            <p className="mt-3 text-sm text-ink-soft">{t("common.empty")}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((a) => <AzkarItemRow key={a.id} item={a} />)}
          </div>
        )}
      </div>
    </PageShell>
  );
}

interface AzkarItemRowProps { item: typeof AZKAR[number]; }

function AzkarItemRow({ item }: AzkarItemRowProps) {
  const fav = useApp((s) => s.favorites.azkar.includes(item.id));
  const toggle = useApp((s) => s.toggleFavorite);
  const [count, setCount] = useState(0);
  const target = item.count || 1;

  const done = count >= target;

  return (
    <article className="paper relative overflow-hidden p-4 sm:p-5">
      {done && (
        <div className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-700 text-white shadow">
          <Icon name="Check" size={14} />
        </div>
      )}
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-serif text-base font-semibold text-ink sm:text-lg">{item.title}</h3>
          {item.titleAr && <div className="arabic mt-0.5 text-sm text-ink-mute">{item.titleAr}</div>}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => toggle("azkar", item.id)}
            className={`rounded-full p-1.5 transition-colors ${fav ? "text-amber-500" : "text-ink-mute hover:text-amber-500"}`}
            aria-label={fav ? "Remove" : "Save"}
          >
            <Icon name="Star" size={14} className={fav ? "fill-amber-400" : ""} />
          </button>
        </div>
      </div>

      {item.arabic && (
        <div className="arabic mt-3 rounded-xl bg-paper-2/60 p-4 text-lg leading-loose text-emerald-900">
          {item.arabic}
        </div>
      )}
      {item.transliteration && (
        <div className="mt-2 italic text-sm text-ink-soft">{item.transliteration}</div>
      )}
      {item.translation && (
        <p className="mt-2 border-l-2 border-amber-400 pl-3 text-sm text-ink">{item.translation}</p>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-ink-mute">
        {item.source && (
          <span className="rounded-full bg-paper-2 px-2 py-0.5">📚 {item.source}</span>
        )}
        {item.fadl && (
          <span className="rounded-full bg-emerald-900/10 px-2 py-0.5 text-emerald-800">✨ {item.fadl}</span>
        )}
      </div>

      {target > 1 && (
        <div className="mt-4 flex items-center gap-2">
          <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-paper-2">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-emerald-700 transition-all"
              style={{ width: `${Math.min(100, (count / target) * 100)}%` }}
            />
          </div>
          <div className="text-xs font-medium text-ink-soft">
            {count}/{target}
          </div>
        </div>
      )}

      <div className="mt-3 flex gap-2">
        <Button
          size="sm"
          variant={done ? "secondary" : "primary"}
          onClick={() => setCount((c) => Math.min(target, c + 1))}
          icon={<Icon name="Plus" size={14} />}
        >
          {done ? "Готово" : `Считать (${count}/${target})`}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setCount(0)}
          icon={<Icon name="RotateCcw" size={14} />}
        >
          Сброс
        </Button>
      </div>
    </article>
  );
}