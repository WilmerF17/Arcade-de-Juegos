import { useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { sfx } from "../suite/sonido";

/* Sudoku 4×4: 3 minipuzzles con filas, columnas y cuadros 2×2 del 1 al 4. */
const PUZZLES = [
  { ini: [1, 2, 0, 0, 0, 4, 1, 0, 2, 0, 4, 3, 0, 3, 0, 1], sol: [1, 2, 3, 4, 3, 4, 1, 2, 2, 1, 4, 3, 4, 3, 2, 1] },
  { ini: [2, 3, 0, 0, 4, 0, 2, 0, 0, 2, 0, 4, 1, 0, 3, 0], sol: [2, 3, 4, 1, 4, 1, 2, 3, 3, 2, 1, 4, 1, 4, 3, 2] },
  { ini: [4, 0, 2, 0, 3, 2, 0, 1, 0, 4, 0, 2, 2, 0, 1, 0], sol: [4, 1, 2, 3, 3, 2, 4, 1, 1, 4, 3, 2, 2, 3, 1, 4] },
];

export default function Sudoku4() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Sudoku 4×4");
  const [pi, setPi] = useState(0);
  const [tab, setTab] = useState([...PUZZLES[0].ini]);
  const [sel, setSel] = useState(null);
  const [errores, setErrores] = useState(0);
  const [jugando, setJugando] = useState(true);

  function elegirPuzzle(i) {
    setPi(i);
    setTab([...PUZZLES[i].ini]);
    setSel(null); setErrores(0); setJugando(true);
    sfx.clic();
  }

  function poner(v) {
    if (!jugando || sel === null || PUZZLES[pi].ini[sel] !== 0) return;
    if (v === PUZZLES[pi].sol[sel]) {
      const nt = [...tab]; nt[sel] = v;
      setTab(nt);
      sfx.clic();
      if (nt.every((x, i) => x === PUZZLES[pi].sol[i])) {
        setJugando(false);
        const puntos = Math.max(100, 400 - errores * 30);
        sfx.bien();
        registrarPunt(puntos, errores === 0 ? 1 : 0);
      }
    } else {
      setErrores(e => e + 1);
      sfx.mal();
    }
  }

  return (
    <GameShell titulo="Sudoku 4×4" emoji="🔢"
      descripcion="Filas, columnas y cuadros 2×2 del 1 al 4 · 3 puzzles."
      tira="linear-gradient(90deg,#38bdf8,#6366f1)" iconoFondo="linear-gradient(135deg,#38bdf8,#6366f1)">
      <div className="fila-botones">
        {[0, 1, 2].map(i => (
          <button key={i} className={pi === i ? "btn-principal" : "btn-suave"} onClick={() => elegirPuzzle(i)}>Puzzle {i + 1}</button>
        ))}
        <span className="chip">❌ <b>{errores}</b></span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,62px)", gap: 5, justifyContent: "center" }}>
        {tab.map((v, i) => {
          const fijo = PUZZLES[pi].ini[i] !== 0;
          const bordeD = i % 4 === 1 ? { borderRight: "3px solid var(--principal)" } : {};
          const bordeB = i < 12 && Math.floor(i / 4) % 2 === 1 ? { borderBottom: "3px solid var(--principal)" } : {};
          return (
            <button key={i} onClick={() => !fijo && setSel(i)}
              style={{ width: 62, height: 62, fontSize: "1.5rem", fontWeight: 800, borderRadius: 8,
                background: sel === i ? "var(--bg-hover)" : "var(--bg-soft)",
                color: fijo ? "var(--texto)" : "#22d3ee",
                border: "2px solid var(--border)", ...bordeD, ...bordeB }}>
              {v || ""}
            </button>
          );
        })}
      </div>
      <div className="fila-botones">
        {[1, 2, 3, 4].map(v => (
          <button key={v} className="btn-principal" style={{ fontSize: "1.3rem", padding: "10px 20px" }} onClick={() => poner(v)}>{v}</button>
        ))}
      </div>
      <Resultado mensaje={mensaje} tipo={tipo} />
    </GameShell>
  );
}
