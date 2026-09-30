import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { sfx } from "../suite/sonido";
import { escribiendo } from "../suite/teclado";

/* Copa Relámpago: elige tu corredor y mira la carrera aleatoria. */
const CORREDORES = [
  { nombre: "Rayo", emoji: "🐆" }, { nombre: "Trueno", emoji: "🐎" },
  { nombre: "Flecha", emoji: "🐇" }, { nombre: "Torbellino", emoji: "🐢" },
];
const CONF_DIF = { 1: { carreras: 3, nombre: "Fácil" }, 2: { carreras: 5, nombre: "Normal" }, 3: { carreras: 7, nombre: "Difícil" } };
export default function CopaRelampago() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Copa Relámpago");
  const [elegido, setElegido] = useState(null);
  const [pos, setPos] = useState([0, 0, 0, 0]);
  const [carrera, setCarrera] = useState(0);
  const [puntos, setPuntos] = useState(0);
  const [victorias, setVictorias] = useState(0);
  const [dif, setDif] = useState(2);
  const CARRERAS = CONF_DIF[dif].carreras;
  const [fase, setFase] = useState("elige");
  const st = useRef({ carrera: 0, puntos: 0, victorias: 0 });
  const timer = useRef(null);
  const faseRef = useRef("elige");
  faseRef.current = fase;

  const META = 30;

  function correr() {
    const np = pos.map(p => p + Math.random() * 2.2);
    setPos(np);
    const ganador = np.findIndex(p => p >= META);
    if (ganador >= 0) {
      clearTimeout(timer.current);
      const gano = ganador === elegido;
      const npuntos = st.current.puntos + (gano ? 200 : 20);
      st.current.puntos = npuntos;
      setPuntos(npuntos);
      if (gano) { st.current.victorias++; setVictorias(st.current.victorias); sfx.bien(); sfx.moneda(); } else sfx.mal();
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
    st.current = { carrera: 0, puntos: 0, victorias: 0 };
    setCarrera(0); setPuntos(0); setVictorias(0); setElegido(null); setPos([0, 0, 0, 0]);
    setFase("elige");
    sfx.clic();
  }

  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    const fn = e => {
      if (escribiendo()) return;
      if ((e.key === "Enter" || e.key === " ") && faseRef.current === "fin") {
        e.preventDefault();
        empezar();
        return;
      }
      if (faseRef.current !== "elige") return;
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= CORREDORES.length) {
        e.preventDefault();
        elegir(n - 1);
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dif, elegido, pos, carrera, puntos]);

  const pct = Math.round((carrera / CARRERAS) * 100);

  return (
    <GameShell titulo="Copa Relámpago" emoji="🏆"
      descripcion={`Elige corredor y cruza los dedos · ${CARRERAS} carreras · ganar paga 200.`}
      tira="linear-gradient(90deg,#f59e0b,#ef4444)" iconoFondo="linear-gradient(135deg,#f59e0b,#ef4444)"
      stats={[
        { icono: "🏁", etiqueta: "Carrera", valor: `${Math.min(carrera + 1, CARRERAS)}/${CARRERAS}` },
        { icono: "⭐", etiqueta: "Puntos", valor: puntos },
        { icono: "🏆", etiqueta: "Victorias", valor: victorias },
        { icono: "🎯", etiqueta: "Dificultad", valor: CONF_DIF[dif].nombre },
      ]}
      acciones={fase === "fin" ? <button className="btn-principal" onClick={empezar}>↻ Otra copa</button> : null}
      ayuda={<>
        <span>Elige un corredor (<b>teclas 1–4</b>) y mira la carrera: si gana el tuyo sumas <b>200</b>, si no solo <b>20</b>.</span>
        <span>Controles: clic o dedo en el corredor; teclado <kbd>1</kbd>–<kbd>4</kbd>. <kbd>ENTER</kbd> reintenta al final.</span>
        <span>Puntuación: con <b>500+</b> la copa cuenta como victoria. Dificultad: <b>Fácil 3 carreras</b>, <b>Normal 5</b>, <b>Difícil 7</b>.</span>
        <span>Consejo: todos corren igual de rápido: cambia de corredor cada carrera para repartir la suerte.</span>
      </>}>
      {fase === "elige" && carrera === 0 && puntos === 0 && (
        <>
          <div className="fila-botones" role="group" aria-label="Dificultad">
            {[1, 2, 3].map(d => (
              <button key={d} className={dif === d ? "btn-principal" : "btn-suave"} onClick={() => { setDif(d); sfx.clic(); }}>{d === 1 ? "🟢 Fácil 3" : d === 2 ? "🟡 Normal 5" : "🔴 Difícil 7"}</button>
            ))}
          </div>
          <p style={{ textAlign: "center", color: "var(--texto-suave)" }}>Elige tu corredor 👇</p>
        </>
      )}
      <div className="xp-bar fina" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Progreso de la copa"><div style={{ width: `${pct}%` }} /></div>
      {(fase === "elige") && (
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
          {CORREDORES.map((c, i) => (
            <button key={c.nombre} className={elegido === i ? "btn-principal" : "btn-suave"}
              style={{ fontSize: "1.3rem", padding: "12px 16px" }} onClick={() => elegir(i)}>
              {c.emoji} {c.nombre} <kbd style={{ fontSize: ".75rem" }}>{i + 1}</kbd>
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
      <Resultado mensaje={mensaje} tipo={tipo} />
    </GameShell>
  );
}
