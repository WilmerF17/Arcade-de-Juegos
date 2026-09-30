import { useEffect, useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { sfx } from "../suite/sonido";

/* Motor "ordena la frase": toca las palabras en orden. */
/* frase: string con palabras separadas por espacios */
const DIFS = { "Fácil": { n: 4 }, "Normal": { n: 6 }, "Difícil": { n: 8 } };
function FraseBase({ titulo, emoji, banco, tira, iconoFondo }) {
  const { mensaje, tipo, registrarPunt } = useRegistro(titulo);
  const [dif, setDif] = useState("Normal");
  const RONDAS = DIFS[dif].n;
  const [palabras, setPalabras] = useState([]);
  const [orden, setOrden] = useState([]);
  const [pos, setPos] = useState(0);
  const [ronda, setRonda] = useState(0);
  const [errores, setErrores] = useState(0);
  const [jugando, setJugando] = useState(false);
  const [marcadas, setMarcadas] = useState([]);

  function nuevaRonda(nr) {
    const f = banco[Math.floor(Math.random() * banco.length)].split(" ");
    setOrden(f);
    setPalabras([...f].sort(() => Math.random() - 0.5));
    setPos(0);
    setRonda(nr);
  }

  function empezar() {
    setErrores(0); setJugando(true); setMarcadas([]);
    nuevaRonda(1);
    sfx.clic();
  }

  function empezar2() {
    setMarcadas([]);
    empezar();
  }

  function usadaAntes(i) {
    return marcadas.includes(i);
  }
  function tocar(w, i) {
    if (!jugando) return;
    const restantes = orden.slice(pos);
    if (w === restantes[0] && !usadaAntes(w, i)) {
      marcar(w, i);
    } else if (w === restantes[0]) {
      marcar(w, i);
    } else {
      setErrores(e => e + 1);
      sfx.mal();
    }
  }
  function marcar(w, i) {
    const pendientes = orden.filter((_, oi) => {
      const ocurrenciasPrevias = orden.slice(0, oi).filter(x => x === orden[oi]).length;
      const marcadasIguales = marcadas.filter(mi => palabras[mi] === orden[oi]).length;
      return marcadasIguales <= ocurrenciasPrevias;
    });
    if (w !== pendientes[0]) {
      setErrores(e => e + 1);
      sfx.mal();
      return;
    }
    const nm = [...marcadas, i];
    setMarcadas(nm);
    const np = pos + 1;
    setPos(np);
    sfx.clic();
    if (np >= orden.length) {
      setMarcadas([]);
      if (ronda >= RONDAS) {
        setJugando(false);
        const puntos = Math.max(60, 800 - errores * 40);
        sfx.bien();
        registrarPunt(puntos, errores <= 2 ? 1 : 0);
      } else {
        sfx.moneda();
        nuevaRonda(ronda + 1);
      }
    }
  }

  useEffect(() => {
    const fn = (e) => {
      const tag = (e.target?.tagName || "").toUpperCase();
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if ((e.key === "Enter" || e.key === " ") && !jugando) {
        e.preventDefault();
        empezar2();
        return;
      }
      if (!jugando) return;
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= palabras.length) {
        const i = n - 1;
        if (!marcadas.includes(i)) tocar(palabras[i], i);
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }); // eslint-disable-line react-hooks/exhaustive-deps

  const pct = RONDAS ? Math.round(((ronda - (jugando ? 1 : 0)) / RONDAS) * 100) : 0;
  return (
    <GameShell titulo={titulo} emoji={emoji}
      descripcion={`Toca las palabras en orden · ${RONDAS} rondas.`}
      tira={tira} iconoFondo={iconoFondo}
      stats={[
        { icono: "📖", etiqueta: "Ronda", valor: `${ronda}/${RONDAS}` },
        { icono: "➡️", etiqueta: "Van", valor: `${pos}/${orden.length || "—"}` },
        { icono: "❌", etiqueta: "Fallos", valor: errores },
        { icono: "🎚️", etiqueta: "Dificultad", valor: dif },
      ]}
      resultado={{ mensaje, tipo }}
      ayuda={(
        <div>
          <p><b>Reglas:</b> toca las palabras desordenadas en su orden correcto durante {RONDAS} rondas.</p>
          <p><b>Controles:</b> ratón o táctil tocando cada palabra · teclado <kbd>1</kbd>–<kbd>9</kbd> para elegir la palabra visible, <kbd>Enter</kbd>/<kbd>Espacio</kbd> para empezar.</p>
          <p><b>Puntuación:</b> empiezas con 800 y pierdes 40 por fallo (mínimo 60). Victoria con 2 o menos fallos.</p>
          <p><b>Consejo:</b> lee la frase en voz baja: el oído detecta el orden antes que la vista.</p>
        </div>
      )}
      acciones={(
        <>
          {["Fácil", "Normal", "Difícil"].map(d => (
            <button key={d} className={dif === d ? "btn-principal" : "btn-suave"} disabled={jugando} onClick={() => { setDif(d); sfx.clic(); }}>{d}</button>
          ))}
          {!jugando && <button className="btn-principal" onClick={empezar2}>{ronda > 0 ? "↻ Otra vez" : "▶ Empezar"}</button>}
        </>
      )}>
      <div className="xp-bar fina" aria-hidden><div style={{ width: `${pct}%` }} /></div>
      {jugando && (
        <>
          <p style={{ textAlign: "center", fontSize: "1.15rem", minHeight: 30 }}>
            {orden.slice(0, pos).join(" ")} <span style={{ color: "var(--texto-suave)" }}>{"_ ".repeat(Math.max(0, orden.length - pos))}</span>
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
            {palabras.map((w, i) => (
              <button key={i} onClick={() => tocar(w, i)} disabled={marcadas.includes(i)}
                className="btn-suave" style={{ fontSize: "1.15rem", padding: "12px 14px", opacity: marcadas.includes(i) ? 0.3 : 1 }}>
                <kbd style={{ opacity: 0.6 }}>{i + 1}</kbd> {w}
              </button>
            ))}
          </div>
        </>
      )}
      <Resultado mensaje="" tipo="" />
    </GameShell>
  );
}

const FR = (titulo, emoji, banco, tira, iconoFondo) => function Comp() {
  return <FraseBase titulo={titulo} emoji={emoji} banco={banco} tira={tira} iconoFondo={iconoFondo} />;
};

export const FrasesRefranes = FR("Frases: Refranes", "💬", [
  "A caballo regalado no le mires el diente",
  "Más vale pájaro en mano que cien volando",
  "No dejes para mañana lo que puedas hacer hoy",
  "Dime con quién andas y te diré quién eres",
  "Ojos que no ven corazón que no siente",
  "Camarón que se duerme se lo lleva la corriente",
  "En boca cerrada no entran moscas",
  "Del dicho al hecho hay mucho trecho",
], "linear-gradient(135deg,#b45309,#f59e0b)", "linear-gradient(135deg,#b45309,#f59e0b)");

export const FrasesHechos = FR("Frases: Datos", "💡", [
  "El agua hierve a cien grados",
  "La Vía Láctea es nuestra galaxia",
  "El corazón bombea la sangre",
  "Madrid es la capital de España",
  "El piano tiene ochenta y ocho teclas",
  "La fotosíntesis alimenta a las plantas",
  "El Everest es la montaña más alta",
  "El ajedrez se juega en sesenta y cuatro casillas",
], "linear-gradient(135deg,#0ea5e9,#22c55e)", "linear-gradient(135deg,#0ea5e9,#22c55e)");

export const FrasesAnimales = FR("Frases: Animales", "🐾", [
  "La jirafa tiene el cuello muy largo",
  "El pingüino nada pero no vuela",
  "El canguro lleva a su cría en el bolso",
  "El pulpo tiene ocho brazos",
  "El murciélago es un mamífero que vuela",
  "El elefante se comunica con la trompa",
  "El camaleón cambia de color",
  "La abeja produce la miel",
], "linear-gradient(135deg,#a16207,#22c55e)", "linear-gradient(135deg,#a16207,#22c55e)");

export const FrasesViajes = FR("Frases: Viajes", "✈️", [
  "El pasaporte permite viajar al extranjero",
  "La brújula siempre indica el norte",
  "El mapa sirve para orientarse",
  "En el hotel duermes de viaje",
  "El avión es el transporte más rápido",
  "La maleta lleva tu ropa",
  "Hollywood está en Los Ángeles",
  "El Nilo atraviesa el continente africano",
], "linear-gradient(135deg,#6366f1,#0ea5e9)", "linear-gradient(135deg,#6366f1,#0ea5e9)");
