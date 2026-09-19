import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro } from "../ui/GameShell";
import { escribiendo } from "../suite/teclado";
import { sfx } from "../suite/sonido";

const ROJOS = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
export default function Ruleta() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Ruleta");
  const [creditos, setCreditos] = useState(100);
  const [apuesta, setApuesta] = useState(10);
  const [eleccion, setEleccion] = useState("rojo");
  const [numero, setNumero] = useState(7);
  const [girando, setGirando] = useState(false);
  const [bola, setBola] = useState(0);
  const [historial, setHistorial] = useState([]);
  const credRef = useRef(100); credRef.current = creditos;

  function girar() {
    if (girando || credRef.current < apuesta) return;
    setGirando(true);
    setCreditos(c => { credRef.current = c - apuesta; return credRef.current; });
    sfx.clic();
    let ticks = 0;
    const id = setInterval(() => {
      setBola(Math.floor(Math.random() * 37));
      ticks++;
      if (ticks > 16) {
        clearInterval(id);
        const n = Math.floor(Math.random() * 37);
        setBola(n);
        setGirando(false);
        let premio = 0;
        if (eleccion === "numero" && n === numero) premio = apuesta * 35;
        else if (eleccion === "rojo" && ROJOS.has(n)) premio = apuesta * 2;
        else if (eleccion === "negro" && n !== 0 && !ROJOS.has(n)) premio = apuesta * 2;
        else if (eleccion === "par" && n !== 0 && n % 2 === 0) premio = apuesta * 2;
        else if (eleccion === "impar" && n % 2 === 1) premio = apuesta * 2;
        if (premio > 0) {
          setCreditos(c => { credRef.current = c + premio; return credRef.current; });
          if (premio >= 100) { sfx.record(); registrarPunt(premio, 1); }
          else sfx.moneda();
        } else {
          sfx.mal();
          if (credRef.current <= 0) registrarPunt(0, 0);
        }
        setHistorial(h => [n, ...h].slice(0, 8));
      }
    }, 80);
  }
  const girarRef = useRef(girar); girarRef.current = girar;
  useEffect(() => {
    const fn = e => {
      if (escribiendo()) return;
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); girarRef.current(); }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [apuesta, eleccion, numero, girando]);

  const colorBola = bola === 0 ? "#22c55e" : ROJOS.has(bola) ? "#ef4444" : "#1f2937";
  return (
    <GameShell titulo="Ruleta" emoji="🎡" descripcion="ENTER girar · rojo/negro/par/impar ×2 · número ×35.">
      <div className="fila-botones" style={{ marginTop: 0 }}>
        <span className="chip">🪙 <b>{creditos}</b></span>
        <select value={apuesta} onChange={e => setApuesta(Number(e.target.value))} disabled={girando}>
          <option value={5}>Apuesta 5</option><option value={10}>Apuesta 10</option><option value={25}>Apuesta 25</option>
        </select>
        <button className="btn-suave" onClick={() => { setCreditos(100); credRef.current = 100; }}>↻ Recargar 100</button>
      </div>
      <div style={{ display: "flex", gap: 16, marginTop: 14, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ width: 120, height: 120, borderRadius: "50%", background: `conic-gradient(${colorBola} 0 20deg, #334155 20deg 40deg, ${colorBola} 40deg 60deg, #334155 60deg 360deg)`, display: "grid", placeItems: "center", border: "4px solid var(--aviso)", animation: girando ? "dado-gira .3s infinite" : undefined }}>
          <span style={{ background: "#fff", borderRadius: "50%", width: 56, height: 56, display: "grid", placeItems: "center", fontWeight: 900, fontSize: "1.4rem", color: "#111" }}>{bola}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div className="fila-botones" style={{ marginTop: 0 }}>
            {["rojo", "negro", "par", "impar", "numero"].map(o => (
              <button key={o} className={eleccion === o ? "btn-principal" : ""} onClick={() => setEleccion(o)}>{o}</button>
            ))}
          </div>
          {eleccion === "numero" && <input type="number" min={0} max={36} value={numero} onChange={e => setNumero(Math.max(0, Math.min(36, Number(e.target.value))))} style={{ width: 100 }} />}
          <button className="btn-principal btn-palanca" onClick={girar} disabled={girando || creditos < apuesta}>{girando ? "Girando..." : "🎡 ¡GIRAR!"}</button>
        </div>
      </div>
      {historial.length > 0 && <p className="aviso-ia">Historial: {historial.map(n => `${n}${n === 0 ? "🟢" : ROJOS.has(n) ? "🔴" : "⚫"}`).join(" · ")}</p>}
      {mensaje && <div className={`mensaje-final ${tipo}`}>{mensaje}</div>}
    </GameShell>
  );
}
