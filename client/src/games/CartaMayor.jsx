import { useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { useSaldo, apostarConAviso, cobrarPremio, perderApuesta, SelectorApuesta } from "../suite/apuesta";
import { cobrar } from "../suite/billetera";
import { sfx } from "../suite/sonido";

const PALOS = ["♠", "♥", "♦", "♣"];
const VALORES = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];

function carta() {
  const v = Math.floor(Math.random() * 13);
  return { txt: VALORES[v] + PALOS[Math.floor(Math.random() * 4)], v };
}

/* Carta Mayor: tu carta contra la de la banca. Gana la más alta ×2, empate devuelve. */
export default function CartaMayor() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Carta Mayor");
  const saldo = useSaldo();
  const [apuesta, setApuesta] = useState(25);
  const [tu, setTu] = useState(null);
  const [banca, setBanca] = useState(null);
  const [aviso, setAviso] = useState("");

  function jugar() {
    const r = apostarConAviso(apuesta, setAviso);
    if (!r.ok) return;
    const a = carta(), b = carta();
    setTu(a); setBanca(b);
    if (a.v > b.v) cobrarPremio(apuesta * 2, apuesta, registrarPunt);
    else if (a.v === b.v) { cobrar(apuesta); sfx.bien(); registrarPunt(0, 0); }
    else perderApuesta(registrarPunt);
  }

  const rojo = t => t && (t.includes("♥") || t.includes("♦"));

  return (
    <GameShell titulo="Carta Mayor" emoji="🂡"
      descripcion="Tu carta contra la banca: la más alta gana ×2, el empate devuelve la apuesta."
      stats={[{ icono: "🪙", valor: saldo }]}
      resultado={{ mensaje, tipo }}
      ayuda={<span>El As es la carta más alta y el 2 la más baja. Sin decisiones: pura suerte.</span>}>
      <SelectorApuesta apuesta={apuesta} setApuesta={setApuesta} />
      <div className="bj-cartas" style={{ justifyContent: "center", margin: "10px 0" }}>
        <span className={`btn-carta${tu && rojo(tu.txt) ? " rojo" : ""}`}>{tu ? tu.txt : "?"}</span>
        <span style={{ alignSelf: "center", fontWeight: 800 }}>VS</span>
        <span className={`btn-carta${banca && rojo(banca.txt) ? " rojo" : ""}`}>{banca ? banca.txt : "?"}</span>
      </div>
      <div className="fila-botones">
        <button className="btn-principal" onClick={jugar}>🂡 Repartir ({apuesta})</button>
      </div>
      {aviso && <p className="aviso info" style={{ textAlign: "center" }}>{aviso}</p>}
      <Resultado mensaje={mensaje} tipo={tipo} />
    </GameShell>
  );
}
