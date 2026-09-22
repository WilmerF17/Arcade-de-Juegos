import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro } from "../ui/GameShell";
import { dirDeTecla, escribiendo } from "../suite/teclado";

const DIRS = { arr: [-1, 0], aba: [1, 0], izq: [0, -1], der: [0, 1] };

export default function CazaTesoro() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Caza del tesoro");
  const [tam, setTam] = useState(8);
  const [juego, setJuego] = useState(null); // {tesoro, jugador, pasos, fin}
  const juegoRef = useRef(null);
  const tamRef = useRef(tam);
  juegoRef.current = juego;
  tamRef.current = tam;

  function empezar() {
    const t = tamRef.current;
    const tes = [Math.floor(Math.random() * t), Math.floor(Math.random() * t)];
    let jug;
    do {
      jug = [Math.floor(Math.random() * t), Math.floor(Math.random() * t)];
    } while (jug[0] === tes[0] && jug[1] === tes[1]);
    const j = { tesoro: tes, jugador: jug, pasos: 0, fin: false };
    juegoRef.current = j;
    setJuego(j);
  }

  function mover(dir) {
    const j = juegoRef.current;
    const t = tamRef.current;
    if (!j || j.fin) return;
    const d = DIRS[dir];
    if (!d) return;
    const f = Math.max(0, Math.min(t - 1, j.jugador[0] + d[0]));
    const c = Math.max(0, Math.min(t - 1, j.jugador[1] + d[1]));
    const pasos = j.pasos + 1;
    if (f === j.tesoro[0] && c === j.tesoro[1]) {
      const puntos = Math.max(100 - 5 * pasos, 10);
      registrarPunt(puntos, 1);
      const fin = { ...j, jugador: [f, c], pasos, fin: true };
      juegoRef.current = fin;
      setJuego(fin);
    } else {
      const nj = { ...j, jugador: [f, c], pasos };
      juegoRef.current = nj;
      setJuego(nj);
    }
  }

  const moverRef = useRef(mover);
  moverRef.current = mover;
  const empezarRef = useRef(empezar);
  empezarRef.current = empezar;

  useEffect(() => {
    const fn = e => {
      if (escribiendo()) return;
      const d = dirDeTecla(e.key);
      if (d) {
        if (!juegoRef.current || juegoRef.current.fin) return;
        e.preventDefault();
        moverRef.current(d);
        return;
      }
      if (e.key === "Enter" && !juegoRef.current) empezarRef.current();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dist = juego ? Math.abs(juego.jugador[0] - juego.tesoro[0]) + Math.abs(juego.jugador[1] - juego.tesoro[1]) : 0;
  const pct = juego ? ((tam * 2 - dist) / (tam * 2)) * 100 : 0;

  return (
    <GameShell titulo="Caza del tesoro" emoji="💰"
      descripcion="Flechas o WASD para moverte · el radar te guía al tesoro oculto.">
      <div className="fila-botones">
        {[8, 10, 12].map(t => (
          <button key={t} className={tam === t ? "btn-principal" : ""} onClick={() => setTam(t)}>{t}×{t}</button>
        ))}
        <button className="btn-exito" onClick={empezar}>{juego ? "Reiniciar" : "Empezar"}</button>
      </div>
      {juego && (
        <div>
          <div className="chip"><b>Pasos:</b> {juego.pasos}</div>
          <div style={{ marginTop: 10 }}>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${tam}, 34px)`, gap: 5 }}>
              {Array.from({ length: tam * tam }, (_, i) => {
                const f = Math.floor(i / tam), c = i % tam;
                const esJ = f === juego.jugador[0] && c === juego.jugador[1];
                const esT = f === juego.tesoro[0] && c === juego.tesoro[1];
                return (
                  <div key={i} className="celda" style={{ fontSize: "0.75rem", background: esJ ? "rgba(99,102,241,0.3)" : undefined }}>
                    {esJ ? "🙂" : esT && juego.fin ? "💰" : "·"}
                  </div>
                );
              })}
            </div>
            {!juego.fin && (
              <div className="fila-botones" style={{ marginTop: 12 }}>
                <button onClick={() => mover("arr")}>⬆️</button>
                <button onClick={() => mover("izq")}>⬅️</button>
                <button onClick={() => mover("aba")}>⬇️</button>
                <button onClick={() => mover("der")}>➡️</button>
              </div>
            )}
            {!juego.fin && (
              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: 12, color: "var(--texto-suave)" }}>Radar:</div>
                <div className="barra-record" style={{ width: 260 }}><div style={{ width: `${Math.max(4, pct)}%` }} /></div>
                <p style={{ margin: "8px 0 0", color: "var(--texto-suave)", fontSize: "0.9rem" }}>
                  {dist <= 1 ? "🧭 ¡Casi encima! A un paso." : dist <= 3 ? "🧭 ¡Muy cerca!" : dist <= 8 ? "🧭 Cerca." : "🧭 Aún lejos."}
                </p>
                <p className="aviso-ia">💡 Teclado: <b>flechas o WASD</b> para moverte.</p>
              </div>
            )}
            {juego.fin && <div className={`mensaje-final ${tipo === "record" ? "record" : "victoria"}`}>{mensaje}</div>}
          </div>
        </div>
      )}
    </GameShell>
  );
}
