#!/usr/bin/env node
/* Genera SEO/PWA desde el catálogo (fuente única: GAMES.js).
   - client/index.html: título, descripciones y JSON-LD con los N juegos.
   - client/public/sitemap.xml: portada + #id por juego.
   Uso: node scripts/generar-seo.mjs */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const BASE = "https://arcade-de-juegos.vercel.app/";
const hoy = new Date().toISOString().slice(0, 10);
const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const games = readFileSync(join(RAIZ, "client/src/games/GAMES.js"), "utf8");
const entradas = [...games.matchAll(/^  (\w+): \{ nombre: "([^"]+)", emoji: "([^"]*)", descripcion: "([^"]*)"/gm)];
if (!entradas.length) { console.error("Sin juegos en GAMES.js"); process.exit(1); }
const N = entradas.length;

// ---- index.html ----
const pHtml = join(RAIZ, "client/index.html");
let html = readFileSync(pHtml, "utf8");
const items = entradas.map((e, i) =>
  `{"@type":"ListItem","position":${i + 1},"item":{"@type":"VideoGame","name":${JSON.stringify(e[2])},"description":${JSON.stringify(e[4])},"url":"${BASE}#${e[1]}","applicationCategory":"Game"}}`
).join(",");
const ld = `{"@context":"https://schema.org","@graph":[{"@type":"WebSite","name":"ArcadePaLoMuchacho","url":"${BASE}","description":"${N} minijuegos originales en español: arcade, casino, tableros, palabras y mente.","inLanguage":"es"},{"@type":"WebApplication","name":"ArcadePaLoMuchacho · ${N} minijuegos","url":"${BASE}","applicationCategory":"GameApplication","operatingSystem":"Web","offers":{"@type":"Offer","price":"0"},"inLanguage":"es"},{"@type":"ItemList","name":"Todos los juegos de ArcadePaLoMuchacho","numberOfItems":${N},"itemListElement":[${items}]}]}`;
html = html.replace(/<script type="application\/ld\+json">.*?<\/script>/s,
  `<script type="application/ld+json">${ld}</script>`);
html = html.replace(/<title>.*?<\/title>/, `<title>ArcadePaLoMuchacho · ${N} minijuegos gratis en español</title>`);
html = html.replace(/(<meta name="description" content="ArcadePaLoMuchacho: )\d+( minijuegos[^"]*")/, `$1${N}$2`);
html = html.replace(/(<meta property="og:title" content="ArcadePaLoMuchacho · )\d+( minijuegos[^"]*")/, `$1${N}$2`);
html = html.replace(/(<meta property="og:description" content=")\d+( minijuegos[^"]*")/, `$1${N}$2`);
html = html.replace(/(<meta name="twitter:title" content="ArcadePaLoMuchacho · )\d+( minijuegos[^"]*")/, `$1${N}$2`);
html = html.replace(/(<meta name="twitter:description" content=")\d+( minijuegos[^"]*")/, `$1${N}$2`);
html = html.replace(/(<meta property="og:description" content=")\d+( minijuegos originales[^"]*")/, `$1${N}$2`);
// descripciones que dicen "250 minijuegos originales" en WebSite/WebApplication del LD ya van en `ld`
writeFileSync(pHtml, html);

// ---- sitemap.xml ----
const urls = [`  <url><loc>${BASE}</loc><lastmod>${hoy}</lastmod><changefreq>weekly</changefreq><priority>1.0</priority></url>`,
  ...entradas.map(e => `  <url><loc>${BASE}#${e[1]}</loc><lastmod>${hoy}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>`)];
writeFileSync(join(RAIZ, "client/public/sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`);

console.log(`SEO regenerado: ${N} juegos (${hoy}). index.html + sitemap.xml al día.`);
