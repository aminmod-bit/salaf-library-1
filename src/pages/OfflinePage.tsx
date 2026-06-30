import { useState, useEffect } from 'react';
import { Wifi, WifiOff, Download, Trash2, RefreshCw, Database, HardDrive } from 'lucide-react';
import toast from 'react-hot-toast';

interface CacheInfo {
  name: string;
  size: number;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' Б';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' КБ';
  return (bytes / (1024 * 1024)).toFixed(1) + ' МБ';
}

async function getCacheSize(): Promise<number> {
  if (!('caches' in window)) return 0;
  let total = 0;
  const names = await caches.keys();
  for (const name of names) {
    const cache = await caches.open(name);
    const keys = await cache.keys();
    for (const key of keys) {
      try {
        const response = await cache.match(key);
        if (response) {
          const blob = await response.blob();
          total += blob.size;
        }
      } catch {}
    }
  }
  return total;
}

async function getCaches(): Promise<CacheInfo[]> {
  if (!('caches' in window)) return [];
  const result: CacheInfo[] = [];
  const names = await caches.keys();
  for (const name of names) {
    const cache = await caches.open(name);
    const keys = await cache.keys();
    let size = 0;
    for (const key of keys) {
      try {
        const response = await cache.match(key);
        if (response) {
          const blob = await response.blob();
          size += blob.size;
        }
      } catch {}
    }
    result.push({ name, size });
  }
  return result;
}

async function cacheUrls(urls: string[], label: string) {
  if (!('caches' in window)) {
    toast.error('Браузер не поддерживает офлайн-кэш');
    return;
  }
  toast.loading(`Сохранение ${label}...`, { id: 'cache' });
  try {
    const cache = await caches.open('salaf-offline-data');
    let saved = 0;
    for (const url of urls) {
      try {
        const response = await fetch(url);
        if (response.ok) {
          await cache.put(url, response);
          saved++;
        }
      } catch {}
    }
    toast.success(`Сохранено ${saved}/${urls.length} файлов`, { id: 'cache' });
  } catch {
    toast.error('Ошибка сохранения', { id: 'cache' });
  }
}

async function clearAllCaches() {
  if (!('caches' in window)) return;
  const names = await caches.keys();
  for (const name of names) {
    await caches.delete(name);
  }
  toast.success('Весь кэш очищен');
}

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [totalSize, setTotalSize] = useState(0);
  const [caches, setCaches] = useState<CacheInfo[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    setIsOnline(navigator.onLine);
    setTotalSize(await getCacheSize());
    setCaches(await getCaches());
    setLoading(false);
  };

  useEffect(() => {
    refresh();
    const onOnline = () => { setIsOnline(true); refresh(); };
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  const saveSiteShell = () => {
    const urls = [
      './', './index.html', './manifest.json', './favicon.svg',
      './logo.svg', './logo-mark.svg', './offline.html',
      './data/books.json', './data/biographies.json', './data/categories.json',
      './data/articles.json', './data/azkar.json', './data/audio.json', './data/fawaid.json',
    ];
    cacheUrls(urls, 'оболочку сайта');
  };

  const saveBookOffline = async (bookUrl: string, title: string) => {
    if (!bookUrl) { toast.error('Нет URL файла'); return; }
    await cacheUrls([bookUrl], `книгу «${title}»`);
  };

  return (
    <div className="fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="glass-card" style={{ padding: '24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          {isOnline
            ? <Wifi size={24} style={{ color: 'var(--color-green-light)' }} />
            : <WifiOff size={24} style={{ color: '#ef4444' }} />
          }
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-text-primary)' }}>
              {isOnline ? 'Офлайн-режим' : 'Вы офлайн'}
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
              {isOnline
                ? 'Сохраняйте данные для чтения без интернета'
                : 'Доступны ранее сохранённые данные'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
          <div style={{ padding: '10px 14px', borderRadius: '10px', background: 'var(--color-bg-hover)', border: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Размер кэша</div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)' }}>{formatSize(totalSize)}</div>
          </div>
          <div style={{ padding: '10px 14px', borderRadius: '10px', background: 'var(--color-bg-hover)', border: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Кэшей</div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)' }}>{caches.length}</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button className="btn-primary" onClick={saveSiteShell}><Download size={14} /> Сохранить сайт</button>
          <button className="btn-ghost" onClick={refresh}><RefreshCw size={14} /> Обновить</button>
          <button className="btn-ghost" onClick={async () => { await clearAllCaches(); refresh(); }} style={{ color: '#ef4444' }}><Trash2 size={14} /> Очистить кэш</button>
        </div>
      </div>

      {/* Cache list */}
      {caches.length > 0 && (
        <div className="glass-card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Database size={16} /> Кэши
          </h3>
          {caches.map(c => (
            <div key={c.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--color-border)' }}>
              <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontFamily: 'monospace' }}>{c.name}</span>
              <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>{formatSize(c.size)}</span>
            </div>
          ))}
        </div>
      )}

      {!('caches' in window) && (
        <div className="glass-card" style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          <HardDrive size={24} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
          <p>Ваш браузер не поддерживает офлайн-кэш</p>
        </div>
      )}
    </div>
  );
}
