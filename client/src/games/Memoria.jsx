import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { dirDeTecla, escribiendo } from "../suite/teclado";
import { sfx } from "../suite/sonido";

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
    sfx.clic();
    setTamaño([filas, cols]);
    setCartas(mezclarCartas(filas, cols));
    setAbiertas([]); setEncontradas([]); setIntentos(0); setFin(false); setBloqueo(false);
    setCursor(0);
  }

  function barajar() {
    sfx.clic();
    // Reparte de nuevo con el mismo tamaño (resetea progreso: evita índices rotos)
    setCartas(mezclarCartas(tamaño[0], tamaño[1]));
    setAbiertas([]); setEncontradas([]); setIntentos(0); setFin(false); setBloqueo(false);
    setCursor(0);
  }

  function voltear(idx) {
    if (bloqueo || fin || abiertas.includes(idx) || encontradas.includes(idx)) return;
    if (idx < 0 || idx >= cartas.length) return;
    sfx.clic();
    const nuevas = [...abiertas, idx];
    setAbiertas(nuevas);
    if (nuevas.length === 2) {
      const sigIntentos = intentos + 1;
      setIntentos(sigIntentos);
      const [a, b] = nuevas;
      if (cartas[a] === cartas[b]) {
        sfx.bien();
        const enf = [...encontradas, a, b];
        setEncontradas(enf);
        setAbiertas([]);
        if (enf.length === cartas.length && cartas.length > 0) {
          const puntos = Math.max(60 - (sigIntentos - pares) * 5, 10);
          registrarPunt(puntos, 1);
          sfx.record();
          setFin(true);
        }
      } else {
        sfx.mal();
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
      descripcion="Clic o teclado (flechas/WASD + ENTER) · encuentra las parejas."
      stats={[{ etiqueta: "Intentos", valor: intentos }, { etiqueta: "Pares", valor: `${encontradas.length / 2}/${pares}` }, { etiqueta: "Tablero", valor: `${tamaño[0]}×${tamaño[1]}` }]}
      ayuda={<div><p><b>Objetivo:</b> encontrar todas las parejas con los mínimos intentos.</p><p><b>Cómo jugar:</b> sin fichas: voltea 2 cartas por intento. Puntos = máx(60−(intentos−pares)×5, 10).</p><ul><li>4×4 = 8 pares · 4×6 = 12 pares · 6×6 = 18 pares</li></ul><p><b>Controles:</b> clic o flechas/WASD + ENTER · Barajar.</p><p><b>Consejo:</b> memoriza por zonas y juega tranquilo: las prisas suman intentos.</p></div>}>
      <div className="fila-botones">
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
          {fin && <Resultado mensaje={mensaje} tipo={tipo} />}
          {!fin && <p className="aviso-ia">💡 Teclado: <b>flechas/WASD</b> mover · <b>ENTER</b> voltear.</p>}
        </div>
      )}
    </GameShell>
  );
}
