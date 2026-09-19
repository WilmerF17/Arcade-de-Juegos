import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro } from "../ui/GameShell";
import { sfx } from "../suite/sonido";

/* Salto Largo: mantén para cargar, suelta en la zona verde. 5 saltos. */
export default function SaltoLargo() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Salto Largo");
  const [pot, setPot] = useState(0);
  const [cargando, setCargando] = useState(false);
  const [objetivo, setObjetivo] = useState(65);
  const [salto, setSalto] = useState(0);
  const [puntos, setPuntos] = useState(0);
  const [jugando, setJugando] = useState(false);
  const st = useRef({ salto: 0, puntos: 0, jugando: false, objetivo: 65 });
  const potRef = useRef(0);
  potRef.current = pot;

  function empezar() {
    st.current = { salto: 0, puntos: 0, jugando: true, objetivo: 40 + Math.random() * 45 };
    setSalto(0); setPuntos(0); setPot(0);
    setObjetivo(st.current.objetivo); setJugando(true);
    sfx.clic();
  }

  useEffect(() => {
    if (!cargando) return;
    const id = setInterval(() => {
      setPot(p => {
        const n = p + 2.5;
        return n >= 100 ? 0 : n;
      });
    }, 30);
    return () => clearInterval(id);
  }, [cargando]);

  function presionar() {
    if (!st.current.jugando) { empezar(); return; }
    setPot(0);
    setCargando(true);
  }

  function soltar() {
    if (!cargando || !st.current.jugando) return;
    setCargando(false);
    const p = potRef.current;
    const d = Math.abs(p - st.current.objetivo);
    const gana = d <= 6 ? 200 : d <= 15 ? 100 : Math.max(10, 60 - Math.round(d));
    st.current.puntos += gana;
    setPuntos(st.current.puntos);
    if (d <= 6) sfx.bien(); else sfx.clic();
    const ns = st.current.salto + 1;
    st.current.salto = ns;
    setSalto(ns);
    setPot(0);
    if (ns >= 5) {
      st.current.jugando = false;
      setJugando(false);
      registrarPunt(st.current.puntos, st.current.puntos >= 600 ? 1 : 0);
    } else {
      st.current.objetivo = 30 + Math.random() * 55;
      setObjetivo(st.current.objetivo);
    }
  }

  return (
    <GameShell titulo="Salto Largo" emoji="🦘"
      descripcion="Mantén para cargar y suelta en verde · 5 saltos."
      tira="linear-gradient(90deg,#84cc16,#22c55e)" iconoFondo="linear-gradient(135deg,#84cc16,#22c55e)">
      <div className="fila-botones" style={{ marginTop: 0 }}>
        <span className="chip">Salto: <b>{salto}/5</b></span>
        <span className="chip">Puntos: <b>{puntos}</b></span>
      </div>
      <div style={{ position: "relative", height: 36, background: "#0b0d16", borderRadius: 8, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: `${objetivo - 6}%`, width: "12%", top: 0, bottom: 0, background: "rgba(34,197,94,.5)", borderLeft: "2px solid #22c55e", borderRight: "2px solid #22c55e" }} />
        <div style={{ position: "absolute", left: 0, width: `${pot}%`, top: 0, bottom: 0, background: "linear-gradient(90deg,#84cc16,#facc15,#ff3d5a)" }} />
      </div>
      <button
        onMouseDown={presionar} onMouseUp={soltar} onMouseLeave={() => cargando && soltar()}
        onTouchStart={e => { e.preventDefault(); presionar(); }} onTouchEnd={e => { e.preventDefault(); soltar(); }}
        style={{ fontSize: "1.6rem", padding: "22px 0", borderRadius: 16, width: "100%", fontWeight: 800,
          background: cargando ? "linear-gradient(135deg,#facc15,#ff3d5a)" : "var(--bg-hover)", color: "white" }}>
        {jugando ? (cargando ? "¡SUELTA!" : "MANTÉN…") : "▶ Empezar"}
      </button>
      {mensaje && <div className={`mensaje-final ${tipo}`}>{mensaje}</div>}
    </GameShell>
  );
}
