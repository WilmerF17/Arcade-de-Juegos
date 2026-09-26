import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { sfx } from "../suite/sonido";

/* Destreza (tendencia aim-trainer): toca las dianas antes de que se apaguen.
   3 variantes de ritmo/objetivo. 100% táctil: botones grandes, sin teclado. */
function DestrezaMotor({ nombre, emoji, descripcion, ayuda, tiempo, objetivo, intervalo }) {
  const { mensaje, tipo, registrarPunt } = useRegistro(nombre);
  const [activas, setActivas] = useState([]);
  const [puntos, setPuntos] = useState(0);
  const [fallos, setFallos] = useState(0);
  const [quedan, setQuedan] = useState(tiempo);
  const [jugando, setJugando] = useState(false);
  const [fin, setFin] = useState(false);
  const timers = useRef([]);
  const idRef = useRef(0);

  useEffect(() => () => timers.current.forEach(clearInterval), []);

  function limpiar() { timers.current.forEach(clearInterval); timers.current = []; }

  function empezar() {
    limpiar();
    setPuntos(0); setFallos(0); setQuedan(tiempo); setFin(false); setJugando(true); setActivas([]);
    sfx.clic();
    const gen = setInterval(() => {
      const id = ++idRef.current;
      const pos = Math.floor(Math.random() * 9);
      setActivas(a => [...a.slice(-4), { id, pos }]);
      timers.current.push(setTimeout(() => setActivas(a => a.filter(d => d.id !== id)), Math.max(500, intervalo * 1.4)));
    }, intervalo);
    timers.current.push(gen);
    const reloj = setInterval(() => {
      setQuedan(q => {
        if (q <= 1) {
          clearInterval(reloj);
          return 0;
        }
        return q - 1;
      });
    }, 1000);
    timers.current.push(reloj);
  }

  useEffect(() => {
    if (jugando && quedan === 0 && !fin) {
      setJugando(false); setFin(true); limpiar(); setActivas([]);
      const pts = puntos * 5 - fallos * 2;
      registrarPunt(Math.max(5, pts), puntos >= objetivo ? 1 : 0);
      if (puntos >= objetivo) sfx.bien(); else sfx.mal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quedan]);

  function tocarCelda(pos) {
    if (!jugando) return;
    const d = activas.find(x => x.pos === pos);
    if (d) {
      setActivas(a => a.filter(x => x.id !== d.id));
      setPuntos(p => p + 1);
      sfx.bien();
    } else {
      setFallos(f => f + 1);
      sfx.mal();
    }
  }

  return (
    <GameShell titulo={nombre} emoji={emoji}
      descripcion={descripcion}
      stats={[
        { etiqueta: "Dianas", valor: `${puntos}/${objetivo}` },
        { etiqueta: "Tiempo", valor: `${quedan}s` },
        ...(fallos ? [{ etiqueta: "Fallos", valor: fallos }] : []),
      ]}
      resultado={{ mensaje, tipo }}
      ayuda={<span>{ayuda}</span>}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, maxWidth: 340, margin: "0 auto" }}>
        {Array.from({ length: 9 }, (_, pos) => {
          const on = activas.some(d => d.pos === pos);
          return (
            <button key={pos} onClick={() => tocarCelda(pos)}
              className={on ? "btn-principal" : "btn-suave"}
              style={{ minHeight: 64, fontSize: "1.8rem", touchAction: "manipulation" }}
              aria-label={on ? "¡Diana! tócala" : "casilla vacía"}>
              {on ? emoji : "·"}
            </button>
          );
        })}
      </div>
      <div className="fila-botones">
        {!jugando && <button className="btn-principal" onClick={empezar}>{fin ? "🔁 Otra vez" : `▶️ Jugar (${tiempo}s)`}</button>}
        {fin && <span className={`chip${puntos >= objetivo ? " victoria" : ""}`}>{puntos >= objetivo ? `✅ ¡Meta! ${puntos} dianas` : `${puntos}/${objetivo} dianas`}</span>}
      </div>
      <Resultado mensaje={mensaje} tipo={tipo} />
    </GameShell>
  );
}

export default function AimPro() {
  return <DestrezaMotor nombre="Aim Pro" emoji="🎯" tiempo={30} objetivo={20} intervalo={750}
    descripcion="Aim-trainer: toca 20 dianas en 30 segundos."
    ayuda={<>Las dianas <b>🎯</b> aparecen y se apagan solas. Toca rápido pero sin fallar: cada fallo resta. Ideal para calentar en shooters.</>} />;
}
export function ReflejoNeon() {
  return <DestrezaMotor nombre="Reflejo Neón" emoji="⚡" tiempo={20} objetivo={15} intervalo={550}
    descripcion="Reflejos a tope: 15 dianas en 20 segundos."
    ayuda={<>Versión <b>exprés</b>: aparecen muy rápido y duran poco. Sesiones de 20 segundos, perfectas para el móvil.</>} />;
}
export function DianaLenta() {
  return <DestrezaMotor nombre="Diana Tranquila" emoji="🌸" tiempo={45} objetivo={18} intervalo={1050}
    descripcion="Modo relajado: 18 dianas en 45 segundos."
    ayuda={<>Versión <b>tranquila</b> para peques o para jugar sin estrés. Las dianas aguantan más tiempo encendidas.</>} />;
}
