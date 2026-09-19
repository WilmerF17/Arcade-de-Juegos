import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro } from "../ui/GameShell";
import { escribiendo } from "../suite/teclado";
import { sfx } from "../suite/sonido";

const W = 520, H = 340;
export default function Pong2P() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Pong 2 Jugadores");
  const canvasRef = useRef(null);
  const [puntos, setPuntos] = useState({ a: 0, b: 0 });
  const [jugando, setJugando] = useState(false);
  const st = useRef(null);
  const ptsRef = useRef({ a: 0, b: 0 });
  const jugRef = useRef(false);
  const keys = useRef({});
  ptsRef.current = puntos; jugRef.current = jugando;

  function empezar() {
    st.current = { ay: H / 2 - 40, by: H / 2 - 40, x: W / 2, y: H / 2, vx: 4 * (Math.random() < 0.5 ? 1 : -1), vy: 2.5 * (Math.random() < 0.5 ? 1 : -1), estela: [] };
    ptsRef.current = { a: 0, b: 0 }; setPuntos({ a: 0, b: 0 }); setJugando(true);
  }
  function terminar(winner) {
    setJugando(false);
    registrarPunt(100, 1);
    if (winner === "a") sfx.record(); else sfx.bien();
    st.current.ganador = winner;
  }
  useEffect(() => {
    const dn = e => {
      if (escribiendo()) return;
      const k = e.key.toLowerCase();
      if (["w", "s", "arrowup", "arrowdown"].includes(k) || ["w", "s"].includes(e.key)) e.preventDefault();
      keys.current[e.key.toLowerCase()] = true;
      if ((e.key === "Enter" || e.key === " ") && !jugRef.current) empezar();
    };
    const up = e => { keys.current[e.key.toLowerCase()] = false; };
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
      ctx.fillStyle = "#070a18"; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "rgba(99,102,241,.4)"; ctx.setLineDash([8, 8]);
      ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.stroke(); ctx.setLineDash([]);
      if (!st.current) {
        ctx.fillStyle = "#9aa1b8"; ctx.font = "15px sans-serif"; ctx.textAlign = "center";
        ctx.fillText("J1: W/S · J2: ↑/↓ · primero a 5", W / 2, H / 2);
        return;
      }
      const s = st.current;
      if (jugRef.current) {
        const V = 6.5;
        if (keys.current["w"]) s.ay = Math.max(0, s.ay - V);
        if (keys.current["s"]) s.ay = Math.min(H - 80, s.ay + V);
        if (keys.current["arrowup"]) s.by = Math.max(0, s.by - V);
        if (keys.current["arrowdown"]) s.by = Math.min(H - 80, s.by + V);
        s.x += s.vx; s.y += s.vy;
        s.estela.push({ x: s.x, y: s.y }); if (s.estela.length > 12) s.estela.shift();
        if (s.y < 6 || s.y > H - 6) s.vy *= -1;
        if (s.x < 22 && s.y > s.ay && s.y < s.ay + 80) { s.vx = Math.min(11, Math.abs(s.vx) * 1.05); s.vy += (Math.random() - 0.5); }
        if (s.x > W - 22 && s.y > s.by && s.y < s.by + 80) { s.vx = -Math.min(11, Math.abs(s.vx) * 1.05); s.vy += (Math.random() - 0.5); }
        if (s.x < 0) {
          const n = { ...ptsRef.current, b: ptsRef.current.b + 1 };
          ptsRef.current = n; setPuntos(n);
          if (n.b >= 5) terminar("b");
          s.x = W / 2; s.y = H / 2; s.vx = 4; s.vy = 2.5;
        }
        if (s.x > W) {
          const n = { ...ptsRef.current, a: ptsRef.current.a + 1 };
          ptsRef.current = n; setPuntos(n);
          if (n.a >= 5) terminar("a");
          s.x = W / 2; s.y = H / 2; s.vx = -4; s.vy = 2.5;
        }
      }
      s.estela.forEach((p, i) => { ctx.fillStyle = `rgba(34,211,238,${i / s.estela.length * 0.5})`; ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, 7); ctx.fill(); });
      ctx.shadowBlur = 16; ctx.shadowColor = "#22c55e"; ctx.fillStyle = "#22c55e"; ctx.fillRect(10, s.ay, 10, 80);
      ctx.shadowColor = "#e879f9"; ctx.fillStyle = "#e879f9"; ctx.fillRect(W - 20, s.by, 10, 80);
      ctx.shadowBlur = 0; ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(s.x, s.y, 7, 0, 7); ctx.fill();
      ctx.fillStyle = "#e6e8f0"; ctx.font = "bold 24px sans-serif"; ctx.textAlign = "center";
      ctx.fillText(`${ptsRef.current.a} · ${ptsRef.current.b}`, W / 2, 32);
      if (s.ganador && !jugRef.current) { ctx.fillStyle = "#fff"; ctx.font = "bold 22px sans-serif"; ctx.fillText(s.ganador === "a" ? "🏆 ¡Gana J1 (W/S)!" : "🏆 ¡Gana J2 (↑/↓)!", W / 2, H / 2 - 30); }
    }
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <GameShell titulo="Pong 2 Jugadores" emoji="🏓" descripcion="Local: J1 W/S · J2 ↑/↓ · primero a 5.">
      <div className="fila-botones" style={{ marginTop: 0 }}>
        <button className="btn-principal" onClick={empezar}>{jugando ? "Reiniciar" : "▶ Jugar"}</button>
        <span className="chip">J1 <b>{puntos.a}</b> — J2 <b>{puntos.b}</b></span>
      </div>
      <canvas ref={canvasRef} className="canvas-neon" width={W} height={H} style={{ marginTop: 14, width: "100%", maxWidth: W }} />
      {mensaje && <div className={`mensaje-final ${tipo}`}>{mensaje}</div>}
    </GameShell>
  );
}
