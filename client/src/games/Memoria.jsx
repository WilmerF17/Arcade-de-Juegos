import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro } from "../ui/GameShell";
import { dirDeTecla, escribiendo } from "../suite/teclado";

const SIMBOLOS = ["🍎", "🍌", "🍇", "🍊", "🍓", "🍉", "🥝", "🍍", "🍒", "🥥", "🍋", "🍑", "🥭", "🍅", "🌽", "🎈", "🎁", "⭐"];

function mezclarCartas(filas, cols) {
  const ic = SIMBOLOS.slice(0, (filas * cols) / 2);
  const arr = [...ic, ...ic];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function Memoria() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Memoria");
  const [tamaño, setTamaño] = useState([4, 4]);
  const [cartas, setCartas] = useState([]);
  const [abiertas, setAbiertas] = useState([]);
  const [encontradas, setEncontradas] = useState([]);
  const [intentos, setIntentos] = useState(0);
  const [bloqueo, setBloqueo] = useState(false);
  const [fin, setFin] = useState(false);
  const [cursor, setCursor] = useState(0);
  const voltearRef = useRef(null);

  const pares = (tamaño[0] * tamaño[1]) / 2;

  function empezar(filas, cols) {
    setTamaño([filas, cols]);
    setCartas(mezclarCartas(filas, cols));
    setAbiertas([]); setEncontradas([]); setIntentos(0); setFin(false); setBloqueo(false);
    setCursor(0);
  }

  function barajar() {
    // Reparte de nuevo con el mismo tamaño (resetea progreso: evita índices rotos)
    setCartas(mezclarCartas(tamaño[0], tamaño[1]));
    setAbiertas([]); setEncontradas([]); setIntentos(0); setFin(false); setBloqueo(false);
    setCursor(0);
  }

  function voltear(idx) {
    if (bloqueo || fin || abiertas.includes(idx) || encontradas.includes(idx)) return;
    if (idx < 0 || idx >= cartas.length) return;
    const nuevas = [...abiertas, idx];
    setAbiertas(nuevas);
    if (nuevas.length === 2) {
      const sigIntentos = intentos + 1;
      setIntentos(sigIntentos);
      const [a, b] = nuevas;
      if (cartas[a] === cartas[b]) {
        const enf = [...encontradas, a, b];
        setEncontradas(enf);
        setAbiertas([]);
        if (enf.length === cartas.length && cartas.length > 0) {
          const puntos = Math.max(60 - (sigIntentos - pares) * 5, 10);
          registrarPunt(puntos, 1);
          setFin(true);
        }
      } else {
        setBloqueo(true);
        setTimeout(() => { setAbiertas([]); setBloqueo(false); }, 900);
      }
    }
  }
  voltearRef.current = voltear;

  useEffect(() => {
    const fn = e => {
      if (escribiendo() || !cartas.length) return;
      const d = dirDeTecla(e.key);
      if (d) {
        e.preventDefault();
        setCursor(c => {
          const cols = tamaño[1], rows = tamaño[0];
          let r = Math.floor(c / cols), col = c % cols;
          if (d === "arr") r = (r + rows - 1) % rows;
          if (d === "aba") r = (r + 1) % rows;
          if (d === "izq") col = (col + cols - 1) % cols;
          if (d === "der") col = (col + 1) % cols;
          return r * cols + col;
        });
        return;
      }
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setCursor(c => { voltearRef.current(c); return c; });
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [cartas, tamaño, abiertas, encontradas, bloqueo, fin, intentos]);

  return (
    <GameShell titulo="Memoria" emoji="🧠"
      descripcion="Clic o teclado (flechas/WASD + ENTER) · encuentra las parejas.">
      <div className="fila-botones" style={{ marginTop: 0 }}>
        {[[4, 4], [4, 6], [6, 6]].map((t, i) => (
          <button key={i} className={tamaño[0] === t[0] && tamaño[1] === t[1] ? "btn-principal" : ""}
            onClick={() => empezar(t[0], t[1])}>{t[0]}×{t[1]} ({t[0] * t[1] / 2} pares)</button>
        ))}
        {cartas.length > 0 && <button onClick={barajar}>Barajar</button>}
      </div>
      {cartas.length > 0 && (
        <div>
          <div className="chip" style={{ display: "inline-block", marginBottom: 10 }}>Intentos: <b>{intentos}</b> · Pares: <b>{encontradas.length / 2}/{pares}</b></div>
          <div className="grid" style={{ gridTemplateColumns: `repeat(${tamaño[1]}, 58px)`, width: "max-content" }}>
            {cartas.map((c, i) => {
              const visible = abiertas.includes(i) || encontradas.includes(i);
              return (
                <div key={i} className={`celda ${!fin ? "clickeable" : ""}`}
                  onClick={() => { setCursor(i); voltear(i); }}
                  onMouseEnter={() => setCursor(i)}
                  style={{ background: visible ? "var(--bg-hover)" : undefined, fontSize: "1.7rem", width: 58, height: 58, outline: i === cursor && !fin ? "2px solid var(--info)" : undefined }}>
                  {visible ? c : "🂠"}
                </div>
              );
            })}
          </div>
          {fin && <div className={`mensaje-final ${tipo}`}>{mensaje}</div>}
          {!fin && <p className="aviso-ia">💡 Teclado: <b>flechas/WASD</b> mover · <b>ENTER</b> voltear.</p>}
        </div>
      )}
    </GameShell>
  );
}
