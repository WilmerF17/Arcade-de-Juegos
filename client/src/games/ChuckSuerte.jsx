import { useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { cargarBilletera, apostar, cobrar } from "../suite/billetera";
import { sfx } from "../suite/sonido";

const DADOS = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
const APUESTAS = [10, 25, 50, 100, 250];

/* Chuck de la Suerte: 3 dados, elige número. 0 aciertos pierde · 1×2 · 2×3 · 3×5. */
export default function ChuckSuerte() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Chuck de la Suerte");
  const [apuesta, setApuesta] = useState(25);
  const [numero, setNumero] = useState(6);
  const [dados, setDados] = useState([]);
  const [saldo, setSaldo] = useState(() => cargarBilletera().saldo);
  const [aviso, setAviso] = useState("");

  function lanzar() {
    setAviso("");
    const r = apostar(apuesta);
    if (!r.ok) { setAviso(`⛔ ${r.motivo}. Reclama el 🎁 bonus diario.`); sfx.mal(); return; }
    const d = [1, 2, 3].map(() => 1 + Math.floor(Math.random() * 6));
    setDados(d);
    const aciertos = d.filter(v => v === numero).length;
    const mult = [0, 2, 3, 5][aciertos];
    if (mult > 0) {
      const premio = apuesta * mult;
      setSaldo(cobrar(premio));
      sfx.bien();
      registrarPunt(premio - apuesta, 1);
    } else {
      setSaldo(cargarBilletera().saldo);
      sfx.mal();
      registrarPunt(0, 0);
    }
  }

  return (
    <GameShell titulo="Chuck de la Suerte" emoji="🍀"
      descripcion="Elige número del 1 al 6 · 3 dados · 1×2, 2×3, 3×5."
      tira="linear-gradient(90deg,#16a34a,#22c55e)" iconoFondo="linear-gradient(135deg,#16a34a,#22c55e)">
      <div className="fila-botones">
        <span className="chip">🪙 <b>{saldo}</b></span>
      </div>
      <div className="fila-botones">
        <span className="chip">Apuesta:</span>
        {APUESTAS.map(a => (
          <button key={a} className={apuesta === a ? "btn-principal" : "btn-suave"} onClick={() => setApuesta(a)}>{a}</button>
        ))}
      </div>
      <div className="fila-botones">
        <span className="chip">Tu número:</span>
        {[1, 2, 3, 4, 5, 6].map(v => (
          <button key={v} className={numero === v ? "btn-principal" : "btn-suave"} onClick={() => setNumero(v)}>{DADOS[v - 1]}</button>
        ))}
      </div>
      <p style={{ textAlign: "center", fontSize: "3rem", margin: "4px 0" }}>
        {dados.length ? dados.map(v => DADOS[v - 1]).join(" ") : "🎲🎲🎲"}
      </p>
      <div className="fila-botones">
        <button className="btn-exito" onClick={lanzar}>🍀 Lanzar {apuesta}</button>
      </div>
      {aviso && <p className="aviso info" style={{ textAlign: "center" }}>{aviso}</p>}
      <Resultado mensaje={mensaje} tipo={tipo} />
    </GameShell>
  );
}
