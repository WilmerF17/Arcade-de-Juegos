import { useState } from "react";
import GameShell, { useRegistro } from "../ui/GameShell";
import { sfx } from "../suite/sonido";

/* ¿Dónde Quedó?: sigue la bolita entre los vasos que se mezclan. */
function DondeBase({ titulo, vasos, rondas, tira, iconoFondo }) {
  const { mensaje, tipo, registrarPunt } = useRegistro(titulo);
  const [bola, setBola] = useState(0);
  const [orden, setOrden] = useState([]);
  const [fase, setFase] = useState("inicio");
  const [ronda, setRonda] = useState(0);
  const [puntos, setPuntos] = useState(0);
  const [jugando, setJugando] = useState(false);

  function empezar() {
    setPuntos(0); setRonda(0); setJugando(true);
    nuevaRonda(1);
    sfx.clic();
  }

  function nuevaRonda(nr) {
    const b = Math.floor(Math.random() * vasos);
    setBola(b);
    setOrden(Array.from({ length: vasos }, (_, i) => i));
    setRonda(nr);
    setFase("mira");
    // mezcla animada
    let n = 0;
    const id = setInterval(() => {
      setOrden(o => {
        const c = [...o];
        const a = Math.floor(Math.random() * vasos), d = Math.floor(Math.random() * vasos);
        [c[a], c[d]] = [c[d], c[a]];
        return c;
      });
      n++;
      if (n >= 4 + nr) {
        clearInterval(id);
        setFase("elige");
      }
    }, 450);
  }

  function elegir(posMostrada) {
    if (!jugando || fase !== "elige") return;
    // orden[pos] = vaso original en esa posición; la bola está donde orden[pos] === bola
    const acierto = orden[posMostrada] === bola;
    if (acierto) {
      const np = puntos + 100 + ronda * 10;
      setPuntos(np);
      sfx.bien();
    } else sfx.mal();
    if (ronda >= rondas) {
      setJugando(false);
      setFase("fin");
      registrarPunt(puntos + (acierto ? 100 : 0), puntos >= rondas * 60 ? 1 : 0);
    } else {
      nuevaRonda(ronda + 1);
    }
  }

  return (
    <GameShell titulo={titulo} emoji="🥤"
      descripcion={`Memoriza dónde quedó la bolita tras la mezcla · ${rondas} rondas.`}
      tira={tira} iconoFondo={iconoFondo}>
      <div className="fila-botones" style={{ marginTop: 0 }}>
        <span className="chip">Ronda: <b>{ronda}/{rondas}</b></span>
        <span className="chip">Puntos: <b>{puntos}</b></span>
      </div>
      {fase === "inicio" && (
        <div className="fila-botones"><button className="btn-principal" onClick={empezar}>▶ Empezar</button></div>
      )}
      {fase !== "inicio" && (
        <>
          <p style={{ textAlign: "center", color: "var(--texto-suave)" }}>
            {fase === "mira" ? "👀 Mira la bolita…" : "¿Dónde quedó? 👇"}
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            {orden.map((vasoOrig, pos) => (
              <button key={pos} onClick={() => elegir(pos)} disabled={fase !== "elige"}
                style={{ fontSize: "3rem", padding: "10px 14px", borderRadius: 14, background: "var(--bg-soft)", border: "2px solid var(--border)" }}>
                {fase === "mira" && vasoOrig === bola ? "🔴" : "🥤"}
              </button>
            ))}
          </div>
        </>
      )}
      {mensaje && <div className={`mensaje-final ${tipo}`}>{mensaje}</div>}
      {fase === "fin" && !mensaje && (
        <div className="fila-botones"><button className="btn-principal" onClick={empezar}>↻ Otra vez</button></div>
      )}
    </GameShell>
  );
}

export function DondeQuedo() {
  return <DondeBase titulo="¿Dónde Quedó?" vasos={3} rondas={8} tira="linear-gradient(135deg,#f59e0b,#a855f7)" iconoFondo="linear-gradient(135deg,#f59e0b,#a855f7)" />;
}
export function DondeQuedoPro() {
  return <DondeBase titulo="¿Dónde Quedó? Pro" vasos={5} rondas={8} tira="linear-gradient(135deg,#7c3aed,#f59e0b)" iconoFondo="linear-gradient(135deg,#7c3aed,#f59e0b)" />;
}
