import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro } from "../ui/GameShell";
import { escribiendo } from "../suite/teclado";
import { sfx } from "../suite/sonido";

const caras = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
const METAS = [3, 5, 7];

export default function Dados() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Dados");
  const [n1, setN1] = useState("Jugador 1");
  const [n2, setN2] = useState("Jugador 2");
  const [g1, setG1] = useState(0);
  const [g2, setG2] = useState(0);
  const [objetivo, setObjetivo] = useState(5);
  const [dadosTurno, setDadosTurno] = useState({});
  const [resultado, setResultado] = useState("");
  const [fin, setFin] = useState(false);
  const [mejor, setMejor] = useState(null);
  const finRef = useRef(false);
  finRef.current = fin;
  const objRef = useRef(objetivo);
  objRef.current = objetivo;

  function lanzar() {
    if (finRef.current) return;
    sfx.clic();
    const d = { 1: Math.floor(Math.random() * 6) + 1, 2: Math.floor(Math.random() * 6) + 1 };
    const d2 = { 1: Math.floor(Math.random() * 6) + 1, 2: Math.floor(Math.random() * 6) + 1 };
    const suma1 = d[1] + d[2];
    const suma2 = d2[1] + d2[2];
    setDadosTurno({ j1: d, j2: d2, suma1, suma2 });
    let r;
    if (suma1 > suma2) {
      r = `¡Punto para ${n1 || "Jugador 1"}! +1`;
      sfx.bien();
      setG1(g => {
        const ng = g + 1;
        if (ng >= objRef.current) {
          registrarPunt(objRef.current * 10, 1);
          sfx.record();
          setMejor(m => (m == null || ng > m ? ng : m));
          setFin(true); finRef.current = true;
        }
        return ng;
      });
    } else if (suma2 > suma1) {
      r = `¡Punto para ${n2 || "Jugador 2"}! +1`;
      sfx.bien();
      setG2(g => {
        const ng = g + 1;
        if (ng >= objRef.current) {
          registrarPunt(objRef.current * 10, 1);
          sfx.record();
          setMejor(m => (m == null || ng > m ? ng : m));
          setFin(true); finRef.current = true;
        }
        return ng;
      });
    } else { r = "¡Empate en la ronda! 🤝"; sfx.clic(); }
    setResultado(r);
  }

  const lanzarRef = useRef(lanzar);
  lanzarRef.current = lanzar;
  const reiniciarRef = useRef(null);

  function reiniciar() { sfx.clic(); setG1(0); setG2(0); setResultado(""); setDadosTurno({}); setFin(false); finRef.current = false; }
  reiniciarRef.current = reiniciar;

  useEffect(() => {
    const fn = e => {
      if (escribiendo()) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (finRef.current) reiniciarRef.current();
        else lanzarRef.current();
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  const ganaNombre = g1 > g2 ? (n1 || "Jugador 1") : (n2 || "Jugador 2");
  const pct = Math.round((Math.max(g1, g2) / objetivo) * 100);

  return (
    <GameShell titulo="Dados" emoji="🎲"
      descripcion={`ENTER/ESPACIO para lanzar · primero a ${objetivo} rondas.`}
      stats={[
        { icono: "🎯", etiqueta: "Meta", valor: `${objetivo} rondas` },
        { icono: "🔵", etiqueta: n1 || "J1", valor: `${g1}/${objetivo}` },
        { icono: "🔴", etiqueta: n2 || "J2", valor: `${g2}/${objetivo}` },
        { icono: "🏆", etiqueta: "Mejor", valor: mejor == null ? "—" : mejor },
      ]}
      acciones={<>
        {METAS.map(m => (
          <button key={m} className={objetivo === m ? "btn-principal" : "btn-suave"} onClick={() => { setObjetivo(m); objRef.current = m; reiniciar(); }}>A {m}</button>
        ))}
        <button className="btn-principal" onClick={lanzar} disabled={fin}>🎲 Lanzar (ENTER)</button>
        <button className="btn-exito" onClick={reiniciar}>↻ Reiniciar</button>
      </>}
      resultado={fin ? { mensaje, tipo } : null}
      ayuda={<>
        <p><b>Objetivo:</b> cada jugador lanza 2 dados; la suma mayor gana la ronda. Gana el match quien llegue a <b>{objetivo} rondas</b>.</p>
        <p><b>Controles:</b> pulsa <kbd>Enter</kbd>/<kbd>Espacio</kbd> o el botón Lanzar. Táctil: toca Lanzar. Puedes renombrar a los jugadores en los cuadros.</p>
        <p><b>Puntuación:</b> ganar el match registra <b>{objetivo * 10} pts</b> como victoria.</p>
        <p><b>Consejo:</b> no hay estrategia de dados, pero a match largo gestiona la presión: el líder suele ganar, así que ajusta la meta a 7 si quieres remontadas.</p>
      </>}>
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
        <input type="text" value={n1} onChange={e => setN1(e.target.value || "Jugador 1")} style={{ width: 130 }} aria-label="Nombre jugador 1" />
        <span style={{ color: "var(--texto-suave)" }}>vs</span>
        <input type="text" value={n2} onChange={e => setN2(e.target.value || "Jugador 2")} style={{ width: 130 }} aria-label="Nombre jugador 2" />
      </div>
      <div className="xp-bar fina"><div style={{ width: `${pct}%` }} /></div>
      {dadosTurno.j1 && (
        <div style={{ display: "flex", gap: 40, marginTop: 10 }}>
          <div>
            <p><b>{n1 || "Jugador 1"}</b> sacó <b>{dadosTurno.suma1}</b></p>
            <div style={{ display: "flex", gap: 8 }}>
              <span className="dado">{caras[dadosTurno.j1[1]]}</span>
              <span className="dado">{caras[dadosTurno.j1[2]]}</span>
            </div>
          </div>
          <div>
            <p><b>{n2 || "Jugador 2"}</b> sacó <b>{dadosTurno.suma2}</b></p>
            <div style={{ display: "flex", gap: 8 }}>
              <span className="dado">{caras[dadosTurno.j2[1]]}</span>
              <span className="dado">{caras[dadosTurno.j2[2]]}</span>
            </div>
          </div>
        </div>
      )}
      {resultado && <p style={{ marginTop: 14, fontWeight: 700 }}>{resultado}</p>}
      {fin && (
        <p style={{ fontWeight: 800 }}>🏆 ¡GANÓ <b>{ganaNombre}</b>!</p>
      )}
    </GameShell>
  );
}
