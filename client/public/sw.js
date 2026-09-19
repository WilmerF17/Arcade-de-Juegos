/* ArcadePaLoMuchacho service worker: app instalable + juego offline.
   - Navegaciones: network-first con fallback a la portada cacheada.
   - Assets propios (JS/CSS/imgs): stale-while-revalidate.
   - /api: solo red (las puntuaciones nunca se cachean). */
const VERSION = "aplm-v2";
const SHELL = ["./", "./index.html", "./favicon.svg", "./icon-192.png", "./icon-512.png", "./maskable-512.png", "./site.webmanifest"];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", e => {
  if (e.data === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", e => {
  const { request } = e;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.includes("/api/")) return; // puntuaciones: siempre red

  // Navegaciones: red primero, portada cacheada sin conexión
  if (request.mode === "navigate") {
    e.respondWith(
      fetch(request)
        .then(r => {
          const copia = r.clone();
          caches.open(VERSION).then(c => c.put("./index.html", copia));
          return r;
        })
        .catch(() => caches.match("./index.html").then(r => r || caches.match("./")))
    );
    return;
  }

  // Assets: stale-while-revalidate
  e.respondWith(
    caches.match(request).then(hit => {
      const red = fetch(request)
        .then(r => {
          if (r.ok) {
            const copia = r.clone();
            caches.open(VERSION).then(c => c.put(request, copia));
          }
          return r;
        })
        .catch(() => hit);
      return hit || red;
    })
  );
});
