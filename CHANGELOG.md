# Historial — ArcadePaLoMuchacho

## v2.7.0 (2026-09-26) — 262 juegos + misiones y SEO automático
- **+12 juegos de tendencia (262)**: Crash Cohete/Turbo/Luna (estilo Aviator),
  Fusión Neón/Frutas/Gemas (merge), Aim Pro/Reflejo Neón/Diana Tranquila
  (aim-trainer táctil) y Anagrama Flash/Palabra Relámpago/Turbo (sprint 60s).
  Tres dificultades por familia, 100% táctil, con ayuda y banner de resultado.
- **Misiones diarias 🎯** (tendencia retención 2026): 3 objetivos cortos en el
  lateral con barra de progreso que pagan fichas solos (+100/+150/+200).
- **Tienda ×2**: Tema Atardecer 🌅 y Tema Bosque 🌲 (900), Doble XP Plus 60 min
  (900) y Pack 3 escudos (700).
- **SEO automático**: `scripts/generar-seo.mjs` regenera título, descripciones,
  JSON-LD y sitemap desde GAMES.js (adiós edición manual de 262 entradas).
- PWA SW `aplm-v14` (fuerza actualización), versión visible 2.7.0.

## v2.6.5 (2026-09-22) — Instalación PWA en PC
- **Adiós al portable**: en PC el botón Instalar vuelve a la instalación
  PWA directa (icono, offline y auto-actualización). Android sigue con APK.

## v2.6.4 (2026-09-22) — Icono nuevo
- **Nuevo icono Mando**: gamepad coral con 250, aplicado en web (favicon,
  PWA, Apple), portadas (og-image, promo, Play) y APK/AAB reconstruidos.

## v2.6.3 (2026-09-22) — Privacidad, calidad y cara nueva
- **Kit Google Play listo**: AAB v2.6.3 código 4 firmado, APK directo
  actualizado, gráficos (destacada + 2 capturas) y `play/ficha-play.md`
  con textos y guía de consola paso a paso.
- **Privacidad 🔒**: página propia enlazada en el lateral (lista para Play).
- **Auditoría de jugabilidad** (`npm test` la incluye): 144 juegos sanos;
  corregidas 3 fugas de `touchmove` en Atrapar, Breakout y Malabares.
- **Rediseño v3**: hero con título degradado y brillo, cartas con glow,
  lateral y botones premium, footer con Privacidad/Tienda/Código.
- **Botones de descarga rediseñados**: tamaño y tacto de botón real
  (ya no se ven planos), flecha animada, brillo deslizante y etiqueta
  con formato (APK · Android / HTML · PC · sin internet).
- Keystore documentado (`~/android-twa/LEEME-keystore.txt`).

## v2.6.2 (2026-09-22) — Juego portable para PC
- **Botón Instalar descarga en PC**: baja `PaLoMuchacho-portable.html`
  (0.9 MB, los 250 juegos en un solo archivo, doble clic y a jugar offline).
- iOS sigue con PWA; Android con APK directo.

## v2.6.1 (2026-09-22) — Descarga directa del APK
- **Botón Instalar descarga el juego**: en Android baja directo el APK firmado
  (`/descargas/palomuchacho.apk`, TWA v2.6.0) sin pasar por la tienda.
- APK + AAB compilados con Bubblewrap (código 3, firmados, fullscreen verificado
  con `assetlinks.json` propio). iOS/PC siguen con PWA.

## v2.6.0 (2026-09-22) — 250 juegos + casino y tienda
- **+13 juegos de casino y apuestas (250)**: Plinko, Minas, Torre Dorada,
  Penaltis de Oro, Carta Mayor, Suma 7, Tómbola, Escalera Millonaria, Rueda
  Fortuna, La Bolsa, Dobles, Quince y Lotto 6. Todos apuestan fichas virtuales.
- **Hook compartido `suite/apuesta.js`**: selector de apuesta, saldo en vivo y
  cobro con registro para no duplicar lógica entre juegos.
- **Tienda 🛍️** (nueva sección): gasta fichas en Tema Dorado 👑, Tema Océano 🌊,
  Doble XP ×2 (30 min) y Escudo de racha 🛡️. Sin dinero real.
- **Economía**: cada partida paga +5 fichas (+15 si ganas) para gastar en la tienda.
- SEO/PWA a 250 (JSON-LD, sitemap 251 URLs, manifest, SW aplm-v13).

## v2.5.0 (2026-09-22) — Diseño pro + rendimiento
- **GameShell v2**: tira de color por juego, anillo de familia (8 categorías),
  stats unificados, ayuda plegable «¿Cómo se juega?» y banner de resultado con
  confeti. Llega a los 237 juegos sin tocar su lógica.
- **Migración automática**: 96 banners de resultado al componente compartido y
  136 estilos inline redundantes eliminados en 130 ficheros.
- **XP instantáneo**: la progresión local se aplica primero y el ranking va
  después en segundo plano (se nota offline y con red lenta).
- **Blindaje**: ErrorBoundary por juego (un juego roto ya no tumba la app) y
  esqueleto de carga con brillo en vez de texto plano.
- **Insignia rediseñados**: Trivia (crono 15 s, racha, progreso por puntos),
  Serpiente (niveles de velocidad, swipe táctil, mejor local, tablero neón) y
  Blackjack (mesa de fieltro, carta oculta, pips a 5 rondas).
- **Móvil**: versión 2.5.0 (código 2 TWA), SW aplm-v12 (fuerza actualización),
  botones táctiles y canvas con marco en todos los juegos.

## v2.4.0 (2026-09-21) — Siempre al día
- Auto-actualización PWA: avisa con ⚡ y recarga a la versión nueva sola.
- Versión y fecha visibles en el lateral.
- +5 juegos (237): Quiz Mitología, Inventos y Océanos + Parejas de
  Navidad y Halloween. SEO fresco a hoy (sitemap 238 URLs, SW aplm-v7).

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
