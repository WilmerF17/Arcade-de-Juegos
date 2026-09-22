import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { sfx } from "../suite/sonido";
import { escribiendo } from "../suite/teclado";

/* Par o Impar Relámpago: clasifica números con ←/→ o botones. 30 segundos. */
export default function ParImpar() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Par o Impar Relámpago");
  const [num, setNum] = useState(null);
  const [puntos, setPuntos] = useState(0);
  const [racha, setRacha] = useState(0);
  const [tiempo, setTiempo] = useState(30);
  const [jugando, setJugando] = useState(false);
  const st = useRef({ puntos: 0, racha: 0, jugando: false, num: null });

  function nuevoNumero() {
    const n = 10 + Math.floor(Math.random() * 90);
    st.current.num = n;
    setNum(n);
  }

  function empezar() {
    st.current = { puntos: 0, racha: 0, jugando: true, num: null };
    setPuntos(0); setRacha(0); setTiempo(30); setJugando(true);
    nuevoNumero();
    sfx.clic();
  }

  useEffect(() => {
    if (!jugando) return;
    if (tiempo <= 0) {
      st.current.jugando = false;
      setJugando(false);
      registrarPunt(st.current.puntos, st.current.puntos >= 200 ? 1 : 0);
      return;
    }
    const id = setTimeout(() => setTiempo(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [jugando, tiempo]); // eslint-disable-line react-hooks/exhaustive-deps

  function responder(par) {
    if (!st.current.jugando) return;
    const esPar = st.current.num % 2 === 0;
    if ((par && esPar) || (!par && !esPar)) {
      const nr = st.current.racha + 1;
      st.current.racha = nr;
      st.current.puntos += 10 + Math.min(15, nr);
      setRacha(nr); setPuntos(st.current.puntos);
      sfx.clic();
    } else {
      st.current.racha = 0;
      st.current.puntos = Math.max(0, st.current.puntos - 5);
      setRacha(0); setPuntos(st.current.puntos);
      sfx.mal();
    }
    nuevoNumero();
  }

  const respRef = useRef(responder);
  respRef.current = responder;
  useEffect(() => {
    const fn = e => {
      if (escribiendo() || !st.current.jugando) return;
      if (e.key === "ArrowLeft") respRef.current(true);
      if (e.key === "ArrowRight") respRef.current(false);
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  return (
    <GameShell titulo="Par o Impar Relámpago" emoji="⚡"
      descripcion="← PAR · → IMPAR · 30s · los fallos restan 5."
      tira="linear-gradient(90deg,#facc15,#ff3d5a)" iconoFondo="linear-gradient(135deg,#facc15,#ff3d5a)">
      <div className="fila-botones">
        <span className="chip">⏱ <b>{tiempo}s</b></span>
        <span className="chip">Puntos: <b>{puntos}</b></span>
        <span className="chip">🔥 <b>{racha}</b></span>
      </div>
      {!jugando && (
        <div className="fila-botones"><button className="btn-principal" onClick={empezar}>▶ Empezar (30s)</button></div>
      )}
      {jugando && num !== null && (
        <>
          <p style={{ textAlign: "center", fontSize: "3.4rem", fontWeight: 800, margin: "8px 0" }}>{num}</p>
          <div className="fila-botones">
            <button className="btn-principal" onClick={() => responder(true)}>← PAR</button>
            <button className="btn-suave" onClick={() => responder(false)}>IMPAR →</button>
          </div>
        </>
      )}
      <Resultado mensaje={mensaje} tipo={tipo} />
    </GameShell>
  );
}
