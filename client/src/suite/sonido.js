/* Efectos de sonido con WebAudio (sin archivos). */

let ctx = null;
let activado = localStorage.getItem("arcade-sonido") !== "off";

export function sonidoActivado() {
  return activado;
}
export function cambiarSonido() {
  activado = !activado;
  localStorage.setItem("arcade-sonido", activado ? "on" : "off");
  return activado;
}

function audio() {
  if (!activado) return null;
  try {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tono(freq, t0, dur, tipo = "square", vol = 0.06) {
  const ac = audio();
  if (!ac) return;
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = tipo;
  o.frequency.value = freq;
  g.gain.setValueAtTime(vol, ac.currentTime + t0);
  g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + t0 + dur);
  o.connect(g).connect(ac.destination);
  o.start(ac.currentTime + t0);
  o.stop(ac.currentTime + t0 + dur);
}

export const sfx = {
  clic() { tono(600, 0, 0.06); },
  bien() { tono(523, 0, 0.1); tono(659, 0.09, 0.1); tono(784, 0.18, 0.16); },
  mal() { tono(220, 0, 0.15, "sawtooth"); tono(160, 0.12, 0.2, "sawtooth"); },
  record() { [523, 659, 784, 1046, 784, 1046].forEach((f, i) => tono(f, i * 0.09, 0.12)); },
  moneda() { tono(988, 0, 0.08); tono(1319, 0.07, 0.2); },
  salto() { tono(400, 0, 0.08, "sine", 0.08); },
};
