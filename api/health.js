/* GET /api/health (db = configurado, dbOk = Upstash responde, dbError = motivo) */
module.exports = async (_req, res) => {
  const url = (process.env.UPSTASH_REDIS_REST_URL || "").replace(/\/$/, "");
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || "";
  const db = Boolean(url && token);
  let dbOk = false;
  let dbError = db ? "sin probar" : "sin configurar";
  if (db) {
    try {
      const r = await fetch(url + "/ping", { headers: { Authorization: `Bearer ${token}` } });
      const t = await r.text();
      dbOk = r.ok;
      dbError = r.ok ? "ok" : `HTTP ${r.status}: ${t.slice(0, 80)}`;
    } catch (e) {
      dbError = "red: " + String((e && e.message) || e).slice(0, 80);
    }
  }
  res.status(200).json({ ok: true, app: "arcadepalomuchacho", db, dbOk, dbError, tiempo: new Date().toISOString() });
};
