/* GET /api/health: db configurado + prueba real de escritura/lectura vía _store. */
const { leer, guardar } = require("./_store");

module.exports = async (_req, res) => {
  const url = (process.env.UPSTASH_REDIS_REST_URL || "").replace(/\/$/, "");
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || "";
  const db = Boolean(url && token);
  const info = { ok: true, app: "arcadepalomuchacho", v: 4, db, tiempo: new Date().toISOString() };
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
    // Prueba honesta: JSON con la forma real de puntuaciones, sin pasar por la caché.
    const H2 = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
    const muestra = JSON.stringify({ keno: { mejor: 1, historial: [{ puntos: 1, fecha: "2026-01-01T00:00:00.000Z", victoria: true }] } });
    const w = await fetch(url, { method: "POST", headers: H2, body: JSON.stringify(["SET", "aplm_p", muestra]) });
    const wt = await w.text();
    info.escritura = w.ok ? "http-ok" : `HTTP ${w.status}: ${wt.slice(0, 120)}`;
    if (w.ok) {
      const g = await fetch(url, { method: "POST", headers: H2, body: JSON.stringify(["GET", "aplm_p"]) });
      const gj = await g.json().catch(() => ({}));
      info.lectura = gj.result === muestra ? "ok" : `distinto: ${JSON.stringify(gj).slice(0, 120)}`;
      await fetch(url, { method: "POST", headers: H2, body: JSON.stringify(["DEL", "aplm_p"]) }).catch(() => {});
    }
  } catch (e) {
    info.escritura = "red: " + String((e && e.message) || e).slice(0, 80);
  }
  return res.status(200).json(info);
};
