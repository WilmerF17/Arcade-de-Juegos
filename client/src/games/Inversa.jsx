import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { sfx } from "../suite/sonido";
import { escribiendo } from "../suite/teclado";

/* Secuencia Inversa: memoriza los dígitos y escríbelos al revés. 3 vidas. */
const CONF_DIF = { 1: { vidas: 4, nombre: "Fácil" }, 2: { vidas: 3, nombre: "Normal" }, 3: { vidas: 2, nombre: "Difícil" } };
export default function Inversa() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Secuencia Inversa");
  const [nivel, setNivel] = useState(3);
  const [secuencia, setSecuencia] = useState([]);
  const [fase, setFase] = useState("inicio"); // inicio | memoriza | escribe | fin
  const [entrada, setEntrada] = useState("");
  const [dif, setDif] = useState(2);
  const [vidas, setVidas] = useState(CONF_DIF[2].vidas);
  const [puntos, setPuntos] = useState(0);
  const [mejorNivel, setMejorNivel] = useState(3);
  const st = useRef({ nivel: 3, vidas: 3, puntos: 0, secuencia: [] });
  const timer = useRef(null);
  const faseRef = useRef("inicio");
  faseRef.current = fase;

  function nuevaSecuencia(n) {
    const s = Array.from({ length: n }, () => Math.floor(Math.random() * 10));
    st.current.secuencia = s;
    setSecuencia(s);
    setFase("memoriza");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setFase("escribe"), 1200 + n * 700);
  }

  function empezar() {
    const v = CONF_DIF[dif].vidas;
    st.current = { nivel: 3, vidas: v, puntos: 0, secuencia: [] };
    setNivel(3); setVidas(v); setPuntos(0); setEntrada("");
    nuevaSecuencia(3);
    sfx.clic();
  }

  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    const fn = e => {
      if (escribiendo()) return;
      if ((e.key === "Enter" || e.key === " ") && (faseRef.current === "inicio" || faseRef.current === "fin")) {
        e.preventDefault();
        empezar();
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dif]);

  function comprobar() {
    const esperado = [...st.current.secuencia].reverse().join("");
    if (entrada.trim() === esperado) {
      const gana = st.current.nivel * 20;
      st.current.puntos += gana;
      const nn = st.current.nivel + 1;
      st.current.nivel = nn;
      setPuntos(st.current.puntos); setNivel(nn); setEntrada("");
      setMejorNivel(m => Math.max(m, nn));
      sfx.bien();
      nuevaSecuencia(nn);
    } else {
      const nv = st.current.vidas - 1;
      st.current.vidas = nv;
      setVidas(nv); setEntrada("");
      sfx.mal();
      if (nv <= 0) {
        setFase("fin");
        registrarPunt(st.current.puntos, st.current.nivel >= 6 ? 1 : 0);
      } else {
        nuevaSecuencia(st.current.nivel);
      }
    }
  }

  const pct = Math.min(100, Math.round(((nivel - 3) / 6) * 100));

  return (
    <GameShell titulo="Secuencia Inversa" emoji="🔄"
      descripcion="Memoriza los dígitos y escríbelos al revés · crece cada nivel."
      tira="linear-gradient(90deg,#a855f7,#22d3ee)" iconoFondo="linear-gradient(135deg,#a855f7,#22d3ee)"
      stats={[
        { icono: "📶", etiqueta: "Nivel", valor: `${nivel} dígitos` },
        { icono: "❤️", etiqueta: "Vidas", valor: vidas },
        { icono: "⭐", etiqueta: "Puntos", valor: puntos },
        { icono: "🎯", etiqueta: "Dificultad", valor: CONF_DIF[dif].nombre },
      ]}
      acciones={fase === "inicio" || fase === "fin" ? <button className="btn-principal" onClick={empezar}>{fase === "inicio" ? "▶ Empezar" : "↻ Jugar otra vez"}</button> : null}
      ayuda={<>
        <span>Memoriza la secuencia y escríbela <b>al revés</b>: cada nivel añade un dígito y suma <b>nivel × 20</b>.</span>
        <span>Controles: escribe con el teclado y confirma con <kbd>ENTER</kbd> o Comprobar. <kbd>ENTER</kbd> o <kbd>ESPACIO</kbd> empieza.</span>
        <span>Puntuación: llegar a <b>nivel 6+</b> cuenta como victoria aunque pierdas las vidas. Dificultad: <b>Fácil 4 vidas</b>, <b>Normal 3</b>, <b>Difícil 2</b>.</span>
        <span>Consejo: lee la secuencia al revés en voz baja mientras la memorizas.</span>
      </>}>
      {fase === "inicio" && (
        <div className="fila-botones" role="group" aria-label="Dificultad">
          {[1, 2, 3].map(d => (
            <button key={d} className={dif === d ? "btn-principal" : "btn-suave"} onClick={() => { setDif(d); setVidas(CONF_DIF[d].vidas); sfx.clic(); }}>{d === 1 ? "🟢 Fácil" : d === 2 ? "🟡 Normal" : "🔴 Difícil"}</button>
          ))}
        </div>
      )}
      <div className="xp-bar fina" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Progreso de nivel"><div style={{ width: `${pct}%` }} /></div>
      {fase === "memoriza" && (
        <p style={{ textAlign: "center", fontSize: "2.2rem", letterSpacing: 8, margin: "14px 0" }}>
          {secuencia.join(" ")}
        </p>
      )}
      {fase === "memoriza" && <p style={{ textAlign: "center", color: "var(--texto-suave)" }}>Memoriza… ahora los escribirás al revés</p>}
      {fase === "escribe" && (
        <div className="fila-botones">
          <input type="text" inputMode="numeric" value={entrada} maxLength={12}
            onChange={e => setEntrada(e.target.value.replace(/\D/g, ""))}
            onKeyDown={e => { if (e.key === "Enter") comprobar(); }}
            placeholder="Al revés…" autoFocus style={{ fontSize: "1.4rem", letterSpacing: 4, textAlign: "center", width: 220 }} />
          <button className="btn-principal" onClick={() => { sfx.clic(); comprobar(); }}>Comprobar ⏎</button>
        </div>
      )}
      {mejorNivel > 3 && fase !== "inicio" && <p style={{ textAlign: "center", color: "var(--texto-suave)" }}>🏆 Mejor nivel: <b>{mejorNivel}</b></p>}
      <Resultado mensaje={mensaje} tipo={tipo} />
    </GameShell>
  );
}
