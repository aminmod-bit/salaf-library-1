import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/utils/cn";

const items = [
  { to: "/", labelKey: "nav.home", icon: "Home", end: true },
  { to: "/books", labelKey: "nav.books", icon: "BookOpen" },
  { to: "/azkar", labelKey: "nav.azkar", icon: "Moon" },
  { to: "/hadith", labelKey: "nav.hadith", icon: "Quote" },
  { to: "/favorites", labelKey: "nav.favorites", icon: "Star" },
];

export function BottomNav() {
  const { t } = useTranslation();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 safe-bottom md:hidden">
      <div className="paper-soft border-t border-line">
        <div className="mx-auto flex max-w-md items-stretch justify-around px-2 py-1">
          {items.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              end={it.end as boolean | undefined}
              className={({ isActive }) =>
                cn(
                  "flex flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-1.5 text-[10px] font-medium transition-colors",
                  isActive ? "text-emerald-800" : "text-ink-mute hover:text-ink"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div className={cn(
                    "flex h-7 w-12 items-center justify-center rounded-full transition-all",
                    isActive ? "bg-emerald-900/10" : "bg-transparent"
                  )}>
                    <Icon name={it.icon} size={18} />
                  </div>
                  <span>{t(it.labelKey)}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}

/** Side navigation for desktop/tablet */
export function SideNav() {
  const { t } = useTranslation();
  const all = [
    { to: "/", labelKey: "nav.home", icon: "Home", end: true },
    { to: "/books", labelKey: "nav.books", icon: "BookOpen" },
    { to: "/library", labelKey: "nav.library", icon: "Languages" },
    { to: "/azkar", labelKey: "nav.azkar", icon: "Moon" },
    { to: "/hadith", labelKey: "nav.hadith", icon: "Quote" },
    { to: "/articles", labelKey: "nav.articles", icon: "FileText" },
    { to: "/biographies", labelKey: "nav.biographies", icon: "User" },
    { to: "/favorites", labelKey: "nav.favorites", icon: "Star" },
    { to: "/history", labelKey: "nav.history", icon: "Clock" },
    { to: "/admin", labelKey: "nav.admin", icon: "Settings" },
    { to: "/about", labelKey: "nav.about", icon: "Info" },
  ];
  return (
    <aside className="hidden w-60 shrink-0 border-r border-line bg-white/60 backdrop-blur md:block md:min-h-[calc(100vh-3.5rem)]">
      <div className="sticky top-16 p-3">
        <nav className="flex flex-col gap-0.5">
          {all.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              end={it.end as boolean | undefined}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-emerald-900 text-white shadow-sm"
                    : "text-ink-soft hover:bg-paper-2 hover:text-ink"
                )
              }
            >
              <Icon name={it.icon} size={18} />
              <span>{t(it.labelKey)}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
}