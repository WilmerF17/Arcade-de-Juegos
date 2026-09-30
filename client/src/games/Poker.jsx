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
  const [mejor, setMejor] = useState(null);
  const [manos, setManos] = useState(0);
  const credRef = useRef(50); credRef.current = creditos;
  const stRef = useRef({ fase });
  stRef.current = { fase };

  function jugar() {
    if (credRef.current < 5) return;
    setCreditos(c => { credRef.current = c - 5; return credRef.current; });
    setMano(mano5()); setSel([false, false, false, false, false]);
    setFase("cambio"); setRes(null);
    stRef.current.fase = "cambio";
    sfx.clic();
  }
  function cambiar() {
    if (stRef.current.fase !== "cambio") return;
    sfx.clic();
    const palos = ["♠", "♥", "♦", "♣"];
    const vs = ["J", "Q", "K", "A", "9", "10"];
    setMano(m => m.map((c, i) => (sel[i] ? c : { v: vs[Math.floor(Math.random() * vs.length)], p: palos[Math.floor(Math.random() * palos.length)], id: Math.random() })));
    setFase("resultado");
    stRef.current.fase = "resultado";
    setManos(m => m + 1);
    setTimeout(() => {
      setMano(m => {
        const [nombre, premio] = evaluar(m);
        setRes({ nombre, premio });
        if (premio > 0) {
          setCreditos(c => { credRef.current = c + premio; return credRef.current; });
          setMejor(mm => (mm == null || premio > mm ? premio : mm));
          if (premio >= 40) { sfx.record(); registrarPunt(premio, 1); }
          else sfx.moneda();
        } else sfx.mal();
        return m;
      });
    }, 50);
  }
  const jugarRef = useRef(jugar);
  jugarRef.current = jugar;
  const cambiarRef = useRef(cambiar);
  cambiarRef.current = cambiar;
  const selRef = useRef(null);
  selRef.current = setSel;

  useEffect(() => {
    const fn = e => {
      if (escribiendo()) return;
      if (e.key >= "1" && e.key <= "5") {
        if (stRef.current.fase !== "cambio") return;
        const i = Number(e.key) - 1;
        selRef.current(s => s.map((v, k) => (k === i ? !v : v)));
        sfx.clic();
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (stRef.current.fase === "cambio") cambiarRef.current();
        else jugarRef.current();
      } else if (e.key === "n" || e.key === "N") jugarRef.current();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [sel]);

  return (
    <GameShell titulo="Video Poker" emoji="🃏" descripcion="Apuesta 5 · conserva con clic o 1-5 · ENTER cambiar."
      stats={[
        { icono: "🪙", etiqueta: "Bote", valor: creditos },
        { icono: "💸", etiqueta: "Apuesta", valor: 5 },
        { icono: "🂡", etiqueta: "Manos", valor: manos },
        { icono: "🏆", etiqueta: "Mejor premio", valor: mejor == null ? "—" : `+${mejor}` },
      ]}
      acciones={<>
        <button className="btn-exito" onClick={jugar}>🃏 Nueva mano (5 🪙 · N)</button>
        {fase === "cambio" && <button className="btn-principal" onClick={cambiar}>🔄 Cambiar (ENTER)</button>}
      </>}
      ayuda={<>
        <p><b>Objetivo:</b> apuesta <b>5 🪙</b>, conserva (clica) las cartas buenas y cambia el resto una vez. Cobras según la jugada final.</p>
        <p><b>Controles:</b> clic o <kbd>1</kbd>–<kbd>5</kbd> para conservar/descartar, <kbd>Enter</kbd>/<kbd>Espacio</kbd> para cambiar o repartir, <kbd>N</kbd> nueva mano. Táctil: toca las cartas.</p>
        <p><b>Premios:</b> Jotas+ 4 · Doble pareja 8 · Trío 12 · Escalera 20 · Color 25 · Full 40 · Póker 80 · Escalera color 100 · Real 250. Premios ≥40 registran ranking.</p>
        <p><b>Consejo:</b> conserva siempre pareja alta o 4 a color/escalera; si no hay nada, cambia 5 cartas... aquí conserva solo la carta más alta.</p>
      </>}>
      <div className="xp-bar fina"><div style={{ width: `${Math.min(100, Math.round((creditos / 100) * 100))}%` }} /></div>
      <div className="mesa-casino" style={{ marginTop: 14 }}>
        <p style={{ color: "#fff", textAlign: "center", margin: "0 0 8px" }}>🪙 Bote <b>{creditos}</b> · apuesta <b>5</b> {res && <>· <b>{res.nombre}</b> +{res.premio}</>}</p>
        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
          {mano.map((c, i) => (
            <div key={c.id + "-" + i} onClick={() => fase === "cambio" && setSel(s => s.map((v, k) => (k === i ? !v : v)))}
              className={`btn-carta ${c.p === "♥" || c.p === "♦" ? "rojo" : ""}`}
              style={{ padding: "14px 12px", fontSize: "1.4rem", outline: sel[i] ? "3px solid var(--exito)" : undefined, cursor: fase === "cambio" ? "pointer" : "default", opacity: sel[i] ? 0.55 : 1 }}>
              {c.v}{c.p}<small style={{ display: "block", fontSize: ".6rem" }}>{i + 1}{sel[i] ? " · fuera" : " · (" + (i + 1) + ")"}</small>
            </div>
          ))}
        </div>
        {res && <p style={{ textAlign: "center", color: "#fff" }}>{res.nombre} → +{res.premio} 🪙</p>}
      </div>
      {creditos < 5 && <p className="aviso info">Sin créditos: recarga <button className="btn-suave" onClick={() => { setCreditos(50); credRef.current = 50; sfx.moneda(); }}>↻ 50</button></p>}
      <Resultado mensaje={mensaje} tipo={tipo} />
    </GameShell>
  );
}
