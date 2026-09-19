import { useEffect, useState } from "react";
import GameShell, { useRegistro } from "../ui/GameShell";
import { sfx } from "../suite/sonido";

// Mini crucigrama 5x5 fijo: filas SOL(0,0H) LUNA(2,0H) PAN(4,0H); columnas SOPA(0,0V) LANA(2,0V)...
// Simplificado: 3 palabras horizontales con pistas, validación por fila.
const FILAS = [
  { pista: "☀️ Astro del día (3)", sol: "SOL" },
  { pista: "🌙 Astro de noche (4)", sol: "LUNA" },
  { pista: "🍞 Alimento básico (3)", sol: "PAN" },
  { pista: "🐱 Mascota que maúlla (4)", sol: "GATO" },
  { pista: "🌊 Grande y salado (3)", sol: "MAR" },
];
export default function Crucigrama() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Crucigrama Mini");
  const [vals, setVals] = useState(FILAS.map(() => ""));
  const [ok, setOk] = useState(FILAS.map(() => null));
  const [fin, setFin] = useState(false);
  const [intentos, setIntentos] = useState(0);

  function comprobar() {
    const res = FILAS.map((f, i) => vals[i].trim().toUpperCase() === f.sol);
    setOk(res);
    setIntentos(i => i + 1);
    if (res.every(Boolean)) {
      setFin(true);
      const pts = Math.max(150 - intentos * 10, 50);
      registrarPunt(pts, 1);
      sfx.record();
    } else sfx.mal();
  }
  return (
    <GameShell titulo="Crucigrama Mini" emoji="📝" descripcion="5 definiciones · ENTER comprueba · sin acentos.">
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
        {FILAS.map((f, i) => (
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
      <div className="fila-botones">
        <button className="btn-principal" onClick={comprobar}>Comprobar (ENTER)</button>
        <button className="btn-suave" onClick={() => { setVals(FILAS.map(() => "")); setOk(FILAS.map(() => null)); setFin(false); }}>Limpiar</button>
        <span className="chip">Intentos <b>{intentos}</b></span>
      </div>
      {fin && <div className={`mensaje-final ${tipo}`}>🎉 ¡Crucigrama completo! {mensaje}</div>}
    </GameShell>
  );
}
