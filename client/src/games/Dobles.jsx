import { useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { useSaldo, apostarConAviso, cobrarPremio, perderApuesta, SelectorApuesta } from "../suite/apuesta";
import { cobrar } from "../suite/billetera";
import { sfx } from "../suite/sonido";

const DADO = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

/* Dobles: dos dados. Pareja ×5, suma 7 devuelve, resto pierde. */
export default function Dobles() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Dobles");
  const saldo = useSaldo();
  const [apuesta, setApuesta] = useState(25);
  const [dados, setDados] = useState([0, 0]);
  const [aviso, setAviso] = useState("");

  function lanzar() {
    const r = apostarConAviso(apuesta, setAviso);
    if (!r.ok) return;
    const d = [1 + Math.floor(Math.random() * 6), 1 + Math.floor(Math.random() * 6)];
    setDados(d);
    if (d[0] === d[1]) cobrarPremio(apuesta * 5, apuesta, registrarPunt);
    else if (d[0] + d[1] === 7) { cobrar(apuesta); sfx.bien(); registrarPunt(0, 0); }
    else perderApuesta(registrarPunt);
    sfx.clic();
  }

  return (
    <GameShell titulo="Dobles" emoji="🎲"
      descripcion="Dos dados: pareja ×5, suma 7 devuelve la apuesta, resto pierde."
      stats={[{ icono: "🪙", valor: saldo }]}
      resultado={{ mensaje, tipo }}
      ayuda={<span>Hay 6 parejas en 36 combinaciones: por eso paga <b>×5</b>. El 7 te salva con devolución.</span>}>
      <SelectorApuesta apuesta={apuesta} setApuesta={setApuesta} />
      <p style={{ textAlign: "center", fontSize: "3.4rem", margin: "6px 0" }}>
        {dados[0] ? `${DADO[dados[0] - 1]} ${DADO[dados[1] - 1]}` : "🎲🎲"}
      </p>
      <div className="fila-botones">
        <button className="btn-principal" onClick={lanzar}>🎲 Lanzar ({apuesta})</button>
      </div>
      {aviso && <p className="aviso info" style={{ textAlign: "center" }}>{aviso}</p>}
      <Resultado mensaje={mensaje} tipo={tipo} />
    </GameShell>
  );
}
