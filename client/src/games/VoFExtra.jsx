import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { sfx } from "../suite/sonido";

/* Motor Verdadero/Falso extra: 12 afirmaciones, 60 segundos. */
/* afirmaciones: [texto, esVerdadera] */
function VoFBase({ titulo, emoji, banco, tira, iconoFondo }) {
  const { mensaje, tipo, registrarPunt } = useRegistro(titulo);
  const [afirm, setAfirm] = useState(null);
  const [restan, setRestan] = useState([]);
  const [puntos, setPuntos] = useState(0);
  const [racha, setRacha] = useState(0);
  const [tiempo, setTiempo] = useState(60);
  const [jugando, setJugando] = useState(false);
  const st = useRef({ puntos: 0, racha: 0, jugando: false, actual: null, restan: [] });

  function siguiente(rest) {
    const r = rest.length ? rest : [...banco].sort(() => Math.random() - 0.5);
    const [a, ...cola] = r;
    st.current.actual = a;
    st.current.restan = cola;
    setAfirm(a);
    setRestan(cola);
  }

  function empezar() {
    st.current = { puntos: 0, racha: 0, jugando: true, actual: null, restan: [] };
    setPuntos(0); setRacha(0); setTiempo(60); setJugando(true);
    siguiente([]);
    sfx.clic();
  }

  useEffect(() => {
    if (!jugando) return;
    if (tiempo <= 0) {
      st.current.jugando = false;
      setJugando(false);
      registrarPunt(st.current.puntos, st.current.puntos >= 300 ? 1 : 0);
      return;
    }
    const id = setTimeout(() => setTiempo(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [jugando, tiempo]); // eslint-disable-line react-hooks/exhaustive-deps

  function responder(v) {
    if (!st.current.jugando) return;
    if (v === st.current.actual[1]) {
      const nr = st.current.racha + 1;
      st.current.racha = nr;
      st.current.puntos += 20 + Math.min(20, nr * 2);
      setRacha(nr); setPuntos(st.current.puntos);
      sfx.clic();
    } else {
      st.current.racha = 0;
      st.current.puntos = Math.max(0, st.current.puntos - 10);
      setRacha(0); setPuntos(st.current.puntos);
      sfx.mal();
    }
    siguiente(st.current.restan);
  }

  return (
    <GameShell titulo={titulo} emoji={emoji}
      descripcion="¿Verdadero o falso? · 60s · fallar resta 10."
      tira={tira} iconoFondo={iconoFondo}>
      <div className="fila-botones">
        <span className="chip">⏱ <b>{tiempo}s</b></span>
        <span className="chip">Puntos: <b>{puntos}</b></span>
        <span className="chip">🔥 <b>{racha}</b></span>
      </div>
      {!jugando && (
        <div className="fila-botones"><button className="btn-principal" onClick={empezar}>▶ Empezar (60s)</button></div>
      )}
      {jugando && afirm && (
        <>
          <p style={{ textAlign: "center", fontSize: "1.25rem" }}><b>{afirm[0]}</b></p>
          <div className="fila-botones">
            <button className="btn-exito" style={{ fontSize: "1.2rem", padding: "12px 30px" }} onClick={() => responder(true)}>✅ Verdadero</button>
            <button className="btn-peligro" style={{ fontSize: "1.2rem", padding: "12px 30px" }} onClick={() => responder(false)}>❌ Falso</button>
          </div>
        </>
      )}
      <Resultado mensaje={mensaje} tipo={tipo} />
    </GameShell>
  );
}

const VF = (titulo, emoji, banco, tira, iconoFondo) => function Comp() {
  return <VoFBase titulo={titulo} emoji={emoji} banco={banco} tira={tira} iconoFondo={iconoFondo} />;
};

export const VoFArte = VF("Verdad: Arte", "🎨", [
  ["La Mona Lisa la pintó Da Vinci", true], ["El Guernica lo pintó Dalí", false],
  ["Miguel Ángel esculpió el David", true], ["La música no es arte", false],
  ["El teatro es arte escénico", true], ["La fotografía puede ser arte", true],
  ["Picasso pintó de azul una época", true], ["Frida Kahlo era francesa", false],
  ["El origami es arte japonés", true], ["Un museo guarda obras", true],
  ["El grafiti nunca es arte", false], ["La danza cuenta historias", true],
], "linear-gradient(135deg,#ec4899,#8b5cf6)", "linear-gradient(135deg,#ec4899,#8b5cf6)");

export const VoFCine = VF("Verdad: Cine", "🎬", [
  ["El cine cuenta historias con imagen", true], ["Una peli muda tiene diálogos hablados", false],
  ["El director dirige la peli", true], ["Los dibujos animados son cine", true],
  ["El palomitero es de la sala", true], ["Un corto dura 3 horas", false],
  ["Existen festivales de cine", true], ["El guion se escribe antes de rodar", true],
  ["El doblaje cambia las voces", true], ["Todas las pelis son en blanco y negro", false],
  ["Hay cine de comedia y terror", true], ["El público no importa", false],
], "linear-gradient(135deg,#7c3aed,#0ea5e9)", "linear-gradient(135deg,#7c3aed,#0ea5e9)");

export const VoFNatura = VF("Verdad: Naturaleza", "🌿", [
  ["Los árboles dan oxígeno", true], ["El desierto siempre es frío", false],
  ["Las abejas polinizan flores", true], ["Los ríos desembocan en el mar", true],
  ["La lluvia riega las plantas", true], ["El hielo es agua sólida", true],
  ["Los volcanes escupen lava", true], ["El arcoíris sale de noche", false],
  ["Hay animales nocturnos", true], ["La nieve quema como el fuego", false],
  ["Las plantas necesitan luz", true], ["El viento mueve las nubes", true],
], "linear-gradient(135deg,#16a34a,#84cc16)", "linear-gradient(135deg,#16a34a,#84cc16)");
