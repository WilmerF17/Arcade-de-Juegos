import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro } from "../ui/GameShell";
import { escribiendo } from "../suite/teclado";
import { sfx } from "../suite/sonido";

const TECLAS = ["d", "f", "j", "k"];
const COLORES = ["#ef4444", "#facc15", "#22c55e", "#38bdf8"];
export default function Piano() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Teclas Ritmo");
  const [notas, setNotas] = useState([]);
  const [puntos, setPuntos] = useState(0);
  const [fallos, setFallos] = useState(0);
  const [tiempo, setTiempo] = useState(30);
  const [jugando, setJugando] = useState(false);
  const idRef = useRef(0);
  const st = useRef({ puntos: 0, jugando: false });
  st.current.puntos = puntos; st.current.jugando = jugando;

  function empezar() {
    setNotas([]); setPuntos(0); st.current.puntos = 0;
    setFallos(0); setTiempo(30); setJugando(true); st.current.jugando = true;
  }
  useEffect(() => {
    if (!jugando) return;
    if (tiempo <= 0) {
      setJugando(false); st.current.jugando = false;
      registrarPunt(st.current.puntos, st.current.puntos >= 300 ? 1 : 0);
      sfx.record();
      return;
    }
    const id = setTimeout(() => setTiempo(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [jugando, tiempo, registrarPunt]);

  useEffect(() => {
    if (!jugando) return;
    const id = setInterval(() => {
      const n = { id: idRef.current++, col: Math.floor(Math.random() * 4), y: -1 };
      setNotas(ns => [...ns.slice(-14), n]);
    }, 420);
    return () => clearInterval(id);
  }, [jugando]);

  useEffect(() => {
    if (!jugando) return;
    const id = setInterval(() => {
      setNotas(ns => {
        const mv = ns.map(n => ({ ...n, y: n.y + 1 })).filter(n => {
          if (n.y >= 6) { setFallos(f => f + 1); st.current.puntos = Math.max(0, st.current.puntos - 5); setPuntos(st.current.puntos); sfx.mal(); return false; }
          return true;
        });
        return mv;
      });
    }, 260);
    return () => clearInterval(id);
  }, [jugando]);

  function tocar(col) {
    if (!st.current.jugando) return;
    let hit = false;
    setNotas(ns => {
      const idx = ns.findIndex(n => n.col === col && n.y >= 3);
      if (idx >= 0) { hit = true; const c = [...ns]; c.splice(idx, 1); return c; }
      return ns;
    });
    setTimeout(() => {
      if (hit) { st.current.puntos += 10; setPuntos(st.current.puntos); sfx.bien(); }
      else { setFallos(f => f + 1); st.current.puntos = Math.max(0, st.current.puntos - 3); setPuntos(st.current.puntos); }
    }, 0);
  }
  const tocarRef = useRef(tocar); tocarRef.current = tocar;

  useEffect(() => {
    const fn = e => {
      if (escribiendo()) return;
      const k = e.key.toLowerCase();
      const mapa = { d: 0, f: 1, j: 2, k: 3, 1: 0, 2: 1, 3: 2, 4: 3, arrowleft: 0, arrowdown: 1, arrowup: 2, arrowright: 3 };
      const c = mapa[k] ?? mapa[e.key];
      if (c != null) { e.preventDefault(); tocarRef.current(c); }
      else if (e.key === "Enter" && !st.current.jugando) empezar();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <GameShell titulo="Teclas Ritmo" emoji="🎹" descripcion="D F J K (o 1-4 / flechas) · toca las fichas al llegar abajo · 30s.">
      <div className="fila-botones" style={{ marginTop: 0 }}>
        <button className="btn-principal" onClick={empezar}>{jugando ? "Reiniciar" : "▶ Jugar"}</button>
        <span className="chip">Puntos <b>{puntos}</b></span>
        <span className="chip">⏱️ <b>{tiempo}s</b></span>
        <span className="chip">❌ <b>{fallos}</b></span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,80px)", gap: 4, marginTop: 14, background: "#0b0d14", padding: 8, borderRadius: 12, width: "max-content" }}>
        {Array.from({ length: 24 }, (_, i) => {
          const r = Math.floor(i / 4), c = i % 4;
          const nota = notas.find(n => n.col === c && n.y === r);
          return (
            <div key={i} onClick={() => tocar(c)}
              style={{ width: 80, height: 44, borderRadius: 8, background: nota ? COLORES[c] : "rgba(255,255,255,.04)", boxShadow: nota ? `0 0 14px ${COLORES[c]}` : undefined, cursor: "pointer", display: "grid", placeItems: "center", fontWeight: 800, color: "#000" }}>
              {r === 5 ? TECLAS[c].toUpperCase() : ""}
            </div>
          );
        })}
      </div>
      {mensaje && !jugando && tiempo <= 0 && <div className={`mensaje-final ${tipo}`}>{mensaje}</div>}
    </GameShell>
  );
}
