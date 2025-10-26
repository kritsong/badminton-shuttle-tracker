
const CACHE_NAME = 'badminton-tracker-v2';
const BASE_URL = new URL('.', self.location.href);
const URLS_TO_CACHE = [
  './',
  'index.html',
  'manifest.webmanifest',
  'icons/app-icon.svg',
].map((path) => new URL(path, BASE_URL).href);

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => Promise.all(
        URLS_TO_CACHE.map((url) =>
          cache.add(url).catch((error) => {
            console.warn('[SW] Failed to cache', url, error);
          })
        )
      ))
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const { origin } = new URL(event.request.url);
  if (origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));

        return networkResponse;
      });
    })
  );
});
