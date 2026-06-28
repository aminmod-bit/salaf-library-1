import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/ui/Icon";
import { setLanguage } from "@/i18n";
import { useState } from "react";
import { cn } from "@/utils/cn";

interface TopBarProps {
  showBack?: boolean;
  title?: string;
}

export function TopBar({ showBack, title }: TopBarProps) {
  const nav = useNavigate();
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 safe-bottom">
      <div className="paper-soft border-b border-line">
        <div className="container-x flex h-14 items-center gap-2 sm:h-16">
          {showBack ? (
            <button
              onClick={() => nav(-1)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-ink hover:bg-paper-2"
              aria-label={t("common.back")}
            >
              <Icon name="ArrowLeft" size={20} />
            </button>
          ) : (
            <Link to="/" className="flex items-center gap-2">
              <div className="brand-gradient flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-md">
                <Icon name="BookMarked" size={18} />
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-semibold leading-tight text-ink">Salaf Library</div>
                <div className="text-[10px] uppercase tracking-wider text-ink-mute">{t("app.tagline")}</div>
              </div>
            </Link>
          )}

          {showBack && title && (
            <h1 className="ml-1 truncate text-base font-semibold text-ink">{title}</h1>
          )}

          <div className="ml-auto flex items-center gap-1">
            <button
              onClick={() => nav("/search")}
              className="flex h-9 w-9 items-center justify-center rounded-full text-ink hover:bg-paper-2"
              aria-label={t("nav.search")}
            >
              <Icon name="Search" size={18} />
            </button>

            <div className="relative">
              <button
                onClick={() => setOpen((v) => !v)}
                className="flex h-9 items-center gap-1 rounded-full px-2 text-ink hover:bg-paper-2"
                aria-label="Language"
              >
                <Icon name="Globe" size={16} />
                <span className="text-xs font-medium uppercase">{i18n.language}</span>
              </button>
              {open && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
                  <div className="absolute right-0 z-40 mt-2 w-44 overflow-hidden rounded-2xl border border-line bg-white shadow-xl">
                    {[
                      { code: "ru", label: "Русский", flag: "🇷🇺" },
                      { code: "ar", label: "العربية", flag: "🇸🇦" },
                      { code: "tg", label: "Тоҷикӣ", flag: "🇹🇯" },
                      { code: "uz", label: "Oʻzbek", flag: "🇺🇿" },
                      { code: "fa", label: "فارسی", flag: "🇮🇷" },
                      { code: "en", label: "English", flag: "🇬🇧" },
                    ].map((l) => (
                      <button
                        key={l.code}
                        onClick={() => { setLanguage(l.code); setOpen(false); }}
                        className={cn(
                          "flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-paper-2",
                          i18n.language === l.code && "bg-paper-2 font-semibold"
                        )}
                      >
                        <span>{l.flag}</span>
                        <span>{l.label}</span>
                        {i18n.language === l.code && (
                          <Icon name="Check" size={14} className="ml-auto text-emerald-700" />
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}