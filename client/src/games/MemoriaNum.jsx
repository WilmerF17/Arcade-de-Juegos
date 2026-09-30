import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { sfx } from "../suite/sonido";
import { escribiendo } from "../suite/teclado";

const CONF_DIF = { 1: { meta: 7, extra: 800, nombre: "Fácil" }, 2: { meta: 9, extra: 1200, nombre: "Normal" }, 3: { meta: 11, extra: 1600, nombre: "Difícil" } };
function secuencia(n) { return Array.from({ length: n }, () => Math.floor(Math.random() * 10)); }
export default function MemoriaNum() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Memoria Numérica");
  const [seq, setSeq] = useState([]);
  const [fase, setFase] = useState("inicio"); // inicio -> muestra -> escribe -> fin
  const [entrada, setEntrada] = useState("");
  const [nivel, setNivel] = useState(3);
  const [dif, setDif] = useState(2);
  const meta = CONF_DIF[dif].meta;
  const [mejor, setMejor] = useState(() => Number(localStorage.getItem("arcade-memnum") || 0));
  const timer = useRef(null);
  const faseRef = useRef("inicio");
  faseRef.current = fase;

  function empezar(n = 3) {
    sfx.clic();
    clearTimeout(timer.current);
    const s = secuencia(n);
    setSeq(s); setNivel(n); setEntrada(""); setFase("muestra");
    timer.current = setTimeout(() => setFase("escribe"), 1200 + n * 500);
  }
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    const fn = e => {
      if (escribiendo()) return;
      if ((e.key === "Enter" || e.key === " ") && (faseRef.current === "inicio" || faseRef.current === "fin")) {
        e.preventDefault();
        empezar(3);
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dif]);
  function comprobar() {
    const ok = entrada.trim() === seq.join("");
    if (ok) {
      sfx.bien();
      if (nivel > mejor) { setMejor(nivel); try { localStorage.setItem("arcade-memnum", String(nivel)); } catch { /* noop */ } }
      if (nivel >= meta) {
        setFase("fin");
        sfx.record();
        registrarPunt(nivel * 20, 1);
      } else {
        sfx.moneda();
        empezar(nivel + 1);
      }
    } else {
      sfx.mal();
      setFase("fin");
      registrarPunt(Math.max(0, (nivel - 1) * 15), nivel > 4 ? 1 : 0);
    }
  }
  const pct = Math.round(((nivel - 1) / meta) * 100);
  const jugando = fase === "muestra" || fase === "escribe";
  return (
    <GameShell titulo="Memoria Numérica" emoji="🔢" descripcion={`Memoriza la cifra y escríbela · cada nivel +1 dígito · meta ${meta}.`}
      stats={[
        { icono: "📶", etiqueta: "Nivel", valor: `${nivel} dígitos` },
        { icono: "🏆", etiqueta: "Récord", valor: mejor },
        { icono: "🎯", etiqueta: "Dificultad", valor: CONF_DIF[dif].nombre },
      ]}
      acciones={fase === "inicio" || fase === "fin" ? <button className="btn-principal" onClick={() => empezar(3)}>{fase === "inicio" ? "▶ Jugar" : "↻ Reiniciar"}</button> : null}
      ayuda={<>
        <span>Memoriza la cifra mostrada y escríbela igual: cada acierto suma <b>un dígito</b> hasta llegar a la meta.</span>
        <span>Controles: escribe con el teclado y confirma con <kbd>ENTER</kbd> o el botón OK. <kbd>ENTER</kbd> o <kbd>ESPACIO</kbd> empieza.</span>
        <span>Puntuación: cada nivel vale <b>15–20 puntos</b>; llegar a la meta cuenta como victoria. Dificultad: <b>Fácil meta 7</b>, <b>Normal meta 9</b>, <b>Difícil meta 11</b>.</span>
        <span>Consejo: agrupa los dígitos de 2 en 2 para recordarlos mejor.</span>
      </>}>
      {(fase === "inicio" || fase === "fin") && !jugando && (
        <div className="fila-botones" role="group" aria-label="Dificultad">
          {[1, 2, 3].map(d => (
            <button key={d} className={dif === d ? "btn-principal" : "btn-suave"} onClick={() => { setDif(d); sfx.clic(); }}>{d === 1 ? "🟢 Fácil" : d === 2 ? "🟡 Normal" : "🔴 Difícil"}</button>
          ))}
        </div>
      )}
      <div className="xp-bar fina" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Progreso de nivel"><div style={{ width: `${pct}%` }} /></div>
      {fase === "muestra" && (
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <div style={{ fontSize: "3rem", fontWeight: 900, letterSpacing: ".3em" }}>{seq.join("")}</div>
          <p className="aviso info">Memoriza… se oculta enseguida 👀</p>
        </div>
      )}
      {fase === "escribe" && (
        <div style={{ display: "flex", gap: 8, marginTop: 20, justifyContent: "center" }}>
          <input type="text" inputMode="numeric" value={entrada} onChange={e => setEntrada(e.target.value.replace(/\D/g, "").slice(0, 12))} onKeyDown={e => e.key === "Enter" && comprobar()} placeholder={"?".repeat(nivel)} style={{ fontSize: "1.6rem", width: 220, textAlign: "center", letterSpacing: ".2em" }} autoFocus />
          <button className="btn-principal" onClick={() => { sfx.clic(); comprobar(); }}>OK ⏎</button>
        </div>
      )}
      {fase === "fin" && mensaje && <Resultado mensaje={`${mensaje} · llegaste a ${nivel} dígitos.`} tipo={tipo} />}
      {fase === "fin" && !mensaje && <p style={{ textAlign: "center" }}>Llegaste a {nivel} dígitos.</p>}
      {fase === "inicio" && <p className="aviso-ia">💡 Empieza con 3 dígitos y suma uno por acierto.</p>}
    </GameShell>
  );
}
