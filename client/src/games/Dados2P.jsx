import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { sfx } from "../suite/sonido";
import { escribiendo } from "../suite/teclado";

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
  const [n1, setN1] = useState("J1");
  const [n2, setN2] = useState("J2");
  const [meta, setMeta] = useState(null);
  const rondasEff = meta || rondas;
  const [jugando, setJugando] = useState(false);
  const [t1, setT1] = useState([]);
  const jugandoRef = useRef(false);
  jugandoRef.current = jugando;
  const lanzarRef = useRef(null);

  function empezar() {
    setFase("j1"); setTirada([]); setT1([]); setS1(0); setS2(0); setRonda(0); setLog("");
    setJugando(true);
    sfx.clic();
  }

  function lanzar() {
    if (!jugando) return;
    const t = [1, 2, 3].map(() => 1 + Math.floor(Math.random() * 6));
    const suma = t.reduce((a, b) => a + b, 0);
    if (fase === "j1") {
      setT1(t); setTirada(t);
      setFase("j2");
      setLog(`${n1} sacó ${suma}. Turno de ${n2}…`);
      sfx.clic();
    } else {
      setTirada(t);
      let ns1 = s1, ns2 = s2;
      const s1sum = t1.reduce((a, b) => a + b, 0);
      if (suma > s1sum) { ns2++; setLog(`${n2} gana (${suma} vs ${s1sum})`); sfx.bien(); }
      else if (suma < s1sum) { ns1++; setLog(`${n1} gana (${s1sum} vs ${suma})`); sfx.bien(); }
      else { setLog(`Empate a ${suma}`); sfx.clic(); }
      setS1(ns1); setS2(ns2);
      const nr = ronda + 1;
      setRonda(nr);
      setFase("j1");
      if (nr >= rondasEff) {
        setJugando(false);
        setLog(l => l + (ns1 === ns2 ? " · 🤝 ¡Empate!" : ns1 > ns2 ? ` · 🏆 ¡Gana ${n1}!` : ` · 🏆 ¡Gana ${n2}!`));
        if (ns1 !== ns2) sfx.record();
        else sfx.moneda();
        registrarPunt(ns1 * 100 + ns2 * 50, 1);
      }
    }
  }
  lanzarRef.current = lanzar;

  useEffect(() => {
    const fn = e => {
      if (escribiendo()) return;
      if ((e.key === "Enter" || e.key === " ") && !jugandoRef.current) {
        e.preventDefault();
        empezar();
        return;
      }
      if (!jugandoRef.current) return;
      if (e.key === "Enter" || e.key === " " || e.key.toLowerCase() === "l") {
        e.preventDefault();
        lanzarRef.current();
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fase, s1, s2, ronda, t1, jugando, n1, n2, rondasEff]);

  const pct = Math.round((ronda / rondasEff) * 100);

  return (
    <GameShell titulo={titulo} emoji="🎲"
      descripcion={`${n1} lanza, luego ${n2} · mayor suma gana · ${rondasEff} rondas.`}
      tira={tira} iconoFondo={iconoFondo}
      stats={[
        { icono: "🔵", etiqueta: n1 || "J1", valor: s1 },
        { icono: "🏁", etiqueta: "Ronda", valor: `${ronda}/${rondasEff}` },
        { icono: "🔴", etiqueta: n2 || "J2", valor: s2 },
        { icono: "🎯", etiqueta: "Modo", valor: `Mejor de ${rondasEff}` },
      ]}
      acciones={!jugando ? <button className="btn-principal" onClick={empezar}>{ronda > 0 ? "↻ Revancha" : "▶ Empezar"}</button> : null}
      ayuda={<>
        <span>Por turnos: <b>{n1 || "J1"}</b> lanza 3 dados y luego <b>{n2 || "J2"}</b>. Mayor suma se lleva la ronda.</span>
        <span>Controles: botón Lanzar o tecla <kbd>ENTER</kbd>/<kbd>ESPACIO</kbd>/<kbd>L</kbd>. <kbd>ENTER</kbd> también empieza.</span>
        <span>Puntuación: la partida se registra como victoria al terminar. Modos: <b>mejor de 3, 5 o 7</b> rondas.</span>
        <span>Consejo: con 3 dados la media es 10–11: no celebres un 9 demasiado pronto.</span>
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
      <p style={{ textAlign: "center", fontSize: "3.2rem", margin: "4px 0" }}>
        {tirada.length ? tirada.map(v => DADOS[v - 1]).join(" ") : "🎲🎲🎲"}
      </p>
      {log && <p style={{ textAlign: "center" }}>{log}</p>}
      {jugando && (
        <div className="fila-botones">
          <button className="btn-principal" onClick={lanzar}>🎲 Lanzar ({fase === "j1" ? `${n1} 🔵` : `${n2} 🔴`}) <kbd>ENTER</kbd></button>
        </div>
      )}
      <Resultado mensaje={mensaje} tipo={tipo} />
    </GameShell>
  );
}

export function Dados2P() {
  return <DadosBase titulo="Dados 2P" rondas={5} tira="linear-gradient(135deg,#eab308,#dc2626)" iconoFondo="linear-gradient(135deg,#eab308,#dc2626)" />;
}
export function Dados2PLargo() {
  return <DadosBase titulo="Dados 2P Largo" rondas={9} tira="linear-gradient(135deg,#7c3aed,#eab308)" iconoFondo="linear-gradient(135deg,#7c3aed,#eab308)" />;
}
