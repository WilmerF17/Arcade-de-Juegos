import { useState } from "react";
import GameShell, { useRegistro } from "../ui/GameShell";
import { sfx } from "../suite/sonido";

/* Tres en raya en tableros grandes contra IA glotona. */
function RayaBase({ titulo, emoji, n, meta, tira, iconoFondo }) {
  const { mensaje, tipo, registrarPunt } = useRegistro(titulo);
  const [tab, setTab] = useState(Array(n * n).fill(""));
  const [jugando, setJugando] = useState(false);
  const [fin, setFin] = useState("");

  function lineas() {
    const L = [];
    for (let r = 0; r < n; r++)
      for (let c = 0; c <= n - meta; c++)
        L.push(Array.from({ length: meta }, (_, k) => r * n + c + k));
    for (let c = 0; c < n; c++)
      for (let r = 0; r <= n - meta; r++)
        L.push(Array.from({ length: meta }, (_, k) => (r + k) * n + c));
    for (let r = 0; r <= n - meta; r++)
      for (let c = 0; c <= n - meta; c++) {
        L.push(Array.from({ length: meta }, (_, k) => (r + k) * n + c + k));
        L.push(Array.from({ length: meta }, (_, k) => (r + k) * n + c + meta - 1 - k));
      }
    return L;
  }

  function ganador(t) {
    for (const L of lineas()) {
      const v = L.map(i => t[i]);
      if (v.every(x => x === "X")) return "X";
      if (v.every(x => x === "O")) return "O";
    }
    return t.every(x => x) ? "E" : null;
  }

  function jugadaIA(t) {
    const libres = t.map((x, i) => (x ? null : i)).filter(x => x !== null);
    // 1. ganar 2. bloquear 3. mejor casilla (centro primero)
    for (const marca of ["O", "X"]) {
      for (const i of libres) {
        const c = [...t]; c[i] = marca;
        if (ganador(c) === marca) return i;
      }
    }
    const centro = Math.floor((n * n) / 2);
    if (t[centro] === "") return centro;
    const esq = [0, n - 1, n * (n - 1), n * n - 1].filter(i => t[i] === "");
    if (esq.length) return esq[Math.floor(Math.random() * esq.length)];
    return libres[Math.floor(Math.random() * libres.length)];
  }

  function empezar() {
    setTab(Array(n * n).fill(""));
    setJugando(true); setFin("");
    sfx.clic();
  }

  function tocar(i) {
    if (!jugando || tab[i]) return;
    const t = [...tab]; t[i] = "X";
    let g = ganador(t);
    if (g) return cerrar(t, g);
    const ia = jugadaIA(t);
    t[ia] = "O";
    g = ganador(t);
    setTab(t);
    if (g) cerrar(t, g);
    else sfx.clic();
  }

  function cerrar(t, g) {
    setTab(t);
    setJugando(false);
    if (g === "X") { setFin("🎉 ¡Ganaste!"); sfx.bien(); registrarPunt(300, 1); }
    else if (g === "O") { setFin("🤖 Ganó la IA…"); sfx.mal(); registrarPunt(40, 0); }
    else { setFin("🤝 ¡Empate!"); sfx.clic(); registrarPunt(120, 0); }
  }

  return (
    <GameShell titulo={titulo} emoji={emoji}
      descripcion={`Tablero ${n}×${n} · haz ${meta} en línea antes que la IA.`}
      tira={tira} iconoFondo={iconoFondo}>
      {!jugando && tab.every(x => !x) && (
        <div className="fila-botones" style={{ marginTop: 0 }}><button className="btn-principal" onClick={empezar}>▶ Empezar (eres X)</button></div>
      )}
      {fin && <p style={{ textAlign: "center" }}>{fin}</p>}
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${n},64px)`, gap: 6, justifyContent: "center" }}>
        {tab.map((v, i) => (
          <button key={i} onClick={() => tocar(i)} disabled={!jugando}
            style={{ width: 64, height: 64, fontSize: "1.9rem", fontWeight: 800, borderRadius: 12,
              background: "var(--bg-soft)", border: "2px solid var(--border)",
              color: v === "X" ? "#22d3ee" : "#ff3d5a" }}>
            {v}
          </button>
        ))}
      </div>
      {mensaje && <div className={`mensaje-final ${tipo}`}>{mensaje}</div>}
      {!jugando && fin && !mensaje && (
        <div className="fila-botones"><button className="btn-principal" onClick={empezar}>↻ Revancha</button></div>
      )}
    </GameShell>
  );
}

export function Raya4() {
  return <RayaBase titulo="Raya 4×4" emoji="❌" n={4} meta={4} tira="linear-gradient(135deg,#22d3ee,#a78bfa)" iconoFondo="linear-gradient(135deg,#22d3ee,#a78bfa)" />;
}
export function Raya5() {
  return <RayaBase titulo="Raya 5×5" emoji="⭕" n={5} meta={4} tira="linear-gradient(135deg,#a855f7,#f59e0b)" iconoFondo="linear-gradient(135deg,#a855f7,#f59e0b)" />;
}
