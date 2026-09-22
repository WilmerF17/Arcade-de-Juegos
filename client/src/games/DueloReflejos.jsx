import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { sfx } from "../suite/sonido";
import { escribiendo } from "../suite/teclado";

/* Duelo de Reflejos: J1 (A) vs J2 (L). Al verde, el más rápido gana el punto. */
function DueloBase({ titulo, rondas, tira, iconoFondo }) {
  const { mensaje, tipo, registrarPunt } = useRegistro(titulo);
  const [fase, setFase] = useState("espera");
  const [p1, setP1] = useState(0);
  const [p2, setP2] = useState(0);
  const [ronda, setRonda] = useState(0);
  const [jugando, setJugando] = useState(false);
  const faseRef = useRef("espera");
  const st = useRef({ p1: 0, p2: 0, ronda: 0, jugando: false });
  const timer = useRef(null);

  function empezar() {
    st.current = { p1: 0, p2: 0, ronda: 0, jugando: true };
    setP1(0); setP2(0); setRonda(0); setJugando(true);
    siguiente();
    sfx.clic();
  }

  function siguiente() {
    setFase("listo"); faseRef.current = "listo";
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setFase("ya"); faseRef.current = "ya";
      sfx.salto();
    }, 1200 + Math.random() * 2800);
  }

  function terminar() {
    st.current.jugando = false;
    setJugando(false);
    setFase("fin"); faseRef.current = "fin";
    clearTimeout(timer.current);
    const gano1 = st.current.p1 > st.current.p2;
    registrarPunt(st.current.p1 * 100 + st.current.ronda * 10, gano1 ? 1 : 0);
  }

  function pulsar(j) {
    if (!st.current.jugando) { if (faseRef.current !== "ya") empezar(); return; }
    if (faseRef.current === "listo") {
      // salida en falso: punto al rival
      if (j === 1) { st.current.p2++; setP2(st.current.p2); }
      else { st.current.p1++; setP1(st.current.p1); }
      sfx.mal();
      avanzar();
      return;
    }
    if (faseRef.current === "ya") {
      if (j === 1) { st.current.p1++; setP1(st.current.p1); }
      else { st.current.p2++; setP2(st.current.p2); }
      sfx.bien();
      avanzar();
    }
  }

  function avanzar() {
    const nr = st.current.ronda + 1;
    st.current.ronda = nr;
    setRonda(nr);
    if (nr >= rondas) terminar();
    else { setFase("entre"); faseRef.current = "entre"; setTimeout(() => { if (st.current.jugando) siguiente(); }, 1000); }
  }

  const pulsarRef = useRef(pulsar);
  pulsarRef.current = pulsar;
  useEffect(() => {
    const fn = e => {
      if (escribiendo()) return;
      const k = e.key.toLowerCase();
      if (k === "a") pulsarRef.current(1);
      if (k === "l") pulsarRef.current(2);
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);
  useEffect(() => () => clearTimeout(timer.current), []);

  const lider = p1 === p2 ? "Empate" : p1 > p2 ? "Va ganando J1 🔵" : "Va ganando J2 🔴";

  return (
    <GameShell titulo={titulo} emoji="⚡"
      descripcion={`J1 pulsa A · J2 pulsa L · solo en verde · ${rondas} rondas · ¡salir antes regala el punto!`}
      tira={tira} iconoFondo={iconoFondo}>
      <div className="fila-botones">
        <span className="chip">🔵 J1: <b>{p1}</b></span>
        <span className="chip">Ronda: <b>{ronda}/{rondas}</b></span>
        <span className="chip">🔴 J2: <b>{p2}</b></span>
      </div>
      <div style={{ background: fase === "ya" ? "#22c55e" : fase === "listo" ? "#ef4444" : "var(--bg-soft)",
        borderRadius: 14, padding: 26, textAlign: "center", fontSize: "1.4rem", fontWeight: 800, color: fase === "espera" ? "var(--texto)" : "white" }}>
        {fase === "espera" && "Pulsa para empezar"}
        {fase === "listo" && "Espera el verde…"}
        {fase === "ya" && "¡YA!"}
        {fase === "entre" && lider}
        {fase === "fin" && (p1 === p2 ? "🤝 ¡Empate!" : p1 > p2 ? "🏆 ¡Gana J1!" : "🏆 ¡Gana J2!")}
      </div>
      <div className="fila-botones">
        <button className="btn-principal" style={{ flex: 1, padding: "18px" }} onClick={() => pulsar(1)}>🔵 J1 (A)</button>
        <button className="btn-peligro" style={{ flex: 1, padding: "18px" }} onClick={() => pulsar(2)}>🔴 J2 (L)</button>
      </div>
      <Resultado mensaje={mensaje} tipo={tipo} />
    </GameShell>
  );
}

export function DueloReflejos() {
  return <DueloBase titulo="Duelo de Reflejos" rondas={5} tira="linear-gradient(90deg,#22d3ee,#ff3d5a)" iconoFondo="linear-gradient(135deg,#22d3ee,#ff3d5a)" />;
}
export function DueloLargo() {
  return <DueloBase titulo="Duelo Largo" rondas={9} tira="linear-gradient(90deg,#a855f7,#ff3d5a)" iconoFondo="linear-gradient(135deg,#a855f7,#ff3d5a)" />;
}
