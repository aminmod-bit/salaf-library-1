import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { PageShell } from "@/components/system/PageShell";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { BookCard } from "@/components/ui/BookCard";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { BOOKS, HADITHS } from "@/data/content";
import { BOOK_FOLDERS, AZKAR_FOLDERS, HADITH_COLLECTIONS } from "@/data/folders";
import { colorFromString } from "@/utils/helpers";

const STATS = [
  { key: "books", icon: "BookOpen", value: BOOKS.length, suffix: "книг", color: "#0f3d2e" },
  { key: "hadith", icon: "Quote", value: HADITH_COLLECTIONS.length, suffix: "сборников", color: "#1b5e3f" },
  { key: "azkar", icon: "Moon", value: AZKAR_FOLDERS.length, suffix: "разделов", color: "#3a2a14" },
  { key: "langs", icon: "Languages", value: 6, suffix: "языков", color: "#1f2a3a" },
];

export default function HomePage() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const featured = BOOKS.filter((b) => b.featured).slice(0, 6);
  const newest = BOOKS.filter((b) => b.isNew).slice(0, 6);
  const todaysHadith = HADITHS[Math.floor(Date.now() / 86_400_000) % HADITHS.length];

  return (
    <PageShell>
      {/* Hero */}
      <section className="container-x pt-4 sm:pt-6">
        <div className="relative overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-700 p-6 text-white shadow-xl sm:p-10">
          <div
            className="absolute -right-12 -top-12 h-56 w-56 rounded-full bg-amber-400/20"
            style={{ filter: "blur(10px)" }}
          />
          <div
            className="absolute right-12 bottom-0 h-32 w-32 rounded-full bg-amber-300/10"
            style={{ filter: "blur(20px)" }}
          />
          <div className="relative">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs backdrop-blur-sm">
              <Icon name="Sparkles" size={12} className="text-amber-300" />
              <span>v 1.0 · {t("app.tagline")}</span>
            </div>
            <h1 className="font-serif text-3xl font-bold leading-tight sm:text-5xl">
              {t("home.hero_title")}
            </h1>
            <p className="mt-3 max-w-xl text-sm text-white/80 sm:text-base">
              {t("home.hero_subtitle")}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button onClick={() => nav("/books")} variant="gold" icon={<Icon name="BookOpen" size={16} />}>
                {t("nav.books")}
              </Button>
              <Button onClick={() => nav("/hadith")} variant="secondary" className="bg-white/10 text-white hover:bg-white/20" icon={<Icon name="Quote" size={16} />}>
                {t("nav.hadith")}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="container-x mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {STATS.map((s) => (
          <div
            key={s.key}
            className="paper flex items-center gap-3 p-3 sm:p-4"
            style={{ borderLeft: `4px solid ${s.color}` }}
          >
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
              style={{ background: s.color }}
            >
              <Icon name={s.icon} size={18} />
            </div>
            <div>
              <div className="text-lg font-semibold text-ink">{s.value}</div>
              <div className="text-[11px] text-ink-mute">{s.suffix}</div>
            </div>
          </div>
        ))}
      </section>

      {/* Hadith of the day */}
      <section className="container-x mt-8">
        <SectionHeader title={t("home.hadith_of_day")} />
        <div className="paper relative overflow-hidden p-6 sm:p-8">
          <div
            className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-amber-400/10"
            style={{ filter: "blur(8px)" }}
          />
          {todaysHadith && (
            <>
              <div className="arabic text-xl leading-loose text-emerald-900 sm:text-2xl">
                {todaysHadith.arabic}
              </div>
              <div className="mt-4 border-l-2 border-amber-400 pl-4 text-sm italic text-ink-soft">
                {todaysHadith.text}
              </div>
              <div className="mt-3 flex items-center gap-3 text-xs text-ink-mute">
                <span className="rounded-full bg-emerald-900/10 px-2 py-0.5 text-emerald-800">
                  {todaysHadith.book}
                </span>
                <span>·</span>
                <span>{todaysHadith.narrator}</span>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section className="container-x mt-8">
          <SectionHeader
            title={t("home.featured_books")}
            action={
              <button onClick={() => nav("/books")} className="flex items-center gap-1 text-xs font-medium text-emerald-800 hover:underline">
                {t("common.more")} <Icon name="ChevronRight" size={14} />
              </button>
            }
          />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {featured.map((b) => <BookCard key={b.id} book={b} />)}
          </div>
        </section>
      )}

      {/* Browse by section */}
      <section className="container-x mt-10">
        <SectionHeader
          title={t("home.explore_categories")}
          subtitle={t("home.explore_subtitle")}
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {BOOK_FOLDERS.slice(0, 8).map((f) => (
            <button
              key={f.id}
              onClick={() => nav(`/books/folder/${f.key}`)}
              className="paper lift relative flex flex-col gap-2 overflow-hidden rounded-2xl p-4 text-left"
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
                style={{ background: f.coverColor }}
              >
                <Icon name={f.iconKey} size={20} />
              </div>
              <div>
                <div className="text-sm font-semibold text-ink">{f.label}</div>
                {f.labelAr && <div className="arabic text-xs text-ink-mute">{f.labelAr}</div>}
              </div>
              <div className="text-[11px] text-ink-mute line-clamp-2">{f.description}</div>
            </button>
          ))}
        </div>
      </section>

      {/* Quick access */}
      <section className="container-x mt-10">
        <SectionHeader title={t("home.quick")} />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { to: "/azkar", icon: "Moon", label: t("nav.azkar"), color: "#0a2a3a" },
            { to: "/hadith", icon: "Quote", label: t("nav.hadith"), color: "#1f2a3a" },
            { to: "/articles", icon: "FileText", label: t("nav.articles"), color: "#2a3d1a" },
            { to: "/biographies", icon: "User", label: t("nav.biographies"), color: "#3a1a2a" },
          ].map((q) => (
            <button
              key={q.to}
              onClick={() => nav(q.to)}
              className="paper lift relative flex flex-col gap-2 overflow-hidden rounded-2xl p-4 text-left"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl text-white" style={{ background: q.color }}>
                <Icon name={q.icon} size={20} />
              </div>
              <div className="text-sm font-semibold text-ink">{q.label}</div>
              <Icon name="ChevronRight" size={14} className="absolute right-3 top-3 text-ink-mute" />
            </button>
          ))}
        </div>
      </section>

      {/* New */}
      {newest.length > 0 && (
        <section className="container-x mt-10 mb-2">
          <SectionHeader title={t("home.new_books")} />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {newest.map((b) => <BookCard key={b.id} book={b} />)}
          </div>
        </section>
      )}

      <div className="container-x mt-10 mb-6 text-center">
        <p className="text-xs text-ink-mute">
          Salaf Library · {new Date().getFullYear()} · Built with ❤ for the ummah
        </p>
        <p className="mt-1 text-[10px] text-ink-mute">
          Используется material из открытых исламских источников · {colorFromString("footer").toUpperCase()}
        </p>
      </div>
    </PageShell>
  );
}