import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro } from "../ui/GameShell";
import { escribiendo } from "../suite/teclado";
import { sfx } from "../suite/sonido";

function carton() {
  const nums = Array.from({ length: 75 }, (_, i) => i + 1).sort(() => Math.random() - 0.5).slice(0, 24);
  const g = [];
  for (let r = 0; r < 5; r++) {
    const fila = [];
    for (let c = 0; c < 5; c++) {
      if (r === 2 && c === 2) fila.push({ n: 0, m: true });
      else fila.push({ n: nums.pop(), m: false });
    }
    g.push(fila);
  }
  return g;
}
function linea(g) {
  for (let r = 0; r < 5; r++) if (g[r].every(c => c.m)) return true;
  for (let c = 0; c < 5; c++) if (g.every(f => f[c].m)) return true;
  if ([0, 1, 2, 3, 4].every(i => g[i][i].m)) return true;
  if ([0, 1, 2, 3, 4].every(i => g[i][4 - i].m)) return true;
  return false;
}
export default function Bingo() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Bingo");
  const [cart, setCart] = useState(carton);
  const [bolas, setBolas] = useState([]);
  const [auto, setAuto] = useState(false);
  const [fin, setFin] = useState(null);
  const [mejor, setMejor] = useState(null);
  const st = useRef({ cart, bolas, fin: null });
  st.current = { cart, bolas, fin };

  function nuevo() {
    sfx.clic();
    const c = carton();
    st.current = { cart: c, bolas: [], fin: null };
    setCart(c); setBolas([]); setFin(null);
  }
  const nuevoRef = useRef(nuevo);
  nuevoRef.current = nuevo;
  function sacar() {
    const s = st.current;
    if (s.fin === "bingo" || s.bolas.length >= 40) return;
    const disp = Array.from({ length: 75 }, (_, i) => i + 1).filter(n => !s.bolas.includes(n));
    const n = disp[Math.floor(Math.random() * disp.length)];
    const nb = [...s.bolas, n];
    const nc = s.cart.map(f => f.map(c => (c.n === n ? { ...c, m: true } : c)));
    st.current = { ...s, cart: nc, bolas: nb };
    setCart(nc); setBolas(nb);
    sfx.clic();
    if (nc.flat().every(c => c.m)) {
      st.current.fin = "bingo"; setFin("bingo");
      setMejor(m => (m == null || nb.length < m ? nb.length : m));
      registrarPunt(200 - nb.length * 2, 1); sfx.record();
    } else if (linea(nc) && !s.fin?.includes("linea")) {
      st.current.fin = "linea"; setFin("linea");
      sfx.bien();
    }
  }
  const sacarRef = useRef(sacar); sacarRef.current = sacar;
  useEffect(() => {
    const fn = e => {
      if (escribiendo()) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (st.current.fin === "bingo") nuevoRef.current();
        else sacarRef.current();
      } else if ((e.key === "n" || e.key === "N") && st.current.fin === "bingo") nuevoRef.current();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);
  useEffect(() => {
    if (!auto || fin === "bingo") return;
    const id = setInterval(() => sacarRef.current(), 900);
    return () => clearInterval(id);
  }, [auto, fin, bolas]);

  const ultima = bolas[bolas.length - 1];
  const marcados = cart.flat().filter(c => c.m).length;
  const pct = Math.round((marcados / 25) * 100);
  return (
    <GameShell titulo="Bingo 75" emoji="🎱" descripcion="ENTER saca bola · línea y bingo · auto cada 0.9s."
      stats={[
        { icono: "🎱", etiqueta: "Bolas", valor: `${bolas.length}/40` },
        { icono: "⭐", etiqueta: "Última", valor: ultima ?? "—" },
        { icono: "✅", etiqueta: "Marcados", valor: `${marcados}/25` },
        { icono: "🏆", etiqueta: "Mejor", valor: mejor == null ? "—" : `${mejor} bolas` },
      ]}
      acciones={<>
        <button className="btn-principal" onClick={sacar} disabled={fin === "bingo"}>🎱 Sacar (ENTER)</button>
        <button className={auto ? "btn-principal" : "btn-suave"} onClick={() => { sfx.clic(); setAuto(a => !a); }}>{auto ? "⏸ Auto" : "▶ Auto"}</button>
        <button className="btn-exito" onClick={nuevo}>↻ Nuevo cartón</button>
      </>}
      resultado={fin === "bingo" ? { mensaje, tipo } : null}
      ayuda={<>
        <p><b>Objetivo:</b> marca tu cartón 5×5 (centro gratis ⭐) hasta completar <b>línea</b> (fila, columna o diagonal) y luego <b>bingo</b> (25/25) en máximo 40 bolas.</p>
        <p><b>Controles:</b> <kbd>Enter</kbd>/<kbd>Espacio</kbd> saca bola (o cartón nuevo al lograr bingo), botón Auto saca cada 0.9s. Táctil: toca Sacar.</p>
        <p><b>Puntuación:</b> el bingo registra <b>200 − 2 por bola</b> como victoria; la línea avisa pero no registra.</p>
        <p><b>Consejo:</b> juega en Auto para no perder ritmo y vigila las dos diagonales: suelen cantar línea antes que las filas.</p>
      </>}>
      <div className="xp-bar fina"><div style={{ width: `${pct}%` }} /></div>
      <div style={{ display: "flex", gap: 18, marginTop: 14, flexWrap: "wrap" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,52px)", gap: 4 }}>
          {cart.map((fila, r) => fila.map((c, i) => (
            <div key={`${r}-${i}`} style={{ width: 52, height: 52, borderRadius: 10, display: "grid", placeItems: "center", fontWeight: 800, background: c.m ? "rgba(34,197,94,.4)" : "var(--bg-soft)", border: "1px solid var(--border)" }}>
              {c.n === 0 ? "⭐" : c.n}
            </div>
          )))}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, maxWidth: 300 }}>
          {bolas.slice(-20).map(n => <span key={n} className="chip" style={n === ultima ? { borderColor: "var(--aviso)", color: "var(--aviso)" } : undefined}><b>{n}</b></span>)}
        </div>
      </div>
      {fin === "linea" && <div className="aviso info">📏 ¡LÍNEA! Sigue hasta el bingo 🎉 (llevas {bolas.length} bolas)</div>}
      {fin === "bingo" && <p style={{ fontWeight: 800 }}>🎉 ¡BINGO en {bolas.length} bolas!</p>}
    </GameShell>
  );
}
