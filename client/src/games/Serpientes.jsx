import { useState } from "react";
import GameShell, { useRegistro } from "../ui/GameShell";
import { sfx } from "../suite/sonido";

const META = 30;
const ATAJOS = { 3: 12, 8: 18, 15: 25, 6: 2, 17: 9, 24: 14, 28: 19 }; // subidas y 🐍

/* Serpientes y Escaleras: dados contra la IA o duelo local. Meta exacta 30. */
function SerpBase({ titulo, modo, tira, iconoFondo }) {
  const nombre = modo === "2p" ? "Serpientes Duelo" : "Serpientes y Escaleras";
  const { mensaje, tipo, registrarPunt } = useRegistro(nombre);
  const [yo, setYo] = useState(0);
  const [rival, setRival] = useState(0);
  const [dado, setDado] = useState(null);
  const [turno, setTurno] = useState("yo");
  const [jugando, setJugando] = useState(false);
  const [log, setLog] = useState("");
  const dosJ = modo === "2p";

  function empezar() {
    setYo(0); setRival(0); setDado(null); setTurno("yo"); setJugando(true); setLog("");
    sfx.clic();
  }

  function aplicar(p) {
    let np = p;
    let extra = "";
    if (ATAJOS[np] !== undefined) {
      const d = ATAJOS[np];
      extra = d > np ? "🪜 ¡Escalera!" : "🐍 ¡Serpiente!";
      np = d;
    }
    if (np > META) { np = META - (np - META); extra = "↩️ ¡Rebote!"; }
    return { np, extra };
  }

  function lanzar() {
    if (!jugando) { empezar(); return; }
    if (!dosJ && turno !== "yo") return;
    const v = 1 + Math.floor(Math.random() * 6);
    setDado(v);
    const soyYo = turno === "yo";
    const r = aplicar((soyYo ? yo : rival) + v);
    if (soyYo) setYo(r.np); else setRival(r.np);
    if (r.np === META) {
      setJugando(false);
      const victoria = soyYo && !dosJ ? true : dosJ ? true : false;
      const ganoHumano = dosJ ? soyYo : soyYo;
      setLog(ganoHumano ? `🎉 ¡${dosJ && !soyYo ? "J2" : "Tú"} llegaste con ${v}!` : `🤖 La IA llegó con ${v}…`);
      if (ganoHumano) sfx.record(); else sfx.mal();
      registrarPunt(ganoHumano ? 500 : 120, ganoHumano ? 1 : 0);
      return;
    }
    setLog(`${soyYo ? (dosJ ? "J1" : "Tú") : dosJ ? "J2" : "IA"}: ${v} → ${r.np}. ${r.extra}`);
    if (ATAJOS[(soyYo ? yo : rival) + v] > (soyYo ? yo : rival) + v) sfx.bien();
    else if (r.extra.includes("Serpiente")) sfx.mal();
    else sfx.clic();
    if (!dosJ) {
      setTurno("ia");
      setTimeout(() => {
        const vi = 1 + Math.floor(Math.random() * 6);
        const ri = aplicar(rival + vi);
        setRival(ri.np);
        setDado(vi);
        if (ri.np === META) {
          setJugando(false);
          setLog(l => l + ` | 🤖 IA: ${vi} y ganó…`);
          sfx.mal();
          registrarPunt(yo * 8, 0);
        } else {
          setLog(l => l + ` | 🤖 IA: ${vi} → ${ri.np}. ${ri.extra}`);
          setTurno("yo");
        }
      }, 700);
    } else {
      setTurno(soyYo ? "j2" : "yo");
    }
  }

  const quien = turno === "yo" ? (dosJ ? "J1 🔵" : "Tú 🔵") : dosJ ? "J2 🔴" : "IA 🔴";

  return (
    <GameShell titulo={titulo} emoji="🐍"
      descripcion={dosJ ? "Duelo local J1 🔵 vs J2 🔴 · escaleras suben, serpientes bajan." : "Tú 🔵 contra la IA 🔴 · escaleras suben, serpientes bajan."}
      tira={tira} iconoFondo={iconoFondo}>
      <div className="fila-botones" style={{ marginTop: 0 }}>
        <span className="chip">🔵 <b>{yo}</b></span>
        <span className="chip">🔴 <b>{rival}</b></span>
        <span className="chip">🎲 <b>{dado ?? "—"}</b></span>
      </div>
      <div style={{ display: "flex", gap: 3, flexWrap: "wrap", justifyContent: "center", maxWidth: 480, margin: "0 auto" }}>
        {Array.from({ length: META + 1 }, (_, i) => (
          <div key={i} style={{ width: 34, height: 34, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: ".68rem", fontWeight: 800, border: "1px solid var(--border)",
            background: i === META ? "#22c55e" : ATAJOS[i] !== undefined ? (ATAJOS[i] > i ? "rgba(34,197,94,.4)" : "rgba(239,68,68,.4)") : "var(--bg-soft)" }}>
            {yo === i && rival === i && i !== 0 ? "👥" : yo === i && i !== 0 ? "🔵" : rival === i && i !== 0 ? "🔴" : i === META ? "🏁" : ATAJOS[i] !== undefined ? (ATAJOS[i] > i ? "🪜" : "🐍") : i}
          </div>
        ))}
      </div>
      {log && <p style={{ textAlign: "center" }}>{log}</p>}
      <div className="fila-botones">
        {!jugando && <button className="btn-principal" onClick={empezar}>▶ Empezar</button>}
        {jugando && (dosJ || turno === "yo") && <button className="btn-principal" onClick={lanzar}>🎲 Lanzar ({quien})</button>}
        {jugando && !dosJ && turno === "ia" && <span className="chip">🤖 Turno de la IA…</span>}
      </div>
      {mensaje && <div className={`mensaje-final ${tipo}`}>{mensaje}</div>}
    </GameShell>
  );
}

export function Serpientes() {
  return <SerpBase titulo="Serpientes y Escaleras" modo="ia" tira="linear-gradient(90deg,#22c55e,#eab308)" iconoFondo="linear-gradient(135deg,#22c55e,#eab308)" />;
}
export function SerpientesDuelo() {
  return <SerpBase titulo="Serpientes Duelo" modo="2p" tira="linear-gradient(90deg,#e879f9,#22c55e)" iconoFondo="linear-gradient(135deg,#e879f9,#22c55e)" />;
}
