import { useState } from "react";
import GameShell, { useRegistro } from "../ui/GameShell";
import { sfx } from "../suite/sonido";

const FIGURAS = ["🐓", "😈", "💃", "🤵", "☂️", "🧜", "🪜", "🍾", "🛢️", "🌳", "🍈", "🦸", "🎩", "💀", "🍐", "🚩", "🎻", "🐦", "✋", "🥾", "🌙", "🐦‍⬛", "🥁", "🍤", "🕷️", "⭐", "🌍", "🌵", "🌹", "🔔", "🦌", "☀️"];

/* Lotería: cantor automático, tu cartón 4×4 y 2 rivales. Gana quien marque 8. */
export default function Loteria() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Lotería");
  const [carton, setCarton] = useState([]);
  const [rivales, setRivales] = useState([[], []]);
  const [salidas, setSalidas] = useState([]);
  const [actual, setActual] = useState("");
  const [jugando, setJugando] = useState(false);

  const META = 8;

  function empezar() {
    const mazo = [...FIGURAS].sort(() => Math.random() - 0.5);
    setCarton(mazo.slice(0, 16));
    setRivales([mazo.slice(8, 24), mazo.slice(16, 32)]);
    setSalidas([]); setActual(""); setJugando(true);
    sfx.clic();
  }

  function cantar() {
    if (!jugando) return;
    const resto = FIGURAS.filter(f => !salidas.includes(f));
    const f = resto[Math.floor(Math.random() * resto.length)];
    const ns = [...salidas, f];
    setSalidas(ns);
    setActual(f);
    sfx.clic();
    const mias = carton.filter(c => ns.includes(c)).length;
    const r1 = rivales[0].filter(c => ns.includes(c)).length;
    const r2 = rivales[1].filter(c => ns.includes(c)).length;
    if (mias >= META || r1 >= META || r2 >= META) {
      setJugando(false);
      const gano = mias >= META && mias >= r1 && mias >= r2;
      if (gano) { sfx.record(); registrarPunt(400 + mias * 25, 1); }
      else { sfx.mal(); registrarPunt(mias * 25, 0); }
    }
  }

  const mias = carton.filter(c => salidas.includes(c)).length;

  return (
    <GameShell titulo="Lotería" emoji="🎴"
      descripcion="El cantor saca figuras · marca 8 en tu cartón antes que los rivales."
      tira="linear-gradient(90deg,#eab308,#ef4444)" iconoFondo="linear-gradient(135deg,#eab308,#ef4444)">
      <div className="fila-botones" style={{ marginTop: 0 }}>
        {!jugando && salidas.length === 0 && <button className="btn-principal" onClick={empezar}>▶ Repartir cartones</button>}
        {jugando && <button className="btn-principal" onClick={cantar}>📢 ¡Lotería! Cantar</button>}
        <span className="chip">Tuyas: <b>{mias}/{META}</b></span>
      </div>
      {actual && <p style={{ textAlign: "center", fontSize: "3rem", margin: "4px 0" }}>{actual}</p>}
      {carton.length > 0 && (
        <>
          <p style={{ textAlign: "center", color: "var(--texto-suave)" }}>Tu cartón 🧍</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,56px)", gap: 6, justifyContent: "center" }}>
            {carton.map((f, i) => (
              <div key={i} style={{ width: 56, height: 56, fontSize: "1.7rem", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
                background: salidas.includes(f) ? "rgba(34,197,94,.4)" : "var(--bg-soft)", border: "2px solid var(--border)" }}>{f}</div>
            ))}
          </div>
          <p style={{ textAlign: "center", color: "var(--texto-suave)" }}>
            🤖 Rival 1: {rivales[0].filter(c => salidas.includes(c)).length} · 🤖 Rival 2: {rivales[1].filter(c => salidas.includes(c)).length}
          </p>
        </>
      )}
      {mensaje && <div className={`mensaje-final ${tipo}`}>{mensaje}</div>}
      {!jugando && salidas.length > 0 && !mensaje && (
        <div className="fila-botones"><button className="btn-principal" onClick={empezar}>↻ Otra lotería</button></div>
      )}
    </GameShell>
  );
}
