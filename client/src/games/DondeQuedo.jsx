import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { sfx } from "../suite/sonido";
import { escribiendo } from "../suite/teclado";

/* ¿Dónde Quedó?: sigue la bolita entre los vasos que se mezclan. */
const CONF_DIF = { 1: { vel: 650, nombre: "Fácil" }, 2: { vel: 450, nombre: "Normal" }, 3: { vel: 280, nombre: "Difícil" } };
function DondeBase({ titulo, vasos, rondas, tira, iconoFondo }) {
  const { mensaje, tipo, registrarPunt } = useRegistro(titulo);
  const [bola, setBola] = useState(0);
  const [orden, setOrden] = useState([]);
  const [fase, setFase] = useState("inicio");
  const [ronda, setRonda] = useState(0);
  const [puntos, setPuntos] = useState(0);
  const [aciertos, setAciertos] = useState(0);
  const [dif, setDif] = useState(2);
  const [jugando, setJugando] = useState(false);
  const jugandoRef = useRef(false);
  jugandoRef.current = jugando;
  const elegirRef = useRef(null);

  function empezar() {
    setPuntos(0); setRonda(0); setAciertos(0); setJugando(true);
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
    }, CONF_DIF[dif].vel);
  }

  function elegir(posMostrada) {
    if (!jugando || fase !== "elige") return;
    // orden[pos] = vaso original en esa posición; la bola está donde orden[pos] === bola
    const acierto = orden[posMostrada] === bola;
    let np = puntos;
    if (acierto) {
      np = puntos + 100 + ronda * 10;
      setPuntos(np);
      setAciertos(a => a + 1);
      sfx.bien();
    } else sfx.mal();
    if (ronda >= rondas) {
      setJugando(false);
      setFase("fin");
      registrarPunt(np + (acierto ? 0 : 0), np >= rondas * 60 ? 1 : 0);
    } else {
      nuevaRonda(ronda + 1);
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
      if (!jugandoRef.current || fase !== "elige") return;
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= vasos) {
        e.preventDefault();
        elegirRef.current(n - 1);
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fase, orden, bola, ronda, puntos, vasos, dif, jugando]);

  const pct = ronda > 0 ? Math.round(((ronda - 1) / rondas) * 100) : 0;

  return (
    <GameShell titulo={titulo} emoji="🥤"
      descripcion={`Memoriza dónde quedó la bolita tras la mezcla · ${rondas} rondas · ${vasos} vasos.`}
      tira={tira} iconoFondo={iconoFondo}
      stats={[
        { icono: "🏁", etiqueta: "Ronda", valor: `${ronda}/${rondas}` },
        { icono: "⭐", etiqueta: "Puntos", valor: puntos },
        { icono: "✅", etiqueta: "Aciertos", valor: aciertos },
        { icono: "🎯", etiqueta: "Dificultad", valor: CONF_DIF[dif].nombre },
      ]}
      acciones={fase === "inicio" || fase === "fin" ? <button className="btn-principal" onClick={empezar}>{fase === "inicio" ? "▶ Empezar" : "↻ Otra vez"}</button> : null}
      ayuda={<>
        <span>Mira la bolita 🔴, sigue los vasos 🥤 durante la mezcla y toca dónde quedó: acierto suma <b>100 + 10 por ronda</b>.</span>
        <span>Controles: clic o dedo en el vaso; teclado <kbd>1</kbd>–<kbd>{vasos}</kbd>. <kbd>ENTER</kbd> o <kbd>ESPACIO</kbd> empieza.</span>
        <span>Puntuación: la media por ronda decide la victoria. Dificultad: <b>Fácil mezcla lenta</b>, <b>Normal media</b>, <b>Difícil rápida</b>.</span>
        <span>Consejo: sigue un solo vaso con la vista en vez de intentar verlos todos.</span>
      </>}>
      {fase === "inicio" && (
        <div className="fila-botones" role="group" aria-label="Dificultad">
          {[1, 2, 3].map(d => (
            <button key={d} className={dif === d ? "btn-principal" : "btn-suave"} onClick={() => { setDif(d); sfx.clic(); }}>{d === 1 ? "🟢 Fácil" : d === 2 ? "🟡 Normal" : "🔴 Difícil"}</button>
          ))}
        </div>
      )}
      <div className="xp-bar fina" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Progreso"><div style={{ width: `${pct}%` }} /></div>
      {fase !== "inicio" && (
        <>
          <p style={{ textAlign: "center", color: "var(--texto-suave)" }}>
            {fase === "mira" ? "👀 Mira la bolita…" : fase === "elige" ? "¿Dónde quedó? 👇" : "Fin de la partida"}
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
      <Resultado mensaje={mensaje} tipo={tipo} />
    </GameShell>
  );
}

export function DondeQuedo() {
  return <DondeBase titulo="¿Dónde Quedó?" vasos={3} rondas={8} tira="linear-gradient(135deg,#f59e0b,#a855f7)" iconoFondo="linear-gradient(135deg,#f59e0b,#a855f7)" />;
}
export function DondeQuedoPro() {
  return <DondeBase titulo="¿Dónde Quedó? Pro" vasos={5} rondas={8} tira="linear-gradient(135deg,#7c3aed,#f59e0b)" iconoFondo="linear-gradient(135deg,#7c3aed,#f59e0b)" />;
}
