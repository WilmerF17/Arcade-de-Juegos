#!/usr/bin/env node
/* Chequeo de integridad de ArcadePaLoMuchacho. Cero dependencias.
   Uso: npm run test  (sale con código 1 si algo falla) */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const lee = p => readFileSync(join(RAIZ, p), "utf8");
let fallos = 0;
const ok = m => console.log("  ✅ " + m);
const no = m => { console.log("  ❌ " + m); fallos++; };

const games = lee("client/src/games/GAMES.js");

// 1. Registro de juegos: ids, nombres y componentes perezosos
const entradas = [...games.matchAll(/^  (\w+): \{ nombre: "([^"]+)",.*?Component: (\w+)/gm)];
no.__n = entradas.length;
if (entradas.length < 200) no(`Solo ${entradas.length} juegos registrados (esperado 200+)`);
else ok(`${entradas.length} juegos registrados`);
const ids = entradas.map(e => e[1]);
const nombres = entradas.map(e => e[2]);
const comps = entradas.map(e => e[3]);
if (new Set(ids).size !== ids.length) no("IDs de juego duplicados");
else ok("IDs únicos");
if (new Set(nombres).size !== nombres.length) no("Nombres visibles duplicados");
else ok("Nombres visibles únicos");
const lazys = [...games.matchAll(/^const (\w+) = lazy\(\(\) => import\("\.\/([\w/]+)"\)/gm)];
const mapaLazy = Object.fromEntries(lazys.map(l => [l[1], l[2]]));
let rotos = 0;
for (const c of comps) {
  const archivo = mapaLazy[c];
  if (!archivo || !existsSync(join(RAIZ, "client/src/games", archivo + ".jsx"))) { no(`Componente sin archivo: ${c}`); rotos++; }
}
if (!rotos) ok(`Los ${comps.length} componentes perezosos resuelven a su archivo`);

// 2. Categorías: todo juego en ≥1 categoría y sin ids fantasmas
const cats = [...games.matchAll(/juegos: \[([^\]]*)\]/g)].flatMap(m => m[1].split(",").map(s => s.trim().replace(/["']/g, "")));
const fantasmas = cats.filter(id => !ids.includes(id));
const huerfanos = ids.filter(id => !cats.includes(id));
if (fantasmas.length) no("Categorías con ids inexistentes: " + fantasmas.join(", "));
else ok("Categorías sin ids fantasmas");
if (huerfanos.length) no("Juegos sin categoría: " + huerfanos.join(", "));
else ok("Todo juego está en una categoría");

// 3. Marcas de terceros en lo visible
const bloqueadas = ["Tetris neón", '"Wordle"', "Pong neón", "Pong 2 Jugadores", "Flappy neón", "Tron Neón", '"Yahtzee"', "Piano Tiles", "Simón dice", 'titulo="2048"', "Othello 8×8"];
const html = lee("client/index.html");
const visibles = games + "\n" + html;
const halladas = bloqueadas.filter(b => visibles.includes(b));
if (halladas.length) no("Nombres con marca en lo visible: " + halladas.join(", "));
else ok("Sin marcas de terceros en lo visible");

// 4. SEO: JSON-LD y sitemap coherentes con el catálogo
const nJsonLd = (html.match(/"@type":"VideoGame"/g) || []).length;
if (nJsonLd !== ids.length) no(`JSON-LD con ${nJsonLd} juegos, catálogo con ${ids.length}`);
else ok(`JSON-LD con los ${nJsonLd} juegos`);
const sitemap = lee("client/public/sitemap.xml");
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
if (locs.some(u => !u.startsWith("https://"))) no("Sitemap con URLs relativas");
else ok("Sitemap con URLs absolutas");
const sinUrl = ids.filter(id => !locs.some(u => u.endsWith("#" + id)));
if (sinUrl.length) no("Juegos sin URL en sitemap: " + sinUrl.join(", "));
else ok(`Sitemap cubre los ${ids.length} juegos (+ portada)`);
if (!html.includes('<link rel="canonical"')) no("Sin canonical");
else ok("Canonical presente");

// 5. PWA: manifest válido e iconos existentes
try {
  const man = JSON.parse(lee("client/public/site.webmanifest"));
  const req = ["name", "short_name", "start_url", "scope", "display", "icons"];
  const faltan = req.filter(k => !man[k]);
  if (faltan.length) no("Manifest sin: " + faltan.join(", "));
  else ok("Manifest válido con marca");
  const iconosRotos = (man.icons || []).filter(i => !existsSync(join(RAIZ, "client/public", i.src)));
  if (iconosRotos.length) no("Iconos faltantes: " + iconosRotos.map(i => i.src).join(", "));
  else ok(`${man.icons.length} iconos existen`);
  if (!man.shortcuts?.length) no("Sin shortcuts PWA");
  else ok(`${man.shortcuts.length} shortcuts PWA`);
} catch { no("site.webmanifest no es JSON válido"); }

// 6. Servidor endurecido
const srv = lee("server/index.js");
if (!srv.includes("helmet(")) no("Servidor sin helmet");
else ok("Helmet activo");
if (!srv.includes("rateLimit(")) no("Servidor sin rate-limit");
else ok("Rate-limit activo");
if (!srv.includes("ID_RE")) no("Servidor sin validación de ids");
else ok("Validación estricta de puntuaciones");

console.log(fallos ? `\n💥 ${fallos} chequeo(s) fallidos` : `\n🎉 Todo en orden: ${ids.length} juegos blindados`);
process.exit(fallos ? 1 : 0);
