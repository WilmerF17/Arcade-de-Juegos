import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro } from "../ui/GameShell";
import { escribiendo } from "../suite/teclado";
import { sfx } from "../suite/sonido";

const W = 520, H = 380;
export default function Malabares() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Malabares");
  const canvasRef = useRef(null);
  const [toques, setToques] = useState(0);
  const [mejor, setMejor] = useState(() => Number(localStorage.getItem("arcade-malabares") || 0));
  const [jugando, setJugando] = useState(false);
  const st = useRef(null);
  const tRef = useRef(0); const jugRef = useRef(false);
  const keys = useRef({ l: false, r: false });
  tRef.current = toques; jugRef.current = jugando;

  function empezar() {
    st.current = { px: W / 2, x: W / 2, y: H / 2, vx: 3 * (Math.random() < 0.5 ? 1 : -1), vy: -3.5 };
    tRef.current = 0; setToques(0); setJugando(true);
  }
  function terminar() {
    setJugando(false);
    const t = tRef.current;
    if (t > mejor) { setMejor(t); localStorage.setItem("arcade-malabares", String(t)); }
    registrarPunt(t * 5, t >= 20 ? 1 : 0);
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
    const mv = e => {
      const cx = e.clientX ?? e.touches?.[0]?.clientX;
      if (cx == null || !st.current) return;
      const r = cv.getBoundingClientRect();
      st.current.px = Math.max(45, Math.min(W - 45, (cx - r.left) * (W / r.width)));
    };
    cv.addEventListener("mousemove", mv); cv.addEventListener("touchmove", mv, { passive: true });
    function frame() {
      raf = requestAnimationFrame(frame);
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, "#1a0f2e"); g.addColorStop(1, "#0a0f2e");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      if (!st.current) {
        ctx.fillStyle = "#9aa1b8"; ctx.font = "15px sans-serif"; ctx.textAlign = "center";
        ctx.fillText("Mantén la bola en el aire · ←/→ o ratón", W / 2, H / 2);
        return;
      }
      const s = st.current;
      if (jugRef.current) {
        if (keys.current.l) s.px = Math.max(45, s.px - 7);
        if (keys.current.r) s.px = Math.min(W - 45, s.px + 7);
        s.vy += 0.18;
        s.x += s.vx; s.y += s.vy;
        if (s.x < 10 || s.x > W - 10) s.vx *= -1;
        if (s.y < 10) s.vy = Math.abs(s.vy);
        if (s.y > H - 46 && s.y < H - 26 && Math.abs(s.x - s.px) < 52) {
          s.vy = -Math.min(9, Math.abs(s.vy) * 1.03 + 0.4);
          s.vx += (s.x - s.px) * 0.03;
          tRef.current += 1; setToques(tRef.current);
          sfx.bien();
        }
        if (s.y > H + 10) terminar();
      }
      ctx.fillStyle = "#a855f7"; ctx.shadowBlur = 14; ctx.shadowColor = "#a855f7";
      ctx.beginPath(); ctx.roundRect ? ctx.roundRect(s.px - 45, H - 36, 90, 12, 6) : ctx.rect(s.px - 45, H - 36, 90, 12); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#facc15"; ctx.shadowBlur = 16; ctx.shadowColor = "#facc15";
      ctx.beginPath(); ctx.arc(s.x, s.y, 9, 0, 7); ctx.fill(); ctx.shadowBlur = 0;
      ctx.fillStyle = "#fff"; ctx.font = "bold 20px sans-serif"; ctx.textAlign = "center";
      ctx.fillText(`${tRef.current}`, W / 2, 34);
    }
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); cv.removeEventListener("mousemove", mv); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <GameShell titulo="Malabares" emoji="🤹" descripcion="←/→, A/D o ratón · no dejes caer la bola.">
      <div className="fila-botones" style={{ marginTop: 0 }}>
        <button className="btn-principal" onClick={empezar}>{jugando ? "Reiniciar" : "▶ Jugar"}</button>
        <span className="chip">Toques <b>{toques}</b></span>
        <span className="chip">🏆 <b>{mejor}</b></span>
      </div>
      <canvas ref={canvasRef} className="canvas-neon" width={W} height={H} style={{ marginTop: 14, width: "100%", maxWidth: W }} />
      {mensaje && <div className={`mensaje-final ${tipo}`}>{mensaje}</div>}
    </GameShell>
  );
}
