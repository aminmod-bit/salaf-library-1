import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/ui/Icon";

interface TopBarProps {
  showBack?: boolean;
  title?: string;
}

export function TopBar({ showBack, title }: TopBarProps) {
  const nav = useNavigate();
  const { t } = useTranslation();

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
                <div className="text-[10px] uppercase tracking-wider text-ink-mute">Исламская библиотека</div>
              </div>
            </Link>
          )}

          {showBack && title && (
            <h1 className="ml-1 truncate text-base font-semibold text-ink">{title}</h1>
          )}

          <div className="ml-auto flex items-center gap-1">
            <button
              onClick={() => nav("/books")}
              className="flex h-9 w-9 items-center justify-center rounded-full text-ink hover:bg-paper-2"
              aria-label="Поиск"
            >
              <Icon name="Search" size={18} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}