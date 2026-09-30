import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { sfx } from "../suite/sonido";

const PALABRAS = ["gato", "perro", "mesa", "papel", "luna", "flor", "barco", "calle", "tigre", "fuego", "nieve", "queso", "mundo", "selva", "dragon", "pixel", "noche", "puntos", "tecla", "magia", "reino", "juego", "veloz", "trueno"];
const DIFS = { "Fácil": { t: 90 }, "Normal": { t: 60 }, "Difícil": { t: 40 } };
function mezcla(p) {
  const a = p.split("");
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  if (a.join("") === p) return mezcla(p);
  return a.join("");
}
export default function Anagramas() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Anagramas");
  const [dif, setDif] = useState("Normal");
  const totalT = DIFS[dif].t;
  const [actual, setActual] = useState(() => PALABRAS[Math.floor(Math.random() * PALABRAS.length)]);
  const [revuelto, setRevuelto] = useState(() => mezcla(actual));
  const [entrada, setEntrada] = useState("");
  const [puntos, setPuntos] = useState(0);
  const [racha, setRacha] = useState(0);
  const [tiempo, setTiempo] = useState(totalT);
  const [jugando, setJugando] = useState(false);
  const inputRef = useRef(null);
  const st = useRef({ puntos: 0 }); st.current.puntos = puntos;

  function empezar() {
    const p = PALABRAS[Math.floor(Math.random() * PALABRAS.length)];
    setActual(p); setRevuelto(mezcla(p));
    setEntrada(""); setPuntos(0); st.current.puntos = 0;
    setRacha(0); setTiempo(DIFS[dif].t); setJugando(true);
    sfx.clic();
    setTimeout(() => inputRef.current?.focus(), 50);
  }
  function cambiarDif(d) {
    setDif(d);
    if (!jugando) setTiempo(DIFS[d].t);
    sfx.clic();
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

  useEffect(() => {
    const fn = (e) => {
      const tag = (e.target?.tagName || "").toUpperCase();
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if ((e.key === "Enter" || e.key === " ") && !jugando) {
        e.preventDefault();
        empezar();
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }); // eslint-disable-line react-hooks/exhaustive-deps

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
  const pct = Math.max(0, Math.round((tiempo / totalT) * 100));
  return (
    <GameShell titulo="Anagramas" emoji="🔀" descripcion={`${totalT}s · ordena las letras · racha = bonus (${dif}).`}
      stats={[
        { icono: "⭐", etiqueta: "Puntos", valor: puntos },
        { icono: "🔥", etiqueta: "Racha", valor: `×${racha}` },
        { icono: "⏱️", etiqueta: "Tiempo", valor: `${tiempo}s` },
        { icono: "🎚️", etiqueta: "Dificultad", valor: dif },
      ]}
      resultado={{ mensaje, tipo }}
      ayuda={(
        <div>
          <p><b>Reglas:</b> ordena las letras desordenadas y escribe la palabra correcta antes de que acabe el tiempo ({totalT}s).</p>
          <p><b>Controles:</b> escribe con el teclado y pulsa <kbd>Enter</kbd> para probar · botón 🔀 para remezclar · <kbd>Enter</kbd>/<kbd>Espacio</kbd> para empezar fuera de partida.</p>
          <p><b>Puntuación:</b> cada acierto suma 10 más el doble de la longitud y bonus de racha; fallar resta 3. Victoria con 100+ puntos.</p>
          <p><b>Consejo:</b> remezcla cuando no veas nada: cambiar el orden desbloquea la vista.</p>
        </div>
      )}
      acciones={(
        <>
          {["Fácil", "Normal", "Difícil"].map(d => (
            <button key={d} className={dif === d ? "btn-principal" : "btn-suave"} disabled={jugando} onClick={() => cambiarDif(d)}>{d}</button>
          ))}
          <button className="btn-principal" onClick={empezar}>{jugando ? "Reiniciar" : `▶ Jugar ${totalT}s`}</button>
        </>
      )}>
      <div className="xp-bar fina" aria-hidden><div style={{ width: `${pct}%` }} /></div>
      {jugando && (
        <div style={{ textAlign: "center", marginTop: 18 }}>
          <div style={{ fontSize: "2.6rem", fontWeight: 900, letterSpacing: ".2em" }}>{revuelto.toUpperCase()}</div>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 12 }}>
            <input ref={inputRef} type="text" value={entrada} onChange={e => setEntrada(e.target.value)} onKeyDown={e => e.key === "Enter" && probar()} placeholder="..." style={{ width: 200, textAlign: "center", fontSize: "1.2rem" }} autoFocus />
            <button className="btn-principal" onClick={() => { probar(); sfx.clic(); }}>OK</button>
            <button className="btn-suave" onClick={() => { setRevuelto(mezcla(actual)); sfx.clic(); }}>🔀</button>
          </div>
        </div>
      )}
      <Resultado mensaje="" tipo="" />
    </GameShell>
  );
}
