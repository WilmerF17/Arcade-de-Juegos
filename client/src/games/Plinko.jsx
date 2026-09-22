import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { useSaldo, apostarConAviso, cobrarPremio, perderApuesta, SelectorApuesta } from "../suite/apuesta";
import { sfx } from "../suite/sonido";

const MULTS = [10, 3, 1.5, 0.5, 1.5, 3, 10];
const FILAS = 6;

/* Plinko: la bola rebota 6 filas de clavos y cae en un premio ×0.5 a ×10. */
export default function Plinko() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Plinko");
  const saldo = useSaldo();
  const [apuesta, setApuesta] = useState(25);
  const [pos, setPos] = useState(3);
  const [slot, setSlot] = useState(null);
  const [cayendo, setCayendo] = useState(false);
  const [aviso, setAviso] = useState("");
  const timers = useRef([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  function soltar() {
    if (cayendo) return;
    const r = apostarConAviso(apuesta, setAviso);
    if (!r.ok) return;
    setSlot(null);
    setCayendo(true);
    let p = 3;
    setPos(3);
    timers.current.forEach(clearTimeout);
    timers.current = [];
    for (let f = 0; f < FILAS; f++) {
      timers.current.push(setTimeout(() => {
        p += Math.random() < 0.5 ? -0.5 : 0.5;
        p = Math.max(0, Math.min(6, p));
        setPos(p);
        sfx.clic();
      }, 120 * (f + 1)));
    }
    timers.current.push(setTimeout(() => {
      const s = Math.round(p);
      const premio = Math.floor(apuesta * MULTS[s]);
      setSlot(s);
      setCayendo(false);
      if (premio > apuesta) cobrarPremio(premio, apuesta, registrarPunt);
      else perderApuesta(registrarPunt);
    }, 120 * (FILAS + 1)));
  }

  return (
    <GameShell titulo="Plinko" emoji="🔮"
      descripcion="Suelta la bola entre los clavos: cae en un premio de ×0.5 a ×10."
      stats={[{ icono: "🪙", valor: saldo }, ...(slot != null ? [{ etiqueta: "Premio", valor: `×${MULTS[slot]}` }] : [])]}
      resultado={{ mensaje, tipo }}
      ayuda={<span>La bola rebota al azar a izquierda o derecha en cada fila. Los bordes pagan <b>×10</b>, el centro <b>×0.5</b>.</span>}>
      <SelectorApuesta apuesta={apuesta} setApuesta={setApuesta} jugando={cayendo} />
      <div className="plinko-tab" aria-hidden>
        {Array.from({ length: FILAS }, (_, f) => (
          <div key={f} className="plinko-fila">
            {Array.from({ length: f + 3 }, (_, i) => <span key={i} className="plinko-clavo" />)}
          </div>
        ))}
        <div className="plinko-bola" style={{ left: `calc(${(pos / 6) * 100}% - 9px)` }}>⚪</div>
        <div className="plinko-slots">
          {MULTS.map((m, i) => (
            <span key={i} className={`plinko-slot${slot === i ? " on" : ""}`}>×{m}</span>
          ))}
        </div>
      </div>
      <div className="fila-botones">
        <button className="btn-principal" onClick={soltar} disabled={cayendo}>
          {cayendo ? "Cayendo…" : `🔮 Soltar (${apuesta})`}
        </button>
      </div>
      {aviso && <p className="aviso info" style={{ textAlign: "center" }}>{aviso}</p>}
      <Resultado mensaje={mensaje} tipo={tipo} />
    </GameShell>
  );
}
