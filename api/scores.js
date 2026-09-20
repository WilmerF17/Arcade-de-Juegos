/* POST /api/scores  { juego, puntos, ganadas, jugadas } */
const { leer, guardar } = require("./_store");

const ID_RE = /^[a-z0-9_-]{2,32}$/;
const numFinito = (v, min, max, defecto) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return defecto;
  return Math.min(max, Math.max(min, n));
};
const entero = (v, min, max, defecto) => {
  const n = Number.parseInt(v, 10);
  if (!Number.isFinite(n)) return defecto;
  return Math.min(max, Math.max(min, n));
};
const inicio = () => ({ mejor: 0, ganadas: 0, jugadas: 0, historial: [] });

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });
  // Vercel puede entregar el body sin parsear si falta el content-type
  let bruto = req.body;
  if (typeof bruto === "string") {
    try { bruto = JSON.parse(bruto); } catch { bruto = {}; }
  }
  bruto = bruto || {};
  const juego = String(bruto.juego || "").toLowerCase();
  if (!ID_RE.test(juego)) {
    return res.status(400).json({ error: "Falta un nombre de juego válido (a-z, 0-9, -, _)" });
  }
  const puntos = numFinito(bruto.puntos, 0, 10_000_000, 0);
  const ganadas = entero(bruto.ganadas, 0, 50, 0);
  const jugadas = entero(bruto.jugadas, 1, 50, 1);

  const datos = await leer();
  const actual = datos[juego] || inicio();
  const puntosRed = Math.max(0, Math.round(puntos));
  const nuevoRecord = puntosRed > (actual.mejor || 0);
  if (nuevoRecord) actual.mejor = puntosRed;
  actual.ganadas = (actual.ganadas || 0) + ganadas;
  actual.jugadas = (actual.jugadas || 0) + jugadas;
  actual.historial = actual.historial || [];
  actual.historial.push({ puntos: puntosRed, fecha: new Date().toISOString(), victoria: ganadas > 0 });
  if (actual.historial.length > 12) actual.historial = actual.historial.slice(-12);
  datos[juego] = actual;
  await guardar(datos);
  return res.status(200).json({ juego, ...actual, nuevoRecord });
};
