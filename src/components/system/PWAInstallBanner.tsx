import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { useApp } from "@/store/useApp";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function PWAInstallBanner() {
  const { t } = useTranslation();
  const dismissed = useApp((s) => s.installDismissed);
  const dismiss = useApp((s) => s.dismissInstall);
  const [ev, setEv] = useState<BeforeInstallPromptEvent | null>(null);
  const [ios, setIos] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (dismissed) return;

    const onBefore = (e: Event) => {
      e.preventDefault();
      setEv(e as BeforeInstallPromptEvent);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", onBefore);

    // iOS detection
    const ua = window.navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(ua) && !(window as any).MSStream;
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as any).standalone;
    if (isIOS && !isStandalone) setIos(true);

    return () => window.removeEventListener("beforeinstallprompt", onBefore);
  }, [dismissed]);

  if (dismissed || !show) return null;

  const handleInstall = async () => {
    if (ev) {
      try {
        await ev.prompt();
        await ev.userChoice;
      } catch {}
      setEv(null);
    }
    setShow(false);
    dismiss();
  };

  return (
    <div className="container-x mb-4">
      <div className="paper-soft relative overflow-hidden rounded-2xl border border-amber-300/40 bg-gradient-to-br from-amber-50 to-amber-100 p-4 shadow-sm">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-amber-300/30" />
        <div className="absolute -right-2 -bottom-8 h-20 w-20 rounded-full bg-amber-400/20" />
        <div className="relative flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400 text-white shadow">
            <Icon name="Download" size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-ink">{t("pwa.install_available")}</div>
            <div className="mt-0.5 text-xs text-ink-soft">{t("pwa.install_desc")}</div>

            {ios ? (
              <ol className="mt-2 space-y-1 text-[11px] text-ink-soft">
                <li className="flex items-center gap-1.5"><Icon name="Check" size={11} className="text-amber-600" />{t("pwa.ios_step1")}</li>
                <li className="flex items-center gap-1.5"><Icon name="Check" size={11} className="text-amber-600" />{t("pwa.ios_step2")}</li>
                <li className="flex items-center gap-1.5"><Icon name="Check" size={11} className="text-amber-600" />{t("pwa.ios_step3")}</li>
              </ol>
            ) : (
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="gold" onClick={handleInstall}>{t("common.install")}</Button>
                <Button size="sm" variant="ghost" onClick={() => { setShow(false); dismiss(); }}>{t("common.cancel")}</Button>
              </div>
            )}
          </div>
          <button
            onClick={() => { setShow(false); dismiss(); }}
            className="text-ink-mute hover:text-ink"
            aria-label={t("common.close")}
          >
            <Icon name="X" size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

/** Register SW + listen for updates */
export function useServiceWorker() {
  const [updateReady, setUpdateReady] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("./sw.js").then((reg) => {
      setRegistration(reg);
      reg.addEventListener("updatefound", () => {
        const sw = reg.installing;
        if (!sw) return;
        sw.addEventListener("statechange", () => {
          if (sw.state === "installed" && navigator.serviceWorker.controller) {
            setUpdateReady(true);
          }
        });
      });
    }).catch(() => {});
  }, []);

  return { updateReady, refresh: () => {
    if (!registration?.waiting) { window.location.reload(); return; }
    registration.waiting.postMessage({ type: "SKIP_WAITING" });
    window.location.reload();
  }};
}