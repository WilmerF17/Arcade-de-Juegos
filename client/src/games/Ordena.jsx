import { useState } from "react";
import GameShell, { useRegistro } from "../ui/GameShell";
import { sfx } from "../suite/sonido";

/* Ordena Números: toca del menor al mayor. 8 rondas contra el crono. */
export default function Ordena() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Ordena Números");
  const [numeros, setNumeros] = useState([]);
  const [siguiente, setSiguiente] = useState(0);
  const [ronda, setRonda] = useState(0);
  const [errores, setErrores] = useState(0);
  const [inicio, setInicio] = useState(0);
  const [jugando, setJugando] = useState(false);
  const [ordenados, setOrdenados] = useState([]);

  const RONDAS = 8;

  function nuevaRonda() {
    const base = Math.floor(Math.random() * 30) + 1;
    const vals = Array.from({ length: 5 }, () => base + Math.floor(Math.random() * 40));
    const unicos = [...new Set(vals)];
    while (unicos.length < 5) unicos.push(base + 40 + unicos.length);
    const n = unicos.slice(0, 5).sort(() => Math.random() - 0.5);
    setNumeros(n);
    setOrdenados([...n].sort((a, b) => a - b));
    setSiguiente(0);
  }

  function empezar() {
    setRonda(1); setErrores(0); setJugando(true);
    setInicio(Date.now());
    nuevaRonda();
    sfx.clic();
  }

  function tocar(n) {
    if (!jugando) return;
    if (n === ordenados[siguiente]) {
      const ns = siguiente + 1;
      setSiguiente(ns);
      sfx.clic();
      if (ns >= ordenados.length) {
        if (ronda >= RONDAS) {
          const seg = Math.round((Date.now() - inicio) / 1000);
          const puntos = Math.max(50, 1200 - seg * 8 - errores * 30);
          setJugando(false);
          sfx.bien();
          registrarPunt(puntos, errores <= 3 ? 1 : 0);
        } else {
          setRonda(r => r + 1);
          sfx.moneda();
          nuevaRonda();
        }
      }
    } else {
      setErrores(e => e + 1);
      sfx.mal();
    }
  }

  return (
    <GameShell titulo="Ordena Números" emoji="🔢"
      descripcion="Toca del menor al mayor · 8 rondas · los errores restan puntos."
      tira="linear-gradient(90deg,#38bdf8,#a855f7)" iconoFondo="linear-gradient(135deg,#38bdf8,#a855f7)">
      <div className="fila-botones" style={{ marginTop: 0 }}>
        <span className="chip">Ronda: <b>{ronda}/{RONDAS}</b></span>
        <span className="chip">Siguiente: <b>{ordenados[siguiente] ?? "—"}</b></span>
        <span className="chip">❌ <b>{errores}</b></span>
      </div>
      {!jugando && ronda === 0 && (
        <div className="fila-botones"><button className="btn-principal" onClick={empezar}>▶ Empezar</button></div>
      )}
      {jugando && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
          {numeros.map(n => {
            const ya = ordenados.indexOf(n) < siguiente;
            return (
              <button key={n} onClick={() => tocar(n)} disabled={ya}
                className="btn-suave"
                style={{ fontSize: "1.5rem", padding: "16px 20px", minWidth: 76,
                  opacity: ya ? 0.3 : 1, borderColor: n === ordenados[siguiente] ? "var(--exito)" : undefined }}>
                {n}
              </button>
            );
          })}
        </div>
      )}
      {mensaje && <div className={`mensaje-final ${tipo}`}>{mensaje}</div>}
      {!jugando && ronda > 0 && !mensaje && (
        <div className="fila-botones"><button className="btn-principal" onClick={empezar}>↻ Jugar otra vez</button></div>
      )}
    </GameShell>
  );
}
