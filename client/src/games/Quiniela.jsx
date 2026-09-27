import { useEffect, useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { useSaldo, apostarConAviso, cobrarPremio, perderApuesta, SelectorApuesta } from "../suite/apuesta";
import { sfx } from "../suite/sonido";

const EQUIPOS = ["Tigres", "Águilas", "Lobos", "Toros", "Pumas", "Halcones", "Cobras", "Rayos", "Leones", "Tiburones", "Cóndores", "Panteras"];

function cuota() {
  return Math.round((1.4 + Math.random() * 1.8) * 10) / 10;
}
function mezcla(a) {
  const m = [...a];
  for (let i = m.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [m[i], m[j]] = [m[j], m[i]];
  }
  return m;
}

/* Quiniela Relámpago: 3 partidos con cuotas. Elige el ganador de cada uno:
   pleno (3/3) cobra el producto de cuotas (tope ×20), 2/3 devuelve la apuesta. */
export default function Quiniela() {
  const NOMBRE = "Quiniela Relámpago";
  const { mensaje, tipo, registrarPunt } = useRegistro(NOMBRE);
  const saldo = useSaldo();
  const [apuesta, setApuesta] = useState(25);
  const [partidos, setPartidos] = useState([]);
  const [elec, setElec] = useState([null, null, null]);
  const [res, setRes] = useState(null);
  const [jugando, setJugando] = useState(false);
  const [aviso, setAviso] = useState("");

  function sortear() {
    const eq = mezcla(EQUIPOS).slice(0, 6);
    setPartidos([0, 1, 2].map(i => ({
      local: eq[i * 2], visita: eq[i * 2 + 1],
      cuotas: [cuota(), cuota(), cuota()],
    })));
    setElec([null, null, null]);
    setRes(null);
  }

  useEffect(() => { sortear(); }, []);

  function jugar() {
    if (elec.some(e => e == null)) { setAviso("Elige el ganador de los 3 partidos."); sfx.mal(); return; }
    const r = apostarConAviso(apuesta, setAviso);
    if (!r.ok) return;
    setJugando(true);
    // resultado ponderado: la cuota baja gana más a menudo
    const final = partidos.map(p => {
      const peso = p.cuotas.map(c => 1 / c);
      const tot = peso[0] + peso[1] + peso[2];
      const x = Math.random() * tot;
      return x < peso[0] ? 0 : x < peso[0] + peso[1] ? 1 : 2;
    });
    const aciertos = final.filter((f, i) => f === elec[i]).length;
    const mult = Math.min(20, Math.round(partidos[0].cuotas[elec[0]] * partidos[1].cuotas[elec[1]] * partidos[2].cuotas[elec[2]] * 10) / 10);
    setRes({ final, aciertos, mult });
    setJugando(false);
    sfx.clic();
    if (aciertos === 3) cobrarPremio(Math.floor(apuesta * mult), apuesta, registrarPunt);
    else if (aciertos === 2) {
      cobrarPremio(apuesta, apuesta, registrarPunt);
      setAviso("2 de 3: recuperas tu apuesta.");
    } else perderApuesta(registrarPunt, apuesta);
  }

  const NOMBRES = ["Local", "Empate", "Visita"];
  return (
    <GameShell titulo={NOMBRE} emoji="📋"
      descripcion="3 partidos con cuotas: pleno cobra el producto (tope ×20), 2/3 devuelve."
      stats={[{ icono: "🪙", valor: saldo }]}
      resultado={{ mensaje, tipo }}
      ayuda={<span>La cuota baja es favorita y sale más. El pleno multiplica las 3 cuotas de tus elegidos.</span>}>
      <SelectorApuesta apuesta={apuesta} setApuesta={setApuesta} jugando={jugando} />
      <div className="fila-botones">
        <button className="btn-suave" onClick={() => { sortear(); sfx.clic(); }}>🎲 Sortear partidos</button>
      </div>
      {partidos.length > 0 && partidos.map((p, i) => (
        <div key={i} className="quiniela-partido">
          <p><b>{p.local}</b> vs <b>{p.visita}</b></p>
          <div className="fila-botones">
            {[0, 1, 2].map(o => (
              <button key={o} className={elec[i] === o ? "btn-principal" : "btn-suave"}
                onClick={() => { const n = [...elec]; n[i] = o; setElec(n); sfx.clic(); }}>
                {o === 0 ? p.local : o === 1 ? "Empate" : p.visita} ×{p.cuotas[o]}
              </button>
            ))}
          </div>
          {res && <p className={res.final[i] === elec[i] ? "aviso victoria" : "aviso derrota"} style={{ textAlign: "center" }}>
            Salió: {NOMBRES[res.final[i]]} {res.final[i] === elec[i] ? "✅" : "❌"}</p>}
        </div>
      ))}
      {partidos.length > 0 && (
        <div className="fila-botones">
          <button className="btn-principal" onClick={jugar} disabled={jugando}>📋 Jugar quiniela ({apuesta})</button>
          {res && res.aciertos === 3 && <span className="chip victoria">¡PLENO! ×{res.mult}</span>}
        </div>
      )}
      {aviso && <p className="aviso info" style={{ textAlign: "center" }}>{aviso}</p>}
      <Resultado mensaje={mensaje} tipo={tipo} />
    </GameShell>
  );
}
