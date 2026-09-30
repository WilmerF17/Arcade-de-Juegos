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
      stats={[{ icono: "🪙", etiqueta: "Saldo", valor: saldo }, { etiqueta: "Apuesta", valor: apuesta }, ...(dados[0] ? [{ etiqueta: "Dados", valor: `${dados[0]}+${dados[1]}=${dados[0] + dados[1]}` }] : [{ etiqueta: "Dados", valor: "—" }])]}
      resultado={{ mensaje, tipo }}
      ayuda={<div><p><b>Objetivo:</b> sacar pareja con 2 dados.</p><p><b>Apuesta:</b> se descuenta al lanzar. Pareja cobra apuesta×5; suma 7 te devuelve la apuesta.</p><ul><li>Pareja = apuesta×5 · suma 7 = devuelve apuesta · resto = pierdes</li></ul><p><b>Controles:</b> botón Lanzar.</p><p><b>Consejo:</b> la pareja es 6/36: juega pocas rondas seguidas.</p></div>}>
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
