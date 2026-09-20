import { useState } from "react";
import GameShell, { useRegistro } from "../ui/GameShell";
import { cargarBilletera, apostar, cobrar } from "../suite/billetera";
import { sfx } from "../suite/sonido";

const DADOS = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
const APUESTAS = [10, 25, 50, 100, 250];

/* Siete Alto: dos dados. Alto (8-12) ×2, Bajo (2-6) ×2, Siete exacto ×5. */
export default function SieteAlto() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Siete Alto");
  const [apuesta, setApuesta] = useState(25);
  const [dados, setDados] = useState([]);
  const [saldo, setSaldo] = useState(() => cargarBilletera().saldo);
  const [aviso, setAviso] = useState("");
  const [racha, setRacha] = useState(0);

  function jugar(tipo) {
    setAviso("");
    const r = apostar(apuesta);
    if (!r.ok) { setAviso(`⛔ ${r.motivo}. Reclama el 🎁 bonus diario.`); sfx.mal(); return; }
    const d = [1 + Math.floor(Math.random() * 6), 1 + Math.floor(Math.random() * 6)];
    setDados(d);
    const suma = d[0] + d[1];
    let mult = 0;
    if (tipo === "alto" && suma >= 8) mult = 2;
    if (tipo === "bajo" && suma <= 6) mult = 2;
    if (tipo === "siete" && suma === 7) mult = 5;
    if (mult > 0) {
      const premio = apuesta * mult;
      setSaldo(cobrar(premio));
      const nr = racha + 1;
      setRacha(nr);
      sfx.bien();
      registrarPunt(premio - apuesta, 1);
    } else {
      setSaldo(cargarBilletera().saldo);
      setRacha(0);
      sfx.mal();
      registrarPunt(0, 0);
    }
  }

  return (
    <GameShell titulo="Siete Alto" emoji="🎲"
      descripcion="Apuesta con fichas · Alto/Bajo ×2 · Siete exacto ×5."
      tira="linear-gradient(90deg,#eab308,#dc2626)" iconoFondo="linear-gradient(135deg,#eab308,#dc2626)">
      <div className="fila-botones" style={{ marginTop: 0 }}>
        <span className="chip">🪙 <b>{saldo}</b></span>
        <span className="chip">🔥 <b>{racha}</b></span>
      </div>
      <div className="fila-botones">
        <span className="chip">Apuesta:</span>
        {APUESTAS.map(a => (
          <button key={a} className={apuesta === a ? "btn-principal" : "btn-suave"} onClick={() => setApuesta(a)}>{a}</button>
        ))}
      </div>
      <p style={{ textAlign: "center", fontSize: "3.4rem", margin: "4px 0" }}>
        {dados.length ? `${DADOS[dados[0] - 1]} ${DADOS[dados[1] - 1]} = ${dados[0] + dados[1]}` : "🎲🎲"}
      </p>
      <div className="fila-botones">
        <button className="btn-suave" onClick={() => jugar("bajo")}>📉 Bajo (2-6) ×2</button>
        <button className="btn-principal" onClick={() => jugar("siete")}>🎯 Siete ×5</button>
        <button className="btn-suave" onClick={() => jugar("alto")}>📈 Alto (8-12) ×2</button>
      </div>
      {aviso && <p className="aviso info" style={{ textAlign: "center" }}>{aviso}</p>}
      {mensaje && <div className={`mensaje-final ${tipo}`}>{mensaje}</div>}
    </GameShell>
  );
}
