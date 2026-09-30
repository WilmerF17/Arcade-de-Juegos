import { useEffect, useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { sfx } from "../suite/sonido";

/* Motor "el intruso": 4 palabras, una no pertenece. */
/* set: [buenas(3 del mismo grupo), intruso] */
const DIFS = { "Fácil": { n: 6 }, "Normal": { n: 8 }, "Difícil": { n: 10 } };
function IntrusoBase({ titulo, emoji, sets, tira, iconoFondo }) {
  const { mensaje, tipo, registrarPunt } = useRegistro(titulo);
  const [dif, setDif] = useState("Normal");
  const RONDAS = DIFS[dif].n;
  const [ronda, setRonda] = useState(null);
  const [idx, setIdx] = useState(0);
  const [puntos, setPuntos] = useState(0);
  const [racha, setRacha] = useState(0);
  const [jugando, setJugando] = useState(false);

  function nuevaRonda() {
    const [buenas, intruso] = sets[Math.floor(Math.random() * sets.length)];
    const opciones = [...buenas.slice(0, 3), intruso].sort(() => Math.random() - 0.5);
    setRonda({ opciones, intruso });
  }

  function empezar() {
    setPuntos(0); setRacha(0); setIdx(1); setJugando(true);
    nuevaRonda();
    sfx.clic();
  }

  function elegir(p) {
    if (!jugando) return;
    if (p === ronda.intruso) {
      const nr = racha + 1;
      const np = puntos + 100 + Math.min(50, nr * 10);
      setRacha(nr); setPuntos(np);
      sfx.bien();
    } else {
      setRacha(0);
      sfx.mal();
    }
    if (idx >= RONDAS) {
      setJugando(false);
      registrarPunt(puntos + (p === ronda.intruso ? 100 : 0), puntos >= 600 ? 1 : 0);
    } else {
      nuevaRonda();
      setIdx(idx + 1);
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
      if (!jugando || !ronda) return;
      const k = String(e.key).toLowerCase();
      let i = -1;
      if (["1", "2", "3", "4"].includes(e.key)) i = parseInt(e.key, 10) - 1;
      else if (["a", "b", "c", "d"].includes(k)) i = "abcd".indexOf(k);
      if (i >= 0 && i < ronda.opciones.length) elegir(ronda.opciones[i]);
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }); // eslint-disable-line react-hooks/exhaustive-deps

  const pct = RONDAS ? Math.round(((idx - (jugando ? 1 : 0)) / RONDAS) * 100) : 0;
  return (
    <GameShell titulo={titulo} emoji={emoji}
      descripcion={`¿Cuál no pertenece al grupo? · ${RONDAS} rondas.`}
      tira={tira} iconoFondo={iconoFondo}
      stats={[
        { icono: "🕵️", etiqueta: "Ronda", valor: jugando ? `${idx}/${RONDAS}` : "—" },
        { icono: "⭐", etiqueta: "Puntos", valor: puntos },
        { icono: "🔥", etiqueta: "Racha", valor: racha },
        { icono: "🎚️", etiqueta: "Dificultad", valor: dif },
      ]}
      resultado={{ mensaje, tipo }}
      ayuda={(
        <div>
          <p><b>Reglas:</b> entre 4 palabras, una no pertenece al grupo. Encuéntrala durante {RONDAS} rondas.</p>
          <p><b>Controles:</b> ratón o táctil tocando la palabra · teclado <kbd>1</kbd>–<kbd>4</kbd> para elegir, <kbd>Enter</kbd>/<kbd>Espacio</kbd> para empezar.</p>
          <p><b>Puntuación:</b> +100 por acierto más bonus de racha. Victoria con 600+ puntos.</p>
          <p><b>Consejo:</b> busca primero qué tienen en común tres de ellas; el intruso suele cantar solo.</p>
        </div>
      )}
      acciones={(
        <>
          {["Fácil", "Normal", "Difícil"].map(d => (
            <button key={d} className={dif === d ? "btn-principal" : "btn-suave"} disabled={jugando} onClick={() => { setDif(d); sfx.clic(); }}>{d}</button>
          ))}
          {!jugando && <button className="btn-principal" onClick={empezar}>{idx > 0 ? "↻ Otra vez" : "▶ Empezar"}</button>}
        </>
      )}>
      <div className="xp-bar fina" aria-hidden><div style={{ width: `${pct}%` }} /></div>
      {jugando && ronda && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
          {ronda.opciones.map((o, i) => (
            <button key={o} className="trivia-op" style={{ padding: "16px 8px", fontSize: "1.1rem" }} onClick={() => elegir(o)}><span className="op-letra"><kbd>{i + 1}</kbd></span> {o}</button>
          ))}
        </div>
      )}
      <Resultado mensaje="" tipo="" />
    </GameShell>
  );
}

