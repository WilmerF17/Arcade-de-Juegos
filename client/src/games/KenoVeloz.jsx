import { useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { cargarBilletera, apostar, cobrar } from "../suite/billetera";
import { sfx } from "../suite/sonido";

const APUESTAS = [10, 25, 50, 100, 250];
const PAGOS = { 3: 2, 4: 5, 5: 20 };

/* Keno Veloz: elige 5 del 1 al 20, salen 8. 3 aciertos ×2 · 4 ×5 · 5 ×20. */
export default function KenoVeloz() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Keno Veloz");
  const [apuesta, setApuesta] = useState(25);
  const [elegidos, setElegidos] = useState([]);
  const [sorteo, setSorteo] = useState([]);
  const [saldo, setSaldo] = useState(() => cargarBilletera().saldo);
  const [aviso, setAviso] = useState("");

  function toggle(n) {
    if (sorteo.length) return;
    setElegidos(e => (e.includes(n) ? e.filter(x => x !== n) : e.length >= 5 ? e : [...e, n]));
    sfx.clic();
  }

  function sortear() {
    setAviso("");
    if (elegidos.length !== 5) { setAviso("⛔ Elige 5 números primero."); return; }
    const r = apostar(apuesta);
    if (!r.ok) { setAviso(`⛔ ${r.motivo}. Reclama el 🎁 bonus diario.`); sfx.mal(); return; }
    const bombo = Array.from({ length: 20 }, (_, i) => i + 1).sort(() => Math.random() - 0.5).slice(0, 8);
    setSorteo(bombo);
    const aciertos = elegidos.filter(n => bombo.includes(n)).length;
    const mult = PAGOS[aciertos] || 0;
    if (mult > 0) {
      const premio = apuesta * mult;
      setSaldo(cobrar(premio));
      sfx.record();
      registrarPunt(premio - apuesta, 1);
    } else {
      setSaldo(cargarBilletera().saldo);
      sfx.mal();
      registrarPunt(0, 0);
    }
  }

  function limpiar() {
    sfx.clic();
    setElegidos([]); setSorteo([]);
  }

  return (
    <GameShell titulo="Keno Veloz" emoji="🎱"
      descripcion="Elige 5 · salen 8 · 3×2, 4×5, 5×20."
      tira="linear-gradient(90deg,#0f172a,#7c3aed)" iconoFondo="linear-gradient(135deg,#0f172a,#7c3aed)"
      stats={[{ icono: "🪙", etiqueta: "Saldo", valor: saldo }, { etiqueta: "Apuesta", valor: apuesta }, { etiqueta: "Elegidos", valor: `${elegidos.length}/5` }, ...(sorteo.length ? [{ etiqueta: "Aciertos", valor: elegidos.filter(n => sorteo.includes(n)).length }] : [{ etiqueta: "Sorteo", valor: "—" }])]}
      ayuda={<div><p><b>Objetivo:</b> acertar 3+ de tus 5 números entre 8 sorteados del 1 al 20.</p><p><b>Apuesta:</b> se descuenta al sortear; premio = apuesta×mult.</p><ul><li>3 = ×2 · 4 = ×5 · 5 = ×20 · 0-2 = pierdes</li></ul><p><b>Controles:</b> toca 5 números · Sortear · Limpiar.</p><p><b>Consejo:</b> el 5/5 es 1 entre miles: juega por los ×2.</p></div>}>
      <div className="fila-botones">
        <span className="chip">🪙 <b>{saldo}</b></span>
        <span className="chip">Elegidos: <b>{elegidos.length}/5</b></span>
      </div>
      <div className="fila-botones">
        <span className="chip">Apuesta:</span>
        {APUESTAS.map(a => (
          <button key={a} className={apuesta === a ? "btn-principal" : "btn-suave"} onClick={() => setApuesta(a)}>{a}</button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,52px)", gap: 6, justifyContent: "center" }}>
        {Array.from({ length: 20 }, (_, i) => i + 1).map(n => {
          const el = elegidos.includes(n);
          const sal = sorteo.includes(n);
          return (
            <button key={n} onClick={() => toggle(n)}
              style={{ width: 52, height: 52, fontSize: "1.2rem", fontWeight: 800, borderRadius: 10,
                background: el && sal ? "#22c55e" : el ? "var(--bg-hover)" : sal ? "rgba(34,197,94,.3)" : "var(--bg-soft)",
                color: el && sal ? "#052e12" : "var(--texto)", border: "2px solid var(--border)" }}>
              {n}
            </button>
          );
        })}
      </div>
      <div className="fila-botones">
        <button className="btn-exito" onClick={sortear}>🎱 Sortear {apuesta}</button>
        <button className="btn-suave" onClick={limpiar}>Limpiar</button>
      </div>
      {aviso && <p className="aviso info" style={{ textAlign: "center" }}>{aviso}</p>}
      <Resultado mensaje={mensaje} tipo={tipo} />
    </GameShell>
  );
}
