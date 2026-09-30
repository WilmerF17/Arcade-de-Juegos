import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { sfx } from "../suite/sonido";
import { escribiendo } from "../suite/teclado";

/* Motor de cálculo exprés por operación: escribe el resultado. */
const TIEMPOS = { 1: 60, 2: 45, 3: 30 };
const NOMBRE_DIF = { 1: "Fácil", 2: "Normal", 3: "Difícil" };
function CuentaBase({ titulo, emoji, generar, simbolo, tira, iconoFondo }) {
  const { mensaje, tipo, registrarPunt } = useRegistro(titulo);
  const [op, setOp] = useState(null);
  const [entrada, setEntrada] = useState("");
  const [puntos, setPuntos] = useState(0);
  const [racha, setRacha] = useState(0);
  const [mejorRacha, setMejorRacha] = useState(0);
  const [dif, setDif] = useState(2);
  const [tiempo, setTiempo] = useState(TIEMPOS[2]);
  const [jugando, setJugando] = useState(false);
  const st = useRef({ puntos: 0, racha: 0, jugando: false, resp: null });
  const jugandoRef = useRef(false);
  jugandoRef.current = jugando;

  function nueva() {
    const { texto, resp } = generar();
    st.current.resp = resp;
    setOp(texto);
    setEntrada("");
  }

  function empezar() {
    st.current = { puntos: 0, racha: 0, jugando: true, resp: null };
    setPuntos(0); setRacha(0); setMejorRacha(0); setTiempo(TIEMPOS[dif]); setJugando(true);
    nueva();
    sfx.clic();
  }

  function cambiarDif(d) {
    setDif(d);
    sfx.clic();
    if (!jugandoRef.current) setTiempo(TIEMPOS[d]);
  }

  useEffect(() => {
    if (!jugando) return;
    if (tiempo <= 0) {
      st.current.jugando = false;
      setJugando(false);
      registrarPunt(st.current.puntos, st.current.puntos >= 250 ? 1 : 0);
      return;
    }
    const id = setTimeout(() => setTiempo(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [jugando, tiempo]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const fn = e => {
      if (escribiendo()) return;
      if ((e.key === "Enter" || e.key === " ") && !jugandoRef.current) {
        e.preventDefault();
        empezar();
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dif]);

  function comprobar() {
    if (!st.current.jugando || entrada.trim() === "") return;
    if (Number(entrada) === st.current.resp) {
      const nr = st.current.racha + 1;
      st.current.racha = nr;
      st.current.puntos += 10 + Math.min(15, nr);
      setRacha(nr); setPuntos(st.current.puntos);
      setMejorRacha(m => Math.max(m, nr));
      sfx.bien();
    } else {
      st.current.racha = 0;
      st.current.puntos = Math.max(0, st.current.puntos - 5);
      setRacha(0); setPuntos(st.current.puntos);
      sfx.mal();
    }
    nueva();
  }

  const total = TIEMPOS[dif];
  const pct = Math.max(0, Math.round((tiempo / total) * 100));

  return (
    <GameShell titulo={titulo} emoji={emoji}
      descripcion={`${simbolo} · escribe el resultado y ENTER · ${total}s.`}
      tira={tira} iconoFondo={iconoFondo}
      stats={[
        { icono: "⏱", etiqueta: "Tiempo", valor: `${tiempo}s` },
        { icono: "⭐", etiqueta: "Puntos", valor: puntos },
        { icono: "🔥", etiqueta: "Racha", valor: `×${racha}` },
        { icono: "🎯", etiqueta: "Dificultad", valor: NOMBRE_DIF[dif] },
      ]}
      acciones={!jugando ? <button className="btn-principal" onClick={empezar}>▶ Empezar ({total}s)</button> : null}
      ayuda={<>
        <span>Escribe el resultado de cada operación y pulsa <kbd>ENTER</kbd>: acierto suma <b>10 + racha</b> (tope +15), fallo resta <b>5</b> y rompe la racha.</span>
        <span>Controles: escribe con el teclado físico o táctil y confirma con <kbd>ENTER</kbd>; con ratón pulsa ⏎. <kbd>ENTER</kbd> o <kbd>ESPACIO</kbd> también empieza la partida.</span>
        <span>Puntuación: con <b>250+</b> la partida cuenta como victoria. Dificultad: <b>Fácil 60s</b>, <b>Normal 45s</b>, <b>Difícil 30s</b>.</span>
        <span>Consejo: encadena aciertos seguidos para subir el bonus de racha antes de que acabe el tiempo.</span>
      </>}>
      {!jugando && (
        <div className="fila-botones" role="group" aria-label="Dificultad">
          {[1, 2, 3].map(d => (
            <button key={d} className={dif === d ? "btn-principal" : "btn-suave"} onClick={() => cambiarDif(d)}>{d === 1 ? "🟢 Fácil" : d === 2 ? "🟡 Normal" : "🔴 Difícil"}</button>
          ))}
        </div>
      )}
      <div className="xp-bar fina" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Tiempo restante"><div style={{ width: `${pct}%` }} /></div>
      {jugando && (
        <div className="fila-botones">
          <span style={{ fontSize: "2rem", fontWeight: 800 }}>{op} = </span>
          <input type="text" inputMode="numeric" value={entrada} autoFocus
            onChange={e => {
              if (escribiendo() && document.activeElement !== e.target) return;
              setEntrada(e.target.value.replace(/[^0-9-]/g, ""));
            }}
            onKeyDown={e => { if (e.key === "Enter") comprobar(); }}
            style={{ fontSize: "1.6rem", width: 110, textAlign: "center" }} />
          <button className="btn-principal" onClick={() => { sfx.clic(); comprobar(); }}>⏎</button>
        </div>
      )}
      {!jugando && mejorRacha > 0 && <p style={{ textAlign: "center", color: "var(--texto-suave)" }}>🔥 Mejor racha: <b>×{mejorRacha}</b></p>}
      <Resultado mensaje={mensaje} tipo={tipo} />
    </GameShell>
  );
}

const CU = (titulo, emoji, generar, simbolo, tira, iconoFondo) => function Comp() {
  return <CuentaBase titulo={titulo} emoji={emoji} generar={generar} simbolo={simbolo} tira={tira} iconoFondo={iconoFondo} />;
};
const n2 = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

export const SumasVeloces = CU("Sumas Veloces", "➕", () => {
  const a = n2(5, 49), b = n2(5, 49);
  return { texto: `${a} + ${b}`, resp: a + b };
}, "Sumas sin parar", "linear-gradient(135deg,#22c55e,#84cc16)", "linear-gradient(135deg,#22c55e,#84cc16)");

export const RestasVeloces = CU("Restas Veloces", "➖", () => {
  const a = n2(10, 99), b = n2(1, a);
  return { texto: `${a} − ${b}`, resp: a - b };
}, "Restas sin parar", "linear-gradient(135deg,#38bdf8,#6366f1)", "linear-gradient(135deg,#38bdf8,#6366f1)");

export const TablasVeloces = CU("Tablas Veloces", "✖️", () => {
  const a = n2(2, 9), b = n2(2, 9);
  return { texto: `${a} × ${b}`, resp: a * b };
}, "Multiplicaciones sin parar", "linear-gradient(135deg,#f59e0b,#ef4444)", "linear-gradient(135deg,#f59e0b,#ef4444)");

export const DivisionesNetas = CU("Divisiones Netas", "➗", () => {
  const b = n2(2, 9), r = n2(2, 12);
  return { texto: `${b * r} ÷ ${b}`, resp: r };
}, "Divisiones exactas sin parar", "linear-gradient(135deg,#a855f7,#22d3ee)", "linear-gradient(135deg,#a855f7,#22d3ee)");

export const DoblesMitades = CU("Dobles y Mitades", "🔢", () => {
  if (Math.random() < 0.5) {
    const a = n2(5, 60);
    return { texto: `Doble de ${a}`, resp: a * 2 };
  }
  const a = 2 * n2(3, 40);
  return { texto: `Mitad de ${a}`, resp: a / 2 };
}, "Dobles y mitades sin parar", "linear-gradient(135deg,#0ea5e9,#a855f7)", "linear-gradient(135deg,#0ea5e9,#a855f7)");

export const CuentasMezcla = CU("Mezcla Mental", "🧮", () => {
  const t = Math.floor(Math.random() * 3);
  if (t === 0) { const a = n2(5, 49), b = n2(5, 49); return { texto: `${a} + ${b}`, resp: a + b }; }
  if (t === 1) { const a = n2(10, 99), b = n2(1, a); return { texto: `${a} − ${b}`, resp: a - b }; }
  const a = n2(2, 9), b = n2(2, 9);
  return { texto: `${a} × ${b}`, resp: a * b };
}, "Sumas, restas y tablas mezcladas", "linear-gradient(135deg,#ec4899,#f59e0b)", "linear-gradient(135deg,#ec4899,#f59e0b)");
