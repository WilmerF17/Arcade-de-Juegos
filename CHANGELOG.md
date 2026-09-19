# Historial — ArcadePaLoMuchacho

## v2.0.0 (2026-09-19) — La obra mayor
- Marca única **ArcadePaLoMuchacho**: paleta coral/naranja, emblema del rayo,
  iconos PWA y og-image generados propios, favicon vectorial.
- 78 juegos (70 + 8 originales: Torre Equilibrio, Caza Palabra, Pulso Neón,
  Secuencia Inversa, Par o Impar Relámpago, Laberinto Ciego, Sprint de Clics,
  Ordena Números) con **carga perezosa** (81 chunks, inicial ~46% más liviano).
- Seguridad: helmet + CSP, CORS configurable, rate-limit, validación estricta,
  Docker no-root con healthcheck.
- Sin marcas de terceros en lo visible (Palabra 5, Fusión 2048, Bloques Neón…).
- SEO: canonical, OG/Twitter, JSON-LD 78 juegos, sitemap 79 URLs absolutas.
- PWA: manifest portable (`./`), shortcuts, SW `aplm-v3`, instalable PC/móvil.
- Comando `dale` (dev/duro/tumba/salud) + guía `DESPLIEGUE.md`.
- Despliegue: `vercel.json`, workflow GitHub Pages, `render.yaml`, HF Docker.

## v1.0.0 — Arcade de Juegos
- 70 juegos, XP/niveles/logros/desafío diario, PWA básica, API Express,
  Dockerfile para Hugging Face, `render.yaml`.
