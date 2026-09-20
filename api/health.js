/* GET /api/health: db configurado + prueba real de escritura/lectura vía _store. */
const { leer, guardar } = require("./_store");

module.exports = async (_req, res) => {
  const url = (process.env.UPSTASH_REDIS_REST_URL || "").replace(/\/$/, "");
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || "";
  const db = Boolean(url && token);
  const info = { ok: true, app: "arcadepalomuchacho", db, tiempo: new Date().toISOString() };
  if (!db) return res.status(200).json(info);
  const H = { Authorization: `Bearer ${token}` };
  try {
    const p = await fetch(url + "/ping", { headers: H });
    info.ping = p.ok ? "ok" : `HTTP ${p.status}`;
    if (!p.ok) { info.detalle = (await p.text()).slice(0, 100); return res.status(200).json(info); }
  } catch (e) {
    info.ping = "red: " + String((e && e.message) || e).slice(0, 80);
    return res.status(200).json(info);
  }
  try {
    const sonda = { ping: 1, cuando: Date.now() };
    const antes = await leer();
    await guardar({ ...antes, aplm_sonda: sonda });
    const despues = await leer();
    info.escritura = despues && despues.aplm_sonda && despues.aplm_sonda.cuando === sonda.cuando ? "ok" : "no persiste";
    info.lectura = info.escritura;
    await guardar(antes); // limpia la sonda, deja los datos intactos
  } catch (e) {
    info.escritura = "red: " + String((e && e.message) || e).slice(0, 80);
  }
  return res.status(200).json(info);
};
