import express from "express";
import cors from "cors";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "data");
const SCORES_FILE = path.join(DATA_DIR, "scores.json");
const PORT = process.env.PORT || 3001;

const app = express();
app.use(cors());
app.use(express.json({ limit: "128kb" }));

// ---------- persistencia ----------
function leerDatos() {
  try {
    return JSON.parse(fs.readFileSync(SCORES_FILE, "utf-8"));
  } catch {
    return {};
  }
}

function guardarDatos(datos) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = SCORES_FILE + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(datos, null, 2), "utf-8");
  fs.renameSync(tmp, SCORES_FILE);
}

function inicio() {
  return { mejor: 0, ganadas: 0, jugadas: 0, historial: [] };
}

// ---------- API ----------
// Lista de estadísticas de todos los juegos
app.get("/api/stats", (_req, res) => {
  res.json(leerDatos());
});

// Estadísticas de UN juego
app.get("/api/stats/:juego", (req, res) => {
  const datos = leerDatos();
  const j = datos[req.params.juego];
  if (!j) return res.status(404).json({ error: "Juego no encontrado" });
  res.json({ juego: req.params.juego, ...j });
});

// Registra una partida: { juego, puntos, ganadas, jugadas }
// Devuelve estadísticas actualizadas y si hubo nuevo récord.
app.post("/api/scores", (req, res) => {
  const { juego, puntos = 0, ganadas = 0, jugadas = 1 } = req.body || {};
  if (!juego || typeof juego !== "string") {
    return res.status(400).json({ error: "Falta el nombre del juego" });
  }
  const datos = leerDatos();
  const actual = datos[juego] || inicio();
  const nuevoRecord =
    typeof puntos === "number" && puntos > (actual.mejor || 0);
  if (nuevoRecord) actual.mejor = puntos;
  actual.ganadas = (actual.ganadas || 0) + (Number(ganadas) || 0);
  actual.jugadas = (actual.jugadas || 0) + (Number(jugadas) || 1);
  actual.historial = actual.historial || [];
  if (typeof puntos === "number") {
    actual.historial.push({
      puntos: Math.max(0, Math.round(puntos)),
      fecha: new Date().toISOString(),
      victoria: Boolean(ganadas),
    });
    if (actual.historial.length > 12) actual.historial = actual.historial.slice(-12);
  }
  datos[juego] = actual;
  guardarDatos(datos);
  res.json({ juego, ...actual, nuevoRecord });
});

// Servir el frontend compilado si existe (producción)
const clientDist = path.join(__dirname, "..", "client", "dist");
if (fs.existsSync(clientDist)) {
  // Assets con hash: inmutables, caché larga
  app.use("/assets", express.static(path.join(clientDist, "assets"), { maxAge: "1y", immutable: true }));
  app.use(express.static(clientDist));
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.set("Cache-Control", "no-cache");
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`🕹️  API de juegos web escuchando en http://localhost:${PORT}`);
});