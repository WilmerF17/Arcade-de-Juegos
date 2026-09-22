import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { escribiendo } from "../suite/teclado";

const COLORES = ["s1", "s2", "s3", "s4"];

// Teclas: 1-4 siempre; flechas/WASD mapean a los 4 colores
const TECLA_COLOR = {
  1: 0, 2: 1, 3: 2, 4: 3,
  ArrowUp: 0, w: 0, W: 0,
  ArrowLeft: 1, a: 1, A: 1,
  ArrowDown: 2, s: 2, S: 2,
  ArrowRight: 3, d: 3, D: 3,
};

export default function Simon() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Secuencia Neón");
  const [secuencia, setSecuencia] = useState([]);
  const [jugando, setJugando] = useState(false); // true = mostrando secuencia (bloquea input)
  const [mostrando, setMostrando] = useState(-1);
  const [paso, setPaso] = useState(0);
  const [nivel, setNivel] = useState(0);
  const [mensajeAi, setMensajeAi] = useState("");
  const [fin, setFin] = useState(false);
  const timer = useRef(null);
  const pasoRef = useRef(0);
  const secRef = useRef([]);
  const jugandoRef = useRef(false);
  pasoRef.current = paso;
  secRef.current = secuencia;
  jugandoRef.current = jugando;

  function apagar() { if (timer.current) clearInterval(timer.current); setMostrando(-1); }

  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);

  function reproducir(seq) {
    setJugando(true);
    jugandoRef.current = true;
    let i = 0;
    apagar();
    timer.current = setInterval(() => {
      if (i >= seq.length) { if (timer.current) clearInterval(timer.current); setMostrando(-1); setJugando(false); jugandoRef.current = false; return; }
      setMostrando(seq[i]);
      i++;
    }, 550);
  }

  function empezar() {
    apagar();
    const seq = [Math.floor(Math.random() * 4)];
    secRef.current = seq;
    pasoRef.current = 0;
    setSecuencia(seq);
    setPaso(0); setNivel(0); setMensajeAi(""); setFin(false);
    setJugando(true);
    jugandoRef.current = true;
    setTimeout(() => reproducir(seq), 400);
  }

  function pulsar(idx) {
    if (jugandoRef.current || !secRef.current.length || fin) return;
    setMostrando(idx);
    setTimeout(() => setMostrando(-1), 160);
    const esperado = secRef.current[pasoRef.current];
    if (idx === esperado) {
      const np = pasoRef.current + 1;
      pasoRef.current = np;
      setPaso(np);
      if (np === secRef.current.length) {
        const nNivel = nivel + 1;
        setNivel(nNivel);
        if (nNivel >= 5) {
          registrarPunt(100 + nNivel * 10, 1);
          setMensajeAi("🏆 ¡GANASTE LA PARTIDA! Nivel 5 superado.");
          setSecuencia([]); secRef.current = [];
          setPaso(0); pasoRef.current = 0;
          setFin(true);
          return;
        }
        const nueva = [...secRef.current, Math.floor(Math.random() * 4)];
        secRef.current = nueva;
        setSecuencia(nueva);
        pasoRef.current = 0;
        setPaso(0);
        setMensajeAi("¡Bien! Te muestro la siguiente. 👀");
        setJugando(true);
        jugandoRef.current = true;
        setTimeout(() => reproducir(nueva), 700);
      }
    } else {
      registrarPunt(nivel * 10, 0);
      setMensajeAi(`Fallaste (era ${["🔴", "🟢", "🔵", "🟣"][esperado]}). Empieza de nuevo.`);
      setSecuencia([]); secRef.current = [];
      setPaso(0); pasoRef.current = 0; setNivel(0);
      setFin(true);
    }
  }

  const pulsarRef = useRef(pulsar);
  pulsarRef.current = pulsar;
  const empezarRef = useRef(empezar);
  empezarRef.current = empezar;

  useEffect(() => {
    const fn = e => {
      if (escribiendo()) return;
      if (e.key === "Enter" && !secRef.current.length) { empezarRef.current(); return; }
      if (TECLA_COLOR[e.key] != null) {
        e.preventDefault();
        pulsarRef.current(TECLA_COLOR[e.key]);
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nivel, fin]);

  return (
    <GameShell titulo="Secuencia Neón" emoji="🔵"
      descripcion="Clic o teclado (1-4, flechas o WASD). Supera el nivel 5.">
      <div className="fila-botones">
        {(!secuencia.length) && (
          <button className="btn-exito" onClick={empezar}>{fin ? "↻ Jugar otra vez" : "Empezar"}</button>
        )}
        {secuencia.length > 0 && <button className="btn-suave" onClick={empezar}>Reiniciar</button>}
        <span className="chip">Nivel: <b>{nivel}/5</b></span>
        {secuencia.length > 0 && <span className="chip">Pasos: <b>{paso}/{secuencia.length}</b></span>}
      </div>
      <div className="simon-panel">
        {COLORES.map((c, i) => (
          <div key={c} className={`cuadro-simon ${c} ${mostrando === i ? "encendido" : ""}`}
            onClick={() => pulsar(i)} style={{ opacity: mostrando === i ? 1 : 0.4 }} />
        ))}
      </div>
      <p className="aviso-ia">💡 Teclas: <b>1-4</b> · <b>W/↑</b>=🔴 <b>A/←</b>=🟢 <b>S/↓</b>=🔵 <b>D/→</b>=🟣 · <b>ENTER</b> empezar.</p>
      {mensajeAi && <p className="aviso-ia">{mensajeAi}</p>}
      {fin && <Resultado mensaje={mensaje} tipo={tipo} />}
    </GameShell>
  );
}
