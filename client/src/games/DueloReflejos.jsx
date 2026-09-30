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
  const [n1, setN1] = useState("J1");
  const [n2, setN2] = useState("J2");
  const [meta, setMeta] = useState(null);
  const rondasEff = meta || rondas;
  const [jugando, setJugando] = useState(false);
  const faseRef = useRef("espera");
  const st = useRef({ p1: 0, p2: 0, ronda: 0, jugando: false });
  const timer = useRef(null);
  const jugandoRef = useRef(false);
  jugandoRef.current = jugando;

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
    if (st.current.p1 !== st.current.p2) sfx.record();
    else sfx.moneda();
    registrarPunt(st.current.p1 * 100 + st.current.ronda * 10, gano1 ? 1 : 0);
  }

  function pulsar(j) {
    if (!st.current.jugando) return;
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
    if (nr >= rondasEff) terminar();
    else { setFase("entre"); faseRef.current = "entre"; setTimeout(() => { if (st.current.jugando) siguiente(); }, 1000); }
  }

  const pulsarRef = useRef(pulsar);
  pulsarRef.current = pulsar;
  const empezarRef = useRef(empezar);
  empezarRef.current = empezar;
  useEffect(() => {
    const fn = e => {
      if (escribiendo()) return;
      const k = e.key.toLowerCase();
      if (k === "a") { e.preventDefault(); pulsarRef.current(1); return; }
      if (k === "l") { e.preventDefault(); pulsarRef.current(2); return; }
      if ((e.key === "Enter" || e.key === " ") && !jugandoRef.current) {
        e.preventDefault();
        empezarRef.current();
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);
  useEffect(() => () => clearTimeout(timer.current), []);

  const pct = Math.round((ronda / rondasEff) * 100);
  const lider = p1 === p2 ? "Empate" : p1 > p2 ? `Va ganando ${n1 || "J1"} 🔵` : `Va ganando ${n2 || "J2"} 🔴`;

  return (
    <GameShell titulo={titulo} emoji="⚡"
      descripcion={`${n1} pulsa A · ${n2} pulsa L · solo en verde · ${rondasEff} rondas · ¡salir antes regala el punto!`}
      tira={tira} iconoFondo={iconoFondo}
      stats={[
        { icono: "🔵", etiqueta: n1 || "J1", valor: p1 },
        { icono: "🏁", etiqueta: "Ronda", valor: `${ronda}/${rondasEff}` },
        { icono: "🔴", etiqueta: n2 || "J2", valor: p2 },
        { icono: "🎯", etiqueta: "Modo", valor: `Mejor de ${rondasEff}` },
      ]}
      acciones={!jugando ? <button className="btn-principal" onClick={empezar}>{ronda > 0 ? "↻ Revancha" : "▶ Empezar"}</button> : null}
      ayuda={<>
        <span>Esperad al <b>verde</b>: quien pulse antes se lleva el punto. Pulsar en rojo regala el punto al rival.</span>
        <span>Controles: <b>{n1 || "J1"}</b> tecla <kbd>A</kbd> o botón azul; <b>{n2 || "J2"}</b> tecla <kbd>L</kbd> o botón rojo. Táctil: toca tu botón. <kbd>ENTER</kbd> empieza.</span>
        <span>Puntuación: cada punto suma y al final se registra la partida. Modos: <b>mejor de 3, 5 o 7</b> rondas.</span>
        <span>Consejo: mira el centro de la pantalla y no anticipes: la espera es aleatoria.</span>
      </>}>
      {!jugando && ronda === 0 && (
        <>
          <div className="fila-botones">
            <label className="chip">🔵 <input value={n1} onChange={e => setN1(e.target.value.slice(0, 10))} style={{ width: 70 }} aria-label="Nombre jugador 1" /></label>
            <label className="chip">🔴 <input value={n2} onChange={e => setN2(e.target.value.slice(0, 10))} style={{ width: 70 }} aria-label="Nombre jugador 2" /></label>
          </div>
          <div className="fila-botones" role="group" aria-label="Al mejor de">
            {[3, 5, 7].map(m => (
              <button key={m} className={rondasEff === m ? "btn-principal" : "btn-suave"} onClick={() => { setMeta(m); sfx.clic(); }}>Mejor de {m}</button>
            ))}
          </div>
        </>
      )}
      <div className="xp-bar fina" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Progreso del duelo"><div style={{ width: `${pct}%` }} /></div>
      <div style={{ background: fase === "ya" ? "#22c55e" : fase === "listo" ? "#ef4444" : "var(--bg-soft)",
        borderRadius: 14, padding: 26, textAlign: "center", fontSize: "1.4rem", fontWeight: 800, color: fase === "espera" ? "var(--texto)" : "white" }}>
        {fase === "espera" && "Pulsa para empezar"}
        {fase === "listo" && "Espera el verde…"}
        {fase === "ya" && "¡YA!"}
        {fase === "entre" && lider}
        {fase === "fin" && (p1 === p2 ? "🤝 ¡Empate!" : p1 > p2 ? `🏆 ¡Gana ${n1}!` : `🏆 ¡Gana ${n2}!`)}
      </div>
      <div className="fila-botones">
        <button className="btn-principal" style={{ flex: 1, padding: "18px" }} onClick={() => pulsar(1)}>🔵 {n1} (A)</button>
        <button className="btn-peligro" style={{ flex: 1, padding: "18px" }} onClick={() => pulsar(2)}>🔴 {n2} (L)</button>
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
