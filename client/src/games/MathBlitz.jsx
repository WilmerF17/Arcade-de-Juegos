import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro } from "../ui/GameShell";
import { sfx } from "../suite/sonido";

function nuevaOp(dif) {
  const max = dif === 1 ? 10 : dif === 2 ? 25 : 60;
  const ops = dif === 3 ? ["+", "-", "×"] : ["+", "-", "×"];
  const op = ops[Math.floor(Math.random() * ops.length)];
  let a = 2 + Math.floor(Math.random() * max);
  let b = 2 + Math.floor(Math.random() * max);
  if (op === "-" && b > a) [a, b] = [b, a];
  if (op === "×") { a = 2 + Math.floor(Math.random() * (dif === 1 ? 9 : 12)); b = 2 + Math.floor(Math.random() * (dif === 1 ? 9 : 12)); }
  const res = op === "+" ? a + b : op === "-" ? a - b : a * b;
  return { a, b, op, res };
}

export default function MathBlitz() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Math Blitz");
  const [dif, setDif] = useState(2);
  const [op, setOp] = useState(() => nuevaOp(2));
  const [resp, setResp] = useState("");
  const [puntos, setPuntos] = useState(0);
  const [aciertos, setAciertos] = useState(0);
  const [fallos, setFallos] = useState(0);
  const [combo, setCombo] = useState(0);
  const [mejorCombo, setMejorCombo] = useState(0);
  const [tiempo, setTiempo] = useState(60);
  const [jugando, setJugando] = useState(false);
  const [feedback, setFeedback] = useState("");
  const inputRef = useRef(null);
  const finRef = useRef(false);

  function empezar(d = dif) {
    setDif(d);
    setOp(nuevaOp(d));
    setResp(""); setPuntos(0); setAciertos(0); setFallos(0);
    setCombo(0); setMejorCombo(0); setTiempo(60);
    setJugando(true); finRef.current = false; setFeedback("");
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  useEffect(() => {
    if (!jugando) return;
    if (tiempo <= 0) {
      if (!finRef.current) {
        finRef.current = true;
        setJugando(false);
        const pts = puntos + mejorCombo * 5;
        registrarPunt(pts, aciertos >= 15 ? 1 : 0);
        sfx.record();
      }
      return;
    }
    const id = setTimeout(() => setTiempo(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [jugando, tiempo]);

  function responder(e) {
    e?.preventDefault();
    if (!jugando) return;
    const n = Number(resp);
    if (resp.trim() === "" || Number.isNaN(n)) return;
    if (n === op.res) {
      const nc = combo + 1;
      setCombo(nc);
      setMejorCombo(m => Math.max(m, nc));
      const bonus = nc >= 5 ? 5 : nc >= 3 ? 2 : 0;
      setPuntos(p => p + 10 + bonus);
      setAciertos(a => a + 1);
      setFeedback(`✅ +${10 + bonus}${nc >= 3 ? ` · combo ×${nc} 🔥` : ""}`);
      sfx.bien();
    } else {
      setCombo(0);
      setFallos(f => f + 1);
      setPuntos(p => Math.max(0, p - 3));
      setFeedback(`❌ Era ${op.res}`);
      sfx.mal();
    }
    setOp(nuevaOp(dif));
    setResp("");
    inputRef.current?.focus();
  }

  const pct = Math.max(0, (tiempo / 60) * 100);

  return (
    <GameShell titulo="Math Blitz" emoji="🔢"
      descripcion="60 segundos de cálculo mental. Racha de aciertos = bonus. ¡Sin calculadora!"
      tira="linear-gradient(90deg,#38bdf8,#6366f1,#a855f7)" iconoFondo="linear-gradient(135deg,#38bdf8,#6366f1)">
      <div className="fila-botones" style={{ marginTop: 0 }}>
        {[1, 2, 3].map(d => (
          <button key={d} disabled={jugando} className={dif === d && !jugando ? "btn-principal" : ""}
            onClick={() => empezar(d)}>{d === 1 ? "🟢 Fácil" : d === 2 ? "🟡 Normal" : "🔴 Difícil"}</button>
        ))}
        {!jugando && (puntos > 0 || aciertos > 0) ? null : !jugando && <button className="btn-principal" onClick={() => empezar()}>▶ Jugar 60s</button>}
        <span className="chip">⏱️ <b>{tiempo}s</b></span>
        <span className="chip">⭐ <b>{puntos}</b></span>
        <span className="chip">🔥 Combo <b>×{combo}</b></span>
      </div>
      <div className="barra-tiempo"><div style={{ width: `${pct}%` }} className={tiempo <= 10 ? "critico" : ""} /></div>
      {jugando && (
        <form className="math-zona" onSubmit={responder}>
          <div className="math-op">{op.a} {op.op} {op.b} = ?</div>
          <input ref={inputRef} type="number" value={resp} onChange={e => setResp(e.target.value)}
            placeholder="?" autoFocus inputMode="numeric" />
          <button className="btn-principal" type="submit">OK</button>
        </form>
      )}
      {feedback && jugando && <div className="math-feedback">{feedback}</div>}
      <div className="fila-botones">
        <span className="chip">✅ <b>{aciertos}</b></span>
        <span className="chip">❌ <b>{fallos}</b></span>
        <span className="chip">🏆 Mejor combo <b>×{mejorCombo}</b></span>
      </div>
      {mensaje && <div className={`mensaje-final ${tipo}`}>{mensaje} (aciertos: {aciertos})</div>}
    </GameShell>
  );
}
