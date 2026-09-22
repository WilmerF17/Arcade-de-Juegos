import { useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { useSaldo, apostarConAviso, cobrarPremio, perderApuesta, SelectorApuesta } from "../suite/apuesta";
import { sfx } from "../suite/sonido";

const PREMIOS = [0, 0, 0, 2, 6];

/* Tómbola: elige 3 números del 0 al 9. Cada acierto multiplica: 2 → ×2, 3 → ×6. */
export default function Tombola() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Tómbola");
  const saldo = useSaldo();
  const [apuesta, setApuesta] = useState(25);
  const [elegidos, setElegidos] = useState([]);
  const [sorteo, setSorteo] = useState([]);
  const [aviso, setAviso] = useState("");

  function toggle(n) {
    if (sorteo.length) return;
    setElegidos(e => e.includes(n) ? e.filter(x => x !== n) : e.length < 3 ? [...e, n] : e);
    sfx.clic();
  }

  function sortear() {
    if (elegidos.length !== 3) { setAviso("⛔ Elige 3 números primero."); return; }
    const r = apostarConAviso(apuesta, setAviso);
    if (!r.ok) return;
    const bombo = Array.from({ length: 10 }, (_, i) => i).sort(() => Math.random() - 0.5);
    const s = bombo.slice(0, 3);
    setSorteo(s);
    const aciertos = elegidos.filter(n => s.includes(n)).length;
    if (PREMIOS[aciertos] > 0) cobrarPremio(apuesta * PREMIOS[aciertos], apuesta, registrarPunt);
    else perderApuesta(registrarPunt);
  }

  function limpiar() { setElegidos([]); setSorteo([]); setAviso(""); }

  return (
    <GameShell titulo="Tómbola" emoji="🎪"
      descripcion="Elige 3 números del 0 al 9: 2 aciertos ×2, pleno ×6."
      stats={[{ icono: "🪙", valor: saldo }, ...(sorteo.length ? [{ etiqueta: "Aciertos", valor: elegidos.filter(n => sorteo.includes(n)).length }] : [])]}
      resultado={{ mensaje, tipo }}
      ayuda={<span>Con 0-1 aciertos pierdes la apuesta. El pleno (3 de 3) paga <b>×6</b>.</span>}>
      <SelectorApuesta apuesta={apuesta} setApuesta={setApuesta} />
      <div className="tombola-grid" role="group" aria-label="Tus números">
        {Array.from({ length: 10 }, (_, n) => (
          <button key={n}
            className={`tombola-num${elegidos.includes(n) ? " sel" : ""}${sorteo.includes(n) ? " salio" : ""}`}
            onClick={() => toggle(n)}>{n}</button>
        ))}
      </div>
      {sorteo.length > 0 && <p style={{ textAlign: "center" }}>🎰 Sorteo: <b>{sorteo.join(" · ")}</b></p>}
      <div className="fila-botones">
        <button className="btn-principal" onClick={sortear}>🎪 Sortear ({apuesta})</button>
        {(elegidos.length > 0 || sorteo.length > 0) && <button className="btn-suave" onClick={limpiar}>Limpiar</button>}
      </div>
      {aviso && <p className="aviso info" style={{ textAlign: "center" }}>{aviso}</p>}
      <Resultado mensaje={mensaje} tipo={tipo} />
    </GameShell>
  );
}
