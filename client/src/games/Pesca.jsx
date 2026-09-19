import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro } from "../ui/GameShell";
import { escribiendo } from "../suite/teclado";
import { sfx } from "../suite/sonido";

const PECES = ["🐟", "🐠", "🐡", "🦈", "👢"];
export default function Pesca() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Pesca");
  const [fase, setFase] = useState("espera"); // espera -> picando -> resultado
  const [pez, setPez] = useState(null);
  const [puntos, setPuntos] = useState(0);
  const [lances, setLances] = useState(0);
  const [barra, setBarra] = useState(50);
  const [dir, setDir] = useState(1);
  const timer = useRef(null);
  const st = useRef({ puntos: 0, lances: 0 });
  st.current = { puntos, lances };

  function lanzar() {
    if (fase === "picando") return;
    setFase("picando"); setPez(null);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const p = PECES[Math.floor(Math.random() * PECES.length)];
      setPez(p); setFase("resultado");
      sfx.salto();
      clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        setFase("espera"); setPez(null);
      }, 1500);
    }, 1200 + Math.random() * 2500);
  }
  function recoger() {
    if (fase !== "resultado" || !pez) return;
    clearTimeout(timer.current);
    const vals = { "🐟": 10, "🐠": 15, "🐡": 20, "🦈": 40, "👢": -10 };
    const g = vals[pez] ?? 10;
    // bonus por centrar la barra
    const bonus = Math.max(0, 10 - Math.abs(barra - 50) / 5);
    st.current.puntos += Math.max(-10, g + Math.round(bonus));
    st.current.lances += 1;
    setPuntos(st.current.puntos); setLances(st.current.lances);
    if (g >= 0) sfx.bien(); else sfx.mal();
    setFase("espera"); setPez(null);
    if (st.current.lances >= 10) {
      registrarPunt(Math.max(10, st.current.puntos), st.current.puntos >= 120 ? 1 : 0);
      sfx.record();
    }
  }
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    const id = setInterval(() => {
      setBarra(b => { const n = b + 3 * dir; if (n >= 100 || n <= 0) setDir(d => -d); return Math.max(0, Math.min(100, n)); });
    }, 30);
    return () => clearInterval(id);
  }, [dir]);
  const lanzarRef = useRef(lanzar); lanzarRef.current = lanzar;
  const recogerRef = useRef(recoger); recogerRef.current = recoger;
  useEffect(() => {
    const fn = e => {
      if (escribiendo()) return;
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); if (fase === "espera") lanzarRef.current(); else recogerRef.current(); }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [fase, pez, barra]);
  const fin = lances >= 10;
  return (
    <GameShell titulo="Pesca" emoji="🎣" descripcion="ENTER lanzar · ENTER recoger en verde · 10 lances.">
      <div className="fila-botones" style={{ marginTop: 0 }}>
        <button className="btn-principal" onClick={() => { st.current = { puntos: 0, lances: 0 }; setPuntos(0); setLances(0); setFase("espera"); setPez(null); }}>{lances > 0 ? "↻ Otra vez" : "▶ Jugar"}</button>
        <span className="chip">Puntos <b>{puntos}</b></span>
        <span className="chip">Lances <b>{lances}/10</b></span>
      </div>
      <div style={{ fontSize: "4rem", textAlign: "center", marginTop: 10 }}>
        {fase === "espera" ? "🎣🌊" : fase === "picando" ? "🎣…⏳" : `${pez}❗`}
      </div>
      {fase !== "espera" && (
        <div style={{ marginTop: 8 }}>
          <div>Precisión (centra en verde)</div>
          <div className="barra-record" style={{ width: 300, position: "relative" }}>
            <div style={{ position: "absolute", left: "40%", width: "20%", height: "100%", background: "rgba(34,197,94,.5)" }} />
            <div style={{ width: `${barra}%`, background: "var(--info)" }} />
          </div>
          <div className="fila-botones">
            {fase === "espera" ? <button className="btn-principal" onClick={lanzar}>🎣 Lanzar (ENTER)</button>
              : fase === "picando" ? <span className="chip">Espera el pique…</span>
                : <button className="btn-exito" onClick={recoger}>🪝 ¡Recoger! (ENTER)</button>}
          </div>
        </div>
      )}
      {fase === "espera" && lances < 10 && <div className="fila-botones"><button className="btn-principal" onClick={lanzar}>🎣 Lanzar (ENTER)</button></div>}
      {fin && <div className={`mensaje-final ${tipo}`}>🏁 Pesca completa. {mensaje}</div>}
    </GameShell>
  );
}
