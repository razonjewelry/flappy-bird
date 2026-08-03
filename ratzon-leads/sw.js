/* Service worker — cache the app shell so it opens offline.
   OCR (Tesseract from CDN) still needs network on first use; paste mode works offline. */
const CACHE = 'rz-leads-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon.svg',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png',
  './icon-180.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith(
    caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      // שמור בקאש רק בקשות same-origin (לא ה-CDN), לגיבוי אופליין.
      try {
        const u = new URL(req.url);
        if (u.origin === self.location.origin) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
      } catch (_) { /* ignore */ }
      return res;
    }).catch(() => caches.match('./index.html')))
  );
});
