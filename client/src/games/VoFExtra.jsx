import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { sfx } from "../suite/sonido";

/* Motor Verdadero/Falso extra: afirmaciones contra el crono. */
/* afirmaciones: [texto, esVerdadera] */
const DIFS = { "Fácil": { t: 90 }, "Normal": { t: 60 }, "Difícil": { t: 40 } };
function VoFBase({ titulo, emoji, banco, tira, iconoFondo }) {
  const { mensaje, tipo, registrarPunt } = useRegistro(titulo);
  const [dif, setDif] = useState("Normal");
  const totalT = DIFS[dif].t;
  const [afirm, setAfirm] = useState(null);
  const [restan, setRestan] = useState([]);
  const [puntos, setPuntos] = useState(0);
  const [racha, setRacha] = useState(0);
  const [tiempo, setTiempo] = useState(totalT);
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
    setPuntos(0); setRacha(0); setTiempo(DIFS[dif].t); setJugando(true);
    siguiente([]);
    sfx.clic();
  }

  function cambiarDif(d) {
    setDif(d);
    setTiempo(DIFS[d].t);
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
      sfx.bien();
    } else {
      st.current.racha = 0;
      st.current.puntos = Math.max(0, st.current.puntos - 10);
      setRacha(0); setPuntos(st.current.puntos);
      sfx.mal();
    }
    siguiente(st.current.restan);
  }

  useEffect(() => {
    const fn = (e) => {
      const tag = (e.target?.tagName || "").toUpperCase();
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if ((e.key === "Enter" || e.key === " ") && !jugando) {
        e.preventDefault();
        empezar();
        return;
      }
      if (!st.current.jugando) return;
      const k = String(e.key).toLowerCase();
      if (k === "v" || k === "1") responder(true);
      else if (k === "f" || k === "0" || k === "2") responder(false);
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }); // eslint-disable-line react-hooks/exhaustive-deps

  const pct = Math.max(0, Math.round((tiempo / totalT) * 100));
  return (
    <GameShell titulo={titulo} emoji={emoji}
      descripcion={`¿Verdadero o falso? · ${totalT}s · fallar resta 10.`}
      tira={tira} iconoFondo={iconoFondo}
      stats={[
        { icono: "⏱️", etiqueta: "Tiempo", valor: `${tiempo}s` },
        { icono: "⭐", etiqueta: "Puntos", valor: puntos },
        { icono: "🔥", etiqueta: "Racha", valor: racha },
        { icono: "🎚️", etiqueta: "Dificultad", valor: dif },
      ]}
      resultado={{ mensaje, tipo }}
      ayuda={(
        <div>
          <p><b>Reglas:</b> decide si cada afirmación es verdadera o falsa antes de que acabe el tiempo ({totalT}s).</p>
          <p><b>Controles:</b> ratón o táctil en los botones · teclado <kbd>V</kbd> verdadero, <kbd>F</kbd> falso (también <kbd>1</kbd>/<kbd>2</kbd>), <kbd>Enter</kbd>/<kbd>Espacio</kbd> para empezar.</p>
          <p><b>Puntuación:</b> +20 por acierto más bonus de racha; fallar resta 10. Victoria con 300+ puntos.</p>
          <p><b>Consejo:</b> las rachas dan hasta +20 extra: arriesga solo cuando estés seguro para no romperla.</p>
        </div>
      )}
      acciones={(
        <>
          {["Fácil", "Normal", "Difícil"].map(d => (
            <button key={d} className={dif === d ? "btn-principal" : "btn-suave"} disabled={jugando} onClick={() => cambiarDif(d)}>{d}</button>
          ))}
          {!jugando && <button className="btn-principal" onClick={empezar}>▶ Empezar ({totalT}s)</button>}
        </>
      )}>
      <div className="xp-bar fina" aria-hidden><div style={{ width: `${pct}%` }} /></div>
      {jugando && afirm && (
        <>
          <p style={{ textAlign: "center", fontSize: "1.25rem" }}><b>{afirm[0]}</b></p>
          <div className="fila-botones">
            <button className="btn-exito" style={{ fontSize: "1.2rem", padding: "12px 30px" }} onClick={() => responder(true)}>✅ Verdadero <kbd>V</kbd></button>
            <button className="btn-peligro" style={{ fontSize: "1.2rem", padding: "12px 30px" }} onClick={() => responder(false)}>❌ Falso <kbd>F</kbd></button>
          </div>
        </>
      )}
      <Resultado mensaje="" tipo="" />
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
