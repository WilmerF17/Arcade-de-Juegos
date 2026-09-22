import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { escribiendo } from "../suite/teclado";

const BASICO = { p: ["piedra", "🪨"], a: ["papel", "📄"], t: ["tijeras", "✂️"] };
const AVANZADO = { ...BASICO, l: ["lagarto", "🦎"], s: ["spock", "🖖"] };

const VENCE = new Set([
  "piedra,tijeras", "piedra,lagarto", "papel,piedra", "papel,spock",
  "tijeras,papel", "tijeras,lagarto", "lagarto,spock", "lagarto,papel",
  "spock,tijeras", "spock,piedra",
]);

export default function RPS() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Piedra Papel Tijeras");
  const [avanzado, setAvanzado] = useState(false);
  const [marca, setMarca] = useState(0);
  const [maquina, setMaquina] = useState(0);
  const [empates, setEmpates] = useState(0);
  const [ultimo, setUltimo] = useState(null);
  const [fin, setFin] = useState(false);
  const stRef = useRef({ marca: 0, maquina: 0, fin: false, avanzado: false });
  stRef.current = { marca, maquina, fin, avanzado };

  function jugar(key) {
    const { marca: m0, maquina: q0, fin: f, avanzado: av } = stRef.current;
    if (f) return;
    const opciones = av ? AVANZADO : BASICO;
    if (!opciones[key]) return;
    const claves = Object.keys(opciones);
    const maq = claves[Math.floor(Math.random() * claves.length)];
    const resultado = key === maq ? "empate"
      : VENCE.has(`${opciones[key][0]},${opciones[maq][0]}`) ? "tu" : "maq";
    setUltimo({ tu: opciones[key], maq: opciones[maq], resultado });
    let nm = m0, mk = q0;
    if (resultado === "tu") { nm++; setMarca(nm); }
    else if (resultado === "maq") { mk++; setMaquina(mk); }
    else setEmpates(e => e + 1);
    if (nm >= 3 || mk >= 3) {
      const gano = nm >= 3;
      registrarPunt(nm * 10, gano ? 1 : 0);
      setFin(true);
      stRef.current.fin = true;
    }
  }

  const jugarRef = useRef(jugar);
  jugarRef.current = jugar;

  useEffect(() => {
    const fn = e => {
      if (escribiendo()) return;
      const k = e.key.toLowerCase();
      if (["p", "a", "t", "l", "s", "1", "2", "3", "4", "5"].includes(k)) {
        const mapa = { p: "p", a: "a", t: "t", l: "l", s: "s", 1: "p", 2: "a", 3: "t", 4: "l", 5: "s" };
        jugarRef.current(mapa[k]);
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  function reiniciar() {
    setMarca(0); setMaquina(0); setEmpates(0); setUltimo(null); setFin(false);
    stRef.current.fin = false;
  }

  const opciones = avanzado ? Object.keys(AVANZADO) : Object.keys(BASICO);

  return (
    <GameShell titulo="Piedra, papel o tijeras" emoji="✂️"
      descripcion="Teclado: P/A/T (+L/S) o 1-5 · primero en ganar 3 rondas.">
      <div className="fila-botones">
        <button className={!avanzado ? "btn-principal" : ""} onClick={() => setAvanzado(false)}>Clásico</button>
        <button className={avanzado ? "btn-principal" : ""} onClick={() => setAvanzado(true)}>Con lagarto+spock</button>
        <button className="btn-exito" onClick={reiniciar}>Reiniciar</button>
      </div>
      <div className="marcador-chips">
        <span className="chip">Tú <b style={{ color: "var(--exito)" }}>{marca}</b></span>
        <span className="chip">IA <b style={{ color: "var(--peligro)" }}>{maquina}</b></span>
        <span className="chip">Empates <b>{empates}</b></span>
      </div>
      <div className="fila-botones">
        {opciones.map(k => (
          <button key={k} className="btn-exito" disabled={fin} onClick={() => jugar(k)} style={{ fontSize: "1.4rem" }}>
            {AVANZADO[k][1]} {AVANZADO[k][0]}
          </button>
        ))}
      </div>
      {ultimo && (
        <p style={{ fontSize: 18, marginTop: 16 }}>
          Tú {ultimo.tu[1]} {ultimo.tu[0]}  vs  IA {ultimo.maq[1]} {ultimo.maq[0]}
          {" — "}{ultimo.resultado === "tu" ? "¡Punto para ti! ✅" : ultimo.resultado === "maq" ? "Punto para la IA ❌" : "Empate 🤝"}
        </p>
      )}
      {fin && <Resultado mensaje={mensaje} tipo={tipo} />}
    </GameShell>
  );
}
