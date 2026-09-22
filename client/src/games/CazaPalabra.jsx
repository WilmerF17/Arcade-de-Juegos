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

/* Caza Palabra: elige la palabra que pertenece a la categoría. 45 segundos. */
export default function CazaPalabra() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Caza Palabra");
  const [ronda, setRonda] = useState(null);
  const [puntos, setPuntos] = useState(0);
  const [racha, setRacha] = useState(0);
  const [tiempo, setTiempo] = useState(45);
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
    setPuntos(0); setRacha(0); setTiempo(45); setJugando(true);
    nuevaRonda();
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

  return (
    <GameShell titulo="Caza Palabra" emoji="🔎"
      descripcion="Toca la palabra de la categoría · 45s · las rachas dan bonus."
      tira="linear-gradient(90deg,#0ea5e9,#a855f7,#ff3d5a)" iconoFondo="linear-gradient(135deg,#0ea5e9,#a855f7)">
      <div className="fila-botones">
        <span className="chip">⏱ <b>{tiempo}s</b></span>
        <span className="chip">Puntos: <b>{puntos}</b></span>
        <span className="chip">🔥 Racha: <b>{racha}</b></span>
      </div>
      {!jugando && (
        <div className="fila-botones"><button className="btn-principal" onClick={empezar}>▶ Empezar (45s)</button></div>
      )}
      {jugando && ronda && (
        <>
          <p style={{ textAlign: "center", fontSize: "1.25rem", margin: "6px 0" }}>Busca: <b>{ronda.cat}</b></p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {ronda.opciones.map(o => (
              <button key={o} className="btn-suave" style={{ padding: "14px 8px", fontSize: "1.05rem" }} onClick={() => elegir(o)}>{o}</button>
            ))}
          </div>
        </>
      )}
      <Resultado mensaje={mensaje} tipo={tipo} />
    </GameShell>
  );
}
