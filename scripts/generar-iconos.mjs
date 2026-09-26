#!/usr/bin/env node
/* Genera todos los iconos del arcade desde client/public/favicon.svg:
   icon-48/192/512, maskable-512 (con zona segura), apple-touch-icon (180,
   fondo sólido), og-image (1200×630) y promo-540 (540×720).
   Necesita sharp:  npm install --no-save sharp   (o SHARP_PKG=/ruta/a/sharp)
   Uso: node scripts/generar-iconos.mjs */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const PUB = join(RAIZ, "client", "public");
const N = (() => {
  try {
    const g = readFileSync(join(RAIZ, "client", "src", "games", "GAMES.js"), "utf8");
    return [...g.matchAll(/^  (\w+): \{ nombre: "/gm)].length;
  } catch { return 276; }
})();

let sharp;
try {
  const mod = await import("sharp");
  sharp = mod.default ?? mod;
} catch {
  try {
    sharp = createRequire(process.env.SHARP_PKG || "/tmp/opencode/package.json")("sharp");
  } catch {
    console.error("Falta sharp: npm install --no-save sharp");
    process.exit(1);
  }
}

const base = readFileSync(join(PUB, "favicon.svg"));
const png = (svg, w, h) => sharp(typeof svg === "string" ? Buffer.from(svg) : svg, { density: 300 }).resize(w, h).png();

// 1. Iconos directos
await png(base, 48, 48).toFile(join(PUB, "icon-48.png"));
await png(base, 192, 192).toFile(join(PUB, "icon-192.png"));
await png(base, 512, 512).toFile(join(PUB, "icon-512.png"));

// 2. Maskable: icono al 80% centrado sobre fondo sólido
const fondo = { r: 21, g: 8, b: 38 };
await sharp({ create: { width: 512, height: 512, channels: 3, background: fondo } })
  .composite([{ input: await png(base, 410, 410).toBuffer(), gravity: "center" }])
  .png().toFile(join(PUB, "maskable-512.png"));

// 3. Apple touch: 180 sin transparencias
await sharp({ create: { width: 180, height: 180, channels: 3, background: fondo } })
  .composite([{ input: await png(base, 180, 180).toBuffer(), gravity: "center" }])
  .png().toFile(join(PUB, "apple-touch-icon.png"));

// 4. Portadas con texto (fuente del sistema DejaVu)
const fuente = "DejaVu Sans, sans-serif";
const ogTexto = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<defs><linearGradient id="f" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="#2a0f2e"/><stop offset=".55" stop-color="#150826"/><stop offset="1" stop-color="#0a1a3e"/>
</linearGradient></defs>
<rect width="1200" height="630" fill="url(#f)"/>
<text x="470" y="295" font-family="${fuente}" font-weight="bold" font-size="76" fill="#ffffff">PaLoMuchacho</text>
<text x="474" y="368" font-family="${fuente}" font-size="44" fill="#ff9a3d">${N} minijuegos gratis</text>
<text x="474" y="428" font-family="${fuente}" font-size="32" fill="#9aa1b8">XP · niveles · logros · sin conexión</text>
</svg>`;
const og = await sharp({ create: { width: 1200, height: 630, channels: 3, background: fondo } })
  .composite([
    { input: await png(ogTexto, 1200, 630).toBuffer(), gravity: "center" },
    { input: await png(base, 300, 300).toBuffer(), left: 100, top: 165 },
  ]).png().toBuffer();
await sharp(og).toFile(join(PUB, "og-image.png"));

const promoTexto = `<svg xmlns="http://www.w3.org/2000/svg" width="540" height="720" viewBox="0 0 540 720">
<defs><linearGradient id="f" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#2a0f2e"/><stop offset="1" stop-color="#0a1a3e"/>
</linearGradient></defs>
<rect width="540" height="720" fill="url(#f)"/>
<text x="270" y="470" text-anchor="middle" font-family="${fuente}" font-weight="bold" font-size="64" fill="#ffffff">PaLoMuchacho</text>
<text x="270" y="530" text-anchor="middle" font-family="${fuente}" font-size="40" fill="#ff9a3d">${N} minijuegos</text>
<text x="270" y="582" text-anchor="middle" font-family="${fuente}" font-size="30" fill="#9aa1b8">Juega sin conexión</text>
</svg>`;
const promo = await sharp({ create: { width: 540, height: 720, channels: 3, background: fondo } })
  .composite([
    { input: await png(promoTexto, 540, 720).toBuffer(), gravity: "center" },
    { input: await png(base, 240, 240).toBuffer(), left: 150, top: 120 },
  ]).png().toBuffer();
await sharp(promo).toFile(join(PUB, "promo-540.png"));

console.log(`Iconos generados (${N} juegos): 48, 192, 512, maskable, apple-touch, og-image, promo-540.`);
