/* Almacén de puntuaciones: Upstash Redis (REST, formato documentado) con respaldo en memoria.
   - En Vercel define UPSTASH_REDIS_REST_URL y UPSTASH_REDIS_REST_TOKEN.
   - Sin esas variables funciona en memoria (se reinicia en frío, pero no falla). */
const mem = { scores: {} };

function env() {
  return {
    url: (process.env.UPSTASH_REDIS_REST_URL || "").replace(/\/$/, ""),
    token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
  };
}

/* Llamada REST documentada: POST / con ["COMANDO", ...args] */
async function cmd(...args) {
  const { url, token } = env();
  if (!url || !token) return null;
  const r = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(args),
  });
  if (!r.ok) throw new Error("Upstash " + r.status);
  return r.json();
}

async function leer() {
  try {
    const d = await cmd("GET", "aplm_scores");
    if (d && d.result) return JSON.parse(d.result);
  } catch { /* cae a memoria */ }
  return mem.scores;
}

async function guardar(scores) {
  mem.scores = scores;
  try {
    await cmd("SET", "aplm_scores", JSON.stringify(scores));
  } catch { /* queda en memoria */ }
}

module.exports = { leer, guardar };
