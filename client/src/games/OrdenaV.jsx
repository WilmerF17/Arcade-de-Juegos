import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { sfx } from "../suite/sonido";
import { escribiendo } from "../suite/teclado";

/* Motor de ordenación: toca los elementos en orden. */
const CONF_DIF = { 1: { rondas: 4, nombre: "Fácil" }, 2: { rondas: 6, nombre: "Normal" }, 3: { rondas: 8, nombre: "Difícil" } };
function OrdenaVBase({ titulo, emoji, generar, etiqueta, tira, iconoFondo }) {
  const { mensaje, tipo, registrarPunt } = useRegistro(titulo);
  const [items, setItems] = useState([]);
  const [orden, setOrden] = useState([]);
  const [pos, setPos] = useState(0);
  const [ronda, setRonda] = useState(0);
  const [errores, setErrores] = useState(0);
  const [dif, setDif] = useState(2);
  const RONDAS = CONF_DIF[dif].rondas;
  const [jugando, setJugando] = useState(false);
  const jugandoRef = useRef(false);
  jugandoRef.current = jugando;

  function nuevaRonda(nr) {
    const { items: it, orden: od } = generar();
    setItems(it); setOrden(od); setPos(0); setRonda(nr);
  }

  function empezar() {
    setErrores(0); setJugando(true);
    nuevaRonda(1);
    sfx.clic();
  }

  useEffect(() => {
    const fn = e => {
      if (escribiendo()) return;
      if ((e.key === "Enter" || e.key === " ") && !jugandoRef.current) {
        e.preventDefault();
        empezar();
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dif]);

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

  const pct = ronda > 0 ? Math.round(((ronda - 1) / RONDAS) * 100 + (pos / Math.max(1, orden.length) / RONDAS) * 100) : 0;

  return (
    <GameShell titulo={titulo} emoji={emoji}
      descripcion={`${etiqueta} · ${RONDAS} rondas · los errores restan.`}
      tira={tira} iconoFondo={iconoFondo}
      stats={[
        { icono: "🏁", etiqueta: "Ronda", valor: `${ronda}/${RONDAS}` },
        { icono: "👆", etiqueta: "Van", valor: `${pos}/${orden.length || "–"}` },
        { icono: "❌", etiqueta: "Fallos", valor: errores },
        { icono: "🎯", etiqueta: "Dificultad", valor: CONF_DIF[dif].nombre },
      ]}
      acciones={!jugando ? <button className="btn-principal" onClick={empezar}>{ronda > 0 ? "↻ Otra vez" : "▶ Empezar"}</button> : null}
      ayuda={<>
        <span>Toca los elementos en orden (<b>{etiqueta}</b>). Cada ronda completa avanza; los toques correctos se atenúan.</span>
        <span>Controles: ratón o dedo sobre cada ficha. <kbd>ENTER</kbd> o <kbd>ESPACIO</kbd> empieza o reintenta.</span>
        <span>Puntuación: base <b>800 − 40 por error</b> (mínimo 60); con <b>2 o menos errores</b> cuenta como victoria. Dificultad: <b>Fácil 4 rondas</b>, <b>Normal 6</b>, <b>Difícil 8</b>.</span>
        <span>Consejo: localiza el siguiente antes de tocar para no sumar errores tontos.</span>
      </>}>
      {!jugando && ronda === 0 && (
        <div className="fila-botones" role="group" aria-label="Dificultad">
          {[1, 2, 3].map(d => (
            <button key={d} className={dif === d ? "btn-principal" : "btn-suave"} onClick={() => { setDif(d); sfx.clic(); }}>{d === 1 ? "🟢 Fácil" : d === 2 ? "🟡 Normal" : "🔴 Difícil"}</button>
          ))}
        </div>
      )}
      <div className="xp-bar fina" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Progreso"><div style={{ width: `${pct}%` }} /></div>
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
      <Resultado mensaje={mensaje} tipo={tipo} />
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
