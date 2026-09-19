// En producción todo junto usa "/api". Si la API vive en otra URL
// (frontend estático en Netlify/Vercel), define VITE_API_URL,
// p. ej. VITE_API_URL=https://tu-api.onrender.com
const BASE = `${(import.meta.env.VITE_API_URL || "").replace(/\/$/, "")}/api`;

async function peticion(url, opciones) {
  const r = await fetch(BASE + url, opciones);
  if (!r.ok) {
    const cuerpo = await r.json().catch(() => ({}));
    throw new Error(cuerpo.error || "Error de red");
  }
  return r.json();
}

export function getStats() {
  return peticion("/stats");
}

/** Registra una partida. Devuelve { juego, mejor, ganadas, jugadas, historial, nuevoRecord } */
export async function registrar(juego, puntos = 0, ganadas = 0, jugadas = 1) {
  return peticion("/scores", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ juego, puntos, ganadas, jugadas }),
  });
}