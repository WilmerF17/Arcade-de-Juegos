/* GET /api/health: db configurado, ping, y prueba real de escritura/lectura. */
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
    const val = "sonda-" + Date.now();
    const w = await fetch(`${url}/set/aplm_sonda/${encodeURIComponent(val)}`, { method: "POST", headers: H });
    const wt = await w.text();
    info.escritura = w.ok ? "ok" : `HTTP ${w.status}: ${wt.slice(0, 100)}`;
    if (w.ok) {
      const g = await fetch(url + "/get/aplm_sonda", { headers: H });
      const gj = await g.json().catch(() => ({}));
      info.lectura = gj.result === val ? "ok" : `distinto: ${JSON.stringify(gj).slice(0, 100)}`;
      await fetch(`${url}/del/aplm_sonda`, { method: "POST", headers: H }).catch(() => {});
    }
  } catch (e) {
    info.escritura = "red: " + String((e && e.message) || e).slice(0, 80);
  }
  return res.status(200).json(info);
};
