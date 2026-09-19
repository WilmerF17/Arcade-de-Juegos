import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro } from "../ui/GameShell";
import { dirDeTecla, escribiendo } from "../suite/teclado";
import { sfx } from "../suite/sonido";

const N = 8;
const DIRS = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
function inicial() {
  const t = Array.from({ length: N }, () => Array(N).fill(0));
  t[3][3] = t[4][4] = 2; t[3][4] = t[4][3] = 1;
  return t;
}
function flips(t, r, c, p) {
  if (t[r][c] !== 0) return [];
  const out = [];
  for (const [dr, dc] of DIRS) {
    const cur = [];
    let nr = r + dr, nc = c + dc;
    while (nr >= 0 && nc >= 0 && nr < N && nc < N && t[nr][nc] === 3 - p) { cur.push([nr, nc]); nr += dr; nc += dc; }
    if (cur.length && nr >= 0 && nc >= 0 && nr < N && nc < N && t[nr][nc] === p) out.push(...cur);
  }
  return out;
}
function validos(t, p) {
  const r = [];
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) if (flips(t, i, j, p).length) r.push([i, j]);
  return r;
}

export default function Othello() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Reversi");
  const [tab, setTab] = useState(inicial);
  const [turno, setTurno] = useState(1);
  const [fin, setFin] = useState(null);
  const [cursor, setCursor] = useState([2, 3]);
  const st = useRef({ tab, turno, fin }); st.current = { tab, turno, fin };

  function jugar(r, c) {
    const s = st.current;
    if (s.fin) return;
    const f = flips(s.tab, r, c, 1);
    if (!f.length) return;
    const t = s.tab.map(x => [...x]);
    t[r][c] = 1; f.forEach(([a, b]) => { t[a][b] = 1; });
    sfx.bien();
    // IA
    const movsIA = validos(t, 2);
    if (!movsIA.length) {
      const m1 = validos(t, 1);
      if (!m1.length) { terminar(t); return; }
      st.current = { tab: t, turno: 1, fin: null }; setTab(t); setTurno(1); return;
    }
    let mejor = movsIA[0], mf = -1;
    movsIA.forEach(m => {
      const fl = flips(t, m[0], m[1], 2).length;
      const esquina = (m[0] === 0 || m[0] === 7) && (m[1] === 0 || m[1] === 7) ? 10 : 0;
      if (fl + esquina > mf) { mf = fl + esquina; mejor = m; }
    });
    const [ir, ic] = mejor;
    t[ir][ic] = 2; flips(t, ir, ic, 2).forEach(([a, b]) => { t[a][b] = 2; });
    if (!validos(t, 1).length && !validos(t, 2).length) { terminar(t); return; }
    st.current = { tab: t, turno: 1, fin: null }; setTab(t); setTurno(1);
  }
  function terminar(t) {
    const n1 = t.flat().filter(v => v === 1).length, n2 = t.flat().filter(v => v === 2).length;
    const g = n1 > n2 ? "¡GANASTE!" : n1 < n2 ? "Gana la IA." : "Empate.";
    st.current.fin = g; setFin(g);
    registrarPunt(n1 * 2, n1 > n2 ? 1 : 0);
    if (n1 > n2) sfx.record(); else sfx.mal();
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

  const n1 = tab.flat().filter(v => v === 1).length, n2 = tab.flat().filter(v => v === 2).length;
  const movs = validos(tab, 1);
  return (
    <GameShell titulo="Reversi" emoji="⚫" descripcion="Flechas/WASD + ENTER · encierra fichas vs IA.">
      <div className="fila-botones" style={{ marginTop: 0 }}>
        <button className="btn-exito" onClick={() => { const t = inicial(); st.current = { tab: t, turno: 1, fin: null }; setTab(t); setFin(null); }}>Nueva partida</button>
        <span className="chip">⚫ Tú <b>{n1}</b></span>
        <span className="chip">⚪ IA <b>{n2}</b></span>
        <span className="chip">Movs <b>{movs.length}</b></span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${N},40px)`, gap: 2, marginTop: 14, background: "#0d4028", padding: 8, borderRadius: 10, width: "max-content" }}>
        {tab.map((fila, r) => fila.map((v, c) => {
          const ok = flips(tab, r, c, 1).length > 0 && turno === 1 && !fin;
          return (
            <div key={`${r}-${c}`} onClick={() => { setCursor([r, c]); jugar(r, c); }}
              style={{ width: 40, height: 40, borderRadius: 6, background: ok ? "rgba(34,197,94,.35)" : "rgba(255,255,255,.05)", outline: cursor[0] === r && cursor[1] === c ? "2px solid var(--info)" : undefined, display: "grid", placeItems: "center", fontSize: "1.5rem", cursor: ok ? "pointer" : "default" }}>
              {v === 1 ? "⚫" : v === 2 ? "⚪" : ok ? "·" : ""}
            </div>
          );
        }))}
      </div>
      {fin && <div className={`mensaje-final ${tipo}`}>{fin} {mensaje}</div>}
    </GameShell>
  );
}
