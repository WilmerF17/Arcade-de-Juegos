import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { escribiendo } from "../suite/teclado";
import { sfx } from "../suite/sonido";

const W = 520, H = 400;
export default function Carrera() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Carrera Neón");
  const canvasRef = useRef(null);
  const [puntos, setPuntos] = useState(0);
  const [vel, setVel] = useState(1);
  const [jugando, setJugando] = useState(false);
  const [mejor, setMejor] = useState(() => Number(localStorage.getItem("arcade-carrera") || 0));
  const st = useRef(null);
  const ptsRef = useRef(0); const jugRef = useRef(false); const velRef = useRef(1);
  const keys = useRef({ l: false, r: false, u: false, d: false });
  ptsRef.current = puntos; jugRef.current = jugando; velRef.current = vel;

  function empezar() {
    st.current = { x: W / 2, en: [], frame: 0 };
    ptsRef.current = 0; setPuntos(0); setJugando(true);
  }
  function terminar() {
    setJugando(false);
    const p = ptsRef.current;
    if (p > mejor) { setMejor(p); localStorage.setItem("arcade-carrera", String(p)); }
    registrarPunt(p, p >= 400 ? 1 : 0);
    sfx.mal();
  }
  useEffect(() => {
    const dn = e => {
      if (escribiendo()) return;
      const k = e.key;
      if (["ArrowLeft", "a", "A"].includes(k)) { keys.current.l = true; e.preventDefault(); }
      if (["ArrowRight", "d", "D"].includes(k)) { keys.current.r = true; e.preventDefault(); }
      if (["ArrowUp", "w", "W"].includes(k)) { keys.current.u = true; e.preventDefault(); }
      if (["ArrowDown", "s", "S"].includes(k)) { keys.current.d = true; e.preventDefault(); }
      if ((k === "Enter" || k === " ") && !jugRef.current) empezar();
    };
    const up = e => {
      const k = e.key;
      if (["ArrowLeft", "a", "A"].includes(k)) keys.current.l = false;
      if (["ArrowRight", "d", "D"].includes(k)) keys.current.r = false;
      if (["ArrowUp", "w", "W"].includes(k)) keys.current.u = false;
      if (["ArrowDown", "s", "S"].includes(k)) keys.current.d = false;
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
      ctx.fillStyle = "#0a0f1e"; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#1a2138"; ctx.fillRect(W / 2 - 110, 0, 220, H);
      ctx.strokeStyle = "rgba(250,204,21,.6)"; ctx.setLineDash([16, 14]);
      [-70, -25, 25, 70].forEach(o => { ctx.beginPath(); ctx.moveTo(W / 2 + o, 0); ctx.lineTo(W / 2 + o, H); ctx.stroke(); });
      ctx.setLineDash([]);
      ctx.fillStyle = "rgba(34,197,94,.5)"; ctx.fillRect(0, 0, W / 2 - 110, H); ctx.fillRect(W / 2 + 110, 0, W / 2 - 110, H);
      if (!st.current) {
        ctx.fillStyle = "#9aa1b8"; ctx.font = "15px sans-serif"; ctx.textAlign = "center";
        ctx.fillText("Flechas/WASD · esquiva el tráfico", W / 2, H / 2);
        return;
      }
      const s = st.current;
      if (jugRef.current) {
        if (keys.current.l) s.x = Math.max(W / 2 - 95, s.x - 5);
        if (keys.current.r) s.x = Math.min(W / 2 + 95, s.x + 5);
        let v = 5 * velRef.current;
        if (keys.current.u) v += 2.5; if (keys.current.d) v -= 2;
        s.frame++;
        ptsRef.current += Math.round(v / 5); setPuntos(ptsRef.current);
        if (s.frame % 26 === 0) s.en.push({ x: W / 2 - 90 + Math.random() * 180, y: -40, v: v * (0.5 + Math.random() * 0.4), e: ["🚗", "🚕", "🚙", "🚌"][Math.floor(Math.random() * 4)] });
        s.en.forEach(o => { o.y += o.v + 1.5; });
        for (const o of s.en) {
          if (Math.abs(o.x - s.x) < 34 && Math.abs(o.y - (H - 80)) < 44) { terminar(); break; }
        }
        s.en = s.en.filter(o => o.y < H + 50);
      }
      st.current.en.forEach(o => { ctx.font = "30px serif"; ctx.textAlign = "center"; ctx.fillText(o.e, o.x, o.y); });
      ctx.font = "36px serif"; ctx.textAlign = "center";
      ctx.shadowBlur = 14; ctx.shadowColor = "#22d3ee"; ctx.fillText("🏎️", st.current.x, H - 60); ctx.shadowBlur = 0;
      ctx.fillStyle = "#fff"; ctx.font = "bold 14px sans-serif"; ctx.textAlign = "left";
      ctx.fillText(`Puntos ${ptsRef.current}`, 12, 22);
    }
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <GameShell titulo="Carrera Neón" emoji="🏎️" descripcion="Flechas/WASD · ↑ acelera · esquiva el tráfico.">
      <div className="fila-botones">
        <button className="btn-principal" onClick={empezar}>{jugando ? "Reiniciar" : "▶ Jugar"}</button>
        <select value={vel} onChange={e => setVel(Number(e.target.value))}>
          <option value={0.8}>🐢 Tranquilo</option><option value={1}>⚡ Normal</option><option value={1.4}>🔥 Turbo</option>
        </select>
        <span className="chip">Puntos <b>{puntos}</b></span>
        <span className="chip">🏆 <b>{mejor}</b></span>
      </div>
      <canvas ref={canvasRef} className="canvas-neon" width={W} height={H} style={{ marginTop: 14, width: "100%", maxWidth: W }} />
      <Resultado mensaje={mensaje} tipo={tipo} />
    </GameShell>
  );
}
