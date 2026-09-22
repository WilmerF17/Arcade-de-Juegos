import { useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { useSaldo, apostarConAviso, cobrarPremio, perderApuesta, SelectorApuesta } from "../suite/apuesta";
import { cobrar } from "../suite/billetera";
import { sfx } from "../suite/sonido";

const PALOS = ["♠", "♥", "♦", "♣"];
function naipe() {
  const v = 1 + Math.floor(Math.random() * 10);
  return { txt: `${v}${PALOS[Math.floor(Math.random() * 4)]}`, v };
}
const total = mano => mano.reduce((s, c) => s + c.v, 0);

/* Quince: suma lo más cercano a 15 sin pasarte y supera a la banca. Pide o planta ×2, empate devuelve. */
export default function Quince() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Quince");
  const saldo = useSaldo();
  const [apuesta, setApuesta] = useState(25);
  const [mano, setMano] = useState([]);
  const [banca, setBanca] = useState([]);
  const [terminado, setTerminado] = useState(false);
  const [aviso, setAviso] = useState("");

  function repartir() {
    const r = apostarConAviso(apuesta, setAviso);
    if (!r.ok) return;
    const m = [naipe(), naipe()];
    setMano(m); setBanca([naipe(), naipe()]);
    setTerminado(false);
    sfx.clic();
    if (total(m) === 15) cerrar(m, [naipe(), naipe()]);
  }

  function cerrar(m, b) {
    let bancaFinal = [...b];
    while (total(bancaFinal) < 13) bancaFinal.push(naipe());
    setBanca(bancaFinal);
    const vj = total(m), vb = total(bancaFinal);
    const pj = vj > 15, pb = vb > 15;
    setTerminado(true);
    if (!pj && (pb || 15 - vj < 15 - vb)) cobrarPremio(apuesta * 2, apuesta, registrarPunt);
    else if (!pj && !pb && vj === vb) { cobrar(apuesta); sfx.bien(); registrarPunt(0, 0); }
    else perderApuesta(registrarPunt);
  }

  function pedir() {
    if (terminado || !mano.length) return;
    const m = [...mano, naipe()];
    setMano(m);
    sfx.clic();
    if (total(m) > 15) cerrar(m, banca);
  }

  function plantar() {
    if (terminado || !mano.length) return;
    cerrar(mano, banca);
  }

  const rojo = t => t.includes("♥") || t.includes("♦");

  return (
    <GameShell titulo="Quince" emoji="🃏"
      descripcion="Cartas del 1 al 10: quédate lo más cerca del 15 sin pasarte y supera a la banca ×2."
      stats={[{ icono: "🪙", valor: saldo }]}
      resultado={{ mensaje, tipo }}
      ayuda={<span>La banca pide hasta <b>13</b>. Si te pasas de 15 pierdes al instante. El empate <b>devuelve</b> la apuesta.</span>}>
      <SelectorApuesta apuesta={apuesta} setApuesta={setApuesta} />
      <div className="fila-botones">
        <button className="btn-principal" onClick={repartir}>🃏 Repartir ({apuesta})</button>
        {mano.length > 0 && !terminado && <>
          <button className="btn-exito" onClick={pedir}>Pedir</button>
          <button className="btn-suave" onClick={plantar}>Plantarme ({total(mano)})</button>
        </>}
      </div>
      {mano.length > 0 && (
        <div className="bj-mesa">
          <div className="bj-zona">
            <p className="bj-zona-titulo">🧑 Tú <span className="bj-total">{total(mano)}</span></p>
            <div className="bj-cartas">
              {mano.map((c, i) => <span key={i} className={`btn-carta${rojo(c.txt) ? " rojo" : ""}`}>{c.txt}</span>)}
            </div>
          </div>
          <div className="bj-zona">
            <p className="bj-zona-titulo">🖥️ Banca <span className="bj-total">{terminado ? total(banca) : "?"}</span></p>
            <div className="bj-cartas">
              {banca.map((c, i) => (
                <span key={i} className={`btn-carta${!terminado && i > 0 ? " oculta" : rojo(c.txt) ? " rojo" : ""}`}>
                  {!terminado && i > 0 ? "?" : c.txt}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
      {aviso && <p className="aviso info" style={{ textAlign: "center" }}>{aviso}</p>}
      <Resultado mensaje={mensaje} tipo={tipo} />
    </GameShell>
  );
}
