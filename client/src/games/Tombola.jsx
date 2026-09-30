import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { useSaldo, apostarConAviso, cobrarPremio, perderApuesta, SelectorApuesta } from "../suite/apuesta";
import { sfx } from "../suite/sonido";
import { escribiendo } from "../suite/teclado";

const PREMIOS = [0, 0, 0, 2, 6];
const BOMBO_DIF = { 1: 8, 2: 10, 3: 12 };
const NOMBRE_DIF = { 1: "Fácil", 2: "Normal", 3: "Difícil" };

/* Tómbola: elige 3 números. Cada acierto multiplica: 2 → ×2, 3 → ×6. */
export default function Tombola() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Tómbola");
  const saldo = useSaldo();
  const [apuesta, setApuesta] = useState(25);
  const [elegidos, setElegidos] = useState([]);
  const [sorteo, setSorteo] = useState([]);
  const [aviso, setAviso] = useState("");
  const [dif, setDif] = useState(2);
  const jugandoRef = useRef(false);
  jugandoRef.current = sorteo.length === 0 && elegidos.length > 0;

  function toggle(n) {
    if (sorteo.length) return;
    setElegidos(e => e.includes(n) ? e.filter(x => x !== n) : e.length < 3 ? [...e, n] : e);
    sfx.clic();
  }

  function sortear() {
    if (elegidos.length !== 3) { setAviso("⛔ Elige 3 números primero."); sfx.mal(); return; }
    const r = apostarConAviso(apuesta, setAviso);
    if (!r.ok) { sfx.mal(); return; }
    const total = BOMBO_DIF[dif];
    const bombo = Array.from({ length: total }, (_, i) => i).sort(() => Math.random() - 0.5);
    const s = bombo.slice(0, 3);
    setSorteo(s);
    const aciertos = elegidos.filter(n => s.includes(n)).length;
    if (PREMIOS[aciertos] > 0) { sfx.moneda(); sfx.record(); cobrarPremio(apuesta * PREMIOS[aciertos], apuesta, registrarPunt); }
    else { sfx.mal(); perderApuesta(registrarPunt); }
  }

  function limpiar() { setElegidos([]); setSorteo([]); setAviso(""); sfx.clic(); }

  const sortearRef = useRef(sortear);
  sortearRef.current = sortear;
  useEffect(() => {
    const fn = e => {
      if (escribiendo()) return;
      if (e.key === "Enter" && sorteo.length === 0) {
        e.preventDefault();
        sortearRef.current();
      } else if ((e.key === " " || e.key.toLowerCase() === "c") && sorteo.length > 0) {
        e.preventDefault();
        limpiar();
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elegidos, sorteo, apuesta, dif]);

  const aciertos = sorteo.length ? elegidos.filter(n => sorteo.includes(n)).length : 0;
  const pct = Math.round((elegidos.length / 3) * 100);
  const total = BOMBO_DIF[dif];

  return (
    <GameShell titulo="Tómbola" emoji="🎪"
      descripcion={`Elige 3 números del 0 al ${total - 1}: 2 aciertos ×2, pleno ×6.`}
      stats={[{ icono: "🪙", valor: saldo }, { icono: "🎯", etiqueta: "Bombo", valor: `0–${total - 1}` }, { icono: "📝", etiqueta: "Dificultad", valor: NOMBRE_DIF[dif] }, ...(sorteo.length ? [{ etiqueta: "Aciertos", valor: aciertos }] : [{ etiqueta: "Elegidos", valor: `${elegidos.length}/3` }])]}
      resultado={{ mensaje, tipo }}
      acciones={<><button className="btn-principal" onClick={sortear}>🎪 Sortear ({apuesta}) <kbd>ENTER</kbd></button>
        {(elegidos.length > 0 || sorteo.length > 0) && <button className="btn-suave" onClick={limpiar}>Limpiar</button>}</>}
      ayuda={<>
        <span>Elige <b>3 números</b> del bombo y pulsa Sortear: con <b>2 aciertos pagas ×2</b> y con el <b>pleno ×6</b>.</span>
        <span>Controles: clic o dedo en cada número; <kbd>ENTER</kbd> sortea, <kbd>C</kbd> o <kbd>ESPACIO</kbd> limpia tras el sorteo.</span>
        <span>Premios: con 0–1 aciertos pierdes la apuesta. Dificultad: <b>Fácil 0–7</b>, <b>Normal 0–9</b>, <b>Difícil 0–11</b>.</span>
        <span>Consejo: en Difícil el pleno es más raro: ajusta la apuesta al riesgo.</span>
      </>}>
      <div className="fila-botones" role="group" aria-label="Dificultad">
        {[1, 2, 3].map(d => (
          <button key={d} className={dif === d ? "btn-principal" : "btn-suave"} onClick={() => { setDif(d); limpiar(); }}>{d === 1 ? "🟢 Fácil 0–7" : d === 2 ? "🟡 Normal 0–9" : "🔴 Difícil 0–11"}</button>
        ))}
      </div>
      <div className="xp-bar fina" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Números elegidos"><div style={{ width: `${pct}%` }} /></div>
      <SelectorApuesta apuesta={apuesta} setApuesta={setApuesta} />
      <div className="tombola-grid" role="group" aria-label="Tus números">
        {Array.from({ length: total }, (_, n) => (
          <button key={n}
            className={`tombola-num${elegidos.includes(n) ? " sel" : ""}${sorteo.includes(n) ? " salio" : ""}`}
            onClick={() => toggle(n)}>{n}</button>
        ))}
      </div>
      {sorteo.length > 0 && <p style={{ textAlign: "center" }}>🎰 Sorteo: <b>{sorteo.join(" · ")}</b></p>}
      {aviso && <p className="aviso info" style={{ textAlign: "center" }}>{aviso}</p>}
      <Resultado mensaje={mensaje} tipo={tipo} />
    </GameShell>
  );
}
