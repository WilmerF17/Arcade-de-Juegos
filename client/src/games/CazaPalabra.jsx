import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { sfx } from "../suite/sonido";

const BANCOS = {
  "🍎 Frutas": ["manzana", "plátano", "mango", "piña", "uva", "sandía", "cereza", "limón"],
  "🐾 Animales": ["jirafa", "tigre", "ballena", "águila", "serpiente", "cebra", "koala", "lobo"],
  "🌍 Países": ["chile", "japón", "egipto", "brasil", "canadá", "italia", "india", "marruecos"],
  "🎨 Colores": ["rojo", "turquesa", "violeta", "naranja", "esmeralda", "gris", "beige", "granate"],
  "⚽ Deportes": ["fútbol", "tenis", "natación", "ciclismo", "boxeo", "esquí", "rugby", "ajedrez"],
  "🍲 Comidas": ["pizza", "tacos", "sushi", "paella", "arepa", "ceviche", "hamburguesa", "empanada"],
};
const DISTRACTORES = ["guitarra", "nube", "martillo", "reloj", "zapato", "ventana", "trueno", "botella"];
const DIFS = { "Fácil": { t: 60 }, "Normal": { t: 45 }, "Difícil": { t: 30 } };

/* Caza Palabra: elige la palabra que pertenece a la categoría. */
export default function CazaPalabra() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Caza Palabra");
  const [dif, setDif] = useState("Normal");
  const totalT = DIFS[dif].t;
  const [ronda, setRonda] = useState(null);
  const [puntos, setPuntos] = useState(0);
  const [racha, setRacha] = useState(0);
  const [tiempo, setTiempo] = useState(totalT);
  const [jugando, setJugando] = useState(false);
  const st = useRef({ puntos: 0, racha: 0, jugando: false, ronda: null });

  function nuevaRonda() {
    const cats = Object.keys(BANCOS);
    const cat = cats[Math.floor(Math.random() * cats.length)];
    const buenas = [...BANCOS[cat]].sort(() => Math.random() - 0.5);
    const correcta = buenas[0];
    const opciones = [correcta, ...[...DISTRACTORES].sort(() => Math.random() - 0.5).slice(0, 3)].sort(() => Math.random() - 0.5);
    const r = { cat, correcta, opciones };
    st.current.ronda = r;
    setRonda(r);
  }

  function empezar() {
    st.current = { puntos: 0, racha: 0, jugando: true, ronda: null };
    setPuntos(0); setRacha(0); setTiempo(DIFS[dif].t); setJugando(true);
    nuevaRonda();
    sfx.clic();
  }
  function cambiarDif(d) {
    setDif(d);
    if (!jugando) setTiempo(DIFS[d].t);
    sfx.clic();
  }

  useEffect(() => {
    if (!jugando) return;
    if (tiempo <= 0) {
      st.current.jugando = false;
      setJugando(false);
      registrarPunt(st.current.puntos, st.current.puntos >= 150 ? 1 : 0);
      return;
    }
    const id = setTimeout(() => setTiempo(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [jugando, tiempo]); // eslint-disable-line react-hooks/exhaustive-deps

  function elegir(palabra) {
    if (!st.current.jugando) return;
    if (palabra === st.current.ronda.correcta) {
      const nr = st.current.racha + 1;
      const gana = 10 + Math.min(20, nr * 2);
      st.current.racha = nr;
      st.current.puntos += gana;
      setRacha(nr); setPuntos(st.current.puntos);
      sfx.bien();
    } else {
      st.current.racha = 0;
      setRacha(0);
      sfx.mal();
    }
    nuevaRonda();
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
      if (!st.current.jugando || !st.current.ronda) return;
      const k = String(e.key).toLowerCase();
      let i = -1;
      if (["1", "2", "3", "4"].includes(e.key)) i = parseInt(e.key, 10) - 1;
      else if (["a", "b", "c", "d"].includes(k)) i = "abcd".indexOf(k);
      if (i >= 0 && i < st.current.ronda.opciones.length) elegir(st.current.ronda.opciones[i]);
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }); // eslint-disable-line react-hooks/exhaustive-deps

  const pct = Math.max(0, Math.round((tiempo / totalT) * 100));
  return (
    <GameShell titulo="Caza Palabra" emoji="🔎"
      descripcion={`Toca la palabra de la categoría · ${totalT}s · las rachas dan bonus (${dif}).`}
      tira="linear-gradient(90deg,#0ea5e9,#a855f7,#ff3d5a)" iconoFondo="linear-gradient(135deg,#0ea5e9,#a855f7)"
      stats={[
        { icono: "⏱️", etiqueta: "Tiempo", valor: `${tiempo}s` },
        { icono: "⭐", etiqueta: "Puntos", valor: puntos },
        { icono: "🔥", etiqueta: "Racha", valor: racha },
        { icono: "🎚️", etiqueta: "Dificultad", valor: dif },
      ]}
      resultado={{ mensaje, tipo }}
      ayuda={(
        <div>
          <p><b>Reglas:</b> aparece una categoría y 4 palabras: toca la que pertenece a esa categoría antes de que acabe el tiempo ({totalT}s).</p>
          <p><b>Controles:</b> ratón o táctil tocando la palabra · teclado <kbd>1</kbd>–<kbd>4</kbd> para elegir, <kbd>Enter</kbd>/<kbd>Espacio</kbd> para empezar.</p>
          <p><b>Puntuación:</b> cada acierto suma 10 más bonus de racha. Victoria con 150+ puntos.</p>
          <p><b>Consejo:</b> lee la categoría en voz alta antes de mirar opciones: el cerebro filtra mejor así.</p>
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
      {jugando && ronda && (
        <>
          <p style={{ textAlign: "center", fontSize: "1.25rem", margin: "6px 0" }}>Busca: <b>{ronda.cat}</b></p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {ronda.opciones.map((o, i) => (
              <button key={o} className="trivia-op" style={{ padding: "14px 8px", fontSize: "1.05rem" }} onClick={() => elegir(o)}><span className="op-letra"><kbd>{i + 1}</kbd></span> {o}</button>
            ))}
          </div>
        </>
      )}
      <Resultado mensaje="" tipo="" />
    </GameShell>
  );
}
