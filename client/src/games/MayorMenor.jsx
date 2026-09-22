import { useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { sfx } from "../suite/sonido";

const PALOS = ["🪙", "🏆", "⚔️", "🍷"];
const NOMBRES = { 1: "As", 8: "Sota", 9: "Caballo", 10: "Rey" };
const nombre = v => NOMBRES[v] || v;

/* Mayor o Menor: ¿la próxima carta sube o baja? Racha máxima manda. */
export default function MayorMenor() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Mayor o Menor");
  const [actual, setActual] = useState(null);
  const [racha, setRacha] = useState(0);
  const [mejor, setMejor] = useState(0);
  const [vidas, setVidas] = useState(3);
  const [jugando, setJugando] = useState(false);

  function carta() {
    return { v: 1 + Math.floor(Math.random() * 10), p: PALOS[Math.floor(Math.random() * 4)] };
  }

  function empezar() {
    setActual(carta()); setRacha(0); setMejor(0); setVidas(3); setJugando(true);
    sfx.clic();
  }

  function apostar(sube) {
    if (!jugando) return;
    const n = carta();
    const ok = sube ? n.v >= actual.v : n.v <= actual.v;
    if (ok) {
      const nr = racha + 1;
      setRacha(nr);
      setMejor(m => Math.max(m, nr));
      sfx.clic();
    } else {
      const nv = vidas - 1;
      setVidas(nv);
      setRacha(0);
      sfx.mal();
      if (nv <= 0) {
        setJugando(false);
        registrarPunt(mejor * 60, mejor >= 5 ? 1 : 0);
        setActual(n);
        return;
      }
    }
    setActual(n);
  }

  return (
    <GameShell titulo="Mayor o Menor" emoji="🃏"
      descripcion="¿La próxima carta sube o baja? Igual vale · 3 vidas."
      tira="linear-gradient(90deg,#0ea5e9,#a855f7)" iconoFondo="linear-gradient(135deg,#0ea5e9,#a855f7)">
      <div className="fila-botones">
        <span className="chip">🔥 Racha: <b>{racha}</b></span>
        <span className="chip">🏆 Récord: <b>{mejor}</b></span>
        <span className="chip">❤️ <b>{vidas}</b></span>
      </div>
      {!jugando && !actual && (
        <div className="fila-botones"><button className="btn-principal" onClick={empezar}>▶ Empezar</button></div>
      )}
      {actual && (
        <>
          <p style={{ textAlign: "center", fontSize: "3.4rem", margin: "4px 0" }}>{actual.p}<br />{nombre(actual.v)}</p>
          {jugando && (
            <div className="fila-botones">
              <button className="btn-peligro" style={{ padding: "14px 26px", fontSize: "1.2rem" }} onClick={() => apostar(false)}>📉 Menor</button>
              <button className="btn-exito" style={{ padding: "14px 26px", fontSize: "1.2rem" }} onClick={() => apostar(true)}>📈 Mayor</button>
            </div>
          )}
        </>
      )}
      <Resultado mensaje={mensaje} tipo={tipo} />
      {!jugando && actual && !mensaje && (
        <div className="fila-botones"><button className="btn-principal" onClick={empezar}>↻ Otra vez</button></div>
      )}
    </GameShell>
  );
}
