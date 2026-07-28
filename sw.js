// ============================================================
// SERVICE WORKER - 38-0-0 NAPOLI
// Gestisce cache offline e installabilità PWA (Android/Chrome).
// Su iOS il Service Worker gira comunque quando l'app viene
// aperta dalla schermata Home, offrendo un minimo di offline.
// ============================================================

const CACHE_VERSION = 'napoli380-v1';
const CACHE_NAME = `napoli380-cache-${CACHE_VERSION}`;

// File "shell" essenziali per far partire l'app anche offline
const APP_SHELL = [
  './',
  './index.html',
  './css/style.css',
  './js/app.js?v=v2',
  './manifest.json',
  './favicon.png',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png'
];

// --- INSTALL: precache dello shell ---
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.all(
        APP_SHELL.map((url) =>
          cache.add(url).catch((err) => {
            // Non blocchiamo l'installazione se un singolo asset manca
            console.warn('[SW] Impossibile mettere in cache:', url, err);
          })
        )
      );
    }).then(() => self.skipWaiting())
  );
});

// --- ACTIVATE: pulizia vecchie cache ---
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith('napoli380-cache-') && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// --- FETCH: strategie differenziate ---
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Solo richieste GET dello stesso schema http/https
  if (req.method !== 'GET' || !url.protocol.startsWith('http')) return;

  // Non toccare mai Firebase / Google APIs / Analytics: sempre rete diretta
  if (
    url.hostname.includes('firebaseio.com') ||
    url.hostname.includes('firestore.googleapis.com') ||
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('gstatic.com') ||
    url.hostname.includes('google-analytics.com') ||
    url.hostname.includes('googletagmanager.com') ||
    url.hostname.includes('doubleclick.net')
  ) {
    return; // lascia gestire al browser, nessun intercept
  }

  const isHTML = req.mode === 'navigate' || url.pathname.endsWith('.html');
  const isCoreAsset = /\.(css|js)$/.test(url.pathname) || APP_SHELL.some((p) => url.pathname.endsWith(p.replace('./', '/')));

  if (isHTML) {
    // Network-first per l'HTML: contenuti sempre aggiornati, offline come fallback
    event.respondWith(
      fetch(req)
        .then((res) => {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
          return res;
        })
        .catch(() => caches.match(req).then((cached) => cached || caches.match('./index.html')))
    );
    return;
  }

  if (isCoreAsset) {
    // Stale-while-revalidate per CSS/JS: risposta veloce da cache + aggiornamento in background
    event.respondWith(
      caches.match(req).then((cached) => {
        const networkFetch = fetch(req)
          .then((res) => {
            const resClone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
            return res;
          })
          .catch(() => cached);
        return cached || networkFetch;
      })
    );
    return;
  }

  // Tutto il resto (immagini, font, icone): cache-first
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
        return res;
      }).catch(() => cached);
    })
  );
});
