/* ArcadePaLoMuchacho service worker: app instalable + juego offline.
   - Instalación: pre-cachea shell + JS/CSS principal (parseando index.html),
     así la app ARRANCA sin conexión justo después de instalarla.
   - Navegaciones: network-first con fallback a la portada cacheada.
   - Assets propios (JS/CSS/imgs, incluidos los juegos lazy): stale-while-revalidate,
     así cada juego jugado una vez queda disponible offline.
   - /api: solo red (las puntuaciones nunca se cachean; el XP local sigue funcionando). */
const VERSION = "aplm-v13";
const SHELL = ["./", "./index.html", "./favicon.svg", "./icon-48.png", "./icon-192.png", "./icon-512.png", "./maskable-512.png", "./apple-touch-icon.png", "./site.webmanifest"];

// Núcleo arrancable offline: shell + assets que index.html necesita (JS/CSS con hash).
async function nucleo() {
  const lista = new Set(SHELL);
  try {
    const html = await (await fetch("./index.html", { cache: "no-store" })).text();
    const re = /(?:src|href)="(\.\/assets\/[^"]+)"/g;
    let m;
    while ((m = re.exec(html))) lista.add(m[1]);
  } catch { /* sin red en la instalación: solo shell, el resto entra en runtime */ }
  return [...lista];
}

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(VERSION)
      // addAll falla entero si una URL falla: mejor una a una tolerando fallos
      .then(c => nucleo().then(as => Promise.all(as.map(u => c.add(u).catch(() => null)))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
      // Navigation preload: la portada carga más rápido en móvil
      .then(() => (self.registration.navigationPreload ? self.registration.navigationPreload.enable() : null))
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
      (async () => {
        try {
          const preload = await e.preloadResponse;
          if (preload) {
            const copia = preload.clone();
            caches.open(VERSION).then(c => c.put("./index.html", copia));
            return preload;
          }
          const r = await fetch(request);
          const copia = r.clone();
          caches.open(VERSION).then(c => c.put("./index.html", copia));
          return r;
        } catch {
          return caches.match("./index.html").then(r => r || caches.match("./"));
        }
      })()
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
