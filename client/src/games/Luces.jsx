import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro } from "../ui/GameShell";
import { dirDeTecla, escribiendo } from "../suite/teclado";
import { sfx } from "../suite/sonido";

const N = 5;
function scramble() {
  const g = Array.from({ length: N }, () => Array(N).fill(false));
  const pulsa = (t, r, c) => {
    [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dr, dc]) => {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nc >= 0 && nr < N && nc < N) t[nr][nc] = !t[nr][nc];
    });
  };
  for (let i = 0; i < 12; i++) pulsa(g, Math.floor(Math.random() * N), Math.floor(Math.random() * N));
  if (g.every(f => f.every(v => !v))) pulsa(g, 2, 2);
  return g;
}

export default function Luces() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Lights Out");
  const [grid, setGrid] = useState(scramble);
  const [movs, setMovs] = useState(0);
  const [cursor, setCursor] = useState([2, 2]);
  const [fin, setFin] = useState(false);
  const st = useRef({ grid, movs }); st.current = { grid, movs };

  function pulsar(r, c) {
    if (fin) return;
    const t = st.current.grid.map(f => [...f]);
    [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dr, dc]) => {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nc >= 0 && nr < N && nc < N) t[nr][nc] = !t[nr][nc];
    });
    const m = st.current.movs + 1;
    st.current = { grid: t, movs: m };
    setGrid(t); setMovs(m);
    sfx.clic();
    if (t.every(f => f.every(v => !v))) {
      setFin(true);
      registrarPunt(Math.max(150 - m * 2, 30), 1);
      sfx.record();
    }
  }
  const pulsarRef = useRef(pulsar); pulsarRef.current = pulsar;

  function nuevo() { const g = scramble(); st.current = { grid: g, movs: 0 }; setGrid(g); setMovs(0); setFin(false); setCursor([2, 2]); }

  useEffect(() => {
    const fn = e => {
      if (escribiendo()) return;
      const d = dirDeTecla(e.key);
      if (d) {
        e.preventDefault();
        setCursor(([r, c]) => {
          if (d === "arr") r = (r + N - 1) % N;
          if (d === "aba") r = (r + 1) % N;
          if (d === "izq") c = (c + N - 1) % N;
          if (d === "der") c = (c + 1) % N;
          return [r, c];
        });
      } else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setCursor(([r, c]) => { pulsarRef.current(r, c); return [r, c]; }); }
      else if (e.key === "r" || e.key === "R") nuevo();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [fin]);

  const encendidas = grid.flat().filter(Boolean).length;
  return (
    <GameShell titulo="Lights Out" emoji="💡" descripcion="Flechas/WASD + ENTER · apaga todas las luces.">
      <div className="fila-botones" style={{ marginTop: 0 }}>
        <button className="btn-exito" onClick={nuevo}>🔀 Nuevo</button>
        <span className="chip">Movs <b>{movs}</b></span>
        <span className="chip">Encendidas <b>{encendidas}</b></span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${N},52px)`, gap: 6, marginTop: 14, width: "max-content" }}>
        {grid.map((fila, r) => fila.map((v, c) => (
          <div key={`${r}-${c}`} onClick={() => { setCursor([r, c]); pulsar(r, c); }}
            style={{ width: 52, height: 52, borderRadius: 12, cursor: "pointer", background: v ? "linear-gradient(135deg,#facc15,#fb923c)" : "var(--bg-soft)", border: cursor[0] === r && cursor[1] === c ? "2px solid var(--info)" : "1px solid var(--border)", boxShadow: v ? "0 0 16px rgba(250,204,21,.6)" : undefined, display: "grid", placeItems: "center", fontSize: "1.4rem" }}>
            {v ? "💡" : ""}
          </div>
        )))}
      </div>
      {fin && <div className={`mensaje-final ${tipo}`}>🌟 ¡Todo apagado en {movs} movimientos! {mensaje}</div>}
    </GameShell>
  );
}
