import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { escribiendo } from "../suite/teclado";
import { sfx } from "../suite/sonido";

const BASICO = { p: ["piedra", "🪨"], a: ["papel", "📄"], t: ["tijeras", "✂️"] };
const AVANZADO = { ...BASICO, l: ["lagarto", "🦎"], s: ["spock", "🖖"] };

const VENCE = new Set([
  "piedra,tijeras", "piedra,lagarto", "papel,piedra", "papel,spock",
  "tijeras,papel", "tijeras,lagarto", "lagarto,spock", "lagarto,papel",
  "spock,tijeras", "spock,piedra",
]);

const METAS = [3, 5, 7];

export default function RPS() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Piedra Papel Tijeras");
  const [avanzado, setAvanzado] = useState(false);
  const [meta, setMeta] = useState(3);
  const [marca, setMarca] = useState(0);
  const [maquina, setMaquina] = useState(0);
  const [empates, setEmpates] = useState(0);
  const [ultimo, setUltimo] = useState(null);
  const [fin, setFin] = useState(false);
  const [mejor, setMejor] = useState(null);
  const stRef = useRef({ marca: 0, maquina: 0, fin: false, avanzado: false, meta: 3 });
  stRef.current = { marca, maquina, fin, avanzado, meta };

  function jugar(key) {
    const { marca: m0, maquina: q0, fin: f, avanzado: av, meta: mt } = stRef.current;
    if (f) return;
    const opciones = av ? AVANZADO : BASICO;
    if (!opciones[key]) return;
    sfx.clic();
    const claves = Object.keys(opciones);
    const maq = claves[Math.floor(Math.random() * claves.length)];
    const resultado = key === maq ? "empate"
      : VENCE.has(`${opciones[key][0]},${opciones[maq][0]}`) ? "tu" : "maq";
    setUltimo({ tu: opciones[key], maq: opciones[maq], resultado });
    let nm = m0, mk = q0;
    if (resultado === "tu") { nm++; setMarca(nm); sfx.bien(); }
    else if (resultado === "maq") { mk++; setMaquina(mk); sfx.mal(); }
    else setEmpates(e => e + 1);
    if (nm >= mt || mk >= mt) {
      const gano = nm >= mt;
      registrarPunt(nm * 10, gano ? 1 : 0);
      if (gano) { sfx.record(); setMejor(m => (m == null || nm > m ? nm : m)); }
      setFin(true);
      stRef.current.fin = true;
    }
  }

  const jugarRef = useRef(jugar);
  jugarRef.current = jugar;
  const reiniciarRef = useRef(null);

  function reiniciar() {
    sfx.clic();
    setMarca(0); setMaquina(0); setEmpates(0); setUltimo(null); setFin(false);
    stRef.current.fin = false;
  }
  reiniciarRef.current = reiniciar;

  useEffect(() => {
    const fn = e => {
      if (escribiendo()) return;
      if ((e.key === "Enter" || e.key === " ") && stRef.current.fin) {
        e.preventDefault();
        reiniciarRef.current();
        return;
      }
      const k = e.key.toLowerCase();
      if (["p", "a", "t", "l", "s", "1", "2", "3", "4", "5"].includes(k)) {
        const mapa = { p: "p", a: "a", t: "t", l: "l", s: "s", 1: "p", 2: "a", 3: "t", 4: "l", 5: "s" };
        jugarRef.current(mapa[k]);
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  const opciones = avanzado ? Object.keys(AVANZADO) : Object.keys(BASICO);
  const pct = Math.round((Math.max(marca, maquina) / meta) * 100);

  return (
    <GameShell titulo="Piedra, papel o tijeras" emoji="✂️"
      descripcion={`Teclado: P/A/T (+L/S) o 1-5 · primero en ganar ${meta} rondas.`}
      stats={[
        { icono: "🧍", etiqueta: "Tú", valor: `${marca}/${meta}` },
        { icono: "🤖", etiqueta: "IA", valor: `${maquina}/${meta}` },
        { icono: "🤝", etiqueta: "Empates", valor: empates },
        { icono: "🏆", etiqueta: "Mejor", valor: mejor == null ? "—" : mejor },
      ]}
      acciones={<>
        <button className={!avanzado ? "btn-principal" : "btn-suave"} onClick={() => { sfx.clic(); setAvanzado(false); reiniciar(); }}>Clásico</button>
        <button className={avanzado ? "btn-principal" : "btn-suave"} onClick={() => { sfx.clic(); setAvanzado(true); reiniciar(); }}>Con lagarto+spock</button>
        {METAS.map(m => (
          <button key={m} className={meta === m ? "btn-exito" : "btn-suave"} onClick={() => { sfx.clic(); setMeta(m); reiniciar(); }}>Al mejor de {m}</button>
        ))}
        <button className="btn-exito" onClick={reiniciar}>↻ Reiniciar</button>
      </>}
      resultado={fin ? { mensaje, tipo } : null}
      ayuda={<>
        <p><b>Objetivo:</b> gana <b>{meta} rondas</b> antes que la IA. Piedra vence tijeras/lagarto, papel vence piedra/spock, tijeras vence papel/lagarto, lagarto vence spock/papel, spock vence tijeras/piedra.</p>
        <p><b>Controles:</b> clica tu jugada o pulsa <kbd>P</kbd>/<kbd>A</kbd>/<kbd>T</kbd> (<kbd>L</kbd>/<kbd>S</kbd> en avanzado) o <kbd>1</kbd>–<kbd>5</kbd>. <kbd>Enter</kbd>/<kbd>Espacio</kbd> reinicia al terminar. Táctil: toca el botón grande.</p>
        <p><b>Puntuación:</b> al cerrar el match registras <b>10 pts por ronda ganada</b>; ganar el match cuenta como victoria.</p>
        <p><b>Consejo:</b> alterna sin patrones y tras perder repite la jugada que te ganó: la IA aleatoria no la espera dos veces.</p>
      </>}>
      <div className="xp-bar fina"><div style={{ width: `${pct}%` }} /></div>
      <div className="fila-botones" style={{ justifyContent: "center" }}>
        {opciones.map(k => (
          <button key={k} className="btn-exito" disabled={fin} onClick={() => jugar(k)} style={{ fontSize: "1.4rem" }}>
            {AVANZADO[k][1]} {AVANZADO[k][0]}
          </button>
        ))}
      </div>
      {ultimo && (
        <p style={{ fontSize: 18, marginTop: 16, textAlign: "center" }}>
          Tú {ultimo.tu[1]} {ultimo.tu[0]}  vs  IA {ultimo.maq[1]} {ultimo.maq[0]}
          {" — "}{ultimo.resultado === "tu" ? "¡Punto para ti! ✅" : ultimo.resultado === "maq" ? "Punto para la IA ❌" : "Empate 🤝"}
        </p>
      )}
      {fin && <Resultado mensaje={mensaje} tipo={tipo} />}
    </GameShell>
  );
}
