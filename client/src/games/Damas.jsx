import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro } from "../ui/GameShell";
import { dirDeTecla, escribiendo } from "../suite/teclado";
import { sfx } from "../suite/sonido";

const N = 8;
function inicial() {
  const t = Array.from({ length: N }, () => Array(N).fill(0));
  for (let c = 0; c < N; c++) { if (c % 2 === 0) { t[1][c] = 2; t[5][c] = 1; t[6][c + 1 <= 7 ? c + 1 : c] = 0; } else { t[2][c] = 0; } }
  // colocación clásica simplificada: filas 0-2 IA, 5-7 jugador en casillas oscuras
  for (let r = 0; r < 3; r++) for (let c = 0; c < N; c++) if ((r + c) % 2 === 1) t[r][c] = 2;
  for (let r = 5; r < 8; r++) for (let c = 0; c < N; c++) if ((r + c) % 2 === 1) t[r][c] = 1;
  return t;
}
function movimientos(t, r, c, jugador) {
  if (!t[r] || t[r][c] !== jugador) return [];
  const dir = jugador === 1 ? -1 : 1;
  const esRey = false;
  const out = [];
  const pasos = [[dir, -1], [dir, 1]];
  for (const [dr, dc] of pasos) {
    const nr = r + dr, nc = c + dc;
    if (nr < 0 || nc < 0 || nr >= N || nc >= N) continue;
    if (t[nr][nc] === 0) out.push([nr, nc, false]);
    else if (t[nr][nc] === 3 - jugador) {
      const jr = r + dr * 2, jc = c + dc * 2;
      if (jr >= 0 && jc >= 0 && jr < N && jc < N && t[jr][jc] === 0) out.push([jr, jc, true]);
    }
  }
  return out;
}
function todosMovs(t, jugador) {
  const caps = [], resto = [];
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    movimientos(t, r, c, jugador).forEach(([nr, nc, cap]) => {
      (cap ? caps : resto).push([r, c, nr, nc]);
    });
  }
  return caps.length ? caps : resto;
}

export default function Damas() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Damas");
  const [tab, setTab] = useState(inicial);
  const [sel, setSel] = useState(null);
  const [fin, setFin] = useState(null);
  const [cursor, setCursor] = useState([5, 0]);
  const st = useRef({ tab, fin }); st.current = { tab, fin };

  function aplicar(r, c, nr, nc) {
    const t = st.current.tab.map(f => [...f]);
    t[nr][nc] = t[r][c]; t[r][c] = 0;
    if (Math.abs(nr - r) === 2) t[(r + nr) / 2][(c + nc) / 2] = 0;
    return t;
  }

  function turnoIA(t) {
    const movs = todosMovs(t, 2);
    if (!movs.length) { setFin("🏆 ¡GANASTE! La IA no puede mover."); st.current.fin = "win"; registrarPunt(120, 1); sfx.record(); setTab(t); st.current.tab = t; return; }
    const cap = movs.filter(m => Math.abs(m[2] - m[0]) === 2);
    const pool = cap.length ? cap : movs;
    const [r, c, nr, nc] = pool[Math.floor(Math.random() * pool.length)];
    const nt = aplicar(r, c, nr, nc);
    st.current.tab = nt; setTab(nt);
    if (!todosMovs(nt, 1).length) { setFin("💀 La IA te bloqueó."); st.current.fin = "lose"; registrarPunt(nt.flat().filter(v => v === 1).length * 5, 0); sfx.mal(); }
    const n1 = nt.flat().filter(v => v === 1).length, n2 = nt.flat().filter(v => v === 2).length;
    if (n2 === 0) { setFin("🏆 ¡Capturaste todo!"); st.current.fin = "win"; registrarPunt(150, 1); sfx.record(); }
    if (n1 === 0) { setFin("💀 Sin piezas."); st.current.fin = "lose"; registrarPunt(0, 0); sfx.mal(); }
  }

  function clic(r, c) {
    if (st.current.fin) return;
    const t = st.current.tab;
    if (sel) {
      const movs = movimientos(t, sel[0], sel[1], 1);
      const m = movs.find(([nr, nc]) => nr === r && nc === c);
      if (m) {
        const nt = aplicar(sel[0], sel[1], r, c);
        setSel(null);
        st.current.tab = nt; setTab(nt);
        sfx.bien();
        const n2 = nt.flat().filter(v => v === 2).length;
        if (n2 === 0) { setFin("🏆 ¡Capturaste todo!"); st.current.fin = "win"; registrarPunt(150, 1); sfx.record(); return; }
        setTimeout(() => turnoIA(nt), 400);
        return;
      }
    }
    if (t[r][c] === 1) { setSel([r, c]); sfx.clic(); }
    else setSel(null);
  }
  const clicRef = useRef(clic); clicRef.current = clic;

  useEffect(() => {
    const fn = e => {
      if (escribiendo() || st.current.fin) return;
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
      } else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setCursor(([r, c]) => { clicRef.current(r, c); return [r, c]; }); }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [sel]);

  const dests = sel ? movimientos(tab, sel[0], sel[1], 1) : [];
  const n1 = tab.flat().filter(v => v === 1).length, n2 = tab.flat().filter(v => v === 2).length;
  return (
    <GameShell titulo="Damas" emoji="♟️" descripcion="Flechas/WASD + ENTER · captura todo vs IA.">
      <div className="fila-botones">
        <button className="btn-exito" onClick={() => { const t = inicial(); st.current = { tab: t, fin: null }; setTab(t); setFin(null); setSel(null); }}>Nueva partida</button>
        <span className="chip">🔴 Tú <b>{n1}</b></span>
        <span className="chip">⚫ IA <b>{n2}</b></span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${N},42px)`, gap: 0, marginTop: 14, border: "2px solid var(--border)", width: "max-content", borderRadius: 8, overflow: "hidden" }}>
        {tab.map((fila, r) => fila.map((v, c) => {
          const oscuro = (r + c) % 2 === 1;
          const esSel = sel && sel[0] === r && sel[1] === c;
          const esDest = dests.some(([nr, nc]) => nr === r && nc === c);
          return (
            <div key={`${r}-${c}`} onClick={() => { setCursor([r, c]); clic(r, c); }}
              style={{ width: 42, height: 42, background: esSel ? "rgba(34,197,94,.4)" : esDest ? "rgba(56,189,248,.4)" : oscuro ? "#3a3f55" : "#c9cede", outline: cursor[0] === r && cursor[1] === c ? "2px solid var(--info)" : undefined, display: "grid", placeItems: "center", fontSize: "1.5rem", cursor: "pointer" }}>
              {v === 1 ? "🔴" : v === 2 ? "⚫" : esDest ? "·" : ""}
            </div>
          );
        }))}
      </div>
      {fin && <div className={`mensaje-final ${tipo}`}>{fin} {mensaje}</div>}
    </GameShell>
  );
}
