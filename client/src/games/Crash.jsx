import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { useSaldo, apostarConAviso, cobrarPremio, perderApuesta, SelectorApuesta } from "../suite/apuesta";
import { sfx } from "../suite/sonido";

/* Crash (tendencia Aviator): el multiplicador sube hasta que explota.
   Cobra a tiempo: premio = apuesta × multiplicador. Configurable por variante. */
function CrashMotor({ nombre, emoji, descripcion, ayuda, subidaMin, subidaMax, tickMs, probCrash }) {
  const { mensaje, tipo, registrarPunt } = useRegistro(nombre);
  const saldo = useSaldo();
  const [apuesta, setApuesta] = useState(25);
  const [mult, setMult] = useState(1);
  const [volando, setVolando] = useState(false);
  const [explotado, setExplotado] = useState(false);
  const [cobrado, setCobrado] = useState(null);
  const [aviso, setAviso] = useState("");
  const timer = useRef(null);

  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);

  function despegar() {
    if (volando) return;
    const r = apostarConAviso(apuesta, setAviso);
    if (!r.ok) return;
    setMult(1); setExplotado(false); setCobrado(null); setVolando(true);
    sfx.clic();
    timer.current = setInterval(() => {
      setMult(m => {
        const paso = subidaMin + Math.random() * (subidaMax - subidaMin);
        const nm = +(m + paso).toFixed(2);
        if (Math.random() < probCrash * (nm / 3)) {
          clearInterval(timer.current); timer.current = null;
          setVolando(false); setExplotado(true);
          sfx.mal();
          perderApuesta(registrarPunt);
        } else {
          sfx.clic();
        }
        return nm;
      });
    }, tickMs);
  }

  function cobrarYa() {
    if (!volando || explotado) return;
    clearInterval(timer.current); timer.current = null;
    setVolando(false);
    const premio = Math.floor(apuesta * mult);
    setCobrado(mult);
    cobrarPremio(premio, apuesta, registrarPunt);
  }

  const altura = Math.min(100, (mult - 1) * 28);

  return (
    <GameShell titulo={nombre} emoji={emoji}
      descripcion={descripcion}
      stats={[{ icono: "🪙", valor: saldo }, { etiqueta: "Multi", valor: `×${mult.toFixed(2)}` }]}
      resultado={{ mensaje, tipo }}
      ayuda={<span>{ayuda}</span>}>
      <SelectorApuesta apuesta={apuesta} setApuesta={setApuesta} jugando={volando} />
      <div className="crash-pista" aria-hidden style={{ textAlign: "center", fontSize: "2.2rem", minHeight: 90 }}>
        <div style={{ transform: `translateY(${-altura}px)`, transition: `transform ${tickMs}ms linear` }}>
          {explotado ? "💥" : "🚀"}
        </div>
        <div className={`chip${explotado ? " derrota" : volando ? " victoria" : ""}`} style={{ fontSize: "1.1rem" }}>
          {explotado ? "¡EXPLOTÓ!" : `×${mult.toFixed(2)}`}
        </div>
      </div>
      <div className="fila-botones">
        {!volando
          ? <button className="btn-principal" onClick={despegar}>🚀 Despegar ({apuesta})</button>
          : <button className="btn-exito" onClick={cobrarYa} style={{ minHeight: 52, fontSize: "1.1rem" }}>💰 Cobrar ×{mult.toFixed(2)}</button>}
      </div>
      {cobrado && <p className="aviso victoria" style={{ textAlign: "center" }}>✅ Cobraste a ×{cobrado.toFixed(2)}</p>}
      {aviso && <p className="aviso info" style={{ textAlign: "center" }}>{aviso}</p>}
      <Resultado mensaje={mensaje} tipo={tipo} />
    </GameShell>
  );
}

export default function Crash() {
  return <CrashMotor nombre="Crash Cohete" emoji="🚀"
    descripcion="Apuesta y cobra antes de que el cohete explote: ×1 a ×10+."
    ayuda={<>El multiplicador sube cada instante. Si explota antes de cobrar, <b>pierdes</b>. Cobra pronto para asegurar, aguanta para soñar.</>}
    subidaMin={0.08} subidaMax={0.28} tickMs={220} probCrash={0.045} />;
}
export function CrashTurbo() {
  return <CrashMotor nombre="Crash Turbo" emoji="⚡"
    descripcion="Crash a doble velocidad: más riesgo, más vértigo."
    ayuda={<>Igual que el Crash Cohete pero <b>el doble de rápido</b>. Solo para valientes con el dedo en Cobrar.</>}
    subidaMin={0.15} subidaMax={0.45} tickMs={140} probCrash={0.055} />;
}
export function CrashLuna() {
  return <CrashMotor nombre="Crash Luna" emoji="🌙"
    descripcion="Vuelo largo a la Luna: sube lento pero puede llegar a ×20."
    ayuda={<>Sube <b>despacio</b> y explota menos al inicio: ideal para cazar multiplicadores altos. La paciencia paga… o explota.</>}
    subidaMin={0.05} subidaMax={0.16} tickMs={260} probCrash={0.03} />;
}