const IN = (titulo, emoji, sets, tira, iconoFondo) => function Comp() {
  return <IntrusoBase titulo={titulo} emoji={emoji} sets={sets} tira={tira} iconoFondo={iconoFondo} />;
};

export const IntrusoAnimales = IN("El Intruso: Animales", "🦁", [
  [["Perro", "Gato", "Conejo"], "Tiburón"], [["León", "Tigre", "Lobo"], "Gallina"],
  [["Ballena", "Delfín", "Tiburón"], "Elefante"], [["Águila", "Loro", "Búho"], "Pingüino"],
  [["Caballo", "Vaca", "Oveja"], "Cocodrilo"], [["Mono", "Gorila", "Chimpancé"], "Jirafa"],
  [["Oso", "Lobo", "Zorro"], "Canguro"], [["Serpiente", "Lagarto", "Cocodrilo"], "Rana"],
], "linear-gradient(135deg,#a16207,#eab308)", "linear-gradient(135deg,#a16207,#eab308)");

export const IntrusoFrutas = IN("El Intruso: Frutas", "🍎", [
  [["Manzana", "Pera", "Uva"], "Zanahoria"], [["Naranja", "Limón", "Mandarina"], "Lechuga"],
  [["Plátano", "Mango", "Piña"], "Patata"], [["Sandía", "Melón", "Fresa"], "Cebolla"],
  [["Cereza", "Ciruela", "Albaricoque"], "Tomate"], [["Kiwi", "Papaya", "Coco"], "Ajo"],
  [["Limón", "Pomelo", "Lima"], "Pimiento"], [["Mora", "Frambuesa", "Arándano"], "Pepino"],
], "linear-gradient(135deg,#22c55e,#eab308)", "linear-gradient(135deg,#22c55e,#eab308)");

export const IntrusoPaises = IN("El Intruso: Países", "🌍", [
  [["España", "Francia", "Italia"], "Japón"], [["México", "Chile", "Perú"], "Egipto"],
  [["China", "India", "Japón"], "Brasil"], [["Alemania", "Polonia", "Austria"], "Marruecos"],
  [["Argentina", "Uruguay", "Paraguay"], "Canadá"], [["Noruega", "Suecia", "Finlandia"], "Australia"],
  [["Portugal", "Grecia", "Croacia"], "Tailandia"], [["Cuba", "Jamaica", "Haití"], "Suiza"],
], "linear-gradient(135deg,#0ea5e9,#22c55e)", "linear-gradient(135deg,#0ea5e9,#22c55e)");

export const IntrusoColores = IN("El Intruso: Colores", "🎨", [
  [["Rojo", "Azul", "Amarillo"], "Mesa"], [["Verde", "Rosa", "Naranja"], "Silla"],
  [["Blanco", "Negro", "Gris"], "Puerta"], [["Morado", "Turquesa", "Beige"], "Zapato"],
  [["Granate", "Esmeralda", "Ocre"], "Ventana"], [["Celeste", "Fucsia", "Lila"], "Reloj"],
  [["Dorado", "Plateado", "Bronce"], "Libro"], [["Coral", "Índigo", "Caqui"], "Pelota"],
], "linear-gradient(135deg,#f43f5e,#facc15)", "linear-gradient(135deg,#f43f5e,#facc15)");

export const IntrusoDeportes = IN("El Intruso: Deportes", "🏅", [
  [["Fútbol", "Baloncesto", "Tenis"], "Ajedrez"], [["Natación", "Waterpolo", "Surf"], "Boxeo"],
  [["Ciclismo", "Motociclismo", "Atletismo"], "Golf"], [["Esquí", "Patinaje", "Hockey hielo"], "Natación"],
  [["Béisbol", "Cricket", "Softbol"], "Yoga"], [["Rugby", "Fútbol americano", "Balonmano"], "Esgrima"],
  [["Voleibol", "Bádminton", "Squash"], "Halterofilia"], [["Kárate", "Judo", "Taekwondo"], "Remo"],
], "linear-gradient(135deg,#f59e0b,#ef4444)", "linear-gradient(135deg,#f59e0b,#ef4444)");

