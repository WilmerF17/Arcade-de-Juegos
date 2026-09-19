import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro } from "../ui/GameShell";
import { sfx } from "../suite/sonido";

/* Copa Relámpago: elige tu corredor y mira la carrera aleatoria. 5 carreras. */
const CORREDORES = [
  { nombre: "Rayo", emoji: "🐆" }, { nombre: "Trueno", emoji: "🐎" },
  { nombre: "Flecha", emoji: "🐇" }, { nombre: "Torbellino", emoji: "🐢" },
];
export default function CopaRelampago() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Copa Relámpago");
  const [elegido, setElegido] = useState(null);
  const [pos, setPos] = useState([0, 0, 0, 0]);
  const [carrera, setCarrera] = useState(0);
  const [puntos, setPuntos] = useState(0);
  const [fase, setFase] = useState("elige");
  const st = useRef({ carrera: 0, puntos: 0 });
  const timer = useRef(null);

  const CARRERAS = 5, META = 30;

  function correr() {
    const np = pos.map(p => p + Math.random() * 2.2);
    setPos(np);
    const ganador = np.findIndex(p => p >= META);
    if (ganador >= 0) {
      clearInterval(timer.current);
      const gano = ganador === elegido;
      const npuntos = st.current.puntos + (gano ? 200 : 20);
      st.current.puntos = npuntos;
      setPuntos(npuntos);
      if (gano) sfx.bien(); else sfx.mal();
      const nc = st.current.carrera + 1;
      st.current.carrera = nc;
      setCarrera(nc);
      if (nc >= CARRERAS) {
        setFase("fin");
        registrarPunt(npuntos, npuntos >= 500 ? 1 : 0);
      } else {
        setFase("elige");
        setPos([0, 0, 0, 0]);
      }
      return;
    }
    timer.current = setTimeout(correr, 120);
  }

  function elegir(i) {
    setElegido(i);
    setPos([0, 0, 0, 0]);
    setFase("corre");
    sfx.clic();
    timer.current = setTimeout(correr, 300);
  }

  function empezar() {
    st.current = { carrera: 0, puntos: 0 };
    setCarrera(0); setPuntos(0); setElegido(null); setPos([0, 0, 0, 0]);
    setFase("elige");
    sfx.clic();
  }

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <GameShell titulo="Copa Relámpago" emoji="🏆"
      descripcion="Elige corredor y cruza los dedos · 5 carreras · ganar paga 200."
      tira="linear-gradient(90deg,#f59e0b,#ef4444)" iconoFondo="linear-gradient(135deg,#f59e0b,#ef4444)">
      <div className="fila-botones" style={{ marginTop: 0 }}>
        <span className="chip">Carrera: <b>{Math.min(carrera + 1, CARRERAS)}/{CARRERAS}</b></span>
        <span className="chip">Puntos: <b>{puntos}</b></span>
      </div>
      {fase === "elige" && carrera === 0 && puntos === 0 && (
        <p style={{ textAlign: "center", color: "var(--texto-suave)" }}>Elige tu corredor 👇</p>
      )}
      {(fase === "elige") && (
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
          {CORREDORES.map((c, i) => (
            <button key={c.nombre} className={elegido === i ? "btn-principal" : "btn-suave"}
              style={{ fontSize: "1.3rem", padding: "12px 16px" }} onClick={() => elegir(i)}>
              {c.emoji} {c.nombre}
            </button>
          ))}
        </div>
      )}
      {fase !== "elige" || carrera > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
          {CORREDORES.map((c, i) => (
            <div key={c.nombre} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 90 }}>{c.emoji} {elegido === i ? "⭐" : ""}</span>
              <div style={{ flex: 1, height: 18, background: "var(--bg-soft)", borderRadius: 9, overflow: "hidden" }}>
                <div style={{ width: `${Math.min(100, (pos[i] / META) * 100)}%`, height: "100%",
                  background: elegido === i ? "linear-gradient(90deg,#f59e0b,#ef4444)" : "var(--border)" }} />
              </div>
            </div>
          ))}
        </div>
      ) : null}
      {mensaje && <div className={`mensaje-final ${tipo}`}>{mensaje}</div>}
      {fase === "fin" && !mensaje && (
        <div className="fila-botones"><button className="btn-principal" onClick={empezar}>↻ Otra copa</button></div>
      )}
    </GameShell>
  );
}
