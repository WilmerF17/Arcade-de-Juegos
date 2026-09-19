import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro } from "../ui/GameShell";
import { dirDeTecla, escribiendo } from "../suite/teclado";
import { sfx } from "../suite/sonido";

const N = 9;
function gana(t, p) {
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    if (t[r][c] !== p) continue;
    if (c + 4 < N && [1, 2, 3, 4].every(k => t[r][c + k] === p)) return true;
    if (r + 4 < N && [1, 2, 3, 4].every(k => t[r + k][c] === p)) return true;
    if (r + 4 < N && c + 4 < N && [1, 2, 3, 4].every(k => t[r + k][c + k] === p)) return true;
    if (r + 4 < N && c - 4 >= 0 && [1, 2, 3, 4].every(k => t[r + k][c - k] === p)) return true;
  }
  return false;
}
export default function Gomoku() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Gomoku");
  const [tab, setTab] = useState(() => Array.from({ length: N }, () => Array(N).fill(0)));
  const [fin, setFin] = useState(null);
  const [movs, setMovs] = useState(0);
  const [cursor, setCursor] = useState([4, 4]);
  const st = useRef({ tab, fin, movs }); st.current = { tab, fin, movs };

  function jugar(r, c) {
    const s = st.current;
    if (s.fin || s.tab[r][c] !== 0) return;
    const t = s.tab.map(f => [...f]);
    t[r][c] = 1;
    const m = s.movs + 1;
    if (gana(t, 1)) { st.current = { tab: t, fin: "win", movs: m }; setTab(t); setFin("🏆 ¡5 en línea! ¡GANASTE!"); setMovs(m); registrarPunt(Math.max(150 - m * 2, 40), 1); sfx.record(); return; }
    if (t.flat().every(v => v !== 0)) { st.current = { tab: t, fin: "draw", movs: m }; setTab(t); setFin("🤝 Empate."); setMovs(m); registrarPunt(30, 0); return; }
    // IA: gana si puede, bloquea si debe, si no aleatorio cerca
    let tiro = null;
    outer: for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
      if (t[i][j] !== 0) continue;
      t[i][j] = 2; if (gana(t, 2)) { tiro = [i, j]; t[i][j] = 0; break outer; } t[i][j] = 0;
    }
    if (!tiro) outer2: for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
      if (t[i][j] !== 0) continue;
      t[i][j] = 1; if (gana(t, 1)) { tiro = [i, j]; t[i][j] = 0; break outer2; } t[i][j] = 0;
    }
    if (!tiro) {
      const cerca = [];
      for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
        if (t[i][j] !== 0) continue;
        let ady = false;
        for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
          const nr = i + dr, nc = j + dc;
          if (nr >= 0 && nc >= 0 && nr < N && nc < N && t[nr][nc] !== 0) ady = true;
        }
        if (ady) cerca.push([i, j]);
      }
      tiro = cerca.length ? cerca[Math.floor(Math.random() * cerca.length)] : [Math.floor(Math.random() * N), Math.floor(Math.random() * N)];
      let guard = 0;
      while (t[tiro[0]][tiro[1]] !== 0 && guard++ < 200) tiro = [Math.floor(Math.random() * N), Math.floor(Math.random() * N)];
    }
    t[tiro[0]][tiro[1]] = 2;
    if (gana(t, 2)) { st.current = { tab: t, fin: "lose", movs: m }; setTab(t); setFin("🤖 La IA hizo 5 en línea."); setMovs(m); registrarPunt(10, 0); sfx.mal(); return; }
    st.current = { tab: t, fin: null, movs: m }; setTab(t); setMovs(m);
    sfx.clic();
  }
  const jugarRef = useRef(jugar); jugarRef.current = jugar;

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
      } else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setCursor(([r, c]) => { jugarRef.current(r, c); return [r, c]; }); }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  return (
    <GameShell titulo="Gomoku" emoji="⚪" descripcion="Flechas/WASD + ENTER · 5 en línea antes que la IA (9×9).">
      <div className="fila-botones" style={{ marginTop: 0 }}>
        <button className="btn-exito" onClick={() => { const t = Array.from({ length: N }, () => Array(N).fill(0)); st.current = { tab: t, fin: null, movs: 0 }; setTab(t); setFin(null); setMovs(0); }}>Nueva partida</button>
        <span className="chip">Movs <b>{movs}</b></span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${N},38px)`, gap: 2, marginTop: 14, background: "#c9a86a", padding: 8, borderRadius: 10, width: "max-content" }}>
        {tab.map((fila, r) => fila.map((v, c) => (
          <div key={`${r}-${c}`} onClick={() => { setCursor([r, c]); jugar(r, c); }}
            style={{ width: 38, height: 38, borderRadius: 6, background: "rgba(255,255,255,.25)", outline: cursor[0] === r && cursor[1] === c ? "2px solid var(--info)" : undefined, display: "grid", placeItems: "center", fontSize: "1.4rem", cursor: "pointer" }}>
            {v === 1 ? "⚫" : v === 2 ? "⚪" : ""}
          </div>
        )))}
      </div>
      {fin && <div className={`mensaje-final ${tipo}`}>{fin} {mensaje}</div>}
    </GameShell>
  );
}
