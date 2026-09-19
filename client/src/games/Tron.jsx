import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro } from "../ui/GameShell";
import { dirDeTecla, escribiendo, OPUESTA } from "../suite/teclado";
import { sfx } from "../suite/sonido";

const N = 16;
export default function Tron() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Tron Neón");
  const [jug, setJug] = useState([[12, 4]]);
  const [ia, setIa] = useState([[3, 11]]);
  const [jugando, setJugando] = useState(false);
  const [fin, setFin] = useState(null);
  const [puntos, setPuntos] = useState(0);
  const dirJ = useRef("der"); const dirI = useRef("izq");
  const st = useRef({ jug, ia, puntos: 0, jugando: false });
  st.current = { jug, ia, puntos, jugando };

  function empezar() {
    dirJ.current = "der"; dirI.current = "izq";
    st.current = { jug: [[12, 4]], ia: [[3, 11]], puntos: 0, jugando: true };
    setJug([[12, 4]]); setIa([[3, 11]]); setPuntos(0); setJugando(true); setFin(null);
  }
  function terminar(gano, pts) {
    st.current.jugando = false; setJugando(false);
    setFin(gano ? "🏆 ¡La IA chocó! ¡GANASTE!" : "💥 ¡Chocaste!");
    registrarPunt(pts, gano ? 1 : 0);
    if (gano) sfx.record(); else sfx.mal();
  }
  useEffect(() => {
    const fn = e => {
      if (escribiendo()) return;
      const d = dirDeTecla(e.key);
      if (d) { e.preventDefault(); if (d !== OPUESTA[dirJ.current]) dirJ.current = d; if (!st.current.jugando && !fin) empezar(); }
      else if (e.key === "Enter" && !st.current.jugando) empezar();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fin]);
  useEffect(() => {
    if (!jugando) return;
    const id = setInterval(() => {
      const s = st.current;
      const M = { arr: [-1, 0], aba: [1, 0], izq: [0, -1], der: [0, 1] };
      // IA simple: evita pared y estelas, gira si peligro
      const ocup = new Set([...s.jug.map(p => p.join()), ...s.ia.map(p => p.join())]);
      const [hr, hc] = s.ia[0];
      const [dr, dc] = M[dirI.current];
      let nr = hr + dr, nc = hc + dc;
      const peligro = nr < 0 || nc < 0 || nr >= N || nc >= N || ocup.has(`${nr},${nc}`);
      if (peligro || Math.random() < 0.12) {
        const ops = ["arr", "aba", "izq", "der"].filter(d => d !== OPUESTA[dirI.current]);
        const seguras = ops.filter(d => {
          const [a, b] = M[d];
          const x = hr + a, y = hc + b;
          return x >= 0 && y >= 0 && x < N && y < N && !ocup.has(`${x},${y}`);
        });
        dirI.current = (seguras.length ? seguras : ops)[Math.floor(Math.random() * (seguras.length || ops.length))];
      }
      const [jr, jc] = s.jug[0];
      const [mj, nj] = M[dirJ.current];
      const njug = [jr + mj, jc + nj];
      const [di1, di2] = M[dirI.current];
      const nia = [hr + di1, hc + di2];
      const chocaJ = njug[0] < 0 || njug[1] < 0 || njug[0] >= N || njug[1] >= N || ocup.has(njug.join());
      const chocaI = nia[0] < 0 || nia[1] < 0 || nia[0] >= N || nia[1] >= N || ocup.has(nia.join()) || nia.join() === njug.join();
      const np = s.puntos + 1;
      st.current.puntos = np; setPuntos(np);
      if (chocaJ && chocaI) { terminar(false, np); return; }
      if (chocaJ) { terminar(false, np); return; }
      if (chocaI) { terminar(true, np + 50); return; }
      st.current = { ...s, jug: [njug, ...s.jug], ia: [nia, ...s.ia], puntos: np };
      setJug([njug, ...s.jug]); setIa([nia, ...s.ia]);
      if (np > 400) terminar(true, np + 100);
    }, 130);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jugando]);

  const setM = new Set([...jug.map(p => `${p}-j`), ...ia.map(p => `${p}-i`)]);
  return (
    <GameShell titulo="Tron Neón" emoji="🏍️" descripcion="Flechas/WASD · no choques · la IA falla primero.">
      <div className="fila-botones" style={{ marginTop: 0 }}>
        <button className="btn-principal" onClick={empezar}>{jugando ? "Reiniciar" : "▶ Jugar"}</button>
        <span className="chip">Supervivencia <b>{puntos}</b></span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${N},26px)`, gap: 1, marginTop: 14, background: "#05060f", padding: 8, borderRadius: 10, width: "max-content", border: "1px solid var(--border)" }}>
        {Array.from({ length: N * N }, (_, i) => {
          const r = Math.floor(i / N), c = i % N;
          const j = jug.some(([a, b]) => a === r && b === c);
          const a = ia.some(([x, y]) => x === r && y === c);
          return <div key={i} style={{ width: 26, height: 26, borderRadius: 4, background: j ? "#22d3ee" : a ? "#fb7185" : "rgba(255,255,255,.03)", boxShadow: j ? "0 0 8px #22d3ee" : a ? "0 0 8px #fb7185" : undefined }} />;
        })}
      </div>
      <div className="fila-botones">
        {[["arr", "↑"], ["izq", "←"], ["aba", "↓"], ["der", "→"]].map(([d, f]) => (
          <button key={d} className="btn-suave" onClick={() => { if (d !== OPUESTA[dirJ.current]) dirJ.current = d; if (!jugando && !fin) empezar(); }}>{f}</button>
        ))}
      </div>
      {fin && <div className={`mensaje-final ${tipo}`}>{fin} {mensaje}</div>}
    </GameShell>
  );
}
