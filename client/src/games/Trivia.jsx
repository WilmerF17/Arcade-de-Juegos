import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro } from "../ui/GameShell";
import { escribiendo } from "../suite/teclado";
import { sfx } from "../suite/sonido";

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
  { p: "¿Qué planeta tiene anillos visibles?", o: ["Marte", "Venus", "Saturno", "Mercurio"], r: 2, c: "Ciencia" },
  { p: "¿En qué país está la Torre Eiffel?", o: ["Italia", "España", "Francia", "Bélgica"], r: 2, c: "Geografía" },
  { p: "¿Qué civilización construyó Machu Picchu?", o: ["Azteca", "Maya", "Inca", "Egipcia"], r: 2, c: "Historia" },
  { p: "¿Qué aparato mide la temperatura?", o: ["Barómetro", "Termómetro", "Reloj", "Brújula"], r: 1, c: "Ciencia" },
  { p: "¿Cuál es el idioma más hablado del mundo?", o: ["Inglés", "Hindi", "Chino mandarín", "Español"], r: 2, c: "Geografía" },
  { p: "¿Quién fue el primer presidente de EE.UU.?", o: ["Lincoln", "Washington", "Jefferson", "Adams"], r: 1, c: "Historia" },
  { p: "¿Qué red social es de fotos y reels?", o: ["LinkedIn", "Instagram", "Wikipedia", "Telegram"], r: 1, c: "Tecnología" },
  { p: "¿Quién escribió 'Romeo y Julieta'?", o: ["Cervantes", "Shakespeare", "Dante", "Homero"], r: 1, c: "Literatura" },
  { p: "¿En qué deporte se usa un bate?", o: ["Fútbol", "Tenis", "Béisbol", "Natación"], r: 2, c: "Deporte" },
  { p: "¿Qué animal pone huevos y nada?", o: ["Ballena", "Tiburón", "Pato", "Delfín"], r: 2, c: "Naturaleza" },
  { p: "¿Qué pintor cortó parte de su oreja?", o: ["Picasso", "Van Gogh", "Dalí", "Monet"], r: 1, c: "Arte" },
];

const CATEGORIAS = ["Mezcla", "Ciencia", "Historia", "Geografía", "Tecnología", "Literatura", "Deporte", "Naturaleza", "Arte"];
const TIEMPOS_DIF = { 1: 20000, 2: 15000, 3: 10000 };
const NOMBRE_DIF = { 1: "Fácil", 2: "Normal", 3: "Difícil" };
const LETRAS = ["A", "B", "C", "D"];

