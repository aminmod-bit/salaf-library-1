import { useTranslation } from "react-i18next";
import { PageShell } from "@/components/system/PageShell";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { useNavigate } from "react-router-dom";
import { BOOKS, AZKAR, HADITHS, ARTICLES, BIOGRAPHIES } from "@/data/content";

export function AboutPage() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const stats = [
    { label: "Книг", value: BOOKS.length, icon: "BookOpen", color: "#0f3d2e" },
    { label: "Азкаров", value: AZKAR.length, icon: "Moon", color: "#3a2a14" },
    { label: "Хадисов", value: HADITHS.length, icon: "Quote", color: "#1f2a3a" },
    { label: "Статей", value: ARTICLES.length, icon: "FileText", color: "#2a3d1a" },
    { label: "Биографий", value: BIOGRAPHIES.length, icon: "User", color: "#3a1a2a" },
    { label: "Языков", value: 6, icon: "Languages", color: "#1a2a3a" },
  ];

  return (
    <PageShell title={t("app.name")} showBack>
      <div className="container-x pt-4">
        <div className="paper relative overflow-hidden p-6 sm:p-10">
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-amber-300/15" style={{ filter: "blur(20px)" }} />
          <div className="relative">
            <div className="brand-gradient inline-flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-md">
              <Icon name="BookMarked" size={22} />
            </div>
            <h1 className="mt-3 font-serif text-3xl font-bold text-ink sm:text-4xl">Salaf Library</h1>
            <p className="mt-2 text-sm text-ink-soft">v 1.0 · {t("app.tagline")}</p>
            <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-ink">
              Salaf Library — профессиональная исламская цифровая библиотека на React + TypeScript + Vite.
              Книги, PDF-читалка, азкары, хадисы, биографии и статьи в едином, быстром и красивом приложении.
              Устанавливается как PWA, работает офлайн, доступна на 6 языках.
            </p>
          </div>
        </div>

        <SectionHeader title="Возможности" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {stats.map((s) => (
            <div key={s.label} className="paper p-4">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
                style={{ background: s.color }}
              >
                <Icon name={s.icon} size={18} />
              </div>
              <div className="mt-2 text-2xl font-semibold text-ink">{s.value}</div>
              <div className="text-xs text-ink-mute">{s.label}</div>
            </div>
          ))}
        </div>

        <SectionHeader title="Технологии" />
        <div className="paper p-5">
          <div className="flex flex-wrap gap-2">
            {[
              "React 19", "TypeScript 5", "Vite 7", "Tailwind CSS 4",
              "Zustand", "i18next", "React Router 7", "Lucide Icons", "PWA", "PDF.js"
            ].map((tech) => (
              <span key={tech} className="rounded-full bg-emerald-900/10 px-3 py-1 text-xs font-medium text-emerald-800">
                {tech}
              </span>
            ))}
          </div>
        </div>

        <SectionHeader title="Roadmap" />
        <div className="space-y-2">
          {[
            { v: "1.0", title: "Production-ready PWA", desc: "Книги, читалка, азкары, хадисы, статьи, биографии, мультиязычность.", done: true },
            { v: "1.1", title: "Cloudflare R2 + Workers", desc: "Статистика просмотров, загрузок, онлайн-пользователей." },
            { v: "1.2", title: "Capacitor (Android/iOS)", desc: "Нативная обёртка с пуш-уведомлениями." },
            { v: "2.0", title: "Полноценная админка", desc: "Управление книгами, статьями и азкарами через GitHub API." },
          ].map((r) => (
            <div key={r.v} className="paper flex items-start gap-3 p-4">
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold text-white ${r.done ? "bg-emerald-700" : "bg-paper-2 text-ink-soft"}`}>
                {r.v}
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-ink">{r.title}</div>
                <div className="text-xs text-ink-soft">{r.desc}</div>
              </div>
              {r.done && <Icon name="CheckCircle" size={16} className="text-emerald-700" />}
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <Button variant="primary" icon={<Icon name="ArrowLeft" size={16} />} onClick={() => nav(-1)}>
            Назад
          </Button>
        </div>
      </div>
    </PageShell>
  );
}

export function NotFoundPage() {
  const nav = useNavigate();
  return (
    <PageShell title="404" showBack>
      <div className="container-x py-16 text-center">
        <div className="text-7xl">🌙</div>
        <h1 className="mt-3 font-serif text-3xl font-bold text-ink">Страница не найдена</h1>
        <p className="mt-2 text-sm text-ink-soft">Возможно, материал был перемещён или ещё не добавлен.</p>
        <Button className="mt-5" variant="primary" icon={<Icon name="Home" size={16} />} onClick={() => nav("/")}>
          На главную
        </Button>
      </div>
    </PageShell>
  );
}