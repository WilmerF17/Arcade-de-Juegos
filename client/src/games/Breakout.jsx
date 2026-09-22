import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { escribiendo } from "../suite/teclado";

const W = 520, H = 360;

function dibujarRedondeado(ctx, x, y, w, h, r) {
  if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fill(); return; }
  ctx.fillRect(x, y, w, h);
}

export default function Breakout() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Rompebloques");
  const canvasRef = useRef(null);
  const [puntos, setPuntos] = useState(0);
  const [vidas, setVidas] = useState(3);
  const [jugando, setJugando] = useState(false);
  const [nivel, setNivel] = useState(1);
  const st = useRef(null);
  const puntosRef = useRef(0);
  const vidasRef = useRef(3);
  const nivelRef = useRef(1);
  const jugandoRef = useRef(false);
  const teclasRef = useRef({ izq: false, der: false });
  const finRef = useRef(false);
  puntosRef.current = puntos;
  vidasRef.current = vidas;
  nivelRef.current = nivel;
  jugandoRef.current = jugando;

  function empezar(nv = 1) {
    const bloques = [];
    const filas = 3 + nv, cols = 8;
    const colores = ["#f43f5e", "#fb923c", "#facc15", "#22c55e", "#38bdf8", "#a855f7"];
    for (let r = 0; r < filas; r++)
      for (let c = 0; c < cols; c++)
        bloques.push({ x: 12 + c * 62, y: 44 + r * 26, w: 56, h: 20, vivo: true, color: colores[r % colores.length], hp: r === 0 ? 2 : 1 });
    st.current = { px: W / 2 - 45, x: W / 2, y: H - 60, vx: 3 + nv * 0.5, vy: -3 - nv * 0.5, bloques, particulas: [] };
    puntosRef.current = 0; vidasRef.current = 3; nivelRef.current = nv;
    setPuntos(0); setVidas(3); setNivel(nv);
    finRef.current = false;
    setJugando(true);
  }

  function terminar(victoria) {
    if (finRef.current) return;
    finRef.current = true;
    setJugando(false);
    if (victoria) registrarPunt(200 + vidasRef.current * 50 + nivelRef.current * 50, 1);
    else registrarPunt(puntosRef.current, 0);
  }

  // Teclado: ←/→ y A/D mueven la pala, ENTER empieza
  useEffect(() => {
    const dn = e => {
      if (escribiendo()) return;
      if (["ArrowLeft", "ArrowRight", "a", "A", "d", "D"].includes(e.key)) {
        e.preventDefault();
        if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") teclasRef.current.izq = true;
        if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") teclasRef.current.der = true;
      } else if (e.key === "Enter" || e.key === " ") {
        if (!jugandoRef.current) empezar(nivelRef.current);
      }
    };
    const up = e => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") teclasRef.current.izq = false;
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") teclasRef.current.der = false;
    };
    window.addEventListener("keydown", dn);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", dn); window.removeEventListener("keyup", up); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    let raf;
    const mover = e => {
      const cx = e.clientX ?? e.touches?.[0]?.clientX;
      if (cx == null) return;
      const r = cv.getBoundingClientRect();
      const mx = (cx - r.left) * (W / r.width);
      if (st.current) st.current.px = Math.max(0, Math.min(W - 90, mx - 45));
    };
    cv.addEventListener("mousemove", mover);
    cv.addEventListener("touchmove", mover, { passive: true });

    function frame() {
      raf = requestAnimationFrame(frame);
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, "#0b0620"); g.addColorStop(1, "#141033");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      if (!st.current) {
        ctx.fillStyle = "#9aa1b8"; ctx.font = "16px sans-serif"; ctx.textAlign = "center";
        ctx.fillText("Pulsa Jugar · ratón o ←/→ y A/D", W / 2, H / 2);
        return;
      }
      const s = st.current;
      s.bloques.forEach(b => {
        if (!b.vivo) return;
        ctx.shadowBlur = 12; ctx.shadowColor = b.color;
        ctx.fillStyle = b.color;
        ctx.globalAlpha = b.hp === 2 ? 1 : 0.85;
        dibujarRedondeado(ctx, b.x, b.y, b.w, b.h, 6);
        ctx.globalAlpha = 1; ctx.shadowBlur = 0;
        if (b.hp === 2) { ctx.fillStyle = "rgba(255,255,255,.7)"; ctx.fillRect(b.x + 6, b.y + 8, b.w - 12, 3); }
      });
      s.particulas = s.particulas.filter(p => p.vida > 0);
      s.particulas.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.vida--;
        ctx.fillStyle = p.color; ctx.globalAlpha = Math.max(0, p.vida / 30);
        ctx.fillRect(p.x, p.y, 3, 3); ctx.globalAlpha = 1;
      });
      if (jugandoRef.current) {
        const V = 8;
        if (teclasRef.current.izq) s.px = Math.max(0, s.px - V);
        if (teclasRef.current.der) s.px = Math.min(W - 90, s.px + V);
        s.x += s.vx; s.y += s.vy;
        if (s.x < 8 || s.x > W - 8) s.vx *= -1;
        if (s.y < 8) s.vy *= -1;
        if (s.y > H - 40 && s.y < H - 20 && s.x > s.px - 6 && s.x < s.px + 96) {
          const rel = (s.x - (s.px + 45)) / 45;
          s.vx = Math.max(-6, Math.min(6, rel * 5));
          s.vy = -Math.abs(s.vy);
        }
        s.bloques.forEach(b => {
          if (!b.vivo) return;
          if (s.x > b.x - 6 && s.x < b.x + b.w + 6 && s.y > b.y - 6 && s.y < b.y + b.h + 6) {
            b.hp--;
            if (b.hp <= 0) {
              b.vivo = false;
              for (let i = 0; i < 10; i++) s.particulas.push({ x: s.x, y: s.y, vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 0.5) * 4, vida: 30, color: b.color });
              puntosRef.current += 10;
              setPuntos(puntosRef.current);
            }
            s.vy *= -1;
          }
        });
        if (s.y > H) {
          const n = vidasRef.current - 1;
          vidasRef.current = Math.max(0, n);
          setVidas(vidasRef.current);
          if (n <= 0) terminar(false);
          s.x = W / 2; s.y = H - 60; s.vx = 3 + nivelRef.current * 0.5; s.vy = -3 - nivelRef.current * 0.5;
        }
        if (s.bloques.every(b => !b.vivo)) terminar(true);
      }
      const pg = ctx.createLinearGradient(s.px, 0, s.px + 90, 0);
      pg.addColorStop(0, "#fb7185"); pg.addColorStop(1, "#a855f7");
      ctx.shadowBlur = 16; ctx.shadowColor = "#fb7185";
      ctx.fillStyle = pg;
      dibujarRedondeado(ctx, s.px, H - 30, 90, 12, 6);
      ctx.shadowBlur = 0;
      ctx.shadowBlur = 16; ctx.shadowColor = "#facc15";
      ctx.fillStyle = "#fff";
      ctx.beginPath(); ctx.arc(s.x, s.y, 7, 0, 7); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#e6e8f0"; ctx.font = "bold 14px sans-serif"; ctx.textAlign = "left";
      ctx.fillText(`Puntos ${puntosRef.current}   ❤️ ${vidasRef.current}   Nivel ${nivelRef.current}`, 12, 22);
    }
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); cv.removeEventListener("mousemove", mover); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <GameShell titulo="Rompebloques" emoji="🧱"
      descripcion="Ratón o teclado (←/→, A/D). Los rojos aguantan 2 golpes."
      tira="linear-gradient(90deg,#fb7185,#a855f7,#facc15)" iconoFondo="linear-gradient(135deg,#fb7185,#a855f7)">
      <div className="fila-botones">
        <button className="btn-principal" onClick={() => empezar(1)}>{jugando ? "Reiniciar" : "▶ Jugar"}</button>
        {[1, 2, 3].map(n => (
          <button key={n} className={nivel === n && !jugando ? "btn-principal" : ""} onClick={() => empezar(n)}>Nivel {n}</button>
        ))}
        <span className="chip">Puntos <b>{puntos}</b></span>
        <span className="chip">❤️ <b>{vidas}</b></span>
      </div>
      <canvas ref={canvasRef} className="canvas-neon" width={W} height={H} style={{ marginTop: 14, width: "100%", maxWidth: W }} />
      <Resultado mensaje={mensaje} tipo={tipo} />
      <p className="aviso-ia">💡 Teclado: <b>←/→</b> o <b>A/D</b> · el ángulo depende de dónde golpee la bola.</p>
    </GameShell>
  );
}
