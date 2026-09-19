import { useState } from "react";
import GameShell, { useRegistro } from "../ui/GameShell";
import { sfx } from "../suite/sonido";

/* Motor de adivinanza numérica con rango e intentos configurables. */
function RangoBase({ titulo, emoji, min, max, intentos, tira, iconoFondo }) {
  const { mensaje, tipo, registrarPunt } = useRegistro(titulo);
  const [secreto, setSecreto] = useState(0);
  const [entrada, setEntrada] = useState("");
  const [pista, setPista] = useState("");
  const [restan, setRestan] = useState(intentos);
  const [jugando, setJugando] = useState(false);

  function empezar() {
    setSecreto(min + Math.floor(Math.random() * (max - min + 1)));
    setEntrada(""); setPista(`Entre ${min} y ${max} · ${intentos} intentos`); setRestan(intentos);
    setJugando(true);
    sfx.clic();
  }

  function probar() {
    if (!jugando || entrada.trim() === "") return;
    const v = Number(entrada);
    const nr = restan - 1;
    setRestan(nr);
    if (v === secreto) {
      setJugando(false);
      setPista(`🎉 ¡Era el ${secreto}!`);
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

  return (
    <GameShell titulo={titulo} emoji={emoji}
      descripcion={`Adivina entre ${min} y ${max} con ${intentos} intentos.`}
      tira={tira} iconoFondo={iconoFondo}>
      <div className="fila-botones" style={{ marginTop: 0 }}>
        <span className="chip">Intentos: <b>{restan}</b></span>
      </div>
      {!jugando && restan === intentos && !pista && (
        <div className="fila-botones"><button className="btn-principal" onClick={empezar}>▶ Empezar</button></div>
      )}
      {pista && <p style={{ textAlign: "center" }}>{pista}</p>}
      {jugando && (
        <div className="fila-botones">
          <input type="text" inputMode="numeric" value={entrada} autoFocus
            onChange={e => setEntrada(e.target.value.replace(/[^0-9]/g, ""))}
            onKeyDown={e => { if (e.key === "Enter") probar(); }}
            style={{ fontSize: "1.6rem", width: 130, textAlign: "center" }} />
          <button className="btn-principal" onClick={probar}>Probar ⏎</button>
        </div>
      )}
      {mensaje && <div className={`mensaje-final ${tipo}`}>{mensaje}</div>}
      {!jugando && pista && !mensaje && (
        <div className="fila-botones"><button className="btn-principal" onClick={empezar}>↻ Otra vez</button></div>
      )}
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

/* La Máquina Adivina: piensa un número y la IA lo encuentra con tus pistas. */
export function MaquinaAdivina() {
  const { mensaje, tipo, registrarPunt } = useRegistro("La Máquina Adivina");
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(100);
  const [tiro, setTiro] = useState(null);
  const [intentos, setIntentos] = useState(0);
  const [jugando, setJugando] = useState(false);
  const [fin, setFin] = useState("");

  function empezar() {
    setMin(1); setMax(100); setIntentos(0); setJugando(true); setFin("");
    const t = 50;
    setTiro(t);
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

  return (
    <GameShell titulo="La Máquina Adivina" emoji="🤖"
      descripcion="Piensa un número del 1 al 100 y guía a la IA: más alto, más bajo o ¡igual!"
      tira="linear-gradient(90deg,#22d3ee,#a855f7)" iconoFondo="linear-gradient(135deg,#22d3ee,#a855f7)">
      <div className="fila-botones" style={{ marginTop: 0 }}>
        <span className="chip">Rango: <b>{min}–{max}</b></span>
        <span className="chip">Intentos: <b>{intentos}</b></span>
      </div>
      {!jugando && intentos === 0 && (
        <div className="fila-botones"><button className="btn-principal" onClick={empezar}>▶ Piensa un número…</button></div>
      )}
      {jugando && tiro !== null && (
        <>
          <p style={{ textAlign: "center", fontSize: "3rem", fontWeight: 800 }}>{tiro}</p>
          <p style={{ textAlign: "center", color: "var(--texto-suave)" }}>¿Tu número es…?</p>
          <div className="fila-botones">
            <button className="btn-suave" onClick={() => pista("alto")}>📈 Más alto</button>
            <button className="btn-exito" onClick={() => pista("igual")}>✅ ¡Igual!</button>
            <button className="btn-suave" onClick={() => pista("bajo")}>📉 Más bajo</button>
          </div>
        </>
      )}
      {fin && <p style={{ textAlign: "center" }}>{fin}</p>}
      {mensaje && <div className={`mensaje-final ${tipo}`}>{mensaje}</div>}
      {!jugando && intentos > 0 && !mensaje && (
        <div className="fila-botones"><button className="btn-principal" onClick={empezar}>↻ Otra vez</button></div>
      )}
    </GameShell>
  );
}
