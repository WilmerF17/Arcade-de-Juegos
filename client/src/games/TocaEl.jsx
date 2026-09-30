import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { sfx } from "../suite/sonido";
import { escribiendo } from "../suite/teclado";

/* Motor "toca el indicado": aparecen 3 números y tocas el que cumple el criterio. */
const TIEMPOS = { 1: 45, 2: 30, 3: 20 };
const NOMBRE_DIF = { 1: "Fácil", 2: "Normal", 3: "Difícil" };
function TocaBase({ titulo, emoji, criterio, consigna, tira, iconoFondo }) {
  const { mensaje, tipo, registrarPunt } = useRegistro(titulo);
  const [nums, setNums] = useState([]);
  const [puntos, setPuntos] = useState(0);
  const [racha, setRacha] = useState(0);
  const [mejorRacha, setMejorRacha] = useState(0);
  const [aciertos, setAciertos] = useState(0);
  const [dif, setDif] = useState(2);
  const [tiempo, setTiempo] = useState(TIEMPOS[2]);
  const [jugando, setJugando] = useState(false);
  const st = useRef({ puntos: 0, racha: 0, jugando: false, bueno: null });
  const jugandoRef = useRef(false);
  jugandoRef.current = jugando;
  const tocarRef = useRef(null);

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
    setPuntos(0); setRacha(0); setMejorRacha(0); setAciertos(0); setTiempo(TIEMPOS[dif]); setJugando(true);
    nuevos();
    sfx.clic();
  }

  function cambiarDif(d) {
    setDif(d);
    sfx.clic();
    if (!jugandoRef.current) setTiempo(TIEMPOS[d]);
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
      setMejorRacha(m => Math.max(m, nr));
      setAciertos(a => a + 1);
      sfx.bien();
    } else {
      st.current.racha = 0;
      st.current.puntos = Math.max(0, st.current.puntos - 5);
      setRacha(0); setPuntos(st.current.puntos);
      sfx.mal();
    }
    nuevos();
  }
  tocarRef.current = tocar;

  useEffect(() => {
    const fn = e => {
      if (escribiendo()) return;
      if ((e.key === "Enter" || e.key === " ") && !jugandoRef.current) {
        e.preventDefault();
        empezar();
        return;
      }
      if (!jugandoRef.current || !st.current.bueno) return;
      const idx = ["1", "2", "3"].indexOf(e.key);
      if (idx >= 0 && nums[idx] != null) {
        e.preventDefault();
        tocarRef.current(nums[idx]);
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dif, nums]);

  const total = TIEMPOS[dif];
  const pct = Math.max(0, Math.round((tiempo / total) * 100));

  return (
    <GameShell titulo={titulo} emoji={emoji}
      descripcion={`${consigna} · ${total}s · fallar resta 5.`}
      tira={tira} iconoFondo={iconoFondo}
      stats={[
        { icono: "⏱", etiqueta: "Tiempo", valor: `${tiempo}s` },
        { icono: "⭐", etiqueta: "Puntos", valor: puntos },
        { icono: "🔥", etiqueta: "Racha", valor: `×${racha}` },
        { icono: "🎯", etiqueta: "Dificultad", valor: NOMBRE_DIF[dif] },
      ]}
      acciones={!jugando ? <button className="btn-principal" onClick={empezar}>▶ Empezar ({total}s)</button> : null}
      ayuda={<>
        <span>Toca el número que cumple la consigna (<b>{consigna}</b>): solo uno de los tres es válido. Acierto suma <b>10 + racha</b>, fallo resta <b>5</b>.</span>
        <span>Controles: ratón o dedo sobre el número; teclado <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> para elegir. <kbd>ENTER</kbd> o <kbd>ESPACIO</kbd> empieza.</span>
        <span>Puntuación: con <b>180+</b> la partida cuenta como victoria. Dificultad: <b>Fácil 45s</b>, <b>Normal 30s</b>, <b>Difícil 20s</b>.</span>
        <span>Consejo: mira la consigna antes que los números para no tocar por impulso.</span>
      </>}>
      {!jugando && (
        <div className="fila-botones" role="group" aria-label="Dificultad">
          {[1, 2, 3].map(d => (
            <button key={d} className={dif === d ? "btn-principal" : "btn-suave"} onClick={() => cambiarDif(d)}>{d === 1 ? "🟢 Fácil" : d === 2 ? "🟡 Normal" : "🔴 Difícil"}</button>
          ))}
        </div>
      )}
      <div className="xp-bar fina" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Tiempo restante"><div style={{ width: `${pct}%` }} /></div>
      {jugando && (
        <>
          <p style={{ textAlign: "center", fontSize: "1.2rem" }}>Toca <b>{consigna.toLowerCase()}</b> 👇 <span style={{ color: "var(--texto-suave)" }}>(<kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd>)</span></p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            {nums.map((n, i) => (
              <button key={n} className="btn-suave" style={{ fontSize: "2rem", padding: "18px 26px" }} onClick={() => tocar(n)}>{n}<br /><kbd style={{ fontSize: ".8rem" }}>{i + 1}</kbd></button>
            ))}
          </div>
          <p style={{ textAlign: "center", color: "var(--texto-suave)" }}>✅ Aciertos: <b>{aciertos}</b>{mejorRacha > 0 && <> · 🔥 Mejor racha <b>×{mejorRacha}</b></>}</p>
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
