import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { escribiendo } from "../suite/teclado";
import { sfx } from "../suite/sonido";

const ABC = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ";
const DIFS = {
  "Fácil": { spawn: 1200, vel: 0.55, t: 60 },
  "Normal": { spawn: 900, vel: 0.8, t: 60 },
  "Difícil": { spawn: 620, vel: 1.1, t: 45 },
};
export default function Cascada() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Cascada de Letras");
  const [dif, setDif] = useState("Normal");
  const totalT = DIFS[dif].t;
  const [letras, setLetras] = useState([]);
  const [puntos, setPuntos] = useState(0);
  const [vidas, setVidas] = useState(3);
  const [tiempo, setTiempo] = useState(totalT);
  const [jugando, setJugando] = useState(false);
  const idRef = useRef(0);
  const st = useRef({ puntos: 0, vidas: 3 });
  st.current = { puntos, vidas };

  function empezar() {
    setLetras([]); setPuntos(0); st.current.puntos = 0;
    setVidas(3); st.current.vidas = 3;
    setTiempo(DIFS[dif].t); setJugando(true);
    sfx.clic();
  }
  function cambiarDif(d) {
    setDif(d);
    if (!jugando) setTiempo(DIFS[d].t);
    sfx.clic();
  }
  useEffect(() => {
    if (!jugando) return;
    if (tiempo <= 0 || st.current.vidas <= 0) {
      setJugando(false); setLetras([]);
      registrarPunt(st.current.puntos, st.current.puntos >= 200 ? 1 : 0);
      sfx.record();
      return;
    }
    const id = setTimeout(() => setTiempo(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [jugando, tiempo, registrarPunt]);
  useEffect(() => {
    if (!jugando) return;
    const id = setInterval(() => {
      setLetras(ls => [...ls.slice(-12), { id: idRef.current++, ch: ABC[Math.floor(Math.random() * ABC.length)], x: 4 + Math.random() * 88, y: 0, v: DIFS[dif].vel + Math.random() * (0.5 + (totalT - tiempo) / totalT) }]);
    }, DIFS[dif].spawn);
    return () => clearInterval(id);
  }, [jugando, tiempo, dif, totalT]);
  useEffect(() => {
    if (!jugando) return;
    const id = setInterval(() => {
      setLetras(ls => ls.map(l => ({ ...l, y: l.y + l.v })).filter(l => {
        if (l.y > 100) {
          st.current.vidas -= 1; setVidas(st.current.vidas);
          sfx.mal();
          return false;
        }
        return true;
      }));
    }, 50);
    return () => clearInterval(id);
  }, [jugando]);
  function teclear(ch) {
    if (!jugando) return;
    const up = ch.toUpperCase();
    let hit = false;
    setLetras(ls => {
      const idx = ls.findIndex(l => l.ch === up);
      if (idx >= 0) { hit = true; const c = [...ls]; c.splice(idx, 1); return c; }
      return ls;
    });
    setTimeout(() => {
      if (hit) { st.current.puntos += 10; setPuntos(st.current.puntos); sfx.bien(); }
    }, 0);
  }
  const teclearRef = useRef(teclear); teclearRef.current = teclear;
  useEffect(() => {
    const fn = (e) => {
      if (e.key === "Enter" || e.key === " ") {
        if (!jugando && !escribiendo()) {
          e.preventDefault();
          empezar();
          return;
        }
      }
      if (escribiendo() || !jugando) return;
      if (/^[a-zA-ZñÑ]$/.test(e.key)) teclearRef.current(e.key);
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [jugando]); // eslint-disable-line react-hooks/exhaustive-deps

  const pct = Math.max(0, Math.round((tiempo / totalT) * 100));
  return (
    <GameShell titulo="Cascada de Letras" emoji="🔤" descripcion={`Teclea la letra antes de que caiga · 3 vidas · ${totalT}s (${dif}).`}
      stats={[
        { icono: "⭐", etiqueta: "Puntos", valor: puntos },
        { icono: "❤️", etiqueta: "Vidas", valor: vidas },
        { icono: "⏱️", etiqueta: "Tiempo", valor: `${tiempo}s` },
        { icono: "🎚️", etiqueta: "Dificultad", valor: dif },
      ]}
      resultado={{ mensaje, tipo }}
      ayuda={(
        <div>
          <p><b>Reglas:</b> las letras caen del cielo: teclea cada letra antes de que toque el suelo. Tienes 3 vidas y {totalT} segundos.</p>
          <p><b>Controles:</b> teclado físico <kbd>A</kbd>–<kbd>Z</kbd> para cazar letras · <kbd>Enter</kbd>/<kbd>Espacio</kbd> para empezar. En móvil usa un teclado externo si puedes.</p>
          <p><b>Puntuación:</b> +10 por letra cazada. Victoria con 200+ puntos.</p>
          <p><b>Consejo:</b> caza primero las más bajas: son las que están a punto de costarte una vida.</p>
        </div>
      )}
      acciones={(
        <>
          {["Fácil", "Normal", "Difícil"].map(d => (
            <button key={d} className={dif === d ? "btn-principal" : "btn-suave"} disabled={jugando} onClick={() => cambiarDif(d)}>{d}</button>
          ))}
          <button className="btn-principal" onClick={() => { sfx.clic(); empezar(); }}>{jugando ? "Reiniciar" : "▶ Jugar"}</button>
        </>
      )}>
      <div className="xp-bar fina" aria-hidden><div style={{ width: `${pct}%` }} /></div>
      <div style={{ position: "relative", height: 340, marginTop: 14, background: "linear-gradient(180deg,#0a0628,#0d2b3a)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
        {!jugando && letras.length === 0 && <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "var(--texto-suave)" }}>Pulsa Jugar y teclea las letras ⌨️</div>}
        {letras.map(l => (
          <div key={l.id} style={{ position: "absolute", left: `${l.x}%`, top: `${l.y}%`, fontSize: "1.8rem", fontWeight: 900, color: "var(--info)", textShadow: "0 0 12px var(--info)" }}>{l.ch}</div>
        ))}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 4, background: "var(--peligro)" }} />
      </div>
      <Resultado mensaje="" tipo="" />
    </GameShell>
  );
}
