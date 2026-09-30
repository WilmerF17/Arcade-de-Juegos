import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { escribiendo } from "../suite/teclado";
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
  const [mejor, setMejor] = useState(null);

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
        setMejor(m => (m == null || errores < m ? errores : m));
        registrarPunt(puntos, errores === 0 ? 1 : 0);
      }
    } else {
      setErrores(e => e + 1);
      sfx.mal();
    }
  }
  const ponerRef = useRef(poner);
  ponerRef.current = poner;
  useEffect(() => {
    const fn = e => {
      if (escribiendo()) return;
      if (e.key >= "1" && e.key <= "4") ponerRef.current(Number(e.key));
      else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (!jugando) elegirPuzzle(pi);
      } else if (e.key >= "0" && e.key <= "9" && false) { void selRef; }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [pi, jugando, tab]);

  const huecos = PUZZLES[pi].ini.filter(v => v === 0).length;
  const hechos = tab.filter((v, i) => v !== 0 && PUZZLES[pi].ini[i] === 0).length;
  const pct = huecos ? Math.round((hechos / huecos) * 100) : 100;

  return (
    <GameShell titulo="Sudoku 4×4" emoji="🔢"
      descripcion="Filas, columnas y cuadros 2×2 del 1 al 4 · 3 puzzles."
      tira="linear-gradient(90deg,#38bdf8,#6366f1)" iconoFondo="linear-gradient(135deg,#38bdf8,#6366f1)"
      stats={[
        { icono: "🧩", etiqueta: "Puzzle", valor: `${pi + 1}/3` },
        { icono: "❌", etiqueta: "Errores", valor: errores },
        { icono: "📝", etiqueta: "Hechas", valor: `${hechos}/${huecos}` },
        { icono: "🏆", etiqueta: "Mejor", valor: mejor == null ? "—" : `${mejor} fallos` },
      ]}
      acciones={<>
        {[0, 1, 2].map(i => (
          <button key={i} className={pi === i ? "btn-principal" : "btn-suave"} onClick={() => elegirPuzzle(i)}>Puzzle {i + 1}</button>
        ))}
        <button className="btn-exito" onClick={() => elegirPuzzle(pi)}>↻ Reiniciar</button>
      </>}
      ayuda={<>
        <p><b>Objetivo:</b> rellena la cuadrícula 4×4 para que cada fila, columna y cuadro 2×2 tenga los números <b>1–4</b> sin repetir.</p>
        <p><b>Controles:</b> clica una casilla vacía y luego el número, o pulsa <kbd>1</kbd>–<kbd>4</kbd> tras seleccionar. <kbd>Enter</kbd> reinicia al terminar.</p>
        <p><b>Puntuación:</b> completar da hasta <b>400 − 30 por error</b> (mínimo 100); sin errores cuenta como victoria.</p>
        <p><b>Consejo:</b> completa primero la fila o bloque con más pistas y elimina candidatos por parejas.</p>
      </>}>
      <div className="xp-bar fina"><div style={{ width: `${pct}%` }} /></div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,62px)", gap: 5, justifyContent: "center", marginTop: 10 }}>
        {tab.map((v, i) => {
          const fijo = PUZZLES[pi].ini[i] !== 0;
          const bordeD = i % 4 === 1 ? { borderRight: "3px solid var(--principal)" } : {};
          const bordeB = i < 12 && Math.floor(i / 4) % 2 === 1 ? { borderBottom: "3px solid var(--principal)" } : {};
          return (
            <button key={i} onClick={() => { if (!fijo) { setSel(i); sfx.clic(); } }}
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
