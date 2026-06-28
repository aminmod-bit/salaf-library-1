import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PageShell } from "@/components/system/PageShell";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Icon } from "@/components/ui/Icon";
import { SearchBar } from "@/components/ui/SearchBar";
import { useState } from "react";
import { BIO_FOLDERS } from "@/data/folders";
import { BIOGRAPHIES } from "@/data/content";
import { FolderCard } from "@/components/ui/FolderCard";

export function BiographiesFoldersPage() {
  const { t } = useTranslation();
  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const b of BIOGRAPHIES) map[b.folder] = (map[b.folder] || 0) + 1;
    return map;
  }, []);
  return (
    <PageShell title={t("biographies.title")}>
      <div className="container-x pt-4">
        <SectionHeader title={t("biographies.title")} subtitle={t("biographies.subtitle")} />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {BIO_FOLDERS.map((f) => (
            <FolderCard key={f.id} folder={f} count={counts[f.key]} to={`/biographies/folder/${f.key}`} />
          ))}
        </div>
      </div>
    </PageShell>
  );
}

export function BiographiesFolderPage() {
  const { t } = useTranslation();
  const { folderKey = "" } = useParams<{ folderKey: string }>();
  const nav = useNavigate();
  const folder = BIO_FOLDERS.find((f) => f.key === folderKey);
  const list = useMemo(() => BIOGRAPHIES.filter((b) => b.folder === folderKey), [folderKey]);
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    if (!q.trim()) return list;
    const s = q.toLowerCase();
    return list.filter((b) => b.name.toLowerCase().includes(s) || (b.description || "").toLowerCase().includes(s));
  }, [list, q]);

  return (
    <PageShell title={folder?.label} showBack>
      <div className="container-x pt-4">
        <button onClick={() => nav("/biographies")} className="mb-3 flex items-center gap-1 text-xs font-medium text-ink-soft hover:text-emerald-800">
          <Icon name="ArrowLeft" size={12} /> Все разделы
        </button>
        <SearchBar value={q} onChange={setQ} placeholder="Поиск…" className="mb-4" />
        {filtered.length === 0 ? (
          <div className="paper p-10 text-center">
            <Icon name="UserX" size={36} className="mx-auto text-ink-mute" />
            <p className="mt-3 text-sm text-ink-soft">{t("common.empty")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((b) => (
              <button
                key={b.id}
                onClick={() => window.location.hash = `#/biographies/view/${b.id}`}
                className="paper lift relative flex items-center gap-4 overflow-hidden p-4 text-left"
                style={{ borderLeft: `4px solid ${b.coverColor}` }}
              >
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-2xl text-2xl text-white"
                  style={{ background: b.coverColor }}
                >
                  {b.coverEmoji || "👤"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-serif text-base font-semibold text-ink line-clamp-1">{b.name}</div>
                  {b.nameAr && <div className="arabic text-sm text-ink-mute line-clamp-1">{b.nameAr}</div>}
                  {b.birthYear && (
                    <div className="mt-1 text-[11px] text-ink-mute">
                      {b.birthYear}{b.deathYear && ` — ${b.deathYear}`}
                    </div>
                  )}
                  {b.description && (
                    <div className="mt-1 text-xs text-ink-soft line-clamp-2">{b.description}</div>
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

export function BiographyViewPage() {
  const { t } = useTranslation();
  const { biographyId = "" } = useParams<{ biographyId: string }>();
  const nav = useNavigate();
  const b = BIOGRAPHIES.find((x) => x.id === biographyId);
  if (!b) {
    return (
      <PageShell title={t("biographies.title")} showBack>
        <div className="container-x py-10 text-center text-sm text-ink-soft">Не найдено</div>
      </PageShell>
    );
  }
  return (
    <PageShell title={b.name} showBack>
      <article className="container-x mx-auto max-w-3xl pt-4">
        <button onClick={() => nav(`/biographies/folder/${b.folder}`)} className="mb-3 flex items-center gap-1 text-xs font-medium text-ink-soft hover:text-emerald-800">
          <Icon name="ArrowLeft" size={12} /> Назад к разделу
        </button>
        <div className="paper relative overflow-hidden p-6 sm:p-8">
          <div
            className="absolute -right-12 -top-12 h-48 w-48 rounded-full opacity-20"
            style={{ background: b.coverColor, filter: "blur(20px)" }}
          />
          <div className="relative flex items-start gap-5">
            <div
              className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl text-4xl text-white"
              style={{ background: b.coverColor }}
            >
              {b.coverEmoji || "👤"}
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold text-ink sm:text-3xl">{b.name}</h1>
              {b.nameAr && <div className="arabic mt-1 text-lg text-ink-soft">{b.nameAr}</div>}
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-ink-mute">
                {b.birthYear && <span>🗓 {b.birthYear}{b.deathYear && ` — ${b.deathYear}`}</span>}
                {b.birthPlace && <span>📍 {b.birthPlace}</span>}
              </div>
            </div>
          </div>
          {b.description && (
            <p className="mt-5 border-l-2 border-amber-400 pl-3 text-sm italic text-ink-soft">{b.description}</p>
          )}
          {b.fullBio && (
            <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-ink">
              {b.fullBio.split("\n").map((p, i) => <p key={i}>{p}</p>)}
            </div>
          )}
        </div>
      </article>
    </PageShell>
  );
}