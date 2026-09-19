import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro } from "../ui/GameShell";
import { escribiendo } from "../suite/teclado";
import { sfx } from "../suite/sonido";

const VAL = { J: 11, Q: 12, K: 13, A: 14 };
const vCarta = c => VAL[c.v] || c.v;
const nom = c => `${c.v}${c.p}`;
export default function Guerra() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Guerra de Cartas");
  const [ronda, setRonda] = useState(0);
  const [pg, setPg] = useState(0);
  const [pm, setPm] = useState(0);
  const [mesa, setMesa] = useState(null);
  const [fin, setFin] = useState(false);
  const [guerra, setGuerra] = useState(0);
  const st = useRef({ ronda: 0, pg: 0, pm: 0, guerra: 0 });
  st.current = { ronda, pg, pm, guerra };

  function carta() {
    const palos = ["♠", "♥", "♦", "♣"];
    const vs = [2, 3, 4, 5, 6, 7, 8, 9, 10, "J", "Q", "K", "A"];
    return { v: vs[Math.floor(Math.random() * vs.length)], p: palos[Math.floor(Math.random() * palos.length)] };
  }
  function batalla() {
    if (fin) return;
    const tu = carta(), mq = carta();
    const a = vCarta(tu), b = vCarta(mq);
    setMesa({ tu, mq });
    let { ronda: r, pg: g, pm: m, guerra: gu } = st.current;
    r += 1;
    if (a > b) { g += 1 + gu; gu = 0; sfx.bien(); }
    else if (b > a) { m += 1 + gu; gu = 0; sfx.mal(); }
    else { gu += 1; sfx.clic(); }
    st.current = { ronda: r, pg: g, pm: m, guerra: gu };
    setRonda(r); setPg(g); setPm(m); setGuerra(gu);
    if (r >= 13) {
      setFin(true);
      registrarPunt(g * 10, g > m ? 1 : 0);
      if (g > m) sfx.record();
    }
  }
  const batallaRef = useRef(batalla); batallaRef.current = batalla;
  function reiniciar() { st.current = { ronda: 0, pg: 0, pm: 0, guerra: 0 }; setRonda(0); setPg(0); setPm(0); setMesa(null); setFin(false); setGuerra(0); }
  useEffect(() => {
    const fn = e => {
      if (escribiendo()) return;
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); if (!fin) batallaRef.current(); }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [fin, mesa]);

  return (
    <GameShell titulo="Guerra de Cartas" emoji="🪖" descripcion="ENTER voltear · 13 rondas · carta alta gana · empate = guerra.">
      <div className="fila-botones" style={{ marginTop: 0 }}>
        <button className="btn-principal" onClick={fin ? reiniciar : batalla}>{fin ? "↻ Otra guerra" : "🃏 Batalla (ENTER)"}</button>
        <span className="chip">Ronda <b>{ronda}/13</b></span>
        <span className="chip">Tú <b>{pg}</b> — IA <b>{pm}</b></span>
        {guerra > 0 && <span className="chip">🔥 Guerra <b>×{guerra + 1}</b></span>}
      </div>
      <div className="rps-arena">
        <div className={`rps-mano ${mesa ? (vCarta(mesa.tu) > vCarta(mesa.mq) ? "gana" : vCarta(mesa.tu) < vCarta(mesa.mq) ? "pierde" : "") : ""}`}>{mesa ? nom(mesa.tu) : "🂠"}</div>
        <span className="vs">VS</span>
        <div className={`rps-mano ${mesa ? (vCarta(mesa.mq) > vCarta(mesa.tu) ? "gana" : vCarta(mesa.mq) < vCarta(mesa.tu) ? "pierde" : "") : ""}`}>{mesa ? nom(mesa.mq) : "🂠"}</div>
      </div>
      {mesa && !fin && <p style={{ textAlign: "center" }}>{vCarta(mesa.tu) === vCarta(mesa.mq) ? "🤝 ¡Guerra! La próxima vale doble." : vCarta(mesa.tu) > vCarta(mesa.mq) ? "✅ Punto para ti." : "❌ Punto para la IA."}</p>}
      {fin && <div className={`mensaje-final ${tipo}`}>{pg > pm ? "🏆 ¡Ganaste la guerra!" : pg < pm ? "💀 Gana la IA." : "🤝 Empate."} {mensaje}</div>}
    </GameShell>
  );
}
