const CACHE_NAME = 'offline-uko-pwa-v1';

// List of files you want cached
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
  // '/static/js/main.38e27127.js', // adjust as needed
  // '/static/js/main.38e27127.js.LICENSE.txt',
  // '/static/js/main.38e27127.js.map',
  // '/static/css/main.b58bbd89.css',
  // '/static/css/main.b58bbd89.css.map',
      '/static/css/main.css', // adjust as needed
    '/static/js/bundle.js',
];

// if(process.env.REACT_APP_environment === "production"){
//   OFFLINE_URLS = [
//     ...OFFLINE_URLS,
//     '/static/js/main.c99ec22b.js', // adjust as needed
//     '/static/js/main.c99ec22b.js.LICENSE.txt',
//     '/statisc/js/main.c99ec22b.js.map',
//     '/static/css/main.1601dc8d.css',
//     '/static/css/main.1601dc8d.css.map',
//   ]
// }else{
//   OFFLINE_URLS = [
//     ...OFFLINE_URLS,
//     '/static/css/main.css', // adjust as needed
//     '/static/js/bundle.js',
//   ]
// }

// Install event: cache app shell
self.addEventListener('install', event => {
  console.log('[ServiceWorker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[ServiceWorker] Caching app shell');
      return cache.addAll(OFFLINE_URLS);
    })
    
  );
});

// Activate event: cleanup old caches
self.addEventListener('activate', event => {
  console.log('[ServiceWorker] Activate');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
});

// Fetch event: serve from cache first
self.addEventListener('fetch', event => {
  // Ignore non-GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(response => {
      return (
        response ||
        fetch(event.request).catch(() =>
          caches.match('/index.html')
        )
      );
    })
  );
});
