import { useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { useSaldo, apostarConAviso, cobrarPremio, perderApuesta, SelectorApuesta } from "../suite/apuesta";
import { sfx } from "../suite/sonido";

const DADO = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
const METAS = [5, 7, 9, 10, 11];

/* Escalera Millonaria: supera 5 peldaños tirando 2 dados (suma ≥ meta). Cada peldaño ×1.4. Cobra cuando quieras. */
export default function EscaleraOro() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Escalera Millonaria");
  const saldo = useSaldo();
  const [apuesta, setApuesta] = useState(25);
  const [peldano, setPeldano] = useState(0);
  const [enJuego, setEnJuego] = useState(false);
  const [dados, setDados] = useState([0, 0]);
  const [aviso, setAviso] = useState("");

  const mult = Math.pow(1.4, peldano);
  const bote = Math.floor(apuesta * mult);

  function empezar() {
    if (enJuego) return;
    const r = apostarConAviso(apuesta, setAviso);
    if (!r.ok) return;
    setPeldano(0); setDados([0, 0]); setEnJuego(true);
    sfx.clic();
  }

  function tirar() {
    if (!enJuego || peldano >= METAS.length) return;
    const d = [1 + Math.floor(Math.random() * 6), 1 + Math.floor(Math.random() * 6)];
    setDados(d);
    if (d[0] + d[1] >= METAS[peldano]) {
      const np = peldano + 1;
      setPeldano(np);
      sfx.bien();
      if (np >= METAS.length) {
        cobrarPremio(Math.floor(apuesta * Math.pow(1.4, METAS.length)), apuesta, registrarPunt);
        setEnJuego(false);
      }
    } else {
      setEnJuego(false);
      perderApuesta(registrarPunt);
    }
  }

  function cobrar() {
    if (!enJuego || peldano === 0) return;
    cobrarPremio(bote, apuesta, registrarPunt);
    setEnJuego(false);
  }

  return (
    <GameShell titulo="Escalera Millonaria" emoji="🪜"
      descripcion="Supera 5 peldaños con 2 dados (suma ≥ meta). Cada uno ×1.4, la cima ×5.3."
      stats={[{ icono: "🪙", valor: saldo }, ...(enJuego || peldano ? [{ etiqueta: "Peldaño", valor: `${Math.min(peldano + 1, 5)}/5` }, { etiqueta: "Meta", valor: peldano < 5 ? `≥${METAS[peldano]}` : "🏁" }, { etiqueta: "Bote", valor: `${bote} (×${mult.toFixed(1)})` }] : [])]}
      resultado={{ mensaje, tipo }}
      ayuda={<span>Las metas suben: <b>5, 7, 9, 10 y 11</b>. Si fallas un tiro pierdes la apuesta; puedes cobrar en cualquier peldaño.</span>}>
      <SelectorApuesta apuesta={apuesta} setApuesta={setApuesta} jugando={enJuego} />
      <div className="fila-botones">
        {!enJuego
          ? <button className="btn-principal" onClick={empezar}>🪜 Subir ({apuesta})</button>
          : <>
            <button className="btn-principal" onClick={tirar}>🎲 Tirar (meta ≥{METAS[Math.min(peldano, 4)]})</button>
            <button className="btn-exito" onClick={cobrar} disabled={peldano === 0}>💰 Cobrar {bote}</button>
          </>}
      </div>
      <p style={{ textAlign: "center", fontSize: "3rem", margin: "6px 0" }}>
        {dados[0] ? `${DADO[dados[0] - 1]} ${DADO[dados[1] - 1]} = ${dados[0] + dados[1]}` : "🎲🎲"}
      </p>
      <div className="escalera-peldanos" aria-hidden>
        {METAS.map((m, i) => (
          <span key={i} className={`escalera-p${i < peldano ? " ok" : i === peldano && enJuego ? " ahora" : ""}`}>{i < peldano ? "✅" : `≥${m}`}</span>
        ))}
      </div>
      {aviso && <p className="aviso info" style={{ textAlign: "center" }}>{aviso}</p>}
      <Resultado mensaje={mensaje} tipo={tipo} />
    </GameShell>
  );
}
