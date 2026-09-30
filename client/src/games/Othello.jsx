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

const NOM_DIF = { 1: "Fácil", 2: "Normal", 3: "Difícil" };

export default function Othello() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Reversi");
  const [tab, setTab] = useState(inicial);
  const [turno, setTurno] = useState(1);
  const [dif, setDif] = useState(2);
  const [fin, setFin] = useState(null);
  const [cursor, setCursor] = useState([2, 3]);
  const [mejor, setMejor] = useState(null);
  const st = useRef({ tab, turno, fin }); st.current = { tab, turno, fin };
  const difRef = useRef(dif); difRef.current = dif;

  function elegirIA(t) {
    const movsIA = validos(t, 2);
    if (!movsIA.length) return null;
    if (difRef.current === 1) {
      // Fácil: aleatoria
      return movsIA[Math.floor(Math.random() * movsIA.length)];
    }
    if (difRef.current === 2) {
      // Normal: glotona (más flips)
      let mejorM = movsIA[0], mf = -1;
      movsIA.forEach(m => {
        const fl = flips(t, m[0], m[1], 2).length;
        if (fl > mf) { mf = fl; mejorM = m; }
      });
      return mejorM;
    }
    // Difícil: glotona + esquinas + bordes, evita regalar esquinas
    let mejorM = movsIA[0], mf = -1;
    movsIA.forEach(m => {
      const fl = flips(t, m[0], m[1], 2).length;
      const esquina = (m[0] === 0 || m[0] === 7) && (m[1] === 0 || m[1] === 7) ? 12 : 0;
      const borde = (m[0] === 0 || m[0] === 7 || m[1] === 0 || m[1] === 7) ? 3 : 0;
      const juntoEsquina = [[0, 1], [1, 0], [1, 1], [0, 6], [1, 6], [1, 7], [6, 0], [6, 1], [7, 1], [6, 6], [6, 7], [7, 6]].some(([a, b]) => a === m[0] && b === m[1]) ? -6 : 0;
      const v = fl + esquina + borde + juntoEsquina;
      if (v > mf) { mf = v; mejorM = m; }
    });
    return mejorM;
  }

  function jugar(r, c) {
    const s = st.current;
    if (s.fin) return;
    const f = flips(s.tab, r, c, 1);
    if (!f.length) return;
    const t = s.tab.map(x => [...x]);
    t[r][c] = 1; f.forEach(([a, b]) => { t[a][b] = 1; });
    sfx.clic();
    // IA
    const elec = elegirIA(t);
    if (!elec) {
      const m1 = validos(t, 1);
      if (!m1.length) { terminar(t); return; }
      st.current = { tab: t, turno: 1, fin: null }; setTab(t); setTurno(1); return;
    }
    const [ir, ic] = elec;
    t[ir][ic] = 2; flips(t, ir, ic, 2).forEach(([a, b]) => { t[a][b] = 2; });
    if (!validos(t, 1).length && !validos(t, 2).length) { terminar(t); return; }
    st.current = { tab: t, turno: 1, fin: null }; setTab(t); setTurno(1);
  }
  function terminar(t) {
    const n1 = t.flat().filter(v => v === 1).length, n2 = t.flat().filter(v => v === 2).length;
    const g = n1 > n2 ? "¡GANASTE!" : n1 < n2 ? "Gana la IA." : "Empate.";
    st.current.fin = g; setFin(g);
    registrarPunt(n1 * 2, n1 > n2 ? 1 : 0);
    if (n1 > n2) { sfx.record(); setMejor(m => (m == null || n1 > m ? n1 : m)); }
    else if (n1 < n2) sfx.mal();
    else sfx.bien();
  }
  function nueva() {
    sfx.clic();
    const t = inicial();
    st.current = { tab: t, turno: 1, fin: null };
    setTab(t); setFin(null); setTurno(1); setCursor([2, 3]);
  }
  const jugarRef = useRef(jugar); jugarRef.current = jugar;
  const nuevaRef = useRef(nueva); nuevaRef.current = nueva;

  useEffect(() => {
    const fn = e => {
      if (escribiendo() || st.current.fin) {
        if (st.current.fin && !escribiendo() && (e.key === "Enter" || e.key === " " || e.key === "n" || e.key === "N")) {
          e.preventDefault();
          nuevaRef.current();
        }
        return;
      }
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
  const totalF = n1 + n2;
  const pct = totalF ? Math.round((n1 / totalF) * 100) : 50;
  return (
    <GameShell titulo="Reversi" emoji="⚫" descripcion="Flechas/WASD + ENTER · encierra fichas vs IA · 3 niveles."
      stats={[
        { icono: "⚫", etiqueta: "Tú", valor: n1 },
        { icono: "⚪", etiqueta: "IA", valor: `${n2} ${NOM_DIF[dif]}` },
        { icono: "📍", etiqueta: "Movs", valor: movs.length },
        { icono: "🏆", etiqueta: "Mejor", valor: mejor == null ? "—" : mejor },
      ]}
      acciones={<>
        <button className="btn-exito" onClick={nueva}>↻ Nueva partida (ENTER al fin)</button>
        {[1, 2, 3].map(d => (
          <button key={d} className={dif === d ? "btn-principal" : "btn-suave"} onClick={() => { sfx.clic(); setDif(d); nueva(); }}>
            {NOM_DIF[d]}
          </button>
        ))}
      </>}
      resultado={fin ? { mensaje: `${fin} ${mensaje}`, tipo } : null}
      ayuda={<>
        <p><b>Objetivo:</b> termina con más fichas ⚫ que la IA ⚪. Al colocar, volteas todas las fichas rivales encerradas en línea recta (8 direcciones).</p>
        <p><b>Controles:</b> clica una casilla verde (·) o mueve el cursor con <kbd>←</kbd><kbd>→</kbd><kbd>↑</kbd><kbd>↓</kbd>/<kbd>WASD</kbd> y confirma con <kbd>Enter</kbd>/<kbd>Espacio</kbd>. <kbd>N</kbd> reinicia al terminar.</p>
        <p><b>Puntuación:</b> registras <b>2 pts por ficha propia</b>; más fichas que la IA cuenta como victoria. Niveles: <b>Fácil</b> aleatoria, <b>Normal</b> glotona, <b>Difícil</b> glotona + esquinas.</p>
        <p><b>Consejo:</b> no captures mucho al inicio: juega pocos discos, busca las esquinas y deja a la IA sin movimientos.</p>
      </>}>
      <div className="xp-bar fina"><div style={{ width: `${pct}%` }} /></div>
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
    </GameShell>
  );
}
