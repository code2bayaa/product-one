// v2: the v1 cache stored hard-coded build hashes (a dev server answers those with index.html)
// and served index.html for every failed request, including cross-origin scripts and APIs
const CACHE_NAME = 'offline-uko-pwa-v2';

// App shell. Build files (/static/...) have hashed names, so they're cached as they load instead
const OFFLINE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/image/logo.png',
  '/image/logo1.png',
  '/image/logo2.png',
  '/image/logo3.png',
  '/videos/load.mp4',
];

// Install event: cache app shell (one missing file must not fail the whole install)
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.all(OFFLINE_URLS.map(url => cache.add(url).catch(() => null)))
    )
  );
  self.skipWaiting();
});

// Activate event: cleanup old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

const isStaticAsset = url =>
  url.pathname.startsWith('/static/') ||
  url.pathname.startsWith('/image/') ||
  url.pathname.startsWith('/videos/') ||
  OFFLINE_URLS.includes(url.pathname);

// Fetch event: only this origin's GETs, network first. Offline, pages get index.html and
// static files come from the copy saved on the last online load
self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET' || request.headers.has('range')) return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.includes('hot-update') || url.pathname.startsWith('/ws') || url.pathname.startsWith('/sockjs-node')) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/index.html').then(res => res || Response.error()))
    );
    return;
  }

  if (!isStaticAsset(url)) return;

  event.respondWith(
    fetch(request)
      .then(res => {
        //a dev server answers missing files with index.html; don't store that as a script or image
        const isHtml = (res.headers.get('content-type') || '').includes('text/html');
        if (res.ok && (!isHtml || url.pathname === '/' || url.pathname === '/index.html')) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        }
        return res;
      })
      .catch(() => caches.match(request).then(cached => cached || Response.error()))
  );
});
