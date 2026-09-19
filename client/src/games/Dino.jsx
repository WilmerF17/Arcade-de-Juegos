import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro } from "../ui/GameShell";
import { escribiendo } from "../suite/teclado";
import { sfx } from "../suite/sonido";

const W = 520, H = 300;
export default function Dino() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Dino Salto");
  const canvasRef = useRef(null);
  const [puntos, setPuntos] = useState(0);
  const [mejor, setMejor] = useState(() => Number(localStorage.getItem("arcade-dino") || 0));
  const [jugando, setJugando] = useState(false);
  const st = useRef(null);
  const ptsRef = useRef(0); const jugRef = useRef(false);
  ptsRef.current = puntos; jugRef.current = jugando;

  function empezar() {
    st.current = { h: 0, v: 0, obs: [], frame: 0 };
    ptsRef.current = 0; setPuntos(0); setJugando(true);
  }
  function saltar() {
    const s = st.current;
    if (!s || !jugRef.current) return;
    if (s.h === 0) { s.v = 11; sfx.salto(); }
  }
  function terminar() {
    setJugando(false);
    const p = ptsRef.current;
    if (p > mejor) { setMejor(p); localStorage.setItem("arcade-dino", String(p)); }
    registrarPunt(p, p >= 300 ? 1 : 0);
    sfx.mal();
  }
  const saltarRef = useRef(saltar); saltarRef.current = saltar;

  useEffect(() => {
    const fn = e => {
      if (escribiendo()) return;
      if ([" ", "ArrowUp", "w", "W"].includes(e.key)) { e.preventDefault(); if (!jugRef.current) empezar(); else saltarRef.current(); }
      else if (e.key === "Enter" && !jugRef.current) empezar();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mejor]);

  useEffect(() => {
    const cv = canvasRef.current; if (!cv) return;
    const ctx = cv.getContext("2d");
    let raf;
    function frame() {
      raf = requestAnimationFrame(frame);
      ctx.fillStyle = "#0b0d14"; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "rgba(255,255,255,.2)"; ctx.beginPath(); ctx.moveTo(0, H - 40); ctx.lineTo(W, H - 40); ctx.stroke();
      if (!st.current) {
        ctx.fillStyle = "#9aa1b8"; ctx.font = "16px sans-serif"; ctx.textAlign = "center";
        ctx.fillText("Pulsa Jugar · ESPACIO / W / ↑ para saltar", W / 2, H / 2);
        return;
      }
      const s = st.current;
      if (jugRef.current) {
        s.frame++;
        ptsRef.current += 1; setPuntos(ptsRef.current);
        // física del salto: h = altura, v = velocidad vertical
        if (s.h > 0 || s.v > 0) {
          s.h += s.v;
          s.v -= 0.7;
          if (s.h <= 0) { s.h = 0; s.v = 0; }
        }
        if (s.frame % 70 === 0) s.obs.push({ x: W + 20, w: 18 + Math.random() * 14, h: 26 + Math.random() * 22 });
        const vel = 5 + s.frame / 400;
        s.obs.forEach(o => { o.x -= vel; });
        s.obs = s.obs.filter(o => o.x > -40);
        const px = 70, pw = 26, ph = 30;
        const py = H - 40 - s.y - ph;
        for (const o of s.obs) {
          const oy = H - 40 - o.h;
          if (px < o.x + o.w && px + pw > o.x && py < oy + o.h && py + ph > oy) { terminar(); break; }
        }
      }
      const s2 = st.current;
      s2.obs.forEach(o => { ctx.font = `${o.h}px serif`; ctx.textAlign = "center"; ctx.fillText("🌵", o.x + o.w / 2, H - 36); });
      const py2 = H - 40 - s2.h;
      ctx.font = "30px serif"; ctx.textAlign = "center";
      ctx.fillText(jugRef.current && s2.h > 0 ? "🦖" : s2.frame % 20 < 10 ? "🦖" : "🦕", 70 + 13, py2);
      ctx.fillStyle = "#fff"; ctx.font = "bold 15px sans-serif"; ctx.textAlign = "left";
      ctx.fillText(`Puntos ${ptsRef.current}`, 12, 24);
    }
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <GameShell titulo="Dino Salto" emoji="🦖" descripcion="ESPACIO / W / ↑ para saltar cactus · aguanta.">
      <div className="fila-botones" style={{ marginTop: 0 }}>
        <button className="btn-principal" onClick={empezar}>{jugando ? "Reiniciar" : "▶ Jugar"}</button>
        <span className="chip">Puntos <b>{puntos}</b></span>
        <span className="chip">🏆 <b>{mejor}</b></span>
      </div>
      <canvas ref={canvasRef} className="canvas-neon" width={W} height={H} style={{ marginTop: 14, width: "100%", maxWidth: W }} onClick={() => { if (!jugando) empezar(); else saltar(); }} />
      {mensaje && <div className={`mensaje-final ${tipo}`}>{mensaje}</div>}
    </GameShell>
  );
}
