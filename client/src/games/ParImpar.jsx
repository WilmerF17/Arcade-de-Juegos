import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { sfx } from "../suite/sonido";
import { escribiendo } from "../suite/teclado";

/* Par o Impar Relámpago: clasifica números con ←/→ o botones. */
const TIEMPOS = { 1: 45, 2: 30, 3: 20 };
const NOMBRE_DIF = { 1: "Fácil", 2: "Normal", 3: "Difícil" };
export default function ParImpar() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Par o Impar Relámpago");
  const [num, setNum] = useState(null);
  const [puntos, setPuntos] = useState(0);
  const [racha, setRacha] = useState(0);
  const [mejorRacha, setMejorRacha] = useState(0);
  const [aciertos, setAciertos] = useState(0);
  const [dif, setDif] = useState(2);
  const [tiempo, setTiempo] = useState(TIEMPOS[2]);
  const [jugando, setJugando] = useState(false);
  const st = useRef({ puntos: 0, racha: 0, jugando: false, num: null });
  const jugandoRef = useRef(false);
  jugandoRef.current = jugando;

  function nuevoNumero() {
    const n = 10 + Math.floor(Math.random() * 90);
    st.current.num = n;
    setNum(n);
  }

  function empezar() {
    st.current = { puntos: 0, racha: 0, jugando: true, num: null };
    setPuntos(0); setRacha(0); setMejorRacha(0); setAciertos(0); setTiempo(TIEMPOS[dif]); setJugando(true);
    nuevoNumero();
    sfx.clic();
  }

  useEffect(() => {
    if (!jugando) return;
    if (tiempo <= 0) {
      st.current.jugando = false;
      setJugando(false);
      registrarPunt(st.current.puntos, st.current.puntos >= 200 ? 1 : 0);
      return;
    }
    const id = setTimeout(() => setTiempo(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [jugando, tiempo]); // eslint-disable-line react-hooks/exhaustive-deps

  function responder(par) {
    if (!st.current.jugando) return;
    const esPar = st.current.num % 2 === 0;
    if ((par && esPar) || (!par && !esPar)) {
      const nr = st.current.racha + 1;
      st.current.racha = nr;
      st.current.puntos += 10 + Math.min(15, nr);
      setRacha(nr); setPuntos(st.current.puntos);
      setMejorRacha(m => Math.max(m, nr));
      setAciertos(a => a + 1);
      sfx.bien();
    } else {
      st.current.racha = 0;
      st.current.puntos = Math.max(0, st.current.puntos - 5);
      setRacha(0); setPuntos(st.current.puntos);
      sfx.mal();
    }
    nuevoNumero();
  }

  const respRef = useRef(responder);
  respRef.current = responder;
  const empezarRef = useRef(empezar);
  empezarRef.current = empezar;
  useEffect(() => {
    const fn = e => {
      if (escribiendo()) return;
      if ((e.key === "Enter" || e.key === " ") && !jugandoRef.current) {
        e.preventDefault();
        empezarRef.current();
        return;
      }
      if (!jugandoRef.current) return;
      if (e.key === "ArrowLeft" || e.key.toLowerCase() === "p") respRef.current(true);
      if (e.key === "ArrowRight" || e.key.toLowerCase() === "i") respRef.current(false);
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  const total = TIEMPOS[dif];
  const pct = Math.max(0, Math.round((tiempo / total) * 100));

  return (
    <GameShell titulo="Par o Impar Relámpago" emoji="⚡"
      descripcion={`← PAR · → IMPAR · ${total}s · los fallos restan 5.`}
      tira="linear-gradient(90deg,#facc15,#ff3d5a)" iconoFondo="linear-gradient(135deg,#facc15,#ff3d5a)"
      stats={[
        { icono: "⏱", etiqueta: "Tiempo", valor: `${tiempo}s` },
        { icono: "⭐", etiqueta: "Puntos", valor: puntos },
        { icono: "🔥", etiqueta: "Racha", valor: `×${racha}` },
        { icono: "🎯", etiqueta: "Dificultad", valor: NOMBRE_DIF[dif] },
      ]}
      acciones={!jugando ? <button className="btn-principal" onClick={empezar}>▶ Empezar ({total}s)</button> : null}
      ayuda={<>
        <span>Clasifica cada número como <b>par</b> o <b>impar</b>: acierto suma <b>10 + racha</b>, fallo resta <b>5</b>.</span>
        <span>Controles: botones, teclas <kbd>←</kbd> par y <kbd>→</kbd> impar (o <kbd>P</kbd>/<kbd>I</kbd>), dedo en móvil. <kbd>ENTER</kbd> o <kbd>ESPACIO</kbd> empieza.</span>
        <span>Puntuación: con <b>200+</b> la partida cuenta como victoria. Dificultad: <b>Fácil 45s</b>, <b>Normal 30s</b>, <b>Difícil 20s</b>.</span>
        <span>Consejo: mira solo la última cifra para decidir en un instante.</span>
      </>}>
      {!jugando && (
        <div className="fila-botones" role="group" aria-label="Dificultad">
          {[1, 2, 3].map(d => (
            <button key={d} className={dif === d ? "btn-principal" : "btn-suave"} onClick={() => { setDif(d); setTiempo(TIEMPOS[d]); sfx.clic(); }}>{d === 1 ? "🟢 Fácil" : d === 2 ? "🟡 Normal" : "🔴 Difícil"}</button>
          ))}
        </div>
      )}
      <div className="xp-bar fina" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Tiempo restante"><div style={{ width: `${pct}%` }} /></div>
      {jugando && num !== null && (
        <>
          <p style={{ textAlign: "center", fontSize: "3.4rem", fontWeight: 800, margin: "8px 0" }}>{num}</p>
          <div className="fila-botones">
            <button className="btn-principal" onClick={() => responder(true)}>← PAR <kbd>←</kbd></button>
            <button className="btn-suave" onClick={() => responder(false)}>IMPAR → <kbd>→</kbd></button>
          </div>
          <p style={{ textAlign: "center", color: "var(--texto-suave)" }}>✅ {aciertos} aciertos{mejorRacha >= 2 && <> · 🔥 mejor ×{mejorRacha}</>}</p>
        </>
      )}
      <Resultado mensaje={mensaje} tipo={tipo} />
    </GameShell>
  );
}
