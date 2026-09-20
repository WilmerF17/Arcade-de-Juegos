import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro } from "../ui/GameShell";
import { cargarBilletera, apostar, cobrar } from "../suite/billetera";
import { sfx } from "../suite/sonido";

const CABALLOS = [
  { nombre: "Rayo", emoji: "🐆", cuota: 2 },
  { nombre: "Trueno", emoji: "🐎", cuota: 3 },
  { nombre: "Flecha", emoji: "🐇", cuota: 4 },
  { nombre: "Torbellino", emoji: "🐢", cuota: 6 },
];
const APUESTAS = [10, 25, 50, 100, 250];

/* Hípica: apuesta a un corredor con su cuota y mira la carrera. */
export default function Hipica() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Hípica");
  const [apuesta, setApuesta] = useState(25);
  const [elegido, setElegido] = useState(0);
  const [pos, setPos] = useState([0, 0, 0, 0]);
  const [fase, setFase] = useState("apuesta");
  const [saldo, setSaldo] = useState(() => cargarBilletera().saldo);
  const [aviso, setAviso] = useState("");
  const [apuestaEnJuego, setApuestaEnJuego] = useState(0);
  const timer = useRef(null);
  const META = 30;

  function correr(eleg, stake) {
    setPos(p => {
      const np = p.map(x => x + Math.random() * (2 + Math.random() * 1.5));
      const ganador = np.findIndex(x => x >= META);
      if (ganador >= 0) {
        clearTimeout(timer.current);
        if (ganador === eleg) {
          const premio = stake * CABALLOS[eleg].cuota;
          setSaldo(cobrar(premio));
          sfx.record();
          registrarPunt(premio - stake, 1);
        } else {
          setSaldo(cargarBilletera().saldo);
          sfx.mal();
          registrarPunt(0, 0);
        }
        setFase("fin");
        return np;
      }
      timer.current = setTimeout(() => correr(eleg, stake), 120);
      return np;
    });
  }

  function apostarCarrera() {
    setAviso("");
    const r = apostar(apuesta);
    if (!r.ok) { setAviso(`⛔ ${r.motivo}. Reclama el 🎁 bonus diario.`); sfx.mal(); return; }
    setApuestaEnJuego(apuesta);
    setPos([0, 0, 0, 0]);
    setFase("corre");
    sfx.clic();
    timer.current = setTimeout(() => correr(elegido, apuesta), 300);
  }

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <GameShell titulo="Hípica" emoji="🐎"
      descripcion="Apuesta al corredor · paga su cuota si gana."
      tira="linear-gradient(90deg,#16a34a,#eab308)" iconoFondo="linear-gradient(135deg,#16a34a,#eab308)">
      <div className="fila-botones" style={{ marginTop: 0 }}>
        <span className="chip">🪙 <b>{saldo}</b></span>
        {fase === "fin" && apuestaEnJuego > 0 && <span className="chip">Apostado: <b>{apuestaEnJuego}</b></span>}
      </div>
      {fase !== "corre" && (
        <>
          <div className="fila-botones">
            <span className="chip">Apuesta:</span>
            {APUESTAS.map(a => (
              <button key={a} className={apuesta === a ? "btn-principal" : "btn-suave"} onClick={() => setApuesta(a)}>{a}</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
            {CABALLOS.map((c, i) => (
              <button key={c.nombre} className={elegido === i ? "btn-principal" : "btn-suave"}
                onClick={() => setElegido(i)}>{c.emoji} {c.nombre} ×{c.cuota}</button>
            ))}
          </div>
          <div className="fila-botones">
            <button className="btn-exito" onClick={apostarCarrera}>🏁 Apostar {apuesta} a {CABALLOS[elegido].nombre}</button>
          </div>
        </>
      )}
      {(fase === "corre" || fase === "fin") && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
          {CABALLOS.map((c, i) => (
            <div key={c.nombre} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 110 }}>{c.emoji} ×{c.cuota} {elegido === i ? "⭐" : ""}</span>
              <div style={{ flex: 1, height: 18, background: "var(--bg-soft)", borderRadius: 9, overflow: "hidden" }}>
                <div style={{ width: `${Math.min(100, (pos[i] / META) * 100)}%`, height: "100%",
                  background: elegido === i ? "linear-gradient(90deg,#16a34a,#eab308)" : "var(--border)" }} />
              </div>
            </div>
          ))}
        </div>
      )}
      {aviso && <p className="aviso info" style={{ textAlign: "center" }}>{aviso}</p>}
      {mensaje && <div className={`mensaje-final ${tipo}`}>{mensaje}</div>}
    </GameShell>
  );
}
