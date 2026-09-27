/* Recordatorio del desafío del día: notificación local (sin servidor).
   Se pide permiso una vez; cada visita avisa si el desafío sigue pendiente. */

const CLAVE = "arcade-aviso-desafio";
const CLAVE_ULTIMO = "arcade-aviso-fecha";

function hoy() {
  return new Date().toISOString().slice(0, 10);
}

export function avisoActivado() {
  try {
    return localStorage.getItem(CLAVE) === "si" && "Notification" in window;
  } catch {
    return false;
  }
}

/** Pide permiso y activa/desactiva. Devuelve el estado final ("si"/"no"/"bloqueado"). */
export async function cambiarAviso() {
  try {
    if (localStorage.getItem(CLAVE) === "si") {
      localStorage.setItem(CLAVE, "no");
      return "no";
    }
    if (!("Notification" in window)) return "nobrowser";
    const p = await Notification.requestPermission();
    if (p !== "granted") return "bloqueado";
    localStorage.setItem(CLAVE, "si");
    return "si";
  } catch {
    return "nobrowser";
  }
}

/** Avisa una vez al día si el desafío está pendiente. Llamar al abrir la app. */
export function revisarAviso(prog) {
  try {
    if (localStorage.getItem(CLAVE) !== "si") return;
    if (Notification.permission !== "granted") return;
    const h = hoy();
    if (localStorage.getItem(CLAVE_ULTIMO) === h) return;
    const d = prog?.desafio;
    if (!d?.juego || d.fecha !== h || d.hecho) return;
    localStorage.setItem(CLAVE_ULTIMO, h);
    const titulo = "⚡ Desafío del día listo";
    const cuerpo = `Hoy toca con doble XP. ¡No pierdas la racha!`;
    if (navigator.serviceWorker?.ready) {
      navigator.serviceWorker.ready.then(r => {
        try { r.showNotification(titulo, { body: cuerpo, tag: "desafio-hoy", icon: "./icon-192.png" }); } catch { /* noop */ }
      }).catch(() => {});
    } else {
      try { new Notification(titulo, { body: cuerpo, tag: "desafio-hoy" }); } catch { /* noop */ }
    }
  } catch { /* noop */ }
}
