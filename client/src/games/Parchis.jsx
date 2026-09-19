import { useState } from "react";
import GameShell, { useRegistro } from "../ui/GameShell";
import { sfx } from "../suite/sonido";

const META = 20;

/* Parchís Veloz: 2 fichas por jugador, dados, capturas y meta exacta en 20. */
function ParchisBase({ titulo, modo, tira, iconoFondo }) {
  const nombre = modo === "2p" ? "Parchís Duelo" : "Parchís Veloz";
  const { mensaje, tipo, registrarPunt } = useRegistro(nombre);
  const [yo, setYo] = useState([0, 0]);
  const [rival, setRival] = useState([0, 0]);
  const [dado, setDado] = useState(null);
  const [turno, setTurno] = useState("yo");
  const [jugando, setJugando] = useState(false);
  const [log, setLog] = useState("");
  const dosJ = modo === "2p";

  function empezar() {
    setYo([0, 0]); setRival([0, 0]); setDado(null);
    setTurno("yo"); setJugando(true); setLog("");
    sfx.clic();
  }

  function destino(pos, v) {
    let p = pos + v;
    if (p > META) p = META - (p - META);
    return p;
  }

  function gana(fichas) {
    return fichas.some(f => f === META);
  }

  function turnoIA(estadoYo, estadoRival) {
    const v = 1 + Math.floor(Math.random() * 6);
    // IA: mueve la ficha más adelantada que pueda capturar o avanzar
    let mejor = 0, mejorScore = -1;
    estadoRival.forEach((f, i) => {
      const d = destino(f, v);
      let s = d;
      if (estadoYo.includes(d) && d !== META) s += 10;
      if (d === META) s += 20;
      if (s > mejorScore) { mejorScore = s; mejor = i; }
    });
    const nr = [...estadoRival];
    nr[mejor] = destino(nr[mejor], v);
    let ny = [...estadoYo];
    if (ny.includes(nr[mejor]) && nr[mejor] !== META) ny = ny.map(x => (x === nr[mejor] ? 0 : x));
    return { ny, nr, v };
  }

  function mover(yi, v, estadoYo, estadoRival, quien) {
    const ny = [...estadoYo];
    ny[yi] = destino(ny[yi], v);
    let nr = [...estadoRival];
    const captura = nr.includes(ny[yi]) && ny[yi] !== META;
    if (captura) nr = nr.map(x => (x === ny[yi] ? 0 : x));
    return { ny, nr, captura };
  }

  function jugarTurno(yi) {
    if (!jugando) { empezar(); return; }
    const v = 1 + Math.floor(Math.random() * 6);
    setDado(v);
    if (!dosJ && turno === "ia") return;
    const yoEs = turno === "yo";
    const mis = yoEs ? yo : rival;
    const otro = yoEs ? rival : yo;
    const r = mover(yi, v, mis, otro, turno);
    const nyo = yoEs ? r.ny : r.nr;
    const nri = yoEs ? r.nr : r.ny;
    setYo(nyo); setRival(nri);
    const misF = yoEs ? r.ny : r.nr;
    if (gana(misF)) {
      setJugando(false);
      const victoria = yoEs;
      setLog(victoria ? `🎉 ¡GANASTE con ${v}!` : `🤖 La IA llegó con ${v}…`);
      if (victoria) sfx.record(); else sfx.mal();
      registrarPunt(victoria ? 600 : 150, victoria ? 1 : 0);
      return;
    }
    setLog(`${yoEs ? "Tú" : dosJ ? "J2" : "IA"}: ${v} ${r.captura ? "💥 ¡captura!" : ""}`);
    if (r.captura) sfx.bien(); else sfx.clic();
    if (!dosJ) {
      setTurno("ia");
      setTimeout(() => {
        const t = turnoIA(nyo, nri);
        setYo(t.ny); setRival(t.nr); setDado(t.v);
        if (gana(t.nr)) {
          setJugando(false);
          setLog(`🤖 La IA llegó con ${t.v}…`);
          sfx.mal();
          registrarPunt(150, 0);
        } else {
          setLog(l => l + ` | 🤖 IA: ${t.v}`);
          setTurno("yo");
        }
      }, 700);
    } else {
      setTurno(yoEs ? "j2" : "yo");
    }
  }

  const mis = turno === "yo" ? yo : rival;
  const quien = turno === "yo" ? "Tú (🔵)" : dosJ ? "J2 (🔴)" : "IA (🔴)";

  return (
    <GameShell titulo={titulo} emoji="🎲"
      descripcion={dosJ ? "Duelo local: J1 🔵 y J2 🔴 · elige ficha y lanza." : "Tú 🔵 contra la IA 🔴 · elige ficha y lanza."}
      tira={tira} iconoFondo={iconoFondo}>
      <div className="fila-botones" style={{ marginTop: 0 }}>
        <span className="chip">🔵 <b>{yo.join(" · ")}</b></span>
        <span className="chip">🔴 <b>{rival.join(" · ")}</b></span>
        <span className="chip">🎲 <b>{dado ?? "—"}</b></span>
      </div>
      <div style={{ display: "flex", gap: 2, justifyContent: "center", margin: "6px 0" }}>
        {Array.from({ length: META + 1 }, (_, i) => (
          <div key={i} style={{ width: 22, height: 30, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: ".65rem", border: "1px solid var(--border)",
            background: i === META ? "#22c55e" : "var(--bg-soft)" }}>
            {yo.includes(i) && rival.includes(i) ? "👥" : yo.includes(i) ? "🔵" : rival.includes(i) ? "🔴" : i === META ? "🏁" : ""}
          </div>
        ))}
      </div>
      {log && <p style={{ textAlign: "center" }}>{log}</p>}
      <div className="fila-botones">
        {!jugando && <button className="btn-principal" onClick={empezar}>▶ Empezar</button>}
        {jugando && (dosJ || turno === "yo") && (
          <>
            <span className="chip">Toca tu ficha ({quien}):</span>
            {mis.map((f, i) => (
              <button key={i} className="btn-principal" onClick={() => jugarTurno(i)}>🔵 {f} → 🎲</button>
            ))}
          </>
        )}
        {jugando && !dosJ && turno === "ia" && <span className="chip">🤖 Turno de la IA…</span>}
      </div>
      {mensaje && <div className={`mensaje-final ${tipo}`}>{mensaje}</div>}
    </GameShell>
  );
}

export function ParchisVeloz() {
  return <ParchisBase titulo="Parchís Veloz" modo="ia" tira="linear-gradient(90deg,#f59e0b,#ef4444)" iconoFondo="linear-gradient(135deg,#f59e0b,#ef4444)" />;
}
export function ParchisDuelo() {
  return <ParchisBase titulo="Parchís Duelo" modo="2p" tira="linear-gradient(90deg,#22c55e,#e879f9)" iconoFondo="linear-gradient(135deg,#22c55e,#e879f9)" />;
}
