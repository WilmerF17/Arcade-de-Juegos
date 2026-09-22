import { useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { useSaldo, apostarConAviso, cobrarPremio, perderApuesta, SelectorApuesta } from "../suite/apuesta";
import { sfx } from "../suite/sonido";

const PREMIOS = [0, 0, 0, 2, 5, 25, 100];

/* Lotto 6: elige 6 del 1 al 20. 3 aciertos ×2, 4 ×5, 5 ×25, pleno ×100. */
export default function Lotto6() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Lotto 6");
  const saldo = useSaldo();
  const [apuesta, setApuesta] = useState(25);
  const [elegidos, setElegidos] = useState([]);
  const [sorteo, setSorteo] = useState([]);
  const [aviso, setAviso] = useState("");

  function toggle(n) {
    if (sorteo.length) return;
    setElegidos(e => e.includes(n) ? e.filter(x => x !== n) : e.length < 6 ? [...e, n] : e);
    sfx.clic();
  }

  function sortear() {
    if (elegidos.length !== 6) { setAviso("⛔ Elige 6 números primero."); return; }
    const r = apostarConAviso(apuesta, setAviso);
    if (!r.ok) return;
    const bombo = Array.from({ length: 20 }, (_, i) => i + 1).sort(() => Math.random() - 0.5);
    const s = bombo.slice(0, 6).sort((a, b) => a - b);
    setSorteo(s);
    const aciertos = elegidos.filter(n => s.includes(n)).length;
    if (PREMIOS[aciertos] > 0) cobrarPremio(apuesta * PREMIOS[aciertos], apuesta, registrarPunt);
    else perderApuesta(registrarPunt);
  }

  function limpiar() { setElegidos([]); setSorteo([]); setAviso(""); }

  return (
    <GameShell titulo="Lotto 6" emoji="🎱"
      descripcion="Elige 6 del 1 al 20: 3 ×2, 4 ×5, 5 ×25, pleno ×100."
      stats={[{ icono: "🪙", valor: saldo }, ...(sorteo.length ? [{ etiqueta: "Aciertos", valor: elegidos.filter(n => sorteo.includes(n)).length }] : [])]}
      resultado={{ mensaje, tipo }}
      ayuda={<span>Con 0-2 aciertos pierdes la apuesta. El pleno (6 de 6) paga <b>×100</b>.</span>}>
      <SelectorApuesta apuesta={apuesta} setApuesta={setApuesta} />
      <div className="tombola-grid lotto" role="group" aria-label="Tus números">
        {Array.from({ length: 20 }, (_, i) => i + 1).map(n => (
          <button key={n}
            className={`tombola-num${elegidos.includes(n) ? " sel" : ""}${sorteo.includes(n) ? " salio" : ""}`}
            onClick={() => toggle(n)}>{n}</button>
        ))}
      </div>
      {sorteo.length > 0 && <p style={{ textAlign: "center" }}>🎰 Sorteo: <b>{sorteo.join(" · ")}</b></p>}
      <div className="fila-botones">
        <button className="btn-principal" onClick={sortear}>🎱 Sortear ({apuesta})</button>
        {(elegidos.length > 0 || sorteo.length > 0) && <button className="btn-suave" onClick={limpiar}>Limpiar</button>}
      </div>
      {aviso && <p className="aviso info" style={{ textAlign: "center" }}>{aviso}</p>}
      <Resultado mensaje={mensaje} tipo={tipo} />
    </GameShell>
  );
}
