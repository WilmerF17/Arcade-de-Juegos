import { useState } from "react";
import GameShell, { useRegistro } from "../ui/GameShell";
import { sfx, nota } from "../suite/sonido";

const NIVELES = [
  { nombre: "Grave", freq: 220 },
  { nombre: "Medio", freq: 440 },
  { nombre: "Agudo", freq: 660 },
];

/* Oído Fino: escucha el tono y adivina si es grave, medio o agudo. 12 rondas, 3 vidas. */
export default function OidoFino() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Oído Fino");
  const [ronda, setRonda] = useState(0);
  const [puntos, setPuntos] = useState(0);
  const [vidas, setVidas] = useState(3);
  const [objetivo, setObjetivo] = useState(0);
  const [jugando, setJugando] = useState(false);

  const RONDAS = 12;

  function nuevaRonda(nr) {
    const o = Math.floor(Math.random() * 3);
    setObjetivo(o);
    setRonda(nr);
    setTimeout(() => nota(NIVELES[o].freq), 350);
  }

  function empezar() {
    setPuntos(0); setVidas(3); setJugando(true);
    nuevaRonda(1);
    sfx.clic();
  }

  function repetir() {
    if (jugando) nota(NIVELES[objetivo].freq);
  }

  function elegir(i) {
    if (!jugando) return;
    if (i === objetivo) {
      const np = puntos + 100;
      setPuntos(np);
      sfx.bien();
      if (ronda >= RONDAS) {
        setJugando(false);
        registrarPunt(np, 1);
      } else {
        nuevaRonda(ronda + 1);
      }
    } else {
      const nv = vidas - 1;
      setVidas(nv);
      sfx.mal();
      if (nv <= 0) {
        setJugando(false);
        registrarPunt(puntos, 0);
      } else {
        nuevaRonda(ronda);
      }
    }
  }

  return (
    <GameShell titulo="Oído Fino" emoji="👂"
      descripcion="Escucha el tono: ¿grave, medio o agudo? · 12 rondas · 3 vidas."
      tira="linear-gradient(90deg,#38bdf8,#a855f7)" iconoFondo="linear-gradient(135deg,#38bdf8,#a855f7)">
      <div className="fila-botones" style={{ marginTop: 0 }}>
        <span className="chip">Ronda: <b>{ronda}/{RONDAS}</b></span>
        <span className="chip">Puntos: <b>{puntos}</b></span>
        <span className="chip">❤️ <b>{vidas}</b></span>
      </div>
      {!jugando && ronda === 0 && (
        <div className="fila-botones"><button className="btn-principal" onClick={empezar}>▶ Empezar (con sonido 🔊)</button></div>
      )}
      {ronda > 0 && jugando && (
        <>
          <div className="fila-botones">
            <button className="btn-principal" style={{ fontSize: "2rem", padding: "16px 40px" }} onClick={repetir}>🔊 Escuchar</button>
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            {NIVELES.map((n, i) => (
              <button key={n.nombre} className="btn-suave" style={{ fontSize: "1.1rem", padding: "14px 18px" }} onClick={() => elegir(i)}>
                {["🐻", "🧑", "🐭"][i]} {n.nombre}
              </button>
            ))}
          </div>
        </>
      )}
      {mensaje && <div className={`mensaje-final ${tipo}`}>{mensaje}</div>}
      {!jugando && ronda > 0 && !mensaje && (
        <div className="fila-botones"><button className="btn-principal" onClick={empezar}>↻ Otra vez</button></div>
      )}
    </GameShell>
  );
}
