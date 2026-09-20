import { useState } from "react";
import GameShell, { useRegistro } from "../ui/GameShell";
import { cargarBilletera, apostar, cobrar } from "../suite/billetera";
import { sfx } from "../suite/sonido";

const APUESTAS = [10, 25, 50, 100, 250];

/* Moneda Racha: cara o cruz ×2 por acierto. Planta y cobra o sigue la racha (máx 5). */
export default function MonedaRacha() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Moneda Racha");
  const [apuesta, setApuesta] = useState(25);
  const [bote, setBote] = useState(0);
  const [racha, setRacha] = useState(0);
  const [moneda, setMoneda] = useState(null);
  const [saldo, setSaldo] = useState(() => cargarBilletera().saldo);
  const [aviso, setAviso] = useState("");

  function empezar(elegida) {
    setAviso("");
    if (bote > 0) return turno(elegida);
    const r = apostar(apuesta);
    if (!r.ok) { setAviso(`⛔ ${r.motivo}. Reclama el 🎁 bonus diario.`); sfx.mal(); return; }
    turno(elegida, apuesta);
  }

  function turno(elegida, base = bote) {
    const sale = Math.random() < 0.5 ? "cara" : "cruz";
    setMoneda(sale);
    if (sale === elegida) {
      const nb = base * 2;
      const nr = racha + 1;
      setBote(nb); setRacha(nr);
      sfx.moneda();
      if (nr >= 5) plantar(nb, nr);
    } else {
      setBote(0); setRacha(0);
      setSaldo(cargarBilletera().saldo);
      sfx.mal();
      registrarPunt(0, 0);
    }
  }

  function plantar(nb = bote, nr = racha) {
    if (nb <= 0) return;
    setSaldo(cobrar(nb));
    setBote(0); setRacha(0);
    sfx.bien();
    registrarPunt(nb - apuesta, 1);
  }

  return (
    <GameShell titulo="Moneda Racha" emoji="🪙"
      descripcion="Cara o cruz ×2 · planta y cobra o arriesga la racha (máx 5)."
      tira="linear-gradient(90deg,#facc15,#eab308)" iconoFondo="linear-gradient(135deg,#facc15,#eab308)">
      <div className="fila-botones" style={{ marginTop: 0 }}>
        <span className="chip">🪙 <b>{saldo}</b></span>
        <span className="chip">💰 Bote: <b>{bote}</b></span>
        <span className="chip">🔥 <b>{racha}/5</b></span>
      </div>
      {bote === 0 && (
        <div className="fila-botones">
          <span className="chip">Apuesta:</span>
          {APUESTAS.map(a => (
            <button key={a} className={apuesta === a ? "btn-principal" : "btn-suave"} onClick={() => setApuesta(a)}>{a}</button>
          ))}
        </div>
      )}
      <p style={{ textAlign: "center", fontSize: "3.4rem", margin: "4px 0" }}>
        {moneda === "cara" ? "🙂" : moneda === "cruz" ? "✖️" : "🪙"}
      </p>
      <div className="fila-botones">
        <button className="btn-principal" onClick={() => empezar("cara")}>🙂 Cara</button>
        <button className="btn-principal" onClick={() => empezar("cruz")}>✖️ Cruz</button>
        {bote > 0 && <button className="btn-exito" onClick={() => plantar()}>💰 Plantar ({bote})</button>}
      </div>
      {aviso && <p className="aviso info" style={{ textAlign: "center" }}>{aviso}</p>}
      {mensaje && <div className={`mensaje-final ${tipo}`}>{mensaje}</div>}
    </GameShell>
  );
}
