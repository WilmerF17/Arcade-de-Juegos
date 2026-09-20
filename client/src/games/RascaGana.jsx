import { useState } from "react";
import GameShell, { useRegistro } from "../ui/GameShell";
import { cargarBilletera, apostar, cobrar } from "../suite/billetera";
import { sfx } from "../suite/sonido";

const SIMBOLOS = ["🍒", "🍋", "⭐", "💎", "7️⃣"];
const APUESTAS = [10, 25, 50, 100, 250];

/* Rasca y Gana: apuesta, revela 3 de 9. Trío ×10 · pareja = reembolso. */
export default function RascaGana() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Rasca y Gana");
  const [apuesta, setApuesta] = useState(25);
  const [tablero, setTablero] = useState([]);
  const [reveladas, setReveladas] = useState([]);
  const [saldo, setSaldo] = useState(() => cargarBilletera().saldo);
  const [aviso, setAviso] = useState("");
  const [ronda, setRonda] = useState(false);

  function comprar() {
    setAviso("");
    const r = apostar(apuesta);
    if (!r.ok) { setAviso(`⛔ ${r.motivo}. Reclama el 🎁 bonus diario.`); sfx.mal(); return; }
    // tablero con al menos una pareja para dar emoción
    const t = Array.from({ length: 9 }, () => SIMBOLOS[Math.floor(Math.random() * SIMBOLOS.length)]);
    t[0] = t[1];
    setTablero(t.sort(() => Math.random() - 0.5));
    setReveladas([]);
    setRonda(true);
    sfx.clic();
  }

  function rascar(i) {
    if (!ronda || reveladas.includes(i)) return;
    const nr = [...reveladas, i];
    setReveladas(nr);
    sfx.clic();
    if (nr.length === 3) {
      const [a, b, c] = nr.map(j => tablero[j]);
      setRonda(false);
      if (a === b && b === c) {
        const premio = apuesta * 10;
        setSaldo(cobrar(premio));
        sfx.record();
        registrarPunt(premio - apuesta, 1);
      } else if (a === b || b === c || a === c) {
        setSaldo(cobrar(apuesta));
        sfx.bien();
        registrarPunt(0, 0);
      } else {
        setSaldo(cargarBilletera().saldo);
        sfx.mal();
        registrarPunt(0, 0);
      }
    }
  }

  return (
    <GameShell titulo="Rasca y Gana" emoji="🎫"
      descripcion="Revela 3 · trío ×10 · pareja = reembolso."
      tira="linear-gradient(90deg,#f59e0b,#ec4899)" iconoFondo="linear-gradient(135deg,#f59e0b,#ec4899)">
      <div className="fila-botones" style={{ marginTop: 0 }}>
        <span className="chip">🪙 <b>{saldo}</b></span>
      </div>
      {!ronda && tablero.length === 0 && (
        <>
          <div className="fila-botones">
            <span className="chip">Cartón:</span>
            {APUESTAS.map(a => (
              <button key={a} className={apuesta === a ? "btn-principal" : "btn-suave"} onClick={() => setApuesta(a)}>{a}</button>
            ))}
          </div>
          <div className="fila-botones">
            <button className="btn-exito" onClick={comprar}>🎫 Comprar cartón ({apuesta})</button>
          </div>
        </>
      )}
      {tablero.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,84px)", gap: 8, justifyContent: "center" }}>
          {tablero.map((s, i) => (
            <button key={i} onClick={() => rascar(i)} disabled={!ronda}
              style={{ width: 84, height: 84, fontSize: "2.2rem", borderRadius: 14,
                background: reveladas.includes(i) ? "var(--bg-hover)" : "linear-gradient(135deg,#f59e0b,#ec4899)",
                border: "2px solid var(--border)" }}>
              {reveladas.includes(i) ? s : "❔"}
            </button>
          ))}
        </div>
      )}
      {!ronda && tablero.length > 0 && !mensaje && (
        <div className="fila-botones"><button className="btn-principal" onClick={() => { setTablero([]); }}>↻ Otro cartón</button></div>
      )}
      {aviso && <p className="aviso info" style={{ textAlign: "center" }}>{aviso}</p>}
      {mensaje && <div className={`mensaje-final ${tipo}`}>{mensaje}</div>}
    </GameShell>
  );
}
