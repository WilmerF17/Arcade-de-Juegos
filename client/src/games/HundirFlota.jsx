import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro } from "../ui/GameShell";
import { dirDeTecla, escribiendo } from "../suite/teclado";

const N = 8;
const BARCOS = [4, 3, 3, 2, 2];

function colocarBarcos() {
  const grid = Array.from({ length: N }, () => Array(N).fill(0));
  const barcos = [];
  for (const tam of BARCOS) {
    let ok = false, guard = 0;
    while (!ok && guard++ < 500) {
      const h = Math.random() < 0.5;
      const r = Math.floor(Math.random() * N);
      const c = Math.floor(Math.random() * N);
      const celdas = [];
      for (let i = 0; i < tam; i++) {
        const rr = h ? r : r + i, cc = h ? c + i : c;
        if (rr >= N || cc >= N || grid[rr][cc]) { celdas.length = 0; break; }
        celdas.push([rr, cc]);
      }
      if (celdas.length === tam) {
        celdas.forEach(([rr, cc]) => { grid[rr][cc] = 1; });
        barcos.push(celdas);
        ok = true;
      }
    }
  }
  return { grid, barcos };
}

export default function HundirFlota() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Hundir la flota");
  const [mia, setMia] = useState(() => colocarBarcos());
  const [enemiga, setEnemiga] = useState(() => colocarBarcos());
  const [tiros, setTiros] = useState([]);
  const [tirosIA, setTirosIA] = useState([]);
  const [fin, setFin] = useState("");
  const [turnoIA, setTurnoIA] = useState(false);
  const [cursor, setCursor] = useState([0, 0]);
  const tirosRef = useRef(tiros);
  const tirosIARef = useRef(tirosIA);
  const finRef = useRef(fin);
  const miaRef = useRef(mia);
  const enemigaRef = useRef(enemiga);
  tirosRef.current = tiros;
  tirosIARef.current = tirosIA;
  finRef.current = fin;
  miaRef.current = mia;
  enemigaRef.current = enemiga;

  const totalCeldas = BARCOS.reduce((a, b) => a + b, 0);
  const aciertos = tiros.filter(([r, c]) => enemiga.grid[r][c] === 1).length;
  const aciertosIA = tirosIA.filter(([r, c]) => mia.grid[r][c] === 1).length;

  function reiniciar() {
    const m = colocarBarcos(), e = colocarBarcos();
    setMia(m); setEnemiga(e);
    miaRef.current = m; enemigaRef.current = e;
    setTiros([]); setTirosIA([]);
    tirosRef.current = []; tirosIARef.current = [];
    setFin(""); finRef.current = ""; setTurnoIA(false);
    setCursor([0, 0]);
  }

  function disparar(r, c) {
    if (finRef.current || turnoIA) return;
    if (r < 0 || r >= N || c < 0 || c >= N) return;
    const ya = tirosRef.current.some(([a, b]) => a === r && b === c);
    if (ya) return;
    const nt = [...tirosRef.current, [r, c]];
    tirosRef.current = nt;
    setTiros(nt);
    const hits = nt.filter(([a, b]) => enemigaRef.current.grid[a][b] === 1).length;
    if (hits >= totalCeldas) {
      setFin("victoria");
      finRef.current = "victoria";
      registrarPunt(Math.max(150 - nt.length, 20), 1);
      return;
    }
    setTurnoIA(true);
    setTimeout(() => {
      const usados = new Set(tirosIARef.current.map(([a, b]) => a * N + b));
      let tiro = null, guard = 0;
      while (!tiro && guard++ < 500) {
        const cand = [Math.floor(Math.random() * N), Math.floor(Math.random() * N)];
        if (!usados.has(cand[0] * N + cand[1])) tiro = cand;
      }
      if (!tiro) { setTurnoIA(false); return; }
      const ntIA = [...tirosIARef.current, tiro];
      tirosIARef.current = ntIA;
      setTirosIA(ntIA);
      const hIA = ntIA.filter(([a, b]) => miaRef.current.grid[a][b] === 1).length;
      if (hIA >= totalCeldas) {
        setFin("derrota");
        finRef.current = "derrota";
        registrarPunt(Math.max(hits * 5, 5), 0);
      }
      setTurnoIA(false);
    }, 450);
  }

  const dispararRef = useRef(disparar);
  dispararRef.current = disparar;

  useEffect(() => {
    const fn = e => {
      if (escribiendo() || finRef.current) return;
      const d = dirDeTecla(e.key);
      if (d) {
        e.preventDefault();
        setCursor(([r, c]) => {
          if (d === "arr") r = Math.max(0, r - 1);
          if (d === "aba") r = Math.min(N - 1, r + 1);
          if (d === "izq") c = Math.max(0, c - 1);
          if (d === "der") c = Math.min(N - 1, c + 1);
          return [r, c];
        });
        return;
      }
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setCursor(([r, c]) => { dispararRef.current(r, c); return [r, c]; });
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [turnoIA]);

  function celdaEnemiga(r, c) {
    const t = tiros.some(([a, b]) => a === r && b === c);
    const esCursor = cursor[0] === r && cursor[1] === c && !fin;
    const estilo = esCursor ? { outline: "2px solid var(--info)", outlineOffset: -2 } : undefined;
    if (!t) return <div className="celda-flota mar disparable" style={estilo} onClick={() => { setCursor([r, c]); disparar(r, c); }} onMouseEnter={() => setCursor([r, c])}>🌊</div>;
    return enemiga.grid[r][c]
      ? <div className="celda-flota tocado" style={estilo}>🔥</div>
      : <div className="celda-flota agua" style={estilo}>💦</div>;
  }

  function celdaMia(r, c) {
    const t = tirosIA.some(([a, b]) => a === r && b === c);
    if (t && mia.grid[r][c]) return <div className="celda-flota tocado">🔥</div>;
    if (t) return <div className="celda-flota agua">·</div>;
    return mia.grid[r][c]
      ? <div className="celda-flota barco">🚢</div>
      : <div className="celda-flota mar">🌊</div>;
  }

  return (
    <GameShell titulo="Hundir la flota" emoji="🚢"
      descripcion="Clic o teclado (flechas/WASD + ENTER). Tocado 🔥, agua 💦."
      tira="linear-gradient(90deg,#0ea5e9,#1e3a8a,#22d3ee)" iconoFondo="linear-gradient(135deg,#0ea5e9,#1e3a8a)">
      <div className="fila-botones">
        <button className="btn-exito" onClick={reiniciar}>⚓ Nueva batalla</button>
        <span className="chip">Tus impactos: <b>{aciertos}/{totalCeldas}</b></span>
        <span className="chip">IA: <b>{aciertosIA}/{totalCeldas}</b></span>
        {turnoIA && <span className="chip">🤖 la IA apunta...</span>}
      </div>
      <div className="flota-tablas" style={{ marginTop: 14 }}>
        <div className="flota-tab">
          <h4>🎯 Mar enemigo <small style={{ color: "var(--texto-suave)" }}>(clica o ENTER)</small></h4>
          <div className="tablero" style={{ gridTemplateColumns: `repeat(${N},30px)` }}>
            {Array.from({ length: N * N }, (_, i) => {
              const r = Math.floor(i / N), c = i % N;
              return <div key={i}>{celdaEnemiga(r, c)}</div>;
            })}
          </div>
        </div>
        <div className="flota-tab">
          <h4>🛡️ Tu flota</h4>
          <div className="tablero" style={{ gridTemplateColumns: `repeat(${N},30px)` }}>
            {Array.from({ length: N * N }, (_, i) => {
              const r = Math.floor(i / N), c = i % N;
              return <div key={i}>{celdaMia(r, c)}</div>;
            })}
          </div>
        </div>
      </div>
      {!fin && <p className="aviso-ia">💡 Cursor en [{cursor[0] + 1},{cursor[1] + 1}] · <b>flechas/WASD</b> mover · <b>ENTER</b> disparar.</p>}
      {fin && <div className={`mensaje-final ${fin === "victoria" ? "record" : "perdida"}`}>
        {fin === "victoria" ? "🏆 ¡Flota enemiga hundida!" : "💀 Tu flota fue hundida."} {mensaje}
      </div>}
    </GameShell>
  );
}
