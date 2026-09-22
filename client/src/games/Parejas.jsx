import { useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { sfx } from "../suite/sonido";

/* Motor de parejas de memoria con barajas temáticas: 8 parejas, crono y fallos. */
function ParejasBase({ titulo, emoji, baraja, tira, iconoFondo }) {
  const { mensaje, tipo, registrarPunt } = useRegistro(titulo);
  const [cartas, setCartas] = useState([]);
  const [abiertas, setAbiertas] = useState([]);
  const [encontradas, setEncontradas] = useState([]);
  const [fallos, setFallos] = useState(0);
  const [jugando, setJugando] = useState(false);
  const [bloqueo, setBloqueo] = useState(false);

  function empezar() {
    const mazo = [...baraja.slice(0, 8), ...baraja.slice(0, 8)]
      .sort(() => Math.random() - 0.5)
      .map((v, i) => ({ v, i }));
    setCartas(mazo); setAbiertas([]); setEncontradas([]); setFallos(0);
    setJugando(true); setBloqueo(false);
    sfx.clic();
  }

  function tocar(i) {
    if (!jugando || bloqueo || abiertas.includes(i) || encontradas.includes(i)) return;
    const na = [...abiertas, i];
    setAbiertas(na);
    sfx.clic();
    if (na.length === 2) {
      const [a, b] = na;
      if (cartas[a].v === cartas[b].v) {
        const ne = [...encontradas, a, b];
        setEncontradas(ne);
        setAbiertas([]);
        sfx.bien();
        if (ne.length === cartas.length) {
          setJugando(false);
          const puntos = Math.max(100, 900 - fallos * 40);
          registrarPunt(puntos, fallos <= 4 ? 1 : 0);
        }
      } else {
        setBloqueo(true);
        setFallos(f => f + 1);
        setTimeout(() => { setAbiertas([]); setBloqueo(false); }, 650);
      }
    }
  }

  return (
    <GameShell titulo={titulo} emoji={emoji}
      descripcion="Encuentra las 8 parejas · pocos fallos = victoria."
      tira={tira} iconoFondo={iconoFondo}>
      <div className="fila-botones">
        <span className="chip">Parejas: <b>{encontradas.length / 2}/8</b></span>
        <span className="chip">❌ <b>{fallos}</b></span>
      </div>
      {!jugando && encontradas.length === 0 && (
        <div className="fila-botones"><button className="btn-principal" onClick={empezar}>▶ Empezar</button></div>
      )}
      {cartas.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,64px)", gap: 8, justifyContent: "center" }}>
          {cartas.map((c, i) => {
            const visible = abiertas.includes(i) || encontradas.includes(i);
            return (
              <button key={i} onClick={() => tocar(i)} disabled={!jugando && encontradas.length > 0}
                style={{ width: 64, height: 64, fontSize: "1.7rem", borderRadius: 12,
                  background: encontradas.includes(i) ? "rgba(34,197,94,.35)" : visible ? "var(--bg-hover)" : "var(--bg-soft)",
                  border: "2px solid var(--border)" }}>
                {visible ? c.v : "❓"}
              </button>
            );
          })}
        </div>
      )}
      <Resultado mensaje={mensaje} tipo={tipo} />
      {!jugando && encontradas.length > 0 && !mensaje && (
        <div className="fila-botones"><button className="btn-principal" onClick={empezar}>↻ Otra vez</button></div>
      )}
    </GameShell>
  );
}

const P = (titulo, emoji, baraja, tira, iconoFondo) => function Comp() {
  return <ParejasBase titulo={titulo} emoji={emoji} baraja={baraja} tira={tira} iconoFondo={iconoFondo} />;
};

export const ParejasNumeros = P("Parejas de Números", "🔢", ["1", "2", "3", "4", "5", "6", "7", "8"],
  "linear-gradient(135deg,#38bdf8,#6366f1)", "linear-gradient(135deg,#38bdf8,#6366f1)");
export const ParejasLetras = P("Parejas de Letras", "🔤", ["A", "B", "C", "D", "E", "F", "G", "H"],
  "linear-gradient(135deg,#8b5cf6,#ec4899)", "linear-gradient(135deg,#8b5cf6,#ec4899)");
export const ParejasBanderas = P("Parejas de Banderas", "🏳️", ["🇪🇸", "🇲🇽", "🇦🇷", "🇨🇴", "🇨🇱", "🇵🇪", "🇺🇾", "🇪🇨"],
  "linear-gradient(135deg,#f59e0b,#ef4444)", "linear-gradient(135deg,#f59e0b,#ef4444)");
export const ParejasAnimales = P("Parejas de Animales", "🐾", ["🐶", "🐱", "🦊", "🐼", "🦁", "🐸", "🐵", "🐷"],
  "linear-gradient(135deg,#22c55e,#84cc16)", "linear-gradient(135deg,#22c55e,#84cc16)");
export const ParejasFrutas = P("Parejas de Frutas", "🍓", ["🍎", "🍌", "🍊", "🍉", "🍇", "🍍", "🥭", "🍒"],
  "linear-gradient(135deg,#f43f5e,#facc15)", "linear-gradient(135deg,#f43f5e,#facc15)");
export const ParejasDeportes = P("Parejas de Deportes", "🏅", ["⚽", "🏀", "🎾", "🏊", "🚴", "🥊", "⛷️", "🏉"],
  "linear-gradient(135deg,#0ea5e9,#22c55e)", "linear-gradient(135deg,#0ea5e9,#22c55e)");
export const ParejasColores = P("Parejas de Formas", "🔷", ["🔴", "🔵", "🟢", "🟡", "🟣", "🟠", "⭐", "❤️"],
  "linear-gradient(135deg,#a855f7,#f59e0b)", "linear-gradient(135deg,#a855f7,#f59e0b)");
export const ParejasComida = P("Parejas de Comida", "🍕", ["🍕", "🌮", "🍣", "🍔", "🌭", "🍩", "🍿", "🧁"],
  "linear-gradient(135deg,#ea580c,#facc15)", "linear-gradient(135deg,#ea580c,#facc15)");
export const ParejasEspacio = P("Parejas del Espacio", "🪐", ["☀️", "🌙", "⭐", "🪐", "🚀", "🌍", "☄️", "🌌"],
  "linear-gradient(135deg,#0f172a,#7c3aed)", "linear-gradient(135deg,#0f172a,#7c3aed)");
export const ParejasMusica = P("Parejas de Música", "🎶", ["🎹", "🎸", "🎺", "🎻", "🥁", "🎷", "🎤", "🪗"],
  "linear-gradient(135deg,#ec4899,#6366f1)", "linear-gradient(135deg,#ec4899,#6366f1)");
export const ParejasNavidad = P("Parejas de Navidad", "🎄", ["🎄", "🎅", "⭐", "🔔", "🕯️", "🎁", "❄️", "⛄"],
  "linear-gradient(135deg,#166534,#ef4444)", "linear-gradient(135deg,#166534,#ef4444)");
export const ParejasHalloween = P("Parejas de Halloween", "🎃", ["🎃", "👻", "🦇", "🕷️", "🍬", "🌙", "🔮", "💀"],
  "linear-gradient(135deg,#7c2d12,#a855f7)", "linear-gradient(135deg,#7c2d12,#a855f7)");
