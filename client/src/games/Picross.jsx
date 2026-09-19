import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro } from "../ui/GameShell";
import { dirDeTecla, escribiendo } from "../suite/teclado";
import { sfx } from "../suite/sonido";

const N = 5;
const PRESETS = [
  [[1, 1, 1, 0, 0], [1, 0, 1, 0, 0], [1, 1, 1, 1, 1], [0, 0, 1, 0, 1], [0, 0, 1, 1, 1]],
  [[0, 1, 1, 1, 0], [1, 1, 0, 1, 1], [0, 1, 1, 1, 0], [0, 0, 1, 0, 0], [0, 1, 1, 1, 0]],
  [[1, 0, 1, 0, 1], [1, 0, 1, 0, 1], [1, 1, 1, 1, 1], [0, 1, 0, 1, 0], [1, 1, 0, 1, 1]],
];
function pistas(sol) {
  const filas = sol.map(f => {
    const g = []; let c = 0;
    f.forEach(v => { if (v) c++; else if (c) { g.push(c); c = 0; } });
    if (c) g.push(c);
    return g.length ? g : [0];
  });
  const cols = sol[0].map((_, c) => {
    const g = []; let k = 0;
    sol.forEach(f => { if (f[c]) k++; else if (k) { g.push(k); k = 0; } });
    if (k) g.push(k);
    return g.length ? g : [0];
  });
  return { filas, cols };
}
export default function Picross() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Nonogram");
  const [idx, setIdx] = useState(0);
  const [sol] = useState(PRESETS);
  const [tab, setTab] = useState(() => Array.from({ length: N }, () => Array(N).fill(0))); // 0 vacío, 1 lleno, 2 cruz
  const [errores, setErrores] = useState(0);
  const [fin, setFin] = useState(false);
  const [cursor, setCursor] = useState([0, 0]);
  const st = useRef({ tab, errores }); st.current = { tab, errores };
  const actual = sol[idx];
  const { filas, cols } = pistas(actual);

  function marcar(v) {
    if (fin) return;
    const [r, c] = cursor;
    const t = st.current.tab.map(f => [...f]);
    if (t[r][c] === v) t[r][c] = 0;
    else {
      if (v === 1 && actual[r][c] !== 1) {
        const e = st.current.errores + 1;
        st.current.errores = e; setErrores(e);
        sfx.mal();
        if (e >= 3) { setFin(true); registrarPunt(0, 0); return; }
        return;
      }
      t[r][c] = v;
    }
    st.current.tab = t; setTab(t);
    sfx.clic();
    const ok = actual.every((fila, r) => fila.every((v, c) => (v === 1 ? t[r][c] === 1 : t[r][c] !== 1)));
    if (ok) {
      setFin(true);
      const pts = Math.max(150 - st.current.errores * 20, 50);
      registrarPunt(pts, 1);
      sfx.record();
    }
  }
  const marcarRef = useRef(marcar); marcarRef.current = marcar;
  function nuevo(i = idx) {
    setIdx(i);
    st.current = { tab: Array.from({ length: N }, () => Array(N).fill(0)), errores: 0 };
    setTab(Array.from({ length: N }, () => Array(N).fill(0)));
    setErrores(0); setFin(false); setCursor([0, 0]);
  }
  useEffect(() => {
    const fn = e => {
      if (escribiendo() || fin) return;
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
      } else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); marcarRef.current(1); }
      else if (e.key.toLowerCase() === "x") marcarRef.current(2);
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [fin, idx]);

  return (
    <GameShell titulo="Nonogram 5×5" emoji="🧩" descripcion="Flechas/WASD + ENTER pintar · X cruz · 3 errores = fin.">
      <div className="fila-botones" style={{ marginTop: 0 }}>
        {PRESETS.map((_, i) => <button key={i} className={idx === i ? "btn-principal" : ""} onClick={() => nuevo(i)}>Puzzle {i + 1}</button>)}
        <span className="chip">❌ <b>{errores}/3</b></span>
      </div>
      <div style={{ display: "flex", gap: 4, marginTop: 14 }}>
        <div style={{ display: "grid", gridTemplateRows: `28px repeat(${N},40px)`, gap: 2 }}>
          <div />
          {filas.map((f, r) => <div key={r} style={{ height: 40, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4, fontSize: ".8rem", color: "var(--texto-suave)", fontWeight: 800 }}>{f.join(" ")}</div>)}
        </div>
        <div>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${N},40px)`, gap: 2, height: 28 }}>
            {cols.map((c, i) => <div key={i} style={{ fontSize: ".8rem", color: "var(--texto-suave)", fontWeight: 800, textAlign: "center" }}>{c.join(" ")}</div>)}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${N},40px)`, gap: 2 }}>
            {tab.map((fila, r) => fila.map((v, c) => (
              <div key={`${r}-${c}`} onClick={() => { setCursor([r, c]); setTimeout(() => marcarRef.current(1), 0); }} onContextMenu={e => { e.preventDefault(); setCursor([r, c]); setTimeout(() => marcarRef.current(2), 0); }}
                style={{ width: 40, height: 40, borderRadius: 6, background: v === 1 ? "var(--info)" : "var(--bg-soft)", border: cursor[0] === r && cursor[1] === c ? "2px solid var(--aviso)" : "1px solid var(--border)", display: "grid", placeItems: "center", fontWeight: 900, cursor: "pointer" }}>
                {v === 2 ? "✕" : ""}
              </div>
            )))}
          </div>
        </div>
      </div>
      <p className="aviso-ia">💡 Clic = pintar · clic derecho = cruz · los números indican bloques seguidos.</p>
      {fin && errores < 3 && tab.flat().filter(Boolean).length > 0 && <div className={`mensaje-final ${tipo}`}>🎉 ¡Nonogram resuelto! {mensaje}</div>}
      {fin && errores >= 3 && <div className="mensaje-final perdida">💥 3 errores. Pulsa Puzzle para reintentar.</div>}
    </GameShell>
  );
}
