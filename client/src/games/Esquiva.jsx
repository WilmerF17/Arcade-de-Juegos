import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro } from "../ui/GameShell";
import { escribiendo } from "../suite/teclado";
import { sfx } from "../suite/sonido";

const W = 520, H = 380;
export default function Esquiva() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Esquiva Meteoros");
  const canvasRef = useRef(null);
  const [puntos, setPuntos] = useState(0);
  const [mejor, setMejor] = useState(() => Number(localStorage.getItem("arcade-esquiva") || 0));
  const [jugando, setJugando] = useState(false);
  const st = useRef(null);
  const ptsRef = useRef(0); const jugRef = useRef(false);
  const teclas = useRef({ u: false, d: false, l: false, r: false });
  ptsRef.current = puntos; jugRef.current = jugando;

  function empezar() {
    st.current = { x: W / 2, y: H - 60, mets: [], frame: 0 };
    ptsRef.current = 0; setPuntos(0); setJugando(true);
  }
  function terminar() {
    setJugando(false);
    const p = ptsRef.current;
    if (p > mejor) { setMejor(p); localStorage.setItem("arcade-esquiva", String(p)); }
    registrarPunt(p, p >= 300 ? 1 : 0);
    sfx.mal();
  }

  useEffect(() => {
    const dn = e => {
      if (escribiendo()) return;
      const k = e.key;
      if (["ArrowUp", "w", "W"].includes(k)) { teclas.current.u = true; e.preventDefault(); }
      if (["ArrowDown", "s", "S"].includes(k)) { teclas.current.d = true; e.preventDefault(); }
      if (["ArrowLeft", "a", "A"].includes(k)) { teclas.current.l = true; e.preventDefault(); }
      if (["ArrowRight", "d", "D"].includes(k)) { teclas.current.r = true; e.preventDefault(); }
      if ((k === "Enter" || k === " ") && !jugRef.current) empezar();
    };
    const up = e => {
      const k = e.key;
      if (["ArrowUp", "w", "W"].includes(k)) teclas.current.u = false;
      if (["ArrowDown", "s", "S"].includes(k)) teclas.current.d = false;
      if (["ArrowLeft", "a", "A"].includes(k)) teclas.current.l = false;
      if (["ArrowRight", "d", "D"].includes(k)) teclas.current.r = false;
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
      ctx.fillStyle = "#070a18"; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "rgba(255,255,255,.4)";
      for (let i = 0; i < 50; i++) ctx.fillRect((i * 89) % W, (i * 53) % H, 2, 2);
      if (!st.current) {
        ctx.fillStyle = "#9aa1b8"; ctx.font = "16px sans-serif"; ctx.textAlign = "center";
        ctx.fillText("Pulsa Jugar · flechas o WASD para moverte", W / 2, H / 2);
        return;
      }
      const s = st.current;
      if (jugRef.current) {
        const V = 5;
        if (teclas.current.u) s.y = Math.max(20, s.y - V);
        if (teclas.current.d) s.y = Math.min(H - 20, s.y + V);
        if (teclas.current.l) s.x = Math.max(16, s.x - V);
        if (teclas.current.r) s.x = Math.min(W - 16, s.x + V);
        s.frame++;
        ptsRef.current += 1; setPuntos(ptsRef.current);
        if (s.frame % Math.max(8, 24 - Math.floor(s.frame / 300)) === 0)
          s.mets.push({ x: Math.random() * W, y: -20, v: 2 + Math.random() * 3 + s.frame / 900, r: 10 + Math.random() * 12 });
        s.mets.forEach(m => { m.y += m.v; });
        for (const m of s.mets) {
          if (Math.hypot(m.x - s.x, m.y - s.y) < m.r + 10) { terminar(); break; }
        }
        s.mets = s.mets.filter(m => m.y < H + 30);
      }
      s.mets.forEach(m => { ctx.font = `${m.r * 2}px serif`; ctx.textAlign = "center"; ctx.fillText("☄️", m.x, m.y); });
      ctx.font = "26px serif"; ctx.textAlign = "center";
      ctx.shadowBlur = 14; ctx.shadowColor = "#22d3ee"; ctx.fillText("🚀", s.x, s.y); ctx.shadowBlur = 0;
      ctx.fillStyle = "#fff"; ctx.font = "bold 15px sans-serif"; ctx.textAlign = "left";
      ctx.fillText(`Puntos ${ptsRef.current}`, 12, 24);
    }
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <GameShell titulo="Esquiva Meteoros" emoji="🚀" descripcion="Flechas o WASD · sobrevive · 1 punto por frame.">
      <div className="fila-botones" style={{ marginTop: 0 }}>
        <button className="btn-principal" onClick={empezar}>{jugando ? "Reiniciar" : "▶ Jugar"}</button>
        <span className="chip">Puntos <b>{puntos}</b></span>
        <span className="chip">🏆 <b>{mejor}</b></span>
      </div>
      <canvas ref={canvasRef} className="canvas-neon" width={W} height={H} style={{ marginTop: 14, width: "100%", maxWidth: W }} />
      {mensaje && <div className={`mensaje-final ${tipo}`}>{mensaje}</div>}
    </GameShell>
  );
}
