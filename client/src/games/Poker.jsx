import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { escribiendo } from "../suite/teclado";
import { sfx } from "../suite/sonido";

function mano5() {
  const palos = ["♠", "♥", "♦", "♣"];
  const vs = ["J", "Q", "K", "A", "9", "10"];
  const m = [];
  for (let i = 0; i < 5; i++) m.push({ v: vs[Math.floor(Math.random() * vs.length)], p: palos[Math.floor(Math.random() * palos.length)], id: Math.random() });
  return m;
}
const ORDEN = { 9: 9, 10: 10, J: 11, Q: 12, K: 13, A: 14 };
function evaluar(m) {
  const vs = m.map(c => ORDEN[c.v]).sort((a, b) => a - b);
  const flush = m.every(c => c.p === m[0].p);
  const esc = vs.every((v, i) => i === 0 || v === vs[i - 1] + 1);
  const cnt = {};
  vs.forEach(v => { cnt[v] = (cnt[v] || 0) + 1; });
  const grupos = Object.values(cnt).sort((a, b) => b - a);
  if (flush && esc && vs[0] === 10) return ["Escalera Real 👑", 250];
  if (flush && esc) return ["Escalera de color ✨", 100];
  if (grupos[0] === 4) return ["Póker 🎆", 80];
  if (grupos[0] === 3 && grupos[1] === 2) return ["Full 🏠", 40];
  if (flush) return ["Color 🎨", 25];
  if (esc) return ["Escalera 🪜", 20];
  if (grupos[0] === 3) return ["Trío 👌", 12];
  if (grupos[0] === 2 && grupos[1] === 2) return ["Doble pareja ✌️", 8];
  if (grupos[0] === 2 && Math.max(...vs) >= 11) return ["Pareja de Jotas+ 👍", 4];
  return ["Nada 🃏", 0];
}
export default function Poker() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Video Poker");
  const [mano, setMano] = useState(mano5);
  const [sel, setSel] = useState([false, false, false, false, false]);
  const [fase, setFase] = useState("cambio"); // cambio -> resultado
  const [creditos, setCreditos] = useState(50);
  const [res, setRes] = useState(null);
  const credRef = useRef(50); credRef.current = creditos;

  function jugar() {
    if (credRef.current < 5) return;
    setCreditos(c => { credRef.current = c - 5; return credRef.current; });
    setMano(mano5()); setSel([false, false, false, false, false]);
    setFase("cambio"); setRes(null);
    sfx.clic();
  }
  function cambiar() {
    const palos = ["♠", "♥", "♦", "♣"];
    const vs = ["J", "Q", "K", "A", "9", "10"];
    setMano(m => m.map((c, i) => (sel[i] ? c : { v: vs[Math.floor(Math.random() * vs.length)], p: palos[Math.floor(Math.random() * palos.length)], id: Math.random() })));
    setFase("resultado");
    setTimeout(() => {
      setMano(m => {
        const [nombre, premio] = evaluar(m);
        setRes({ nombre, premio });
        if (premio > 0) {
          setCreditos(c => { credRef.current = c + premio; return credRef.current; });
          if (premio >= 40) { sfx.record(); registrarPunt(premio, 1); }
          else sfx.moneda();
        } else sfx.mal();
        return m;
      });
    }, 50);
  }
  return (
    <GameShell titulo="Video Poker" emoji="🃏" descripcion="Apuesta 5 · conserva con clic o 1-5 · ENTER cambiar.">
      <div className="fila-botones">
        <button className="btn-exito" onClick={jugar}>Nueva mano (5 🪙)</button>
        <span className="chip">🪙 <b>{creditos}</b></span>
        {res && <span className="chip"><b>{res.nombre}</b> +{res.premio}</span>}
      </div>
      <div className="mesa-casino" style={{ marginTop: 14 }}>
        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
          {mano.map((c, i) => (
            <div key={c.id + "-" + i} onClick={() => fase === "cambio" && setSel(s => s.map((v, k) => (k === i ? !v : v)))}
              className={`btn-carta ${c.p === "♥" || c.p === "♦" ? "rojo" : ""}`}
              style={{ padding: "14px 12px", fontSize: "1.4rem", outline: sel[i] ? "3px solid var(--exito)" : undefined, cursor: fase === "cambio" ? "pointer" : "default", opacity: sel[i] ? 0.55 : 1 }}>
              {c.v}{c.p}<small style={{ display: "block", fontSize: ".6rem" }}>{i + 1}{sel[i] ? " · fuera" : " · (" + (i + 1) + ")"}</small>
            </div>
          ))}
        </div>
        {fase === "cambio" && <div className="fila-botones" style={{ justifyContent: "center" }}><button className="btn-principal" onClick={cambiar}>🔄 Cambiar (ENTER)</button></div>}
        {res && <p style={{ textAlign: "center", color: "#fff" }}>{res.nombre} → +{res.premio} 🪙</p>}
      </div>
      {creditos < 5 && <p className="aviso info">Sin créditos: recarga <button className="btn-suave" onClick={() => { setCreditos(50); credRef.current = 50; }}>↻ 50</button></p>}
      <Resultado mensaje={mensaje} tipo={tipo} />
    </GameShell>
  );
}
