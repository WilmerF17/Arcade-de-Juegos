import { useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { sfx } from "../suite/sonido";

/* Motor de banderas: ¿de qué país es esta bandera? 8 rondas. */
/* banco: [banderaEmoji, país] */
function BanderaBase({ titulo, emoji, banco, tira, iconoFondo }) {
  const { mensaje, tipo, registrarPunt } = useRegistro(titulo);
  const [ronda, setRonda] = useState(null);
  const [asks, setAsks] = useState([]);
  const [idx, setIdx] = useState(0);
  const [puntos, setPuntos] = useState(0);
  const [racha, setRacha] = useState(0);
  const [jugando, setJugando] = useState(false);

  const RONDAS = 8;

  function nuevaRonda(asksPrev) {
    const resto = asksPrev.length ? asksPrev : [...banco].sort(() => Math.random() - 0.5);
    const [band, pais] = resto[0];
    const dist = [...banco].filter(([, p]) => p !== pais).sort(() => Math.random() - 0.5).slice(0, 3).map(([, p]) => p);
    setRonda({ band, pais, opciones: [pais, ...dist].sort(() => Math.random() - 0.5) });
    setAsks(resto.slice(1));
  }

  function empezar() {
    setPuntos(0); setRacha(0); setIdx(1); setJugando(true);
    nuevaRonda([]);
    sfx.clic();
  }

  function elegir(p) {
    if (!jugando) return;
    if (p === ronda.pais) {
      const nr = racha + 1;
      const np = puntos + 100 + Math.min(50, nr * 10);
      setRacha(nr); setPuntos(np);
      sfx.bien();
    } else {
      setRacha(0);
      sfx.mal();
    }
    if (idx >= RONDAS) {
      setJugando(false);
      registrarPunt(puntos + (p === ronda.pais ? 100 : 0), puntos >= 500 ? 1 : 0);
    } else {
      nuevaRonda(asks);
      setIdx(idx + 1);
    }
  }

  return (
    <GameShell titulo={titulo} emoji={emoji}
      descripcion="¿De qué país es esta bandera? · 8 rondas."
      tira={tira} iconoFondo={iconoFondo}>
      <div className="fila-botones">
        <span className="chip">Ronda: <b>{jugando ? `${idx}/${RONDAS}` : "—"}</b></span>
        <span className="chip">Puntos: <b>{puntos}</b></span>
        <span className="chip">🔥 <b>{racha}</b></span>
      </div>
      {!jugando && idx === 0 && (
        <div className="fila-botones"><button className="btn-principal" onClick={empezar}>▶ Empezar</button></div>
      )}
      {jugando && ronda && (
        <>
          <p style={{ textAlign: "center", fontSize: "4.5rem", margin: "4px 0" }}>{ronda.band}</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {ronda.opciones.map(o => (
              <button key={o} className="btn-suave" style={{ padding: "14px 8px" }} onClick={() => elegir(o)}>{o}</button>
            ))}
          </div>
        </>
      )}
      <Resultado mensaje={mensaje} tipo={tipo} />
      {!jugando && idx > 0 && !mensaje && (
        <div className="fila-botones"><button className="btn-principal" onClick={empezar}>↻ Otra vez</button></div>
      )}
    </GameShell>
  );
}

const BD = (titulo, emoji, banco, tira, iconoFondo) => function Comp() {
  return <BanderaBase titulo={titulo} emoji={emoji} banco={banco} tira={tira} iconoFondo={iconoFondo} />;
};

export const BanderasAmerica = BD("Banderas: América", "🌎", [
  ["🇲🇽", "México"], ["🇦🇷", "Argentina"], ["🇨🇱", "Chile"], ["🇨🇴", "Colombia"],
  ["🇵🇪", "Perú"], ["🇧🇷", "Brasil"], ["🇨🇺", "Cuba"], ["🇪🇨", "Ecuador"],
  ["🇺🇸", "EE. UU."], ["🇨🇦", "Canadá"], ["🇺🇾", "Uruguay"], ["🇻🇪", "Venezuela"],
], "linear-gradient(135deg,#ef4444,#f59e0b)", "linear-gradient(135deg,#ef4444,#f59e0b)");

export const BanderasEuropa = BD("Banderas: Europa", "🏰", [
  ["🇪🇸", "España"], ["🇫🇷", "Francia"], ["🇮🇹", "Italia"], ["🇩🇪", "Alemania"],
  ["🇵🇹", "Portugal"], ["🇬🇧", "Reino Unido"], ["🇬🇷", "Grecia"], ["🇳🇱", "Países Bajos"],
  ["🇸🇪", "Suecia"], ["🇵🇱", "Polonia"], ["🇮🇪", "Irlanda"], ["🇳🇴", "Noruega"],
], "linear-gradient(135deg,#0ea5e9,#6366f1)", "linear-gradient(135deg,#0ea5e9,#6366f1)");

export const BanderasAsia = BD("Banderas: Asia y África", "🌏", [
  ["🇯🇵", "Japón"], ["🇨🇳", "China"], ["🇮🇳", "India"], ["🇰🇷", "Corea del Sur"],
  ["🇲🇦", "Marruecos"], ["🇪🇬", "Egipto"], ["🇿🇦", "Sudáfrica"], ["🇳🇬", "Nigeria"],
  ["🇹🇷", "Turquía"], ["🇹🇭", "Tailandia"], ["🇰🇪", "Kenia"], ["🇬🇭", "Ghana"],
], "linear-gradient(135deg,#f59e0b,#16a34a)", "linear-gradient(135deg,#f59e0b,#16a34a)");
