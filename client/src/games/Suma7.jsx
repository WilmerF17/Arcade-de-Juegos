import { useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { useSaldo, apostarConAviso, cobrarPremio, perderApuesta, SelectorApuesta } from "../suite/apuesta";
import { sfx } from "../suite/sonido";

const DADO = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
const OPCIONES = [
  { id: "menor", nombre: "Menor de 7", mult: 2.2 },
  { id: "siete", nombre: "Siete exacto", mult: 4.5 },
  { id: "mayor", nombre: "Mayor de 7", mult: 2.2 },
];

/* Suma 7: apuesta a menor, exacto o mayor de 7 con dos dados. */
export default function Suma7() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Suma 7");
  const saldo = useSaldo();
  const [apuesta, setApuesta] = useState(25);
  const [opcion, setOpcion] = useState("siete");
  const [dados, setDados] = useState([0, 0]);
  const [aviso, setAviso] = useState("");

  function lanzar() {
    const r = apostarConAviso(apuesta, setAviso);
    if (!r.ok) return;
    const d = [1 + Math.floor(Math.random() * 6), 1 + Math.floor(Math.random() * 6)];
    setDados(d);
    const suma = d[0] + d[1];
    const gano = (opcion === "menor" && suma < 7) || (opcion === "siete" && suma === 7) || (opcion === "mayor" && suma > 7);
    if (gano) {
      const mult = OPCIONES.find(o => o.id === opcion).mult;
      cobrarPremio(Math.floor(apuesta * mult), apuesta, registrarPunt);
    } else perderApuesta(registrarPunt);
    sfx.clic();
  }

  return (
    <GameShell titulo="Suma 7" emoji="🎲"
      descripcion="Dos dados: menor de 7 ×2.2, siete exacto ×4.5, mayor de 7 ×2.2."
      stats={[{ icono: "🪙", valor: saldo }, ...(dados[0] ? [{ etiqueta: "Suma", valor: dados[0] + dados[1] }] : [])]}
      resultado={{ mensaje, tipo }}
      ayuda={<span>El 7 sale con 6 de 36 combinaciones: por eso paga <b>×4.5</b>. Menor y mayor tienen la misma probabilidad.</span>}>
      <SelectorApuesta apuesta={apuesta} setApuesta={setApuesta} />
      <div className="fila-botones" role="group" aria-label="Pronóstico">
        {OPCIONES.map(o => (
          <button key={o.id} className={opcion === o.id ? "btn-principal" : "btn-suave"}
            onClick={() => setOpcion(o.id)}>{o.nombre} ×{o.mult}</button>
        ))}
      </div>
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
