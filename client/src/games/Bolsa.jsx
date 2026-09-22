import { useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { useSaldo, apostarConAviso, cobrarPremio, perderApuesta, SelectorApuesta } from "../suite/apuesta";
import { sfx } from "../suite/sonido";

const TICKS = 5;

/* La Bolsa: invierte y mira 5 movimientos del mercado. Vende cuando quieras. */
export default function Bolsa() {
  const { mensaje, tipo, registrarPunt } = useRegistro("La Bolsa");
  const saldo = useSaldo();
  const [apuesta, setApuesta] = useState(25);
  const [hist, setHist] = useState([]);
  const [enJuego, setEnJuego] = useState(false);
  const [vendido, setVendido] = useState(false);
  const [aviso, setAviso] = useState("");

  const precio = hist.length ? hist[hist.length - 1] : 100;
  const valorActual = Math.floor((apuesta * precio) / 100);

  function invertir() {
    if (enJuego) return;
    const r = apostarConAviso(apuesta, setAviso);
    if (!r.ok) return;
    setHist([100]); setEnJuego(true); setVendido(false);
    sfx.clic();
  }

  function mover() {
    if (!enJuego) return;
    const cambio = Math.round((Math.random() - 0.46) * 22);
    const np = Math.max(40, precio + cambio);
    const nh = [...hist, np];
    setHist(nh);
    if (np >= precio) sfx.bien(); else sfx.mal();
    if (nh.length - 1 >= TICKS) vender(nh);
  }

  function vender(h = hist) {
    if (!enJuego) return;
    const p = h[h.length - 1];
    const premio = Math.floor((apuesta * p) / 100);
    setEnJuego(false); setVendido(true);
    if (premio > apuesta) cobrarPremio(premio, apuesta, registrarPunt);
    else if (premio === apuesta) { cobrarPremio(premio, apuesta, registrarPunt); }
    else perderApuesta(registrarPunt);
  }

  const min = Math.min(100, ...hist) - 5, max = Math.max(100, ...hist) + 5;

  return (
    <GameShell titulo="La Bolsa" emoji="📈"
      descripcion="Invierte y sigue 5 movimientos: vende en verde o aguanta. Si cae, pierdes parte."
      stats={[{ icono: "🪙", valor: saldo }, ...(hist.length ? [{ etiqueta: "Índice", valor: precio }, { etiqueta: "Vale", valor: valorActual }] : [])]}
      resultado={{ mensaje, tipo }}
      ayuda={<span>Empiezas en <b>100</b>. Cada movimiento sube o baja al azar con leve tendencia al alza. Vender por encima de lo apostado <b>gana</b>; por debajo, <b>pierde</b>.</span>}>
      <SelectorApuesta apuesta={apuesta} setApuesta={setApuesta} jugando={enJuego} />
      <div className="fila-botones">
        {!enJuego && !vendido && <button className="btn-principal" onClick={invertir}>📈 Invertir ({apuesta})</button>}
        {!enJuego && vendido && <button className="btn-principal" onClick={invertir}>📈 Otra inversión ({apuesta})</button>}
        {enJuego && <>
          <button className="btn-principal" onClick={mover}>⏭ Mover ({hist.length - 1}/{TICKS})</button>
          <button className="btn-exito" onClick={() => vender()}>💰 Vender ({valorActual})</button>
        </>}
      </div>
      {hist.length > 0 && (
        <div className="bolsa-chart" role="img" aria-label={`Índice en ${precio}`}>
          {hist.map((p, i) => (
            <span key={i} className={`bolsa-barra${p >= 100 ? " up" : " down"}`}
              style={{ height: `${8 + ((p - min) / Math.max(1, max - min)) * 72}px` }} title={`${p}`} />
          ))}
        </div>
      )}
      {aviso && <p className="aviso info" style={{ textAlign: "center" }}>{aviso}</p>}
      <Resultado mensaje={mensaje} tipo={tipo} />
    </GameShell>
  );
}
