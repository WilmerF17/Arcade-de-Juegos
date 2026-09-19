/* Atajos de teclado compartidos: flechas + WASD y utilidades. */
import { useEffect } from "react";

export const DIR_ARRIBA = "arr";
export const DIR_ABAJO = "aba";
export const DIR_IZQ = "izq";
export const DIR_DER = "der";

const MAPA = {
  ArrowUp: DIR_ARRIBA, ArrowDown: DIR_ABAJO, ArrowLeft: DIR_IZQ, ArrowRight: DIR_DER,
  w: DIR_ARRIBA, W: DIR_ARRIBA, s: DIR_ABAJO, S: DIR_ABAJO,
  a: DIR_IZQ, A: DIR_IZQ, d: DIR_DER, D: DIR_DER,
};

/** Devuelve 'arr' | 'aba' | 'izq' | 'der' o null para una tecla. */
export function dirDeTecla(key) {
  return MAPA[key] || null;
}

export const OPUESTA = { arr: DIR_ABAJO, aba: DIR_ARRIBA, izq: DIR_DER, der: DIR_IZQ };

/** true si el foco está en un campo de escritura (para no robar teclas). */
export function escribiendo() {
  const t = document.activeElement;
  return !!t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT");
}

/**
 * Suscribe un manejador global de keydown.
 * El manejador recibe el evento y debe devolver true si consumió la tecla
 * (entonces se hace preventDefault para evitar scroll).
 */
export function useTeclas(handler, deps = []) {
  useEffect(() => {
    const fn = e => {
      if (e.repeat) return;
      if (handler(e) === true) e.preventDefault();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