export const IntrusoOficios = IN("El Intruso: Oficios", "🧰", [
  [["Médico", "Enfermera", "Farmacéutico"], "Panadero"], [["Maestro", "Profesor", "Tutor"], "Bombero"],
  [["Carpintero", "Albañil", "Fontanero"], "Piloto"], [["Cantante", "Actor", "Bailarín"], "Contable"],
  [["Cocinero", "Camarero", "Pastelero"], "Juez"], [["Policía", "Bombero", "Socorrista"], "Diseñador"],
  [["Agricultor", "Ganadero", "Jardinero"], "Abogado"], [["Mecánico", "Electricista", "Soldador"], "Escritor"],
], "linear-gradient(135deg,#64748b,#0ea5e9)", "linear-gradient(135deg,#64748b,#0ea5e9)");

export const IntrusoInstrumentos = IN("El Intruso: Música", "🎵", [
  [["Piano", "Órgano", "Teclado"], "Trompeta"], [["Guitarra", "Violín", "Arpa"], "Flauta"],
  [["Trompeta", "Trombón", "Tuba"], "Violín"], [["Batería", "Timbal", "Bongó"], "Piano"],
  [["Flauta", "Clarinete", "Oboe"], "Guitarra"], [["Saxofón", "Trompeta", "Corneta"], "Contrabajo"],
  [["Violín", "Viola", "Violoncello"], "Tambor"], [["Armónica", "Acordeón", "Gaita"], "Bajo"],
], "linear-gradient(135deg,#8b5cf6,#ec4899)", "linear-gradient(135deg,#8b5cf6,#ec4899)");

export const IntrusoComidas = IN("El Intruso: Comidas", "🍽️", [
  [["Pizza", "Pasta", "Lasaña"], "Sushi"], [["Taco", "Burrito", "Quesadilla"], "Paella"],
  [["Sushi", "Sashimi", "Maki"], "Hamburguesa"], [["Paella", "Fideuá", "Risotto"], "Ceviche"],
  [["Ensalada", "Gazpacho", "Crema"], "Chocolate"], [["Helado", "Tarta", "Flan"], "Tortilla"],
  [["Pan", "Croissant", "Magdalena"], "Empanada"], [["Queso", "Yogur", "Mantequilla"], "Miel"],
], "linear-gradient(135deg,#ea580c,#facc15)", "linear-gradient(135deg,#ea580c,#facc15)");

export const IntrusoRopa = IN("El Intruso: Ropa", "👕", [
  [["Camisa", "Blusa", "Camiseta"], "Zapato"], [["Pantalón", "Falda", "Shorts"], "Sombrero"],
  [["Zapato", "Bota", "Sandalia"], "Bufanda"], [["Sombrero", "Gorra", "Boina"], "Guante"],
  [["Abrigo", "Chaqueta", "Jersey"], "Calcetín"], [["Vestido", "Falda", "Blusa"], "Corbata"],
  [["Bañador", "Bikini", "Bermudas"], "Traje"], [["Pijama", "Bata", "Camisón"], "Cinturón"],
], "linear-gradient(135deg,#a855f7,#6366f1)", "linear-gradient(135deg,#a855f7,#6366f1)");

export const IntrusoCasa = IN("El Intruso: Casa", "🏠", [
  [["Silla", "Sofá", "Sillón"], "Nevera"], [["Mesa", "Escritorio", "Mostrador"], "Cama"],
  [["Cama", "Litera", "Colchón"], "Horno"], [["Lámpara", "Foco", "Vela"], "Alfombra"],
  [["Cuchara", "Tenedor", "Cuchillo"], "Toalla"], [["Plato", "Vaso", "Taza"], "Cortina"],
  [["Ducha", "Bañera", "Lavabo"], "Televisor"], [["Puerta", "Ventana", "Persiana"], "Microondas"],
], "linear-gradient(135deg,#b45309,#78716c)", "linear-gradient(135deg,#b45309,#78716c)");
