import { useState } from "react";
import GameShell, { useRegistro } from "../ui/GameShell";
import { sfx } from "../suite/sonido";

/* Motor de ordenación: toca los elementos en orden. 6 rondas. */
function OrdenaVBase({ titulo, emoji, generar, etiqueta, tira, iconoFondo }) {
  const { mensaje, tipo, registrarPunt } = useRegistro(titulo);
  const [items, setItems] = useState([]);
  const [orden, setOrden] = useState([]);
  const [pos, setPos] = useState(0);
  const [ronda, setRonda] = useState(0);
  const [errores, setErrores] = useState(0);
  const [jugando, setJugando] = useState(false);

  const RONDAS = 6;

  function nuevaRonda(nr) {
    const { items: it, orden: od } = generar();
    setItems(it); setOrden(od); setPos(0); setRonda(nr);
  }

  function empezar() {
    setErrores(0); setJugando(true);
    nuevaRonda(1);
    sfx.clic();
  }

  function tocar(v) {
    if (!jugando) return;
    if (v === orden[pos]) {
      const np = pos + 1;
      setPos(np);
      sfx.clic();
      if (np >= orden.length) {
        if (ronda >= RONDAS) {
          setJugando(false);
          const puntos = Math.max(60, 800 - errores * 40);
          sfx.bien();
          registrarPunt(puntos, errores <= 2 ? 1 : 0);
        } else {
          sfx.moneda();
          nuevaRonda(ronda + 1);
        }
      }
    } else {
      setErrores(e => e + 1);
      sfx.mal();
    }
  }

  return (
    <GameShell titulo={titulo} emoji={emoji}
      descripcion={`${etiqueta} · 6 rondas · los errores restan.`}
      tira={tira} iconoFondo={iconoFondo}>
      <div className="fila-botones" style={{ marginTop: 0 }}>
        <span className="chip">Ronda: <b>{ronda}/{RONDAS}</b></span>
        <span className="chip">Van: <b>{pos}/{orden.length}</b></span>
        <span className="chip">❌ <b>{errores}</b></span>
      </div>
      {!jugando && ronda === 0 && (
        <div className="fila-botones"><button className="btn-principal" onClick={empezar}>▶ Empezar</button></div>
      )}
      {jugando && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
          {items.map(v => (
            <button key={v} onClick={() => tocar(v)} disabled={orden.indexOf(v) < pos}
              className="btn-suave" style={{ fontSize: "1.4rem", padding: "14px 18px", opacity: orden.indexOf(v) < pos ? 0.3 : 1 }}>
              {v}
            </button>
          ))}
        </div>
      )}
      {mensaje && <div className={`mensaje-final ${tipo}`}>{mensaje}</div>}
      {!jugando && ronda > 0 && !mensaje && (
        <div className="fila-botones"><button className="btn-principal" onClick={empezar}>↻ Otra vez</button></div>
      )}
    </GameShell>
  );
}

const OV = (titulo, emoji, generar, etiqueta, tira, iconoFondo) => function Comp() {
  return <OrdenaVBase titulo={titulo} emoji={emoji} generar={generar} etiqueta={etiqueta} tira={tira} iconoFondo={iconoFondo} />;
};
function nums(n, min, max) {
  const s = new Set();
  while (s.size < n) s.add(min + Math.floor(Math.random() * (max - min + 1)));
  const it = [...s].sort(() => Math.random() - 0.5);
  return { items: it, orden: [...it].sort((a, b) => a - b) };
}

export const OrdenaInverso = OV("Ordena al Revés", "⬇️",
  () => { const { items, orden } = nums(5, 1, 50); return { items, orden: [...orden].reverse() }; },
  "Toca de MAYOR a menor",
  "linear-gradient(135deg,#7c3aed,#22d3ee)", "linear-gradient(135deg,#7c3aed,#22d3ee)");

const LETRAS = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split("");
export const OrdenaLetras = OV("Ordena Letras", "🔤",
  () => {
    const s = new Set();
    while (s.size < 5) s.add(LETRAS[Math.floor(Math.random() * LETRAS.length)]);
    const it = [...s].sort(() => Math.random() - 0.5);
    return { items: it, orden: [...it].sort() };
  },
  "Toca en orden ALFABÉTICO",
  "linear-gradient(135deg,#8b5cf6,#ec4899)", "linear-gradient(135deg,#8b5cf6,#ec4899)");

export const OrdenaPares = OV("Ordena Pares", "⚖️",
  () => {
    const s = new Set();
    while (s.size < 5) { const v = 2 * (1 + Math.floor(Math.random() * 25)); s.add(v); }
    const it = [...s].sort(() => Math.random() - 0.5);
    return { items: it, orden: [...it].sort((a, b) => a - b) };
  },
  "Solo PARES, de menor a mayor",
  "linear-gradient(135deg,#0ea5e9,#22c55e)", "linear-gradient(135deg,#0ea5e9,#22c55e)");
