import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { escribiendo } from "../suite/teclado";
import { sfx } from "../suite/sonido";

const W = 520, H = 380;
const FRUTAS = ["🍎", "🍌", "🍇", "🍊", "🍓", "💣"];
export default function Atrapar() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Atrapa la Fruta");
  const canvasRef = useRef(null);
  const [puntos, setPuntos] = useState(0);
  const [vidas, setVidas] = useState(3);
  const [jugando, setJugando] = useState(false);
  const st = useRef(null);
  const puntosRef = useRef(0); const vidasRef = useRef(3);
  const jugRef = useRef(false); const teclas = useRef({ l: false, r: false });
  puntosRef.current = puntos; vidasRef.current = vidas; jugRef.current = jugando;

  function empezar() {
    st.current = { x: W / 2, items: [], frame: 0 };
    puntosRef.current = 0; vidasRef.current = 3;
    setPuntos(0); setVidas(3); setJugando(true);
  }
  function terminar() {
    setJugando(false);
    registrarPunt(puntosRef.current, puntosRef.current >= 150 ? 1 : 0);
    sfx.record();
  }

  useEffect(() => {
    const dn = e => {
      if (escribiendo()) return;
      if (["ArrowLeft", "a", "A"].includes(e.key)) { teclas.current.l = true; e.preventDefault(); }
      if (["ArrowRight", "d", "D"].includes(e.key)) { teclas.current.r = true; e.preventDefault(); }
      if ((e.key === "Enter" || e.key === " ") && !jugRef.current) empezar();
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
    const mv = e => {
      const r = cv.getBoundingClientRect();
      const cx = (e.clientX ?? e.touches?.[0]?.clientX);
      if (cx == null || !st.current) return;
      st.current.x = Math.max(30, Math.min(W - 30, (cx - r.left) * (W / r.width)));
    };
    cv.addEventListener("mousemove", mv); cv.addEventListener("touchmove", mv, { passive: true });
    function frame() {
      raf = requestAnimationFrame(frame);
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, "#0a1a2e"); g.addColorStop(1, "#0d2b1a");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      if (!st.current) {
        ctx.fillStyle = "#9aa1b8"; ctx.font = "16px sans-serif"; ctx.textAlign = "center";
        ctx.fillText("Pulsa Jugar · ←/→ o A/D o ratón", W / 2, H / 2);
        return;
      }
      const s = st.current;
      if (jugRef.current) {
        if (teclas.current.l) s.x = Math.max(30, s.x - 7);
        if (teclas.current.r) s.x = Math.min(W - 30, s.x + 7);
        s.frame++;
        if (s.frame % 28 === 0) s.items.push({ x: 20 + Math.random() * (W - 40), y: -20, f: FRUTAS[Math.random() < 0.12 ? 5 : Math.floor(Math.random() * 5)], v: 2.4 + Math.random() * 2 });
        s.items.forEach(it => { it.y += it.v; });
        s.items = s.items.filter(it => {
          if (it.y > H - 40 && it.y < H - 10 && Math.abs(it.x - s.x) < 42) {
            if (it.f === "💣") { vidasRef.current -= 1; setVidas(vidasRef.current); sfx.mal(); if (vidasRef.current <= 0) terminar(); }
            else { puntosRef.current += 10; setPuntos(puntosRef.current); sfx.bien(); }
            return false;
          }
          if (it.y > H) { if (it.f !== "💣") { vidasRef.current -= 1; setVidas(vidasRef.current); if (vidasRef.current <= 0) terminar(); } return false; }
          return true;
        });
      }
      s.items.forEach(it => { ctx.font = "26px serif"; ctx.textAlign = "center"; ctx.fillText(it.f, it.x, it.y); });
      ctx.font = "44px serif"; ctx.textAlign = "center"; ctx.fillText("🧺", s.x, H - 12);
      ctx.fillStyle = "#fff"; ctx.font = "bold 15px sans-serif"; ctx.textAlign = "left";
      ctx.fillText(`Puntos ${puntosRef.current}  ❤️ ${vidasRef.current}`, 12, 24);
    }
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); cv.removeEventListener("mousemove", mv); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <GameShell titulo="Atrapa la Fruta" emoji="🧺" descripcion="←/→ o A/D o ratón · evita 💣 · 3 vidas.">
      <div className="fila-botones">
        <button className="btn-principal" onClick={empezar}>{jugando ? "Reiniciar" : "▶ Jugar"}</button>
        <span className="chip">Puntos <b>{puntos}</b></span>
        <span className="chip">❤️ <b>{vidas}</b></span>
      </div>
      <canvas ref={canvasRef} className="canvas-neon" width={W} height={H} style={{ marginTop: 14, width: "100%", maxWidth: W }} />
      <Resultado mensaje={mensaje} tipo={tipo} />
    </GameShell>
  );
}
