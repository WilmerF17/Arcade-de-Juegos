import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro } from "../ui/GameShell";
import { escribiendo } from "../suite/teclado";
import { sfx } from "../suite/sonido";

const RODILLOS = ["🍒", "🍋", "⭐", "💎", "7️⃣", "🍀"];
const PESOS = [30, 25, 18, 12, 5, 10];

function tirar() {
  const pick = () => {
    const total = PESOS.reduce((a, b) => a + b, 0);
    let r = Math.random() * total;
    for (let i = 0; i < RODILLOS.length; i++) { r -= PESOS[i]; if (r <= 0) return RODILLOS[i]; }
    return RODILLOS[0];
  };
  return [pick(), pick(), pick()];
}

function premio(r) {
  if (r[0] === r[1] && r[1] === r[2]) {
    if (r[0] === "7️⃣") return 100;
    if (r[0] === "💎") return 50;
    return 25;
  }
  if (r[0] === r[1] || r[1] === r[2] || r[0] === r[2]) return 5;
  return 0;
}

export default function Tragaperras() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Tragaperras");
  const [rod, setRod] = useState(["🍒", "🍋", "⭐"]);
  const [creditos, setCreditos] = useState(50);
  const [girando, setGirando] = useState(false);
  const [apuesta, setApuesta] = useState(5);
  const [racha, setRacha] = useState(0);
  const [flash, setFlash] = useState("");
  const credRef = useRef(50);
  const girRef = useRef(false);
  credRef.current = creditos;
  girRef.current = girando;

  function girar() {
    if (girRef.current || credRef.current < apuesta) return;
    setGirando(true);
    girRef.current = true;
    setFlash("");
    sfx.clic();
    setCreditos(c => { credRef.current = c - apuesta; return credRef.current; });
    let ticks = 0;
    const id = setInterval(() => {
      setRod(tirar());
      ticks++;
      if (ticks > 12) {
        clearInterval(id);
        const final = tirar();
        setRod(final);
        const p = premio(final) * (apuesta / 5);
        setGirando(false);
        girRef.current = false;
        if (p > 0) {
          setCreditos(c => { credRef.current = c + p; return credRef.current; });
          setRacha(r => r + 1);
          setFlash(p >= 25 ? "¡PREMIO MAYOR! 🎆" : "¡Premio! ✨");
          if (p >= 25) sfx.record(); else sfx.moneda();
          if (p >= 50) registrarPunt(p, 1);
        } else {
          setRacha(0);
          sfx.mal();
          if (credRef.current - apuesta <= 0 || credRef.current <= 0) registrarPunt(0, 0);
        }
      }
    }, 90);
  }

  const girarRef = useRef(girar);
  girarRef.current = girar;

  useEffect(() => {
    const fn = e => {
      if (escribiendo()) return;
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); girarRef.current(); }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [apuesta]);

  return (
    <GameShell titulo="Tragaperras" emoji="🎰"
      descripcion="ENTER/ESPACIO para girar · el 7️⃣7️⃣7️⃣ paga 100."
      tira="linear-gradient(90deg,#f59e0b,#ef4444,#a855f7)" iconoFondo="linear-gradient(135deg,#f59e0b,#ef4444)">
      <div className="tragaperras">
        <div className={`rodillos ${girando ? "girando" : ""} ${flash.includes("MAYOR") ? "premio-mayor" : ""}`}>
          {rod.map((r, i) => <span key={i} className="rodillo">{r}</span>)}
        </div>
        {flash && <div className="flash-premio">{flash}</div>}
        <div className="fila-botones">
          <span className="chip">🪙 Créditos: <b>{creditos}</b></span>
          <span className="chip">🔥 Racha: <b>{racha}</b></span>
          <select value={apuesta} onChange={e => setApuesta(Number(e.target.value))} disabled={girando}>
            <option value={1}>Apuesta 1</option>
            <option value={5}>Apuesta 5</option>
            <option value={10}>Apuesta 10</option>
          </select>
        </div>
        <div className="fila-botones">
          <button className="btn-principal btn-palanca" onClick={girar} disabled={girando || creditos < apuesta}>
            {girando ? "🎰 Girando..." : "🎰 ¡GIRAR!"}
          </button>
          <button className="btn-suave" onClick={() => { setCreditos(50); credRef.current = 50; setRacha(0); }}>↻ Recargar 50</button>
        </div>
        <div className="tabla-premios">
          <span>7️⃣7️⃣7️⃣ = 100</span><span>💎💎💎 = 50</span><span>trío = 25</span><span>pareja = 5</span>
        </div>
      </div>
      {mensaje && <div className={`mensaje-final ${tipo}`}>{mensaje}</div>}
      {creditos < apuesta && !girando && <p className="aviso info">Sin créditos: pulsa Recargar o baja la apuesta.</p>}
    </GameShell>
  );
}
