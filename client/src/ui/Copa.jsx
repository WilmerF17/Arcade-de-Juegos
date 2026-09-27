import { useState } from "react";
import GameShell from "./GameShell";
import { JUEGOS } from "../games/GAMES";
import { IconoJuego } from "./Iconos";
import { listarPerfiles } from "../suite/perfiles";
import { sfx } from "../suite/sonido";

const PISCINA = ["pelea", "peleaduelo", "tiroteo", "dueloamanecer", "dueloreflejos",
  "duelolargo", "dados2p", "dados2plargo", "duelotrivia", "duelocultura", "pong2p", "copa"];
const JUEGOS_COPA = PISCINA.filter(id => JUEGOS[id]);

function sortear(n, usados) {
  const libres = JUEGOS_COPA.filter(id => !usados.includes(id));
  const pool = libres.length >= n ? libres : [...JUEGOS_COPA];
  const a = [...pool];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, n);
}

/** Copa Familiar: torneo por rondas entre 2 perfiles, cada ronda otro juego. */
export default function Copa({ onIr }) {
  const [perfiles] = useState(() => listarPerfiles());
  const [a, setA] = useState(() => perfiles[0]?.id || "");
  const [b, setB] = useState(() => perfiles[1]?.id || perfiles[0]?.id || "");
  const [rondas, setRondas] = useState(3);
  const [juegos, setJuegos] = useState([]);
  const [idx, setIdx] = useState(0);
  const [puntos, setPuntos] = useState([0, 0]);
  const [fin, setFin] = useState(false);

  const pa = perfiles.find(p => p.id === a);
  const pb = perfiles.find(p => p.id === b);
  const actual = juegos[idx];

  function empezar() {
    if (!pa || !pb || a === b) return;
    setJuegos(sortear(rondas, []));
    setIdx(0); setPuntos([0, 0]); setFin(false);
    sfx.clic();
  }
  function punto(ganaA, empate = false) {
    if (!empate) {
      const n = [...puntos];
      n[ganaA ? 0 : 1] += 1;
      setPuntos(n);
    }
    sfx.bien();
    if (idx + 1 >= juegos.length) setFin(true);
    else setIdx(idx + 1);
  }

  const campeon = fin ? (puntos[0] === puntos[1] ? null : puntos[0] > puntos[1] ? pa : pb) : null;

  return (
    <GameShell titulo="Copa Familiar" emoji="🏆"
      descripcion="Torneo en casa: elige 2 jugadores y a ganar rondas en juegos sorpresa."
      stats={juegos.length > 0 && !fin ? [
        { etiqueta: pa?.nombre, valor: puntos[0] },
        { etiqueta: "Ronda", valor: `${idx + 1}/${juegos.length}` },
        { etiqueta: pb?.nombre, valor: puntos[1] },
      ] : []}
      ayuda={<span>Cada ronda sale un juego al azar (sin repetir). Jueguen la partida y marquen quién ganó. Empate = nadie suma. Gana quien más rondas se lleve.</span>}>
      {juegos.length === 0 && (
        <>
          <div className="fila-botones">
            <label className="chip">P1: <select value={a} onChange={e => setA(e.target.value)} aria-label="Jugador 1">
              {perfiles.map(p => <option key={p.id} value={p.id}>{p.emoji} {p.nombre}</option>)}
            </select></label>
            <label className="chip">P2: <select value={b} onChange={e => setB(e.target.value)} aria-label="Jugador 2">
              {perfiles.map(p => <option key={p.id} value={p.id}>{p.emoji} {p.nombre}</option>)}
            </select></label>
            {[3, 5].map(n => (
              <button key={n} className={rondas === n ? "btn-principal" : "btn-suave"} onClick={() => { setRondas(n); sfx.clic(); }}>{n} rondas</button>
            ))}
          </div>
          <div className="fila-botones">
            <button className="btn-principal" onClick={empezar} disabled={!pa || !pb || a === b}>
              {a === b ? "Elige 2 distintos" : "▶️ ¡Que empiece la copa!"}
            </button>
          </div>
        </>
      )}
      {actual && !fin && (
        <>
          <p style={{ textAlign: "center", fontSize: "1.1rem" }}>
            Ronda {idx + 1}: <b>{JUEGOS[actual].nombre}</b> {JUEGOS[actual].emoji}
          </p>
          <div className="fila-botones">
            <button className="btn-principal" onClick={() => onIr(actual)}>
              <IconoJuego id={actual} size={18} /> Jugar
            </button>
          </div>
          <div className="fila-botones">
            <button className="btn-exito" onClick={() => punto(true)}>🏅 Ganó {pa?.nombre}</button>
            <button className="btn-suave" onClick={() => punto(false, true)}>Empate</button>
            <button className="btn-exito" onClick={() => punto(false)}>🏅 Ganó {pb?.nombre}</button>
          </div>
        </>
      )}
      {fin && (
        <>
          <p style={{ textAlign: "center", fontSize: "1.4rem" }}>
            {campeon ? `🏆 ¡${campeon.emoji} ${campeon.nombre} campeona la copa! ${puntos[0]}–${puntos[1]}` : `🤝 ¡Empate legendario! ${puntos[0]}–${puntos[1]}`}
          </p>
          <div className="fila-botones">
            <button className="btn-principal" onClick={() => { setJuegos([]); setFin(false); }}>🔁 Otra copa</button>
            <button className="btn-suave" onClick={() => onIr("familia")}>🏠 Ver tabla</button>
          </div>
        </>
      )}
    </GameShell>
  );
}
