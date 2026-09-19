import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro } from "../ui/GameShell";
import { escribiendo } from "../suite/teclado";
import { sfx } from "../suite/sonido";

const W = 520, H = 400;
export default function Naves() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Invasores Neón");
  const canvasRef = useRef(null);
  const [puntos, setPuntos] = useState(0);
  const [vidas, setVidas] = useState(3);
  const [jugando, setJugando] = useState(false);
  const st = useRef(null);
  const ptsRef = useRef(0); const vidasRef = useRef(3); const jugRef = useRef(false);
  const teclas = useRef({ l: false, r: false });
  ptsRef.current = puntos; vidasRef.current = vidas; jugRef.current = jugando;

  function empezar() {
    const aliens = [];
    for (let r = 0; r < 3; r++) for (let c = 0; c < 8; c++) aliens.push({ x: 40 + c * 55, y: 50 + r * 40, vivo: true });
    st.current = { x: W / 2, balas: [], balasE: [], aliens, dir: 1, frame: 0 };
    ptsRef.current = 0; vidasRef.current = 3;
    setPuntos(0); setVidas(3); setJugando(true);
  }
  function terminar(gano, pts) {
    setJugando(false);
    registrarPunt(pts, gano ? 1 : 0);
    if (gano) sfx.record(); else sfx.mal();
  }
  function disparar() {
    const s = st.current;
    if (!s || !jugRef.current) return;
    if (s.balas.length < 4) { s.balas.push({ x: s.x, y: H - 50 }); sfx.clic(); }
  }

  useEffect(() => {
    const dn = e => {
      if (escribiendo()) return;
      if (["ArrowLeft", "a", "A"].includes(e.key)) { teclas.current.l = true; e.preventDefault(); }
      if (["ArrowRight", "d", "D"].includes(e.key)) { teclas.current.r = true; e.preventDefault(); }
      if (e.key === " " || e.key === "ArrowUp" || e.key === "w" || e.key === "W") { e.preventDefault(); if (!jugRef.current) empezar(); else disparar(); }
      else if (e.key === "Enter" && !jugRef.current) empezar();
    };
    const up = e => {
      if (["ArrowLeft", "a", "A"].includes(e.key)) teclas.current.l = false;
      if (["ArrowRight", "d", "D"].includes(e.key)) teclas.current.r = false;
    };
    window.addEventListener("keydown", dn); window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", dn); window.removeEventListener("keyup", up); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const cv = canvasRef.current; if (!cv) return;
    const ctx = cv.getContext("2d");
    let raf;
    function frame() {
      raf = requestAnimationFrame(frame);
      ctx.fillStyle = "#05060f"; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "rgba(255,255,255,.35)";
      for (let i = 0; i < 60; i++) ctx.fillRect((i * 67) % W, (i * 41) % H, 2, 2);
      if (!st.current) {
        ctx.fillStyle = "#9aa1b8"; ctx.font = "16px sans-serif"; ctx.textAlign = "center";
        ctx.fillText("Pulsa Jugar · ←/→ o A/D + ESPACIO", W / 2, H / 2);
        return;
      }
      const s = st.current;
      if (jugRef.current) {
        if (teclas.current.l) s.x = Math.max(20, s.x - 6);
        if (teclas.current.r) s.x = Math.min(W - 20, s.x + 6);
        s.frame++;
        if (s.frame % Math.max(20, 50 - ptsRef.current / 20) === 0) {
          let minX = 9999, maxX = -9999;
          s.aliens.forEach(a => { if (a.vivo) { minX = Math.min(minX, a.x); maxX = Math.max(maxX, a.x); } });
          if (maxX > W - 30 || minX < 30) { s.dir *= -1; s.aliens.forEach(a => { a.y += 14; }); }
          else s.aliens.forEach(a => { a.x += s.dir * 8; });
          const vivos = s.aliens.filter(a => a.vivo);
          if (vivos.length && Math.random() < 0.5) {
            const a = vivos[Math.floor(Math.random() * vivos.length)];
            s.balasE.push({ x: a.x, y: a.y + 14 });
          }
        }
        s.balas.forEach(b => { b.y -= 9; });
        s.balasE.forEach(b => { b.y += 3.5; });
        s.balas = s.balas.filter(b => {
          let hit = false;
          s.aliens.forEach(a => {
            if (a.vivo && Math.abs(a.x - b.x) < 22 && Math.abs(a.y - b.y) < 16) { a.vivo = false; hit = true; ptsRef.current += 20; setPuntos(ptsRef.current); sfx.bien(); }
          });
          return !hit && b.y > 0;
        });
        s.balasE = s.balasE.filter(b => {
          if (Math.abs(b.x - s.x) < 18 && b.y > H - 60 && b.y < H - 20) {
            vidasRef.current -= 1; setVidas(vidasRef.current); sfx.mal();
            if (vidasRef.current <= 0) terminar(false, ptsRef.current);
            return false;
          }
          return b.y < H;
        });
        if (s.aliens.every(a => !a.vivo)) terminar(true, ptsRef.current + vidasRef.current * 50 + 200);
        if (s.aliens.some(a => a.vivo && a.y > H - 80)) terminar(false, ptsRef.current);
      }
      s.aliens.forEach(a => { if (!a.vivo) return; ctx.font = "24px serif"; ctx.textAlign = "center"; ctx.fillText("👾", a.x, a.y); });
      s.balas.forEach(b => { ctx.fillStyle = "#22d3ee"; ctx.fillRect(b.x - 2, b.y - 8, 4, 12); });
      s.balasE.forEach(b => { ctx.fillStyle = "#ef4444"; ctx.fillRect(b.x - 2, b.y - 6, 4, 10); });
      ctx.font = "30px serif"; ctx.textAlign = "center"; ctx.fillText("🚀", s.x, H - 24);
      ctx.fillStyle = "#fff"; ctx.font = "bold 14px sans-serif"; ctx.textAlign = "left";
      ctx.fillText(`Puntos ${ptsRef.current}  ❤️ ${vidasRef.current}`, 12, 22);
    }
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <GameShell titulo="Invasores Neón" emoji="👾" descripcion="←/→ o A/D moverse · ESPACIO disparar · 3 vidas.">
      <div className="fila-botones" style={{ marginTop: 0 }}>
        <button className="btn-principal" onClick={empezar}>{jugando ? "Reiniciar" : "▶ Jugar"}</button>
        <button className="btn-suave" onClick={disparar}>🔫 Disparar</button>
        <span className="chip">Puntos <b>{puntos}</b></span>
        <span className="chip">❤️ <b>{vidas}</b></span>
      </div>
      <canvas ref={canvasRef} className="canvas-neon" width={W} height={H} style={{ marginTop: 14, width: "100%", maxWidth: W }} onClick={disparar} />
      {mensaje && <div className={`mensaje-final ${tipo}`}>{mensaje}</div>}
    </GameShell>
  );
}
