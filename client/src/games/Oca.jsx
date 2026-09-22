import { useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { sfx } from "../suite/sonido";

const META = 24;
const OCAS = [5, 9, 14, 18, 23];
const PUENTES = [6, 12];

/* La Oca Veloz: carrera de dados contra la IA hasta la casilla 24 exacta. */
export default function Oca() {
  const { mensaje, tipo, registrarPunt } = useRegistro("La Oca Veloz");
  const [yo, setYo] = useState(0);
  const [ia, setIa] = useState(0);
  const [dado, setDado] = useState(null);
  const [turno, setTurno] = useState("yo");
  const [jugando, setJugando] = useState(false);
  const [log, setLog] = useState("");

  function empezar() {
    setYo(0); setIa(0); setDado(null); setTurno("yo"); setJugando(true); setLog("");
    sfx.clic();
  }

  function aplicar(pos, quien) {
    let p = pos;
    let extra = "";
    if (OCAS.includes(p)) { p = Math.min(META, p + 4); extra = "🪿 ¡De oca a oca! +4"; }
    else if (PUENTES.includes(p)) { p = Math.min(META, p + 2); extra = "🌉 ¡Puente! +2"; }
    else if (p === 20) { p = 0; extra = "💀 ¡Calavera! Vuelves al inicio"; }
    if (p > META) { p = META - (p - META); extra = "↩️ ¡Rebote! Hay que clavar el 24"; }
    return { p, extra, gana: p === META };
  }

  function lanzar() {
    if (!jugando || turno !== "yo") return;
    const v = 1 + Math.floor(Math.random() * 6);
    setDado(v);
    const r = aplicar(yo + v, "yo");
    setYo(r.p);
    if (r.gana) {
      setJugando(false);
      setLog(`🎉 ¡GANASTE con ${v}! ${r.extra}`);
      sfx.record();
      registrarPunt(500 + Math.max(0, 200 - ia * 8), 1);
      return;
    }
    setLog(`Tú: ${v} → casilla ${r.p}. ${r.extra}`);
    sfx.clic();
    // Turno de la IA
    setTurno("ia");
    setTimeout(() => {
      const vi = 1 + Math.floor(Math.random() * 6);
      const ri = aplicar(ia + vi, "ia");
      setIa(ri.p);
      if (ri.gana) {
        setJugando(false);
        setLog(l => l + ` | 🤖 La IA sacó ${vi} y ganó…`);
        sfx.mal();
        registrarPunt(yo * 10, 0);
      } else {
        setLog(l => l + ` | 🤖 IA: ${vi} → ${ri.p}. ${ri.extra}`);
        setTurno("yo");
      }
    }, 700);
  }

  return (
    <GameShell titulo="La Oca Veloz" emoji="🪿"
      descripcion="Dados contra la IA · ocas +4, puentes +2, calavera al inicio · clava el 24."
      tira="linear-gradient(90deg,#22c55e,#eab308)" iconoFondo="linear-gradient(135deg,#22c55e,#eab308)">
      <div className="fila-botones">
        <span className="chip">🧍 Tú: <b>{yo}</b></span>
        <span className="chip">🤖 IA: <b>{ia}</b></span>
        <span className="chip">🎲 <b>{dado ?? "—"}</b></span>
      </div>
      <div style={{ display: "flex", gap: 3, flexWrap: "wrap", justifyContent: "center", maxWidth: 520, margin: "0 auto" }}>
        {Array.from({ length: META + 1 }, (_, i) => (
          <div key={i} title={`Casilla ${i}`}
            style={{ width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: ".7rem", fontWeight: 800, border: "1px solid var(--border)",
              background: i === META ? "#22c55e" : OCAS.includes(i) ? "rgba(255,154,61,.5)" : PUENTES.includes(i) ? "rgba(34,211,238,.4)" : i === 20 ? "rgba(239,68,68,.5)" : "var(--bg-soft)" }}>
            {yo === i && ia === i ? "👥" : yo === i ? "🧍" : ia === i ? "🤖" : i === META ? "🏁" : i === 20 ? "💀" : i}
          </div>
        ))}
      </div>
      {log && <p style={{ textAlign: "center" }}>{log}</p>}
      <div className="fila-botones">
        {!jugando && <button className="btn-principal" onClick={empezar}>▶ {yo + ia > 0 ? "Otra carrera" : "Empezar"}</button>}
        {jugando && turno === "yo" && <button className="btn-principal" onClick={lanzar}>🎲 Lanzar dado</button>}
        {jugando && turno === "ia" && <span className="chip">🤖 Turno de la IA…</span>}
      </div>
      <Resultado mensaje={mensaje} tipo={tipo} />
    </GameShell>
  );
}
