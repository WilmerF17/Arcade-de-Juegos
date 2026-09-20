/* GET /api/health (db:true = Upstash configurado en este deploy) */
module.exports = async (_req, res) => {
  const db = Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  );
  res.status(200).json({ ok: true, app: "arcadepalomuchacho", db, tiempo: new Date().toISOString() });
};
