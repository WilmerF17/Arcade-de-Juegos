import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { sfx } from "../suite/sonido";
import { escribiendo } from "../suite/teclado";

/* Motor de adivinanza numérica con rango e intentos configurables. */
const NOMBRE_DIF = { 1: "Fácil", 2: "Normal", 3: "Difícil" };
function RangoBase({ titulo, emoji, min, max, intentos, tira, iconoFondo }) {
  const { mensaje, tipo, registrarPunt } = useRegistro(titulo);
  const [secreto, setSecreto] = useState(0);
  const [entrada, setEntrada] = useState("");
  const [pista, setPista] = useState("");
  const [dif, setDif] = useState(2);
  const bonus = dif === 1 ? 2 : dif === 3 ? -1 : 0;
  const intentosEff = Math.max(3, intentos + bonus);
  const [restan, setRestan] = useState(intentosEff);
  const [usados, setUsados] = useState(0);
  const [jugando, setJugando] = useState(false);
  const jugandoRef = useRef(false);
  jugandoRef.current = jugando;

  function empezar() {
    setSecreto(min + Math.floor(Math.random() * (max - min + 1)));
    setEntrada(""); setPista(`Entre ${min} y ${max} · ${intentosEff} intentos`); setRestan(intentosEff);
    setUsados(0);
    setJugando(true);
    sfx.clic();
  }

  function cambiarDif(d) {
    setDif(d);
    sfx.clic();
  }

  useEffect(() => {
    if (dif === 1) setRestan(r => r);
  }, [dif]);

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
  }, [dif, min, max, intentos]);

  function probar() {
    if (!jugando || entrada.trim() === "") return;
    const v = Number(entrada);
    const nr = restan - 1;
    setRestan(nr);
    setUsados(u => u + 1);
    if (v === secreto) {
      setJugando(false);
      setPista(`🎉 ¡Era el ${secreto}!`);
      sfx.bien();
      sfx.record();
      registrarPunt(200 + nr * 50, 1);
    } else if (nr <= 0) {
      setJugando(false);
      setPista(`😅 Era el ${secreto}. ¡Otra vez!`);
      sfx.mal();
      registrarPunt(20, 0);
    } else {
      setPista(v < secreto ? `📈 Más alto… (${nr} intentos)` : `📉 Más bajo… (${nr} intentos)`);
      sfx.clic();
    }
    setEntrada("");
  }

  const pct = Math.round(((intentosEff - restan) / intentosEff) * 100);

  return (
    <GameShell titulo={titulo} emoji={emoji}
      descripcion={`Adivina entre ${min} y ${max} con ${intentosEff} intentos.`}
      tira={tira} iconoFondo={iconoFondo}
      stats={[
        { icono: "🎯", etiqueta: "Intentos", valor: `${restan}/${intentosEff}` },
        { icono: "🔢", etiqueta: "Rango", valor: `${min}–${max}` },
        { icono: "📝", etiqueta: "Dificultad", valor: NOMBRE_DIF[dif] },
      ]}
      acciones={!jugando ? <button className="btn-principal" onClick={empezar}>▶ Empezar</button> : null}
      ayuda={<>
        <span>Adivina el número secreto entre <b>{min}</b> y <b>{max}</b>: tras cada intento te dicen si es más alto o más bajo.</span>
        <span>Controles: escribe el número y pulsa <kbd>ENTER</kbd> o el botón Probar; <kbd>ENTER</kbd> o <kbd>ESPACIO</kbd> empieza cuando no juegas.</span>
        <span>Puntuación: acertar da <b>200 + 50 por intento sobrante</b> y cuenta como victoria; fallar todo da 20. Dificultad: <b>Fácil +2 intentos</b>, <b>Normal base</b>, <b>Difícil −1 intento</b>.</span>
        <span>Consejo: empieza por la mitad del rango y parte por la mitad en cada pista.</span>
      </>}>
      {!jugando && !pista && (
        <div className="fila-botones" role="group" aria-label="Dificultad">
          {[1, 2, 3].map(d => (
            <button key={d} className={dif === d ? "btn-principal" : "btn-suave"} onClick={() => cambiarDif(d)}>{d === 1 ? "🟢 Fácil" : d === 2 ? "🟡 Normal" : "🔴 Difícil"}</button>
          ))}
        </div>
      )}
      <div className="xp-bar fina" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Progreso de intentos"><div style={{ width: `${pct}%` }} /></div>
      {pista && <p style={{ textAlign: "center" }}>{pista}</p>}
      {jugando && (
        <div className="fila-botones">
          <input type="text" inputMode="numeric" value={entrada} autoFocus
            onChange={e => setEntrada(e.target.value.replace(/[^0-9]/g, ""))}
            onKeyDown={e => { if (e.key === "Enter") probar(); }}
            style={{ fontSize: "1.6rem", width: 130, textAlign: "center" }} />
          <button className="btn-principal" onClick={() => { sfx.clic(); probar(); }}>Probar ⏎</button>
        </div>
      )}
      <Resultado mensaje={mensaje} tipo={tipo} />
    </GameShell>
  );
}

const RG = (titulo, emoji, min, max, intentos, tira, iconoFondo) => function Comp() {
  return <RangoBase titulo={titulo} emoji={emoji} min={min} max={max} intentos={intentos} tira={tira} iconoFondo={iconoFondo} />;
};

export const Adivina50 = RG("Adivina el 50", "🔢", 1, 50, 6,
  "linear-gradient(135deg,#06b6d4,#3b82f6)", "linear-gradient(135deg,#06b6d4,#3b82f6)");
