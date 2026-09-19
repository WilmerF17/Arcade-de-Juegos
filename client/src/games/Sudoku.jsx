import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro } from "../ui/GameShell";
import { dirDeTecla, escribiendo } from "../suite/teclado";
import { sfx } from "../suite/sonido";

const PUZZLES = [
  { puzzle: ["530070000", "600195000", "098000060", "800060003", "400803001", "700020006", "060000280", "000419005", "000080079"], solution: ["534678912", "672195348", "198342567", "859761423", "426853791", "713924856", "961537284", "287419635", "345286179"] },
  { puzzle: ["000260701", "680070090", "190004500", "820100040", "004602900", "050003028", "009300074", "040050036", "703018000"], solution: ["435269781", "682571493", "197834562", "826195347", "374682915", "951743628", "519326874", "248957136", "763418259"] },
];
function aMatriz(arr) { return arr.map(f => f.split("").map(Number)); }

export default function Sudoku() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Sudoku");
  const [idxPuzzle, setIdxPuzzle] = useState(0);
  const [base, setBase] = useState(() => aMatriz(PUZZLES[0].puzzle));
  const [sol, setSol] = useState(() => aMatriz(PUZZLES[0].solution));
  const [tab, setTab] = useState(() => aMatriz(PUZZLES[0].puzzle));
  const [cursor, setCursor] = useState([0, 0]);
  const [errores, setErrores] = useState(0);
  const [fin, setFin] = useState(false);
  const tabRef = useRef(tab); tabRef.current = tab;
  const finRef = useRef(false); finRef.current = fin;

  function cargar(i) {
    const b = aMatriz(PUZZLES[i].puzzle), s = aMatriz(PUZZLES[i].solution);
    setIdxPuzzle(i); setBase(b); setSol(s); setTab(b.map(f => [...f]));
    tabRef.current = b.map(f => [...f]);
    setCursor([0, 0]); setErrores(0); setFin(false); finRef.current = false;
  }

  function poner(n) {
    if (finRef.current) return;
    const [r, c] = cursor;
    if (base[r][c] !== 0) return;
    const t = tabRef.current.map(f => [...f]);
    if (n === 0) { t[r][c] = 0; setTab(t); tabRef.current = t; return; }
    if (sol[r][c] === n) {
      t[r][c] = n; setTab(t); tabRef.current = t;
      sfx.bien();
      if (t.every((fila, rr) => fila.every((v, cc) => v === sol[rr][cc]))) {
        finRef.current = true; setFin(true);
        const pts = Math.max(150 - errores * 10, 30);
        registrarPunt(pts, 1);
        sfx.record();
      }
    } else {
      setErrores(e => e + 1);
      sfx.mal();
    }
  }
  const ponerRef = useRef(poner); ponerRef.current = poner;

  useEffect(() => {
    const fn = e => {
      if (escribiendo()) return;
      const d = dirDeTecla(e.key);
      if (d) {
        e.preventDefault();
        setCursor(([r, c]) => {
          if (d === "arr") r = (r + 8) % 9;
          if (d === "aba") r = (r + 1) % 9;
          if (d === "izq") c = (c + 8) % 9;
          if (d === "der") c = (c + 1) % 9;
          return [r, c];
        });
        return;
      }
      if (e.key >= "1" && e.key <= "9") ponerRef.current(Number(e.key));
      else if (e.key === "Backspace" || e.key === "0") ponerRef.current(0);
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [base, sol]);

  return (
    <GameShell titulo="Sudoku" emoji="🔢" descripcion="Flechas/WASD cursor · 1-9 poner · Retroceso borrar.">
      <div className="fila-botones" style={{ marginTop: 0 }}>
        {PUZZLES.map((_, i) => <button key={i} className={idxPuzzle === i ? "btn-principal" : ""} onClick={() => cargar(i)}>Puzzle {i + 1}</button>)}
        <span className="chip">Errores <b>{errores}</b></span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(9,38px)", gap: 0, marginTop: 14, background: "var(--border)", border: "2px solid var(--border)", width: "max-content", borderRadius: 8, overflow: "hidden" }}>
        {tab.map((fila, r) => fila.map((v, c) => {
          const fijo = base[r][c] !== 0;
          const cur = cursor[0] === r && cursor[1] === c;
          const mal = !fijo && v !== 0 && v !== sol[r][c];
          return (
            <div key={`${r}-${c}`} onClick={() => { setCursor([r, c]); }}
              style={{ width: 38, height: 38, display: "grid", placeItems: "center", fontWeight: 800, fontSize: "1.1rem", background: cur ? "rgba(56,189,248,.25)" : mal ? "rgba(239,68,68,.25)" : fijo ? "var(--bg-soft)" : "var(--bg-card)", color: fijo ? "var(--texto)" : "var(--info)", borderRight: (c + 1) % 3 === 0 ? "2px solid var(--border)" : "1px solid var(--border)", borderBottom: (r + 1) % 3 === 0 ? "2px solid var(--border)" : "1px solid var(--border)", cursor: "pointer" }}>
              {v || ""}
            </div>
          );
        }))}
      </div>
      <div className="fila-botones">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => <button key={n} className="btn-suave" onClick={() => poner(n)}>{n}</button>)}
        <button onClick={() => poner(0)}>⌫</button>
      </div>
      {fin && <div className={`mensaje-final ${tipo}`}>🎉 ¡Sudoku completo! {mensaje}</div>}
    </GameShell>
  );
}
