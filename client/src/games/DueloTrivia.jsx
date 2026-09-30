import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { sfx } from "../suite/sonido";
import { escribiendo } from "../suite/teclado";

/* Duelo de Trivia 2P: turnos alternos. */
function DueloTBase({ titulo, banco, tira, iconoFondo }) {
  const { mensaje, tipo, registrarPunt } = useRegistro(titulo);
  const [preg, setPreg] = useState(null);
  const [asks, setAsks] = useState([]);
  const [turno, setTurno] = useState(0);
  const [s, setS] = useState([0, 0]);
  const [n1, setN1] = useState("J1");
  const [n2, setN2] = useState("J2");
  const [meta, setMeta] = useState(5);
  const POR_JUGADOR = meta;
  const [jugando, setJugando] = useState(false);
  const jugandoRef = useRef(false);
  jugandoRef.current = jugando;
  const responderRef = useRef(null);

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
      else sfx.moneda();
      registrarPunt(ns[0] * 100 + ns[1] * 100, 1);
    } else nueva(asks);
  }
  responderRef.current = responder;

  useEffect(() => {
    const fn = e => {
      if (escribiendo()) return;
      if ((e.key === "Enter" || e.key === " ") && !jugandoRef.current) {
        e.preventDefault();
        empezar();
        return;
      }
      if (!jugandoRef.current || !preg) return;
      const m = { 1: 0, 2: 1, 3: 2, 4: 3, a: 0, b: 1, c: 2, d: 3 };
      const k = e.key.toLowerCase();
      if (m[k] != null) {
        const orden = preg.opciones[m[k]];
        if (orden != null) {
          e.preventDefault();
          responderRef.current(orden);
        }
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jugando, preg, asks, turno, s, POR_JUGADOR, n1, n2]);

  const fin = !jugando && turno >= POR_JUGADOR * 2;
  const pct = Math.round((turno / (POR_JUGADOR * 2)) * 100);

  return (
    <GameShell titulo={titulo} emoji="⚔️"
      descripcion={`${n1} y ${n2} se turnan · ${POR_JUGADOR} preguntas cada uno.`}
      tira={tira} iconoFondo={iconoFondo}
      stats={[
        { icono: "🔵", etiqueta: n1 || "J1", valor: s[0] },
        { icono: "🏁", etiqueta: "Turno", valor: `${Math.min(turno + 1, POR_JUGADOR * 2)}/${POR_JUGADOR * 2}` },
        { icono: "🔴", etiqueta: n2 || "J2", valor: s[1] },
        { icono: "🎯", etiqueta: "Modo", valor: `${POR_JUGADOR} por jugador` },
      ]}
      acciones={!jugando ? <button className="btn-principal" onClick={empezar}>{fin ? "↻ Revancha" : "▶ Empezar duelo"}</button> : null}
      ayuda={<>
        <span>Duelo por turnos: cada jugador responde <b>{POR_JUGADOR} preguntas</b> alternándose. Cada acierto suma un punto a su marcador.</span>
        <span>Controles: clic o dedo en la respuesta; teclado <kbd>1</kbd>–<kbd>4</kbd> o <kbd>A</kbd>–<kbd>D</kbd>. <kbd>ENTER</kbd> empieza.</span>
        <span>Puntuación: al final se registra la suma de ambos. Modos: <b>3, 5 o 7 preguntas</b> por jugador.</span>
        <span>Consejo: el turno se muestra arriba: no respondas la pregunta del rival.</span>
      </>}>
      {!jugando && !fin && (
        <>
          <div className="fila-botones">
            <label className="chip">🔵 <input value={n1} onChange={e => setN1(e.target.value.slice(0, 10))} style={{ width: 70 }} aria-label="Nombre jugador 1" /></label>
            <label className="chip">🔴 <input value={n2} onChange={e => setN2(e.target.value.slice(0, 10))} style={{ width: 70 }} aria-label="Nombre jugador 2" /></label>
          </div>
          <div className="fila-botones" role="group" aria-label="Preguntas por jugador">
            {[3, 5, 7].map(m => (
              <button key={m} className={POR_JUGADOR === m ? "btn-principal" : "btn-suave"} onClick={() => { setMeta(m); sfx.clic(); }}>{m} por jugador</button>
            ))}
          </div>
        </>
      )}
      <div className="xp-bar fina" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Progreso del duelo"><div style={{ width: `${pct}%` }} /></div>
      {jugando && <p style={{ textAlign: "center" }}>Turno: <b>{turno % 2 === 0 ? `${n1} 🔵` : `${n2} 🔴`}</b></p>}
      {fin && (
        <p style={{ textAlign: "center", fontSize: "1.3rem" }}>
          {s[0] === s[1] ? "🤝 ¡Empate!" : s[0] > s[1] ? `🏆 ¡Gana ${n1}!` : `🏆 ¡Gana ${n2}!`}
        </p>
      )}
      {jugando && preg && (
        <>
          <p style={{ textAlign: "center", fontSize: "1.15rem" }}><b>{preg.p}</b></p>
          <div style={{ display: "grid", gap: 8 }}>
            {preg.opciones.map((i, pos) => (
              <button key={i} className="btn-suave" style={{ padding: "12px" }} onClick={() => responder(i)}>{preg.o[i]} <kbd style={{ fontSize: ".75rem" }}>{pos + 1}</kbd></button>
            ))}
          </div>
        </>
      )}
      <Resultado mensaje={mensaje} tipo={tipo} />
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
