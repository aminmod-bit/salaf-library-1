import { PageShell } from "@/components/system/PageShell";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Icon } from "@/components/ui/Icon";
import { useApp } from "@/store/useApp";
import { BOOKS, AZKAR, HADITHS, ARTICLES, BIOGRAPHIES } from "@/data/content";

/** Lightweight Admin overview — for managing content via JSON + GitHub Actions */
export default function AdminPage() {
  const favs = useApp((s) => s.favorites);
  const recents = useApp((s) => s.recents);

  const sections = [
    {
      key: "books",
      title: "Книги",
      icon: "BookOpen",
      color: "#0f3d2e",
      count: BOOKS.length,
      paths: ["public/books/", "public/data/books.json", "public/covers/"],
      desc: "PDF-файлы, обложки и метаданные",
    },
    {
      key: "azkar",
      title: "Азкары",
      icon: "Moon",
      color: "#3a2a14",
      count: AZKAR.length,
      paths: ["src/data/content.ts"],
      desc: "Поминания Аллаха с переводами и счётчиком",
    },
    {
      key: "hadith",
      title: "Хадисы",
      icon: "Quote",
      color: "#1f2a3a",
      count: HADITHS.length,
      paths: ["src/data/content.ts", "src/data/folders.ts"],
      desc: "Сборники, главы и тексты хадисов",
    },
    {
      key: "articles",
      title: "Статьи",
      icon: "FileText",
      color: "#2a3d1a",
      count: ARTICLES.length,
      paths: ["src/data/content.ts"],
      desc: "Тематические материалы",
    },
    {
      key: "biographies",
      title: "Биографии",
      icon: "User",
      color: "#3a1a2a",
      count: BIOGRAPHIES.length,
      paths: ["src/data/content.ts"],
      desc: "Пророки, сподвижники, учёные",
    },
  ];

  return (
    <PageShell title="Админ">
      <div className="container-x pt-4">
        <SectionHeader
          title="Админ-панель"
          subtitle="Обзор контента библиотеки. Редактируйте данные в JSON / TS файлах и пушьте в GitHub."
        />

        <div className="paper mb-4 p-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Избранных" value={Object.values(favs).reduce((s, l) => s + l.length, 0)} icon="Star" />
            <Stat label="В истории" value={recents.length} icon="Clock" />
            <Stat label="Версия" value="1.0" icon="Package" />
            <Stat label="PWA" value="Ready" icon="Smartphone" />
          </div>
        </div>

        <SectionHeader title="Разделы каталога" />
        <div className="space-y-3">
          {sections.map((s) => (
            <div key={s.key} className="paper flex items-start gap-4 p-4 sm:p-5">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white"
                style={{ background: s.color }}
              >
                <Icon name={s.icon} size={22} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-serif text-base font-semibold text-ink">{s.title}</h3>
                  <span className="rounded-full bg-paper-2 px-2 py-0.5 text-xs font-medium text-ink-soft">{s.count}</span>
                </div>
                <p className="text-xs text-ink-soft">{s.desc}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {s.paths.map((p) => (
                    <code key={p} className="rounded bg-paper-2 px-2 py-0.5 text-[11px] text-ink-soft">{p}</code>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <SectionHeader title="Workflow" />
        <ol className="paper space-y-2 p-5 text-sm text-ink-soft">
          <li className="flex gap-2"><span className="text-emerald-700 font-semibold">1.</span> Подготовьте PDF/аудио локально</li>
          <li className="flex gap-2"><span className="text-emerald-700 font-semibold">2.</span> Обновите <code className="rounded bg-paper-2 px-1">public/data/*.json</code></li>
          <li className="flex gap-2"><span className="text-emerald-700 font-semibold">3.</span> Проверьте через <code className="rounded bg-paper-2 px-1">npm run build</code></li>
          <li className="flex gap-2"><span className="text-emerald-700 font-semibold">4.</span> Сделайте commit и push</li>
          <li className="flex gap-2"><span className="text-emerald-700 font-semibold">5.</span> GitHub Actions опубликует обновление</li>
        </ol>

        <SectionHeader title="Хранилище будущего" />
        <div className="paper p-5">
          <div className="flex flex-wrap gap-2">
            {[
              "mediaUrl", "storageProvider", "R2 path strategy",
              "stats endpoint", "online users", "Workers API",
            ].map((t) => (
              <span key={t} className="rounded-full bg-amber-400/15 px-3 py-1 text-xs font-medium text-amber-800">
                {t}
              </span>
            ))}
          </div>
          <p className="mt-3 text-xs text-ink-mute">
            Архитектура подготовлена к Cloudflare R2 / Workers / Pages.
            Переключение поставщика хранилища — через конфиг без изменения UI.
          </p>
        </div>
      </div>
    </PageShell>
  );
}

function Stat({ label, value, icon }: { label: string; value: number | string; icon: string }) {
  return (
    <div className="rounded-xl bg-paper-2 p-3">
      <div className="flex items-center gap-2 text-ink-mute">
        <Icon name={icon} size={14} />
        <span className="text-[11px] uppercase tracking-wide">{label}</span>
      </div>
      <div className="mt-1 text-xl font-semibold text-ink">{value}</div>
    </div>
  );
}