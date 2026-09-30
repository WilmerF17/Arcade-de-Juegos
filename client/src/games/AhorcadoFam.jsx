import { useEffect, useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { sfx } from "../suite/sonido";

const ABC = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split("");

/* Ahorcado por categorías: palabra aleatoria del banco. */
const DIFS = { "Fácil": { max: 8 }, "Normal": { max: 6 }, "Difícil": { max: 4 } };
function AhorBase({ titulo, emoji, banco, pista, tira, iconoFondo }) {
  const { mensaje, tipo, registrarPunt } = useRegistro(titulo);
  const [dif, setDif] = useState("Normal");
  const MAX = DIFS[dif].max;
  const [palabra, setPalabra] = useState("");
  const [usadas, setUsadas] = useState([]);
  const [fallos, setFallos] = useState(0);
  const [jugando, setJugando] = useState(false);

  function empezar() {
    setPalabra(banco[Math.floor(Math.random() * banco.length)].toUpperCase());
    setUsadas([]); setFallos(0); setJugando(true);
    sfx.clic();
  }

  const norm = s => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const visible = () => norm(palabra).split("").map((c, i) => (usadas.includes(c) ? palabra[i] : "_")).join(" ");
  const gano = palabra && norm(palabra).split("").every(c => usadas.includes(c));
  const aciertos = usadas.filter(u => norm(palabra).includes(u)).length;

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

  useEffect(() => {
    const fn = (e) => {
      const tag = (e.target?.tagName || "").toUpperCase();
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if ((e.key === "Enter" || e.key === " ") && !jugando) {
        e.preventDefault();
        empezar();
        return;
      }
      if (!jugando) return;
      const k = String(e.key).toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (/^[A-ZÑ]$/.test(k) && ABC.includes(k)) letra(k);
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }); // eslint-disable-line react-hooks/exhaustive-deps

  const etapas = ["🙂", "😐", "😟", "😨", "😰", "🥵", "💀", "👻", "☠️"];
  const cara = etapas[Math.min(fallos, etapas.length - 1)];
  const pctVida = MAX ? Math.round(((MAX - fallos) / MAX) * 100) : 0;

  return (
    <GameShell titulo={titulo} emoji={emoji}
      descripcion={`${pista} · ${MAX} fallos permitidos (${dif}).`}
      tira={tira} iconoFondo={iconoFondo}
      stats={[
        { icono: "❤️", etiqueta: "Vidas", valor: `${MAX - fallos}/${MAX}` },
        { icono: "🔤", etiqueta: "Letras", valor: aciertos },
        { icono: "❌", etiqueta: "Fallos", valor: `${fallos}/${MAX}` },
        { icono: "🎚️", etiqueta: "Dificultad", valor: dif },
      ]}
      resultado={{ mensaje, tipo }}
      ayuda={(
        <div>
          <p><b>Reglas:</b> {pista}. Toca letras hasta completar la palabra antes de agotar tus {MAX} fallos.</p>
          <p><b>Controles:</b> ratón o táctil en el abecedario · teclado físico <kbd>A</kbd>–<kbd>Z</kbd> para probar letras, <kbd>Enter</kbd>/<kbd>Espacio</kbd> para empezar.</p>
          <p><b>Puntuación:</b> victoria = 300 más 50 por cada vida restante. Derrota = 10 por letra acertada.</p>
          <p><b>Consejo:</b> empieza por vocales y letras frecuentes (E, A, S, R) para abrir la palabra.</p>
        </div>
      )}
      acciones={(
        <>
          {["Fácil", "Normal", "Difícil"].map(d => (
            <button key={d} className={dif === d ? "btn-principal" : "btn-suave"} disabled={jugando} onClick={() => { setDif(d); sfx.clic(); }}>{d}</button>
          ))}
          {!jugando && <button className="btn-principal" onClick={empezar}>{palabra ? "↻ Otra palabra" : "▶ Empezar"}</button>}
        </>
      )}>
      <div className="xp-bar fina" aria-hidden><div style={{ width: `${pctVida}%` }} /></div>
      <div className="fila-botones">
        <span className="chip" style={{ fontSize: "1.6rem" }}>{cara}</span>
        <span className="chip">Fallos: <b>{fallos}/{MAX}</b></span>
      </div>
      {palabra && (
        <>
          <p style={{ textAlign: "center", fontSize: "2rem", letterSpacing: 4 }}>{jugando || gano ? visible() : palabra.split("").join(" ")}</p>
          {!jugando && !gano && palabra && <p style={{ textAlign: "center" }}>Era: <b>{palabra}</b></p>}
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
      <Resultado mensaje="" tipo="" />
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
export const AhorMusica = AH("Ahorcado: Música", "🎵",
  ["guitarra", "piano", "violin", "trompeta", "bateria", "flauta", "saxofon", "arpa", "acordeon", "trombon", "clarinete", "ukelele"],
  "Adivina el instrumento", "linear-gradient(135deg,#7c3aed,#ec4899)", "linear-gradient(135deg,#7c3aed,#ec4899)");
