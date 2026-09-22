import { useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { sfx } from "../suite/sonido";

const EMOJIS = ["🐶", "🐱", "🦊", "🐼", "🦁", "🐸", "🐵", "🐷", "🐮", "🐥", "🦆", "🐢", "🐙", "🦋", "🐝", "🌵", "🍎", "⚽", "🚗", "✈️", "⛵", "🏠", "🌙", "⭐"];

/* Sombras Gemelas: dos tableros casi idénticos, encuentra la diferencia. 10 rondas. */
export default function Sombras() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Sombras Gemelas");
  const [base, setBase] = useState([]);
  const [dif, setDif] = useState(-1);
  const [ronda, setRonda] = useState(0);
  const [puntos, setPuntos] = useState(0);
  const [errores, setErrores] = useState(0);
  const [jugando, setJugando] = useState(false);

  const RONDAS = 10, N = 16;

  function nuevaRonda(nr) {
    const b = Array.from({ length: N }, () => EMOJIS[Math.floor(Math.random() * EMOJIS.length)]);
    const d = Math.floor(Math.random() * N);
    let alt = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    if (alt === b[d]) alt = b[d] === "⭐" ? "🌙" : "⭐";
    b[d] = b[d]; // base queda igual; la diferencia va en el segundo tablero
    setBase(b);
    setDif({ pos: d, alt });
    setRonda(nr);
  }

  function empezar() {
    setPuntos(0); setErrores(0); setJugando(true);
    nuevaRonda(1);
    sfx.clic();
  }

  function tocar(i) {
    if (!jugando) return;
    if (i === dif.pos) {
      const gana = 100 + (ronda >= 7 ? 50 : 0);
      const np = puntos + gana;
      setPuntos(np);
      sfx.bien();
      if (ronda >= RONDAS) {
        setJugando(false);
        registrarPunt(np, errores === 0 ? 1 : 0);
      } else {
        nuevaRonda(ronda + 1);
      }
    } else {
      setErrores(e => e + 1);
      sfx.mal();
    }
  }

  const celda = (i, segundo) => {
    const v = segundo && i === dif.pos ? dif.alt : base[i];
    return (
      <button key={i} onClick={() => segundo && tocar(i)} disabled={!jugando || !segundo}
        style={{ width: 52, height: 52, fontSize: "1.5rem", borderRadius: 10,
          background: "var(--bg-soft)", border: "2px solid var(--border)" }}>
        {v}
      </button>
    );
  };

  return (
    <GameShell titulo="Sombras Gemelas" emoji="👯"
      descripcion="Un emoji cambió en el segundo tablero · tócalo · 10 rondas."
      tira="linear-gradient(90deg,#a855f7,#22d3ee)" iconoFondo="linear-gradient(135deg,#a855f7,#22d3ee)">
      <div className="fila-botones">
        <span className="chip">Ronda: <b>{ronda}/{RONDAS}</b></span>
        <span className="chip">Puntos: <b>{puntos}</b></span>
        <span className="chip">❌ <b>{errores}</b></span>
      </div>
      {!jugando && ronda === 0 && (
        <div className="fila-botones"><button className="btn-principal" onClick={empezar}>▶ Empezar</button></div>
      )}
      {ronda > 0 && (
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <div>
            <p style={{ textAlign: "center", color: "var(--texto-suave)" }}>Original</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,52px)", gap: 6 }}>
              {Array.from({ length: N }, (_, i) => celda(i, false))}
            </div>
          </div>
          <div>
            <p style={{ textAlign: "center", color: "var(--texto-suave)" }}>¿Qué cambió? 👆</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,52px)", gap: 6 }}>
              {Array.from({ length: N }, (_, i) => celda(i, true))}
            </div>
          </div>
        </div>
      )}
      <Resultado mensaje={mensaje} tipo={tipo} />
      {!jugando && ronda > 0 && !mensaje && (
        <div className="fila-botones"><button className="btn-principal" onClick={empezar}>↻ Otra vez</button></div>
      )}
    </GameShell>
  );
}