export const Adivina1000 = RG("Adivina el 1000", "🎯", 1, 1000, 10,
  "linear-gradient(135deg,#7c3aed,#22d3ee)", "linear-gradient(135deg,#7c3aed,#22d3ee)");
export const AdivinaExpres = RG("Adivina Exprés", "⚡", 1, 100, 5,
  "linear-gradient(135deg,#facc15,#ff3d5a)", "linear-gradient(135deg,#facc15,#ff3d5a)");

const RANGOS_MAQ = { 1: 50, 2: 100, 3: 200 };
/* La Máquina Adivina: piensa un número y la IA lo encuentra con tus pistas. */
export function MaquinaAdivina() {
  const { mensaje, tipo, registrarPunt } = useRegistro("La Máquina Adivina");
  const [dif, setDif] = useState(2);
  const rangoMax = RANGOS_MAQ[dif];
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(100);
  const [tiro, setTiro] = useState(null);
  const [intentos, setIntentos] = useState(0);
  const [jugando, setJugando] = useState(false);
  const [fin, setFin] = useState("");
  const jugandoRef = useRef(false);
  jugandoRef.current = jugando;

  function empezar() {
    setMin(1); setMax(rangoMax); setIntentos(0); setJugando(true); setFin("");
    setTiro(Math.floor((1 + rangoMax) / 2));
    sfx.clic();
  }

  function pista(dir) {
    if (!jugando) return;
    let nmin = min, nmax = max;
    if (dir === "alto") nmin = tiro + 1;
    if (dir === "bajo") nmax = tiro - 1;
    const ni = intentos + 1;
    setIntentos(ni);
    if (dir === "igual") {
      setJugando(false);
      setFin(`🤖 ¡Lo adiviné en ${ni} intentos!`);
      sfx.bien();
      sfx.record();
      registrarPunt(Math.max(50, 400 - ni * 30), 1);
      return;
    }
    if (nmin > nmax) {
      setJugando(false);
      setFin("🤨 ¡Me engañaste! Eso es imposible.");
      sfx.mal();
      registrarPunt(10, 0);
      return;
    }
    setMin(nmin); setMax(nmax);
    setTiro(Math.floor((nmin + nmax) / 2));
    sfx.clic();
  }

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
      if (k === "a" || e.key === "ArrowUp") pista("alto");
      else if (k === "b" || e.key === "ArrowDown") pista("bajo");
      else if (k === "c" || e.key === "Enter") pista("igual");
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dif, min, max, tiro, intentos, jugando]);

  const pct = Math.min(100, Math.round((intentos / 10) * 100));

  return (
    <GameShell titulo="La Máquina Adivina" emoji="🤖"
      descripcion={`Piensa un número del 1 al ${rangoMax} y guía a la IA: más alto, más bajo o ¡igual!`}
      tira="linear-gradient(90deg,#22d3ee,#a855f7)" iconoFondo="linear-gradient(135deg,#22d3ee,#a855f7)"
      stats={[
        { icono: "🎯", etiqueta: "Rango", valor: `${min}–${max}` },
        { icono: "🔢", etiqueta: "Intentos", valor: intentos },
        { icono: "📝", etiqueta: "Dificultad", valor: dif === 1 ? "Fácil 1–50" : dif === 2 ? "Normal 1–100" : "Difícil 1–200" },
      ]}
      acciones={!jugando ? <button className="btn-principal" onClick={empezar}>▶ Piensa un número…</button> : null}
      ayuda={<>
        <span>Piensa un número y responde a cada tiro de la IA con <b>más alto</b>, <b>más bajo</b> o <b>igual</b>. La IA parte por la mitad.</span>
        <span>Controles: botones o teclas <kbd>A</kbd> alto, <kbd>B</kbd> bajo, <kbd>C</kbd> igual; <kbd>ENTER</kbd> empieza.</span>
        <span>Puntuación: acertar en pocos intentos da hasta <b>400 puntos</b> y victoria; engañar a la IA da 10.</span>
        <span>Consejo: no cambies tu número a mitad de partida o la IA lo detectará.</span>
      </>}>
      {!jugando && intentos === 0 && (
        <div className="fila-botones" role="group" aria-label="Dificultad">
          {[1, 2, 3].map(d => (
            <button key={d} className={dif === d ? "btn-principal" : "btn-suave"} onClick={() => { setDif(d); sfx.clic(); }}>{d === 1 ? "🟢 Fácil 1–50" : d === 2 ? "🟡 Normal 1–100" : "🔴 Difícil 1–200"}</button>
          ))}
        </div>
      )}
      <div className="xp-bar fina" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Intentos usados"><div style={{ width: `${pct}%` }} /></div>
      {jugando && tiro !== null && (
        <>
          <p style={{ textAlign: "center", fontSize: "3rem", fontWeight: 800 }}>{tiro}</p>
          <p style={{ textAlign: "center", color: "var(--texto-suave)" }}>¿Tu número es…?</p>
          <div className="fila-botones">
            <button className="btn-suave" onClick={() => pista("alto")}>📈 Más alto <kbd>A</kbd></button>
            <button className="btn-exito" onClick={() => pista("igual")}>✅ ¡Igual! <kbd>C</kbd></button>
            <button className="btn-suave" onClick={() => pista("bajo")}>📉 Más bajo <kbd>B</kbd></button>
          </div>
        </>
      )}
      {fin && <p style={{ textAlign: "center" }}>{fin}</p>}
      <Resultado mensaje={mensaje} tipo={tipo} />
    </GameShell>
  );
}
