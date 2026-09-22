import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { sfx } from "../suite/sonido";
import { escribiendo } from "../suite/teclado";

const W = 520, H = 380;

function tuboDibujo(ctx, x, y, w, h, r) {
  if (h <= 0 || w <= 0) return;
  if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fill(); return; }
  ctx.fillRect(x, y, w, h);
}

export default function Flappy() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Vuelo Neón");
  const canvasRef = useRef(null);
  const [puntos, setPuntos] = useState(0);
  const [mejor, setMejor] = useState(() => Number(localStorage.getItem("arcade-flappy-mejor") || 0));
  const [jugando, setJugando] = useState(false);
  const st = useRef(null);
  const puntosRef = useRef(0);
  const jugandoRef = useRef(false);
  puntosRef.current = puntos;
  jugandoRef.current = jugando;

  function empezar() {
    st.current = {
      y: H / 2, vy: 0,
      tubos: [{ x: W + 40, hueco: 120 + Math.random() * 120, pasado: false }],
      particulas: [], frame: 0, muerto: false,
    };
    puntosRef.current = 0;
    setPuntos(0);
    jugandoRef.current = true;
    setJugando(true);
  }

  const saltarRef = useRef(null);
  function saltar() {
    if (!st.current || !jugandoRef.current || st.current.muerto) return;
    st.current.vy = -6.2;
    sfx.salto();
    for (let i = 0; i < 6; i++) {
      st.current.particulas.push({
        x: 120, y: st.current.y + 10, vx: (Math.random() - 0.8) * 3,
        vy: Math.random() * 3, vida: 25, color: "#22d3ee",
      });
    }
  }
  saltarRef.current = saltar;

  function morir() {
    const s = st.current;
    if (!s || s.muerto) return;
    s.muerto = true;
    sfx.mal();
    const p = puntosRef.current;
    const mejorGuardado = Number(localStorage.getItem("arcade-flappy-mejor") || 0);
    if (p > mejorGuardado) {
      setMejor(p);
      localStorage.setItem("arcade-flappy-mejor", String(p));
    }
    jugandoRef.current = false;
    setJugando(false);
    registrarPunt(p * 10, p >= 5 ? 1 : 0);
  }
  const morirRef = useRef(morir);
  morirRef.current = morir;

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    let raf;
    const tecla = e => {
      if (escribiendo()) return;
      if (e.code === "Space" || e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
        e.preventDefault();
        saltarRef.current();
      } else if (e.key === "Enter") {
        if (!jugandoRef.current) empezar();
      }
    };
    window.addEventListener("keydown", tecla);

    function frame() {
      raf = requestAnimationFrame(frame);
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, "#0a0628"); g.addColorStop(1, "#1b0f3a");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "rgba(255,255,255,.5)";
      for (let i = 0; i < 40; i++) {
        const sx = (i * 97) % W, sy = (i * 57) % H;
        ctx.globalAlpha = 0.2 + ((i + (st.current?.frame || 0) * 0.02) % 1) * 0.3;
        ctx.fillRect(sx, sy, 2, 2);
      }
      ctx.globalAlpha = 1;

      if (!st.current) {
        ctx.fillStyle = "#9aa1b8"; ctx.font = "16px sans-serif"; ctx.textAlign = "center";
        ctx.fillText("Pulsa Jugar y luego ESPACIO / W / ↑ / clic", W / 2, H / 2);
        return;
      }
      const s = st.current;
      s.frame++;

      if (jugandoRef.current && !s.muerto) {
        s.vy = Math.min(9, s.vy + 0.42);
        s.y += s.vy;
        if (s.frame % 95 === 0) {
          s.tubos.push({ x: W + 20, hueco: 90 + Math.random() * 170, pasado: false });
        }
        s.tubos.forEach(t => { t.x -= 2.6; });
        if (s.tubos[0] && s.tubos[0].x < -70) s.tubos.shift();
        s.tubos.forEach(t => {
          if (!t.pasado && t.x < 110) {
            t.pasado = true;
            const np = puntosRef.current + 1;
            puntosRef.current = np;
            setPuntos(np);
            sfx.moneda();
          }
        });
        const px = 120, pr = 12;
        if (s.y < 0 || s.y > H) morirRef.current();
        for (const t of s.tubos) {
          const ancho = 56, gap = 130;
          if (px + pr > t.x && px - pr < t.x + ancho) {
            if (s.y - pr < t.hueco - gap / 2 + 60 || s.y + pr > t.hueco + gap / 2 + 60) morirRef.current();
          }
        }
      }

      s.tubos.forEach(t => {
        const gap = 130, topH = t.hueco - gap / 2 + 60, botY = t.hueco + gap / 2 + 60;
        const grad = ctx.createLinearGradient(t.x, 0, t.x + 56, 0);
        grad.addColorStop(0, "#22c55e"); grad.addColorStop(1, "#16a34a");
        ctx.shadowBlur = 14; ctx.shadowColor = "#22c55e";
        ctx.fillStyle = grad;
        tuboDibujo(ctx, t.x, 0, 56, topH, 8);
        tuboDibujo(ctx, t.x, botY, 56, H - botY, 8);
        ctx.shadowBlur = 0;
        ctx.fillStyle = "rgba(255,255,255,.25)";
        ctx.fillRect(t.x + 6, 8, 8, Math.max(0, topH - 16));
        ctx.fillRect(t.x + 6, botY + 8, 8, Math.max(0, H - botY - 16));
      });

      s.particulas = s.particulas.filter(p => p.vida > 0);
      s.particulas.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.vida--;
        ctx.fillStyle = p.color; ctx.globalAlpha = Math.max(0, p.vida / 25);
        ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
      });

      const rot = Math.max(-0.4, Math.min(0.7, s.vy * 0.08));
      ctx.save();
      ctx.translate(120, s.y);
      ctx.rotate(rot);
      ctx.shadowBlur = 18; ctx.shadowColor = "#facc15";
      ctx.font = "30px serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("🐤", 0, 0);
      ctx.restore();

      ctx.fillStyle = "rgba(34,197,94,.35)";
      ctx.fillRect(0, H - 8, W, 8);

      ctx.fillStyle = "#fff"; ctx.font = "bold 30px sans-serif"; ctx.textAlign = "center";
      ctx.shadowBlur = 12; ctx.shadowColor = "#22d3ee";
      ctx.fillText(String(puntosRef.current), W / 2, 44);
      ctx.shadowBlur = 0;

      if (s.muerto) {
        ctx.fillStyle = "rgba(0,0,0,.55)"; ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = "#fff"; ctx.font = "bold 24px sans-serif";
        ctx.fillText("💥 ¡Chocaste!", W / 2, H / 2 - 10);
        ctx.font = "15px sans-serif"; ctx.fillStyle = "#9aa1b8";
        ctx.fillText("Pulsa Jugar o ENTER para reintentar", W / 2, H / 2 + 18);
      }
    }

    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("keydown", tecla); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <GameShell titulo="Vuelo Neón" emoji="🐤"
      descripcion="ESPACIO, W, ↑, clic o toque para volar. Esquiva los tubos."
      tira="linear-gradient(90deg,#22c55e,#facc15,#38bdf8)" iconoFondo="linear-gradient(135deg,#22c55e,#facc15)">
      <div className="fila-botones">
        <button className="btn-principal" onClick={empezar}>{puntos > 0 && !jugando ? "↻ Reintentar" : "▶ Jugar"}</button>
        <span className="chip">Puntos: <b>{puntos}</b></span>
        <span className="chip">🏆 Mejor: <b>{mejor}</b></span>
      </div>
      <canvas ref={canvasRef} className="canvas-neon" width={W} height={H}
        style={{ marginTop: 14, width: "100%", maxWidth: W }}
        onClick={saltar} onTouchStart={e => { e.preventDefault(); saltar(); }} />
      <Resultado mensaje={mensaje} tipo={tipo} />
      <p className="aviso-ia">💡 Teclado: <b>ESPACIO / W / ↑</b> · toques cortos mantienen el vuelo.</p>
    </GameShell>
  );
}
