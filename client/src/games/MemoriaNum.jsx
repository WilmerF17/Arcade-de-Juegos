import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro } from "../ui/GameShell";
import { sfx } from "../suite/sonido";

function secuencia(n) { return Array.from({ length: n }, () => Math.floor(Math.random() * 10)); }
export default function MemoriaNum() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Memoria Numérica");
  const [seq, setSeq] = useState([]);
  const [fase, setFase] = useState("inicio"); // inicio -> muestra -> escribe -> fin
  const [entrada, setEntrada] = useState("");
  const [nivel, setNivel] = useState(3);
  const [mejor, setMejor] = useState(() => Number(localStorage.getItem("arcade-memnum") || 0));
  const timer = useRef(null);

  function empezar(n = 3) {
    clearTimeout(timer.current);
    const s = secuencia(n);
    setSeq(s); setNivel(n); setEntrada(""); setFase("muestra");
    timer.current = setTimeout(() => setFase("escribe"), 1200 + n * 500);
  }
  useEffect(() => () => clearTimeout(timer.current), []);
  function comprobar() {
    const ok = entrada.trim() === seq.join("");
    if (ok) {
      const pts = nivel * 15;
      sfx.bien();
      if (nivel > mejor) { setMejor(nivel); localStorage.setItem("arcade-memnum", String(nivel)); }
      if (nivel >= 9) {
        setFase("fin");
        registrarPunt(nivel * 20, 1);
        sfx.record();
      } else {
        empezar(nivel + 1);
      }
    } else {
      sfx.mal();
      setFase("fin");
      registrarPunt(Math.max(0, (nivel - 1) * 15), nivel > 4 ? 1 : 0);
    }
  }
  return (
    <GameShell titulo="Memoria Numérica" emoji="🔢" descripcion="Memoriza la cifra y escríbela · cada nivel +1 dígito.">
      <div className="fila-botones" style={{ marginTop: 0 }}>
        <button className="btn-principal" onClick={() => empezar(3)}>{fase === "inicio" ? "▶ Jugar" : "↻ Reiniciar"}</button>
        <span className="chip">Nivel <b>{nivel} dígitos</b></span>
        <span className="chip">🏆 <b>{mejor}</b></span>
      </div>
      {fase === "muestra" && (
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <div style={{ fontSize: "3rem", fontWeight: 900, letterSpacing: ".3em" }}>{seq.join("")}</div>
          <p className="aviso info">Memoriza… se oculta enseguida 👀</p>
        </div>
      )}
      {fase === "escribe" && (
        <div style={{ display: "flex", gap: 8, marginTop: 20, justifyContent: "center" }}>
          <input type="text" inputMode="numeric" value={entrada} onChange={e => setEntrada(e.target.value.replace(/\D/g, "").slice(0, 12))} onKeyDown={e => e.key === "Enter" && comprobar()} placeholder={"?".repeat(nivel)} style={{ fontSize: "1.6rem", width: 220, textAlign: "center", letterSpacing: ".2em" }} autoFocus />
          <button className="btn-principal" onClick={comprobar}>OK</button>
        </div>
      )}
      {fase === "fin" && <div className={`mensaje-final ${tipo}`}>{mensaje} · llegaste a {nivel} dígitos.</div>}
      {fase === "inicio" && <p className="aviso-ia">💡 Empieza con 3 dígitos y suma uno por acierto.</p>}
    </GameShell>
  );
}
