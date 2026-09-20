import { useState } from "react";
import GameShell, { useRegistro } from "../ui/GameShell";
import { cargarBilletera, apostar, cobrar } from "../suite/billetera";
import { sfx } from "../suite/sonido";

const PALOS = ["🪙", "🏆", "⚔️", "🍷"];
const NOMBRE = v => (v === 1 ? "As" : v === 11 ? "Sota" : v === 12 ? "Caballo" : v === 13 ? "Rey" : v);
const VALOR = v => (v >= 10 ? 0 : v === 1 ? 1 : v); // 10,Sota,Caballo,Rey = 0
const APUESTAS = [10, 25, 50, 100, 250];

/* Punto Banco mini: apuesta a Jugador ×2, Banca ×2 o Empate ×9. Mano alta (mod 10) gana. */
export default function PuntoBanco() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Punto Banco");
  const [apuesta, setApuesta] = useState(25);
  const [lado, setLado] = useState("jugador");
  const [manos, setManos] = useState(null);
  const [saldo, setSaldo] = useState(() => cargarBilletera().saldo);
  const [aviso, setAviso] = useState("");

  function carta() {
    const v = 1 + Math.floor(Math.random() * 13);
    return { v, p: PALOS[Math.floor(Math.random() * 4)] };
  }
  function total(m) {
    return m.reduce((s, c) => s + VALOR(c.v), 0) % 10;
  }
  function manoInicial() {
    const m = [carta(), carta()];
    if (total(m) <= 5) m.push(carta());
    return m;
  }

  function repartir() {
    setAviso("");
    const r = apostar(apuesta);
    if (!r.ok) { setAviso(`⛔ ${r.motivo}. Reclama el 🎁 bonus diario.`); sfx.mal(); return; }
    const j = manoInicial(), b = manoInicial();
    setManos({ j, b });
    const tj = total(j), tb = total(b);
    const ganaJ = tj > tb, empate = tj === tb;
    const acierto = (lado === "jugador" && ganaJ) || (lado === "banca" && !ganaJ && !empate) || (lado === "empate" && empate);
    if (acierto) {
      const mult = lado === "empate" ? 9 : 2;
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

  const txt = m => m.map(c => `${NOMBRE(c.v)}${c.p}`).join(" ");

  return (
    <GameShell titulo="Punto Banco" emoji="🃏"
      descripcion="Jugador ×2 · Banca ×2 · Empate ×9 · mano alta en mod 10 gana."
      tira="linear-gradient(90deg,#052e16,#22c55e)" iconoFondo="linear-gradient(135deg,#052e16,#22c55e)">
      <div className="fila-botones" style={{ marginTop: 0 }}>
        <span className="chip">🪙 <b>{saldo}</b></span>
      </div>
      <div className="fila-botones">
        <span className="chip">Apuesta:</span>
        {APUESTAS.map(a => (
          <button key={a} className={apuesta === a ? "btn-principal" : "btn-suave"} onClick={() => setApuesta(a)}>{a}</button>
        ))}
      </div>
      <div className="fila-botones">
        {[["jugador", "🧍 Jugador ×2"], ["banca", "🤖 Banca ×2"], ["empate", "🤝 Empate ×9"]].map(([v, l]) => (
          <button key={v} className={lado === v ? "btn-principal" : "btn-suave"} onClick={() => setLado(v)}>{l}</button>
        ))}
      </div>
      {manos && (
        <div style={{ textAlign: "center" }}>
          <p>🧍 Jugador: <b>{txt(manos.j)}</b> = <b>{total(manos.j)}</b></p>
          <p>🤖 Banca: <b>{txt(manos.b)}</b> = <b>{total(manos.b)}</b></p>
        </div>
      )}
      <div className="fila-botones">
        <button className="btn-exito" onClick={repartir}>🃏 Repartir {apuesta}</button>
      </div>
      {aviso && <p className="aviso info" style={{ textAlign: "center" }}>{aviso}</p>}
      {mensaje && <div className={`mensaje-final ${tipo}`}>{mensaje}</div>}
    </GameShell>
  );
}
