import { useEffect, useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { sfx } from "../suite/sonido";

/* Motor "¿qué emoji es?": lee la descripción y elige el emoji. */
const DIFS = { "Fácil": { n: 6 }, "Normal": { n: 8 }, "Difícil": { n: 10 } };
function EmojiBase({ titulo, emoji, banco, tira, iconoFondo }) {
  const { mensaje, tipo, registrarPunt } = useRegistro(titulo);
  const [dif, setDif] = useState("Normal");
  const RONDAS = Math.min(DIFS[dif].n, banco.length);
  const [ronda, setRonda] = useState(null);
  const [idx, setIdx] = useState(0);
  const [puntos, setPuntos] = useState(0);
  const [racha, setRacha] = useState(0);
  const [jugando, setJugando] = useState(false);

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

  useEffect(() => {
    const fn = (e) => {
      const tag = (e.target?.tagName || "").toUpperCase();
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if ((e.key === "Enter" || e.key === " ") && !jugando) {
        e.preventDefault();
        empezar();
        return;
      }
      if (!jugando || !ronda) return;
      const k = String(e.key).toLowerCase();
      let i = -1;
      if (["1", "2", "3", "4"].includes(e.key)) i = parseInt(e.key, 10) - 1;
      else if (["a", "b", "c", "d"].includes(k)) i = "abcd".indexOf(k);
      if (i >= 0 && i < ronda.opciones.length) elegir(ronda.opciones[i]);
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }); // eslint-disable-line react-hooks/exhaustive-deps

  const pct = RONDAS ? Math.round(((idx - (jugando ? 1 : 0)) / RONDAS) * 100) : 0;
  return (
    <GameShell titulo={titulo} emoji={emoji}
      descripcion={`Lee la descripción y toca su emoji · ${RONDAS} rondas.`}
      tira={tira} iconoFondo={iconoFondo}
      stats={[
        { icono: "😀", etiqueta: "Ronda", valor: jugando ? `${idx}/${RONDAS}` : "—" },
        { icono: "⭐", etiqueta: "Puntos", valor: puntos },
        { icono: "🔥", etiqueta: "Racha", valor: racha },
        { icono: "🎚️", etiqueta: "Dificultad", valor: dif },
      ]}
      resultado={{ mensaje, tipo }}
      ayuda={(
        <div>
          <p><b>Reglas:</b> lee la descripción y toca el emoji correcto entre 4 opciones durante {RONDAS} rondas.</p>
          <p><b>Controles:</b> ratón o táctil tocando el emoji · teclado <kbd>1</kbd>–<kbd>4</kbd> para elegir, <kbd>Enter</kbd>/<kbd>Espacio</kbd> para empezar.</p>
          <p><b>Puntuación:</b> +100 por acierto más bonus de racha. Victoria con 600+ puntos.</p>
          <p><b>Consejo:</b> en Difícil hay más rondas: no cambies tu primera intuición salvo error evidente.</p>
        </div>
      )}
      acciones={(
        <>
          {["Fácil", "Normal", "Difícil"].map(d => (
            <button key={d} className={dif === d ? "btn-principal" : "btn-suave"} disabled={jugando} onClick={() => { setDif(d); sfx.clic(); }}>{d}</button>
          ))}
          {!jugando && <button className="btn-principal" onClick={empezar}>{idx > 0 ? "↻ Otra vez" : "▶ Empezar"}</button>}
        </>
      )}>
      <div className="xp-bar fina" aria-hidden><div style={{ width: `${pct}%` }} /></div>
      {jugando && ronda && (
        <>
          <p style={{ textAlign: "center", fontSize: "1.25rem" }}>¿Cuál es <b>{ronda.desc}</b>?</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            {ronda.opciones.map((o, i) => (
              <button key={o} className="btn-suave" title={`Opción ${i + 1}`} style={{ fontSize: "2.4rem", padding: "12px 18px" }} onClick={() => elegir(o)}>{o}</button>
            ))}
          </div>
        </>
      )}
      <Resultado mensaje="" tipo="" />
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

export const EmojiOficios = EQ("Emoji: Oficios", "🧰", [
  ["👨‍🍳", "el cocinero"], ["👩‍⚕️", "la doctora"], ["👨‍🚒", "el bombero"], ["👩‍🏫", "la maestra"],
  ["👨‍✈️", "el piloto"], ["👩‍🌾", "la granjera"], ["👨‍🎨", "el pintor"], ["👩‍🔬", "la científica"],
  ["👨‍💻", "el programador"], ["👩‍🎤", "la cantante"], ["👨‍🔧", "el mecánico"], ["🧑‍⚖️", "el juez"],
], "linear-gradient(135deg,#64748b,#0ea5e9)", "linear-gradient(135deg,#64748b,#0ea5e9)");
