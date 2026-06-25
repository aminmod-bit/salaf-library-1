import { useEffect, useMemo, useState } from 'react';
import { Download, RefreshCw, Smartphone, X } from 'lucide-react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
}

function isIosSafari() {
  const ua = window.navigator.userAgent.toLowerCase();
  const isIos = /iphone|ipad|ipod/.test(ua);
  const isSafari = /safari/.test(ua) && !/crios|fxios|edgios/.test(ua);
  return isIos && isSafari;
}

export default function PwaInstallPrompt() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(() => localStorage.getItem('salaf-library-install-dismissed') === '1');
  const [installed, setInstalled] = useState(false);
  const [showIosHelp, setShowIosHelp] = useState(false);
  const [swWaiting, setSwWaiting] = useState<ServiceWorker | null>(null);
  const ios = useMemo(() => typeof window !== 'undefined' && isIosSafari(), []);

  useEffect(() => {
    setInstalled(isStandalone());

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
      setDismissed(false);
    };

    const onInstalled = () => {
      setInstalled(true);
      setPromptEvent(null);
      localStorage.setItem('salaf-library-install-dismissed', '1');
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onInstalled);

    const onSwUpdate = (event: Event) => {
      const custom = event as CustomEvent<ServiceWorker>;
      if (custom.detail) setSwWaiting(custom.detail);
    };

    const onControllerChange = () => {
      if (sessionStorage.getItem('salaf-library-sw-refreshing') === '1') return;
      sessionStorage.setItem('salaf-library-sw-refreshing', '1');
      window.location.reload();
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(registration => {
        if (registration?.waiting) setSwWaiting(registration.waiting);
      });
      navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);
      window.addEventListener('salaf-library-sw-update', onSwUpdate as EventListener);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onInstalled);
      navigator.serviceWorker?.removeEventListener('controllerchange', onControllerChange);
      window.removeEventListener('salaf-library-sw-update', onSwUpdate as EventListener);
    };
  }, []);

  const install = async () => {
    if (promptEvent) {
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      if (choice.outcome === 'accepted') setInstalled(true);
      setPromptEvent(null);
      return;
    }
    if (ios) setShowIosHelp(true);
  };

  const dismiss = () => {
    setDismissed(true);
    localStorage.setItem('salaf-library-install-dismissed', '1');
  };

  const updateApp = () => {
    if (!swWaiting) return;
    swWaiting.postMessage({ type: 'SKIP_WAITING' });
  };

  if (swWaiting) {
    return (
      <div className="pwa-install-card" role="status">
        <RefreshCw size={18} />
        <div><strong>Доступно обновление</strong><span>Обновите приложение для новой версии.</span></div>
        <button onClick={updateApp}>Обновить</button>
      </div>
    );
  }

  if (installed || dismissed || (!promptEvent && !ios)) return null;

  return (
    <>
      <div className="pwa-install-card" role="region" aria-label="Установка приложения">
        <Smartphone size={19} />
        <div><strong>Установить приложение</strong><span>Salaf Library будет открываться как отдельное приложение.</span></div>
        <button onClick={install}><Download size={15} /> Установить</button>
        <button className="ghost" aria-label="Закрыть" onClick={dismiss}><X size={16} /></button>
      </div>

      {showIosHelp && (
        <div className="pwa-modal" role="dialog" aria-modal="true">
          <div className="pwa-modal-card">
            <button className="close" onClick={() => setShowIosHelp(false)}><X size={18} /></button>
            <h2>Установка на iPhone / iPad</h2>
            <ol>
              <li>Откройте сайт в Safari.</li>
              <li>Нажмите кнопку «Поделиться».</li>
              <li>Выберите «Добавить на экран Домой».</li>
              <li>Нажмите «Добавить».</li>
            </ol>
          </div>
        </div>
      )}

      <style>{css}</style>
    </>
  );
}

const css = `
.pwa-install-card{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:999;display:flex;align-items:center;gap:12px;max-width:min(620px,calc(100vw - 24px));padding:12px 14px;border-radius:18px;background:linear-gradient(135deg,rgba(9,24,16,.98),rgba(17,42,26,.98));border:1px solid rgba(212,175,55,.24);box-shadow:0 18px 60px rgba(0,0,0,.45);color:#f0f4f1;backdrop-filter:blur(18px)}
.pwa-install-card strong{display:block;font-size:14px}.pwa-install-card span{display:block;color:#9db8a3;font-size:12px}.pwa-install-card button{display:inline-flex;align-items:center;gap:6px;border:0;border-radius:12px;background:linear-gradient(135deg,#d4af37,#f0c84a);color:#07130b;font-weight:850;padding:9px 12px;cursor:pointer;white-space:nowrap}.pwa-install-card button.ghost{background:rgba(255,255,255,.05);color:#9db8a3;border:1px solid rgba(255,255,255,.08);padding:8px}.pwa-modal{position:fixed;inset:0;z-index:1000;background:rgba(0,0,0,.62);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:20px}.pwa-modal-card{position:relative;max-width:420px;width:100%;border-radius:22px;background:#0d2218;border:1px solid rgba(212,175,55,.22);box-shadow:0 22px 80px rgba(0,0,0,.55);padding:26px;color:#f0f4f1}.pwa-modal-card h2{font-size:22px;font-weight:900;margin:0 0 14px}.pwa-modal-card li{margin:10px 0;color:#9db8a3}.pwa-modal-card .close{position:absolute;top:12px;right:12px;border:0;background:rgba(255,255,255,.05);color:#9db8a3;border-radius:10px;padding:8px;cursor:pointer}@media(max-width:640px){.pwa-install-card{left:12px;right:12px;bottom:12px;transform:none;align-items:flex-start}.pwa-install-card>svg{margin-top:2px}.pwa-install-card button:not(.ghost){padding:8px 10px;font-size:12px}}
`;
