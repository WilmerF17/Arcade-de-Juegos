/* Almacén de puntuaciones: Upstash Redis (REST) con respaldo en memoria.
   - En Vercel define UPSTASH_REDIS_REST_URL y UPSTASH_REDIS_REST_TOKEN.
   - Sin esas variables funciona en memoria (se reinicia en frío, pero no falla). */
const mem = { scores: {} };

function env() {
  return {
    url: (process.env.UPSTASH_REDIS_REST_URL || "").replace(/\/$/, ""),
    token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
  };
}

async function upstash(path, body) {
  const { url, token } = env();
  if (!url || !token) return null;
  const r = await fetch(url + path, {
    method: body === undefined ? "GET" : "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!r.ok) throw new Error("Upstash " + r.status);
  return r.json();
}

async function leer() {
  try {
    const d = await upstash("/get/aplm_scores");
    if (d && d.result) return JSON.parse(d.result);
  } catch { /* cae a memoria */ }
  return mem.scores;
}

async function guardar(scores) {
  mem.scores = scores;
  try {
    await upstash("/set/aplm_scores", JSON.stringify(scores));
  } catch { /* queda en memoria */ }
}

module.exports = { leer, guardar };
