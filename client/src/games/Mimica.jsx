import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { sfx } from "../suite/sonido";
import { escribiendo } from "../suite/teclado";

/* Mímica: actúa la palabra antes de que acabe el tiempo. Puntos por acierto. */
const CONF_DIF = { 1: { tiempo: 90, nombre: "Fácil" }, 2: { tiempo: 60, nombre: "Normal" }, 3: { tiempo: 45, nombre: "Difícil" } };
function MimicaBase({ titulo, banco, tira, iconoFondo }) {
  const { mensaje, tipo, registrarPunt } = useRegistro(titulo);
  const [palabra, setPalabra] = useState("");
  const [dif, setDif] = useState(2);
  const [tiempo, setTiempo] = useState(CONF_DIF[2].tiempo);
  const [puntos, setPuntos] = useState(0);
  const [aciertos, setAciertos] = useState(0);
  const [pasadas, setPasadas] = useState(0);
  const [jugando, setJugando] = useState(false);
  const st = useRef({ puntos: 0, aciertos: 0, jugando: false });
  const jugandoRef = useRef(false);
  jugandoRef.current = jugando;
  const aciertoRef = useRef(null);
  const pasarRef = useRef(null);

  function nueva() {
    setPalabra(banco[Math.floor(Math.random() * banco.length)]);
  }

  function empezar() {
    st.current = { puntos: 0, aciertos: 0, jugando: true };
    setPuntos(0); setAciertos(0); setPasadas(0); setTiempo(CONF_DIF[dif].tiempo); setJugando(true);
    nueva();
    sfx.clic();
  }

  useEffect(() => {
    if (!jugando) return;
    if (tiempo <= 0) {
      st.current.jugando = false;
      setJugando(false);
      registrarPunt(st.current.puntos, st.current.aciertos >= 6 ? 1 : 0);
      return;
    }
    const id = setTimeout(() => setTiempo(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [jugando, tiempo]); // eslint-disable-line react-hooks/exhaustive-deps

  function acierto() {
    if (!st.current.jugando) return;
    st.current.aciertos++;
    st.current.puntos += 100;
    setAciertos(st.current.aciertos); setPuntos(st.current.puntos);
    sfx.bien();
    nueva();
  }
  function pasar() {
    if (!st.current.jugando) return;
    setPasadas(p => p + 1);
    sfx.clic();
    nueva();
  }
  aciertoRef.current = acierto;
  pasarRef.current = pasar;

  useEffect(() => {
    const fn = e => {
      if (escribiendo()) return;
      if ((e.key === "Enter" || e.key === " ") && !jugandoRef.current) {
        e.preventDefault();
        empezar();
        return;
      }
      if (!jugandoRef.current) return;
      const k = e.key.toLowerCase();
      if (k === "c" || e.key === "ArrowRight") aciertoRef.current();
      else if (k === "p" || e.key === "ArrowLeft") pasarRef.current();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dif]);

  const total = CONF_DIF[dif].tiempo;
  const pct = Math.max(0, Math.round((tiempo / total) * 100));

  return (
    <GameShell titulo={titulo} emoji="🤹"
      descripcion={`Actúa sin hablar y que tu equipo adivine · ${total}s · +100 por acierto.`}
      tira={tira} iconoFondo={iconoFondo}
      stats={[
        { icono: "⏱", etiqueta: "Tiempo", valor: `${tiempo}s` },
        { icono: "✅", etiqueta: "Aciertos", valor: aciertos },
        { icono: "⭐", etiqueta: "Puntos", valor: puntos },
        { icono: "🎯", etiqueta: "Dificultad", valor: CONF_DIF[dif].nombre },
      ]}
      acciones={!jugando ? <button className="btn-principal" onClick={empezar}>▶ Empezar ({total}s)</button> : null}
      ayuda={<>
        <span>Actúa la palabra <b>sin hablar</b> para que tu equipo la adivine: cada acierto suma <b>100</b>. Puedes pasar las difíciles.</span>
        <span>Controles: botones o teclas <kbd>C</kbd>/<kbd>→</kbd> adivinada y <kbd>P</kbd>/<kbd>←</kbd> pasar. <kbd>ENTER</kbd> empieza.</span>
        <span>Puntuación: con <b>6+ aciertos</b> la partida cuenta como victoria. Dificultad: <b>Fácil 90s</b>, <b>Normal 60s</b>, <b>Difícil 45s</b>.</span>
        <span>Consejo: actúa la idea general primero y luego los detalles.</span>
      </>}>
      {!jugando && !palabra && (
        <div className="fila-botones" role="group" aria-label="Dificultad">
          {[1, 2, 3].map(d => (
            <button key={d} className={dif === d ? "btn-principal" : "btn-suave"} onClick={() => { setDif(d); setTiempo(CONF_DIF[d].tiempo); sfx.clic(); }}>{d === 1 ? "🟢 Fácil" : d === 2 ? "🟡 Normal" : "🔴 Difícil"}</button>
          ))}
        </div>
      )}
      <div className="xp-bar fina" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Tiempo restante"><div style={{ width: `${pct}%` }} /></div>
      {jugando && (
        <>
          <p style={{ textAlign: "center", fontSize: "2.6rem", fontWeight: 800 }}>{palabra}</p>
          <div className="fila-botones">
            <button className="btn-exito" onClick={acierto}>✅ ¡Adivinada! <kbd>C</kbd></button>
            <button className="btn-suave" onClick={pasar}>⏭ Pasar <kbd>P</kbd></button>
          </div>
          {pasadas > 0 && <p style={{ textAlign: "center", color: "var(--texto-suave)" }}>⏭ Pasadas: <b>{pasadas}</b></p>}
        </>
      )}
      <Resultado mensaje={mensaje} tipo={tipo} />
    </GameShell>
  );
}

const FACIL = ["perro", "gato", "avión", "árbol", "pelota", "teléfono", "guitarra", "dentista", "lluvia", "cocodrilo", "superhéroe", "bailarina", "pirata", "robot", "sirena", "vampiro", "payaso", "albañil", "canguro", "astronauta"];
const PELIS = ["Tiburón gigante", "Viaje a la luna", "Carrera de coches", "Monstruo marino", "Superhéroe volador", "Baile final", "Persecución policial", "Naufragio", "Dinosaurio", "Robot gigante", "Fiesta sorpresa", "Partido final", "Magia", "Duelo de espadas", "Viaje en el tiempo"];

export function Mimica() {
  return <MimicaBase titulo="Mímica" banco={FACIL} tira="linear-gradient(90deg,#a855f7,#f59e0b)" iconoFondo="linear-gradient(135deg,#a855f7,#f59e0b)" />;
}
export function MimicaPelis() {
  return <MimicaBase titulo="Mímica: Pelis" banco={PELIS} tira="linear-gradient(90deg,#57534e,#a855f7)" iconoFondo="linear-gradient(135deg,#57534e,#a855f7)" />;
}
