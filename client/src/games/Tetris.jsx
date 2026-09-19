import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro } from "../ui/GameShell";
import { escribiendo } from "../suite/teclado";
import { sfx } from "../suite/sonido";

const COLS = 10, ROWS = 20;
const PIEZAS = {
  I: { m: [[1, 1, 1, 1]], c: "#22d3ee" },
  O: { m: [[1, 1], [1, 1]], c: "#facc15" },
  T: { m: [[0, 1, 0], [1, 1, 1]], c: "#a855f7" },
  S: { m: [[0, 1, 1], [1, 1, 0]], c: "#22c55e" },
  Z: { m: [[1, 1, 0], [0, 1, 1]], c: "#ef4444" },
  J: { m: [[1, 0, 0], [1, 1, 1]], c: "#3b82f6" },
  L: { m: [[0, 0, 1], [1, 1, 1]], c: "#fb923c" },
};
const NOMBRES = Object.keys(PIEZAS);

function rotar(m) { return m[0].map((_, i) => m.map(f => f[i]).reverse()); }
function tableroVacio() { return Array.from({ length: ROWS }, () => Array(COLS).fill(null)); }
function nuevaPieza() {
  const n = NOMBRES[Math.floor(Math.random() * NOMBRES.length)];
  return { nombre: n, m: PIEZAS[n].m.map(f => [...f]), c: PIEZAS[n].c, x: 3, y: 0 };
}
function choca(tab, m, px, py) {
  for (let r = 0; r < m.length; r++) for (let c = 0; c < m[r].length; c++) {
    if (!m[r][c]) continue;
    const x = px + c, y = py + r;
    if (x < 0 || x >= COLS || y >= ROWS) return true;
    if (y >= 0 && tab[y][x]) return true;
  }
  return false;
}

