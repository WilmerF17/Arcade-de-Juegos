import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro } from "../ui/GameShell";
import { escribiendo } from "../suite/teclado";
import { sfx } from "../suite/sonido";

const DIRS = [["izq", "⬅️"], ["abajo-izq", "↙️"], ["centro", "⬇️"], ["abajo-der", "↘️"], ["der", "➡️"]];
export default function Penaltis() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Penaltis");
  const [ronda, setRonda] = useState(0);
  const [goles, setGoles] = useState(0);
  const [fin, setFin] = useState(false);
  const [anim, setAnim] = useState(null);
  const [dif, setDif] = useState(2);
  const st = useRef({ ronda: 0, goles: 0 }); st.current = { ronda, goles };

  function tirar(i) {
    if (fin || anim) return;
    const portero = dif === 1 ? Math.floor(Math.random() * 5) : dif === 2 ? (Math.random() < 0.6 ? [1, 2, 3][Math.floor(Math.random() * 3)] : Math.floor(Math.random() * 5)) : Math.floor(Math.random() * 5);
    const gol = i !== portero;
    setAnim({ tiro: i, portero, gol });
    setTimeout(() => {
      const nr = st.current.ronda + 1, ng = st.current.goles + (gol ? 1 : 0);
      st.current = { ronda: nr, goles: ng };
      setRonda(nr); setGoles(ng); setAnim(null);
      if (gol) sfx.bien(); else sfx.mal();
      if (nr >= 5) {
        setFin(true);
        registrarPunt(ng * 20, ng >= 3 ? 1 : 0);
        if (ng >= 3) sfx.record();
      }
    }, 800);
  }
  const tirarRef = useRef(tirar); tirarRef.current = tirar;
  function reiniciar() { st.current = { ronda: 0, goles: 0 }; setRonda(0); setGoles(0); setFin(false); setAnim(null); }
  useEffect(() => {
    const fn = e => {
      if (escribiendo() || fin) return;
      const mapa = { ArrowLeft: 0, a: 0, A: 0, 1: 0, ArrowDown: 2, s: 2, S: 2, 3: 2, ArrowRight: 4, d: 4, D: 4, 5: 4, 2: 1, 4: 3, q: 1, e: 3, Q: 1, E: 3 };
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (mapa[e.key] != null) tirarRef.current(mapa[e.key]);
      else if (mapa[k] != null) tirarRef.current(mapa[k]);
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [fin, anim, dif]);

  return (
    <GameShell titulo="Penaltis" emoji="⚽" descripcion="Flechas/WASD o 1-5 · 5 lanzamientos · el portero adivina.">
      <div className="fila-botones">
        {[1, 2, 3].map(d => <button key={d} className={dif === d ? "btn-principal" : ""} onClick={() => setDif(d)}>{d === 1 ? "Fácil" : d === 2 ? "Normal" : "Difícil"}</button>)}
        <button className="btn-exito" onClick={reiniciar}>Reiniciar</button>
        <span className="chip">Goles <b>{goles}/{ronda}</b></span>
      </div>
      <div style={{ fontSize: "4rem", textAlign: "center", marginTop: 12 }}>
        {!anim ? "🥅🧍" : anim.gol ? "⚽🎉" : "🧤⛔"}
      </div>
      {!fin && !anim && (
        <div className="fila-botones" style={{ justifyContent: "center" }}>
          {DIRS.map(([id, e], i) => <button key={id} className="btn-principal" onClick={() => tirar(i)}>{e}</button>)}
        </div>
      )}
      {anim && <p style={{ textAlign: "center" }}>Tú {DIRS[anim.tiro][1]} · Portero {DIRS[anim.portero][1]} → {anim.gol ? "¡GOL! ✅" : "¡Parada! ❌"}</p>}
      {fin && <div className={`mensaje-final ${tipo}`}>🏁 {goles}/5 goles. {mensaje}</div>}
    </GameShell>
  );
}
