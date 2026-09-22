import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { escribiendo } from "../suite/teclado";
import { sfx } from "../suite/sonido";

export default function Aim() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Aim Trainer");
  const [blanco, setBlanco] = useState(null);
  const [puntos, setPuntos] = useState(0);
  const [disparos, setDisparos] = useState(0);
  const [aciertos, setAciertos] = useState(0);
  const [tiempos, setTiempos] = useState([]);
  const [tiempo, setTiempo] = useState(30);
  const [jugando, setJugando] = useState(false);
  const t0 = useRef(0);
  const st = useRef({ puntos: 0, aciertos: 0, disparos: 0, tiempos: [] });
  const areaRef = useRef(null);

  function nuevoBlanco() {
    setBlanco({ x: 8 + Math.random() * 84, y: 12 + Math.random() * 76, t: Date.now() });
    t0.current = performance.now();
  }
  function empezar() {
    st.current = { puntos: 0, aciertos: 0, disparos: 0, tiempos: [] };
    setPuntos(0); setDisparos(0); setAciertos(0); setTiempos([]);
    setTiempo(30); setJugando(true); nuevoBlanco();
  }
  useEffect(() => {
    if (!jugando) return;
    if (tiempo <= 0) {
      setJugando(false); setBlanco(null);
      const p = st.current.puntos;
      registrarPunt(p, st.current.aciertos >= 20 ? 1 : 0);
      sfx.record();
      return;
    }
    const id = setTimeout(() => setTiempo(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [jugando, tiempo, registrarPunt]);

  function clicZona() {
    if (!jugando) return;
    st.current.disparos += 1; setDisparos(st.current.disparos);
    sfx.mal();
  }
  function clicBlanco(e) {
    if (!jugando) return;
    e.stopPropagation();
    const ms = Math.round(performance.now() - t0.current);
    st.current.aciertos += 1; setAciertos(st.current.aciertos);
    st.current.disparos += 1; setDisparos(st.current.disparos);
    st.current.puntos += Math.max(5, 25 - Math.floor(ms / 60));
    setPuntos(st.current.puntos);
    st.current.tiempos = [...st.current.tiempos, ms];
    setTiempos(st.current.tiempos);
    sfx.bien();
    nuevoBlanco();
  }
  const empezarRef = useRef(empezar); empezarRef.current = empezar;
  useEffect(() => {
    const fn = e => {
      if (escribiendo()) return;
      if (e.key === "Enter" && !jugando) empezarRef.current();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [jugando]);

  const prec = disparos ? Math.round((aciertos / disparos) * 100) : 0;
  const media = tiempos.length ? Math.round(tiempos.reduce((a, b) => a + b, 0) / tiempos.length) : 0;
  return (
    <GameShell titulo="Aim Trainer" emoji="🎯" descripcion="ENTER empezar · clic en el blanco · 30s · precisión.">
      <div className="fila-botones">
        <button className="btn-principal" onClick={empezar}>{jugando ? "Reiniciar" : "▶ Jugar"}</button>
        <span className="chip">Puntos <b>{puntos}</b></span>
        <span className="chip">🎯 <b>{aciertos}/{disparos}</b> ({prec}%)</span>
        <span className="chip">⏱️ <b>{tiempo}s</b></span>
        {media > 0 && <span className="chip">📊 <b>{media}ms</b></span>}
      </div>
      <div ref={areaRef} onClick={clicZona} style={{ position: "relative", height: 340, marginTop: 14, background: "#0b0d14", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden", cursor: "crosshair" }}>
        {!jugando && !blanco && <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "var(--texto-suave)" }}>Pulsa Jugar y revienta blancos 🎯</div>}
        {blanco && jugando && (
          <div onClick={clicBlanco} style={{ position: "absolute", left: `${blanco.x}%`, top: `${blanco.y}%`, width: 54, height: 54, marginLeft: -27, marginTop: -27, borderRadius: "50%", background: "radial-gradient(circle,#ef4444 0 30%,#fff 30% 55%,#ef4444 55% 100%)", border: "3px solid #fff", boxShadow: "0 0 18px rgba(239,68,68,.7)", cursor: "crosshair", animation: "pop .15s" }} />
        )}
      </div>
      <Resultado mensaje={mensaje} tipo={tipo} />
    </GameShell>
  );
}
