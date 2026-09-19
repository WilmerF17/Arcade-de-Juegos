import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro } from "../ui/GameShell";
import { escribiendo } from "../suite/teclado";
import { sfx } from "../suite/sonido";

// Mate en 1: puzzles fijos {fen-simple, descripcion, solucion}
const PUZZLES = [
  { titulo: "Dama al rescate", desc: "Blancas juegan y dan mate.", tablero: [["", "", "", "", "♚", "", "", ""], ["", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", ""], ["", "", "", "", "♕", "", "", ""], ["", "", "", "", "♔", "", "", ""]], sol: ["e2-e8"], pista: "La dama sube hasta el fondo." },
  { titulo: "Torre fulminante", desc: "Blancas juegan y dan mate.", tablero: [["", "", "", "", "", "", "♚", ""], ["", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", ""], ["", "", "", "", "♖", "", "♔", ""]], sol: ["e1-e7", "e1-g1"], pista: "La torre domina la columna." },
  { titulo: "Caballo saltarín", desc: "Blancas juegan y dan mate.", tablero: [["", "", "", "", "♚", "", "", ""], ["", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", ""], ["", "", "", "♘", "", "", "", ""], ["", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", ""], ["", "", "", "", "♔", "", "", ""]], sol: ["d4-e6", "d4-c6", "d4-f5"], pista: "El caballo salta cerca del rey." },
];
const COLS = "abcdefgh";
function aCoord(r, c) { return `${COLS[c]}${8 - r}`; }
export default function Mate1() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Mate en 1");
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState(null);
  const [res, setRes] = useState(null);
  const [puntos, setPuntos] = useState(0);
  const [rachas, setRachas] = useState(0);
  const st = useRef({ puntos: 0, rachas: 0 }); st.current = { puntos, rachas };

  function clic(r, c) {
    if (res) return;
    if (!sel) {
      if (PUZZLES[idx].tablero[r][c] && "♕♖♘".includes(PUZZLES[idx].tablero[r][c])) { setSel([r, c]); sfx.clic(); }
      return;
    }
    const mv = `${aCoord(sel[0], sel[1])}-${aCoord(r, c)}`;
    if (PUZZLES[idx].sol.includes(mv)) {
      setRes("win"); sfx.record();
      st.current.puntos += 50; setPuntos(st.current.puntos);
      st.current.rachas += 1; setRachas(st.current.rachas);
      if (st.current.rachas >= 3) registrarPunt(st.current.puntos, 1);
    } else {
      setRes("fail"); sfx.mal();
      st.current.rachas = 0; setRachas(0);
      st.current.puntos = Math.max(0, st.current.puntos - 10); setPuntos(st.current.puntos);
    }
  }
  function siguiente() {
    setIdx(i => (i + 1) % PUZZLES.length);
    setSel(null); setRes(null);
  }
  const sigRef = useRef(siguiente); sigRef.current = siguiente;
  useEffect(() => {
    const fn = e => {
      if (escribiendo()) return;
      if (e.key === "Enter" && res) sigRef.current();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [res]);
  const p = PUZZLES[idx];
  return (
    <GameShell titulo="Mate en 1" emoji="♞" descripcion="Clic origen + destino · encuentra el mate · racha 3 = XP.">
      <div className="fila-botones" style={{ marginTop: 0 }}>
        {PUZZLES.map((q, i) => <button key={i} className={idx === i ? "btn-principal" : ""} onClick={() => { setIdx(i); setSel(null); setRes(null); }}>{i + 1}. {q.titulo}</button>)}
        <span className="chip">Puntos <b>{puntos}</b></span>
        <span className="chip">🔥 <b>×{rachas}</b></span>
      </div>
      <p className="aviso info">{p.desc} 💡 {p.pista}</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(8,44px)", gap: 0, marginTop: 8, border: "2px solid var(--border)", width: "max-content", borderRadius: 8, overflow: "hidden" }}>
        {p.tablero.map((fila, r) => fila.map((v, c) => {
          const oscuro = (r + c) % 2 === 1;
          const esSel = sel && sel[0] === r && sel[1] === c;
          return (
            <div key={`${r}-${c}`} onClick={() => clic(r, c)}
              style={{ width: 44, height: 44, background: esSel ? "rgba(34,197,94,.5)" : oscuro ? "#3a3f55" : "#c9cede", display: "grid", placeItems: "center", fontSize: "1.6rem", cursor: "pointer" }}>
              {v}
            </div>
          );
        }))}
      </div>
      {res === "win" && <div className="mensaje-final victoria">♞ ¡Mate correcto! <button className="btn-principal" onClick={siguiente}>Siguiente (ENTER)</button></div>}
      {res === "fail" && <div className="mensaje-final perdida">❌ Ese no es mate. Prueba otra. <button className="btn-suave" onClick={() => { setRes(null); setSel(null); }}>Reintentar</button></div>}
      {mensaje && <div className={`mensaje-final ${tipo}`}>{mensaje}</div>}
    </GameShell>
  );
}
