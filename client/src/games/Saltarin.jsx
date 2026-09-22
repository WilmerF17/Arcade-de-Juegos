import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { escribiendo } from "../suite/teclado";
import { sfx } from "../suite/sonido";

const W = 420, H = 520;
export default function Saltarin() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Saltarín Vertical");
  const canvasRef = useRef(null);
  const [puntos, setPuntos] = useState(0);
  const [mejor, setMejor] = useState(() => Number(localStorage.getItem("arcade-saltarin") || 0));
  const [jugando, setJugando] = useState(false);
  const st = useRef(null);
  const ptsRef = useRef(0); const jugRef = useRef(false);
  const keys = useRef({ l: false, r: false });
  ptsRef.current = puntos; jugRef.current = jugando;

  function empezar() {
    const plats = [];
    for (let i = 0; i < 9; i++) plats.push({ x: Math.random() * (W - 70), y: H - 40 - i * 62, w: 70 });
    st.current = { x: W / 2, y: H - 100, vy: 0, plats, maxY: H - 100 };
    ptsRef.current = 0; setPuntos(0); setJugando(true);
  }
  function terminar() {
    setJugando(false);
    const p = ptsRef.current;
    if (p > mejor) { setMejor(p); localStorage.setItem("arcade-saltarin", String(p)); }
    registrarPunt(p, p >= 500 ? 1 : 0);
    sfx.mal();
  }
  useEffect(() => {
    const dn = e => {
      if (escribiendo()) return;
      if (["ArrowLeft", "a", "A"].includes(e.key)) { keys.current.l = true; e.preventDefault(); }
      if (["ArrowRight", "d", "D"].includes(e.key)) { keys.current.r = true; e.preventDefault(); }
      if ((e.key === "Enter" || e.key === " ") && !jugRef.current) empezar();
    };
    const up = e => {
      if (["ArrowLeft", "a", "A"].includes(e.key)) keys.current.l = false;
      if (["ArrowRight", "d", "D"].includes(e.key)) keys.current.r = false;
    };
    window.addEventListener("keydown", dn); window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", dn); window.removeEventListener("keyup", up); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mejor]);
  useEffect(() => {
    const cv = canvasRef.current; if (!cv) return;
    const ctx = cv.getContext("2d");
    let raf;
    function frame() {
      raf = requestAnimationFrame(frame);
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, "#0a0628"); g.addColorStop(1, "#1b2b4a");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      if (!st.current) {
        ctx.fillStyle = "#9aa1b8"; ctx.font = "15px sans-serif"; ctx.textAlign = "center";
        ctx.fillText("←/→ o A/D · rebota siempre hacia arriba", W / 2, H / 2);
        return;
      }
      const s = st.current;
      if (jugRef.current) {
        if (keys.current.l) s.x -= 5;
        if (keys.current.r) s.x += 5;
        if (s.x < -14) s.x = W + 14; if (s.x > W + 14) s.x = -14;
        s.vy -= 0.45; s.y -= s.vy;
        if (s.vy < 0) {
          s.plats.forEach(p => {
            if (s.x > p.x - 12 && s.x < p.x + p.w + 12 && s.y >= p.y - 8 && s.y <= p.y + 8) {
              s.vy = 11; sfx.salto();
            }
          });
        }
        if (s.y < H * 0.4) {
          const dy = H * 0.4 - s.y;
          s.y = H * 0.4;
          s.plats.forEach(p => { p.y += dy; });
          ptsRef.current += Math.round(dy); setPuntos(ptsRef.current);
        }
        s.plats = s.plats.filter(p => p.y < H + 20);
        while (s.plats.length < 9) {
          const top = Math.min(...s.plats.map(p => p.y));
          s.plats.push({ x: Math.random() * (W - 70), y: top - 62, w: Math.max(48, 70 - ptsRef.current / 120) });
        }
        if (s.y > H + 30) terminar();
      }
      s.plats.forEach(p => {
        ctx.fillStyle = "#22c55e"; ctx.shadowBlur = 8; ctx.shadowColor = "#22c55e";
        ctx.beginPath(); ctx.roundRect ? ctx.roundRect(p.x, p.y, p.w, 12, 6) : ctx.rect(p.x, p.y, p.w, 12); ctx.fill(); ctx.shadowBlur = 0;
      });
      ctx.font = "26px serif"; ctx.textAlign = "center"; ctx.fillText("🐤", s.x, s.y);
      ctx.fillStyle = "#fff"; ctx.font = "bold 16px sans-serif"; ctx.textAlign = "left";
      ctx.fillText(`${ptsRef.current}m`, 12, 24);
    }
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <GameShell titulo="Saltarín Vertical" emoji="🐤" descripcion="←/→ o A/D · sube sin caer al vacío.">
      <div className="fila-botones">
        <button className="btn-principal" onClick={empezar}>{jugando ? "Reiniciar" : "▶ Jugar"}</button>
        <span className="chip">Altura <b>{puntos}m</b></span>
        <span className="chip">🏆 <b>{mejor}m</b></span>
      </div>
      <canvas ref={canvasRef} className="canvas-neon" width={W} height={H} style={{ marginTop: 14, width: "100%", maxWidth: W }} />
      <Resultado mensaje={mensaje} tipo={tipo} />
    </GameShell>
  );
}
