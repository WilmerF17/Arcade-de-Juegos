import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro } from "../ui/GameShell";
import { sfx } from "../suite/sonido";

const PALABRAS = "el sol casa perro gato mesa papel agua luna flor barco calle campo brazo tigre plaza letra fuego salir volar marea nieve tren suave roble lunar nuevo hoja queso jarra vela vino mundo selva rapido lento claro tiempo juego punto noche dia mano".split(" ");
function texto() { return Array.from({ length: 30 }, () => PALABRAS[Math.floor(Math.random() * PALABRAS.length)]).join(" "); }

export default function Mecanografia() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Mecanografía");
  const [obj, setObj] = useState(texto);
  const [escrito, setEscrito] = useState("");
  const [tiempo, setTiempo] = useState(60);
  const [jugando, setJugando] = useState(false);
  const [fin, setFin] = useState(false);
  const inputRef = useRef(null);
  const finRef = useRef(false);

  function empezar() {
    setObj(texto()); setEscrito(""); setTiempo(60); setJugando(true); setFin(false); finRef.current = false;
    setTimeout(() => inputRef.current?.focus(), 50);
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

  function stats() {
    let bien = 0;
    for (let i = 0; i < escrito.length; i++) if (escrito[i] === obj[i]) bien++;
    return { bien, total: escrito.length };
  }
  function errores() { let e = 0; for (let i = 0; i < escrito.length; i++) if (escrito[i] !== obj[i]) e++; return e; }
  const { bien } = stats();
  const ppm = Math.round((bien / 5));

  return (
    <GameShell titulo="Mecanografía" emoji="⌨️" descripcion="60 segundos · escribe sin mirar · precisión y PPM.">
      <div className="fila-botones">
        <button className="btn-principal" onClick={empezar}>{jugando ? "Reiniciar" : fin ? "↻ Otra vez" : "▶ Jugar 60s"}</button>
        <span className="chip">⏱️ <b>{tiempo}s</b></span>
        <span className="chip">PPM <b>{ppm}</b></span>
        <span className="chip">✅ <b>{bien}</b>/<b>{escrito.length}</b></span>
      </div>
      <div style={{ marginTop: 14, fontSize: "1.25rem", lineHeight: 1.9, background: "var(--bg-soft)", border: "1px solid var(--border)", borderRadius: 12, padding: 16 }}>
        {obj.split("").map((ch, i) => {
          const e = escrito[i];
          const col = e == null ? "var(--texto-suave)" : e === ch ? "var(--exito)" : "var(--peligro)";
          const cur = i === escrito.length && jugando;
          return <span key={i} style={{ color: col, background: cur ? "rgba(56,189,248,.3)" : undefined }}>{ch}</span>;
        })}
      </div>
      {jugando && <input ref={inputRef} type="text" value={escrito} onChange={e => setEscrito(e.target.value.slice(0, obj.length))} placeholder="Escribe aquí..." style={{ marginTop: 12, width: "100%" }} autoFocus />}
      {fin && <div className={`mensaje-final ${tipo}`}>{mensaje} · {ppm} PPM</div>}
    </GameShell>
  );
}
