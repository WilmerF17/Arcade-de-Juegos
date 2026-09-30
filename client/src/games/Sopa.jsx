import { useEffect, useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { sfx } from "../suite/sonido";

const LISTAS = [
  ["GATO", "PERRO", "LUNA", "SOL", "MESA"],
  ["JUEGO", "PIXEL", "NIVEL", "PUNTOS", "TECLA"],
  ["DRAGON", "CASTILLO", "ESPADA", "MAGIA", "REINO"],
];
const NOMBRES = ["Fácil", "Normal", "Difícil"];
function crear(nivel) {
  const palabras = LISTAS[nivel];
  const N = 10;
  const g = Array.from({ length: N }, () => Array(N).fill(""));
  const dirs = [[0, 1], [1, 0], [1, 1]];
  const puestas = [];
  palabras.forEach(p => {
    for (let t = 0; t < 100; t++) {
      const [dr, dc] = dirs[Math.floor(Math.random() * dirs.length)];
      const r = Math.floor(Math.random() * N), c = Math.floor(Math.random() * N);
      const er = r + dr * (p.length - 1), ec = c + dc * (p.length - 1);
      if (er < 0 || ec < 0 || er >= N || ec >= N) continue;
      let ok = true;
      for (let i = 0; i < p.length; i++) {
        const v = g[r + dr * i][c + dc * i];
        if (v && v !== p[i]) { ok = false; break; }
      }
      if (!ok) continue;
      const celdas = [];
      for (let i = 0; i < p.length; i++) { g[r + dr * i][c + dc * i] = p[i]; celdas.push([r + dr * i, c + dc * i]); }
      puestas.push({ palabra: p, celdas });
      break;
    }
  });
  const abc = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ";
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (!g[r][c]) g[r][c] = abc[Math.floor(Math.random() * abc.length)];
  return { grid: g, puestas };
}

export default function Sopa() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Sopa de Letras");
  const [nivel, setNivel] = useState(0);
  const [juego, setJuego] = useState(() => crear(0));
  const [entrada, setEntrada] = useState("");
  const [halladas, setHalladas] = useState([]);
  const [fallos, setFallos] = useState(0);

  function nuevo(n = nivel) {
    setNivel(n); setJuego(crear(n)); setHalladas([]); setEntrada(""); setFallos(0);
    sfx.clic();
  }
  function probar(palabraParam) {
    const w = (palabraParam ?? entrada).trim().toUpperCase();
    if (!w) return;
    if (juego.puestas.some(p => p.palabra === w) && !halladas.includes(w)) {
      const nh = [...halladas, w];
      setHalladas(nh); setEntrada("");
      sfx.bien();
      if (nh.length === juego.puestas.length) {
        const pts = Math.max(150 - fallos * 10, 40) + nivel * 30;
        registrarPunt(pts, 1);
        sfx.record();
      }
    } else {
      setFallos(f => f + 1); sfx.mal();
    }
  }
  const hallSet = new Set();
  halladas.forEach(h => {
    const p = juego.puestas.find(x => x.palabra === h);
    if (p) p.celdas.forEach(([r, c]) => hallSet.add(`${r},${c}`));
  });
  const fin = halladas.length === juego.puestas.length;
  const pct = juego.puestas.length ? Math.round((halladas.length / juego.puestas.length) * 100) : 0;

  useEffect(() => {
    const fn = (e) => {
      const tag = (e.target?.tagName || "").toUpperCase();
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if ((e.key === "Enter" || e.key === " ") && fin) {
        e.preventDefault();
        nuevo();
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <GameShell titulo="Sopa de Letras" emoji="🔍" descripcion="Escribe las palabras ocultas (→ ↓ ↘) · 3 niveles."
      stats={[
        { icono: "🔍", etiqueta: "Halladas", valor: `${halladas.length}/${juego.puestas.length}` },
        { icono: "❌", etiqueta: "Fallos", valor: fallos },
        { icono: "⭐", etiqueta: "Nivel+", valor: `+${nivel * 30}` },
        { icono: "🎚️", etiqueta: "Dificultad", valor: NOMBRES[nivel] },
      ]}
      resultado={{ mensaje, tipo }}
      ayuda={(
        <div>
          <p><b>Reglas:</b> encuentra las {juego.puestas.length} palabras ocultas (derecha, abajo o diagonal) escribiéndolas en el buscador.</p>
          <p><b>Controles:</b> escribe con el teclado y pulsa <kbd>Enter</kbd> o el botón Buscar · cambia de nivel con <kbd>1</kbd>–<kbd>3</kbd> si quieres (cuando el foco no está en el buscador).</p>
          <p><b>Puntuación:</b> 150 menos 10 por fallo (mínimo 40) más 30 por nivel. Completar siempre es victoria.</p>
          <p><b>Consejo:</b> busca primero las palabras largas: sus letras raras delatan la fila.</p>
        </div>
      )}
      acciones={(
        <>
          {[0, 1, 2].map(n => <button key={n} className={nivel === n ? "btn-principal" : "btn-suave"} onClick={() => nuevo(n)}>{NOMBRES[n]}</button>)}
          <button className="btn-suave" onClick={() => nuevo(nivel)}>↻ Nueva sopa</button>
        </>
      )}>
      <div className="xp-bar fina" aria-hidden><div style={{ width: `${pct}%` }} /></div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(10,34px)", gap: 2, marginTop: 14, background: "#0b0d14", padding: 8, borderRadius: 10, width: "max-content" }}>
        {juego.grid.map((fila, r) => fila.map((ch, c) => (
          <div key={`${r}-${c}`} style={{ width: 34, height: 34, display: "grid", placeItems: "center", fontWeight: 800, borderRadius: 6, background: hallSet.has(`${r},${c}`) ? "rgba(34,197,94,.4)" : "var(--bg-soft)", border: "1px solid var(--border)" }}>{ch}</div>
        )))}
      </div>
      {!fin && (
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <input type="text" value={entrada} onChange={e => setEntrada(e.target.value.toUpperCase())} onKeyDown={e => e.key === "Enter" && probar()} placeholder="Palabra..." style={{ width: 180, textTransform: "uppercase" }} />
          <button className="btn-principal" onClick={() => probar()}>Buscar ⏎</button>
        </div>
      )}
      <div className="fila-botones">
        {juego.puestas.map(p => (
          <span key={p.palabra} className="chip" style={{ color: halladas.includes(p.palabra) ? "var(--exito)" : undefined }}>
            {halladas.includes(p.palabra) ? `✅ ${p.palabra}` : `· ${"•".repeat(p.palabra.length)} (${p.palabra.length})`}
          </span>
        ))}
      </div>
      <Resultado mensaje="" tipo="" />
    </GameShell>
  );
}
