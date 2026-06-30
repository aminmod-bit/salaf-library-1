const CACHE_VERSION = '1.0.0';
const APP_SHELL_CACHE = `salaf-shell-${CACHE_VERSION}`;
const RUNTIME_CACHE = `salaf-runtime-${CACHE_VERSION}`;

const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './favicon.svg',
  './logo.svg',
  './logo-mark.svg',
  './icon-192.png',
  './icon-512.png',
  './offline.html',
  './data/books.json',
  './data/biographies.json',
  './data/categories.json',
  './data/articles.json',
  './data/azkar.json',
  './data/audio.json',
  './data/fawaid.json',
  './data/languages.json',
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
      .then((keys) => Promise.all(
        keys.filter((key) => key !== APP_SHELL_CACHE && key !== RUNTIME_CACHE)
            .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

function isNavigation(request) {
  return request.mode === 'navigate' || (request.headers.get('accept') || '').includes('text/html');
}

function isLargeMedia(request) {
  const url = new URL(request.url);
  return /\.(pdf|epub|zip|mp4|webm|mp3|wav|docx|fb2)$/i.test(url.pathname);
}

function isStaticAsset(request) {
  const url = new URL(request.url);
  return /\.(js|css|woff2?|ttf|eot|svg|png|webp|jpg|jpeg|gif|ico)$/i.test(url.pathname);
}

async function networkFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  try {
    const response = await fetch(request);
    if (response && response.ok) cache.put(request, response.clone()).catch(() => {});
    return response;
  } catch {
    const cached = await cache.match(request);
    return cached || (await caches.match('./offline.html')) || new Response('Offline', { status: 503 });
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone()).catch(() => {});
    }
    return response;
  } catch {
    return new Response('', { status: 408 });
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);
  const fetching = fetch(request).then((response) => {
    if (response && response.ok) cache.put(request, response.clone()).catch(() => {});
    return response;
  }).catch(() => cached);
  return cached || fetching;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Navigation: network first, offline fallback
  if (isNavigation(request)) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Large media: never cache automatically
  if (isLargeMedia(request)) {
    event.respondWith(fetch(request).catch(() => new Response('', { status: 408 })));
    return;
  }

  // Static assets: cache first (long-lived)
  if (isStaticAsset(request)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // JSON/API: stale while revalidate
  event.respondWith(staleWhileRevalidate(request));
});
