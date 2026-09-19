import { useState } from "react";
import GameShell, { useRegistro } from "../ui/GameShell";
import { sfx } from "../suite/sonido";

const ABC = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split("");

/* Ahorcado por categorías: 6 fallos, palabra aleatoria del banco. */
function AhorBase({ titulo, emoji, banco, pista, tira, iconoFondo }) {
  const { mensaje, tipo, registrarPunt } = useRegistro(titulo);
  const [palabra, setPalabra] = useState("");
  const [usadas, setUsadas] = useState([]);
  const [fallos, setFallos] = useState(0);
  const [jugando, setJugando] = useState(false);

  const MAX = 6;

  function empezar() {
    setPalabra(banco[Math.floor(Math.random() * banco.length)].toUpperCase());
    setUsadas([]); setFallos(0); setJugando(true);
    sfx.clic();
  }

  const norm = s => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const visible = l => norm(palabra).split("").map((c, i) => (usadas.includes(c) ? palabra[i] : "_")).join(" ");
  const gano = palabra && norm(palabra).split("").every(c => usadas.includes(c));

  function letra(l) {
    if (!jugando || usadas.includes(l)) return;
    const nu = [...usadas, l];
    setUsadas(nu);
    if (!norm(palabra).includes(l)) {
      const nf = fallos + 1;
      setFallos(nf);
      sfx.mal();
      if (nf >= MAX) {
        setJugando(false);
        registrarPunt(usadas.filter(u => norm(palabra).includes(u)).length * 10, 0);
      }
    } else {
      sfx.clic();
      if (norm(palabra).split("").every(c => nu.includes(c))) {
        setJugando(false);
        sfx.bien();
        registrarPunt(300 + (MAX - fallos) * 50, 1);
      }
    }
  }

  const etapas = ["🙂", "😐", "😟", "😨", "😰", "🥵", "💀"];

  return (
    <GameShell titulo={titulo} emoji={emoji}
      descripcion={`${pista} · ${MAX} fallos permitidos.`}
      tira={tira} iconoFondo={iconoFondo}>
      <div className="fila-botones" style={{ marginTop: 0 }}>
        <span className="chip" style={{ fontSize: "1.6rem" }}>{etapas[fallos]}</span>
        <span className="chip">Fallos: <b>{fallos}/{MAX}</b></span>
      </div>
      {!jugando && !palabra && (
        <div className="fila-botones"><button className="btn-principal" onClick={empezar}>▶ Empezar</button></div>
      )}
      {palabra && (
        <>
          <p style={{ textAlign: "center", fontSize: "2rem", letterSpacing: 4 }}>{jugando || gano ? visible() : palabra.split("").join(" ")}</p>
          {!jugando && !gano && <p style={{ textAlign: "center" }}>Era: <b>{palabra}</b></p>}
          {jugando && (
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap", justifyContent: "center", maxWidth: 480, margin: "0 auto" }}>
              {ABC.map(l => (
                <button key={l} onClick={() => letra(l)} disabled={usadas.includes(l)}
                  className="btn-suave" style={{ width: 38, height: 38, padding: 0, opacity: usadas.includes(l) ? 0.3 : 1 }}>{l}</button>
              ))}
            </div>
          )}
        </>
      )}
      {mensaje && <div className={`mensaje-final ${tipo}`}>{mensaje}</div>}
      {!jugando && palabra && !mensaje && (
        <div className="fila-botones"><button className="btn-principal" onClick={empezar}>↻ Otra palabra</button></div>
      )}
    </GameShell>
  );
}

const AH = (titulo, emoji, banco, pista, tira, iconoFondo) => function Comp() {
  return <AhorBase titulo={titulo} emoji={emoji} banco={banco} pista={pista} tira={tira} iconoFondo={iconoFondo} />;
};

export const AhorAnimales = AH("Ahorcado: Animales", "🐾",
  ["jirafa", "elefante", "cocodrilo", "mariposa", "murcielago", "rinoceronte", "hipopotamo", "cocodrilo", "ardilla", "tortuga", "ballena", "gorila"],
  "Adivina el animal", "linear-gradient(135deg,#a16207,#eab308)", "linear-gradient(135deg,#a16207,#eab308)");
export const AhorComidas = AH("Ahorcado: Comidas", "🍲",
  ["paella", "pizza", "hamburguesa", "chocolate", "ensalada", "tortilla", "empanada", "helado", "sandwich", "macarrones", "lentejas", "croqueta"],
  "Adivina la comida", "linear-gradient(135deg,#ea580c,#facc15)", "linear-gradient(135deg,#ea580c,#facc15)");
export const AhorPaises = AH("Ahorcado: Países", "🌍",
  ["españa", "mexico", "argentina", "colombia", "portugal", "italia", "francia", "alemania", "brasil", "canada", "japon", "egipto"],
  "Adivina el país", "linear-gradient(135deg,#0ea5e9,#22c55e)", "linear-gradient(135deg,#0ea5e9,#22c55e)");
export const AhorOficios = AH("Ahorcado: Oficios", "🧰",
  ["panadero", "carpintero", "bombero", "maestro", "medico", "piloto", "pescador", "jardinero", "cantante", "actor", "juez", "albañil"],
  "Adivina el oficio", "linear-gradient(135deg,#64748b,#0ea5e9)", "linear-gradient(135deg,#64748b,#0ea5e9)");
export const AhorDeportes = AH("Ahorcado: Deportes", "⚽",
  ["futbol", "tenis", "natacion", "ciclismo", "boxeo", "esqui", "ajedrez", "rugby", "baloncesto", "voleibol", "karate", "surf"],
  "Adivina el deporte", "linear-gradient(135deg,#f59e0b,#ef4444)", "linear-gradient(135deg,#f59e0b,#ef4444)");
