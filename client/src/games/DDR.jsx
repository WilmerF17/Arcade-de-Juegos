import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro } from "../ui/GameShell";
import { escribiendo } from "../suite/teclado";
import { sfx } from "../suite/sonido";

const FLECHAS = ["←", "↓", "↑", "→"];
const KEYS = { ArrowLeft: 0, ArrowDown: 1, ArrowUp: 2, ArrowRight: 3, a: 0, s: 1, w: 2, d: 3, A: 0, S: 1, W: 2, D: 3 };
export default function DDR() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Dance Flechas");
  const [notas, setNotas] = useState([]);
  const [puntos, setPuntos] = useState(0);
  const [combo, setCombo] = useState(0);
  const [tiempo, setTiempo] = useState(45);
  const [jugando, setJugando] = useState(false);
  const idRef = useRef(0);
  const st = useRef({ puntos: 0, combo: 0 });
  st.current = { puntos, combo };

  function empezar() {
    setNotas([]); setPuntos(0); st.current.puntos = 0;
    setCombo(0); st.current.combo = 0;
    setTiempo(45); setJugando(true);
  }
  useEffect(() => {
    if (!jugando) return;
    if (tiempo <= 0) {
      setJugando(false); setNotas([]);
      registrarPunt(st.current.puntos, st.current.puntos >= 400 ? 1 : 0);
      sfx.record();
      return;
    }
    const id = setTimeout(() => setTiempo(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [jugando, tiempo, registrarPunt]);
  useEffect(() => {
    if (!jugando) return;
    const id = setInterval(() => {
      setNotas(ns => [...ns.slice(-18), { id: idRef.current++, dir: Math.floor(Math.random() * 4), y: 0 }]);
    }, 480);
    return () => clearInterval(id);
  }, [jugando]);
  useEffect(() => {
    if (!jugando) return;
    const id = setInterval(() => {
      setNotas(ns => ns.map(n => ({ ...n, y: n.y + 1 })).filter(n => {
        if (n.y > 9) { st.current.combo = 0; setCombo(0); return false; }
        return true;
      }));
    }, 200);
    return () => clearInterval(id);
  }, [jugando]);
  function golpear(dir) {
    if (!jugando) return;
    let hit = false;
    setNotas(ns => {
      const idx = ns.findIndex(n => n.dir === dir && n.y >= 6 && n.y <= 8);
      if (idx >= 0) { hit = true; const c = [...ns]; c.splice(idx, 1); return c; }
      return ns;
    });
    setTimeout(() => {
      if (hit) {
        const c = st.current.combo + 1;
        st.current.combo = c; setCombo(c);
        st.current.puntos += 10 + Math.min(20, c * 2); setPuntos(st.current.puntos);
        sfx.bien();
      } else {
        st.current.combo = 0; setCombo(0);
        st.current.puntos = Math.max(0, st.current.puntos - 3); setPuntos(st.current.puntos);
      }
    }, 0);
  }
  const golpearRef = useRef(golpear); golpearRef.current = golpear;
  useEffect(() => {
    const fn = e => {
      if (escribiendo()) return;
      const d = KEYS[e.key] ?? KEYS[e.key.toLowerCase?.()];
      if (d != null) { e.preventDefault(); golpearRef.current(d); }
      else if (e.key === "Enter" && !jugando) empezar();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jugando]);
  return (
    <GameShell titulo="Dance Flechas" emoji="💃" descripcion="Flechas o WASD cuando lleguen a la zona · 45s.">
      <div className="fila-botones" style={{ marginTop: 0 }}>
        <button className="btn-principal" onClick={empezar}>{jugando ? "Reiniciar" : "▶ Jugar"}</button>
        <span className="chip">Puntos <b>{puntos}</b></span>
        <span className="chip">🔥 <b>×{combo}</b></span>
        <span className="chip">⏱️ <b>{tiempo}s</b></span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,90px)", gap: 6, marginTop: 14, width: "max-content" }}>
        {[0, 1, 2, 3].map(d => (
          <div key={d} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ height: 40, borderRadius: 8, background: "rgba(34,197,94,.25)", border: "2px solid var(--exito)", display: "grid", placeItems: "center", fontSize: "1.4rem" }}>{FLECHAS[d]}</div>
            {Array.from({ length: 8 }, (_, r) => {
              const n = notas.find(x => x.dir === d && x.y === r);
              return <div key={r} style={{ height: 34, borderRadius: 8, background: n ? "var(--info)" : "rgba(255,255,255,.04)", display: "grid", placeItems: "center", fontSize: "1.2rem", boxShadow: n ? "0 0 12px var(--info)" : undefined }}>{n ? FLECHAS[d] : ""}</div>;
            })}
            <button className="btn-suave" onClick={() => golpear(d)}>{FLECHAS[d]}</button>
          </div>
        ))}
      </div>
      {mensaje && !jugando && <div className={`mensaje-final ${tipo}`}>{mensaje}</div>}
    </GameShell>
  );
}