export default function Tetris() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Tetris neón");
  const [tab, setTab] = useState(tableroVacio);
  const [pieza, setPieza] = useState(nuevaPieza);
  const [sig, setSig] = useState(nuevaPieza);
  const [puntos, setPuntos] = useState(0);
  const [lineas, setLineas] = useState(0);
  const [nivel, setNivel] = useState(1);
  const [jugando, setJugando] = useState(false);
  const [pausa, setPausa] = useState(false);
  const [fin, setFin] = useState(false);
  const st = useRef({ tab, pieza, sig, puntos, lineas, nivel, jugando: false, pausa: false, fin: false });
  st.current = { tab, pieza, sig, puntos, lineas, nivel, jugando, pausa, fin };

  function empezar() {
    const t = tableroVacio();
    const p = nuevaPieza(), s = nuevaPieza();
    st.current = { tab: t, pieza: p, sig: s, puntos: 0, lineas: 0, nivel: 1, jugando: true, pausa: false, fin: false };
    setTab(t); setPieza(p); setSig(s); setPuntos(0); setLineas(0); setNivel(1);
    setJugando(true); setPausa(false); setFin(false);
  }

  function fijar() {
    const s = st.current;
    const t = s.tab.map(f => [...f]);
    const { m, x, y, c } = s.pieza;
    m.forEach((fila, r) => fila.forEach((v, cc) => {
      if (v && y + r >= 0) t[y + r][x + cc] = c;
    }));
    let limpias = 0;
    const resto = t.filter(f => { if (f.every(v => v)) { limpias++; return false; } return true; });
    while (resto.length < ROWS) resto.unshift(Array(COLS).fill(null));
    const nl = s.lineas + limpias;
    const np = s.puntos + [0, 40, 100, 300, 1200][limpias] * s.nivel;
    const nn = 1 + Math.floor(nl / 10);
    if (limpias > 0) sfx.bien();
    const npieza = s.sig, nsig = nuevaPieza();
    if (choca(resto, npieza.m, npieza.x, npieza.y)) {
      st.current = { ...s, tab: resto, puntos: np, lineas: nl, fin: true, jugando: false };
      setTab(resto); setPuntos(np); setLineas(nl); setFin(true); setJugando(false);
      registrarPunt(np, nl >= 5 ? 1 : 0);
      sfx.mal();
      return;
    }
    st.current = { ...s, tab: resto, pieza: npieza, sig: nsig, puntos: np, lineas: nl, nivel: nn };
    setTab(resto); setPieza(npieza); setSig(nsig); setPuntos(np); setLineas(nl); setNivel(nn);
  }
  const fijarRef = useRef(fijar); fijarRef.current = fijar;

  function mover(dx, dy) {
    const s = st.current;
    if (!s.jugando || s.pausa || s.fin) return;
    const p = s.pieza;
    if (!choca(s.tab, p.m, p.x + dx, p.y + dy)) {
      const np = { ...p, x: p.x + dx, y: p.y + dy };
      st.current.pieza = np; setPieza(np);
    } else if (dy > 0) fijarRef.current();
  }
  function girar() {
    const s = st.current;
    if (!s.jugando || s.pausa || s.fin) return;
    const r = rotar(s.pieza.m);
    if (!choca(s.tab, r, s.pieza.x, s.pieza.y)) {
      const np = { ...s.pieza, m: r };
      st.current.pieza = np; setPieza(np);
    }
  }
  const moverRef = useRef(mover); moverRef.current = mover;
  const girarRef = useRef(girar); girarRef.current = girar;

  useEffect(() => {
    const fn = e => {
      if (escribiendo()) return;
      const k = e.key;
      if (k === "ArrowLeft" || k === "a" || k === "A") { e.preventDefault(); moverRef.current(-1, 0); }
      else if (k === "ArrowRight" || k === "d" || k === "D") { e.preventDefault(); moverRef.current(1, 0); }
      else if (k === "ArrowDown" || k === "s" || k === "S") { e.preventDefault(); moverRef.current(0, 1); }
      else if (k === "ArrowUp" || k === "w" || k === "W" || k === "x" || k === "X") { e.preventDefault(); girarRef.current(); }
      else if (k === " ") { e.preventDefault(); if (!st.current.jugando) empezar(); else moverRef.current(0, 1); }
      else if (k === "p" || k === "P") { if (st.current.jugando) { const v = !st.current.pausa; st.current.pausa = v; setPausa(v); } }
      else if (k === "Enter") { if (!st.current.jugando) empezar(); }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!jugando || pausa || fin) return;
    const id = setInterval(() => moverRef.current(0, 1), Math.max(90, 650 - (nivel - 1) * 55));
    return () => clearInterval(id);
  }, [jugando, pausa, fin, nivel]);

  const vista = tab.map(f => [...f]);
  pieza.m.forEach((fila, r) => fila.forEach((v, c) => {
    if (v && pieza.y + r >= 0 && pieza.y + r < ROWS && pieza.x + c >= 0 && pieza.x + c < COLS) vista[pieza.y + r][pieza.x + c] = pieza.c;
  }));

  return (
    <GameShell titulo="Tetris neón" emoji="🧱" descripcion="Flechas o WASD mover · ↑/W girar · ESPACIO bajar · P pausa.">
      <div className="fila-botones" style={{ marginTop: 0 }}>
        <button className="btn-principal" onClick={empezar}>{jugando ? "Reiniciar" : fin ? "↻ Reintentar" : "▶ Jugar"}</button>
        <span className="chip">Puntos <b>{puntos}</b></span>
        <span className="chip">Líneas <b>{lineas}</b></span>
        <span className="chip">Nivel <b>{nivel}</b></span>
        <span className="chip">Siguiente: <b style={{ color: sig.c }}>■</b></span>
      </div>
      <div style={{ display: "flex", gap: 14, marginTop: 14, flexWrap: "wrap" }}>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${COLS},20px)`, gap: 1, background: "#0b0d14", padding: 6, borderRadius: 10, border: "1px solid var(--border)" }}>
          {vista.map((fila, r) => fila.map((v, c) => (
            <div key={`${r}-${c}`} style={{ width: 20, height: 20, borderRadius: 3, background: v || "rgba(255,255,255,.04)", boxShadow: v ? `0 0 8px ${v}` : undefined }} />
          )))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div className="fila-botones" style={{ marginTop: 0 }}>
            <button onClick={() => moverRef.current(-1, 0)}>←</button>
            <button onClick={() => girarRef.current()}>⟳</button>
            <button onClick={() => moverRef.current(1, 0)}>→</button>
          </div>
          <div className="fila-botones" style={{ marginTop: 0 }}>
            <button onClick={() => moverRef.current(0, 1)}>↓</button>
            <button onClick={() => { if (jugando) { const v = !pausa; st.current.pausa = v; setPausa(v); } }}>{pausa ? "▶" : "⏸"}</button>
          </div>
          {pausa && <div className="aviso info">⏸ En pausa.</div>}
        </div>
      </div>
      {fin && <div className={`mensaje-final ${tipo}`}>{mensaje}</div>}
    </GameShell>
  );
}
