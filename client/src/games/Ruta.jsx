import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro } from "../ui/GameShell";
import { sfx } from "../suite/sonido";
import { escribiendo } from "../suite/teclado";

const FLECHAS = ["↑", "→", "↓", "←"];
const TECLAS = { ArrowUp: "↑", ArrowDown: "↓", ArrowLeft: "←", ArrowRight: "→", w: "↑", s: "↓", a: "←", d: "→" };

/* Ruta Exprés: memoriza la secuencia de flechas y repítela. Crece cada nivel, 3 vidas. */
export default function Ruta() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Ruta Exprés");
  const [ruta, setRuta] = useState([]);
  const [fase, setFase] = useState("inicio");
  const [paso, setPaso] = useState(0);
  const [nivel, setNivel] = useState(3);
  const [vidas, setVidas] = useState(3);
  const [puntos, setPuntos] = useState(0);
  const st = useRef({ ruta: [], paso: 0, nivel: 3, vidas: 3, puntos: 0 });
  const timer = useRef(null);

  function nuevaRuta(n) {
    const r = Array.from({ length: n }, () => FLECHAS[Math.floor(Math.random() * 4)]);
    st.current.ruta = r; st.current.paso = 0;
    setRuta(r); setPaso(0); setFase("mira");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setFase("repite"), 900 + n * 550);
  }

  function empezar() {
    st.current = { ruta: [], paso: 0, nivel: 3, vidas: 3, puntos: 0 };
    setNivel(3); setVidas(3); setPuntos(0);
    nuevaRuta(3);
    sfx.clic();
  }

  useEffect(() => () => clearTimeout(timer.current), []);

  function pulsar(f) {
    if (fase !== "repite") return;
    if (f === st.current.ruta[st.current.paso]) {
      const np = st.current.paso + 1;
      st.current.paso = np;
      setPaso(np);
      sfx.clic();
      if (np >= st.current.ruta.length) {
        const gana = st.current.nivel * 25;
        st.current.puntos += gana;
        const nn = st.current.nivel + 1;
        st.current.nivel = nn;
        setPuntos(st.current.puntos); setNivel(nn);
        sfx.bien();
        nuevaRuta(nn);
      }
    } else {
      const nv = st.current.vidas - 1;
      st.current.vidas = nv;
      setVidas(nv);
      sfx.mal();
      if (nv <= 0) {
        setFase("fin");
        registrarPunt(st.current.puntos, st.current.nivel >= 7 ? 1 : 0);
      } else {
        setFase("mira");
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setFase("repite"), 900 + st.current.ruta.length * 550);
      }
    }
  }

  const pulsarRef = useRef(pulsar);
  pulsarRef.current = pulsar;
  useEffect(() => {
    const fn = e => {
      if (escribiendo()) return;
      const f = TECLAS[e.key.length === 1 ? e.key.toLowerCase() : e.key];
      if (f) { e.preventDefault(); pulsarRef.current(f); }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  return (
    <GameShell titulo="Ruta Exprés" emoji="🧭"
      descripcion="Memoriza las flechas y repítelas con teclado o botones · 3 vidas."
      tira="linear-gradient(90deg,#22d3ee,#22c55e)" iconoFondo="linear-gradient(135deg,#22d3ee,#22c55e)">
      <div className="fila-botones" style={{ marginTop: 0 }}>
        <span className="chip">Nivel: <b>{nivel} flechas</b></span>
        <span className="chip">❤️ <b>{vidas}</b></span>
        <span className="chip">Puntos: <b>{puntos}</b></span>
      </div>
      {fase === "inicio" && (
        <div className="fila-botones"><button className="btn-principal" onClick={empezar}>▶ Empezar</button></div>
      )}
      {fase === "mira" && (
        <>
          <p style={{ textAlign: "center", fontSize: "2.4rem", letterSpacing: 6, margin: "10px 0" }}>{ruta.join(" ")}</p>
          <p style={{ textAlign: "center", color: "var(--texto-suave)" }}>Memoriza…</p>
        </>
      )}
      {fase === "repite" && (
        <>
          <p style={{ textAlign: "center", color: "var(--texto-suave)" }}>Repítela: {paso}/{ruta.length}</p>
          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            {FLECHAS.map(f => (
              <button key={f} className="btn-suave" style={{ fontSize: "1.8rem", padding: "12px 18px" }} onClick={() => pulsar(f)}>{f}</button>
            ))}
          </div>
        </>
      )}
      {mensaje && <div className={`mensaje-final ${tipo}`}>{mensaje}</div>}
      {fase === "fin" && !mensaje && (
        <div className="fila-botones"><button className="btn-principal" onClick={empezar}>↻ Otra vez</button></div>
      )}
    </GameShell>
  );
}
