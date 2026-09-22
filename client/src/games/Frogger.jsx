import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { dirDeTecla, escribiendo } from "../suite/teclado";
import { sfx } from "../suite/sonido";

const COLS = 9, ROWS = 9;
function filaCoches(y, dir, vel, huecos) {
  const arr = [];
  for (let i = 0; i < 3; i++) arr.push({ x: Math.floor(Math.random() * COLS), dir, vel: vel + Math.random() * 0.6 });
  return { y, dir, vel, coches: arr };
}
export default function Frogger() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Rana Crossing");
  const [rana, setRana] = useState([8, 4]);
  const [puntos, setPuntos] = useState(0);
  const [vidas, setVidas] = useState(3);
  const [jugando, setJugando] = useState(false);
  const [nivel, setNivel] = useState(1);
  const carriles = useRef([]);
  const st = useRef({ rana, puntos, vidas, nivel, jugando: false });
  st.current = { rana, puntos, vidas, nivel, jugando };

  function empezar() {
    carriles.current = [5, 4, 3, 2, 1].map((y, i) => filaCoches(y, i % 2 ? 1 : -1, 0.06 + nivel * 0.012 + i * 0.008));
    st.current = { rana: [8, 4], puntos: 0, vidas: 3, nivel: 1, jugando: true };
    setRana([8, 4]); setPuntos(0); setVidas(3); setNivel(1); setJugando(true);
  }
  function mover(d) {
    const s = st.current;
    if (!s.jugando) return;
    const m = { arr: [-1, 0], aba: [1, 0], izq: [0, -1], der: [0, 1] }[d];
    const nr = Math.max(0, Math.min(8, s.rana[0] + m[0]));
    const nc = Math.max(0, Math.min(COLS - 1, s.rana[1] + m[1]));
    st.current.rana = [nr, nc]; setRana([nr, nc]);
    sfx.clic();
    if (nr === 0) {
      const np = s.puntos + 50 * s.nivel;
      const nn = s.nivel + 1;
      st.current = { ...s, puntos: np, nivel: nn, rana: [8, 4] };
      setPuntos(np); setNivel(nn); setRana([8, 4]);
      sfx.record();
      carriles.current = [5, 4, 3, 2, 1].map((y, i) => filaCoches(y, i % 2 ? 1 : -1, 0.06 + nn * 0.012 + i * 0.008));
    }
  }
  const moverRef = useRef(mover); moverRef.current = mover;
  useEffect(() => {
    const fn = e => {
      if (escribiendo()) return;
      const d = dirDeTecla(e.key);
      if (d) { e.preventDefault(); if (!st.current.jugando) empezar(); else moverRef.current(d); }
      else if (e.key === "Enter" && !st.current.jugando) empezar();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (!jugando) return;
    const id = setInterval(() => {
      const s = st.current;
      carriles.current.forEach(c => c.coches.forEach(o => {
        o.x += o.dir * o.vel;
        if (o.x < -1) o.x = COLS; if (o.x > COLS) o.x = -1;
      }));
      const [r, c] = s.rana;
      const hit = carriles.current.some(k => k.y === r && k.coches.some(o => Math.abs(o.x - c) < 0.6));
      if (hit) {
        const nv = s.vidas - 1;
        sfx.mal();
        if (nv <= 0) {
          st.current = { ...s, vidas: 0, jugando: false };
          setVidas(0); setJugando(false);
          registrarPunt(s.puntos, s.nivel > 2 ? 1 : 0);
        } else {
          st.current = { ...s, vidas: nv, rana: [8, 4] };
          setVidas(nv); setRana([8, 4]);
        }
      }
      setRana([...st.current.rana]);
    }, 50);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jugando]);

  const EMOJI = { 5: "🚗", 4: "🚕", 3: "🚙", 2: "🚌", 1: "🚛" };
  return (
    <GameShell titulo="Rana Crossing" emoji="🐸" descripcion="Flechas/WASD · cruza 5 carriles y llega arriba · 3 vidas.">
      <div className="fila-botones">
        <button className="btn-principal" onClick={empezar}>{jugando ? "Reiniciar" : "▶ Jugar"}</button>
        <span className="chip">Puntos <b>{puntos}</b></span>
        <span className="chip">Nivel <b>{nivel}</b></span>
        <span className="chip">❤️ <b>{vidas}</b></span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${COLS},36px)`, gap: 2, marginTop: 14, background: "#0b0d14", padding: 8, borderRadius: 10, width: "max-content" }}>
        {Array.from({ length: COLS * ROWS }, (_, i) => {
          const r = Math.floor(i / COLS), c = i % COLS;
          const esR = rana[0] === r && rana[1] === c;
          const carril = carriles.current.find(k => k.y === r);
          const coche = carril?.coches.find(o => Math.round(o.x) === c);
          const meta = r === 0;
          return (
            <div key={i} style={{ width: 36, height: 36, borderRadius: 6, display: "grid", placeItems: "center", fontSize: "1.3rem", background: esR ? "rgba(34,197,94,.4)" : meta ? "rgba(34,197,94,.15)" : r >= 1 && r <= 5 ? "rgba(255,255,255,.05)" : "rgba(34,197,94,.08)" }}>
              {esR ? "🐸" : coche ? EMOJI[carril.y] : meta ? "🏁" : ""}
            </div>
          );
        })}
      </div>
      <div className="fila-botones">
        {[["arr", "↑"], ["izq", "←"], ["aba", "↓"], ["der", "→"]].map(([d, f]) => (
          <button key={d} className="btn-suave" onClick={() => (!jugando ? empezar() : mover(d))}>{f}</button>
        ))}
      </div>
      {mensaje && !jugando && <Resultado mensaje={mensaje} tipo={tipo} />}
    </GameShell>
  );
}
