import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { escribiendo } from "../suite/teclado";

const crearBaraja = () => {
  const palos = ["♠", "♥", "♦", "♣"];
  const baraja = [];
  for (const p of palos) {
    for (let v = 2; v <= 10; v++) baraja.push([`${v}${p}`, v, p]);
    for (const [cara, val] of [["J", 10], ["Q", 10], ["K", 10], ["A", 11]]) baraja.push([cara + p, val, p]);
  }
  for (let i = baraja.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [baraja[i], baraja[j]] = [baraja[j], baraja[i]];
  }
  return baraja;
};

const valor = mano => {
  let total = mano.reduce((s, c) => s + c[1], 0);
  let ases = mano.filter(c => c[0].startsWith("A")).length;
  while (total > 21 && ases) { total -= 10; ases -= 1; }
  return total;
};

function Pips({ n, meta = 5 }) {
  return (
    <span className="bj-pips" aria-label={`${n} de ${meta}`}>
      {Array.from({ length: meta }, (_, i) => <span key={i} className={`bj-pip${i < n ? " on" : ""}`} />)}
    </span>
  );
}

export default function Blackjack() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Blackjack");
  const [baraja, setBaraja] = useState([]);
  const [jugador, setJugador] = useState([]);
  const [crupier, setCrupier] = useState([]);
  const [victorias, setVictorias] = useState(0);
  const [derrotas, setDerrotas] = useState(0);
  const [dobles, setDobles] = useState(0);
  const [ronda, setRonda] = useState("");
  const [terminado, setTerminado] = useState(false);
  const [sesionFin, setSesionFin] = useState(false);
  const stRef = useRef({ victorias: 0, derrotas: 0, terminado: false, sesionFin: false });
  stRef.current = { victorias, derrotas, terminado, sesionFin };

  function nuevaRonda() {
    const b = crearBaraja();
    const jug = [b.pop(), b.pop()];
    const cru = [b.pop(), b.pop()];
    setBaraja(b);
    setJugador(jug);
    setCrupier(cru);
    setTerminado(false); setSesionFin(false);
    stRef.current.terminado = false;
    if (valor(jug) === 21) {
      const nv = victorias + 1;
      setVictorias(nv);
      setRonda("¡BLACKJACK! 21 directo. ✅");
      setTerminado(true);
      stRef.current.terminado = true;
      cerrarSesion(nv, derrotas);
    } else {
      setRonda("");
    }
  }

  function cerrarSesion(nV, nD) {
    if (nV >= 5 || nD >= 5) {
      registrarPunt(nV * 10, nV >= 5 ? 1 : 0, nV + nD);
      setSesionFin(true);
      stRef.current.sesionFin = true;
    }
  }

  function pedir() {
    if (stRef.current.terminado || !jugador.length) return;
    const nb = [...baraja];
    const carta = nb.pop();
    if (!carta) return;
    const mano = [...jugador, carta];
    setBaraja(nb); setJugador(mano);
    if (valor(mano) > 21) {
      setRonda("Te pasaste de 21. Pierdes la ronda. ❌");
      setTerminado(true);
      stRef.current.terminado = true;
      const nd = derrotas + 1; setDerrotas(nd);
      cerrarSesion(victorias, nd);
    }
  }

  function plantarseCon(manoFinal) {
    let c = [...crupier];
    const b = [...baraja];
    while (valor(c) < 17 && b.length) c = [...c, b.pop()];
    setBaraja(b); setCrupier(c);
    const vj = valor(manoFinal), vc = valor(c);
    if (vc > 21 || vj > vc) {
      setRonda(`Ganas la ronda (${vj} vs ${vc}). ✅`);
      const nv = victorias + 1; setVictorias(nv);
      cerrarSesion(nv, derrotas);
    } else if (vj === vc) {
      setRonda(`Empate (${vj}). 🤝`);
    } else {
      setRonda(`Pierdes la ronda (${vj} vs ${vc}). ❌`);
      const nd = derrotas + 1; setDerrotas(nd);
      cerrarSesion(victorias, nd);
    }
    setTerminado(true);
    stRef.current.terminado = true;
  }

  function plantarse() { if (!stRef.current.terminado && jugador.length) plantarseCon(jugador); }
  function doblar() {
    if (stRef.current.terminado || jugador.length !== 2) return;
    const nb = [...baraja];
    const carta = nb.pop();
    if (!carta) return;
    const mano = [...jugador, carta];
    setBaraja(nb); setJugador(mano);
    setDobles(d => d + 1);
    if (valor(mano) > 21) {
      setRonda("Te pasaste al doblar. Pierdes. ❌");
      setTerminado(true);
      stRef.current.terminado = true;
      const nd = derrotas + 1; setDerrotas(nd);
      cerrarSesion(victorias, nd);
    } else {
      plantarseCon(mano);
    }
  }

  const pedirRef = useRef(pedir); pedirRef.current = pedir;
  const plantarseRef = useRef(plantarse); plantarseRef.current = plantarse;
  const doblarRef = useRef(doblar); doblarRef.current = doblar;
  const nuevaRef = useRef(nuevaRonda); nuevaRef.current = nuevaRonda;

  // Teclado: C/H pedir · P plantarse · D doblar · N nueva ronda
  useEffect(() => {
    const fn = e => {
      if (escribiendo()) return;
      const k = e.key.toLowerCase();
      if (k === "c" || k === "h") pedirRef.current();
      else if (k === "p") plantarseRef.current();
      else if (k === "d") doblarRef.current();
      else if (k === "n" || k === "enter") {
        if (!jugador.length || stRef.current.terminado) nuevaRef.current();
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jugador, baraja, crupier, victorias, derrotas]);

  const paloRojo = p => p === "♥" || p === "♦";

  return (
    <GameShell titulo="Blackjack" emoji="🃏"
      descripcion="Acércate a 21 sin pasarte y gana a la banca. Primero en llegar a 5 rondas."
      stats={[
        { etiqueta: "Tú", valor: victorias },
        { etiqueta: "Banca", valor: derrotas },
        { etiqueta: "Dobles", valor: dobles },
      ]}
      resultado={sesionFin ? { mensaje, tipo } : null}
      ayuda={<>
        <span>Las figuras valen <b>10</b> y el As vale <b>11 u 1</b> según convenga.</span>
        <span>La banca pide hasta <b>17</b>. Gana la sesión quien llegue a <b>5 rondas</b>.</span>
        <span>Teclas: <kbd>C</kbd> pedir · <kbd>P</kbd> plantarse · <kbd>D</kbd> doblar · <kbd>N</kbd> ronda.</span>
      </>}>
      <div className="fila-botones">
        <button className="btn-exito" onClick={nuevaRonda}>{jugador.length ? "↻ Nueva partida" : "🃏 Repartir"}</button>
        <Pips n={victorias} />
      </div>
      {jugador.length > 0 && (
        <div className="bj-mesa">
          <div className="bj-zona">
            <p className="bj-zona-titulo">🧑 Tu mano <span className="bj-total">{valor(jugador)}</span></p>
            <div className="bj-cartas">
              {jugador.map((c, i) => (
                <span key={`${c[0]}-${i}`} className={`btn-carta${paloRojo(c[2]) ? " rojo" : ""}`}>{c[0]}</span>
              ))}
            </div>
          </div>
          <div className="bj-zona">
            <p className="bj-zona-titulo">🖥️ Banca <span className="bj-total">{terminado ? valor(crupier) : "?"}</span></p>
            <div className="bj-cartas">
              {crupier.map((c, i) => (
                <span key={`${c[0]}-${i}`} className={`btn-carta${!terminado && i > 0 ? " oculta" : paloRojo(c[2]) ? " rojo" : ""}`}>
                  {!terminado && i > 0 ? "?" : c[0]}
                </span>
              ))}
            </div>
          </div>
          {!terminado && valor(jugador) < 21 && (
            <div className="fila-botones" style={{ marginTop: 14 }}>
              <button className="btn-principal" onClick={pedir}>Pedir 🂠 (C)</button>
              <button className="btn-suave" style={{ color: "#fff" }} onClick={plantarse}>Plantarme (P)</button>
              {jugador.length === 2 && <button className="btn-exito" onClick={doblar}>Doblar ×2 (D)</button>}
            </div>
          )}
          {ronda && <p className="bj-ronda">{ronda}</p>}
          {terminado && !sesionFin && (
            <div className="fila-botones" style={{ marginTop: 12 }}>
              <button className="btn-exito" onClick={nuevaRonda}>Siguiente ronda (N)</button>
            </div>
          )}
        </div>
      )}
    </GameShell>
  );
}
