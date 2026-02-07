const CACHE_NAME = 'jogo-velha-v4.7';

const urlsToCache = [
  'index.html',
  'manifest.json',
  'assets/icons/icon-128.png',
  'assets/icons/icon-512.png',
  'assets/icons/bomb.svg',
  'assets/icons/change.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        }),
      );
    }),
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(caches.match(event.request).then((response) => response || fetch(event.request)));
});
