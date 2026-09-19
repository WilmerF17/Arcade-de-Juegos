import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro } from "../ui/GameShell";
import { sfx } from "../suite/sonido";
import { escribiendo } from "../suite/teclado";

export default function Reflejos() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Reflejos");
  const [fase, setFase] = useState("espera");
  const [tiempos, setTiempos] = useState([]);
  const [mejor, setMejor] = useState(() => Number(localStorage.getItem("arcade-reflejos-mejor") || 0));
  const [rondas, setRondas] = useState(5);
  const t0 = useRef(0);
  const timer = useRef(null);
  const faseRef = useRef("espera");
  const tiemposRef = useRef([]);
  faseRef.current = fase;
  tiemposRef.current = tiempos;

  function empezar() {
    clearTimeout(timer.current);
    setTiempos([]);
    tiemposRef.current = [];
    siguiente();
  }

  function siguiente() {
    setFase("listo");
    faseRef.current = "listo";
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      t0.current = performance.now();
      setFase("ya");
      faseRef.current = "ya";
      sfx.salto();
    }, 1200 + Math.random() * 2800);
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
    if (f === "trampa") {
      siguiente();
      return;
    }
    if (f === "ya") {
      const ms = Math.round(performance.now() - t0.current);
      const nt = [...tiemposRef.current, ms];
      tiemposRef.current = nt;
      setTiempos(nt);
      setMejor(m => {
        const nm = (!m || ms < m) ? ms : m;
        localStorage.setItem("arcade-reflejos-mejor", String(nm));
        return nm;
      });
      if (ms < 250) sfx.bien(); else sfx.clic();
      if (nt.length >= rondas) {
        setFase("fin");
        faseRef.current = "fin";
        const media = Math.round(nt.reduce((a, b) => a + b, 0) / nt.length);
        const puntos = Math.max(10, 300 - Math.round(media / 2));
        registrarPunt(puntos, media < 350 ? 1 : 0);
      } else {
        setFase("entre");
        faseRef.current = "entre";
        setTimeout(() => { if (faseRef.current === "entre") siguiente(); }, 900);
      }
    } else if (f === "espera" || f === "fin" || f === "entre") {
      if (f !== "entre") empezar();
    }
  }

  const tocarRef = useRef(tocar);
  tocarRef.current = tocar;
  const empezarRef = useRef(empezar);
  empezarRef.current = empezar;

  useEffect(() => {
    const fn = e => {
      if (escribiendo()) return;
      if (e.key === " " || e.key === "Enter") { e.preventDefault(); tocarRef.current(); }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [rondas]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const media = tiempos.length ? Math.round(tiempos.reduce((a, b) => a + b, 0) / tiempos.length) : 0;

  return (
    <GameShell titulo="Reflejos" emoji="⚡"
      descripcion="Clic o ESPACIO/ENTER · toca solo en verde. Media de rondas."
      tira="linear-gradient(90deg,#facc15,#22c55e,#38bdf8)" iconoFondo="linear-gradient(135deg,#facc15,#22c55e)">
      <div className="fila-botones" style={{ marginTop: 0 }}>
        <select value={rondas} onChange={e => setRondas(Number(e.target.value))}>
          <option value={3}>3 rondas</option>
          <option value={5}>5 rondas</option>
          <option value={10}>10 rondas</option>
        </select>
        <span className="chip">Intentos: <b>{tiempos.length}/{rondas}</b></span>
        {mejor > 0 && <span className="chip">🏆 Mejor: <b>{mejor} ms</b></span>}
        {media > 0 && <span className="chip">📊 Media: <b>{media} ms</b></span>}
      </div>
      <div className={`zona-reflejos f-${fase}`} onClick={tocar}>
        {fase === "espera" && <><div className="rf-emoji">⚡</div><b>Pulsa Empezar y espera al verde</b><small>No toques en rojo · vale clic o ESPACIO</small></>}
        {fase === "listo" && <><div className="rf-emoji">🔴</div><b>Espera...</b><small>¡No toques todavía!</small></>}
        {fase === "ya" && <><div className="rf-emoji">🟢</div><b>¡YA! ¡TOCA!</b><small>Lo más rápido posible</small></>}
        {fase === "entre" && <><div className="rf-emoji">✅</div><b>{tiempos[tiempos.length - 1]} ms</b><small>Preparando siguiente...</small></>}
        {fase === "trampa" && <><div className="rf-emoji">⛔</div><b>¡Trampa! Tocaste antes</b><small>Pulsa para reintentar la ronda</small></>}
        {fase === "fin" && <><div className="rf-emoji">🏁</div><b>Media: {media} ms</b><small>Pulsa Empezar o ESPACIO para otra serie</small></>}
      </div>
      <div className="fila-botones">
        <button className="btn-principal" onClick={empezar}>▶ Empezar</button>
        {fase === "trampa" && <button className="btn-suave" onClick={siguiente}>Reintentar ronda</button>}
      </div>
      {tiempos.length > 0 && (
        <div className="tiempos">
          {tiempos.map((t, i) => (
            <span key={i} className={`tiempo ${t < 250 ? "top" : t < 400 ? "ok" : "lento"}`}>#{i + 1} {t}ms</span>
          ))}
        </div>
      )}
      {mensaje && <div className={`mensaje-final ${tipo}`}>{mensaje}</div>}
    </GameShell>
  );
}
