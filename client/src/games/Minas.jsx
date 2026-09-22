import { useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { useSaldo, apostarConAviso, cobrarPremio, perderApuesta, SelectorApuesta } from "../suite/apuesta";
import { sfx } from "../suite/sonido";

const N = 5, MINAS = 3;

/* Minas: revela casillas sin pisar las 3 minas. Cada acierto ×1.3. Cobra cuando quieras. */
export default function Minas() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Minas");
  const saldo = useSaldo();
  const [apuesta, setApuesta] = useState(25);
  const [minas, setMinas] = useState([]);
  const [abiertas, setAbiertas] = useState([]);
  const [explotada, setExplotada] = useState(false);
  const [aviso, setAviso] = useState("");

  const jugando = minas.length > 0 && !explotada;
  const mult = Math.pow(1.3, abiertas.length);
  const bote = Math.floor(apuesta * mult);

  function empezar() {
    if (jugando) return;
    const r = apostarConAviso(apuesta, setAviso);
    if (!r.ok) return;
    const celdas = Array.from({ length: N * N }, (_, i) => i).sort(() => Math.random() - 0.5);
    setMinas(celdas.slice(0, MINAS));
    setAbiertas([]);
    setExplotada(false);
    sfx.clic();
  }

  function abrir(i) {
    if (!jugando || abiertas.includes(i)) return;
    if (minas.includes(i)) {
      setExplotada(true);
      perderApuesta(registrarPunt);
    } else {
      setAbiertas(a => [...a, i]);
      sfx.bien();
    }
  }

  function cobrar() {
    if (!jugando || !abiertas.length) return;
    cobrarPremio(bote, apuesta, registrarPunt);
    setMinas([]); setAbiertas([]);
  }

  return (
    <GameShell titulo="Minas" emoji="💣"
      descripcion="Revela casillas sin pisar las 3 minas. Cada acierto multiplica ×1.3. Cobra cuando quieras."
      stats={[{ icono: "🪙", valor: saldo }, ...(jugando ? [{ etiqueta: "Bote", valor: `${bote} (×${mult.toFixed(1)})` }] : [])]}
      resultado={{ mensaje, tipo }}
      ayuda={<span>Hay <b>3 minas</b> escondidas en 25 casillas. Cada casilla segura sube el bote. Si explotas, pierdes la apuesta.</span>}>
      <SelectorApuesta apuesta={apuesta} setApuesta={setApuesta} jugando={jugando} />
      <div className="fila-botones">
        {!jugando
          ? <button className="btn-principal" onClick={empezar}>💣 Jugar ({apuesta})</button>
          : <button className="btn-exito" onClick={cobrar} disabled={!abiertas.length}>💰 Cobrar {bote}</button>}
      </div>
      {jugando && (
        <div className="tablero minas-tab">
          {Array.from({ length: N * N }, (_, i) => {
            const abierta = abiertas.includes(i);
            const esMina = minas.includes(i);
            const revelada = explotada && esMina;
            return (
              <button key={i} className={`minas-celda${abierta ? " ok" : ""}${revelada ? " boom" : ""}`}
                onClick={() => abrir(i)} disabled={abierta || explotada} aria-label={`Casilla ${i + 1}`}>
                {abierta ? "💎" : revelada ? "💥" : "?"}
              </button>
            );
          })}
        </div>
      )}
      {aviso && <p className="aviso info" style={{ textAlign: "center" }}>{aviso}</p>}
      <Resultado mensaje={mensaje} tipo={tipo} />
    </GameShell>
  );
}
