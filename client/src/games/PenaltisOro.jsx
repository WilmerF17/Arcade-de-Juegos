import { useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { useSaldo, apostarConAviso, cobrarPremio, perderApuesta, SelectorApuesta } from "../suite/apuesta";
import { sfx } from "../suite/sonido";

const LADOS = ["izq", "centro", "der"];
const FLECHA = { izq: "↖️", centro: "⬆️", der: "↗️" };

/* Penaltis de Oro: apuesta y lanza 3 penaltis. 2 goles ×2, 3 goles ×5. */
export default function PenaltisOro() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Penaltis de Oro");
  const saldo = useSaldo();
  const [apuesta, setApuesta] = useState(25);
  const [ronda, setRonda] = useState(0);
  const [goles, setGoles] = useState(0);
  const [tiro, setTiro] = useState(null);
  const [portero, setPortero] = useState(null);
  const [enJuego, setEnJuego] = useState(false);
  const [aviso, setAviso] = useState("");

  function empezar() {
    if (enJuego) return;
    const r = apostarConAviso(apuesta, setAviso);
    if (!r.ok) return;
    setRonda(0); setGoles(0); setTiro(null); setPortero(null);
    setEnJuego(true);
    sfx.clic();
  }

  function lanzar(lado) {
    if (!enJuego) return;
    const por = LADOS[Math.floor(Math.random() * 3)];
    setTiro(lado); setPortero(por);
    const gol = lado !== por;
    const ng = goles + (gol ? 1 : 0);
    const nr = ronda + 1;
    setGoles(ng); setRonda(nr);
    if (gol) sfx.bien(); else sfx.mal();
    if (nr >= 3) {
      setEnJuego(false);
      if (ng >= 3) cobrarPremio(apuesta * 5, apuesta, registrarPunt);
      else if (ng === 2) cobrarPremio(apuesta * 2, apuesta, registrarPunt);
      else perderApuesta(registrarPunt);
    }
  }

  return (
    <GameShell titulo="Penaltis de Oro" emoji="🥅"
      descripcion="Lanza 3 penaltis contra el portero: 2 goles ×2, 3 goles ×5."
      stats={[{ icono: "🪙", valor: saldo }, ...(enJuego || ronda ? [{ etiqueta: "Tanda", valor: `${Math.min(ronda + (enJuego ? 1 : 0), 3)}/3` }, { etiqueta: "Goles", valor: goles }] : [])]}
      resultado={{ mensaje, tipo }}
      ayuda={<span>Elige esquina: si el portero va a otro lado es <b>gol</b>. Con 0-1 goles pierdes la apuesta.</span>}>
      <SelectorApuesta apuesta={apuesta} setApuesta={setApuesta} jugando={enJuego} />
      {!enJuego && <div className="fila-botones"><button className="btn-principal" onClick={empezar}>🥅 Jugar ({apuesta})</button></div>}
      <p style={{ textAlign: "center", fontSize: "3rem", margin: "6px 0" }}>
        {tiro ? (tiro !== portero ? "⚽🎉" : "🧤") : "🥅"}
      </p>
      {tiro && <p style={{ textAlign: "center", margin: "0 0 6px" }}>Tú {FLECHA[tiro]} · Portero {FLECHA[portero]}</p>}
      {enJuego && (
        <div className="fila-botones">
          {LADOS.map(l => <button key={l} className="btn-principal" onClick={() => lanzar(l)}>{FLECHA[l]}</button>)}
        </div>
      )}
      {aviso && <p className="aviso info" style={{ textAlign: "center" }}>{aviso}</p>}
      <Resultado mensaje={mensaje} tipo={tipo} />
    </GameShell>
  );
}
