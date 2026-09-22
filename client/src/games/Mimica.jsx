import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { sfx } from "../suite/sonido";

/* Mímica: actúa la palabra antes de que acabe el tiempo. Puntos por acierto. */
function MimicaBase({ titulo, banco, tira, iconoFondo }) {
  const { mensaje, tipo, registrarPunt } = useRegistro(titulo);
  const [palabra, setPalabra] = useState("");
  const [tiempo, setTiempo] = useState(60);
  const [puntos, setPuntos] = useState(0);
  const [aciertos, setAciertos] = useState(0);
  const [jugando, setJugando] = useState(false);
  const st = useRef({ puntos: 0, aciertos: 0, jugando: false });

  function nueva() {
    setPalabra(banco[Math.floor(Math.random() * banco.length)]);
  }

  function empezar() {
    st.current = { puntos: 0, aciertos: 0, jugando: true };
    setPuntos(0); setAciertos(0); setTiempo(60); setJugando(true);
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
    sfx.clic();
    nueva();
  }

  return (
    <GameShell titulo={titulo} emoji="🤹"
      descripcion="Actúa sin hablar y que tu equipo adivine · 60s · +100 por acierto."
      tira={tira} iconoFondo={iconoFondo}>
      <div className="fila-botones">
        <span className="chip">⏱ <b>{tiempo}s</b></span>
        <span className="chip">✅ <b>{aciertos}</b></span>
        <span className="chip">Puntos: <b>{puntos}</b></span>
      </div>
      {!jugando && (
        <div className="fila-botones"><button className="btn-principal" onClick={empezar}>▶ Empezar (60s)</button></div>
      )}
      {jugando && (
        <>
          <p style={{ textAlign: "center", fontSize: "2.6rem", fontWeight: 800 }}>{palabra}</p>
          <div className="fila-botones">
            <button className="btn-exito" onClick={acierto}>✅ ¡Adivinada!</button>
            <button className="btn-suave" onClick={pasar}>⏭ Pasar</button>
          </div>
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
