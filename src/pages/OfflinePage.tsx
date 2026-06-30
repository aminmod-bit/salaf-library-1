import { useState, useEffect } from 'react';
import {
  Wifi, WifiOff, Download, Trash2, RefreshCw, Database, HardDrive,
  BookOpen, FileText, Sparkles, Users, Heart, Headphones, FolderTree, Home
} from 'lucide-react';
import toast from 'react-hot-toast';

interface CacheInfo {
  name: string;
  size: number;
}

interface OfflineSection {
  id: string;
  label: string;
  icon: any;
  urls: string[];
  description: string;
}

const OFFLINE_SECTIONS: OfflineSection[] = [
  {
    id: 'shell',
    label: 'Оболочка сайта',
    icon: Home,
    urls: ['./', './index.html', './manifest.json', './favicon.svg', './logo.svg', './offline.html'],
    description: 'Основные файлы приложения',
  },
  {
    id: 'data',
    label: 'Данные (JSON)',
    icon: Database,
    urls: ['./data/books.json', './data/biographies.json', './data/categories.json', './data/articles.json', './data/azkar.json', './data/audio.json', './data/fawaid.json', './data/category-tree.json', './data/article-categories.json'],
    description: 'Каталоги и списки контента',
  },
  {
    id: 'books',
    label: 'Книги',
    icon: BookOpen,
    urls: [],
    description: 'PDF-файлы книг (только по кнопке)',
  },
  {
    id: 'articles',
    label: 'Статьи',
    icon: FileText,
    urls: ['./data/articles.json', './data/article-categories.json'],
    description: 'Статьи и категории',
  },
  {
    id: 'azkar',
    label: 'Азкары',
    icon: Sparkles,
    urls: ['./data/azkar.json'],
    description: 'Азкары и поминания',
  },
  {
    id: 'hadith',
    label: 'Хадисы',
    icon: BookOpen,
    urls: ['./data/books.json'],
    description: 'Сборники хадисов',
  },
  {
    id: 'biographies',
    label: 'Биографии',
    icon: Users,
    urls: ['./data/biographies.json'],
    description: 'Биографии учёных',
  },
  {
    id: 'fawaid',
    label: 'Фаваиды',
    icon: Heart,
    urls: ['./data/fawaid.json'],
    description: 'Полезные высказывания',
  },
  {
    id: 'audio',
    label: 'Аудио',
    icon: Headphones,
    urls: ['./data/audio.json'],
    description: 'Список аудио-лекций',
  },
  {
    id: 'categories',
    label: 'Категории',
    icon: FolderTree,
    urls: ['./data/categories.json', './data/category-tree.json'],
    description: 'Структура категорий',
  },
];

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' Б';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' КБ';
  return (bytes / (1024 * 1024)).toFixed(1) + ' МБ';
}

async function getCacheSize(): Promise<number> {
  if (!('caches' in window)) return 0;
  let total = 0;
  const names = await window.caches.keys();
  for (const name of names) {
    const cache = await window.caches.open(name);
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
  const names = await window.caches.keys();
  for (const name of names) {
    const cache = await window.caches.open(name);
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

async function cacheUrls(urls: string[], label: string): Promise<number> {
  if (!('caches' in window)) {
    toast.error('Браузер не поддерживает офлайн-кэш');
    return 0;
  }
  toast.loading(`Сохранение ${label}...`, { id: 'cache' });
  try {
    const cache = await window.caches.open('salaf-offline-data');
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
    return saved;
  } catch {
    toast.error('Ошибка сохранения', { id: 'cache' });
    return 0;
  }
}

async function isSectionCached(sectionId: string): Promise<boolean> {
  if (!('caches' in window)) return false;
  try {
    const cache = await window.caches.open('salaf-offline-data');
    const section = OFFLINE_SECTIONS.find(s => s.id === sectionId);
    if (!section || section.urls.length === 0) return false;
    for (const url of section.urls) {
      const match = await cache.match(url);
      if (!match) return false;
    }
    return true;
  } catch { return false; }
}

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [totalSize, setTotalSize] = useState(0);
  const [caches, setCaches] = useState<CacheInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [sectionStatus, setSectionStatus] = useState<Record<string, boolean>>({});

  const refresh = async () => {
    setLoading(true);
    setIsOnline(navigator.onLine);
    setTotalSize(await getCacheSize());
    setCaches(await getCaches());

    const status: Record<string, boolean> = {};
    for (const section of OFFLINE_SECTIONS) {
      status[section.id] = await isSectionCached(section.id);
    }
    setSectionStatus(status);
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

  const saveSection = async (section: OfflineSection) => {
    if (section.urls.length === 0) {
      toast('Этот раздел нужно скачивать по отдельным книгам');
      return;
    }
    await cacheUrls(section.urls, section.label);
    refresh();
  };

  const saveAll = async () => {
    const allUrls = OFFLINE_SECTIONS.flatMap(s => s.urls);
    const unique = [...new Set(allUrls)];
    await cacheUrls(unique, 'все данные');
    refresh();
  };

  const clearAll = async () => {
    if (!confirm('Очистить весь офлайн-кэш?')) return;
    if ('caches' in window) {
      const names = await window.caches.keys();
      for (const name of names) await window.caches.delete(name);
    }
    toast.success('Кэш очищен');
    refresh();
  };

  return (
    <div className="fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Header */}
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
              {isOnline ? 'Сохраняйте разделы для чтения без интернета' : 'Доступны ранее сохранённые данные'}
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
          <button className="btn-primary" onClick={saveAll}><Download size={14} /> Сохранить всё</button>
          <button className="btn-ghost" onClick={refresh}><RefreshCw size={14} /> Обновить</button>
          <button className="btn-ghost" onClick={clearAll} style={{ color: '#ef4444' }}><Trash2 size={14} /> Очистить кэш</button>
        </div>
      </div>

      {/* Sections */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        {OFFLINE_SECTIONS.map(section => {
          const cached = sectionStatus[section.id] || false;
          return (
            <div key={section.id} className="glass-card" style={{
              padding: '16px',
              borderColor: cached ? 'var(--color-accent-light)' : undefined,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <section.icon size={18} style={{ color: cached ? 'var(--color-accent-light)' : 'var(--color-text-muted)' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{section.label}</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{section.description}</div>
                </div>
                {cached && <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '100px', background: 'rgba(34,197,94,0.15)', color: 'var(--color-accent-light)' }}>Сохранено</span>}
              </div>
              <button
                onClick={() => saveSection(section)}
                style={{
                  width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--color-border)',
                  background: cached ? 'var(--color-bg-hover)' : 'var(--color-gold)',
                  color: cached ? 'var(--color-text-secondary)' : '#111',
                  fontWeight: 600, fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s',
                }}
              >
                {cached ? 'Обновить' : 'Скачать офлайн'}
              </button>
            </div>
          );
        })}
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
