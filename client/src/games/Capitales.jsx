import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { escribiendo } from "../suite/teclado";
import { sfx } from "../suite/sonido";

const DATOS = [
  ["Francia", "París"], ["España", "Madrid"], ["Italia", "Roma"], ["Alemania", "Berlín"], ["Portugal", "Lisboa"],
  ["México", "Ciudad de México"], ["Argentina", "Buenos Aires"], ["Japón", "Tokio"], ["China", "Pekín"], ["Egipto", "El Cairo"],
  ["Brasil", "Brasilia"], ["Canadá", "Ottawa"], ["Australia", "Canberra"], ["Rusia", "Moscú"], ["India", "Nueva Delhi"],
  ["Grecia", "Atenas"], ["Turquía", "Ankara"], ["Marruecos", "Rabat"], ["Perú", "Lima"], ["Chile", "Santiago"],
  ["Colombia", "Bogotá"], ["Cuba", "La Habana"], ["Noruega", "Oslo"], ["Suecia", "Estocolmo"], ["Finlandia", "Helsinki"],
];
const CONF_DIF = { 1: { preguntas: 10, tiempo: 90, nombre: "Fácil" }, 2: { preguntas: 15, tiempo: 60, nombre: "Normal" }, 3: { preguntas: 20, tiempo: 40, nombre: "Difícil" } };
function ronda() {
  const [pais, cap] = DATOS[Math.floor(Math.random() * DATOS.length)];
  const falsas = DATOS.filter(d => d[1] !== cap).sort(() => Math.random() - 0.5).slice(0, 3).map(d => d[1]);
  const ops = [...falsas, cap].sort(() => Math.random() - 0.5);
  return { pais, cap, ops };
}
export default function Capitales() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Capitales del Mundo");
  const [r, setR] = useState(ronda);
  const [puntos, setPuntos] = useState(0);
  const [racha, setRacha] = useState(0);
  const [mejorRacha, setMejorRacha] = useState(0);
  const [n, setN] = useState(0);
  const [dif, setDif] = useState(2);
  const meta = CONF_DIF[dif].preguntas;
  const [tiempo, setTiempo] = useState(CONF_DIF[2].tiempo);
  const [jugando, setJugando] = useState(false);
  const st = useRef({ puntos: 0, n: 0, racha: 0 });
  st.current = { puntos, n, racha };
  const jugandoRef = useRef(false);
  jugandoRef.current = jugando;

  function empezar() {
    sfx.clic();
    setR(ronda()); setPuntos(0); st.current.puntos = 0;
    setRacha(0); st.current.racha = 0; setN(0); st.current.n = 0;
    setMejorRacha(0);
    setTiempo(CONF_DIF[dif].tiempo); setJugando(true);
  }
  function cambiarDif(d) {
    sfx.clic();
    setDif(d);
    if (!jugandoRef.current) setTiempo(CONF_DIF[d].tiempo);
  }
  useEffect(() => {
    if (!jugando) return;
    if (tiempo <= 0 || st.current.n >= meta) {
      setJugando(false);
      registrarPunt(st.current.puntos, st.current.puntos >= 100 ? 1 : 0);
      if (st.current.puntos >= 100) sfx.record();
      return;
    }
    const id = setTimeout(() => setTiempo(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [jugando, tiempo, registrarPunt, meta]);
  function elegir(cap) {
    if (!jugando) return;
    const ok = cap === r.cap;
    if (ok) {
      const nr = st.current.racha + 1;
      st.current.racha = nr; setRacha(nr);
      setMejorRacha(m => Math.max(m, nr));
      st.current.puntos += 10 + Math.min(10, nr * 2); setPuntos(st.current.puntos);
      sfx.bien();
    } else {
      st.current.racha = 0; setRacha(0);
      st.current.puntos = Math.max(0, st.current.puntos - 3); setPuntos(st.current.puntos);
      sfx.mal();
    }
    st.current.n += 1; setN(st.current.n);
    setR(ronda());
  }
  const elegirRef = useRef(elegir); elegirRef.current = elegir;
  const empezarRef = useRef(empezar); empezarRef.current = empezar;
  useEffect(() => {
    const fn = e => {
      if (escribiendo()) return;
      if ((e.key === "Enter" || e.key === " ") && !jugandoRef.current) {
        e.preventDefault();
        empezarRef.current();
        return;
      }
      if (!jugandoRef.current) return;
      const k = e.key.toLowerCase();
      const m = { 1: 0, 2: 1, 3: 2, 4: 3, a: 0, b: 1, c: 2, d: 3 };
      if (m[k] != null && r.ops[m[k]]) elegirRef.current(r.ops[m[k]]);
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jugando, r, dif]);
  const pct = Math.round((n / meta) * 100);
  return (
    <GameShell titulo="Capitales del Mundo" emoji="🌍" descripcion={`1-4 o A-D · ${meta} países o ${CONF_DIF[dif].tiempo}s · racha = bonus.`}
      stats={[
        { icono: "📝", etiqueta: "País", valor: `${Math.min(n + 1, meta)}/${meta}` },
        { icono: "⭐", etiqueta: "Puntos", valor: puntos },
        { icono: "🔥", etiqueta: "Racha", valor: `×${racha}` },
        { icono: "⏱", etiqueta: "Tiempo", valor: `${tiempo}s` },
        { icono: "🎯", etiqueta: "Dificultad", valor: CONF_DIF[dif].nombre },
      ]}
      acciones={<button className="btn-principal" onClick={empezar}>{jugando ? "↻ Reiniciar" : mensaje ? "↻ Otra vez" : "▶ Jugar"}</button>}
      ayuda={<>
        <span>Elige la capital correcta de cada país entre <b>4 opciones</b>: acierto suma <b>10 + bonus de racha</b>, fallo resta <b>3</b>.</span>
        <span>Controles: clic o dedo en la opción; teclado <kbd>1</kbd>–<kbd>4</kbd> o <kbd>A</kbd>–<kbd>D</kbd>. <kbd>ENTER</kbd> o <kbd>ESPACIO</kbd> empieza.</span>
        <span>Puntuación: con <b>100+</b> la partida cuenta como victoria. Dificultad: <b>Fácil 10 en 90s</b>, <b>Normal 15 en 60s</b>, <b>Difícil 20 en 40s</b>.</span>
        <span>Consejo: encadena aciertos para que la racha multiplique cada punto.</span>
      </>}>
      {!jugando && n === 0 && (
        <div className="fila-botones" role="group" aria-label="Dificultad">
          {[1, 2, 3].map(d => (
            <button key={d} className={dif === d ? "btn-principal" : "btn-suave"} onClick={() => cambiarDif(d)}>{d === 1 ? "🟢 Fácil" : d === 2 ? "🟡 Normal" : "🔴 Difícil"}</button>
          ))}
        </div>
      )}
      <div className="xp-bar fina" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Progreso"><div style={{ width: `${pct}%` }} /></div>
      {jugando && (
        <div style={{ marginTop: 14 }}>
          <h3 style={{ margin: "6px 0 10px" }}>¿Capital de <b>{r.pais}</b>?</h3>
          {r.ops.map((op, i) => (
            <button key={op} className="trivia-op" onClick={() => elegir(op)}>{String.fromCharCode(65 + i)}) {op} <kbd>{i + 1}</kbd></button>
          ))}
          {mejorRacha >= 3 && <p style={{ textAlign: "center", color: "var(--texto-suave)" }}>🔥 Mejor racha: <b>×{mejorRacha}</b></p>}
        </div>
      )}
      {!jugando && mensaje && <Resultado mensaje={mensaje} tipo={tipo} />}
    </GameShell>
  );
}
