import { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { TopBar } from "@/components/ui/TopBar";
import { BottomNav, SideNav } from "@/components/ui/BottomNav";
import { PWAInstallBanner, useServiceWorker } from "@/components/system/PWAInstallBanner";
import { Icon } from "@/components/ui/Icon";

interface PageShellProps {
  children: ReactNode;
  title?: string;
  showBack?: boolean;
}

export function PageShell({ children, title, showBack }: PageShellProps) {
  const { t } = useTranslation();
  const sw = useServiceWorker();

  return (
    <div className="min-h-screen bg-paper">
      <TopBar showBack={showBack} title={title} />
      <div className="flex">
        <SideNav />
        <main className="min-w-0 flex-1 pb-24 md:pb-10">
          <PWAInstallBanner />
          {sw.updateReady && (
            <div className="container-x mb-3">
              <div className="flex items-center gap-3 rounded-xl border border-emerald-300/40 bg-emerald-50 px-4 py-2 text-xs text-emerald-900">
                <Icon name="Sparkles" size={14} />
                <span className="flex-1">{t("pwa.update_available")}</span>
                <button onClick={sw.refresh} className="rounded-full bg-emerald-700 px-3 py-1 text-[11px] font-medium text-white">
                  {t("pwa.refresh")}
                </button>
              </div>
            </div>
          )}
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}