import { useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { sfx } from "../suite/sonido";

/* Fusión (tendencia merge-2048): tablero 4×4. Toca dos fichas iguales
   adyacentes para fusionarlas en la siguiente. Sin movimientos = fin. */
const SETS = {
  neon: ["1", "2", "4", "8", "16", "32", "64", "128", "256", "512", "1K", "2K"],
  frutas: ["🍒", "🍋", "🍊", "🍎", "🍐", "🍑", "🍍", "🥥", "🍉", "🍇", "🥭", "👑"],
  gemas: ["🤍", "💙", "💚", "💛", "🧡", "❤️", "💜", "🖤", "💎", "🔮", "👑", "🌟"],
};
function aleatorio(set) {
  return Math.random() < 0.8 ? 0 : 1;
}
function hayMovimiento(t) {
  for (let i = 0; i < 16; i++) {
    const f = Math.floor(i / 4), c = i % 4;
    for (const [df, dc] of [[0, 1], [1, 0]]) {
      const ff = f + df, cc = c + dc;
      if (ff < 4 && cc < 4 && t[i] === t[ff * 4 + cc]) return true;
    }
  }
  return false;
}

function FusionMotor({ nombre, emoji, descripcion, setKey }) {
  const { mensaje, tipo, registrarPunt } = useRegistro(nombre);
  const set = SETS[setKey];
  const [tab, setTab] = useState(() => Array.from({ length: 16 }, () => aleatorio(set)));
  const [sel, setSel] = useState(null);
  const [puntos, setPuntos] = useState(0);
  const [fin, setFin] = useState(false);
  const mejor = Math.max(...tab);

  function rellenar(t) {
    return t.map(v => (v == null ? aleatorio(set) : v));
  }

  function tocar(i) {
    if (fin) return;
    sfx.clic();
    if (sel == null) { setSel(i); return; }
    if (sel === i) { setSel(null); return; }
    const f1 = Math.floor(sel / 4), c1 = sel % 4, f2 = Math.floor(i / 4), c2 = i % 4;
    const ady = Math.abs(f1 - f2) + Math.abs(c1 - c2) === 1;
    if (ady && tab[sel] === tab[i] && tab[i] < set.length - 1) {
      const t = [...tab];
      t[i] = tab[i] + 1; t[sel] = null;
      const lleno = rellenar(t);
      const gano = (tab[i] + 1) * 5;
      const np = puntos + gano;
      setTab(lleno); setPuntos(np); setSel(null);
      sfx.bien();
      if (!hayMovimiento(lleno)) {
        setFin(true);
        registrarPunt(np, mejor >= 8 ? 1 : 0);
      }
    } else {
      setSel(i);
      sfx.mal();
    }
  }

  function reiniciar() {
    setTab(Array.from({ length: 16 }, () => aleatorio(set)));
    setSel(null); setPuntos(0); setFin(false);
  }

  return (
    <GameShell titulo={nombre} emoji={emoji}
      descripcion={descripcion}
      stats={[{ etiqueta: "Puntos", valor: puntos }, { etiqueta: "Mejor", valor: set[mejor] }]}
      resultado={{ mensaje, tipo }}
      ayuda={<span>Toca una ficha y luego otra <b>igual y vecina</b> para fusionarlas. Fusionar da puntos. Si no quedan parejas vecinas, la partida termina.</span>}>
      <div className="fusion-tab" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, maxWidth: 340, margin: "0 auto" }}>
        {tab.map((v, i) => (
          <button key={i} onClick={() => tocar(i)}
            className={sel === i ? "btn-principal" : "btn-suave"}
            style={{ minHeight: 56, fontSize: v == null ? "1rem" : setKey === "neon" ? "1rem" : "1.6rem", touchAction: "manipulation" }}>
            {set[v]}
          </button>
        ))}
      </div>
      <div className="fila-botones">
        <button className="btn-suave" onClick={reiniciar}>🔄 Reiniciar</button>
        {fin && <span className="chip victoria">Fin · {puntos} pts</span>}
      </div>
      <Resultado mensaje={mensaje} tipo={tipo} />
    </GameShell>
  );
}

export default function FusionNeon() {
  return <FusionMotor nombre="Fusión Neón" emoji="🧬" setKey="neon"
    descripcion="Fusiona números iguales vecinos: 1→2→4→…→2K." />;
}
export function FusionFrutas() {
  return <FusionMotor nombre="Fusión Frutas" emoji="🍉" setKey="frutas"
    descripcion="Fusiona frutas iguales: de la cereza a la corona." />;
}
export function FusionGemas() {
  return <FusionMotor nombre="Fusión Gemas" emoji="💎" setKey="gemas"
    descripcion="Fusiona gemas vecinas hasta la estrella legendaria." />;
}
