import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro } from "../ui/GameShell";
import { escribiendo } from "../suite/teclado";
import { sfx } from "../suite/sonido";

const VAL = { J: 11, Q: 12, K: 13, A: 14 };
const vCarta = c => VAL[c.v] || c.v;
const nom = c => `${c.v}${c.p}`;
const RONDAS_OPS = [7, 13, 21];
export default function Guerra() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Guerra de Cartas");
  const [ronda, setRonda] = useState(0);
  const [total, setTotal] = useState(13);
  const [pg, setPg] = useState(0);
  const [pm, setPm] = useState(0);
  const [mesa, setMesa] = useState(null);
  const [fin, setFin] = useState(false);
  const [guerra, setGuerra] = useState(0);
  const [mejor, setMejor] = useState(null);
  const st = useRef({ ronda: 0, pg: 0, pm: 0, guerra: 0 });
  st.current = { ronda, pg, pm, guerra };
  const totalRef = useRef(total);
  totalRef.current = total;
  const finRef = useRef(fin);
  finRef.current = fin;

  function carta() {
    const palos = ["♠", "♥", "♦", "♣"];
    const vs = [2, 3, 4, 5, 6, 7, 8, 9, 10, "J", "Q", "K", "A"];
    return { v: vs[Math.floor(Math.random() * vs.length)], p: palos[Math.floor(Math.random() * palos.length)] };
  }
  function batalla() {
    if (finRef.current) return;
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
    if (r >= totalRef.current) {
      setFin(true);
      finRef.current = true;
      registrarPunt(g * 10, g > m ? 1 : 0);
      if (g > m) { sfx.record(); setMejor(mm => (mm == null || g > mm ? g : mm)); }
    }
  }
  const batallaRef = useRef(batalla); batallaRef.current = batalla;
  function reiniciar() { sfx.clic(); st.current = { ronda: 0, pg: 0, pm: 0, guerra: 0 }; setRonda(0); setPg(0); setPm(0); setMesa(null); setFin(false); finRef.current = false; setGuerra(0); }
  const reiniciarRef = useRef(reiniciar);
  reiniciarRef.current = reiniciar;
  useEffect(() => {
    const fn = e => {
      if (escribiendo()) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (finRef.current) reiniciarRef.current();
        else batallaRef.current();
      } else if ((e.key === "n" || e.key === "N") && finRef.current) reiniciarRef.current();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [fin, mesa]);

  const pct = total ? Math.round((ronda / total) * 100) : 0;

  return (
    <GameShell titulo="Guerra de Cartas" emoji="🪖" descripcion={`ENTER voltear · ${total} rondas · carta alta gana · empate = guerra.`}
      stats={[
        { icono: "⚔️", etiqueta: "Ronda", valor: `${ronda}/${total}` },
        { icono: "🧍", etiqueta: "Tú", valor: pg },
        { icono: "🤖", etiqueta: "IA", valor: pm },
        { icono: "🏆", etiqueta: "Mejor", valor: mejor == null ? "—" : mejor },
      ]}
      acciones={<>
        <button className="btn-principal" onClick={fin ? reiniciar : batalla}>{fin ? "↻ Otra guerra (ENTER)" : "🃏 Batalla (ENTER)"}</button>
        {RONDAS_OPS.map(n => (
          <button key={n} className={total === n ? "btn-exito" : "btn-suave"} onClick={() => { setTotal(n); totalRef.current = n; reiniciar(); }}>{n} rondas</button>
        ))}
      </>}
      resultado={fin ? { mensaje, tipo } : null}
      ayuda={<>
        <p><b>Objetivo:</b> gana más puntos que la IA en <b>{total} batallas</b>. Carta más alta gana; si empatan, se declara <b>guerra 🔥</b> y la próxima vale doble (acumulable).</p>
        <p><b>Controles:</b> pulsa <kbd>Enter</kbd>/<kbd>Espacio</kbd> o el botón Batalla. Táctil: toca Batalla. <kbd>Enter</kbd> reinicia al terminar.</p>
        <p><b>Puntuación:</b> al cerrar registras <b>10 pts por punto</b>; más puntos que la IA cuenta como victoria.</p>
        <p><b>Consejo:</b> no hay decisión por batalla: juega partidas largas (21) si vas perdiendo por varianza, cortas (7) si quieres tensión.</p>
      </>}>
      {guerra > 0 && <p style={{ textAlign: "center" }}><span className="chip">🔥 Guerra <b>×{guerra + 1}</b></span></p>}
      <div className="xp-bar fina"><div style={{ width: `${pct}%` }} /></div>
      <div className="rps-arena">
        <div className={`rps-mano ${mesa ? (vCarta(mesa.tu) > vCarta(mesa.mq) ? "gana" : vCarta(mesa.tu) < vCarta(mesa.mq) ? "pierde" : "") : ""}`}>{mesa ? nom(mesa.tu) : "🂠"}</div>
        <span className="vs">VS</span>
        <div className={`rps-mano ${mesa ? (vCarta(mesa.mq) > vCarta(mesa.tu) ? "gana" : vCarta(mesa.mq) < vCarta(mesa.tu) ? "pierde" : "") : ""}`}>{mesa ? nom(mesa.mq) : "🂠"}</div>
      </div>
      {mesa && !fin && <p style={{ textAlign: "center" }}>{vCarta(mesa.tu) === vCarta(mesa.mq) ? "🤝 ¡Guerra! La próxima vale doble." : vCarta(mesa.tu) > vCarta(mesa.mq) ? "✅ Punto para ti." : "❌ Punto para la IA."}</p>}
      {fin && <p style={{ textAlign: "center", fontWeight: 800 }}>{pg > pm ? "🏆 ¡Ganaste la guerra!" : pg < pm ? "💀 Gana la IA." : "🤝 Empate."}</p>}
    </GameShell>
  );
}
