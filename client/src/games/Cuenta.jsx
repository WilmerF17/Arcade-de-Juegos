import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro } from "../ui/GameShell";
import { sfx } from "../suite/sonido";
import { escribiendo } from "../suite/teclado";

/* Motor de cálculo exprés por operación: escribe el resultado. 45 segundos. */
function CuentaBase({ titulo, emoji, generar, simbolo, tira, iconoFondo }) {
  const { mensaje, tipo, registrarPunt } = useRegistro(titulo);
  const [op, setOp] = useState(null);
  const [entrada, setEntrada] = useState("");
  const [puntos, setPuntos] = useState(0);
  const [racha, setRacha] = useState(0);
  const [tiempo, setTiempo] = useState(45);
  const [jugando, setJugando] = useState(false);
  const st = useRef({ puntos: 0, racha: 0, jugando: false, resp: null });

  function nueva() {
    const { texto, resp } = generar();
    st.current.resp = resp;
    setOp(texto);
    setEntrada("");
  }

  function empezar() {
    st.current = { puntos: 0, racha: 0, jugando: true, resp: null };
    setPuntos(0); setRacha(0); setTiempo(45); setJugando(true);
    nueva();
    sfx.clic();
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

  function comprobar() {
    if (!st.current.jugando || entrada.trim() === "") return;
    if (Number(entrada) === st.current.resp) {
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
    nueva();
  }

  return (
    <GameShell titulo={titulo} emoji={emoji}
      descripcion={`${simbolo} · escribe el resultado y ENTER · 45s.`}
      tira={tira} iconoFondo={iconoFondo}>
      <div className="fila-botones" style={{ marginTop: 0 }}>
        <span className="chip">⏱ <b>{tiempo}s</b></span>
        <span className="chip">Puntos: <b>{puntos}</b></span>
        <span className="chip">🔥 <b>{racha}</b></span>
      </div>
      {!jugando && (
        <div className="fila-botones"><button className="btn-principal" onClick={empezar}>▶ Empezar (45s)</button></div>
      )}
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
          <button className="btn-principal" onClick={comprobar}>⏎</button>
        </div>
      )}
      {mensaje && <div className={`mensaje-final ${tipo}`}>{mensaje}</div>}
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
