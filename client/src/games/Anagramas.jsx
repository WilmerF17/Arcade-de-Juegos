import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { sfx } from "../suite/sonido";

const PALABRAS = ["gato", "perro", "mesa", "papel", "luna", "flor", "barco", "calle", "tigre", "fuego", "nieve", "queso", "mundo", "selva", "dragon", "pixel", "noche", "puntos", "tecla", "magia", "reino", "juego", "veloz", "trueno"];
function mezcla(p) {
  const a = p.split("");
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  if (a.join("") === p) return mezcla(p);
  return a.join("");
}
export default function Anagramas() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Anagramas");
  const [actual, setActual] = useState(() => PALABRAS[Math.floor(Math.random() * PALABRAS.length)]);
  const [revuelto, setRevuelto] = useState(() => mezcla(actual));
  const [entrada, setEntrada] = useState("");
  const [puntos, setPuntos] = useState(0);
  const [racha, setRacha] = useState(0);
  const [tiempo, setTiempo] = useState(60);
  const [jugando, setJugando] = useState(false);
  const inputRef = useRef(null);
  const st = useRef({ puntos: 0 }); st.current.puntos = puntos;

  function empezar() {
    const p = PALABRAS[Math.floor(Math.random() * PALABRAS.length)];
    setActual(p); setRevuelto(mezcla(p));
    setEntrada(""); setPuntos(0); st.current.puntos = 0;
    setRacha(0); setTiempo(60); setJugando(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  }
  useEffect(() => {
    if (!jugando) return;
    if (tiempo <= 0) {
      setJugando(false);
      registrarPunt(st.current.puntos, st.current.puntos >= 100 ? 1 : 0);
      sfx.record();
      return;
    }
    const id = setTimeout(() => setTiempo(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [jugando, tiempo, registrarPunt]);

  function probar() {
    if (!jugando) return;
    if (entrada.trim().toLowerCase() === actual) {
      const g = 10 + actual.length * 2 + Math.min(20, racha * 2);
      st.current.puntos += g; setPuntos(st.current.puntos);
      setRacha(r => r + 1);
      sfx.bien();
      const p = PALABRAS[Math.floor(Math.random() * PALABRAS.length)];
      setActual(p); setRevuelto(mezcla(p)); setEntrada("");
      inputRef.current?.focus();
    } else {
      setRacha(0);
      st.current.puntos = Math.max(0, st.current.puntos - 3); setPuntos(st.current.puntos);
      sfx.mal();
    }
  }
  return (
    <GameShell titulo="Anagramas" emoji="🔀" descripcion="60s · ordena las letras · racha = bonus.">
      <div className="fila-botones">
        <button className="btn-principal" onClick={empezar}>{jugando ? "Reiniciar" : "▶ Jugar 60s"}</button>
        <span className="chip">Puntos <b>{puntos}</b></span>
        <span className="chip">🔥 <b>×{racha}</b></span>
        <span className="chip">⏱️ <b>{tiempo}s</b></span>
      </div>
      {jugando && (
        <div style={{ textAlign: "center", marginTop: 18 }}>
          <div style={{ fontSize: "2.6rem", fontWeight: 900, letterSpacing: ".2em" }}>{revuelto.toUpperCase()}</div>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 12 }}>
            <input ref={inputRef} type="text" value={entrada} onChange={e => setEntrada(e.target.value)} onKeyDown={e => e.key === "Enter" && probar()} placeholder="..." style={{ width: 200, textAlign: "center", fontSize: "1.2rem" }} autoFocus />
            <button className="btn-principal" onClick={probar}>OK</button>
            <button className="btn-suave" onClick={() => setRevuelto(mezcla(actual))}>🔀</button>
          </div>
        </div>
      )}
      {!jugando && mensaje && <Resultado mensaje={mensaje} tipo={tipo} />}
    </GameShell>
  );
}
