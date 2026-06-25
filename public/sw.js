const CACHE_VERSION = '3.2-pwa-installable';
const APP_SHELL_CACHE = `salaf-library-shell-${CACHE_VERSION}`;
const RUNTIME_CACHE = `salaf-library-runtime-${CACHE_VERSION}`;

const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './favicon.svg',
  './logo.svg',
  './logo-mark.svg',
  './icon-192.png',
  './icon-512.png',
  './pwa-screenshot-wide.png',
  './pwa-screenshot-mobile.png',
  './data/books.json',
  './data/biographies.json',
  './data/categories.json',
  './data/articles.json',
  './data/azkar.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(APP_SHELL_CACHE)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys
        .filter((key) => key !== APP_SHELL_CACHE && key !== RUNTIME_CACHE)
        .map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

function isNavigation(request) {
  return request.mode === 'navigate' || (request.headers.get('accept') || '').includes('text/html');
}

function isPdfOrAudio(request) {
  const url = new URL(request.url);
  return /\.(pdf|mp3|m4a|ogg|wav)$/i.test(url.pathname);
}

async function networkFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  try {
    const response = await fetch(request);
    if (response && response.ok) cache.put(request, response.clone()).catch(() => undefined);
    return response;
  } catch {
    return (await cache.match(request)) || (await caches.match('./index.html'));
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);
  const fetching = fetch(request).then((response) => {
    if (response && response.ok && !isPdfOrAudio(request)) cache.put(request, response.clone()).catch(() => undefined);
    return response;
  }).catch(() => cached);
  return cached || fetching;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (isNavigation(request)) {
    event.respondWith(networkFirst(request));
    return;
  }

  if (isPdfOrAudio(request)) {
    event.respondWith(fetch(request).catch(() => caches.match(request)));
    return;
  }

  event.respondWith(staleWhileRevalidate(request));
});
