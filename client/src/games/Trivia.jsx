import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro } from "../ui/GameShell";
import { escribiendo } from "../suite/teclado";

const PREGUNTAS = [
  { p: "¿Cuál es la capital de Francia?", o: ["Londres", "París", "Madrid", "Roma"], r: 1, c: "Geografía" },
  { p: "¿Cuántos planetas tiene el sistema solar?", o: ["7", "8", "9", "10"], r: 1, c: "Ciencia" },
  { p: "¿Quién pintó la Mona Lisa?", o: ["Van Gogh", "Picasso", "Da Vinci", "Dalí"], r: 2, c: "Arte" },
  { p: "¿Cuál es el río más largo del mundo?", o: ["Amazonas", "Nilo", "Mississippi", "Yangtsé"], r: 1, c: "Geografía" },
  { p: "¿En qué año llegó el hombre a la Luna?", o: ["1965", "1969", "1972", "1960"], r: 1, c: "Ciencia" },
  { p: "¿Cuál es el océano más grande?", o: ["Atlántico", "Índico", "Pacífico", "Ártico"], r: 2, c: "Geografía" },
  { p: "¿Cuántos huesos tiene el cuerpo humano adulto?", o: ["186", "206", "226", "256"], r: 1, c: "Ciencia" },
  { p: "¿Cuál es el animal terrestre más rápido?", o: ["León", "Guepardo", "Gacela", "Caballo"], r: 1, c: "Naturaleza" },
  { p: "¿Qué gas es el más abundante en la atmósfera?", o: ["Oxígeno", "CO2", "Nitrógeno", "Hidrógeno"], r: 2, c: "Ciencia" },
  { p: "¿Cuál es el país más grande del mundo?", o: ["China", "EE.UU.", "Canadá", "Rusia"], r: 3, c: "Geografía" },
  { p: "¿Quién escribió 'Don Quijote'?", o: ["Lope de Vega", "Cervantes", "Quevedo", "Calderón"], r: 1, c: "Literatura" },
  { p: "¿Qué planeta es el Planeta Rojo?", o: ["Júpiter", "Venus", "Marte", "Saturno"], r: 2, c: "Ciencia" },
  { p: "¿Cuál es la fórmula del agua?", o: ["CO2", "H2O", "O2", "NaCl"], r: 1, c: "Ciencia" },
  { p: "¿Qué lenguaje usa 'if' para tomar decisiones?", o: ["Python", "HTML", "CSS", "SQL"], r: 0, c: "Tecnología" },
  { p: "¿Cuántos jugadores hay en un equipo de fútbol en el campo?", o: ["9", "10", "11", "12"], r: 2, c: "Deporte" },
  { p: "¿En qué continente está Egipto?", o: ["Asia", "Europa", "África", "Oceanía"], r: 2, c: "Geografía" },
  { p: "¿Quién descubrió América en 1492?", o: ["Colón", "Magallanes", "Vespucci", "Drake"], r: 0, c: "Historia" },
  { p: "¿Cuál es la capital de Japón?", o: ["Pekín", "Seúl", "Tokio", "Bangkok"], r: 2, c: "Geografía" },
  { p: "¿Cuál es el metal más ligero?", o: ["Hierro", "Aluminio", "Litio", "Sodio"], r: 2, c: "Ciencia" },
  { p: "¿Qué inventó Edison (más famoso)?", o: ["Televisión", "Teléfono", "Bombilla", "Motor"], r: 2, c: "Tecnología" },
  { p: "¿En qué año cayó el Muro de Berlín?", o: ["1985", "1989", "1991", "1993"], r: 1, c: "Historia" },
  { p: "¿Cuál es la montaña más alta?", o: ["Kilimanjaro", "Everest", "Aconcagua", "Elbrus"], r: 1, c: "Geografía" },
  { p: "¿Cuál es el hueso más largo del cuerpo?", o: ["Fémur", "Húmero", "Tibia", "Peroné"], r: 0, c: "Ciencia" },
  { p: "¿Cuál es el animal más grande del mundo?", o: ["Elefante", "Tiburón blanco", "Ballena azul", "Calamar"], r: 2, c: "Naturaleza" },
  { p: "¿Qué unidad mide la corriente eléctrica?", o: ["Voltio", "Amperio", "Ohmio", "Vatio"], r: 1, c: "Ciencia" },
  { p: "¿Quién escribió 'Cien años de soledad'?", o: ["García Márquez", "Borges", "Vargas Llosa", "Cortázar"], r: 0, c: "Literatura" },
];

const CATEGORIAS = ["Mezcla", "Ciencia", "Historia", "Geografía", "Tecnología", "Literatura", "Deporte", "Naturaleza", "Arte"];

