#!/usr/bin/env node
/* Pre-arranque portable: compila el cliente solo si falta client/dist.
   - Glitch (sin fase de build) lo compila en el primer arranque.
   - Docker/Render ya traen dist compilado: no hace nada. */
import { existsSync } from "node:fs";
import { execSync } from "node:child_process";

if (existsSync(new URL("../client/dist/index.html", import.meta.url))) {
  console.log("[preparar] dist ya existe, nada que hacer.");
  process.exit(0);
}
console.log("[preparar] compilando cliente…");
execSync("npm run install-all && npm run build", { stdio: "inherit" });
