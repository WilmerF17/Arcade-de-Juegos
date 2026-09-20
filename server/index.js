import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "data");
const SCORES_FILE = path.join(DATA_DIR, "scores.json");
const PORT = Number.parseInt(process.env.PORT || "3001", 10) || 3001;
// URL pública del frontend (para CORS estricto y canonical). Ej: https://arcadepalomuchacho.vercel.app
const FRONTEND_URLS = (process.env.FRONTEND_URL || "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", 1);

// ---------- seguridad: cabeceras ----------
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      frameAncestors: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// ---------- CORS: mismo origen por defecto, lista blanca si hay FRONTEND_URL ----------
app.use(cors({
  origin: (origen, cb) => {
    if (!origen) return cb(null, true); // mismo origen / curl / PWA
    if (FRONTEND_URLS.length === 0) return cb(null, true);
    if (FRONTEND_URLS.includes(origen)) return cb(null, true);
    return cb(new Error("Origen no permitido"));
  },
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
  maxAge: 86400,
}));
app.use(express.json({ limit: "32kb" }));

// ---------- rate-limit anti-spam ----------
const apiGeneral = rateLimit({
  windowMs: 60_000, max: 300, standardHeaders: true, legacyHeaders: false,
});
const scoresLimit = rateLimit({
  windowMs: 60_000, max: 60, standardHeaders: true, legacyHeaders: false,
  message: { error: "Demasiadas puntuaciones, espera un minuto" },
});
app.use("/api/", apiGeneral);

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

// ---------- validación estricta ----------
const ID_RE = /^[a-z0-9_-]{2,32}$/;
function numFinito(v, min, max, defecto) {
  const n = Number(v);
  if (!Number.isFinite(n)) return defecto;
  return Math.min(max, Math.max(min, n));
}
function entero(v, min, max, defecto) {
  const n = Number.parseInt(v, 10);
  if (!Number.isFinite(n)) return defecto;
  return Math.min(max, Math.max(min, n));
}

// ---------- API ----------
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, app: "arcadepalomuchacho", tiempo: new Date().toISOString() });
});

// Lista de estadísticas de todos los juegos
app.get("/api/stats", (_req, res) => {
  res.json(leerDatos());
});

// Estadísticas de UN juego
app.get("/api/stats/:juego", (req, res) => {
  const id = String(req.params.juego || "").toLowerCase();
  if (!ID_RE.test(id)) return res.status(400).json({ error: "Identificador de juego inválido" });
  const datos = leerDatos();
  const j = datos[id] ?? datos[req.params.juego];
  if (!j) return res.status(404).json({ error: "Juego no encontrado" });
  res.json({ juego: id, ...j });
});

// Registra una partida: { juego, puntos, ganadas, jugadas }
app.post("/api/scores", scoresLimit, (req, res) => {
  const bruto = req.body || {};
  const juego = String(bruto.juego || "").toLowerCase();
  if (!ID_RE.test(juego)) {
    return res.status(400).json({ error: "Falta un nombre de juego válido (a-z, 0-9, -, _)" });
  }
  const puntos = numFinito(bruto.puntos, 0, 10_000_000, 0);
  const ganadas = entero(bruto.ganadas, 0, 50, 0);
  const jugadas = entero(bruto.jugadas, 1, 50, 1);

  const datos = leerDatos();
  const actual = datos[juego] || inicio();
  const puntosRed = Math.max(0, Math.round(puntos));
  const nuevoRecord = puntosRed > (actual.mejor || 0);
  if (nuevoRecord) actual.mejor = puntosRed;
  actual.ganadas = (actual.ganadas || 0) + ganadas;
  actual.jugadas = (actual.jugadas || 0) + jugadas;
  actual.historial = actual.historial || [];
  actual.historial.push({
    puntos: puntosRed,
    fecha: new Date().toISOString(),
    victoria: ganadas > 0,
  });
  if (actual.historial.length > 12) actual.historial = actual.historial.slice(-12);
  datos[juego] = actual;
  try {
    guardarDatos(datos);
  } catch {
    return res.status(500).json({ error: "No se pudo guardar la puntuación" });
  }
  res.json({ juego, ...actual, nuevoRecord });
});

// 404 JSON para API desconocida
app.use("/api", (_req, res) => res.status(404).json({ error: "Ruta API no encontrada" }));

// Servir el frontend compilado si existe (producción)
const clientDist = path.join(__dirname, "..", "client", "dist");
if (fs.existsSync(clientDist)) {
  // Assets con hash: inmutables, caché larga
  app.use("/assets", express.static(path.join(clientDist, "assets"), { maxAge: "1y", immutable: true }));
  app.use(express.static(clientDist, { dotfiles: "allow" }));
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.set("Cache-Control", "no-cache");
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`🕹️  ArcadePaLoMuchacho escuchando en http://localhost:${PORT}`);
});
