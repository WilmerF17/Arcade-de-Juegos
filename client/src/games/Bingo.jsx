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
  const st = useRef({ cart, bolas, fin: null });
  st.current = { cart, bolas, fin };

  function nuevo() {
    const c = carton();
    st.current = { cart: c, bolas: [], fin: null };
    setCart(c); setBolas([]); setFin(null);
  }
  function sacar() {
    const s = st.current;
    if (s.fin || s.bolas.length >= 40) return;
    const disp = Array.from({ length: 75 }, (_, i) => i + 1).filter(n => !s.bolas.includes(n));
    const n = disp[Math.floor(Math.random() * disp.length)];
    const nb = [...s.bolas, n];
    const nc = s.cart.map(f => f.map(c => (c.n === n ? { ...c, m: true } : c)));
    st.current = { ...s, cart: nc, bolas: nb };
    setCart(nc); setBolas(nb);
    sfx.clic();
    if (nc.flat().every(c => c.m)) {
      st.current.fin = "bingo"; setFin("bingo");
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
      if ((e.key === "Enter" || e.key === " ") && !st.current.fin) { e.preventDefault(); sacarRef.current(); }
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
  return (
    <GameShell titulo="Bingo 75" emoji="🎱" descripcion="ENTER saca bola · línea y bingo · auto cada 0.9s.">
      <div className="fila-botones" style={{ marginTop: 0 }}>
        <button className="btn-principal" onClick={sacar} disabled={fin === "bingo"}>🎱 Sacar (ENTER)</button>
        <button className={auto ? "btn-principal" : "btn-suave"} onClick={() => setAuto(a => !a)}>{auto ? "⏸ Auto" : "▶ Auto"}</button>
        <button className="btn-exito" onClick={nuevo}>Nuevo cartón</button>
        <span className="chip">Bolas <b>{bolas.length}</b></span>
        {ultima != null && <span className="chip">Última <b>{ultima}</b></span>}
      </div>
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
      {fin === "linea" && <div className="aviso info">📏 ¡LÍNEA! Sigue hasta el bingo 🎉</div>}
      {fin === "bingo" && <div className={`mensaje-final ${tipo}`}>🎉 ¡BINGO en {bolas.length} bolas! {mensaje}</div>}
    </GameShell>
  );
}
