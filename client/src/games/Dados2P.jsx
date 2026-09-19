import { useState } from "react";
import GameShell, { useRegistro } from "../ui/GameShell";
import { sfx } from "../suite/sonido";

const DADOS = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

/* Dados 2P: cada uno lanza 3 dados, mayor suma gana la ronda. */
function DadosBase({ titulo, rondas, tira, iconoFondo }) {
  const { mensaje, tipo, registrarPunt } = useRegistro(titulo);
  const [fase, setFase] = useState("j1");
  const [tirada, setTirada] = useState([]);
  const [s1, setS1] = useState(0);
  const [s2, setS2] = useState(0);
  const [ronda, setRonda] = useState(0);
  const [log, setLog] = useState("");
  const [jugando, setJugando] = useState(false);
  const [t1, setT1] = useState([]);

  function empezar() {
    setFase("j1"); setTirada([]); setT1([]); setS1(0); setS2(0); setRonda(0); setLog("");
    setJugando(true);
    sfx.clic();
  }

  function lanzar() {
    if (!jugando) return;
    const t = [1, 2, 3].map(() => 1 + Math.floor(Math.random() * 6));
    const suma = t.reduce((a, b) => a + b, 0);
    sfx.clic();
    if (fase === "j1") {
      setT1(t); setTirada(t);
      setFase("j2");
      setLog(`J1 sacó ${suma}. Turno de J2…`);
    } else {
      setTirada(t);
      let ns1 = s1, ns2 = s2;
      const s1sum = t1.reduce((a, b) => a + b, 0);
      if (suma > s1sum) { ns2++; setLog(`J2 gana (${suma} vs ${s1sum})`); }
      else if (suma < s1sum) { ns1++; setLog(`J1 gana (${s1sum} vs ${suma})`); }
      else setLog(`Empate a ${suma}`);
      setS1(ns1); setS2(ns2);
      const nr = ronda + 1;
      setRonda(nr);
      setFase("j1");
      if (nr >= rondas) {
        setJugando(false);
        setLog(l => l + (ns1 === ns2 ? " · 🤝 ¡Empate!" : ns1 > ns2 ? " · 🏆 ¡Gana J1!" : " · 🏆 ¡Gana J2!"));
        if (ns1 !== ns2) sfx.record();
        registrarPunt(ns1 * 100 + ns2 * 50, 1);
      }
    }
  }

  return (
    <GameShell titulo={titulo} emoji="🎲"
      descripcion={`J1 lanza, luego J2 · mayor suma gana · ${rondas} rondas.`}
      tira={tira} iconoFondo={iconoFondo}>
      <div className="fila-botones" style={{ marginTop: 0 }}>
        <span className="chip">🔵 J1: <b>{s1}</b></span>
        <span className="chip">Ronda: <b>{ronda}/{rondas}</b></span>
        <span className="chip">🔴 J2: <b>{s2}</b></span>
      </div>
      {!jugando && ronda === 0 && (
        <div className="fila-botones"><button className="btn-principal" onClick={empezar}>▶ Empezar</button></div>
      )}
      <p style={{ textAlign: "center", fontSize: "3.2rem", margin: "4px 0" }}>
        {tirada.length ? tirada.map(v => DADOS[v - 1]).join(" ") : "🎲🎲🎲"}
      </p>
      {log && <p style={{ textAlign: "center" }}>{log}</p>}
      {jugando && (
        <div className="fila-botones">
          <button className="btn-principal" onClick={lanzar}>🎲 Lanzar ({fase === "j1" ? "J1 🔵" : "J2 🔴"})</button>
        </div>
      )}
      {mensaje && <div className={`mensaje-final ${tipo}`}>{mensaje}</div>}
    </GameShell>
  );
}

export function Dados2P() {
  return <DadosBase titulo="Dados 2P" rondas={5} tira="linear-gradient(135deg,#eab308,#dc2626)" iconoFondo="linear-gradient(135deg,#eab308,#dc2626)" />;
}
export function Dados2PLargo() {
  return <DadosBase titulo="Dados 2P Largo" rondas={9} tira="linear-gradient(135deg,#7c3aed,#eab308)" iconoFondo="linear-gradient(135deg,#7c3aed,#eab308)" />;
}
