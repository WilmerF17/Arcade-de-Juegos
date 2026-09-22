import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { sfx } from "../suite/sonido";

/* Destello: toca la celda que parpadea antes de que se apague. 20 rondas, cada vez más rápido. */
export default function Destello() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Destello");
  const [objetivo, setObjetivo] = useState(-1);
  const [ronda, setRonda] = useState(0);
  const [puntos, setPuntos] = useState(0);
  const [vidas, setVidas] = useState(3);
  const [jugando, setJugando] = useState(false);
  const st = useRef({ ronda: 0, puntos: 0, vidas: 3, jugando: false, objetivo: -1 });
  const timer = useRef(null);

  const RONDAS = 20;

  function nuevaRonda() {
    const o = Math.floor(Math.random() * 9);
    st.current.objetivo = o;
    setObjetivo(o);
    const nr = st.current.ronda + 1;
    st.current.ronda = nr;
    setRonda(nr);
    clearTimeout(timer.current);
    const espera = Math.max(320, 950 - nr * 32);
    timer.current = setTimeout(() => fallar("¡Se apagó!"), espera);
  }

  function empezar() {
    st.current = { ronda: 0, puntos: 0, vidas: 3, jugando: true, objetivo: -1 };
    setPuntos(0); setVidas(3); setRonda(0); setJugando(true);
    nuevaRonda();
    sfx.clic();
  }

  useEffect(() => () => clearTimeout(timer.current), []);

  function terminar() {
    st.current.jugando = false;
    setJugando(false);
    clearTimeout(timer.current);
    registrarPunt(st.current.puntos, st.current.ronda >= RONDAS ? 1 : 0);
  }

  function fallar() {
    if (!st.current.jugando) return;
    const nv = st.current.vidas - 1;
    st.current.vidas = nv;
    setVidas(nv);
    sfx.mal();
    if (nv <= 0) terminar();
    else nuevaRonda();
  }

  function tocar(i) {
    if (!st.current.jugando) { empezar(); return; }
    if (i === st.current.objetivo) {
      const gana = 25 + Math.min(75, st.current.ronda * 3);
      st.current.puntos += gana;
      setPuntos(st.current.puntos);
      sfx.clic();
      clearTimeout(timer.current);
      if (st.current.ronda >= RONDAS) { sfx.bien(); terminar(); }
      else nuevaRonda();
    } else {
      fallar();
    }
  }

  return (
    <GameShell titulo="Destello" emoji="✨"
      descripcion="Toca la celda dorada antes de que se apague · 20 rondas · 3 vidas."
      tira="linear-gradient(90deg,#facc15,#ff9a3d,#ff3d5a)" iconoFondo="linear-gradient(135deg,#facc15,#ff9a3d)">
      <div className="fila-botones">
        <span className="chip">Ronda: <b>{ronda}/{RONDAS}</b></span>
        <span className="chip">Puntos: <b>{puntos}</b></span>
        <span className="chip">❤️ <b>{vidas}</b></span>
      </div>
      {!jugando && ronda === 0 && (
        <div className="fila-botones"><button className="btn-principal" onClick={empezar}>▶ Empezar</button></div>
      )}
      { (jugando || ronda > 0) && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,84px)", gap: 8, justifyContent: "center" }}>
          {Array.from({ length: 9 }, (_, i) => (
            <button key={i} onClick={() => tocar(i)} disabled={!jugando}
              style={{ width: 84, height: 84, fontSize: "2rem", borderRadius: 14,
                background: jugando && i === objetivo ? "linear-gradient(135deg,#facc15,#ff9a3d)" : "var(--bg-soft)",
                border: "2px solid var(--border)",
                boxShadow: jugando && i === objetivo ? "0 0 22px rgba(250,204,21,.8)" : "none" }}>
              {jugando && i === objetivo ? "✨" : "·"}
            </button>
          ))}
        </div>
      )}
      <Resultado mensaje={mensaje} tipo={tipo} />
      {!jugando && ronda > 0 && !mensaje && (
        <div className="fila-botones"><button className="btn-principal" onClick={empezar}>↻ Otra vez</button></div>
      )}
    </GameShell>
  );
}
