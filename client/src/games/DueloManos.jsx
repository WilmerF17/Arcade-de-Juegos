import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { sfx } from "../suite/sonido";
import { escribiendo } from "../suite/teclado";

/* Duelo de Manos: piedra-papel-tijeras 2P en local, jugadas ocultas. */
const OPCIONES = ["✊ Piedra", "✋ Papel", "✌️ Tijeras"];
const OPCIONES5 = ["✊ Piedra", "✋ Papel", "✌️ Tijeras", "🦎 Lagarto", "🖖 Spock"];
const GANA = { 0: [2, 3], 1: [0, 4], 2: [1, 3], 3: [1, 4], 4: [0, 2] };

function DueloBase({ titulo, opciones, rondas, tira, iconoFondo }) {
  const { mensaje, tipo, registrarPunt } = useRegistro(titulo);
  const [p1, setP1] = useState(null);
  const [fase, setFase] = useState("p1");
  const [s1, setS1] = useState(0);
  const [s2, setS2] = useState(0);
  const [ronda, setRonda] = useState(0);
  const [log, setLog] = useState("");
  const [n1, setN1] = useState("J1");
  const [n2, setN2] = useState("J2");
  const [meta, setMeta] = useState(null);
  const rondasEff = meta || rondas;
  const [jugando, setJugando] = useState(false);
  const jugandoRef = useRef(false);
  jugandoRef.current = jugando;
  const elegirRef = useRef(null);

  function empezar() {
    setP1(null); setS1(0); setS2(0); setRonda(0); setLog("");
    setFase("p1"); setJugando(true);
    sfx.clic();
  }

  function elegir(i) {
    if (!jugando) return;
    if (fase === "p1") {
      setP1(i);
      setFase("p2");
      sfx.clic();
    } else {
      const g1 = GANA[i].includes(p1);
      const g2 = GANA[p1].includes(i);
      let ns1 = s1, ns2 = s2;
      if (g1 && !g2) { ns1++; setLog(`${n1} gana la ronda (${opciones[p1]} vs ${opciones[i]})`); sfx.bien(); }
      else if (g2 && !g1) { ns2++; setLog(`${n2} gana la ronda (${opciones[i]} vs ${opciones[p1]})`); sfx.bien(); }
      else { setLog(`Empate (${opciones[p1]} vs ${opciones[i]})`); sfx.clic(); }
      setS1(ns1); setS2(ns2);
      const nr = ronda + 1;
      setRonda(nr);
      setP1(null);
      setFase("p1");
      if (nr >= rondasEff) {
        setJugando(false);
        setLog(l => l + (ns1 === ns2 ? " · 🤝 ¡Empate final!" : ns1 > ns2 ? ` · 🏆 ¡Gana ${n1}!` : ` · 🏆 ¡Gana ${n2}!`));
        if (ns1 !== ns2) sfx.record();
        registrarPunt(ns1 * 100 + ns2 * 50 + nr * 10, 1);
      }
    }
  }
  elegirRef.current = elegir;

  useEffect(() => {
    const fn = e => {
      if (escribiendo()) return;
      if ((e.key === "Enter" || e.key === " ") && !jugandoRef.current) {
        e.preventDefault();
        empezar();
        return;
      }
      if (!jugandoRef.current) return;
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= opciones.length) {
        e.preventDefault();
        elegirRef.current(n - 1);
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fase, p1, s1, s2, ronda, opciones, rondasEff, n1, n2, jugando]);

  const pct = Math.round((ronda / rondasEff) * 100);
  const lider = s1 === s2 ? "Empate" : s1 > s2 ? `Va ganando ${n1 || "J1"} 🔵` : `Va ganando ${n2 || "J2"} 🔴`;

  return (
    <GameShell titulo={titulo} emoji="✋"
      descripcion={fase === "p2" && jugando ? `${n2} elige en secreto (${n1} no mires 👀)` : `${n1} elige en secreto · al mejor de ${rondasEff}.`}
      tira={tira} iconoFondo={iconoFondo}
      stats={[
        { icono: "🔵", etiqueta: n1 || "J1", valor: s1 },
        { icono: "🏁", etiqueta: "Ronda", valor: `${ronda}/${rondasEff}` },
        { icono: "🔴", etiqueta: n2 || "J2", valor: s2 },
        { icono: "🎯", etiqueta: "Modo", valor: `Mejor de ${rondasEff}` },
      ]}
      acciones={!jugando ? <button className="btn-principal" onClick={empezar}>{ronda > 0 ? "↻ Revancha" : "▶ Empezar duelo"}</button> : null}
      ayuda={<>
        <span>Dos jugadores en el mismo dispositivo: <b>{n1 || "J1"}</b> elige en secreto y luego <b>{n2 || "J2"}</b> sin mirar. Gana la ronda según piedra-papel-tijeras{opciones.length > 3 ? " + lagarto-spock" : ""}.</span>
        <span>Controles: clic o dedo en la jugada; teclado <kbd>1</kbd>–<kbd>{opciones.length}</kbd>. <kbd>ENTER</kbd> o <kbd>ESPACIO</kbd> empieza o pide revancha.</span>
        <span>Puntuación: cada ronda suma al marcador y al final se registra la partida como victoria. Modos: <b>mejor de 3, 5 o 7</b>.</span>
        <span>Consejo: el segundo jugador no debe mirar la primera elección: tapa la pantalla con la mano.</span>
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
      {jugando && <p style={{ textAlign: "center", color: "var(--texto-suave)" }}>{lider}</p>}
      {log && <p style={{ textAlign: "center" }}>{log}</p>}
      {jugando && (
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
          {opciones.map((o, i) => (
            <button key={o} className="btn-principal" style={{ padding: "14px 12px" }} onClick={() => elegir(i)}>{o} <kbd style={{ fontSize: ".75rem" }}>{i + 1}</kbd></button>
          ))}
        </div>
      )}
      <Resultado mensaje={mensaje} tipo={tipo} />
    </GameShell>
  );
}

export function DueloManos() {
  return <DueloBase titulo="Duelo de Manos" opciones={OPCIONES} rondas={5} tira="linear-gradient(135deg,#f43f5e,#fb923c)" iconoFondo="linear-gradient(135deg,#f43f5e,#fb923c)" />;
}
export function DueloManosPro() {
  return <DueloBase titulo="Duelo Pro: +Lagarto" opciones={OPCIONES5} rondas={7} tira="linear-gradient(135deg,#7c3aed,#22d3ee)" iconoFondo="linear-gradient(135deg,#7c3aed,#22d3ee)" />;
}
