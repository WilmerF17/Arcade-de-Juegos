import { useState } from "react";
import GameShell, { useRegistro } from "../ui/GameShell";
import { sfx } from "../suite/sonido";

/* Motor "¿qué emoji es?": lee la descripción y elige el emoji. 10 rondas. */
/* item: [emoji, descripcion] */
function EmojiBase({ titulo, emoji, banco, tira, iconoFondo }) {
  const { mensaje, tipo, registrarPunt } = useRegistro(titulo);
  const [ronda, setRonda] = useState(null);
  const [idx, setIdx] = useState(0);
  const [puntos, setPuntos] = useState(0);
  const [racha, setRacha] = useState(0);
  const [jugando, setJugando] = useState(false);

  const RONDAS = 10;

  function nuevaRonda() {
    const [e, d] = banco[Math.floor(Math.random() * banco.length)];
    const dist = banco.filter(([x]) => x !== e).sort(() => Math.random() - 0.5).slice(0, 3).map(([x]) => x);
    setRonda({ emoji: e, desc: d, opciones: [e, ...dist].sort(() => Math.random() - 0.5) });
  }

  function empezar() {
    setPuntos(0); setRacha(0); setIdx(1); setJugando(true);
    nuevaRonda();
    sfx.clic();
  }

  function elegir(x) {
    if (!jugando) return;
    if (x === ronda.emoji) {
      const nr = racha + 1;
      const np = puntos + 100 + Math.min(50, nr * 10);
      setRacha(nr); setPuntos(np);
      sfx.bien();
    } else {
      setRacha(0);
      sfx.mal();
    }
    if (idx >= RONDAS) {
      setJugando(false);
      registrarPunt(puntos + (x === ronda.emoji ? 100 : 0), puntos >= 600 ? 1 : 0);
    } else {
      nuevaRonda();
      setIdx(idx + 1);
    }
  }

  return (
    <GameShell titulo={titulo} emoji={emoji}
      descripcion="Lee la descripción y toca su emoji · 10 rondas."
      tira={tira} iconoFondo={iconoFondo}>
      <div className="fila-botones" style={{ marginTop: 0 }}>
        <span className="chip">Ronda: <b>{jugando ? `${idx}/${RONDAS}` : "—"}</b></span>
        <span className="chip">Puntos: <b>{puntos}</b></span>
        <span className="chip">🔥 <b>{racha}</b></span>
      </div>
      {!jugando && idx === 0 && (
        <div className="fila-botones"><button className="btn-principal" onClick={empezar}>▶ Empezar</button></div>
      )}
      {jugando && ronda && (
        <>
          <p style={{ textAlign: "center", fontSize: "1.25rem" }}>¿Cuál es <b>{ronda.desc}</b>?</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            {ronda.opciones.map(o => (
              <button key={o} className="btn-suave" style={{ fontSize: "2.4rem", padding: "12px 18px" }} onClick={() => elegir(o)}>{o}</button>
            ))}
          </div>
        </>
      )}
      {mensaje && <div className={`mensaje-final ${tipo}`}>{mensaje}</div>}
      {!jugando && idx > 0 && !mensaje && (
        <div className="fila-botones"><button className="btn-principal" onClick={empezar}>↻ Otra vez</button></div>
      )}
    </GameShell>
  );
}

const EQ = (titulo, emoji, banco, tira, iconoFondo) => function Comp() {
  return <EmojiBase titulo={titulo} emoji={emoji} banco={banco} tira={tira} iconoFondo={iconoFondo} />;
};

export const EmojiAnimales = EQ("Emoji: Animales", "🐾", [
  ["🐶", "el perro"], ["🐱", "el gato"], ["🦊", "el zorro"], ["🐼", "el panda"],
  ["🦁", "el león"], ["🐸", "la rana"], ["🐵", "el mono"], ["🐷", "el cerdo"],
  ["🐮", "la vaca"], ["🦆", "el pato"], ["🐢", "la tortuga"], ["🐝", "la abeja"],
], "linear-gradient(135deg,#a16207,#eab308)", "linear-gradient(135deg,#a16207,#eab308)");

export const EmojiComida = EQ("Emoji: Comida", "🍕", [
  ["🍎", "la manzana"], ["🍕", "la pizza"], ["🌮", "el taco"], ["🍣", "el sushi"],
  ["🍔", "la hamburguesa"], ["🍩", "el dónut"], ["🍿", "las palomitas"], ["🍦", "el helado"],
  ["🥑", "el aguacate"], ["🍇", "la uva"], ["🥕", "la zanahoria"], ["🧀", "el queso"],
], "linear-gradient(135deg,#ea580c,#facc15)", "linear-gradient(135deg,#ea580c,#facc15)");

export const EmojiDeportes = EQ("Emoji: Deportes", "⚽", [
  ["⚽", "el fútbol"], ["🏀", "el baloncesto"], ["🎾", "el tenis"], ["🏊", "la natación"],
  ["🚴", "el ciclismo"], ["🥊", "el boxeo"], ["🎿", "el esquí"], ["🏉", "el rugby"],
  ["🏓", "el ping-pong"], ["⛳", "el golf"], ["🤿", "el buceo"], ["🧗", "la escalada"],
], "linear-gradient(135deg,#f59e0b,#ef4444)", "linear-gradient(135deg,#f59e0b,#ef4444)");

export const EmojiObjetos = EQ("Emoji: Objetos", "💡", [
  ["💡", "la bombilla"], ["📱", "el móvil"], ["💻", "el portátil"], ["⌚", "el reloj"],
  ["🔑", "la llave"], ["✏️", "el lápiz"], ["📚", "los libros"], ["🎁", "el regalo"],
  ["☂️", "el paraguas"], ["🔨", "el martillo"], ["🧲", "el imán"], ["🕯️", "la vela"],
], "linear-gradient(135deg,#64748b,#0ea5e9)", "linear-gradient(135deg,#64748b,#0ea5e9)");

export const EmojiNaturaleza = EQ("Emoji: Naturaleza", "🌿", [
  ["🌲", "el pino"], ["🌸", "la flor"], ["🍄", "la seta"], ["🌵", "el cactus"],
  ["🌙", "la luna"], ["☀️", "el sol"], ["🌊", "la ola"], ["🔥", "el fuego"],
  ["❄️", "la nieve"], ["🌈", "el arcoíris"], ["⛰️", "la montaña"], ["🏝️", "la isla"],
], "linear-gradient(135deg,#22c55e,#0ea5e9)", "linear-gradient(135deg,#22c55e,#0ea5e9)");

export const EmojiViajes = EQ("Emoji: Viajes", "✈️", [
  ["✈️", "el avión"], ["🚗", "el coche"], ["🚂", "el tren"], ["🚲", "la bici"],
  ["⛵", "el velero"], ["🚁", "el helicóptero"], ["🚀", "el cohete"], ["🗺️", "el mapa"],
  ["🏨", "el hotel"], ["🎒", "la mochila"], ["📷", "la cámara"], ["🧳", "la maleta"],
], "linear-gradient(135deg,#0ea5e9,#6366f1)", "linear-gradient(135deg,#0ea5e9,#6366f1)");
