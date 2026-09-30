import { useEffect, useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { sfx } from "../suite/sonido";

// Mini crucigrama fijo: 5 definiciones con validación por fila.
const FILAS = [
  { pista: "☀️ Astro del día (3)", sol: "SOL" },
  { pista: "🌙 Astro de noche (4)", sol: "LUNA" },
  { pista: "🍞 Alimento básico (3)", sol: "PAN" },
  { pista: "🐱 Mascota que maúlla (4)", sol: "GATO" },
  { pista: "🌊 Grande y salado (3)", sol: "MAR" },
];
const DIFS = { "Fácil": { n: 3 }, "Normal": { n: 4 }, "Difícil": { n: 5 } };
export default function Crucigrama() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Crucigrama Mini");
  const [dif, setDif] = useState("Normal");
  const total = DIFS[dif].n;
  const filas = FILAS.slice(0, total);
  const [vals, setVals] = useState(FILAS.map(() => ""));
  const [ok, setOk] = useState(FILAS.map(() => null));
  const [fin, setFin] = useState(false);
  const [intentos, setIntentos] = useState(0);

  function cambiarDif(d) {
    setDif(d);
    setVals(FILAS.map(() => ""));
    setOk(FILAS.map(() => null));
    setFin(false);
    sfx.clic();
  }

  function comprobar() {
    const res = FILAS.map((f, i) => (i < total ? vals[i].trim().toUpperCase() === f.sol : true));
    setOk(res);
    setIntentos(i => i + 1);
    if (res.every(Boolean)) {
      setFin(true);
      const pts = Math.max(150 - intentos * 10, 50) + (dif === "Difícil" ? 20 : 0);
      registrarPunt(pts, 1);
      sfx.record();
    } else sfx.mal();
  }
  function limpiar() {
    setVals(FILAS.map(() => "")); setOk(FILAS.map(() => null)); setFin(false);
    sfx.clic();
  }
  const bien = ok.filter((v, i) => i < total && v === true).length;
  const pct = total ? Math.round((bien / total) * 100) : 0;

  useEffect(() => {
    const fn = (e) => {
      const tag = (e.target?.tagName || "").toUpperCase();
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if ((e.key === "Enter" || e.key === " ") && fin) {
        e.preventDefault();
        limpiar();
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <GameShell titulo="Crucigrama Mini" emoji="📝" descripcion={`${total} definiciones · ENTER comprueba · sin acentos (${dif}).`}
      stats={[
        { icono: "✅", etiqueta: "Bien", valor: `${bien}/${total}` },
        { icono: "🎯", etiqueta: "Intentos", valor: intentos },
        { icono: "⭐", etiqueta: "Puntos+", valor: dif === "Difícil" ? "+20" : "+0" },
        { icono: "🎚️", etiqueta: "Dificultad", valor: dif },
      ]}
      resultado={{ mensaje, tipo }}
      ayuda={(
        <div>
          <p><b>Reglas:</b> resuelve las {total} definiciones escribiendo cada palabra sin acentos y pulsa Comprobar.</p>
          <p><b>Controles:</b> escribe con el teclado en cada casilla · <kbd>Enter</kbd> comprueba, <kbd>Tab</kbd> salta de palabra.</p>
          <p><b>Puntuación:</b> 150 menos 10 por intento previo (mínimo 50), +20 extra en Difícil. Completar es victoria.</p>
          <p><b>Consejo:</b> resuelve primero las cortas de 3 letras: te dan letras para las largas.</p>
        </div>
      )}
      acciones={(
        <>
          {["Fácil", "Normal", "Difícil"].map(d => (
            <button key={d} className={dif === d ? "btn-principal" : "btn-suave"} onClick={() => cambiarDif(d)}>{d}</button>
          ))}
          <button className="btn-principal" onClick={comprobar}>Comprobar (ENTER)</button>
          <button className="btn-suave" onClick={limpiar}>Limpiar</button>
        </>
      )}>
      <div className="xp-bar fina" aria-hidden><div style={{ width: `${pct}%` }} /></div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
        {filas.map((f, i) => (
          <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ minWidth: 220, color: "var(--texto-suave)" }}>{i + 1}. {f.pista}</span>
            <input type="text" value={vals[i]} maxLength={4}
              onChange={e => setVals(v => v.map((x, k) => (k === i ? e.target.value.toUpperCase().replace(/[^A-ZÑ]/g, "") : x)))}
              onKeyDown={e => e.key === "Enter" && comprobar()}
              style={{ width: 110, textTransform: "uppercase", borderColor: ok[i] === true ? "var(--exito)" : ok[i] === false ? "var(--peligro)" : undefined }} />
            <span>{ok[i] === true ? "✅" : ok[i] === false ? "❌" : ""}</span>
          </div>
        ))}
      </div>
      <Resultado mensaje="" tipo="" />
    </GameShell>
  );
}
