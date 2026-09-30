import { useEffect, useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { sfx } from "../suite/sonido";

/* Motor de parejas de memoria con barajas temáticas: dificultad, crono y racha. */
const DIFS = {
  facil: { nombre: "Fácil", pares: 6, cols: 3, tam: 68 },
  normal: { nombre: "Normal", pares: 8, cols: 4, tam: 64 },
  dificil: { nombre: "Difícil", pares: 12, cols: 6, tam: 56 },
};

function ParejasBase({ titulo, emoji, baraja, tira, iconoFondo }) {
  const { mensaje, tipo, registrarPunt } = useRegistro(titulo);
  const [dif, setDif] = useState("normal");
  const [cartas, setCartas] = useState([]);
  const [abiertas, setAbiertas] = useState([]);
  const [encontradas, setEncontradas] = useState([]);
  const [fallos, setFallos] = useState(0);
  const [aciertos, setAciertos] = useState(0);
  const [racha, setRacha] = useState(0);
  const [mejorRacha, setMejorRacha] = useState(0);
  const [segundos, setSegundos] = useState(0);
  const [jugando, setJugando] = useState(false);
  const [bloqueo, setBloqueo] = useState(false);
  const cfg = DIFS[dif];
  const total = cartas.length / 2;

  function empezar() {
    const n = Math.min(cfg.pares, baraja.length);
    const mazo = [...baraja.slice(0, n), ...baraja.slice(0, n)]
      .sort(() => Math.random() - 0.5)
      .map((v, i) => ({ v, i }));
    setCartas(mazo); setAbiertas([]); setEncontradas([]);
    setFallos(0); setAciertos(0); setRacha(0); setMejorRacha(0); setSegundos(0);
    setJugando(true); setBloqueo(false);
    sfx.clic();
  }

  useEffect(() => {
    if (!jugando) return;
    const id = setTimeout(() => setSegundos(s => s + 1), 1000);
    return () => clearTimeout(id);
  }, [jugando, segundos]);

  useEffect(() => {
    if (!jugando && encontradas.length === 0) return;
    const fn = e => {
      if (e.key === "Enter" && !jugando) { e.preventDefault(); empezar(); }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jugando, encontradas, dif]);

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
        const nr = racha + 1;
        setRacha(nr);
        setMejorRacha(m => Math.max(m, nr));
        setAciertos(c => c + 1);
        sfx.bien();
        if (ne.length === cartas.length) {
          setJugando(false);
          const puntos = Math.max(100, 700 + total * 25 - fallos * 40 - segundos + mejorRacha * 10 + (dif === "dificil" ? 150 : dif === "facil" ? -100 : 0));
          registrarPunt(puntos, fallos <= total / 2 ? 1 : 0);
        }
      } else {
        setBloqueo(true);
        setFallos(f => f + 1);
        setRacha(0);
        sfx.mal();
        setTimeout(() => { setAbiertas([]); setBloqueo(false); }, 650);
      }
    }
  }

  return (
    <GameShell titulo={titulo} emoji={emoji}
      descripcion={`Encuentra las ${cfg.pares} parejas · pocos fallos y poco tiempo = más puntos.`}
      tira={tira} iconoFondo={iconoFondo}
      stats={[
        { icono: "🧩", etiqueta: "Parejas", valor: `${encontradas.length / 2}/${total || cfg.pares}` },
        { icono: "❌", etiqueta: "Fallos", valor: fallos },
        { icono: "🔥", etiqueta: "Racha", valor: `${racha} (mejor ${mejorRacha})` },
        { icono: "⏱", etiqueta: "Tiempo", valor: `${segundos}s` },
        { icono: "🎚", etiqueta: "Nivel", valor: cfg.nombre },
      ]}
      ayuda={<>
        <p><b>Objetivo:</b> encuentra todas las parejas del tablero memorizando dónde está cada carta.</p>
        <p><b>Controles:</b> <kbd>clic</kbd> o <kbd>toque</kbd> para voltear · <kbd>Enter</kbd> para empezar otra vez.</p>
        <p><b>Puntos:</b> base por parejas menos fallos y segundos, más bonus por racha sin fallar (difícil +150).</p>
        <p><b>Victoria:</b> completa el tablero con la mitad o menos de fallos que parejas. <b>Consejo:</b> memoriza por zonas y juega las parejas seguras primero para encadenar racha.</p>
      </>}
      acciones={!jugando ? (
        <>
          {Object.entries(DIFS).map(([id, d]) => (
            <button key={id} className={dif === id ? "btn-principal" : "btn-suave"}
              onClick={() => { setDif(id); sfx.clic(); }} aria-pressed={dif === id}>
              {d.nombre} ({d.pares})
            </button>
          ))}
          <button className="btn-principal" onClick={empezar}>
            {encontradas.length > 0 ? "↻ Otra vez" : "▶ Empezar"}
          </button>
        </>
      ) : (
        Object.entries(DIFS).map(([id, d]) => (
          <button key={id} className="chip-cat" disabled title="Termina la partida para cambiar de nivel">
            {d.nombre}
          </button>
        ))
      )}>
      {cartas.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${cfg.cols},${cfg.tam}px)`, gap: 8, justifyContent: "center" }}>
          {cartas.map((c, i) => {
            const visible = abiertas.includes(i) || encontradas.includes(i);
            return (
              <button key={i} onClick={() => tocar(i)} disabled={!jugando && encontradas.length > 0}
                aria-label={visible ? `Carta ${c.v}` : `Carta oculta ${i + 1}`}
                style={{ width: cfg.tam, height: cfg.tam, fontSize: cfg.tam > 60 ? "1.7rem" : "1.4rem", borderRadius: 12,
                  background: encontradas.includes(i) ? "rgba(34,197,94,.35)" : visible ? "var(--bg-hover)" : "var(--bg-soft)",
                  border: "2px solid var(--border)", minHeight: 0 }}>
                {visible ? c.v : "❓"}
              </button>
            );
          })}
        </div>
      )}
      <div className="xp-bar fina" style={{ marginTop: 10 }} aria-hidden>
        <div style={{ width: `${total ? Math.round((encontradas.length / 2 / total) * 100) : 0}%` }} />
      </div>
      <Resultado mensaje={mensaje} tipo={tipo} />
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
export const ParejasDinos = P("Parejas de Dinos", "🦕", ["🦕", "🦖", "🦴", "🥚", "🌋", "🌴", "🦎", "🐾"],
  "linear-gradient(135deg,#166534,#a3e635)", "linear-gradient(135deg,#166534,#a3e635)");
export const ParejasOceano = P("Parejas del Océano", "🐙", ["🐙", "🦈", "🐬", "🐢", "🦀", "🐠", "🦑", "🪸"],
  "linear-gradient(135deg,#0369a1,#22d3ee)", "linear-gradient(135deg,#0369a1,#22d3ee)");
