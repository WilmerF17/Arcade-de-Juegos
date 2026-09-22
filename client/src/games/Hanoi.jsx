import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro } from "../ui/GameShell";
import { escribiendo } from "../suite/teclado";
import { sfx } from "../suite/sonido";

export default function Hanoi() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Torres de Hanói");
  const [n, setN] = useState(4);
  const [torres, setTorres] = useState([[], [], []]);
  const [movs, setMovs] = useState(0);
  const [cursor, setCursor] = useState(0);
  const [sel, setSel] = useState(null);
  const [fin, setFin] = useState(false);
  const st = useRef({ torres, movs, sel, fin });
  st.current = { torres, movs, sel, fin };

  function empezar(nn = n) {
    const t = [[], [], []];
    for (let i = nn; i >= 1; i--) t[0].push(i);
    setTorres(t); st.current.torres = t;
    setMovs(0); st.current.movs = 0;
    setSel(null); st.current.sel = null;
    setFin(false); st.current.fin = false;
    setCursor(0); setN(nn);
  }
  useEffect(() => { empezar(4); /* eslint-disable-next-line */ }, []);

  function accionar(i) {
    const s = st.current;
    if (s.fin) return;
    if (s.sel == null) {
      if (!s.torres[i].length) return;
      setSel(i); st.current.sel = i; sfx.clic();
      return;
    }
    if (s.sel === i) { setSel(null); st.current.sel = null; return; }
    const t = s.torres.map(a => [...a]);
    const disco = t[s.sel][t[s.sel].length - 1];
    const dest = t[i];
    if (dest.length && dest[dest.length - 1] < disco) { sfx.mal(); return; }
    t[i].push(t[s.sel].pop());
    const m = s.movs + 1;
    st.current.torres = t; st.current.movs = m; st.current.sel = null;
    setTorres(t); setMovs(m); setSel(null);
    sfx.bien();
    if (t[2].length === n || t[1].length === n) {
      st.current.fin = true; setFin(true);
      const optimo = Math.pow(2, n) - 1;
      const pts = Math.max(200 - Math.max(0, m - optimo) * 5, 40);
      registrarPunt(pts, 1);
      sfx.record();
    }
  }
  const accRef = useRef(accionar); accRef.current = accionar;

  useEffect(() => {
    const fn = e => {
      if (escribiendo()) return;
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") setCursor(c => (c + 2) % 3);
      else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") setCursor(c => (c + 1) % 3);
      else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setCursor(c => { accRef.current(c); return c; }); }
      else if (["1", "2", "3"].includes(e.key)) { const i = Number(e.key) - 1; setCursor(i); accRef.current(i); }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [n]);

  const optimo = Math.pow(2, n) - 1;
  return (
    <GameShell titulo="Torres de Hanói" emoji="🗼" descripcion="←/→ o 1-3 + ENTER · lleva la torre a la derecha.">
      <div className="fila-botones">
        {[3, 4, 5].map(x => <button key={x} className={n === x && !movs ? "btn-principal" : ""} onClick={() => empezar(x)}>{x} discos</button>)}
        <button className="btn-exito" onClick={() => empezar(n)}>Reiniciar</button>
        <span className="chip">Movs <b>{movs}</b> / óptimo <b>{optimo}</b></span>
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
        {torres.map((t, i) => (
          <div key={i} onClick={() => { setCursor(i); accionar(i); }}
            style={{ flex: 1, minHeight: 220, background: i === cursor ? "rgba(99,102,241,.12)" : "var(--bg-soft)", border: sel === i ? "2px solid var(--exito)" : i === cursor ? "2px solid var(--info)" : "1px solid var(--border)", borderRadius: 12, display: "flex", flexDirection: "column-reverse", alignItems: "center", padding: 10, gap: 4, cursor: "pointer" }}>
            <b style={{ color: "var(--texto-suave)" }}>Torre {i + 1}</b>
            {t.map(d => <div key={d} style={{ width: 30 + d * 26, height: 26, borderRadius: 8, background: `linear-gradient(135deg,hsl(${200 + d * 25},70%,55%),hsl(${260 + d * 15},70%,55%))`, display: "grid", placeItems: "center", fontWeight: 800, color: "#fff" }}>{d}</div>)}
          </div>
        ))}
      </div>
      {fin && <div className={`mensaje-final ${tipo}`}>🎉 ¡Torre completada en {movs} movimientos! {mensaje}</div>}
    </GameShell>
  );
}
