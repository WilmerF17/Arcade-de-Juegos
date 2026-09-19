import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro } from "../ui/GameShell";
import { sfx } from "../suite/sonido";
import { escribiendo } from "../suite/teclado";

/* Pulso Neón: toca justo cuando la barra entra en la ventana dorada. 15 pulsos. */
export default function Pulso() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Pulso Neón");
  const [pos, setPos] = useState(0);
  const [objetivo, setObjetivo] = useState(60);
  const [turno, setTurno] = useState(0);
  const [puntos, setPuntos] = useState(0);
  const [jugando, setJugando] = useState(false);
  const st = useRef({ turno: 0, puntos: 0, jugando: false, objetivo: 60 });
  const posRef = useRef(0);
  posRef.current = pos;

  const VENTANA = 7;

  useEffect(() => {
    if (!jugando) return;
    const id = setInterval(() => {
      setPos(p => {
        const n = p + 2.4;
        return n >= 100 ? 0 : n;
      });
    }, 30);
    return () => clearInterval(id);
  }, [jugando]);

  function empezar() {
    st.current = { turno: 0, puntos: 0, jugando: true, objetivo: 30 + Math.random() * 55 };
    setTurno(0); setPuntos(0); setObjetivo(st.current.objetivo); setPos(0);
    setJugando(true);
    sfx.clic();
  }

  function tocar() {
    if (!st.current.jugando) { empezar(); return; }
    const d = Math.abs(posRef.current - st.current.objetivo);
    const acierto = Math.max(0, Math.round(100 - d * 4));
    const gana = d <= VENTANA ? 100 + acierto : Math.round(acierto / 2);
    st.current.puntos += gana;
    setPuntos(st.current.puntos);
    if (d <= VENTANA) sfx.bien(); else sfx.clic();
    const nt = st.current.turno + 1;
    st.current.turno = nt;
    setTurno(nt);
    if (nt >= 15) {
      st.current.jugando = false;
      setJugando(false);
      registrarPunt(st.current.puntos, st.current.puntos >= 1200 ? 1 : 0);
    } else {
      st.current.objetivo = 20 + Math.random() * 65;
      setObjetivo(st.current.objetivo);
    }
  }

  const tocarRef = useRef(tocar);
  tocarRef.current = tocar;
  useEffect(() => {
    const fn = e => {
      if (escribiendo()) return;
      if (e.key === " " || e.key === "Enter") { e.preventDefault(); tocarRef.current(); }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  return (
    <GameShell titulo="Pulso Neón" emoji="💓"
      descripcion="ESPACIO/clic cuando la barra pase por la ventana dorada · 15 pulsos."
      tira="linear-gradient(90deg,#ff3d5a,#ff9a3d)" iconoFondo="linear-gradient(135deg,#ff3d5a,#7c3aed)">
      <div className="fila-botones" style={{ marginTop: 0 }}>
        <span className="chip">Pulso: <b>{turno}/15</b></span>
        <span className="chip">Puntos: <b>{puntos}</b></span>
      </div>
      <div onClick={tocar} style={{ background: "var(--bg-soft)", border: "1px solid var(--border)", borderRadius: 12, padding: 18, cursor: "pointer", userSelect: "none" }}>
        <div style={{ position: "relative", height: 30, background: "#0b0d16", borderRadius: 8, overflow: "hidden" }}>
          <div style={{ position: "absolute", left: `${objetivo - VENTANA}%`, width: `${VENTANA * 2}%`, top: 0, bottom: 0, background: "rgba(255,154,61,.5)", borderLeft: "2px solid #ff9a3d", borderRight: "2px solid #ff9a3d" }} />
          <div style={{ position: "absolute", left: `calc(${pos}% - 2px)`, top: 0, bottom: 0, width: 5, background: "#22d3ee", borderRadius: 3, boxShadow: "0 0 10px #22d3ee" }} />
        </div>
        <p style={{ textAlign: "center", color: "var(--texto-suave)", margin: "10px 0 0" }}>
          {jugando ? "¡Toca en el dorado!" : "Pulsa para empezar"}
        </p>
      </div>
      <div className="fila-botones">
        {!jugando && <button className="btn-principal" onClick={empezar}>▶ Empezar</button>}
        {jugando && <button className="btn-principal" onClick={tocar}>⚡ ¡Ahora!</button>}
      </div>
      {mensaje && <div className={`mensaje-final ${tipo}`}>{mensaje}</div>}
    </GameShell>
  );
}
