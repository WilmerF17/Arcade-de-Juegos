import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro } from "../ui/GameShell";
import { dirDeTecla, escribiendo } from "../suite/teclado";
import { sfx } from "../suite/sonido";

const N = 11;
function generar() {
  const g = Array.from({ length: N }, () => Array(N).fill(1));
  const pila = [[1, 1]];
  g[1][1] = 0;
  const dirs = [[0, 2], [0, -2], [2, 0], [-2, 0]];
  while (pila.length) {
    const [r, c] = pila[pila.length - 1];
    const ops = dirs.map(([dr, dc]) => [r + dr, c + dc, r + dr / 2, c + dc / 2])
      .filter(([nr, nc]) => nr > 0 && nc > 0 && nr < N - 1 && nc < N - 1 && g[nr][nc] === 1);
    if (!ops.length) { pila.pop(); continue; }
    const [nr, nc, mr, mc] = ops[Math.floor(Math.random() * ops.length)];
    g[mr][mc] = 0; g[nr][nc] = 0;
    pila.push([nr, nc]);
  }
  g[1][1] = 0; g[N - 2][N - 2] = 0;
  return g;
}

export default function Laberinto() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Laberinto");
  const [grid, setGrid] = useState(generar);
  const [pos, setPos] = useState([1, 1]);
  const [pasos, setPasos] = useState(0);
  const [tiempo, setTiempo] = useState(0);
  const [fin, setFin] = useState(false);
  const [corriendo, setCorriendo] = useState(true);
  const posRef = useRef(pos); posRef.current = pos;
  const gridRef = useRef(grid); gridRef.current = grid;
  const finRef = useRef(false); finRef.current = fin;

  function nuevo() {
    const g = generar();
    setGrid(g); gridRef.current = g;
    setPos([1, 1]); posRef.current = [1, 1];
    setPasos(0); setTiempo(0); setFin(false); finRef.current = false;
    setCorriendo(true);
  }

  useEffect(() => {
    if (fin) return;
    const id = setInterval(() => setTiempo(t => t + 1), 1000);
    return () => clearInterval(id);
  }, [fin]);

  function mover(d) {
    if (finRef.current) return;
    const mapa = { arr: [-1, 0], aba: [1, 0], izq: [0, -1], der: [0, 1] };
    const [dr, dc] = mapa[d];
    const [r, c] = posRef.current;
    const nr = r + dr, nc = c + dc;
    if (nr < 0 || nc < 0 || nr >= N || nc >= N || gridRef.current[nr][nc] === 1) return;
    posRef.current = [nr, nc];
    setPos([nr, nc]);
    setPasos(p => p + 1);
    sfx.clic();
    if (nr === N - 2 && nc === N - 2) {
      finRef.current = true; setFin(true);
      const pts = Math.max(200 - pasos - tiempo, 30);
      registrarPunt(pts, 1);
      sfx.record();
    }
  }
  const moverRef = useRef(mover); moverRef.current = mover;

  useEffect(() => {
    const fn = e => {
      if (escribiendo()) return;
      const d = dirDeTecla(e.key);
      if (d) { e.preventDefault(); moverRef.current(d); }
      else if (e.key === "Enter" || e.key === "r" || e.key === "R") nuevo();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pasos, tiempo]);

  return (
    <GameShell titulo="Laberinto" emoji="🧭" descripcion="Flechas o WASD hasta 🏁 · R genera otro.">
      <div className="fila-botones">
        <button className="btn-exito" onClick={nuevo}>🔀 Nuevo laberinto</button>
        <span className="chip">Pasos <b>{pasos}</b></span>
        <span className="chip">⏱️ <b>{tiempo}s</b></span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${N},22px)`, gap: 1, marginTop: 14, background: "#0b0d14", padding: 8, borderRadius: 10, width: "max-content" }}>
        {grid.map((fila, r) => fila.map((v, c) => {
          const esJ = pos[0] === r && pos[1] === c;
          const esF = r === N - 2 && c === N - 2;
          return <div key={`${r}-${c}`} style={{ width: 22, height: 22, borderRadius: 3, background: esJ ? "var(--info)" : esF ? "rgba(34,197,94,.5)" : v ? "rgba(255,255,255,.08)" : "transparent", display: "grid", placeItems: "center", fontSize: 13 }}>{esJ ? "🙂" : esF ? "🏁" : ""}</div>;
        }))}
      </div>
      <div className="fila-botones">
        {[["arr", "↑"], ["izq", "←"], ["aba", "↓"], ["der", "→"]].map(([d, f]) => (
          <button key={d} className="btn-suave" onClick={() => mover(d)}>{f}</button>
        ))}
      </div>
      {fin && <div className={`mensaje-final ${tipo}`}>🏁 ¡Salida encontrada! {mensaje}</div>}
    </GameShell>
  );
}
