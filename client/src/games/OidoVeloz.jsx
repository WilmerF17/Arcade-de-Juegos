import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro } from "../ui/GameShell";
import { sfx } from "../suite/sonido";

/* Oído Veloz: pantalla neutra, toca al oír el pitido. 5 rondas, vale la media. */
export default function OidoVeloz() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Oído Veloz");
  const [fase, setFase] = useState("espera");
  const [tiempos, setTiempos] = useState([]);
  const [rondas] = useState(5);
  const t0 = useRef(0);
  const timer = useRef(null);
  const faseRef = useRef("espera");
  const tiemposRef = useRef([]);
  faseRef.current = fase;
  tiemposRef.current = tiempos;

  function pitido() {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      const ctx = new AC();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine"; o.frequency.value = 880;
      o.connect(g); g.connect(ctx.destination);
      o.start();
      g.gain.setValueAtTime(0.15, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
      o.stop(ctx.currentTime + 0.45);
    } catch { /* sin audio */ }
  }

  function empezar() {
    clearTimeout(timer.current);
    setTiempos([]);
    tiemposRef.current = [];
    siguiente();
    sfx.clic();
  }

  function siguiente() {
    setFase("listo");
    faseRef.current = "listo";
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      t0.current = performance.now();
      setFase("ya");
      faseRef.current = "ya";
      pitido();
    }, 1500 + Math.random() * 3000);
  }

  function tocar() {
    const f = faseRef.current;
    if (f === "listo") {
      clearTimeout(timer.current);
      setFase("trampa");
      faseRef.current = "trampa";
      sfx.mal();
      return;
    }
    if (f === "trampa" || f === "espera" || f === "fin") {
      if (f !== "espera" || true) empezar();
      return;
    }
    if (f === "ya") {
      const ms = Math.round(performance.now() - t0.current);
      const nt = [...tiemposRef.current, ms];
      tiemposRef.current = nt;
      setTiempos(nt);
      if (ms < 300) sfx.bien(); else sfx.clic();
      if (nt.length >= rondas) {
        setFase("fin");
        faseRef.current = "fin";
        const media = Math.round(nt.reduce((a, b) => a + b, 0) / nt.length);
        registrarPunt(Math.max(10, 350 - Math.round(media / 2)), media < 400 ? 1 : 0);
      } else {
        setFase("entre");
        faseRef.current = "entre";
        setTimeout(() => { if (faseRef.current === "entre") siguiente(); }, 900);
      }
    } else if (f === "entre") {
      empezar();
    }
  }

  useEffect(() => () => clearTimeout(timer.current), []);

  const media = tiempos.length ? Math.round(tiempos.reduce((a, b) => a + b, 0) / tiempos.length) : 0;

  return (
    <GameShell titulo="Oído Veloz" emoji="👂"
      descripcion="Sube el volumen · toca al oír el pitido, no antes · media de 5."
      tira="linear-gradient(90deg,#38bdf8,#a855f7)" iconoFondo="linear-gradient(135deg,#38bdf8,#a855f7)">
      <div className="fila-botones" style={{ marginTop: 0 }}>
        <span className="chip">Intentos: <b>{tiempos.length}/{rondas}</b></span>
        {media > 0 && <span className="chip">📊 Media: <b>{media} ms</b></span>}
      </div>
      <div onClick={tocar} style={{ background: "var(--bg-soft)", border: "1px solid var(--border)", borderRadius: 12, padding: 30, cursor: "pointer", textAlign: "center", userSelect: "none" }}>
        <div style={{ fontSize: "3rem" }}>🔇</div>
        <b>{fase === "espera" ? "Pulsa Empezar con sonido 🔊" : fase === "listo" ? "Espera el pitido…" : fase === "ya" ? "¡PITIDO! ¡TOCA!" : fase === "trampa" ? "⛔ ¡Antes de tiempo! Pulsa para seguir" : fase === "fin" ? `Media: ${media} ms` : `${tiempos[tiempos.length - 1]} ms · sigue…`}</b>
      </div>
      <div className="fila-botones">
        <button className="btn-principal" onClick={empezar}>▶ Empezar</button>
      </div>
      {tiempos.length > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
          {tiempos.map((t, i) => (
            <span key={i} className="chip">#{i + 1} {t}ms</span>
          ))}
        </div>
      )}
      {mensaje && <div className={`mensaje-final ${tipo}`}>{mensaje}</div>}
    </GameShell>
  );
}
