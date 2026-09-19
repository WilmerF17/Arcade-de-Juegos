import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro } from "../ui/GameShell";
import { escribiendo } from "../suite/teclado";

const W = 520, H = 340;

export default function Pong() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Pong neón");
  const canvasRef = useRef(null);
  const [puntos, setPuntos] = useState({ j: 0, ia: 0 });
  const [jugando, setJugando] = useState(false);
  const [vel, setVel] = useState(1);
  const estado = useRef(null);
  const puntosRef = useRef({ j: 0, ia: 0 });
  const jugandoRef = useRef(false);
  const velRef = useRef(1);
  const teclasRef = useRef({ arriba: false, abajo: false });
  const finRef = useRef(false);
  puntosRef.current = puntos;
  jugandoRef.current = jugando;
  velRef.current = vel;

  function empezar() {
    estado.current = {
      jY: H / 2 - 40, iaY: H / 2 - 40,
      x: W / 2, y: H / 2,
      vx: 4 * velRef.current * (Math.random() < 0.5 ? 1 : -1),
      vy: 2.5 * (Math.random() < 0.5 ? 1 : -1),
      estela: [],
    };
    puntosRef.current = { j: 0, ia: 0 };
    setPuntos({ j: 0, ia: 0 });
    finRef.current = false;
    setJugando(true);
  }

  function cerrar(p, gano) {
    if (finRef.current) return;
    finRef.current = true;
    setJugando(false);
    registrarPunt(gano ? 100 : p.j * 10, gano ? 1 : 0);
  }

  // Teclado: W/S y flechas Arriba/Abajo mueven la pala
  useEffect(() => {
    const abajo = e => {
      if (escribiendo()) return;
      if (["ArrowUp", "ArrowDown", "w", "W", "s", "S"].includes(e.key)) {
        e.preventDefault();
        if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") teclasRef.current.arriba = true;
        if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") teclasRef.current.abajo = true;
        if (!jugandoRef.current && !finRef.current && estado.current) setJugando(true);
      } else if (e.key === "Enter" || e.key === " ") {
        if (!jugandoRef.current) empezar();
      }
    };
    const arriba = e => {
      if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") teclasRef.current.arriba = false;
      if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") teclasRef.current.abajo = false;
    };
    window.addEventListener("keydown", abajo);
    window.addEventListener("keyup", arriba);
    return () => { window.removeEventListener("keydown", abajo); window.removeEventListener("keyup", arriba); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    let raf;
    const raton = e => {
      const r = cv.getBoundingClientRect();
      const my = (e.clientY - r.top) * (H / r.height);
      if (estado.current) estado.current.jY = Math.max(0, Math.min(H - 80, my - 40));
    };
    const tactil = e => {
      const r = cv.getBoundingClientRect();
      const t = e.touches[0];
      if (t && estado.current) estado.current.jY = Math.max(0, Math.min(H - 80, (t.clientY - r.top) * (H / r.height) - 40));
    };
    cv.addEventListener("mousemove", raton);
    cv.addEventListener("touchmove", tactil, { passive: true });

    function frame() {
      raf = requestAnimationFrame(frame);
      const g = ctx.createLinearGradient(0, 0, W, H);
      g.addColorStop(0, "#070a18"); g.addColorStop(1, "#0d1030");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "rgba(99,102,241,.4)";
      ctx.setLineDash([8, 8]);
      ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.stroke();
      ctx.setLineDash([]);

      if (!estado.current) {
        ctx.fillStyle = "#9aa1b8";
        ctx.font = "16px sans-serif"; ctx.textAlign = "center";
        ctx.fillText("Pulsa Jugar · ratón, dedo o W/S y ↑/↓", W / 2, H / 2);
        return;
      }
      const s = estado.current;
      if (jugandoRef.current) {
        // teclado continuo
        const VEL_PALA = 7;
        if (teclasRef.current.arriba) s.jY = Math.max(0, s.jY - VEL_PALA);
        if (teclasRef.current.abajo) s.jY = Math.min(H - 80, s.jY + VEL_PALA);

        s.x += s.vx; s.y += s.vy;
        s.estela.push({ x: s.x, y: s.y });
        if (s.estela.length > 14) s.estela.shift();
        if (s.y < 6 || s.y > H - 6) s.vy *= -1;
        // pala IA (izquierda) y jugador (derecha)
        if (s.x < 22 && s.y > s.iaY && s.y < s.iaY + 80) {
          s.vx = Math.min(11, Math.abs(s.vx) * 1.04);
          s.vy = Math.max(-8, Math.min(8, s.vy + (Math.random() - 0.5) * 1.5));
        }
        if (s.x > W - 22 && s.y > s.jY && s.y < s.jY + 80) {
          s.vx = -Math.min(11, Math.abs(s.vx) * 1.04);
          s.vy = Math.max(-8, Math.min(8, s.vy + (Math.random() - 0.5) * 1.5));
        }
        const v = velRef.current;
        const centro = s.iaY + 40;
        s.iaY += Math.max(-5 * v, Math.min(5 * v, (s.y - centro) * 0.12));
        s.iaY = Math.max(0, Math.min(H - 80, s.iaY));
        if (s.x < 0) {
          const n = { ...puntosRef.current, j: puntosRef.current.j + 1 };
          puntosRef.current = n;
          setPuntos(n);
          if (n.j >= 5) cerrar(n, true);
          s.x = W / 2; s.y = H / 2; s.vx = 4 * v; s.vy = 2.5;
        }
        if (s.x > W) {
          const n = { ...puntosRef.current, ia: puntosRef.current.ia + 1 };
          puntosRef.current = n;
          setPuntos(n);
          if (n.ia >= 5) cerrar(n, false);
          s.x = W / 2; s.y = H / 2; s.vx = -4 * v; s.vy = 2.5;
        }
      }
      s.estela.forEach((p, i) => {
        ctx.fillStyle = `rgba(34,211,238,${i / s.estela.length * 0.5})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, 3 + i / 3, 0, 7); ctx.fill();
      });
      ctx.shadowBlur = 18; ctx.shadowColor = "#22d3ee";
      ctx.fillStyle = "#22d3ee";
      ctx.fillRect(10, s.iaY, 10, 80);
      ctx.shadowColor = "#e879f9"; ctx.fillStyle = "#e879f9";
      ctx.fillRect(W - 20, s.jY, 10, 80);
      ctx.shadowBlur = 0;
      ctx.shadowBlur = 20; ctx.shadowColor = "#fff";
      ctx.fillStyle = "#fff";
      ctx.beginPath(); ctx.arc(s.x, s.y, 7, 0, 7); ctx.fill();
      ctx.shadowBlur = 0;
      const p = puntosRef.current;
      ctx.fillStyle = "#e6e8f0"; ctx.font = "bold 26px sans-serif"; ctx.textAlign = "center";
      ctx.fillText(`${p.ia}  ·  ${p.j}`, W / 2, 34);
    }
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); cv.removeEventListener("mousemove", raton); cv.removeEventListener("touchmove", tactil); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <GameShell titulo="Pong neón" emoji="🏓"
      descripción="Ratón, dedo o teclado (W/S y ↑/↓). Gana quien llegue a 5."
      tira="linear-gradient(90deg,#22d3ee,#e879f9,#6366f1)" iconoFondo="linear-gradient(135deg,#22d3ee,#e879f9)">
      <div className="fila-botones" style={{ marginTop: 0 }}>
        <button className="btn-principal" onClick={empezar}>{jugando ? "Reiniciar" : "▶ Jugar"}</button>
        <select value={vel} onChange={e => setVel(Number(e.target.value))}>
          <option value={0.7}>🐢 Lento</option>
          <option value={1}>⚡ Normal</option>
          <option value={1.5}>🔥 Turbo</option>
        </select>
        <span className="chip">Tú <b>{puntos.j}</b> — IA <b>{puntos.ia}</b></span>
      </div>
      <canvas ref={canvasRef} className="canvas-neon" width={W} height={H} style={{ marginTop: 14, width: "100%", maxWidth: W }} />
      {mensaje && <div className={`mensaje-final ${tipo}`}>{mensaje}</div>}
      <p className="aviso-ia">💡 Teclado: <b>W/S</b> o <b>↑/↓</b> · la bola acelera con cada rebote.</p>
    </GameShell>
  );
}
