import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PageShell } from "@/components/system/PageShell";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Icon } from "@/components/ui/Icon";
import { LANGUAGE_PACKS } from "@/data/folders";
import { BOOKS } from "@/data/content";
import { BOOK_FOLDERS } from "@/data/folders";

export default function LibraryPage() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const stats = useMemo(() => {
    const map: Record<string, number> = {};
    for (const b of BOOKS) {
      map[b.languageCode] = (map[b.languageCode] || 0) + 1;
    }
    return map;
  }, []);

  return (
    <PageShell title={t("books.language_subtitle")}>
      <div className="container-x pt-4">
        <SectionHeader
          title={t("books.language_subtitle")}
          subtitle={t("books.choose_language")}
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {LANGUAGE_PACKS.map((lng) => {
            const count = stats[lng.code] || 0;
            return (
              <button
                key={lng.code}
                onClick={() => nav(`/library/${lng.code}`)}
                className="paper lift relative flex items-center gap-3 overflow-hidden rounded-2xl p-4 text-left"
              >
                <div className="text-3xl">{lng.flag}</div>
                <div className="min-w-0">
                  <div className={`text-sm font-semibold text-ink ${lng.rtl ? "arabic" : ""}`}>{lng.nativeLabel}</div>
                  <div className="text-[11px] text-ink-mute">{lng.label} · {count}</div>
                </div>
                <Icon name="ChevronRight" size={14} className="ml-auto text-ink-mute" />
              </button>
            );
          })}
        </div>
      </div>
    </PageShell>
  );
}

export function LibraryLanguagePage() {
  const { t } = useTranslation();
  const lang = window.location.hash.split("/").pop() || "";
  const lng = LANGUAGE_PACKS.find((l) => l.code === lang);
  const list = useMemo(() => BOOKS.filter((b) => b.languageCode === lang), [lang]);
  const nav = useNavigate();
  // group by category
  const grouped = useMemo(() => {
    const map: Record<string, typeof BOOKS> = {};
    for (const b of list) {
      if (!map[b.category]) map[b.category] = [];
      map[b.category].push(b);
    }
    return map;
  }, [list]);

  if (!lng) {
    return (
      <PageShell title={t("books.title")} showBack>
        <div className="container-x py-10 text-center text-sm text-ink-soft">Язык не найден</div>
      </PageShell>
    );
  }

  return (
    <PageShell title={lng.nativeLabel} showBack>
      <div className="container-x pt-4">
        <button onClick={() => nav("/library")} className="mb-3 flex items-center gap-1 text-xs font-medium text-ink-soft hover:text-emerald-800">
          <Icon name="ArrowLeft" size={12} /> Все языки
        </button>
        <div className="paper relative mb-5 overflow-hidden p-5">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-amber-400/15" />
          <div className="relative flex items-center gap-4">
            <div className="text-4xl">{lng.flag}</div>
            <div>
              <h2 className={`font-serif text-2xl font-semibold text-ink ${lng.rtl ? "arabic" : ""}`}>{lng.nativeLabel}</h2>
              <div className="text-sm text-ink-mute">{lng.label} · {list.length} книг</div>
            </div>
          </div>
        </div>

        {list.length === 0 ? (
          <div className="paper p-10 text-center text-sm text-ink-soft">
            На этом языке пока нет книг в каталоге.
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([key, items]) => {
              const folder = BOOK_FOLDERS.find((f) => f.key === key);
              return (
                <section key={key}>
                  <SectionHeader
                    title={
                      <span className="flex items-center gap-2">
                        <span className="inline-block h-2 w-2 rounded-full" style={{ background: folder?.coverColor }} />
                        {folder?.label || key}
                      </span>
                    }
                  />
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                    {items.map((b) => (
                      <a
                        key={b.id}
                        href={`#/books/reader/${b.id}`}
                        className="lift flex flex-col gap-2 fade-up"
                      >
                        <div
                          className="relative flex h-44 w-full items-center justify-center overflow-hidden rounded-2xl border border-line text-4xl text-white shadow-sm"
                          style={{ background: `linear-gradient(160deg, ${b.coverColor || "#0f3d2e"} 0%, ${b.coverColor || "#0f3d2e"}cc 100%)` }}
                        >
                          <span className="absolute inset-3 line-clamp-3 text-[10px] font-medium uppercase tracking-wider text-white/85 text-center">
                            {b.title}
                          </span>
                          <span className="opacity-90">{b.coverEmoji || "📖"}</span>
                        </div>
                        <div className="px-1">
                          <div className="line-clamp-2 text-sm font-semibold text-ink">{b.title}</div>
                          <div className="text-xs text-ink-soft line-clamp-1">{b.author}</div>
                        </div>
                      </a>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </PageShell>
  );
}