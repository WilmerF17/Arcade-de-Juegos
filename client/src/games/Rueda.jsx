import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { useSaldo, apostarConAviso, cobrarPremio, perderApuesta, SelectorApuesta } from "../suite/apuesta";
import { sfx } from "../suite/sonido";

const SEGMENTOS = [0, 1, 2, 5, 1, 3, 2, 10];

/* Rueda Fortuna: gira la rueda de 8 premios (×0 a ×10). */
export default function Rueda() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Rueda Fortuna");
  const saldo = useSaldo();
  const [apuesta, setApuesta] = useState(25);
  const [angulo, setAngulo] = useState(0);
  const [ganador, setGanador] = useState(null);
  const [girando, setGirando] = useState(false);
  const [aviso, setAviso] = useState("");
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  function girar() {
    if (girando) return;
    const r = apostarConAviso(apuesta, setAviso);
    if (!r.ok) return;
    setGirando(true); setGanador(null);
    sfx.clic();
    const idx = Math.floor(Math.random() * SEGMENTOS.length);
    const vueltas = 4 * 360;
    const destino = angulo + vueltas + (360 - (idx * 45 + angulo % 360) % 360);
    setAngulo(destino);
    timer.current = setTimeout(() => {
      setGanador(idx);
      setGirando(false);
      const mult = SEGMENTOS[idx];
      if (mult > 0) cobrarPremio(apuesta * mult, apuesta, registrarPunt);
      else perderApuesta(registrarPunt);
    }, 2100);
  }

  return (
    <GameShell titulo="Rueda Fortuna" emoji="🎡"
      descripcion="Gira la rueda: premios de ×0 a ×10. El ×10 solo sale en 1 de 8."
      stats={[{ icono: "🪙", valor: saldo }, ...(ganador != null ? [{ etiqueta: "Premio", valor: `×${SEGMENTOS[ganador]}` }] : [])]}
      resultado={{ mensaje, tipo }}
      ayuda={<span>La rueda tiene dos ceros: si cae en <b>×0</b> pierdes la apuesta. El resto devuelve la apuesta multiplicada.</span>}>
      <SelectorApuesta apuesta={apuesta} setApuesta={setApuesta} jugando={girando} />
      <div className="rueda-wrap" aria-hidden>
        <div className="rueda-flecha">🔻</div>
        <div className="rueda" style={{ transform: `rotate(${angulo}deg)`, transition: girando ? "transform 2s cubic-bezier(.15,.8,.25,1)" : "none" }}>
          {SEGMENTOS.map((m, i) => (
            <span key={i} className={`rueda-seg s${i}${ganador === i ? " on" : ""}`}
              style={{ transform: `rotate(${i * 45}deg) translateY(-64px)` }}>×{m}</span>
          ))}
        </div>
      </div>
      <div className="fila-botones">
        <button className="btn-principal" onClick={girar} disabled={girando}>
          {girando ? "Girando…" : `🎡 Girar (${apuesta})`}
        </button>
      </div>
      {aviso && <p className="aviso info" style={{ textAlign: "center" }}>{aviso}</p>}
      <Resultado mensaje={mensaje} tipo={tipo} />
    </GameShell>
  );
}
