import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro } from "../ui/GameShell";
import { sfx } from "../suite/sonido";
import { escribiendo } from "../suite/teclado";

/* Torre Equilibrio: detén el marcador en la zona verde. 10 pisos, la zona se achica. */
export default function Equilibrio() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Torre Equilibrio");
  const [pos, setPos] = useState(0);
  const [piso, setPiso] = useState(0);
  const [fallos, setFallos] = useState(0);
  const [jugando, setJugando] = useState(false);
  const [puntos, setPuntos] = useState(0);
  const dir = useRef(1);
  const st = useRef({ piso: 0, fallos: 0, puntos: 0, jugando: false });

  const zona = Math.max(6, 14 - st.current.piso); // semi-ancho de la zona verde
  const centro = 50;

  useEffect(() => {
    if (!jugando) return;
    const id = setInterval(() => {
      setPos(p => {
        let n = p + dir.current * (3 + st.current.piso * 0.7);
        if (n >= 100) { n = 100; dir.current = -1; }
        if (n <= 0) { n = 0; dir.current = 1; }
        return n;
      });
    }, 30);
    return () => clearInterval(id);
  }, [jugando]);

  function empezar() {
    st.current = { piso: 0, fallos: 0, puntos: 0, jugando: true };
    setPiso(0); setFallos(0); setPuntos(0); setPos(0); dir.current = 1;
    setJugando(true);
    sfx.clic();
  }

  function fijar() {
    if (!st.current.jugando) { empezar(); return; }
    const p = pos;
    const ok = Math.abs(p - centro) <= zona;
    if (ok) {
      const bonus = Math.round(zona - Math.abs(p - centro));
      const gana = 100 + bonus * 5;
      const np = st.current.puntos + gana;
      const npi = st.current.piso + 1;
      st.current.puntos = np; st.current.piso = npi;
      setPuntos(np); setPiso(npi);
      sfx.moneda();
      if (npi >= 10) {
        st.current.jugando = false; setJugando(false);
        registrarPunt(np, 1);
      }
    } else {
      const nf = st.current.fallos + 1;
      st.current.fallos = nf; setFallos(nf);
      sfx.mal();
      if (nf >= 3) {
        st.current.jugando = false; setJugando(false);
        registrarPunt(st.current.puntos, 0);
      }
    }
  }

  const fijarRef = useRef(fijar);
  fijarRef.current = fijar;
  useEffect(() => {
    const fn = e => {
      if (escribiendo()) return;
      if (e.key === " " || e.key === "Enter") { e.preventDefault(); fijarRef.current(); }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  return (
    <GameShell titulo="Torre Equilibrio" emoji="🏗️"
      descripcion="ESPACIO/clic para fijar el piso en la zona verde · 10 pisos · 3 fallos."
      tira="linear-gradient(90deg,#ff3d5a,#ff9a3d,#22c55e)" iconoFondo="linear-gradient(135deg,#ff3d5a,#ff9a3d)">
      <div className="fila-botones" style={{ marginTop: 0 }}>
        <span className="chip">Piso: <b>{piso}/10</b></span>
        <span className="chip">Puntos: <b>{puntos}</b></span>
        <span className="chip">Fallos: <b>{fallos}/3</b></span>
      </div>
      <div onClick={fijar} style={{ background: "var(--bg-soft)", border: "1px solid var(--border)", borderRadius: 12, padding: 18, cursor: "pointer", userSelect: "none" }}>
        <div style={{ position: "relative", height: 34, background: "#0b0d16", borderRadius: 8, overflow: "hidden" }}>
          <div style={{ position: "absolute", left: `${centro - zona}%`, width: `${zona * 2}%`, top: 0, bottom: 0, background: "rgba(34,197,94,.45)", borderLeft: "2px solid #22c55e", borderRight: "2px solid #22c55e" }} />
          <div style={{ position: "absolute", left: `calc(${pos}% - 3px)`, top: 2, bottom: 2, width: 6, background: "#ff3d5a", borderRadius: 3 }} />
        </div>
        <p style={{ textAlign: "center", color: "var(--texto-suave)", margin: "10px 0 0" }}>
          {jugando ? "¡Fija en el verde!" : "Pulsa para empezar"}
        </p>
      </div>
      <div className="fila-botones">
        {!jugando && <button className="btn-principal" onClick={empezar}>▶ Empezar</button>}
        {jugando && <button className="btn-principal" onClick={fijar}>🔒 Fijar piso</button>}
      </div>
      {mensaje && <div className={`mensaje-final ${tipo}`}>{mensaje}</div>}
    </GameShell>
  );
}
