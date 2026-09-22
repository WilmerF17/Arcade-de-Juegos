import { useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { sfx } from "../suite/sonido";

/* Puzzle 9: deslizante 3×3, ordena del 1 al 8. */
export default function Puzzle9() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Puzzle 9");
  const [tab, setTab] = useState([1, 2, 3, 4, 5, 6, 7, 8, 0]);
  const [movs, setMovs] = useState(0);
  const [jugando, setJugando] = useState(false);

  function mezclar() {
    let t = [1, 2, 3, 4, 5, 6, 7, 8, 0];
    for (let k = 0; k < 80; k++) {
      const h = t.indexOf(0);
      const moves = [];
      if (h % 3 > 0) moves.push(h - 1);
      if (h % 3 < 2) moves.push(h + 1);
      if (h > 2) moves.push(h - 3);
      if (h < 6) moves.push(h + 3);
      const m = moves[Math.floor(Math.random() * moves.length)];
      [t[h], t[m]] = [t[m], t[h]];
    }
    setTab(t); setMovs(0); setJugando(true);
    sfx.clic();
  }

  function tocar(i) {
    if (!jugando) return;
    const h = tab.indexOf(0);
    const ady = (i === h - 1 && h % 3 > 0) || (i === h + 1 && h % 3 < 2) || i === h - 3 || i === h + 3;
    if (!ady) return;
    const t = [...tab];
    [t[h], t[i]] = [t[i], t[h]];
    const nm = movs + 1;
    setTab(t); setMovs(nm);
    sfx.clic();
    if (t.every((v, j) => v === (j + 1) % 9)) {
      setJugando(false);
      sfx.bien();
      registrarPunt(Math.max(60, 500 - nm * 4), nm <= 60 ? 1 : 0);
    }
  }

  return (
    <GameShell titulo="Puzzle 9" emoji="🧩"
      descripcion="Desliza del 1 al 8 en orden · el hueco manda."
      tira="linear-gradient(90deg,#14b8a6,#6366f1)" iconoFondo="linear-gradient(135deg,#14b8a6,#6366f1)">
      <div className="fila-botones">
        <span className="chip">Movimientos: <b>{movs}</b></span>
        <button className="btn-principal" onClick={mezclar}>🔀 {jugando ? "Reiniciar" : "Empezar"}</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,84px)", gap: 8, justifyContent: "center" }}>
        {tab.map((v, i) => (
          <button key={i} onClick={() => tocar(i)}
            style={{ width: 84, height: 84, fontSize: "2rem", fontWeight: 800, borderRadius: 14,
              background: v === 0 ? "transparent" : "var(--bg-soft)",
              border: v === 0 ? "2px dashed var(--border)" : "2px solid var(--border)",
              color: "var(--texto)" }}>
            {v || ""}
          </button>
        ))}
      </div>
      <Resultado mensaje={mensaje} tipo={tipo} />
    </GameShell>
  );
}
