import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { escribiendo } from "../suite/teclado";
import { sfx } from "../suite/sonido";

const W = 520, H = 420;
export default function Stack() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Torre Stack");
  const canvasRef = useRef(null);
  const [puntos, setPuntos] = useState(0);
  const [mejor, setMejor] = useState(() => Number(localStorage.getItem("arcade-stack") || 0));
  const [jugando, setJugando] = useState(false);
  const st = useRef(null);
  const ptsRef = useRef(0); const jugRef = useRef(false);
  ptsRef.current = puntos; jugRef.current = jugando;

  function empezar() {
    st.current = { niveles: [{ x: W / 2 - 90, w: 180 }], movil: { x: 0, w: 180, dir: 1 }, vel: 3 };
    ptsRef.current = 0; setPuntos(0); setJugando(true);
  }
  function soltar() {
    const s = st.current;
    if (!s || !jugRef.current) return;
    const base = s.niveles[s.niveles.length - 1];
    const m = s.movil;
    const izq = Math.max(base.x, m.x), der = Math.min(base.x + base.w, m.x + m.w);
    const w = der - izq;
    if (w <= 8) {
      setJugando(false);
      const p = ptsRef.current;
      if (p > mejor) { setMejor(p); localStorage.setItem("arcade-stack", String(p)); }
      registrarPunt(p * 10, p >= 8 ? 1 : 0);
      sfx.mal();
      return;
    }
    s.niveles.push({ x: izq, w });
    ptsRef.current += 1; setPuntos(ptsRef.current);
    sfx.bien();
    const nv = Math.min(8, 3 + ptsRef.current * 0.3);
    s.vel = nv;
    s.movil = ptsRef.current % 2 === 0 ? { x: 0, w, dir: 1 } : { x: W - w, w, dir: -1 };
    if (s.niveles.length > 12) s.niveles.shift();
  }
  const soltarRef = useRef(soltar); soltarRef.current = soltar;

  useEffect(() => {
    const fn = e => {
      if (escribiendo()) return;
      if (e.key === " " || e.key === "Enter") { e.preventDefault(); if (!jugRef.current) empezar(); else soltarRef.current(); }
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
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, "#0a0628"); g.addColorStop(1, "#1b0f3a");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      if (!st.current) {
        ctx.fillStyle = "#9aa1b8"; ctx.font = "16px sans-serif"; ctx.textAlign = "center";
        ctx.fillText("Pulsa Jugar · ESPACIO suelta el bloque", W / 2, H / 2);
        return;
      }
      const s = st.current;
      if (jugRef.current) {
        s.movil.x += s.movil.dir * s.vel;
        if (s.movil.x <= 0 || s.movil.x + s.movil.w >= W) s.movil.dir *= -1;
      }
      const bh = 24;
      s.niveles.forEach((n, i) => {
        const y = H - 30 - (i + 1) * bh;
        const hue = (200 + i * 12) % 360;
        ctx.fillStyle = `hsl(${hue},70%,55%)`;
        ctx.shadowBlur = 10; ctx.shadowColor = `hsl(${hue},70%,55%)`;
        ctx.fillRect(n.x, y, n.w, bh - 3);
        ctx.shadowBlur = 0;
      });
      if (jugRef.current) {
        const y = H - 30 - (s.niveles.length + 1) * bh;
        ctx.fillStyle = "#fff";
        ctx.globalAlpha = 0.9;
        ctx.fillRect(s.movil.x, y, s.movil.w, bh - 3);
        ctx.globalAlpha = 1;
      }
      ctx.fillStyle = "#fff"; ctx.font = "bold 20px sans-serif"; ctx.textAlign = "center";
      ctx.fillText(`🏗️ ${ptsRef.current}`, W / 2, 30);
    }
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <GameShell titulo="Torre Stack" emoji="🏗️" descripcion="ESPACIO/clic suelta · centra cada bloque · 8+ niveles = victoria.">
      <div className="fila-botones">
        <button className="btn-principal" onClick={empezar}>{jugando ? "Reiniciar" : "▶ Jugar"}</button>
        <span className="chip">Altura <b>{puntos}</b></span>
        <span className="chip">🏆 <b>{mejor}</b></span>
      </div>
      <canvas ref={canvasRef} className="canvas-neon" width={W} height={H} style={{ marginTop: 14, width: "100%", maxWidth: W }} onClick={() => { if (!jugando) empezar(); else soltar(); }} />
      <Resultado mensaje={mensaje} tipo={tipo} />
    </GameShell>
  );
}
