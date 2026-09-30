import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { sfx } from "../suite/sonido";
import { escribiendo } from "../suite/teclado";

/* Verdad o Reto familiar: gira y cumple. Suma puntos por cada prueba superada. */
const CONF_DIF = { 1: { meta: 6, nombre: "Fácil" }, 2: { meta: 8, nombre: "Normal" }, 3: { meta: 10, nombre: "Difícil" } };
function VoRBase({ titulo, banco, tira, iconoFondo }) {
  const { mensaje, tipo, registrarPunt } = useRegistro(titulo);
  const [reto, setReto] = useState(null);
  const [puntos, setPuntos] = useState(0);
  const [hechos, setHechos] = useState(0);
  const [dif, setDif] = useState(2);
  const META = CONF_DIF[dif].meta;
  const [jugando, setJugando] = useState(false);
  const jugandoRef = useRef(false);
  jugandoRef.current = jugando;
  const cumplirRef = useRef(null);

  function empezar() {
    setPuntos(0); setHechos(0); setJugando(true);
    girar();
    sfx.clic();
  }

  function girar() {
    setReto(banco[Math.floor(Math.random() * banco.length)]);
    sfx.clic();
  }

  function cumplir() {
    if (!jugando) return;
    const np = puntos + 100;
    const nh = hechos + 1;
    setPuntos(np); setHechos(nh);
    sfx.bien();
    if (nh >= META) {
      setJugando(false);
      registrarPunt(np, 1);
    } else girar();
  }
  cumplirRef.current = cumplir;

  useEffect(() => {
    const fn = e => {
      if (escribiendo()) return;
      if ((e.key === "Enter" || e.key === " ") && !jugandoRef.current) {
        e.preventDefault();
        empezar();
        return;
      }
      if (!jugandoRef.current) return;
      const k = e.key.toLowerCase();
      if (k === "c" || e.key === "ArrowRight") cumplirRef.current();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dif, puntos, hechos, jugando]);

  const pct = Math.round((hechos / META) * 100);

  return (
    <GameShell titulo={titulo} emoji="🎉"
      descripcion={`Gira, cumple la prueba y suma · ${META} pruebas = victoria.`}
      tira={tira} iconoFondo={iconoFondo}
      stats={[
        { icono: "🎯", etiqueta: "Pruebas", valor: `${hechos}/${META}` },
        { icono: "⭐", etiqueta: "Puntos", valor: puntos },
        { icono: "🎲", etiqueta: "Dificultad", valor: CONF_DIF[dif].nombre },
      ]}
      acciones={!jugando ? <button className="btn-principal" onClick={empezar}>{hechos > 0 ? "↻ Otra fiesta" : "▶ Empezar la fiesta"}</button> : null}
      ayuda={<>
        <span>Pulsa girar, cumple la <b>verdad o reto</b> en grupo y marca <b>¡Cumplido! (+100)</b>. Completa la meta para ganar.</span>
        <span>Controles: botones o tecla <kbd>C</kbd> para cumplir. <kbd>ENTER</kbd> o <kbd>ESPACIO</kbd> empieza o repite fiesta.</span>
        <span>Puntuación: cada prueba son <b>100 puntos</b>; completar la meta registra victoria. Dificultad: <b>Fácil 6</b>, <b>Normal 8</b>, <b>Difícil 10</b> pruebas.</span>
        <span>Consejo: si una prueba no encaja con el grupo, pásala sin culpa y sigue la fiesta.</span>
      </>}>
      {!jugando && hechos === 0 && (
        <div className="fila-botones" role="group" aria-label="Dificultad">
          {[1, 2, 3].map(d => (
            <button key={d} className={dif === d ? "btn-principal" : "btn-suave"} onClick={() => { setDif(d); sfx.clic(); }}>{d === 1 ? "🟢 Fácil" : d === 2 ? "🟡 Normal" : "🔴 Difícil"}</button>
          ))}
        </div>
      )}
      <div className="xp-bar fina" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Progreso de la fiesta"><div style={{ width: `${pct}%` }} /></div>
      {reto && jugando && (
        <>
          <p style={{ textAlign: "center", fontSize: "1.05rem", background: "var(--bg-soft)", border: "1px solid var(--border)", borderRadius: 12, padding: 16 }}>
            <b>{reto.t}</b><br />{reto.d}
          </p>
          <div className="fila-botones">
            <button className="btn-exito" onClick={cumplir}>✅ ¡Cumplido! +100 <kbd>C</kbd></button>
            <button className="btn-suave" onClick={girar}>⏭ Otra prueba</button>
          </div>
        </>
      )}
      <Resultado mensaje={mensaje} tipo={tipo} />
    </GameShell>
  );
}

const CLASICO = [
  { t: "Verdad: ¿tu comida favorita?", d: "Cuéntala con pelos y señales." },
  { t: "Reto: imita a un animal", d: "El grupo debe adivinar cuál es." },
  { t: "Verdad: ¿tu mejor amigo?", d: "Di por qué es especial." },
  { t: "Reto: canta el estribillo", d: "Canta tu canción favorita." },
  { t: "Verdad: ¿qué quieres ser?", d: "Comparte tu sueño." },
  { t: "Reto: 10 saltos", d: "Salta 10 veces sin parar." },
  { t: "Verdad: ¿tu película favorita?", d: "Cuenta tu escena top." },
  { t: "Reto: cara rara", d: "Pon tu cara más rara 10 segundos." },
  { t: "Verdad: ¿tu lugar soñado?", d: "Describe a dónde viajarías." },
  { t: "Reto: trabalenguas", d: "Di 3 veces: tres tristes tigres." },
  { t: "Verdad: ¿qué te da risa?", d: "Cuéntalo." },
  { t: "Reto: bailecito", d: "Baila 15 segundos." },
];
const KIDS = [
  { t: "Verdad: ¿tu color favorito?", d: "Di por qué te gusta." },
  { t: "Reto: salta como rana", d: "Da 5 saltos de rana." },
  { t: "Verdad: ¿tu animal favorito?", d: "Imítalo también." },
  { t: "Reto: gira como trompo", d: "Gira 5 vueltas." },
  { t: "Verdad: ¿qué merienda te gusta?", d: "Descríbela." },
  { t: "Reto: pon cara de sorpresa", d: "Aguanta 10 segundos." },
  { t: "Verdad: ¿tu juego favorito?", d: "Explica cómo se juega." },
  { t: "Reto: aplaude con los pies", d: "Intenta aplaudir con los pies." },
  { t: "Verdad: ¿qué quieres aprender?", d: "Cuéntalo." },
  { t: "Reto: camina como pingüino", d: "Cruza la habitación." },
  { t: "Verdad: ¿tu canción favorita?", d: "Tararéala." },
  { t: "Reto: 5 sentadillas", d: "Haz 5 sentadillas." },
];

export function VerdadOReto() {
  return <VoRBase titulo="Verdad o Reto" banco={CLASICO} tira="linear-gradient(90deg,#ec4899,#f59e0b)" iconoFondo="linear-gradient(135deg,#ec4899,#f59e0b)" />;
}
export function VerdadORetoKids() {
  return <VoRBase titulo="Verdad o Reto Kids" banco={KIDS} tira="linear-gradient(90deg,#22c55e,#0ea5e9)" iconoFondo="linear-gradient(135deg,#22c55e,#0ea5e9)" />;
}
