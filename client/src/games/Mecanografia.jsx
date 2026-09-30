import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { sfx } from "../suite/sonido";

const PALABRAS = "el sol casa perro gato mesa papel agua luna flor barco calle campo brazo tigre plaza letra fuego salir volar marea nieve tren suave roble lunar nuevo hoja queso jarra vela vino mundo selva rapido lento claro tiempo juego punto noche dia mano".split(" ");
const DIFS = {
  "Fácil": { t: 90, n: 20 },
  "Normal": { t: 60, n: 30 },
  "Difícil": { t: 45, n: 40 },
};
function texto(n) { return Array.from({ length: n }, () => PALABRAS[Math.floor(Math.random() * PALABRAS.length)]).join(" "); }

export default function Mecanografia() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Mecanografía");
  const [dif, setDif] = useState("Normal");
  const totalT = DIFS[dif].t;
  const [obj, setObj] = useState(() => texto(DIFS["Normal"].n));
  const [escrito, setEscrito] = useState("");
  const [tiempo, setTiempo] = useState(totalT);
  const [jugando, setJugando] = useState(false);
  const [fin, setFin] = useState(false);
  const inputRef = useRef(null);
  const finRef = useRef(false);

  function empezar() {
    setObj(texto(DIFS[dif].n)); setEscrito(""); setTiempo(DIFS[dif].t); setJugando(true); setFin(false); finRef.current = false;
    sfx.clic();
    setTimeout(() => inputRef.current?.focus(), 50);
  }
  function cambiarDif(d) {
    setDif(d);
    if (!jugando) {
      setObj(texto(DIFS[d].n));
      setTiempo(DIFS[d].t);
      setEscrito("");
      setFin(false);
    }
    sfx.clic();
  }
  useEffect(() => {
    if (!jugando) return;
    if (tiempo <= 0) {
      if (!finRef.current) {
        finRef.current = true; setJugando(false); setFin(true);
        const { bien, total } = stats();
        const ppm = Math.round((bien / 5) * (60 / 60));
        const pts = Math.min(200, Math.max(10, ppm * 2 - errores() * 2));
        registrarPunt(pts, ppm >= 25 ? 1 : 0);
        sfx.record();
      }
      return;
    }
    const id = setTimeout(() => setTiempo(t => t - 1), 1000);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jugando, tiempo]);

  useEffect(() => {
    const fn = (e) => {
      const tag = (e.target?.tagName || "").toUpperCase();
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if ((e.key === "Enter" || e.key === " ") && !jugando) {
        e.preventDefault();
        empezar();
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }); // eslint-disable-line react-hooks/exhaustive-deps

  function stats() {
    let bien = 0;
    for (let i = 0; i < escrito.length; i++) if (escrito[i] === obj[i]) bien++;
    return { bien, total: escrito.length };
  }
  function errores() { let e = 0; for (let i = 0; i < escrito.length; i++) if (escrito[i] !== obj[i]) e++; return e; }
  const { bien } = stats();
  const ppm = Math.round((bien / 5));
  const prec = escrito.length ? Math.round((bien / escrito.length) * 100) : 100;
  const pct = Math.max(0, Math.round((tiempo / totalT) * 100));
  const pctTexto = obj.length ? Math.round((escrito.length / obj.length) * 100) : 0;

  return (
    <GameShell titulo="Mecanografía" emoji="⌨️" descripcion={`${totalT} segundos · ${DIFS[dif].n} palabras · precisión y PPM (${dif}).`}
      stats={[
        { icono: "⏱️", etiqueta: "Tiempo", valor: `${tiempo}s` },
        { icono: "⚡", etiqueta: "PPM", valor: ppm },
        { icono: "🎯", etiqueta: "Precisión", valor: `${prec}%` },
        { icono: "🎚️", etiqueta: "Dificultad", valor: dif },
      ]}
      resultado={{ mensaje, tipo }}
      ayuda={(
        <div>
          <p><b>Reglas:</b> copia el texto tal cual antes de que acabe el tiempo ({totalT}s, {DIFS[dif].n} palabras).</p>
          <p><b>Controles:</b> teclado físico escribiendo en la casilla · <kbd>Enter</kbd>/<kbd>Espacio</kbd> para empezar fuera de partida.</p>
          <p><b>Puntuación:</b> hasta 200 según PPM menos errores. Victoria con 25+ PPM.</p>
          <p><b>Consejo:</b> mira la palabra siguiente, no la letra actual: anticipar evita parones.</p>
        </div>
      )}
      acciones={(
        <>
          {["Fácil", "Normal", "Difícil"].map(d => (
            <button key={d} className={dif === d ? "btn-principal" : "btn-suave"} disabled={jugando} onClick={() => cambiarDif(d)}>{d}</button>
          ))}
          <button className="btn-principal" onClick={empezar}>{jugando ? "Reiniciar" : fin ? "↻ Otra vez" : `▶ Jugar ${totalT}s`}</button>
        </>
      )}>
      <div className="xp-bar fina" aria-hidden><div style={{ width: `${pct}%` }} /></div>
      <div className="xp-bar fina" aria-label="Progreso del texto" style={{ marginTop: 4 }}><div style={{ width: `${pctTexto}%` }} /></div>
      <div style={{ marginTop: 14, fontSize: "1.25rem", lineHeight: 1.9, background: "var(--bg-soft)", border: "1px solid var(--border)", borderRadius: 12, padding: 16 }}>
        {obj.split("").map((ch, i) => {
          const e = escrito[i];
          const col = e == null ? "var(--texto-suave)" : e === ch ? "var(--exito)" : "var(--peligro)";
          const cur = i === escrito.length && jugando;
          return <span key={i} style={{ color: col, background: cur ? "rgba(56,189,248,.3)" : undefined }}>{ch}</span>;
        })}
      </div>
      {jugando && <input ref={inputRef} type="text" value={escrito} onChange={e => setEscrito(e.target.value.slice(0, obj.length))} placeholder="Escribe aquí..." style={{ marginTop: 12, width: "100%" }} autoFocus />}
      {fin && (
        <>
          <p style={{ textAlign: "center" }}>✅ <b>{bien}</b>/<b>{escrito.length}</b> · {ppm} PPM · {prec}% precisión</p>
          <Resultado mensaje={mensaje} tipo={tipo} />
        </>
      )}
      {!fin && <Resultado mensaje="" tipo="" />}
    </GameShell>
  );
}
