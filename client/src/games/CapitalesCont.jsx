import { useState } from "react";
import GameShell, { useRegistro } from "../ui/GameShell";
import { sfx } from "../suite/sonido";

/* Motor de capitales por continente: ¿capital de…? 8 rondas. */
/* banco: [país, capital] */
function CapBase({ titulo, emoji, banco, tira, iconoFondo }) {
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
    const [pais, cap] = resto[0];
    const dist = [...banco].filter(([, c]) => c !== cap).sort(() => Math.random() - 0.5).slice(0, 3).map(([, c]) => c);
    setRonda({ pais, cap, opciones: [cap, ...dist].sort(() => Math.random() - 0.5) });
    setAsks(resto.slice(1));
  }

  function empezar() {
    setPuntos(0); setRacha(0); setIdx(1); setJugando(true);
    nuevaRonda([]);
    sfx.clic();
  }

  function elegir(c) {
    if (!jugando) return;
    if (c === ronda.cap) {
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
      registrarPunt(puntos + (c === ronda.cap ? 100 : 0), puntos >= 500 ? 1 : 0);
    } else {
      nuevaRonda(asks);
      setIdx(idx + 1);
    }
  }

  return (
    <GameShell titulo={titulo} emoji={emoji}
      descripcion="¿Capital de…? · 8 rondas · rachas con bonus."
      tira={tira} iconoFondo={iconoFondo}>
      <div className="fila-botones" style={{ marginTop: 0 }}>
        <span className="chip">Ronda: <b>{jugando ? `${idx}/${RONDAS}` : "—"}</b></span>
        <span className="chip">Puntos: <b>{puntos}</b></span>
        <span className="chip">🔥 <b>{racha}</b></span>
      </div>
      {!jugando && idx === 0 && (
        <div className="fila-botones"><button className="btn-principal" onClick={empezar}>▶ Empezar</button></div>
      )}
      {jugando && ronda && (
        <>
          <p style={{ textAlign: "center", fontSize: "1.3rem" }}>¿Capital de <b>{ronda.pais}</b>?</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {ronda.opciones.map(o => (
              <button key={o} className="btn-suave" style={{ padding: "14px 8px" }} onClick={() => elegir(o)}>{o}</button>
            ))}
          </div>
        </>
      )}
      {mensaje && <div className={`mensaje-final ${tipo}`}>{mensaje}</div>}
      {!jugando && idx > 0 && !mensaje && (
        <div className="fila-botones"><button className="btn-principal" onClick={empezar}>↻ Otra vez</button></div>
      )}
    </GameShell>
  );
}

const CC = (titulo, emoji, banco, tira, iconoFondo) => function Comp() {
  return <CapBase titulo={titulo} emoji={emoji} banco={banco} tira={tira} iconoFondo={iconoFondo} />;
};

export const CapAmerica = CC("Capitales: América", "🗽", [
  ["México", "Ciudad de México"], ["Argentina", "Buenos Aires"], ["Chile", "Santiago"],
  ["Colombia", "Bogotá"], ["Perú", "Lima"], ["Brasil", "Brasilia"],
  ["Cuba", "La Habana"], ["Ecuador", "Quito"], ["EE. UU.", "Washington D. C."], ["Canadá", "Ottawa"],
], "linear-gradient(135deg,#ef4444,#f59e0b)", "linear-gradient(135deg,#ef4444,#f59e0b)");

export const CapEuropa = CC("Capitales: Europa", "🏰", [
  ["España", "Madrid"], ["Francia", "París"], ["Italia", "Roma"],
  ["Alemania", "Berlín"], ["Portugal", "Lisboa"], ["Reino Unido", "Londres"],
  ["Grecia", "Atenas"], ["Países Bajos", "Ámsterdam"], ["Suecia", "Estocolmo"], ["Polonia", "Varsovia"],
], "linear-gradient(135deg,#0ea5e9,#6366f1)", "linear-gradient(135deg,#0ea5e9,#6366f1)");

export const CapAsia = CC("Capitales: Asia", "⛩️", [
  ["Japón", "Tokio"], ["China", "Pekín"], ["India", "Nueva Delhi"],
  ["Corea del Sur", "Seúl"], ["Tailandia", "Bangkok"], ["Vietnam", "Hanói"],
  ["Turquía", "Ankara"], ["Israel", "Jerusalén"], ["Egipto", "El Cairo"], ["Arabia Saudí", "Riad"],
], "linear-gradient(135deg,#f59e0b,#a855f7)", "linear-gradient(135deg,#f59e0b,#a855f7)");

export const CapAfrica = CC("Capitales: África", "🦁", [
  ["Marruecos", "Rabat"], ["Argelia", "Argel"], ["Túnez", "Túnez"],
  ["Etiopía", "Adís Abeba"], ["Kenia", "Nairobi"], ["Nigeria", "Abuya"],
  ["Ghana", "Acra"], ["Senegal", "Dakar"], ["Sudáfrica", "Pretoria"], ["Madagascar", "Antananarivo"],
], "linear-gradient(135deg,#eab308,#16a34a)", "linear-gradient(135deg,#eab308,#16a34a)");

export const CapOceania = CC("Capitales: Oceanía", "🏝️", [
  ["Australia", "Canberra"], ["Nueva Zelanda", "Wellington"], ["Fiyi", "Suva"],
  ["Samoa", "Apia"], ["Tonga", "Nukualofa"], ["Vanuatu", "Port Vila"],
  ["Australia", "Canberra"], ["Nueva Zelanda", "Wellington"], ["Fiyi", "Suva"], ["Palaos", "Ngerulmud"],
], "linear-gradient(135deg,#22d3ee,#0ea5e9)", "linear-gradient(135deg,#22d3ee,#0ea5e9)");
