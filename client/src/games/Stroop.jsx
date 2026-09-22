import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { escribiendo } from "../suite/teclado";
import { sfx } from "../suite/sonido";

const COLORES = [
  { n: "ROJO", c: "#ef4444" }, { n: "VERDE", c: "#22c55e" },
  { n: "AZUL", c: "#38bdf8" }, { n: "AMARILLO", c: "#facc15" },
];
function ronda() {
  const palabra = Math.floor(Math.random() * 4);
  let tinta = Math.floor(Math.random() * 4);
  if (tinta === palabra && Math.random() < 0.7) tinta = (tinta + 1 + Math.floor(Math.random() * 3)) % 4;
  return { palabra, tinta };
}
export default function Stroop() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Stroop Colores");
  const [r, setR] = useState(ronda);
  const [puntos, setPuntos] = useState(0);
  const [aciertos, setAciertos] = useState(0);
  const [fallos, setFallos] = useState(0);
  const [tiempo, setTiempo] = useState(30);
  const [jugando, setJugando] = useState(false);
  const st = useRef({ puntos: 0, aciertos: 0 }); st.current = { puntos, aciertos };

  function empezar() { setR(ronda()); setPuntos(0); st.current.puntos = 0; setAciertos(0); st.current.aciertos = 0; setFallos(0); setTiempo(30); setJugando(true); }
  useEffect(() => {
    if (!jugando) return;
    if (tiempo <= 0) {
      setJugando(false);
      registrarPunt(st.current.puntos, st.current.aciertos >= 15 ? 1 : 0);
      sfx.record();
      return;
    }
    const id = setTimeout(() => setTiempo(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [jugando, tiempo, registrarPunt]);

  function elegir(i) {
    if (!jugando) return;
    if (i === r.tinta) {
      st.current.puntos += 10; setPuntos(st.current.puntos);
      st.current.aciertos += 1; setAciertos(st.current.aciertos);
      sfx.bien();
    } else {
      setFallos(f => f + 1);
      st.current.puntos = Math.max(0, st.current.puntos - 5); setPuntos(st.current.puntos);
      sfx.mal();
    }
    setR(ronda());
  }
  const elegirRef = useRef(elegir); elegirRef.current = elegir;
  useEffect(() => {
    const fn = e => {
      if (escribiendo() || !st.current) return;
      const mapa = { 1: 0, 2: 1, 3: 2, 4: 3, a: 0, s: 1, d: 2, f: 3 };
      const k = e.key.toLowerCase();
      if (mapa[k] != null && st.current.puntos != null && jugandoRef.current) { elegirRef.current(mapa[k]); }
      else if (e.key.startsWith("Arrow")) {
        const m = { ArrowLeft: 0, ArrowDown: 1, ArrowUp: 2, ArrowRight: 3 };
        if (m[e.key] != null && jugandoRef.current) { e.preventDefault(); elegirRef.current(m[e.key]); }
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const jugandoRef = useRef(false); jugandoRef.current = jugando;

  return (
    <GameShell titulo="Stroop Colores" emoji="🎨" descripcion="Elige el color de la TINTA (no la palabra) · 1-4 o flechas · 30s.">
      <div className="fila-botones">
        <button className="btn-principal" onClick={empezar}>{jugando ? "Reiniciar" : "▶ Jugar"}</button>
        <span className="chip">Puntos <b>{puntos}</b></span>
        <span className="chip">✅ <b>{aciertos}</b> ❌ <b>{fallos}</b></span>
        <span className="chip">⏱️ <b>{tiempo}s</b></span>
      </div>
      {jugando && (
        <div style={{ textAlign: "center", marginTop: 18 }}>
          <div style={{ fontSize: "3rem", fontWeight: 900, color: COLORES[r.tinta].c }}>{COLORES[r.palabra].n}</div>
          <div className="fila-botones" style={{ justifyContent: "center" }}>
            {COLORES.map((c, i) => (
              <button key={i} onClick={() => elegir(i)} style={{ background: c.c, color: "#111", fontWeight: 800 }}>{c.n} ({i + 1})</button>
            ))}
          </div>
        </div>
      )}
      {!jugando && mensaje && <Resultado mensaje={mensaje} tipo={tipo} />}
    </GameShell>
  );
}
