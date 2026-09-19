import { useState } from "react";
import GameShell, { useRegistro } from "../ui/GameShell";
import { sfx } from "../suite/sonido";

/* Buscaminas con tamaño configurable. */
function BuscaBase({ titulo, emoji, n, minas, tira, iconoFondo }) {
  const { mensaje, tipo, registrarPunt } = useRegistro(titulo);
  const [minasSet, setMinasSet] = useState(new Set());
  const [abiertas, setAbiertas] = useState(new Set());
  const [marcas, setMarcas] = useState(new Set());
  const [jugando, setJugando] = useState(false);
  const [fin, setFin] = useState("");

  function vecinos(i) {
    const r = Math.floor(i / n), c = i % n;
    const v = [];
    for (let dr = -1; dr <= 1; dr++)
      for (let dc = -1; dc <= 1; dc++) {
        if (!dr && !dc) continue;
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < n && nc >= 0 && nc < n) v.push(nr * n + nc);
      }
    return v;
  }

  function empezar() {
    const s = new Set();
    while (s.size < minas) s.add(Math.floor(Math.random() * n * n));
    setMinasSet(s); setAbiertas(new Set()); setMarcas(new Set());
    setJugando(true); setFin("");
    sfx.clic();
  }

  function cuenta(i) {
    return vecinos(i).filter(x => minasSet.has(x)).length;
  }

  function abrir(i, ab) {
    if (minasSet.has(i) || ab.has(i)) return ab;
    ab.add(i);
    if (cuenta(i) === 0) vecinos(i).forEach(v => abrir(v, ab));
    return ab;
  }

  function tocar(i, e) {
    if (!jugando) return;
    if (e) { e.preventDefault(); }
    if (abiertas.has(i)) return;
    if (minasSet.has(i)) {
      setJugando(false);
      setFin("💥 ¡Bomba! Inténtalo de nuevo.");
      sfx.mal();
      registrarPunt(abiertas.size * 5, 0);
      return;
    }
    const ab = abrir(i, new Set(abiertas));
    setAbiertas(ab);
    sfx.clic();
    if (ab.size === n * n - minas) {
      setJugando(false);
      setFin("🎉 ¡Tablero limpio!");
      sfx.bien();
      registrarPunt(minas * 20 + n * 10, 1);
    }
  }

  function marcar(i, e) {
    e.preventDefault();
    if (!jugando || abiertas.has(i)) return;
    const m = new Set(marcas);
    if (m.has(i)) m.delete(i); else m.add(i);
    setMarcas(m);
  }

  return (
    <GameShell titulo={titulo} emoji={emoji}
      descripcion={`${n}×${n} con ${minas} minas · clic abre, clic derecho marca.`}
      tira={tira} iconoFondo={iconoFondo}>
      <div className="fila-botones" style={{ marginTop: 0 }}>
        <button className="btn-principal" onClick={empezar}>{abiertas.size ? "↻ Nuevo" : "▶ Empezar"}</button>
        <span className="chip">💣 <b>{minas - marcas.size}</b></span>
        <span className="chip">✅ <b>{abiertas.size}/{n * n - minas}</b></span>
      </div>
      {fin && <p style={{ textAlign: "center" }}>{fin}</p>}
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${n},34px)`, gap: 4, justifyContent: "center" }}>
        {Array.from({ length: n * n }, (_, i) => {
          const ab = abiertas.has(i);
          return (
            <button key={i} onClick={() => tocar(i)} onContextMenu={e => marcar(i, e)}
              style={{ width: 34, height: 34, fontSize: ".95rem", fontWeight: 800, borderRadius: 7,
                background: ab ? "var(--bg-hover)" : "var(--bg-soft)",
                border: "1px solid var(--border)",
                color: cuenta(i) === 1 ? "#22d3ee" : cuenta(i) === 2 ? "#22c55e" : "#ff3d5a" }}>
              {ab ? (cuenta(i) || "") : marcas.has(i) ? "🚩" : ""}
            </button>
          );
        })}
      </div>
      {mensaje && <div className={`mensaje-final ${tipo}`}>{mensaje}</div>}
    </GameShell>
  );
}

export function BuscaChico() {
  return <BuscaBase titulo="Buscaminas Chico" emoji="💣" n={8} minas={10} tira="linear-gradient(135deg,#475569,#22c55e)" iconoFondo="linear-gradient(135deg,#475569,#22c55e)" />;
}
export function BuscaGrande() {
  return <BuscaBase titulo="Buscaminas Grande" emoji="💥" n={12} minas={25} tira="linear-gradient(135deg,#7c2d12,#ef4444)" iconoFondo="linear-gradient(135deg,#7c2d12,#ef4444)" />;
}
