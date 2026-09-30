import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { dirDeTecla, escribiendo } from "../suite/teclado";
import { sfx } from "../suite/sonido";

/* Puzzle 9: deslizante 3×3, ordena del 1 al 8. */
export default function Puzzle9() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Puzzle 9");
  const [tab, setTab] = useState([1, 2, 3, 4, 5, 6, 7, 8, 0]);
  const [movs, setMovs] = useState(0);
  const [jugando, setJugando] = useState(false);
  const [mejor, setMejor] = useState(null);
  const st = useRef({ tab, movs, jugando });
  st.current = { tab, movs, jugando };

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
    st.current = { tab: t, movs: 0, jugando: true };
    sfx.clic();
  }

  function tocar(i) {
    const s = st.current;
    if (!s.jugando) return;
    const h = s.tab.indexOf(0);
    const ady = (i === h - 1 && h % 3 > 0) || (i === h + 1 && h % 3 < 2) || i === h - 3 || i === h + 3;
    if (!ady) return;
    const t = [...s.tab];
    [t[h], t[i]] = [t[i], t[h]];
    const nm = s.movs + 1;
    setTab(t); setMovs(nm);
    st.current = { tab: t, movs: nm, jugando: true };
    sfx.clic();
    if (t.every((v, j) => v === (j + 1) % 9)) {
      setJugando(false);
      st.current.jugando = false;
      sfx.bien();
      setMejor(m => (m == null || nm < m ? nm : m));
      registrarPunt(Math.max(60, 500 - nm * 4), nm <= 60 ? 1 : 0);
    }
  }

  const tocarRef = useRef(tocar);
  tocarRef.current = tocar;
  const mezclarRef = useRef(mezclar);
  mezclarRef.current = mezclar;

  useEffect(() => {
    const fn = e => {
      if (escribiendo()) return;
      const s = st.current;
      if ((e.key === "Enter" || e.key === " ") && !s.jugando) {
        e.preventDefault();
        mezclarRef.current();
        return;
      }
      if (!s.jugando) return;
      const d = dirDeTecla(e.key);
      if (d) {
        e.preventDefault();
        const h = s.tab.indexOf(0);
        let ficha = -1;
        if (d === "arr" && h < 6) ficha = h + 3;
        else if (d === "aba" && h > 2) ficha = h - 3;
        else if (d === "izq" && h % 3 < 2) ficha = h + 1;
        else if (d === "der" && h % 3 > 0) ficha = h - 1;
        if (ficha >= 0) tocarRef.current(ficha);
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  const bien = tab.filter((v, i) => v === (i + 1) % 9).length;
  const pct = Math.round((bien / 9) * 100);

  return (
    <GameShell titulo="Puzzle 9" emoji="🧩"
      descripcion="Desliza del 1 al 8 en orden · flechas/WASD o clic · el hueco manda."
      tira="linear-gradient(90deg,#14b8a6,#6366f1)" iconoFondo="linear-gradient(135deg,#14b8a6,#6366f1)"
      stats={[
        { icono: "👣", etiqueta: "Movs", valor: movs },
        { icono: "✅", etiqueta: "Bien", valor: `${bien}/9` },
        { icono: "📐", etiqueta: "Tablero", valor: "3×3" },
        { icono: "🏆", etiqueta: "Mejor", valor: mejor == null ? "—" : `${mejor} movs` },
      ]}
      acciones={<button className="btn-exito" onClick={mezclar}>🔀 {jugando ? "Reiniciar" : "Empezar (ENTER)"}</button>}
      ayuda={<>
        <p><b>Objetivo:</b> ordena las fichas del <b>1 al 8</b> con el hueco abajo a la derecha. Solo se mueve la ficha vecina al hueco.</p>
        <p><b>Controles:</b> clica la ficha o usa <kbd>←</kbd><kbd>→</kbd><kbd>↑</kbd><kbd>↓</kbd>/<kbd>WASD</kbd>. <kbd>Enter</kbd>/<kbd>Espacio</kbd> empieza o reinicia.</p>
        <p><b>Puntuación:</b> resolver da <b>500 − 4 por movimiento</b> (mínimo 60); 60 movs o menos cuenta como victoria.</p>
        <p><b>Consejo:</b> coloca primero el 1-2-3 arriba sin romperlos y usa el hueco como “aparcamiento” temporal.</p>
      </>}>
      <div className="xp-bar fina"><div style={{ width: `${pct}%` }} /></div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,84px)", gap: 8, justifyContent: "center", marginTop: 10 }}>
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