export default function Trivia() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Trivia");
  const [lista, setLista] = useState([]);
  const [idx, setIdx] = useState(0);
  const [correctas, setCorrectas] = useState(0);
  const [elegida, setElegida] = useState(null);
  const [fin, setFin] = useState(false);
  const [cursor, setCursor] = useState(0);
  const estadoRef = useRef({ lista: [], idx: 0, correctas: 0, elegida: null });
  estadoRef.current = { lista, idx, correctas, elegida };

  function empezar(cat) {
    let pool = [...PREGUNTAS];
    if (cat > 0) pool = pool.filter(q => q.c === CATEGORIAS[cat]);
    pool.sort(() => Math.random() - 0.5);
    const seleccion = pool.slice(0, Math.min(10, pool.length));
    setLista(seleccion);
    setIdx(0); setCorrectas(0); setElegida(null); setFin(false); setCursor(0);
  }

  function responder(i) {
    const { lista: l, idx: k, elegida: e, correctas: c } = estadoRef.current;
    if (e != null || !l.length || k >= l.length) return;
    setElegida(i);
    estadoRef.current.elegida = i;
    const esCorrecta = i === l[k].r;
    const nuevas = c + (esCorrecta ? 1 : 0);
    setTimeout(() => {
      if (k + 1 >= l.length) {
        const puntos = nuevas * 10;
        registrarPunt(puntos, nuevas >= 7 ? 1 : 0);
        setCorrectas(nuevas);
        setFin(true);
      } else {
        setCorrectas(nuevas);
        setIdx(k + 1);
        setElegida(null);
        estadoRef.current.elegida = null;
        setCursor(0);
      }
    }, 700);
  }

  const responderRef = useRef(responder);
  responderRef.current = responder;

  useEffect(() => {
    const fn = e => {
      if (escribiendo() || !estadoRef.current.lista.length || estadoRef.current.elegida != null) return;
      const k = e.key.toLowerCase();
      const mapaLetra = { a: 0, b: 1, c: 2, d: 3, 1: 0, 2: 1, 3: 2, 4: 3 };
      if (mapaLetra[k] != null) {
        e.preventDefault();
        responderRef.current(mapaLetra[k]);
        return;
      }
      if (e.key === "ArrowUp" || e.key === "ArrowLeft" || k === "w" || k === "a") {
        e.preventDefault(); setCursor(c => (c + 3) % 4);
      } else if (e.key === "ArrowDown" || e.key === "ArrowRight" || k === "s" || k === "d") {
        e.preventDefault(); setCursor(c => (c + 1) % 4);
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault(); responderRef.current(cursor);
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [cursor]);

  if (lista.length === 0) {
    return (
      <GameShell titulo="Trivia" emoji="❓"
        descripcion="Responde 10 preguntas de cultura general. Cada acierto vale 10 puntos.">
        <p>Elige una categoría:</p>
        <div className="fila-botones" style={{ marginTop: 0 }}>
          {CATEGORIAS.map((c, i) => (
            <button key={c} className="btn-principal" onClick={() => empezar(i)}>{i === 0 ? "🔀" : ""} {c}</button>
          ))}
        </div>
      </GameShell>
    );
  }

  const pregunta = lista[idx];

  return (
    <GameShell titulo="Trivia" emoji="❓"
      descripcion="Teclado: A-D / 1-4 o flechas + ENTER. 10 preguntas.">
      <div className="marcador-chips">
        <span className="chip">Pregunta <b>{idx + 1}/{lista.length}</b></span>
        <span className="chip">Correctas <b style={{ color: "var(--exito)" }}>{correctas + (elegida != null && elegida === pregunta.r ? 1 : 0)}</b></span>
      </div>
      <h3 style={{ margin: "6px 0 10px" }}>{pregunta.p}</h3>
      <div>
        {pregunta.o.map((op, i) => {
          let cls = "trivia-op";
          if (elegida != null) {
            if (i === pregunta.r) cls += " correcta";
            else if (i === elegida) cls += " elegida";
          } else if (i === cursor) cls += " cursor";
          return (
            <button key={i} className={cls} onClick={() => responder(i)} disabled={elegida != null}
              onMouseEnter={() => setCursor(i)}>
              {String.fromCharCode(65 + i)}) {op}
            </button>
          );
        })}
      </div>
      {fin && (
        <div className={`mensaje-final ${tipo}`}>
          {mensaje} <br /> Resultado: {correctas}/{lista.length}
        </div>
      )}
      {fin && <div className="fila-botones"><button className="btn-exito" onClick={() => empezar(0)}>Otra ronda</button></div>}
    </GameShell>
  );
}
