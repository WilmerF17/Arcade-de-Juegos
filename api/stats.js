/* GET /api/stats y GET /api/stats/:juego (vía ?juego=) */
const { leer } = require("./_store");

const ID_RE = /^[a-z0-9_-]{2,32}$/;

module.exports = async (req, res) => {
  const datos = await leer();
  // Vercel: /api/stats?juego=pulso  —  Express: /api/stats/:juego
  const id = String((req.query && req.query.juego) || "").toLowerCase();
  if (!id) return res.status(200).json(datos);
  if (!ID_RE.test(id)) return res.status(400).json({ error: "Identificador de juego inválido" });
  const j = datos[id];
  if (!j) return res.status(404).json({ error: "Juego no encontrado" });
  return res.status(200).json({ juego: id, ...j });
};
