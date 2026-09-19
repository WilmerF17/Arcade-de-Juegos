import { useState } from "react";
import GameShell, { useRegistro } from "../ui/GameShell";
import { sfx } from "../suite/sonido";

/* Duelo de Trivia 2P: turnos alternos, 5 preguntas cada uno. */
function DueloTBase({ titulo, banco, tira, iconoFondo }) {
  const { mensaje, tipo, registrarPunt } = useRegistro(titulo);
  const [preg, setPreg] = useState(null);
  const [asks, setAsks] = useState([]);
  const [turno, setTurno] = useState(0);
  const [s, setS] = useState([0, 0]);
  const [jugando, setJugando] = useState(false);

  const POR_JUGADOR = 5;

  function nueva(asksPrev) {
    const resto = asksPrev.length ? asksPrev : [...banco].sort(() => Math.random() - 0.5);
    const q = resto[0];
    const opciones = q.o.map((_, i) => i).sort(() => Math.random() - 0.5);
    setPreg({ ...q, opciones });
    setAsks(resto.slice(1));
  }

  function empezar() {
    setS([0, 0]); setTurno(0); setJugando(true);
    nueva([]);
    sfx.clic();
  }

  function responder(i) {
    if (!jugando) return;
    const j = turno % 2;
    const ns = [...s];
    if (i === preg.ok) {
      ns[j]++;
      setS(ns);
      sfx.bien();
    } else sfx.mal();
    const nt = turno + 1;
    setTurno(nt);
    if (nt >= POR_JUGADOR * 2) {
      setJugando(false);
      setPreg(null);
      if (ns[0] !== ns[1]) sfx.record();
      registrarPunt(ns[0] * 100 + ns[1] * 100, 1);
    } else nueva(asks);
  }

  const fin = !jugando && turno >= POR_JUGADOR * 2;

  return (
    <GameShell titulo={titulo} emoji="⚔️"
      descripcion={`J1 y J2 se turnan · ${POR_JUGADOR} preguntas cada uno.`}
      tira={tira} iconoFondo={iconoFondo}>
      <div className="fila-botones" style={{ marginTop: 0 }}>
        <span className="chip">🔵 J1: <b>{s[0]}</b></span>
        <span className="chip">🔴 J2: <b>{s[1]}</b></span>
        {jugando && <span className="chip">Turno: <b>{turno % 2 === 0 ? "J1 🔵" : "J2 🔴"}</b></span>}
      </div>
      {!jugando && !fin && (
        <div className="fila-botones"><button className="btn-principal" onClick={empezar}>▶ Empezar duelo</button></div>
      )}
      {fin && (
        <p style={{ textAlign: "center", fontSize: "1.3rem" }}>
          {s[0] === s[1] ? "🤝 ¡Empate!" : s[0] > s[1] ? "🏆 ¡Gana J1!" : "🏆 ¡Gana J2!"}
        </p>
      )}
      {jugando && preg && (
        <>
          <p style={{ textAlign: "center", fontSize: "1.15rem" }}><b>{preg.p}</b></p>
          <div style={{ display: "grid", gap: 8 }}>
            {preg.opciones.map(i => (
              <button key={i} className="btn-suave" style={{ padding: "12px" }} onClick={() => responder(i)}>{preg.o[i]}</button>
            ))}
          </div>
        </>
      )}
      {mensaje && <div className={`mensaje-final ${tipo}`}>{mensaje}</div>}
    </GameShell>
  );
}

const GENERAL = [
  { p: "¿Capital de España?", o: ["Madrid", "Roma", "París", "Lima"], ok: 0 },
  { p: "¿2 + 2 × 2?", o: ["6", "8", "4", "10"], ok: 0 },
  { p: "¿Planeta rojo?", o: ["Marte", "Venus", "Júpiter", "Saturno"], ok: 0 },
  { p: "¿Quién pintó la Mona Lisa?", o: ["Da Vinci", "Picasso", "Dalí", "Goya"], ok: 0 },
  { p: "¿Río que pasa por Egipto?", o: ["Nilo", "Amazonas", "Danubio", "Tajo"], ok: 0 },
  { p: "¿Cuántos días tiene un año bisiesto?", o: ["366", "365", "364", "367"], ok: 0 },
  { p: "¿Instrumento de 88 teclas?", o: ["Piano", "Guitarra", "Flauta", "Trompeta"], ok: 0 },
  { p: "¿Animal que da leche?", o: ["Vaca", "Gallina", "Abeja", "Serpiente"], ok: 0 },
  { p: "¿Deporte de 11 por equipo?", o: ["Fútbol", "Tenis", "Golf", "Boxeo"], ok: 0 },
  { p: "¿Color del cielo de día?", o: ["Azul", "Verde", "Rojo", "Negro"], ok: 0 },
  { p: "¿En qué continente está Chile?", o: ["América", "Europa", "Asia", "África"], ok: 0 },
  { p: "¿Qué mide un termómetro?", o: ["Temperatura", "Peso", "Altura", "Tiempo"], ok: 0 },
];
const CULTURA = [
  { p: "¿Quién escribió el Quijote?", o: ["Cervantes", "Lorca", "Neruda", "Bécquer"], ok: 0 },
  { p: "¿Quién pintó el Guernica?", o: ["Picasso", "Dalí", "Miró", "Velázquez"], ok: 0 },
  { p: "¿De dónde es la paella?", o: ["España", "Italia", "México", "Perú"], ok: 0 },
  { p: "¿Qué es un soneto?", o: ["Poema de 14 versos", "Canción", "Cuento", "Ópera"], ok: 0 },
  { p: "¿Instrumento nacional de España?", o: ["Guitarra", "Gaita", "Timbal", "Arpa"], ok: 0 },
  { p: "¿Qué es el flamenco?", o: ["Música y baile", "Comida", "Fiesta de toros", "Idioma"], ok: 0 },
  { p: "¿Quién compuso la 9ª sinfonía?", o: ["Beethoven", "Mozart", "Bach", "Vivaldi"], ok: 0 },
  { p: "¿Qué es una novela?", o: ["Relato largo", "Poema corto", "Noticia", "Carta"], ok: 0 },
  { p: "¿De dónde son los mariachis?", o: ["México", "Cuba", "Colombia", "Chile"], ok: 0 },
  { p: "¿Qué es el teatro?", o: ["Actuación en vivo", "Cine", "Pintura", "Danza sola"], ok: 0 },
  { p: "¿Qué lleva un torero?", o: ["Traje de luces", "Armadura", "Bata", "Smoking"], ok: 0 },
  { p: "¿Qué es una zarzuela?", o: ["Teatro musical español", "Comida", "Baile solo", "Poema"], ok: 0 },
];

export function DueloTrivia() {
  return <DueloTBase titulo="Duelo de Trivia" banco={GENERAL} tira="linear-gradient(135deg,#38bdf8,#6366f1)" iconoFondo="linear-gradient(135deg,#38bdf8,#6366f1)" />;
}
export function DueloCultura() {
  return <DueloTBase titulo="Duelo de Cultura" banco={CULTURA} tira="linear-gradient(135deg,#b45309,#f59e0b)" iconoFondo="linear-gradient(135deg,#b45309,#f59e0b)" />;
}
