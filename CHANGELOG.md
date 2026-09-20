# Historial — ArcadePaLoMuchacho

## v2.3.0 (2026-09-20) — Casino y billetera
- Billetera virtual 🪙: saldo inicial 1000, bonus diario +500, rescate,
  widget en el lateral (fichas de juego, sin dinero real).
- +7 juegos de apuestas: Siete Alto, Moneda Racha, Hípica, Chuck de la
  Suerte, Punto Banco, Keno Veloz y Rasca y Gana (total 232).
- SEO/PWA a 232 (JSON-LD, sitemap 233 URLs, manifest, SW aplm-v6).

## v2.2.0 (2026-09-20) — Punto máximo: 225 juegos
- +140 juegos en 37 motores nuevos: 15 quizzes, 12 ¿qué es?, 10 memorias,
  7 toca-el-número, 6 cálculos, 10 intrusos, 8 verdadero/falso, refranes,
  rangos + máquina adivina, copa, 6 emoji-quiz, 5 capitales, quién-soy,
  4 frases, 3 banderas, parchís ×2, serpientes ×2, raya ×2, sudoku 4×4,
  puzzle 9, buscaminas ×2, salto largo, duelos ×2, teléfono ×2, mímica ×2,
  verdad/reto ×2, manos ×2, dados ×2, trivia ×2, lotería, dónde-quedó ×2,
  mayor-menor, escoba, brisca, basta ×2, ahorcado ×5, palabra ×3, oído veloz.
- 2 categorías nuevas: Quiz y saber + Fiesta y 2 jugadores (8 en total).
- SEO/PWA a 225 (JSON-LD, sitemap 226 URLs, manifest, SW aplm-v5).

## v2.1.0 (2026-09-19) — Pack completo
- 85 juegos (+7: Destello, Sombras Gemelas, Ruta Exprés, Escalera de Dados,
  Oído Fino, Atajada, La Oca Veloz).
- Compartir: Web Share API + WhatsApp/X/Telegram en portada y podio.
- Tests `npm run test` (17 chequeos, también en CI de Pages).
- Accesibilidad: movimiento reducido + foco visible. Nuevo tema Playa 🏝️.
- SEO/PWA actualizados a 85 (JSON-LD, sitemap 86 URLs, manifest, SW aplm-v4).

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
