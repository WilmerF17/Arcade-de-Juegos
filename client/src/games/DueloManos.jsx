import { useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { sfx } from "../suite/sonido";

/* Duelo de Manos: piedra-papel-tijeras 2P en local, jugadas ocultas. */
const OPCIONES = ["✊ Piedra", "✋ Papel", "✌️ Tijeras"];
const OPCIONES5 = ["✊ Piedra", "✋ Papel", "✌️ Tijeras", "🦎 Lagarto", "🖖 Spock"];
const GANA = { 0: [2, 3], 1: [0, 4], 2: [1, 3], 3: [1, 4], 4: [0, 2] };

function DueloBase({ titulo, opciones, rondas, tira, iconoFondo }) {
  const { mensaje, tipo, registrarPunt } = useRegistro(titulo);
  const [p1, setP1] = useState(null);
  const [p2, setP2] = useState(null);
  const [fase, setFase] = useState("p1");
  const [s1, setS1] = useState(0);
  const [s2, setS2] = useState(0);
  const [ronda, setRonda] = useState(0);
  const [log, setLog] = useState("");
  const [jugando, setJugando] = useState(false);

  function empezar() {
    setP1(null); setP2(null); setS1(0); setS2(0); setRonda(0); setLog("");
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
      if (g1 && !g2) { ns1++; setLog(`J1 gana la ronda (${opciones[p1]} vs ${opciones[i]})`); sfx.bien(); }
      else if (g2 && !g1) { ns2++; setLog(`J2 gana la ronda (${opciones[i]} vs ${opciones[p1]})`); sfx.bien(); }
      else { setLog(`Empate (${opciones[p1]} vs ${opciones[i]})`); sfx.clic(); }
      setS1(ns1); setS2(ns2);
      const nr = ronda + 1;
      setRonda(nr);
      setP1(null); setP2(null);
      setFase("p1");
      if (nr >= rondas) {
        setJugando(false);
        setLog(l => l + (ns1 === ns2 ? " · 🤝 ¡Empate final!" : ns1 > ns2 ? " · 🏆 ¡Gana J1!" : " · 🏆 ¡Gana J2!"));
        if (ns1 !== ns2) sfx.record();
        registrarPunt(ns1 * 100 + ns2 * 50 + nr * 10, 1);
      }
    }
  }

  return (
    <GameShell titulo={titulo} emoji="✋"
      descripcion={fase === "p2" && jugando ? "J2 elige en secreto (J1 no mires 👀)" : `J1 elige en secreto · al mejor de ${rondas}.`}
      tira={tira} iconoFondo={iconoFondo}>
      <div className="fila-botones">
        <span className="chip">🔵 J1: <b>{s1}</b></span>
        <span className="chip">Ronda: <b>{ronda}/{rondas}</b></span>
        <span className="chip">🔴 J2: <b>{s2}</b></span>
      </div>
      {!jugando && ronda === 0 && (
        <div className="fila-botones"><button className="btn-principal" onClick={empezar}>▶ Empezar duelo</button></div>
      )}
      {log && <p style={{ textAlign: "center" }}>{log}</p>}
      {jugando && (
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
          {opciones.map((o, i) => (
            <button key={o} className="btn-principal" style={{ padding: "14px 12px" }} onClick={() => elegir(i)}>{o}</button>
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