export default function Trivia() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Trivia");
  const [lista, setLista] = useState([]);
  const [idx, setIdx] = useState(0);
  const [correctas, setCorrectas] = useState(0);
  const [elegida, setElegida] = useState(null);
  const [fin, setFin] = useState(false);
  const [cursor, setCursor] = useState(0);
  const [racha, setRacha] = useState(0);
  const [mejorRacha, setMejorRacha] = useState(0);
  const [historial, setHistorial] = useState([]);
  const [dif, setDif] = useState(2);
  const TIEMPO_MS = TIEMPOS_DIF[dif];
  const [restante, setRestante] = useState(TIEMPO_MS);
  const estadoRef = useRef({ lista: [], idx: 0, correctas: 0, elegida: null, racha: 0, historial: [] });
  estadoRef.current = { lista, idx, correctas, elegida, racha, historial };

  function empezar(cat) {
    sfx.clic();
    let pool = [...PREGUNTAS];
    if (cat > 0) pool = pool.filter(q => q.c === CATEGORIAS[cat]);
    pool.sort(() => Math.random() - 0.5);
    const seleccion = pool.slice(0, Math.min(10, pool.length));
    setLista(seleccion);
    setIdx(0); setCorrectas(0); setElegida(null); setFin(false); setCursor(0);
    setRacha(0); setHistorial([]); setRestante(TIEMPOS_DIF[dif]);
  }

  function avanzar(nuevas, nuevaRacha, nuevoHist) {
    const { lista: l, idx: k } = estadoRef.current;
    setTimeout(() => {
      if (k + 1 >= l.length) {
        const puntos = nuevas * 10;
        if (nuevas >= 7) { sfx.record(); sfx.moneda(); }
        else if (nuevas >= 4) sfx.bien();
        else sfx.mal();
        registrarPunt(puntos, nuevas >= 7 ? 1 : 0);
        setCorrectas(nuevas);
        setRacha(nuevaRacha);
        setMejorRacha(m => Math.max(m, nuevaRacha));
        setHistorial(nuevoHist);
        setFin(true);
      } else {
        setCorrectas(nuevas);
        setRacha(nuevaRacha);
        setMejorRacha(m => Math.max(m, nuevaRacha));
        setHistorial(nuevoHist);
        setIdx(k + 1);
        setElegida(null);
        estadoRef.current.elegida = null;
        setCursor(0);
        setRestante(TIEMPOS_DIF[dif]);
      }
    }, 750);
  }

  function responder(i) {
    const { lista: l, idx: k, elegida: e, correctas: c, racha: r, historial: h } = estadoRef.current;
    if (e != null || !l.length || k >= l.length) return;
    setElegida(i);
    estadoRef.current.elegida = i;
    const esCorrecta = i === l[k].r;
    if (esCorrecta) sfx.bien();
    else sfx.mal();
    avanzar(c + (esCorrecta ? 1 : 0), esCorrecta ? r + 1 : 0, [...h, esCorrecta]);
  }

  const responderRef = useRef(responder);
  responderRef.current = responder;
  const empezarRef = useRef(empezar);
  empezarRef.current = empezar;

  // Crono por pregunta: al agotarse cuenta como fallo
  useEffect(() => {
    if (!lista.length || fin || elegida != null) return;
    const id = setInterval(() => {
      setRestante(prev => {
        if (prev <= 100) {
          clearInterval(id);
          responderRef.current(-1);
          return 0;
        }
        return prev - 100;
      });
    }, 100);
    return () => clearInterval(id);
  }, [lista, idx, fin, elegida]);

  useEffect(() => {
    const fn = e => {
      if (escribiendo()) return;
      if (!estadoRef.current.lista.length) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          empezarRef.current(0);
        }
        return;
      }
      if (estadoRef.current.elegida != null) return;
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
        descripcion={`Responde 10 preguntas contra el crono (${TIEMPOS_DIF[dif] / 1000}s cada una). Cada acierto vale 10 puntos.`}
        stats={[
          { icono: "❓", etiqueta: "Preguntas", valor: "10" },
          { icono: "⏱", etiqueta: "Tiempo", valor: `${TIEMPOS_DIF[dif] / 1000}s` },
          { icono: "🎯", etiqueta: "Dificultad", valor: NOMBRE_DIF[dif] },
        ]}
        acciones={<button className="btn-exito" onClick={() => empezar(0)}>🔀 Empezar mezcla <kbd>ENTER</kbd></button>}
        ayuda={<>
          <span>Elige una categoría y responde <b>10 preguntas</b>: cada acierto vale <b>10 puntos</b>.</span>
          <span>Tienes <b>{TIEMPOS_DIF[dif] / 1000} segundos</b> por pregunta: si se agota el tiempo, cuenta como fallo y se rompe tu racha.</span>
          <span>Controles: teclas <kbd>A</kbd>–<kbd>D</kbd> o <kbd>1</kbd>–<kbd>4</kbd>, flechas + <kbd>ENTER</kbd>, o toca la opción. <kbd>ENTER</kbd> empieza.</span>
          <span>Puntuación: con <b>7+</b> la partida cuenta como victoria. Dificultad: <b>Fácil 20s</b>, <b>Normal 15s</b>, <b>Difícil 10s</b>.</span>
          <span>Consejo: si dudas, descarta dos opciones y juega con la intuición antes de que el crono te coma.</span>
        </>}>
        <div className="fila-botones" role="group" aria-label="Dificultad">
          {[1, 2, 3].map(d => (
            <button key={d} className={dif === d ? "btn-principal" : "btn-suave"} onClick={() => { setDif(d); sfx.clic(); }}>{d === 1 ? "🟢 Fácil 20s" : d === 2 ? "🟡 Normal 15s" : "🔴 Difícil 10s"}</button>
          ))}
        </div>
        <div className="xp-bar fina" role="progressbar" aria-valuenow={0} aria-valuemin={0} aria-valuemax={100} aria-label="Sin empezar"><div style={{ width: "0%" }} /></div>
        <p>Elige una categoría:</p>
        <div className="fila-botones">
          {CATEGORIAS.map((c, i) => (
            <button key={c} className="btn-principal" onClick={() => empezar(i)}>{i === 0 ? "🔀" : ""} {c}</button>
          ))}
        </div>
      </GameShell>
    );
  }

  const pregunta = lista[idx];
  const pctTiempo = Math.max(0, Math.round((restante / TIEMPO_MS) * 100));
  const pctProg = Math.round((historial.length / lista.length) * 100);

  return (
    <GameShell titulo="Trivia" emoji="❓"
      descripcion="Teclado: A-D / 1-4 o flechas + ENTER. 10 preguntas contra el crono."
      stats={[
        { etiqueta: "Pregunta", valor: `${idx + 1}/${lista.length}` },
        { icono: "✅", etiqueta: "Aciertos", valor: correctas + (elegida != null && elegida === pregunta.r ? 1 : 0) },
        { icono: "🔥", etiqueta: "Racha", valor: `×${Math.max(racha, mejorRacha >= racha ? mejorRacha : racha)}` },
        { icono: "🎯", etiqueta: "Dificultad", valor: NOMBRE_DIF[dif] },
      ]}
      resultado={fin ? { mensaje: `${mensaje} · Resultado: ${correctas}/${lista.length}`, tipo } : null}
      acciones={fin ? <button className="btn-exito" onClick={() => empezar(0)}>🔀 Otra ronda</button> : null}
      ayuda={<>
        <span>Cada acierto vale <b>10 puntos</b>. Con <b>7+</b> la partida cuenta como victoria.</span>
        <span>El crono da <b>{TIEMPOS_DIF[dif] / 1000} s</b> por pregunta; al agotarse, fallo automático.</span>
        <span>Controles: <kbd>A</kbd>–<kbd>D</kbd>, <kbd>1</kbd>–<kbd>4</kbd>, flechas + <kbd>ENTER</kbd> o tacto.</span>
        <span>Consejo: responde rápido las fáciles para guardar segundos mentales en las difíciles.</span>
      </>}>
      <div className="xp-bar fina" role="progressbar" aria-valuenow={pctProg} aria-valuemin={0} aria-valuemax={100} aria-label="Progreso"><div style={{ width: `${pctProg}%` }} /></div>
      {!fin && (
        <div className="trivia-card">
          <span className="trivia-cat">{pregunta.c}</span>
          <h3 className="trivia-pregunta">{pregunta.p}</h3>
          <div className={`trivia-tiempo${pctTiempo <= 33 ? " urgente" : ""}`} role="progressbar"
            aria-valuenow={pctTiempo} aria-valuemin={0} aria-valuemax={100} aria-label="Tiempo restante">
            <div style={{ width: `${pctTiempo}%` }} />
          </div>
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
                  <i className="op-letra">{LETRAS[i]}</i> {op}
                  <kbd>{LETRAS[i]}</kbd>
                </button>
              );
            })}
          </div>
          <div className="trivia-puntos" aria-label="Progreso">
            {lista.map((_, i) => (
              <span key={i} className={
                `tp-dot${i < historial.length ? (historial[i] ? " bien" : " mal") : i === idx ? " actual" : ""}`
              } />
            ))}
          </div>
        </div>
      )}
    </GameShell>
  );
}
