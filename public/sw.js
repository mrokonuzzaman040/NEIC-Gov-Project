// Basic service worker for the election portal
// This is a placeholder service worker to prevent 404 errors

const CACHE_NAME = 'election-portal-v1';
const urlsToCache = [
  '/',
  '/en/',
  '/bn/',
  '/_next/static/css/',
  '/_next/static/js/'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      }
    )
  );
});
