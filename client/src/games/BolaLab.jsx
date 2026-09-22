import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro } from "../ui/GameShell";
import { escribiendo } from "../suite/teclado";
import { sfx } from "../suite/sonido";

const W = 420, H = 420;
const NIVEL = [
  "#####################",
  "#...................#",
  "#.#####.#####.#####.#",
  "#.#...#.#...#.#...#.#",
  "#.#.#.#.#.#.#.#.#.#.#",
  "#...#...#...#...#..G#",
  "#####.#####.#####.###",
  "#...................#",
  "#####################",
];
export default function BolaLab() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Bola Laberinto");
  const canvasRef = useRef(null);
  const [tiempo, setTiempo] = useState(0);
  const [jugando, setJugando] = useState(false);
  const [fin, setFin] = useState(false);
  const st = useRef({ x: 30, y: 30, vx: 0, vy: 0 });
  const keys = useRef({ u: false, d: false, l: false, r: false });
  const finRef = useRef(false);

  function empezar() {
    st.current = { x: 30, y: 30, vx: 0, vy: 0 };
    setTiempo(0); setFin(false); finRef.current = false; setJugando(true);
  }
  function esPared(x, y) {
    const c = Math.floor(x / 20), r = Math.floor(y / 20);
    if (r < 0 || c < 0 || r >= NIVEL.length || c >= NIVEL[0].length) return true;
    return NIVEL[r][c] === "#";
  }
  useEffect(() => {
    const dn = e => {
      if (escribiendo()) return;
      const k = e.key;
      if (["ArrowUp", "w", "W"].includes(k)) { keys.current.u = true; e.preventDefault(); }
      if (["ArrowDown", "s", "S"].includes(k)) { keys.current.d = true; e.preventDefault(); }
      if (["ArrowLeft", "a", "A"].includes(k)) { keys.current.l = true; e.preventDefault(); }
      if (["ArrowRight", "d", "D"].includes(k)) { keys.current.r = true; e.preventDefault(); }
      if ((k === "Enter" || k === " ") && !jugando) empezar();
    };
    const up = e => {
      const k = e.key;
      if (["ArrowUp", "w", "W"].includes(k)) keys.current.u = false;
      if (["ArrowDown", "s", "S"].includes(k)) keys.current.d = false;
      if (["ArrowLeft", "a", "A"].includes(k)) keys.current.l = false;
      if (["ArrowRight", "d", "D"].includes(k)) keys.current.r = false;
    };
    window.addEventListener("keydown", dn); window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", dn); window.removeEventListener("keyup", up); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jugando]);
  useEffect(() => {
    if (!jugando || fin) return;
    const id = setInterval(() => setTiempo(t => t + 1), 1000);
    return () => clearInterval(id);
  }, [jugando, fin]);
  useEffect(() => {
    const cv = canvasRef.current; if (!cv) return;
    const ctx = cv.getContext("2d");
    let raf;
    function frame() {
      raf = requestAnimationFrame(frame);
      ctx.fillStyle = "#0b0d14"; ctx.fillRect(0, 0, W, H);
      NIVEL.forEach((fila, r) => fila.split("").forEach((v, c) => {
        if (v === "#") { ctx.fillStyle = "#2d3348"; ctx.fillRect(c * 20, r * 20, 20, 20); }
        else if (v === "G") { ctx.fillStyle = "rgba(34,197,94,.4)"; ctx.fillRect(c * 20, r * 20, 20, 20); ctx.font = "14px serif"; ctx.fillText("🏁", c * 20 + 2, r * 20 + 15); }
      }));
      const s = st.current;
      if (jugando && !finRef.current) {
        const A = 0.5;
        if (keys.current.u) s.vy -= A;
        if (keys.current.d) s.vy += A;
        if (keys.current.l) s.vx -= A;
        if (keys.current.r) s.vx += A;
        s.vx *= 0.96; s.vy *= 0.96;
        const nx = s.x + s.vx, ny = s.y + s.vy;
        if (!esPared(nx + (s.vx > 0 ? 8 : -8), s.y + 0) && !esPared(nx + (s.vx > 0 ? 8 : -8), s.y + 0)) s.x = nx; else s.vx *= -0.4;
        if (!esPared(s.x, ny + (s.vy > 0 ? 8 : -8))) s.y = ny; else s.vy *= -0.4;
        const c = Math.floor(s.x / 20), r = Math.floor(s.y / 20);
        if (NIVEL[r]?.[c] === "G") {
          finRef.current = true; setFin(true); setJugando(false);
          const pts = Math.max(200 - tiempo * 2, 30);
          registrarPunt(pts, 1);
          sfx.record();
        }
      }
      ctx.fillStyle = "#22d3ee"; ctx.shadowBlur = 14; ctx.shadowColor = "#22d3ee";
      ctx.beginPath(); ctx.arc(s.x, s.y, 8, 0, 7); ctx.fill(); ctx.shadowBlur = 0;
      ctx.fillStyle = "#fff"; ctx.font = "bold 14px sans-serif"; ctx.textAlign = "left";
      ctx.fillText(`⏱️ ${tiempo}s`, 10, 18);
    }
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jugando, fin, tiempo]);

  return (
    <GameShell titulo="Bola Laberinto" emoji="🔮" descripcion="Flechas/WASD con física e inercia · llega a 🏁.">
      <div className="fila-botones">
        <button className="btn-principal" onClick={empezar}>{jugando ? "Reiniciar" : fin ? "↻ Otra vez" : "▶ Jugar"}</button>
        <span className="chip">⏱️ <b>{tiempo}s</b></span>
      </div>
      <canvas ref={canvasRef} className="canvas-neon" width={W} height={H} style={{ marginTop: 14, width: "100%", maxWidth: W }} />
      {fin && <div className={`mensaje-final ${tipo}`}>🏁 ¡Meta en {tiempo}s! {mensaje}</div>}
    </GameShell>
  );
}
