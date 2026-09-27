/* Apuestas v2: selector + saldo en vivo + cobro con registro, racha con bonus,
   límite diario de pérdidas e historial. Todos los juegos de casino la usan. */
import { useEffect, useState } from "react";
import { cargarBilletera, apostar, cobrar, resolverApuesta, bonusRacha } from "./billetera";
import { sfx } from "./sonido";

export const APUESTAS = [10, 25, 50, 100, 250];

/** Saldo en vivo: se refresca solo con cada movimiento de la billetera. */
export function useSaldo() {
  const [saldo, setSaldo] = useState(() => cargarBilletera().saldo);
  useEffect(() => {
    const fn = e => setSaldo(e.detail.saldo);
    window.addEventListener("aplm-billetera", fn);
    setSaldo(cargarBilletera().saldo);
    return () => window.removeEventListener("aplm-billetera", fn);
  }, []);
  return saldo;
}

/**
 * Intenta apostar. Si falla, deja el aviso listo y suena mal.
 * Devuelve { ok, saldo }.
 */
export function apostarConAviso(cantidad, setAviso) {
  const r = apostar(cantidad);
  if (!r.ok) {
    setAviso?.(`⛔ ${r.motivo}. Reclama el 🎁 bonus diario o juega gratis para ganar fichas.`);
    sfx.mal();
  } else {
    setAviso?.("");
  }
  return r;
}

/**
 * Resuelve una apuesta ganada: cobra el premio (+bonus de racha cada 3
 * victorias seguidas), suena moneda y registra puntos.
 * premio = total a cobrar (incluye la apuesta). Devuelve {saldo, bonus}.
 */
export function cobrarPremio(premio, apuesta, registrarPunt, setSaldo) {
  const racha = resolverApuesta(apuesta, premio);
  const extra = bonusRacha(apuesta, racha);
  const p = Math.floor(premio) + extra;
  const saldo = cobrar(p);
  setSaldo?.(saldo);
  sfx.moneda();
  registrarPunt?.(Math.max(0, p - apuesta), 1);
  return { saldo, bonus: extra, racha };
}

/** Pierde una apuesta: rompe la racha, cuenta al límite diario y registra a cero. */
export function perderApuesta(registrarPunt, apuesta = 0) {
  resolverApuesta(apuesta, 0);
  sfx.mal();
  registrarPunt?.(0, 0);
}

/** Fila de fichas para elegir apuesta. Se oculta sola mientras hay ronda en juego. */
export function SelectorApuesta({ apuesta, setApuesta, jugando = false }) {
  if (jugando) return null;
  return (
    <div className="fila-botones apuesta-fila" role="group" aria-label="Cantidad a apostar">
      <span className="chip">Apuesta:</span>
      {APUESTAS.map(a => (
        <button key={a} className={apuesta === a ? "btn-principal" : "btn-suave"}
          onClick={() => { setApuesta(a); sfx.clic(); }}>{a}</button>
      ))}
    </div>
  );
}
