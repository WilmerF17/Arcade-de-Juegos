import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro } from "../ui/GameShell";
import { escribiendo } from "../suite/teclado";
import { sfx } from "../suite/sonido";

export default function Zombies() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Defensa Zombie");
  const areaRef = useRef(null);
  const [zombies, setZombies] = useState([]);
  const [puntos, setPuntos] = useState(0);
  const [oleada, setOleada] = useState(1);
  const [vidas, setVidas] = useState(5);
  const [balas, setBalas] = useState(12);
  const [jugando, setJugando] = useState(false);
  const idRef = useRef(0);
  const st = useRef({ puntos: 0, oleada: 1, vidas: 5, balas: 12 });
  st.current = { puntos, oleada, vidas, balas };

  function empezar() {
    setZombies([]); setPuntos(0); setOleada(1); setVidas(5); setBalas(12);
    st.current = { puntos: 0, oleada: 1, vidas: 5, balas: 12 };
    setJugando(true);
  }
  useEffect(() => {
    if (!jugando) return;
    if (st.current.vidas <= 0) {
      setJugando(false); setZombies([]);
      registrarPunt(st.current.puntos, st.current.oleada >= 4 ? 1 : 0);
      sfx.record();
      return;
    }
    const id = setInterval(() => {
      const lado = Math.floor(Math.random() * 4);
      const pos = Math.random() * 100;
      const z = lado === 0 ? { id: idRef.current++, x: pos, y: -6 }
        : lado === 1 ? { id: idRef.current++, x: pos, y: 106 }
        : lado === 2 ? { id: idRef.current++, x: -6, y: pos }
        : { id: idRef.current++, x: 106, y: pos };
      setZombies(zs => [...zs.slice(-(6 + st.current.oleada * 2)), { ...z, pv: 1 + Math.floor(st.current.oleada / 3) }]);
    }, Math.max(350, 1100 - st.current.oleada * 120));
    return () => clearInterval(id);
  }, [jugando, oleada, vidas]);
  useEffect(() => {
    if (!jugando) return;
    const id = setInterval(() => {
      setZombies(zs => zs.map(z => ({
        ...z,
        x: z.x + (50 - z.x) * 0.02 * (1 + st.current.oleada * 0.15),
        y: z.y + (50 - z.y) * 0.02 * (1 + st.current.oleada * 0.15),
      })).filter(z => {
        if (Math.hypot(z.x - 50, z.y - 50) < 7) {
          st.current.vidas -= 1; setVidas(st.current.vidas);
          sfx.mal();
          return false;
        }
        return true;
      }));
    }, 60);
    return () => clearInterval(id);
  }, [jugando, oleada]);
  function disparar(id, e) {
    e.stopPropagation();
    if (!jugando) return;
    if (st.current.balas <= 0) { sfx.mal(); return; }
    st.current.balas -= 1; setBalas(st.current.balas);
    sfx.clic();
    setZombies(zs => {
      const z = zs.find(x => x.id === id);
      if (!z) return zs;
      if (z.pv > 1) return zs.map(x => (x.id === id ? { ...x, pv: x.pv - 1 } : x));
      st.current.puntos += 10 + st.current.oleada * 2; setPuntos(st.current.puntos);
      if (st.current.puntos >= st.current.oleada * 120) {
        st.current.oleada += 1; setOleada(st.current.oleada);
        st.current.balas = 12; setBalas(12);
        sfx.record();
      } else sfx.bien();
      return zs.filter(x => x.id !== id);
    });
  }
  function recargar() {
    if (!jugando || st.current.balas > 0) return;
    st.current.balas = 12; setBalas(12); sfx.clic();
  }
  const empezarRef = useRef(empezar); empezarRef.current = empezar;
  const recargarRef = useRef(recargar); recargarRef.current = recargar;
  useEffect(() => {
    const fn = e => {
      if (escribiendo()) return;
      if ((e.key === "Enter") && !jugando) empezarRef.current();
      if ((e.key === "r" || e.key === "R") && jugando) recargarRef.current();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [jugando, balas]);
  return (
    <GameShell titulo="Defensa Zombie" emoji="🧟" descripcion="Clic dispara · R recarga · no dejes que lleguen al centro.">
      <div className="fila-botones" style={{ marginTop: 0 }}>
        <button className="btn-principal" onClick={empezar}>{jugando ? "Reiniciar" : "▶ Jugar"}</button>
        <button className="btn-suave" onClick={recargar} disabled={balas > 0}>🔄 Recargar (R)</button>
        <span className="chip">Puntos <b>{puntos}</b></span>
        <span className="chip">🌊 Oleada <b>{oleada}</b></span>
        <span className="chip">❤️ <b>{vidas}</b></span>
        <span className="chip">🔫 <b>{balas}/12</b></span>
      </div>
      <div style={{ position: "relative", height: 360, marginTop: 14, background: "radial-gradient(circle at 50% 50%, #1a2b1a, #0b0d14 70%)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", fontSize: "2.4rem" }}>🏠</div>
        {zombies.map(z => (
          <div key={z.id} onClick={e => disparar(z.id, e)}
            style={{ position: "absolute", left: `${z.x}%`, top: `${z.y}%`, transform: "translate(-50%,-50%)", fontSize: "1.8rem", cursor: "crosshair", filter: z.pv > 1 ? "drop-shadow(0 0 8px red)" : undefined }}>
            🧟{z.pv > 1 ? "🛡️" : ""}
          </div>
        ))}
        {!jugando && zombies.length === 0 && <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "var(--texto-suave)" }}>Pulsa Jugar · defiende la casa 🏠</div>}
      </div>
      {mensaje && !jugando && <div className={`mensaje-final ${tipo}`}>{mensaje}</div>}
    </GameShell>
  );
}
