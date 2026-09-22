import { useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { sfx } from "../suite/sonido";

const LADOS = ["⬅️ Izquierda", "⬆️ Centro", "➡️ Derecha"];

/* Atajada: eres el portero. Adivina el lado de 5 penaltis y ataja. */
export default function Atajada() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Atajada");
  const [tiro, setTiro] = useState(0);
  const [atajadas, setAtajadas] = useState(0);
  const [resultado, setResultado] = useState("");
  const [jugando, setJugando] = useState(false);

  const TIROS = 5;

  function empezar() {
    setTiro(0); setAtajadas(0); setResultado(""); setJugando(true);
    sfx.clic();
  }

  function elegir(lado) {
    if (!jugando) { empezar(); return; }
    const tiroRival = Math.floor(Math.random() * 3);
    const ataja = lado === tiroRival;
    const na = atajadas + (ataja ? 1 : 0);
    setAtajadas(na);
    setResultado(ataja ? `🧤 ¡ATAJADA! Fue a ${LADOS[tiroRival]}` : `⚽ Gol… fue a ${LADOS[tiroRival]}`);
    if (ataja) sfx.bien(); else sfx.mal();
    const nt = tiro + 1;
    setTiro(nt);
    if (nt >= TIROS) {
      setJugando(false);
      registrarPunt(na * 100, na >= 3 ? 1 : 0);
    }
  }

  return (
    <GameShell titulo="Atajada" emoji="🧤"
      descripcion="Adivina el lado del penalti · 5 tiros · 3+ atajadas es victoria."
      tira="linear-gradient(90deg,#22c55e,#0ea5e9)" iconoFondo="linear-gradient(135deg,#22c55e,#0ea5e9)">
      <div className="fila-botones">
        <span className="chip">Tiro: <b>{Math.min(tiro + (jugando ? 1 : 0), TIROS)}/{TIROS}</b></span>
        <span className="chip">🧤 Atajadas: <b>{atajadas}</b></span>
      </div>
      <p style={{ textAlign: "center", fontSize: "3rem", margin: "4px 0" }}>🥅</p>
      {resultado && <p style={{ textAlign: "center" }}>{resultado}</p>}
      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
        {LADOS.map((l, i) => (
          <button key={l} className="btn-principal" style={{ padding: "14px 12px" }} onClick={() => elegir(i)} disabled={!jugando && tiro > 0}>{l}</button>
        ))}
      </div>
      {!jugando && tiro === 0 && (
        <div className="fila-botones"><button className="btn-principal" onClick={empezar}>▶ Empezar</button></div>
      )}
      <Resultado mensaje={mensaje} tipo={tipo} />
    </GameShell>
  );
}
