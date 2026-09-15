/*
 * R2 NUSANTARA — retired legacy service worker.
 *
 * The active production app is Next.js on Vercel. This worker is intentionally
 * kept as a one-time cleanup layer so browsers that installed the old static
 * site can release stale caches and stop serving legacy assets.
 */
self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(key => caches.delete(key))))
      .then(() => self.clients.claim())
      .then(() => self.registration.unregister())
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(fetch(event.request));
});
