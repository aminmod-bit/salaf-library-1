import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PageShell } from "@/components/system/PageShell";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Icon } from "@/components/ui/Icon";
import { SearchBar } from "@/components/ui/SearchBar";
import { useState } from "react";
import { HADITH_COLLECTIONS } from "@/data/folders";
import { HADITHS } from "@/data/content";

export function HadithCollectionsPage() {
  const { t } = useTranslation();
  return (
    <PageShell title={t("hadith.title")}>
      <div className="container-x pt-4">
        <SectionHeader title={t("hadith.title")} subtitle={t("hadith.subtitle")} />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {HADITH_COLLECTIONS.map((c) => (
            <button
              key={c.id}
              onClick={() => window.location.hash = `#/hadith/collection/${c.id}`}
              className="lift relative overflow-hidden rounded-2xl border border-line text-left h-36"
              style={{ background: `linear-gradient(135deg, ${c.coverColor} 0%, ${c.coverColor}cc 60%, ${c.coverColor}99 100%)` }}
              aria-label={c.name}
            >
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-amber-400/15" />
              <div className="absolute inset-0 flex flex-col justify-between p-4 text-white">
                <Icon name="Quote" size={22} className="opacity-70" />
                <div>
                  <div className="font-serif text-lg font-semibold leading-tight line-clamp-2">{c.name}</div>
                  <div className="arabic text-sm opacity-85">{c.nameAr}</div>
                  <div className="mt-1 text-[11px] opacity-70">{c.author}{c.count && ` · ${c.count} хадисов`}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </PageShell>
  );
}

export function HadithCollectionPage() {
  const { t } = useTranslation();
  const { collectionId = "" } = useParams<{ collectionId: string }>();
  const nav = useNavigate();
  const coll = HADITH_COLLECTIONS.find((c) => c.id === collectionId);
  const items = useMemo(() => HADITHS.filter((h) => h.collectionId === collectionId), [collectionId]);
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    if (!q.trim()) return items;
    const s = q.toLowerCase();
    return items.filter((h) =>
      h.text.toLowerCase().includes(s) ||
      (h.chapter || "").toLowerCase().includes(s) ||
      (h.narrator || "").toLowerCase().includes(s)
    );
  }, [items, q]);

  if (!coll) {
    return (
      <PageShell title={t("hadith.title")} showBack>
        <div className="container-x py-10 text-center">
          <p className="text-sm text-ink-soft">Сборник не найден</p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell title={coll.name} showBack>
      <div className="container-x pt-4">
        <button onClick={() => nav("/hadith")} className="mb-3 flex items-center gap-1 text-xs font-medium text-ink-soft hover:text-emerald-800">
          <Icon name="ArrowLeft" size={12} /> Все сборники
        </button>

        <div className="paper relative mb-5 overflow-hidden p-5">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-amber-400/15" />
          <div className="relative">
            <h2 className="font-serif text-2xl font-semibold text-ink">{coll.name}</h2>
            <div className="arabic text-base text-ink-mute">{coll.nameAr}</div>
            <div className="mt-1 text-xs text-ink-soft">{coll.author}</div>
          </div>
        </div>

        <SearchBar value={q} onChange={setQ} placeholder="Поиск по хадисам…" className="mb-4" />

        {filtered.length === 0 ? (
          <div className="paper p-10 text-center text-sm text-ink-soft">{t("common.empty")}</div>
        ) : (
          <div className="space-y-3">
            {filtered.map((h) => (
              <article key={h.id} className="paper relative overflow-hidden p-4 sm:p-5">
                <div className="mb-2 flex items-center gap-2 text-xs text-ink-mute">
                  <span className="rounded-full bg-paper-2 px-2 py-0.5">№ {h.number}</span>
                  {h.chapter && <span>· {h.chapter}</span>}
                  {h.grade && (
                    <span className={`ml-auto rounded-full px-2 py-0.5 ${
                      h.grade === "sahih" ? "bg-emerald-700/15 text-emerald-800" :
                      h.grade === "hasan" ? "bg-amber-400/20 text-amber-800" :
                      "bg-red-400/20 text-red-700"
                    }`}>
                      {h.grade === "sahih" ? t("hadith.grade_sahih") :
                       h.grade === "hasan" ? t("hadith.grade_hasan") : t("hadith.grade_daif")}
                    </span>
                  )}
                </div>
                <div className="arabic text-lg leading-loose text-emerald-900">{h.arabic}</div>
                <p className="mt-3 border-l-2 border-amber-400 pl-3 text-sm text-ink">{h.text}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-ink-mute">
                  {h.narrator && <span>Передал: {h.narrator}</span>}
                  {h.book && <span>· {h.book}</span>}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}