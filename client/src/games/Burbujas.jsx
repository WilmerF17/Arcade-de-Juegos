import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro } from "../ui/GameShell";
import { escribiendo } from "../suite/teclado";
import { sfx } from "../suite/sonido";

const EMOJIS = ["🫧", "🎈", "⭐", "💎"];
export default function Burbujas() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Cazaburbujas");
  const areaRef = useRef(null);
  const [burbujas, setBurbujas] = useState([]);
  const [puntos, setPuntos] = useState(0);
  const [combo, setCombo] = useState(0);
  const [tiempo, setTiempo] = useState(45);
  const [jugando, setJugando] = useState(false);
  const idRef = useRef(0);
  const st = useRef({ puntos: 0, combo: 0 });
  st.current.puntos = puntos; st.current.combo = combo;

  function empezar() {
    setBurbujas([]); setPuntos(0); st.current.puntos = 0;
    setCombo(0); st.current.combo = 0;
    setTiempo(45); setJugando(true);
  }
  useEffect(() => {
    if (!jugando) return;
    if (tiempo <= 0) {
      setJugando(false); setBurbujas([]);
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
      const b = { id: idRef.current++, x: 5 + Math.random() * 90, y: 105, v: 1 + Math.random() * 2, e: EMOJIS[Math.random() < 0.08 ? 3 : Math.floor(Math.random() * 3)], size: 34 + Math.random() * 22 };
      setBurbujas(bs => [...bs.slice(-16), b]);
    }, 550);
    return () => clearInterval(id);
  }, [jugando]);
  useEffect(() => {
    if (!jugando) return;
    const id = setInterval(() => {
      setBurbujas(bs => bs.map(b => ({ ...b, y: b.y - b.v })).filter(b => {
        if (b.y < -8) {
          if (b.e !== "💣") { st.current.combo = 0; setCombo(0); }
          return false;
        }
        return true;
      }));
    }, 40);
    return () => clearInterval(id);
  }, [jugando]);
  function reventar(id, e, esBomba) {
    if (!jugando) return;
    e.stopPropagation();
    setBurbujas(bs => bs.filter(b => b.id !== id));
    if (esBomba) {
      st.current.puntos = Math.max(0, st.current.puntos - 20); setPuntos(st.current.puntos);
      st.current.combo = 0; setCombo(0); sfx.mal();
    } else {
      const c = st.current.combo + 1;
      st.current.combo = c; setCombo(c);
      const g = 10 + Math.min(20, c * 2);
      st.current.puntos += g; setPuntos(st.current.puntos);
      sfx.bien();
    }
  }
  const empezarRef = useRef(empezar); empezarRef.current = empezar;
  useEffect(() => {
    const fn = ev => { if (!escribiendo() && ev.key === "Enter" && !jugando) empezarRef.current(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [jugando]);

  return (
    <GameShell titulo="Cazaburbujas" emoji="🫧" descripcion="Clic en burbujas 45s · combo × · evita 💣.">
      <div className="fila-botones" style={{ marginTop: 0 }}>
        <button className="btn-principal" onClick={empezar}>{jugando ? "Reiniciar" : "▶ Jugar"}</button>
        <span className="chip">Puntos <b>{puntos}</b></span>
        <span className="chip">🔥 <b>×{combo}</b></span>
        <span className="chip">⏱️ <b>{tiempo}s</b></span>
      </div>
      <div ref={areaRef} style={{ position: "relative", height: 360, marginTop: 14, background: "linear-gradient(180deg,#0a1a2e,#0d2b3a)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
        {!jugando && burbujas.length === 0 && <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "var(--texto-suave)" }}>Pulsa Jugar y revienta 🫧 · no toques 💣</div>}
        {jugando && <div style={{ position: "absolute", inset: 0 }} onClick={() => { st.current.combo = 0; setCombo(0); }} />}
        {burbujas.map(b => (
          <div key={b.id} onClick={e => reventar(b.id, e, b.e === "💣")}
            style={{ position: "absolute", left: `${b.x}%`, bottom: `${b.y * 3}px`, fontSize: b.size, cursor: "pointer", animation: "pop .15s", filter: b.e === "💎" ? "drop-shadow(0 0 10px gold)" : undefined }}>
            {b.e === "💣" ? "💣" : b.e}
          </div>
        ))}
      </div>
      {mensaje && !jugando && <div className={`mensaje-final ${tipo}`}>{mensaje}</div>}
    </GameShell>
  );
}
