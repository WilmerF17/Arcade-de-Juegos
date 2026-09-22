import { useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { sfx } from "../suite/sonido";

const DADOS = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

/* Escalera de Dados: supera tu tiro anterior para subir 6 peldaños. Fallar 3 veces te tumba. */
export default function Escalera() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Escalera de Dados");
  const [peldano, setPeldano] = useState(0);
  const [ultimo, setUltimo] = useState(0);
  const [tiro, setTiro] = useState(null);
  const [caidas, setCaidas] = useState(0);
  const [tiradas, setTiradas] = useState(0);
  const [jugando, setJugando] = useState(false);

  const META = 6;

  function empezar() {
    setPeldano(0); setUltimo(0); setTiro(null); setCaidas(0); setTiradas(0);
    setJugando(true);
    sfx.clic();
  }

  function lanzar() {
    if (!jugando) { empezar(); return; }
    const v = 1 + Math.floor(Math.random() * 6);
    setTiro(v);
    setTiradas(t => t + 1);
    if (v > ultimo) {
      const np = peldano + 1;
      setPeldano(np);
      setUltimo(v);
      sfx.moneda();
      if (np >= META) {
        setJugando(false);
        const puntos = 600 + Math.max(0, 300 - tiradas * 15);
        registrarPunt(puntos, 1);
      }
    } else {
      const nc = caidas + 1;
      setCaidas(nc);
      setPeldano(0);
      setUltimo(0);
      sfx.mal();
      if (nc >= 3) {
        setJugando(false);
        registrarPunt(peldano * 40, 0);
      }
    }
  }

  return (
    <GameShell titulo="Escalera de Dados" emoji="🎲"
      descripcion="Supera tu tiro anterior para subir · 6 peldaños · 3 caídas te tumban."
      tira="linear-gradient(90deg,#a855f7,#ff9a3d)" iconoFondo="linear-gradient(135deg,#a855f7,#ff9a3d)">
      <div className="fila-botones">
        <span className="chip">Peldaño: <b>{peldano}/{META}</b></span>
        <span className="chip">A superar: <b>{ultimo === 0 ? "—" : `>${ultimo}`}</b></span>
        <span className="chip">Caídas: <b>{caidas}/3</b></span>
      </div>
      <div style={{ display: "flex", gap: 4, justifyContent: "center", margin: "6px 0" }}>
        {Array.from({ length: META }, (_, i) => (
          <div key={i} style={{ width: 40, height: 14, borderRadius: 6,
            background: i < peldano ? "linear-gradient(90deg,#a855f7,#ff9a3d)" : "var(--bg-soft)",
            border: "1px solid var(--border)" }} />
        ))}
      </div>
      <p style={{ textAlign: "center", fontSize: "4rem", margin: "4px 0" }}>{tiro ? DADOS[tiro - 1] : "🎲"}</p>
      <div className="fila-botones">
        <button className="btn-principal" onClick={lanzar}>{jugando ? "🎲 Lanzar" : "▶ Empezar"}</button>
      </div>
      <Resultado mensaje={mensaje} tipo={tipo} />
    </GameShell>
  );
}
