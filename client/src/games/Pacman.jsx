import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro } from "../ui/GameShell";
import { dirDeTecla, escribiendo } from "../suite/teclado";
import { sfx } from "../suite/sonido";

const MAPA = [
  "###############",
  "#.............#",
  "#.###.#####.#.#",
  "#.#...#...#.#.#",
  "#.#.###.#.#.#.#",
  "#.#.....#...#.#",
  "#.#####.#####.#",
  "#.............#",
  "###############",
];
const R = MAPA.length, C = MAPA[0].length;

export default function Pacman() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Comepuntos");
  const [jug, setJug] = useState([1, 1]);
  const [fantasmas, setFantasmas] = useState([[7, 7], [7, 1]]);
  const [puntos, setPuntos] = useState(0);
  const [dots, setDots] = useState(() => {
    const s = new Set();
    MAPA.forEach((fila, r) => fila.split("").forEach((v, c) => { if (v === ".") s.add(`${r},${c}`); }));
    return s;
  });
  const [jugando, setJugando] = useState(false);
  const [fin, setFin] = useState(null);
  const dirRef = useRef("der");
  const st = useRef({ jug, fantasmas, puntos, dots, jugando: false, fin: null });
  st.current = { jug, fantasmas, puntos, dots, jugando, fin };

  function empezar() {
    const d = new Set();
    MAPA.forEach((fila, r) => fila.split("").forEach((v, c) => { if (v === ".") d.add(`${r},${c}`); }));
    st.current = { jug: [1, 1], fantasmas: [[7, 7], [7, 1]], puntos: 0, dots: d, jugando: true, fin: null };
    setJug([1, 1]); setFantasmas([[7, 7], [7, 1]]); setPuntos(0); setDots(d);
    setJugando(true); setFin(null);
    dirRef.current = "der";
  }
  function libre(r, c) { return r >= 0 && c >= 0 && r < R && c < C && MAPA[r][c] !== "#"; }

  useEffect(() => {
    const fn = e => {
      if (escribiendo()) return;
      const d = dirDeTecla(e.key);
      if (d) { e.preventDefault(); dirRef.current = d; if (!st.current.jugando && !st.current.fin) empezar(); }
      else if (e.key === "Enter" && !st.current.jugando) empezar();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!jugando) return;
    const id = setInterval(() => {
      const s = st.current;
      if (s.fin) { clearInterval(id); return; }
      const mapa = { arr: [-1, 0], aba: [1, 0], izq: [0, -1], der: [0, 1] };
      const [dr, dc] = mapa[dirRef.current];
      let [jr, jc] = s.jug;
      if (libre(jr + dr, jc + dc)) { jr += dr; jc += dc; }
      const ndots = new Set(s.dots);
      let np = s.puntos;
      if (ndots.has(`${jr},${jc}`)) { ndots.delete(`${jr},${jc}`); np += 10; sfx.clic(); }
      const nf = s.fantasmas.map(([fr, fc]) => {
        const ops = [[-1, 0], [1, 0], [0, -1], [0, 1]].filter(([a, b]) => libre(fr + a, fc + b));
        // 70% persigue, 30% aleatorio
        let mv;
        if (Math.random() < 0.7) {
          mv = ops.sort((x, y) => (Math.abs(fr + x[0] - jr) + Math.abs(fc + x[1] - jc)) - (Math.abs(fr + y[0] - jr) + Math.abs(fc + y[1] - jc)))[0] || [0, 0];
        } else mv = ops[Math.floor(Math.random() * ops.length)] || [0, 0];
        return [fr + mv[0], fc + mv[1]];
      });
      st.current = { ...s, jug: [jr, jc], fantasmas: nf, puntos: np, dots: ndots };
      setJug([jr, jc]); setFantasmas(nf); setPuntos(np); setDots(ndots);
      if (nf.some(([fr, fc]) => fr === jr && fc === jc)) {
        st.current.fin = "lose"; setFin("👻 ¡Te atraparon!");
        setJugando(false); st.current.jugando = false;
        registrarPunt(np, 0); sfx.mal(); return;
      }
      if (ndots.size === 0) {
        st.current.fin = "win"; setFin("🏆 ¡Todo comido!");
        setJugando(false); st.current.jugando = false;
        registrarPunt(np + 100, 1); sfx.record();
      }
    }, 170);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jugando]);

  return (
    <GameShell titulo="Comepuntos" emoji="🟡" descripcion="Flechas o WASD · come todo sin que te atrapen.">
      <div className="fila-botones" style={{ marginTop: 0 }}>
        <button className="btn-principal" onClick={empezar}>{jugando ? "Reiniciar" : "▶ Jugar"}</button>
        <span className="chip">Puntos <b>{puntos}</b></span>
        <span className="chip">Puntos restantes <b>{dots.size}</b></span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${C},24px)`, gap: 0, marginTop: 14, background: "#0b0d14", padding: 6, borderRadius: 10, width: "max-content" }}>
        {MAPA.map((fila, r) => fila.split("").map((v, c) => {
          const esJ = jug[0] === r && jug[1] === c;
          const esF = fantasmas.some(([fr, fc]) => fr === r && fc === c);
          return (
            <div key={`${r}-${c}`} style={{ width: 24, height: 24, background: v === "#" ? "#2d3348" : "transparent", display: "grid", placeItems: "center", fontSize: 14 }}>
              {esJ ? "🟡" : esF ? "👻" : v === "." && dots.has(`${r},${c}`) ? "·" : ""}
            </div>
          );
        }))}
      </div>
      <div className="fila-botones">
        {[["arr", "↑"], ["izq", "←"], ["aba", "↓"], ["der", "→"]].map(([d, f]) => (
          <button key={d} className="btn-suave" onClick={() => { dirRef.current = d; if (!jugando && !fin) empezar(); }}>{f}</button>
        ))}
      </div>
      {fin && <div className={`mensaje-final ${tipo}`}>{fin} {mensaje}</div>}
    </GameShell>
  );
}
