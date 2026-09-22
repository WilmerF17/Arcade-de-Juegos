import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { sfx } from "../suite/sonido";

/* Motor Verdadero/Falso: 12 afirmaciones, 60 segundos. */
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

export const VoFCiencia = VF("Verdad: Ciencia", "🔬", [
  ["El agua hierve a 100°C", true], ["La Luna tiene luz propia", false],
  ["El corazón bombea sangre", true], ["Los murciélagos son ciegos", false],
  ["El Sol es una estrella", true], ["El vidrio es líquido", false],
  ["Respiramos oxígeno", true], ["El oro se oxida fácil", false],
  ["La gravedad atrae todo", true], ["El hielo flota en agua", true],
  ["Las plantas respiran CO2 de día", true], ["El sonido viaja más rápido que la luz", false],
], "linear-gradient(135deg,#0ea5e9,#22c55e)", "linear-gradient(135deg,#0ea5e9,#22c55e)");

export const VoFHistoria = VF("Verdad: Historia", "🏛️", [
  ["Colón llegó a América en 1492", true], ["Los romanos usaban internet", false],
  ["Las pirámides están en Egipto", true], ["La Torre Eiffel está en Roma", false],
  ["Hubo Juegos Olímpicos antiguos", true], ["Los dinosaurios vieron humanos", false],
  ["La imprenta la inventó Gutenberg", true], ["Napoleón era altísimo", false],
  ["El Coliseo está en Roma", true], ["América se llama así por Colón", false],
  ["Existieron los samuráis", true], ["La Gran Muralla está en India", false],
], "linear-gradient(135deg,#b45309,#451a03)", "linear-gradient(135deg,#b45309,#451a03)");

export const VoFAnimales = VF("Verdad: Animales", "🦁", [
  ["La jirafa tiene el cuello largo", true], ["Los pingüinos vuelan", false],
  ["El elefante tiene trompa", true], ["Las arañas tienen 6 patas", false],
  ["El murciélago es mamífero", true], ["Los peces respiran aire", false],
  ["El canguro salta", true], ["El avestruz entierra la cabeza", false],
  ["El pulpo tiene 8 brazos", true], ["Los delfines son peces", false],
  ["El león ruge", true], ["Las abejas hacen miel", true],
], "linear-gradient(135deg,#a16207,#eab308)", "linear-gradient(135deg,#a16207,#eab308)");

export const VoFDeportes = VF("Verdad: Deportes", "🏅", [
  ["Un maratón mide unos 42 km", true], ["El fútbol se juega con 15 por equipo", false],
  ["Hay olimpiadas cada 4 años", true], ["El tenis se juega sin red", false],
  ["El ajedrez tiene 64 casillas", true], ["Nadar es un deporte", true],
  ["El boxeo usa guantes", true], ["El golf se juega en una pista de hielo", false],
  ["El ciclismo usa bicicleta", true], ["Un partido dura 10 minutos siempre", false],
  ["Existen los Juegos Paralímpicos", true], ["El esquí es de verano", false],
], "linear-gradient(135deg,#f59e0b,#ef4444)", "linear-gradient(135deg,#f59e0b,#ef4444)");

export const VoFGeo = VF("Verdad: Mundo", "🌍", [
  ["El Sahara es un desierto", true], ["El Everest es la montaña más alta", true],
  ["El Pacífico es el mayor océano", true], ["Madrid es capital de Italia", false],
  ["El Amazonas está en América", true], ["Australia es un continente", true],
  ["El Nilo está en África", true], ["Tokio está en China", false],
  ["Hay 7 continentes", true], ["La Antártida es cálida", false],
  ["España está en Europa", true], ["El Mediterráneo es un océano", false],
], "linear-gradient(135deg,#16a34a,#0ea5e9)", "linear-gradient(135deg,#16a34a,#0ea5e9)");

export const VoFCuerpo = VF("Verdad: Cuerpo", "🫀", [
  ["Tenemos 5 sentidos", true], ["El corazón late siempre", true],
  ["Los huesos son blandos", false], ["El cerebro piensa", true],
  ["Respiramos con los pulmones", true], ["La piel es el órgano mayor", true],
  ["Los músculos se cansan", true], ["Podemos vivir sin dormir", false],
  ["Las uñas crecen", true], ["El pelo siente dolor", false],
  ["Caminar es ejercicio", true], ["Los ojos ven de noche como gatos", false],
], "linear-gradient(135deg,#ef4444,#f59e0b)", "linear-gradient(135deg,#ef4444,#f59e0b)");

export const VoFMusica = VF("Verdad: Música", "🎵", [
  ["El piano tiene 88 teclas", true], ["El violín tiene 6 cuerdas", false],
  ["La guitarra tiene 6 cuerdas", true], ["El pentagrama tiene 5 líneas", true],
  ["La batería se golpea", true], ["La flauta se sopla", true],
  ["Un coro canta en grupo", true], ["La ópera es muda", false],
  ["El director usa batuta", true], ["El saxofón es de cuerda", false],
  ["Existen los conciertos", true], ["El silencio es una nota", false],
], "linear-gradient(135deg,#8b5cf6,#ec4899)", "linear-gradient(135deg,#8b5cf6,#ec4899)");

export const VoFComida = VF("Verdad: Comida", "🍽️", [
  ["La paella lleva arroz", true], ["La pizza es japonesa", false],
  ["El sushi lleva pescado", true], ["El pan se hace con harina", true],
  ["El chocolate sale del cacao", true], ["La fruta tiene vitaminas", true],
  ["El agua engorda", false], ["Freír es más sano que hervir", false],
  ["La leche sale de la vaca", true], ["El azúcar es salado", false],
  ["Hay que lavarse las manos", true], ["Comer rápido es ideal", false],
], "linear-gradient(135deg,#ea580c,#facc15)", "linear-gradient(135deg,#ea580c,#facc15)");
