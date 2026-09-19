import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro } from "../ui/GameShell";
import { sfx } from "../suite/sonido";

/* Sprint de Clics: ¿cuántos toques en 10 segundos? */
export default function Sprint() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Sprint de Clics");
  const [clics, setClics] = useState(0);
  const [tiempo, setTiempo] = useState(10);
  const [jugando, setJugando] = useState(false);
  const [mejor, setMejor] = useState(() => Number(localStorage.getItem("arcade-sprint-mejor") || 0));
  const st = useRef({ clics: 0, jugando: false });

  function empezar() {
    st.current = { clics: 0, jugando: true };
    setClics(0); setTiempo(10); setJugando(true);
    sfx.clic();
  }

  useEffect(() => {
    if (!jugando) return;
    if (tiempo <= 0) {
      st.current.jugando = false;
      setJugando(false);
      const c = st.current.clics;
      setMejor(m => {
        const nm = c > m ? c : m;
        localStorage.setItem("arcade-sprint-mejor", String(nm));
        return nm;
      });
      if (c > 0) sfx.bien();
      registrarPunt(c, c >= 60 ? 1 : 0);
      return;
    }
    const id = setTimeout(() => setTiempo(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [jugando, tiempo]); // eslint-disable-line react-hooks/exhaustive-deps

  function tocar() {
    if (!st.current.jugando) { empezar(); return; }
    st.current.clics += 1;
    setClics(st.current.clics);
  }

  return (
    <GameShell titulo="Sprint de Clics" emoji="👆"
      descripcion="Toca el botón sin parar durante 10 segundos · 60+ es victoria."
      tira="linear-gradient(90deg,#22d3ee,#ff3d5a)" iconoFondo="linear-gradient(135deg,#22d3ee,#ff3d5a)">
      <div className="fila-botones" style={{ marginTop: 0 }}>
        <span className="chip">⏱ <b>{tiempo}s</b></span>
        <span className="chip">Clics: <b>{clics}</b></span>
        {mejor > 0 && <span className="chip">🏆 Mejor: <b>{mejor}</b></span>}
      </div>
      <button onClick={tocar}
        style={{ fontSize: "4rem", padding: "30px 0", borderRadius: 16, width: "100%",
          background: jugando ? "linear-gradient(135deg,#ff3d5a,#ff9a3d)" : "var(--bg-hover)",
          color: "white", fontWeight: 800 }}>
        {jugando ? "¡Toca! 👆" : "▶ Empezar"}
      </button>
      <p style={{ textAlign: "center", color: "var(--texto-suave)" }}>
        {(clics / Math.max(1, 10 - tiempo)).toFixed(1)} toques/segundo
      </p>
      {mensaje && <div className={`mensaje-final ${tipo}`}>{mensaje}</div>}
    </GameShell>
  );
}
