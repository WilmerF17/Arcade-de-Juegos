import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { sfx } from "../suite/sonido";

/* Motor "toca el indicado": aparecen 3 números y tocas el que cumple el criterio. 30s. */
function TocaBase({ titulo, emoji, criterio, consigna, tira, iconoFondo }) {
  const { mensaje, tipo, registrarPunt } = useRegistro(titulo);
  const [nums, setNums] = useState([]);
  const [puntos, setPuntos] = useState(0);
  const [racha, setRacha] = useState(0);
  const [tiempo, setTiempo] = useState(30);
  const [jugando, setJugando] = useState(false);
  const st = useRef({ puntos: 0, racha: 0, jugando: false, bueno: null });

  function nuevos() {
    let a = 5 + Math.floor(Math.random() * 90);
    let b = 5 + Math.floor(Math.random() * 90);
    let c = 5 + Math.floor(Math.random() * 90);
    if (a === b || b === c || a === c) return nuevos();
    const arr = [a, b, c];
    const buenos = arr.filter(criterio);
    if (buenos.length !== 1) return nuevos();
    st.current.bueno = buenos[0];
    setNums(arr);
  }

  function empezar() {
    st.current = { puntos: 0, racha: 0, jugando: true, bueno: null };
    setPuntos(0); setRacha(0); setTiempo(30); setJugando(true);
    nuevos();
    sfx.clic();
  }

  useEffect(() => {
    if (!jugando) return;
    if (tiempo <= 0) {
      st.current.jugando = false;
      setJugando(false);
      registrarPunt(st.current.puntos, st.current.puntos >= 180 ? 1 : 0);
      return;
    }
    const id = setTimeout(() => setTiempo(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [jugando, tiempo]); // eslint-disable-line react-hooks/exhaustive-deps

  function tocar(n) {
    if (!st.current.jugando) return;
    if (n === st.current.bueno) {
      const nr = st.current.racha + 1;
      st.current.racha = nr;
      st.current.puntos += 10 + Math.min(15, nr);
      setRacha(nr); setPuntos(st.current.puntos);
      sfx.clic();
    } else {
      st.current.racha = 0;
      st.current.puntos = Math.max(0, st.current.puntos - 5);
      setRacha(0); setPuntos(st.current.puntos);
      sfx.mal();
    }
    nuevos();
  }

  return (
    <GameShell titulo={titulo} emoji={emoji}
      descripcion={`${consigna} · 30s · fallar resta 5.`}
      tira={tira} iconoFondo={iconoFondo}>
      <div className="fila-botones">
        <span className="chip">⏱ <b>{tiempo}s</b></span>
        <span className="chip">Puntos: <b>{puntos}</b></span>
        <span className="chip">🔥 <b>{racha}</b></span>
      </div>
      {!jugando && (
        <div className="fila-botones"><button className="btn-principal" onClick={empezar}>▶ Empezar (30s)</button></div>
      )}
      {jugando && (
        <>
          <p style={{ textAlign: "center", fontSize: "1.2rem" }}>Toca <b>{consigna.toLowerCase()}</b> 👇</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            {nums.map(n => (
              <button key={n} className="btn-suave" style={{ fontSize: "2rem", padding: "18px 26px" }} onClick={() => tocar(n)}>{n}</button>
            ))}
          </div>
        </>
      )}
      <Resultado mensaje={mensaje} tipo={tipo} />
    </GameShell>
  );
}

const esPrimo = n => {
  if (n < 2) return false;
  for (let i = 2; i * i <= n; i++) if (n % i === 0) return false;
  return true;
};
const TC = (titulo, emoji, criterio, consigna, tira, iconoFondo) => function Comp() {
  return <TocaBase titulo={titulo} emoji={emoji} criterio={criterio} consigna={consigna} tira={tira} iconoFondo={iconoFondo} />;
};

export const TocaMayor = TC("Toca el Mayor", "🦒", (n, _, arr) => n === Math.max(...arr), "el MAYOR",
  "linear-gradient(135deg,#22c55e,#84cc16)", "linear-gradient(135deg,#22c55e,#84cc16)");
export const TocaMenor = TC("Toca el Menor", "🐭", (n, _, arr) => n === Math.min(...arr), "el MENOR",
  "linear-gradient(135deg,#38bdf8,#6366f1)", "linear-gradient(135deg,#38bdf8,#6366f1)");
export const TocaPar = TC("Toca el Par", "⚖️", (n, _, arr) => arr.filter(x => x % 2 === 0).length === 1 && n % 2 === 0, "el PAR",
  "linear-gradient(135deg,#a855f7,#22d3ee)", "linear-gradient(135deg,#a855f7,#22d3ee)");
export const TocaImpar = TC("Toca el Impar", "🎲", (n, _, arr) => arr.filter(x => x % 2 === 1).length === 1 && n % 2 === 1, "el IMPAR",
  "linear-gradient(135deg,#f59e0b,#ef4444)", "linear-gradient(135deg,#f59e0b,#ef4444)");
export const TocaPrimo = TC("Toca el Primo", "💎", (n, _, arr) => arr.filter(esPrimo).length === 1 && esPrimo(n), "el PRIMO",
  "linear-gradient(135deg,#0ea5e9,#a855f7)", "linear-gradient(135deg,#0ea5e9,#a855f7)");
export const TocaMultiplo5 = TC("Toca el Múltiplo de 5", "🖐️", (n, _, arr) => arr.filter(x => x % 5 === 0).length === 1 && n % 5 === 0, "el MÚLTIPLO DE 5",
  "linear-gradient(135deg,#ec4899,#f59e0b)", "linear-gradient(135deg,#ec4899,#f59e0b)");
export const TocaDecena = TC("Toca la Decena", "🔟", (n, _, arr) => arr.filter(x => x >= 10 && x < 20).length + arr.filter(x => x >= 20 && x < 30).length + arr.filter(x => x >= 30 && x < 40).length + arr.filter(x => x >= 40).length > 0 && [10, 20, 30, 40, 50, 60, 70, 80, 90].includes(n) && arr.filter(x => [10, 20, 30, 40, 50, 60, 70, 80, 90].includes(x)).length === 1, "la DECENA EXACTA",
  "linear-gradient(135deg,#14b8a6,#6366f1)", "linear-gradient(135deg,#14b8a6,#6366f1)");
