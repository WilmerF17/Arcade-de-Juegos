#!/usr/bin/env node
/* Auditoría de jugabilidad: revisa estáticamente cada juego.
   - Estructura: export default, GameShell, useRegistro, registrarPunt, resultado visible.
   - Fugas: addEventListener/removeEventListener y setInterval/clearInterval balanceados.
   - Apuestas: si apuesta, también cobra (sin callejones sin salida).
   - Higiene: sin eval, sin dangerouslySetInnerHTML, sin console.log.
   Uso: npm run test:juegos (sale con código 1 si hay errores) */
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "client", "src", "games");
let errores = 0, avisos = 0;
const err = (f, m) => { console.log(`  ❌ ${f}: ${m}`); errores++; };
const avi = (f, m) => { console.log(`  ⚠️ ${f}: ${m}`); avisos++; };

const archivos = readdirSync(DIR).filter(f => f.endsWith(".jsx") && f !== "GAMES.js");
console.log(`Auditando ${archivos.length} ficheros de juegos…`);
for (const f of archivos) {
  const src = readFileSync(join(DIR, f), "utf8");
  if (f === "Marcador.jsx") continue; // vista especial, no juego
  if (!/export default/.test(src) && !/export (function|const) /.test(src)) err(f, "sin componente exportado");
  if (!/from "\.\.\/ui\/GameShell"/.test(src)) err(f, "no usa GameShell");
  if (!/useRegistro\(/.test(src)) err(f, "no usa useRegistro (sin XP ni ranking)");
  if (!/registrarPunt\(|cobrarPremio\(|perderApuesta\(/.test(src)) err(f, "nunca registra la partida (ni directo ni vía apuesta)");
  if (!/<Resultado|mensaje-final|resultado=\{/.test(src)) err(f, "sin banner de resultado visible");
  const add = (src.match(/addEventListener\("/g) || []).length;
  const rem = (src.match(/removeEventListener\("/g) || []).length;
  if (add !== rem) err(f, `listeners desbalanceados (${add} add vs ${rem} remove): fuga de memoria`);
  const si = (src.match(/setInterval\(/g) || []).length;
  const ci = (src.match(/clearInterval\(/g) || []).length;
  if (si > 0 && ci === 0) err(f, "setInterval sin clearInterval: el juego no se detiene");
  // Solo cuenta como apuesta de fichas si importa apostar de la suite
  // (hay juegos con una función local llamada "apostar" que es solo elegir).
  const traeApuesta = /from "\.\.\/suite\/(billetera|apuesta)"[^;]*\bapostar(ConAviso)?\b/.test(src);
  if (traeApuesta && !/cobrar(Premio)?\(/.test(src)) err(f, "apuesta fichas pero nunca cobra: bote sin salida");
  if (/\beval\(/.test(src)) err(f, "usa eval()");
  if (/dangerouslySetInnerHTML/.test(src)) err(f, "usa dangerouslySetInnerHTML");
  if (/console\.log\(/.test(src)) avi(f, "console.log olvidado");
  if (/TODO|FIXME|XXX/.test(src)) avi(f, "tiene TODO/FIXME pendiente");
}
console.log(errores
  ? `\n💥 ${errores} error(es), ${avisos} aviso(s)`
  : `\n🎉 Juegos sanos: ${archivos.length - 1} auditados, ${avisos} aviso(s)`);
process.exit(errores ? 1 : 0);
