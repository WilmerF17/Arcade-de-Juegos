import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { sfx } from "../suite/sonido";
import { escribiendo } from "../suite/teclado";

/* Motor de banderas: ¿de qué país es esta bandera? */
const CONF_DIF = { 1: { rondas: 6, nombre: "Fácil" }, 2: { rondas: 8, nombre: "Normal" }, 3: { rondas: 10, nombre: "Difícil" } };
function BanderaBase({ titulo, emoji, banco, tira, iconoFondo }) {
  const { mensaje, tipo, registrarPunt } = useRegistro(titulo);
  const [ronda, setRonda] = useState(null);
  const [asks, setAsks] = useState([]);
  const [idx, setIdx] = useState(0);
  const [puntos, setPuntos] = useState(0);
  const [racha, setRacha] = useState(0);
  const [mejorRacha, setMejorRacha] = useState(0);
  const [aciertos, setAciertos] = useState(0);
  const [dif, setDif] = useState(2);
  const RONDAS = CONF_DIF[dif].rondas;
  const [jugando, setJugando] = useState(false);
  const jugandoRef = useRef(false);
  jugandoRef.current = jugando;
  const elegirRef = useRef(null);

  function nuevaRonda(asksPrev) {
    const resto = asksPrev.length ? asksPrev : [...banco].sort(() => Math.random() - 0.5);
    const [band, pais] = resto[0];
    const dist = [...banco].filter(([, p]) => p !== pais).sort(() => Math.random() - 0.5).slice(0, 3).map(([, p]) => p);
    setRonda({ band, pais, opciones: [pais, ...dist].sort(() => Math.random() - 0.5) });
    setAsks(resto.slice(1));
  }

  function empezar() {
    setPuntos(0); setRacha(0); setMejorRacha(0); setAciertos(0); setIdx(1); setJugando(true);
    nuevaRonda([]);
    sfx.clic();
  }

  function elegir(p) {
    if (!jugando) return;
    const ok = p === ronda.pais;
    let np = puntos;
    if (ok) {
      const nr = racha + 1;
      np = puntos + 100 + Math.min(50, nr * 10);
      setRacha(nr); setPuntos(np);
      setMejorRacha(m => Math.max(m, nr));
      setAciertos(a => a + 1);
      sfx.bien();
    } else {
      setRacha(0);
      sfx.mal();
    }
    if (idx >= RONDAS) {
      setJugando(false);
      registrarPunt(np + (ok ? 0 : 0), np >= 500 ? 1 : 0);
    } else {
      nuevaRonda(asks);
      setIdx(idx + 1);
    }
  }
  elegirRef.current = elegir;

  useEffect(() => {
    const fn = e => {
      if (escribiendo()) return;
      if ((e.key === "Enter" || e.key === " ") && !jugandoRef.current) {
        e.preventDefault();
        empezar();
        return;
      }
      if (!jugandoRef.current || !ronda) return;
      const m = { 1: 0, 2: 1, 3: 2, 4: 3, a: 0, b: 1, c: 2, d: 3 };
      const k = e.key.toLowerCase();
      if (m[k] != null && ronda.opciones[m[k]]) {
        e.preventDefault();
        elegirRef.current(ronda.opciones[m[k]]);
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jugando, ronda, asks, idx, puntos, racha, dif]);

  const pct = idx > 0 ? Math.round(((idx - 1) / RONDAS) * 100) : 0;

  return (
    <GameShell titulo={titulo} emoji={emoji}
      descripcion={`¿De qué país es esta bandera? · ${RONDAS} rondas.`}
      tira={tira} iconoFondo={iconoFondo}
      stats={[
        { icono: "🏁", etiqueta: "Ronda", valor: jugando ? `${idx}/${RONDAS}` : idx > 0 ? `${RONDAS}/${RONDAS}` : `0/${RONDAS}` },
        { icono: "⭐", etiqueta: "Puntos", valor: puntos },
        { icono: "🔥", etiqueta: "Racha", valor: `×${racha}` },
        { icono: "🎯", etiqueta: "Dificultad", valor: CONF_DIF[dif].nombre },
      ]}
      acciones={!jugando ? <button className="btn-principal" onClick={empezar}>{idx > 0 ? "↻ Otra vez" : "▶ Empezar"}</button> : null}
      ayuda={<>
        <span>Mira la bandera y elige su país entre <b>4 opciones</b>: cada acierto suma <b>100 + bonus de racha</b> (hasta +50).</span>
        <span>Controles: clic o dedo en la opción; teclado <kbd>1</kbd>–<kbd>4</kbd> o <kbd>A</kbd>–<kbd>D</kbd>. <kbd>ENTER</kbd> o <kbd>ESPACIO</kbd> empieza.</span>
        <span>Puntuación: con <b>500+</b> la partida cuenta como victoria. Dificultad: <b>Fácil 6 rondas</b>, <b>Normal 8</b>, <b>Difícil 10</b>.</span>
        <span>Consejo: descarta primero las que seguro que no son para fallar menos.</span>
      </>}>
      {!jugando && idx === 0 && (
        <div className="fila-botones" role="group" aria-label="Dificultad">
          {[1, 2, 3].map(d => (
            <button key={d} className={dif === d ? "btn-principal" : "btn-suave"} onClick={() => { setDif(d); sfx.clic(); }}>{d === 1 ? "🟢 Fácil" : d === 2 ? "🟡 Normal" : "🔴 Difícil"}</button>
          ))}
        </div>
      )}
      <div className="xp-bar fina" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Progreso"><div style={{ width: `${pct}%` }} /></div>
      {jugando && ronda && (
        <>
          <p style={{ textAlign: "center", fontSize: "4.5rem", margin: "4px 0" }}>{ronda.band}</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {ronda.opciones.map((o, i) => (
              <button key={o} className="btn-suave" style={{ padding: "14px 8px" }} onClick={() => elegir(o)}>{o} <kbd style={{ fontSize: ".75rem" }}>{i + 1}</kbd></button>
            ))}
          </div>
          <p style={{ textAlign: "center", color: "var(--texto-suave)" }}>✅ {aciertos} aciertos{mejorRacha >= 2 && <> · 🔥 mejor ×{mejorRacha}</>}</p>
        </>
      )}
      <Resultado mensaje={mensaje} tipo={tipo} />
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
