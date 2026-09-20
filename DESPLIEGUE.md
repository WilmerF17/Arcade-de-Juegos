# 🚀 ArcadePaLoMuchacho — estado oficial

## URLs vivas

- 🎮 Principal (app + API global): https://arcade-de-juegos.vercel.app
- 🌐 Espejo (solo frontend): https://wilmerf17.github.io/Arcade-de-Juegos/

## Arquitectura

- Frontend Vite + PWA (`client/`), 232 juegos con carga perezosa.
- API serverless en Vercel (`api/`): puntuaciones globales en Upstash Redis.
- Sin llaves en el código: `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN`
  viven en Vercel → Settings → Environment Variables (All Environments).
- Diagnóstico: `/api/health` informa `db`/`ping`/`escritura`/`lectura`.

## Desarrollo local

```bash
npm run install-all   # dependencias (una vez)
npm run dale          # API + web + navegador  (o: jugar)
npm run test          # 17 chequeos del catálogo
npm run salud         # 18 chequeos PWA + Google
```

## Salir en Google

1. [Search Console](https://search.google.com/search-console) → añade
   `https://arcade-de-juegos.vercel.app` (etiqueta HTML o DNS).
2. **Sitemaps → Añadir**: `https://arcade-de-juegos.vercel.app/sitemap.xml`
3. **Inspección de URLs** → pide indexar `/`.
4. Espera días/semanas: `arcadepalomuchacho` rankeará #1 (marca única).

## Instalar como app (PWA)

- **Android/Chrome**: menú ⋮ → Instalar app.
- **PC Chrome/Edge**: icono de instalación en la barra.
- **iPhone/iPad**: Compartir → Añadir a pantalla de inicio.
- Offline gracias al service worker (versión actual en `client/public/sw.js`).
