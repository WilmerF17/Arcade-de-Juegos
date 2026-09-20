/* Almacén de puntuaciones: Upstash Redis (REST estilo path, probado) + memoria.
   - En Vercel define UPSTASH_REDIS_REST_URL y UPSTASH_REDIS_REST_TOKEN.
   - Sin esas variables funciona en memoria (se reinicia en frío, pero no falla). */
const mem = { scores: {} };

function env() {
  return {
    url: (process.env.UPSTASH_REDIS_REST_URL || "").replace(/\/$/, ""),
    token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
  };
}

async function leer() {
  const { url, token } = env();
  if (!url || !token) return mem.scores;
  try {
    const r = await fetch(`${url}/get/aplm_scores`, { headers: { Authorization: `Bearer ${token}` } });
    if (!r.ok) throw new Error("Upstash " + r.status);
    const d = await r.json();
    if (d && typeof d.result === "string" && d.result) return JSON.parse(d.result);
  } catch { /* cae a memoria */ }
  return mem.scores;
}

async function guardar(scores) {
  mem.scores = scores;
  const { url, token } = env();
  if (!url || !token) return;
  try {
    const r = await fetch(`${url}/set/aplm_scores/${encodeURIComponent(JSON.stringify(scores))}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!r.ok) throw new Error("Upstash " + r.status);
  } catch { /* queda en memoria */ }
}

module.exports = { leer, guardar };
