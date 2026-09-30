import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { sfx } from "../suite/sonido";
import { escribiendo } from "../suite/teclado";

const FIGURAS = ["🐓", "😈", "💃", "🤵", "☂️", "🧜", "🪜", "🍾", "🛢️", "🌳", "🍈", "🦸", "🎩", "💀", "🍐", "🚩", "🎻", "🐦", "✋", "🥾", "🌙", "🐦‍⬛", "🥁", "🍤", "🕷️", "⭐", "🌍", "🌵", "🌹", "🔔", "🦌", "☀️"];
const CONF_DIF = { 1: { meta: 6, nombre: "Fácil" }, 2: { meta: 8, nombre: "Normal" }, 3: { meta: 10, nombre: "Difícil" } };

/* Lotería: cantor automático, tu cartón 4×4 y 2 rivales. */
export default function Loteria() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Lotería");
  const [carton, setCarton] = useState([]);
  const [rivales, setRivales] = useState([[], []]);
  const [salidas, setSalidas] = useState([]);
  const [actual, setActual] = useState("");
  const [dif, setDif] = useState(2);
  const META = CONF_DIF[dif].meta;
  const [jugando, setJugando] = useState(false);
  const jugandoRef = useRef(false);
  jugandoRef.current = jugando;
  const cantarRef = useRef(null);

  function empezar() {
    const mazo = [...FIGURAS].sort(() => Math.random() - 0.5);
    setCarton(mazo.slice(0, 16));
    setRivales([mazo.slice(8, 24), mazo.slice(16, 32)]);
    setSalidas([]); setActual(""); setJugando(true);
    sfx.clic();
  }

  function cantar() {
    if (!jugando) return;
    const resto = FIGURAS.filter(f => !salidas.includes(f));
    const f = resto[Math.floor(Math.random() * resto.length)];
    const ns = [...salidas, f];
    setSalidas(ns);
    setActual(f);
    sfx.clic();
    const mias = carton.filter(c => ns.includes(c)).length;
    const r1 = rivales[0].filter(c => ns.includes(c)).length;
    const r2 = rivales[1].filter(c => ns.includes(c)).length;
    if (mias >= META || r1 >= META || r2 >= META) {
      setJugando(false);
      const gano = mias >= META && mias >= r1 && mias >= r2;
      if (gano) { sfx.record(); sfx.moneda(); registrarPunt(400 + mias * 25, 1); }
      else { sfx.mal(); registrarPunt(mias * 25, 0); }
    }
  }
  cantarRef.current = cantar;

  useEffect(() => {
    const fn = e => {
      if (escribiendo()) return;
      if ((e.key === "Enter" || e.key === " ") && !jugandoRef.current) {
        e.preventDefault();
        empezar();
        return;
      }
      if (!jugandoRef.current) return;
      if (e.key === "Enter" || e.key === " " || e.key.toLowerCase() === "c") {
        e.preventDefault();
        cantarRef.current();
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jugando, carton, rivales, salidas, dif]);

  const mias = carton.filter(c => salidas.includes(c)).length;
  const r1n = rivales[0].filter(c => salidas.includes(c)).length;
  const r2n = rivales[1].filter(c => salidas.includes(c)).length;
  const pct = Math.round((mias / META) * 100);

  return (
    <GameShell titulo="Lotería" emoji="🎴"
      descripcion={`El cantor saca figuras · marca ${META} en tu cartón antes que los rivales.`}
      tira="linear-gradient(90deg,#eab308,#ef4444)" iconoFondo="linear-gradient(135deg,#eab308,#ef4444)"
      stats={[
        { icono: "🧍", etiqueta: "Tuyas", valor: `${mias}/${META}` },
        { icono: "🤖", etiqueta: "Rival 1", valor: r1n },
        { icono: "🤖", etiqueta: "Rival 2", valor: r2n },
        { icono: "🎯", etiqueta: "Dificultad", valor: CONF_DIF[dif].nombre },
      ]}
      acciones={!jugando ? <button className="btn-principal" onClick={empezar}>{salidas.length > 0 ? "↻ Otra lotería" : "▶ Repartir cartones"}</button> : <button className="btn-principal" onClick={cantar}>📢 ¡Lotería! Cantar <kbd>ENTER</kbd></button>}
      ayuda={<>
        <span>El cantor saca figuras: marca <b>{META}</b> de tu cartón 4×4 antes que los 2 rivales automáticos.</span>
        <span>Controles: botón Cantar o teclas <kbd>ENTER</kbd>/<kbd>ESPACIO</kbd>/<kbd>C</kbd>. <kbd>ENTER</kbd> también reparte.</span>
        <span>Puntuación: ganar da <b>400 + 25 por figura</b> y victoria; perder da 25 por figura. Dificultad: <b>Fácil 6</b>, <b>Normal 8</b>, <b>Difícil 10</b>.</span>
        <span>Consejo: canta sin pausa: cuantas más figuras salgan, más opciones de remontar.</span>
      </>}>
      {salidas.length === 0 && !jugando && (
        <div className="fila-botones" role="group" aria-label="Dificultad">
          {[1, 2, 3].map(d => (
            <button key={d} className={dif === d ? "btn-principal" : "btn-suave"} onClick={() => { setDif(d); sfx.clic(); }}>{d === 1 ? "🟢 Fácil 6" : d === 2 ? "🟡 Normal 8" : "🔴 Difícil 10"}</button>
          ))}
        </div>
      )}
      <div className="xp-bar fina" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Tu progreso"><div style={{ width: `${Math.min(100, pct)}%` }} /></div>
      {actual && <p style={{ textAlign: "center", fontSize: "3rem", margin: "4px 0" }}>{actual}</p>}
      {carton.length > 0 && (
        <>
          <p style={{ textAlign: "center", color: "var(--texto-suave)" }}>Tu cartón 🧍</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,56px)", gap: 6, justifyContent: "center" }}>
            {carton.map((f, i) => (
              <div key={i} style={{ width: 56, height: 56, fontSize: "1.7rem", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
                background: salidas.includes(f) ? "rgba(34,197,94,.4)" : "var(--bg-soft)", border: "2px solid var(--border)" }}>{f}</div>
            ))}
          </div>
          <p style={{ textAlign: "center", color: "var(--texto-suave)" }}>
            🤖 Rival 1: {r1n} · 🤖 Rival 2: {r2n} · 🎰 Cantadas: {salidas.length}
          </p>
        </>
      )}
      <Resultado mensaje={mensaje} tipo={tipo} />
    </GameShell>
  );
}
