import { useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { sfx } from "../suite/sonido";

/* Motor "ordena la frase": toca las palabras en orden. 6 rondas. */
/* frase: string con palabras separadas por espacios */
function FraseBase({ titulo, emoji, banco, tira, iconoFondo }) {
  const { mensaje, tipo, registrarPunt } = useRegistro(titulo);
  const [palabras, setPalabras] = useState([]);
  const [orden, setOrden] = useState([]);
  const [pos, setPos] = useState(0);
  const [ronda, setRonda] = useState(0);
  const [errores, setErrores] = useState(0);
  const [jugando, setJugando] = useState(false);

  const RONDAS = 6;

  function nuevaRonda(nr) {
    const f = banco[Math.floor(Math.random() * banco.length)].split(" ");
    setOrden(f);
    setPalabras([...f].sort(() => Math.random() - 0.5));
    setPos(0);
    setRonda(nr);
  }

  function empezar() {
    setErrores(0); setJugando(true);
    nuevaRonda(1);
    sfx.clic();
  }

  function tocar(w, i) {
    if (!jugando) return;
    // Si la palabra se repite, hay que distinguir por posición: usamos índice en orden restante
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

  const [marcadas, setMarcadas] = useState([]);
  function usadaAntes(w, i) {
    return marcadas.includes(i);
  }
  function marcar(w, i) {
    // verifica que sea la siguiente palabra pendiente contando duplicadas ya marcadas
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

  function empezar2() {
    setMarcadas([]);
    empezar();
  }

  return (
    <GameShell titulo={titulo} emoji={emoji}
      descripcion="Toca las palabras en orden · 6 rondas."
      tira={tira} iconoFondo={iconoFondo}>
      <div className="fila-botones">
        <span className="chip">Ronda: <b>{ronda}/{RONDAS}</b></span>
        <span className="chip">Van: <b>{pos}/{orden.length}</b></span>
        <span className="chip">❌ <b>{errores}</b></span>
      </div>
      {!jugando && ronda === 0 && (
        <div className="fila-botones"><button className="btn-principal" onClick={empezar2}>▶ Empezar</button></div>
      )}
      {jugando && (
        <>
          <p style={{ textAlign: "center", fontSize: "1.15rem", minHeight: 30 }}>
            {orden.slice(0, pos).join(" ")} <span style={{ color: "var(--texto-suave)" }}>{"_ ".repeat(Math.max(0, orden.length - pos))}</span>
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
            {palabras.map((w, i) => (
              <button key={i} onClick={() => tocar(w, i)} disabled={marcadas.includes(i)}
                className="btn-suave" style={{ fontSize: "1.15rem", padding: "12px 14px", opacity: marcadas.includes(i) ? 0.3 : 1 }}>
                {w}
              </button>
            ))}
          </div>
        </>
      )}
      <Resultado mensaje={mensaje} tipo={tipo} />
      {!jugando && ronda > 0 && !mensaje && (
        <div className="fila-botones"><button className="btn-principal" onClick={empezar2}>↻ Otra vez</button></div>
      )}
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
