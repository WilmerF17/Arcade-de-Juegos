#!/usr/bin/env node
/* Publicación total de ArcadePaLoMuchacho en un solo comando:
   1. Tests del catálogo (npm run test) — si falla, se aborta.
   2. Build del cliente (npm run build) — si falla, se aborta.
   3. Verifica que el dist trae el APK.
   4. git add -A + commit + push a origin (y a hf si existe el remoto).
      Vercel y GitHub Pages redespliegan solos al recibir el push.
   5. Muestra qué revisar después (URLs, Search Console).

   Uso: npm run publicar -- "mensaje del commit"
        npm run publicar -- --dry   (chequea todo sin commitear ni pushear)
        ./bin/dale --publicar -- "mensaje" */
import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const DRY = args.includes("--dry");
const dado = args.filter(a => a !== "--dry").join(" ").trim();

const paso = m => console.log(`\n🔹 ${m}`);
const ok = m => console.log(`   ✅ ${m}`);
const mal = m => { console.error(`   ❌ ${m}`); process.exit(1); };
const corre = (cmd, opts = {}) =>
  execSync(cmd, { cwd: RAIZ, stdio: "inherit", ...opts });

if (!dado && !DRY) {
  console.log('Sin mensaje: usaré uno automático (puedes darlo: npm run publicar -- "mi cambio").');
}
const mensaje = dado;

// 0. Guardia: jamás subir llaves de firma Android ni secretos
paso("Guardia de secretos");
const staged = execSync("git diff --cached --name-only", { cwd: RAIZ, encoding: "utf8" });
const stageAll = execSync("git status --porcelain", { cwd: RAIZ, encoding: "utf8" });
const peligrosos = (staged + "\n" + stageAll).split("\n")
  .map(l => l.slice(3).trim())
  .filter(f => /\.(keystore|jks|p12|pfx)$/i.test(f) || f === ".env" || f.startsWith(".env."));
if (peligrosos.length) mal("Archivos peligrosos en el repo: " + [...new Set(peligrosos)].join(", "));
ok("sin keystores ni .env en los cambios");

// 1. Tests
paso("1/4 Tests del catálogo + SEO");
try {
  corre("npm run test");
} catch { mal("tests fallidos: arregla antes de publicar"); }

// 2. Build
paso("2/4 Build del cliente");
try {
  corre("npm run build");
} catch { mal("build fallido"); }
for (const f of ["client/dist/index.html", "client/dist/descargas/palomuchacho.apk"]) {
  if (!existsSync(join(RAIZ, f))) mal("falta en dist: " + f);
}
ok("dist trae index + APK");

// 3 y 4. Commit + push (o simulacro)
const rama = execSync("git branch --show-current", { cwd: RAIZ, encoding: "utf8" }).trim() || "main";
const version = JSON.parse(readFileSync(join(RAIZ, "package.json"), "utf8")).version;
const hoy = new Date().toISOString().slice(0, 10);
const msgFinal = mensaje || `v${version} ${hoy}`;
if (DRY) {
  paso(`3/4 SIMULACRO: commitearía "${msgFinal}" en ${rama} y pushearía a:`);
  console.log("   - origin (GitHub → Vercel + Pages redespliegan solos)");
  try {
    execSync("git remote get-url hf", { cwd: RAIZ, stdio: "ignore" });
    console.log("   - hf (espejo Hugging Face)");
  } catch { console.log("   (sin remoto hf: solo origin)"); }
  ok("todo listo para publicar de verdad");
  process.exit(0);
}

paso(`3/4 Commit "${msgFinal}"`);
corre("git add -A");
try {
  execSync("git diff --cached --quiet", { cwd: RAIZ, stdio: "ignore" });
  console.log("   (sin cambios: nada que commitear, igual pusheo)");
} catch {
  corre(`git commit -m "${msgFinal.replace(/"/g, "")}"`);
}

paso("4/4 Push (Vercel + Pages despliegan solos)");
corre(`git push origin ${rama}`);
try {
  execSync("git remote get-url hf", { cwd: RAIZ, stdio: "ignore" });
  corre(`git push hf ${rama}`);
} catch { /* sin remoto hf: solo origin */ }

console.log("\n🎉 Publicado. Revisa en unos minutos:");
console.log("   - App: https://arcade-de-juegos.vercel.app");
console.log("   - APK: https://arcade-de-juegos.vercel.app/descargas/palomuchacho.apk");
console.log("   - Sitemap: https://arcade-de-juegos.vercel.app/sitemap.xml");
console.log("   - Si cambiaste juegos: Search Console → Sitemaps → vuelve a enviar el sitemap.");
