import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { sfx } from "../suite/sonido";
import { escribiendo } from "../suite/teclado";

/* Ordena Números: toca del menor al mayor contra el crono. */
const CONF_DIF = { 1: { rondas: 6, nombre: "Fácil" }, 2: { rondas: 8, nombre: "Normal" }, 3: { rondas: 10, nombre: "Difícil" } };
export default function Ordena() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Ordena Números");
  const [numeros, setNumeros] = useState([]);
  const [siguiente, setSiguiente] = useState(0);
  const [ronda, setRonda] = useState(0);
  const [errores, setErrores] = useState(0);
  const [inicio, setInicio] = useState(0);
  const [dif, setDif] = useState(2);
  const RONDAS = CONF_DIF[dif].rondas;
  const [jugando, setJugando] = useState(false);
  const [ordenados, setOrdenados] = useState([]);
  const jugandoRef = useRef(false);
  jugandoRef.current = jugando;

  function nuevaRonda() {
    const base = Math.floor(Math.random() * 30) + 1;
    const vals = Array.from({ length: 5 }, () => base + Math.floor(Math.random() * 40));
    const unicos = [...new Set(vals)];
    while (unicos.length < 5) unicos.push(base + 40 + unicos.length);
    const n = unicos.slice(0, 5).sort(() => Math.random() - 0.5);
    setNumeros(n);
    setOrdenados([...n].sort((a, b) => a - b));
    setSiguiente(0);
  }

  function empezar() {
    setRonda(1); setErrores(0); setJugando(true);
    setInicio(Date.now());
    nuevaRonda();
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

  function tocar(n) {
    if (!jugando) return;
    if (n === ordenados[siguiente]) {
      const ns = siguiente + 1;
      setSiguiente(ns);
      sfx.clic();
      if (ns >= ordenados.length) {
        if (ronda >= RONDAS) {
          const seg = Math.round((Date.now() - inicio) / 1000);
          const puntos = Math.max(50, 1200 - seg * 8 - errores * 30);
          setJugando(false);
          sfx.bien();
          registrarPunt(puntos, errores <= 3 ? 1 : 0);
        } else {
          setRonda(r => r + 1);
          sfx.moneda();
          nuevaRonda();
        }
      }
    } else {
      setErrores(e => e + 1);
      sfx.mal();
    }
  }

  const pct = ronda > 0 ? Math.round(((ronda - 1) / RONDAS) * 100 + (siguiente / 5 / RONDAS) * 100) : 0;

  return (
    <GameShell titulo="Ordena Números" emoji="🔢"
      descripcion={`Toca del menor al mayor · ${RONDAS} rondas · los errores restan puntos.`}
      tira="linear-gradient(90deg,#38bdf8,#a855f7)" iconoFondo="linear-gradient(135deg,#38bdf8,#a855f7)"
      stats={[
        { icono: "🏁", etiqueta: "Ronda", valor: `${ronda}/${RONDAS}` },
        { icono: "👉", etiqueta: "Siguiente", valor: ordenados[siguiente] ?? "—" },
        { icono: "❌", etiqueta: "Fallos", valor: errores },
        { icono: "🎯", etiqueta: "Dificultad", valor: CONF_DIF[dif].nombre },
      ]}
      acciones={!jugando ? <button className="btn-principal" onClick={empezar}>{ronda > 0 ? "↻ Jugar otra vez" : "▶ Empezar"}</button> : null}
      ayuda={<>
        <span>Toca los 5 números <b>de menor a mayor</b> en cada ronda. El borde verde marca el siguiente.</span>
        <span>Controles: ratón o dedo sobre cada número. <kbd>ENTER</kbd> o <kbd>ESPACIO</kbd> empieza o reintenta.</span>
        <span>Puntuación: base <b>1200 − 8 por segundo − 30 por error</b> (mínimo 50); con <b>3 o menos errores</b> cuenta como victoria. Dificultad: <b>Fácil 6 rondas</b>, <b>Normal 8</b>, <b>Difícil 10</b>.</span>
        <span>Consejo: memoriza el orden de un vistazo y toca sin dudar para ahorrar segundos.</span>
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
          {numeros.map(n => {
            const ya = ordenados.indexOf(n) < siguiente;
            return (
              <button key={n} onClick={() => tocar(n)} disabled={ya}
                className="btn-suave"
                style={{ fontSize: "1.5rem", padding: "16px 20px", minWidth: 76,
                  opacity: ya ? 0.3 : 1, borderColor: n === ordenados[siguiente] ? "var(--exito)" : undefined }}>
                {n}
              </button>
            );
          })}
        </div>
      )}
      <Resultado mensaje={mensaje} tipo={tipo} />
    </GameShell>
  );
}
