import { useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { useSaldo, apostarConAviso, cobrarPremio, perderApuesta, SelectorApuesta } from "../suite/apuesta";
import { sfx } from "../suite/sonido";

const PISOS = 6;

/* Torre Dorada: sube 6 pisos eligiendo puertas. 2 avanzan (×1.5) y 1 es trampa. Cobra cuando quieras. */
export default function Torre() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Torre Dorada");
  const saldo = useSaldo();
  const [apuesta, setApuesta] = useState(25);
  const [piso, setPiso] = useState(0);
  const [trampas, setTrampas] = useState([]);
  const [caida, setCaida] = useState(false);
  const [aviso, setAviso] = useState("");

  const jugando = trampas.length > 0 && !caida && piso < PISOS;
  const mult = Math.pow(1.5, piso);
  const bote = Math.floor(apuesta * mult);

  function empezar() {
    if (jugando) return;
    const r = apostarConAviso(apuesta, setAviso);
    if (!r.ok) return;
    setTrampas(Array.from({ length: PISOS }, () => Math.floor(Math.random() * 3)));
    setPiso(0); setCaida(false);
    sfx.clic();
  }

  function elegir(puerta) {
    if (!jugando) return;
    if (puerta === trampas[piso]) {
      setCaida(true);
      sfx.mal();
      perderApuesta(registrarPunt);
    } else {
      const np = piso + 1;
      setPiso(np);
      sfx.bien();
      if (np >= PISOS) {
        cobrarPremio(Math.floor(apuesta * Math.pow(1.5, PISOS)), apuesta, registrarPunt);
        setTrampas([]);
      }
    }
  }

  function cobrar() {
    if (!jugando || piso === 0) return;
    cobrarPremio(bote, apuesta, registrarPunt);
    setTrampas([]); setPiso(0);
  }

  return (
    <GameShell titulo="Torre Dorada" emoji="🗼"
      descripcion="Sube 6 pisos: 2 puertas avanzan (×1.5) y 1 es trampa. Cobra cuando quieras."
      stats={[{ icono: "🪙", etiqueta: "Saldo", valor: saldo }, { etiqueta: "Apuesta", valor: apuesta }, ...(trampas.length > 0 ? [{ etiqueta: "Piso", valor: `${Math.min(piso + 1, PISOS)}/${PISOS}` }, { etiqueta: "Bote", valor: `${bote} (×${mult.toFixed(1)})` }] : [{ etiqueta: "Pisos", valor: `0/${PISOS}` }])]}
      resultado={{ mensaje, tipo }}
      ayuda={<div><p><b>Objetivo:</b> subir 6 pisos eligiendo la puerta sin trampa.</p><p><b>Apuesta:</b> se descuenta al subir; bote = floor(apuesta×1.5^pisos). Cobra cuando quieras o arriesga.</p><ul><li>Cada piso ×1.5 · cima = floor(apuesta×1.5^6) ≈ ×11.4 · trampa = pierdes</li></ul><p><b>Controles:</b> clic en 🚪 de cada piso · Cobrar para plantar.</p><p><b>Consejo:</b> cobrar en el piso 2-3 asegura; la cima es 1 de cada 64.</p></div>}>
      <SelectorApuesta apuesta={apuesta} setApuesta={setApuesta} jugando={jugando} />
      <div className="fila-botones">
        {!trampas.length || caida || piso >= PISOS
          ? <button className="btn-principal" onClick={empezar}>🗼 Subir ({apuesta})</button>
          : <button className="btn-exito" onClick={cobrar} disabled={piso === 0}>💰 Cobrar {bote}</button>}
      </div>
      {jugando && (
        <div className="torre-puertas" role="group" aria-label={`Piso ${piso + 1}`}>
          {[0, 1, 2].map(p => (
            <button key={p} className="torre-puerta" onClick={() => elegir(p)}>🚪</button>
          ))}
        </div>
      )}
      {caida && <p style={{ textAlign: "center", fontSize: "2.4rem", margin: "4px 0" }}>🪤💥</p>}
      {aviso && <p className="aviso info" style={{ textAlign: "center" }}>{aviso}</p>}
      <Resultado mensaje={mensaje} tipo={tipo} />
    </GameShell>
  );
}
