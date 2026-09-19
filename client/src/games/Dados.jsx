import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro } from "../ui/GameShell";
import { escribiendo } from "../suite/teclado";

const caras = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

export default function Dados() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Dados");
  const [n1, setN1] = useState("Jugador 1");
  const [n2, setN2] = useState("Jugador 2");
  const [g1, setG1] = useState(0);
  const [g2, setG2] = useState(0);
  const [dadosTurno, setDadosTurno] = useState({});
  const [resultado, setResultado] = useState("");
  const [fin, setFin] = useState(false);
  const finRef = useRef(false);
  finRef.current = fin;

  const objetivo = 5;

  function lanzar() {
    if (finRef.current) return;
    const d = { 1: Math.floor(Math.random() * 6) + 1, 2: Math.floor(Math.random() * 6) + 1 };
    const d2 = { 1: Math.floor(Math.random() * 6) + 1, 2: Math.floor(Math.random() * 6) + 1 };
    const suma1 = d[1] + d[2];
    const suma2 = d2[1] + d2[2];
    setDadosTurno({ j1: d, j2: d2, suma1, suma2 });
    let r;
    if (suma1 > suma2) {
      r = `¡Punto para ${n1 || "Jugador 1"}! +1`;
      setG1(g => {
        const ng = g + 1;
        if (ng >= objetivo) { registrarPunt(objetivo * 10, 1); setFin(true); finRef.current = true; }
        return ng;
      });
    } else if (suma2 > suma1) {
      r = `¡Punto para ${n2 || "Jugador 2"}! +1`;
      setG2(g => {
        const ng = g + 1;
        if (ng >= objetivo) { registrarPunt(objetivo * 10, 1); setFin(true); finRef.current = true; }
        return ng;
      });
    } else r = "¡Empate en la ronda! 🤝";
    setResultado(r);
  }

  const lanzarRef = useRef(lanzar);
  lanzarRef.current = lanzar;

  useEffect(() => {
    const fn = e => {
      if (escribiendo()) return;
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); lanzarRef.current(); }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  function reiniciar() { setG1(0); setG2(0); setResultado(""); setDadosTurno({}); setFin(false); finRef.current = false; }

  const ganaNombre = g1 > g2 ? (n1 || "Jugador 1") : (n2 || "Jugador 2");

  return (
    <GameShell titulo="Dados" emoji="🎲"
      descripcion="ENTER/ESPACIO para lanzar · primero a 5 rondas.">
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
        <input type="text" value={n1} onChange={e => setN1(e.target.value || "Jugador 1")} style={{ width: 130 }} />
        <span style={{ color: "var(--texto-suave)" }}>vs</span>
        <input type="text" value={n2} onChange={e => setN2(e.target.value || "Jugador 2")} style={{ width: 130 }} />
      </div>
      <div className="marcador-chips">
        <span className="chip">{n1 || "J1"}: <b style={{ color: "var(--exito)" }}>{g1}</b></span>
        <span className="chip">{n2 || "J2"}: <b style={{ color: "var(--exito)" }}>{g2}</b></span>
      </div>
      {dadosTurno.j1 && (
        <div style={{ display: "flex", gap: 40 }}>
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
      {!fin && <div className="fila-botones"><button className="btn-principal" onClick={lanzar}>🎲 Lanzar dados</button></div>}
      {fin && (
        <div className={`mensaje-final ${tipo}`}>
          🏆 ¡GANÓ <b>{ganaNombre}</b>! {mensaje}
          <div className="fila-botones" style={{ marginTop: 8 }}><button className="btn-exito" onClick={reiniciar}>↻ Otra partida</button></div>
        </div>
      )}
    </GameShell>
  );
}
