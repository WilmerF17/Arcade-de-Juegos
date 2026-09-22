import { useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { sfx } from "../suite/sonido";

/* Motor "¿Qué es?": lee la pista y elige la palabra entre 4. 8 rondas. */
function AdivinaBase({ titulo, emoji, banco, tira, iconoFondo }) {
  const { mensaje, tipo, registrarPunt } = useRegistro(titulo);
  const [ronda, setRonda] = useState(null);
  const [idx, setIdx] = useState(0);
  const [puntos, setPuntos] = useState(0);
  const [racha, setRacha] = useState(0);
  const [jugando, setJugando] = useState(false);

  const RONDAS = 8;

  function nuevaRonda(asks) {
    const resto = asks.length ? asks : [...banco].sort(() => Math.random() - 0.5);
    const [palabra, pista] = resto[0];
    const dist = [...banco].filter(([p]) => p !== palabra).sort(() => Math.random() - 0.5).slice(0, 3).map(([p]) => p);
    const opciones = [palabra, ...dist].sort(() => Math.random() - 0.5);
    setRonda({ palabra, pista, opciones });
    return resto.slice(1);
  }

  const [asks, setAsks] = useState([]);
  function empezar() {
    setPuntos(0); setRacha(0); setIdx(1); setJugando(true);
    setAsks(nuevaRonda([]));
    sfx.clic();
  }

  function elegir(p) {
    if (!jugando) return;
    if (p === ronda.palabra) {
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
      registrarPunt(puntos + (p === ronda.palabra ? 100 : 0), puntos >= 500 ? 1 : 0);
    } else {
      setAsks(nuevaRonda(asks));
      setIdx(idx + 1);
    }
  }

  return (
    <GameShell titulo={titulo} emoji={emoji}
      descripcion="Lee la pista y adivina la palabra · 8 rondas · rachas con bonus."
      tira={tira} iconoFondo={iconoFondo}>
      <div className="fila-botones">
        <span className="chip">Ronda: <b>{jugando ? `${idx}/${RONDAS}` : "—"}</b></span>
        <span className="chip">Puntos: <b>{puntos}</b></span>
        <span className="chip">🔥 <b>{racha}</b></span>
      </div>
      {!jugando && idx === 0 && (
        <div className="fila-botones"><button className="btn-principal" onClick={empezar}>▶ Empezar</button></div>
      )}
      {jugando && ronda && (
        <>
          <p style={{ textAlign: "center", fontSize: "1.2rem" }}>🔎 <b>{ronda.pista}</b></p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {ronda.opciones.map(o => (
              <button key={o} className="btn-suave" style={{ padding: "14px 8px" }} onClick={() => elegir(o)}>{o}</button>
            ))}
          </div>
        </>
      )}
      <Resultado mensaje={mensaje} tipo={tipo} />
      {!jugando && idx > 0 && !mensaje && (
        <div className="fila-botones"><button className="btn-principal" onClick={empezar}>↻ Otra vez</button></div>
      )}
    </GameShell>
  );
}

const A = (titulo, emoji, banco, tira, iconoFondo) => function Comp() {
  return <AdivinaBase titulo={titulo} emoji={emoji} banco={banco} tira={tira} iconoFondo={iconoFondo} />;
};
/* [palabra, pista] */
export const PistaAnimales = A("¿Qué animal es?", "🐾", [
  ["Jirafa", "Cuello larguísimo y manchas"], ["Pingüino", "Ave que nada y no vuela"],
  ["Canguro", "Salta y lleva a su cría en el bolso"], ["Elefante", "Trompa enorme y orejas grandes"],
  ["Murciélago", "Mamífero que vuela de noche"], ["Pulpo", "Ocho brazos en el mar"],
  ["Camaleón", "Cambia de color"], ["Búho", "Caza de noche y gira la cabeza"],
], "linear-gradient(135deg,#a16207,#eab308)", "linear-gradient(135deg,#a16207,#eab308)");

export const PistaPaises = A("¿Qué país es?", "🌍", [
  ["Japón", "Sushi, samuráis y cerezos"], ["Egipto", "Pirámides y el Nilo"],
  ["Brasil", "Samba, carnaval y Amazonas"], ["Italia", "Pizza, Roma y el Coliseo"],
  ["México", "Tacos, mariachis y pirámides mayas"], ["Canadá", "Jarabe de arce y frío"],
  ["India", "Taj Mahal y especias"], ["Australia", "Canguros y la Ópera de Sídney"],
], "linear-gradient(135deg,#0ea5e9,#22c55e)", "linear-gradient(135deg,#0ea5e9,#22c55e)");

export const PistaComidas = A("¿Qué comida es?", "🍲", [
  ["Paella", "Arroz amarillo español"], ["Pizza", "Redonda italiana con queso"],
  ["Sushi", "Pescado crudo japonés con arroz"], ["Tacos", "Tortilla mexicana rellena"],
  ["Arepa", "Pan redondo de maíz"], ["Ceviche", "Pescado marinado en limón"],
  ["Hamburguesa", "Pan con carne entre medias"], ["Empanada", "Masa rellena doblada"],
], "linear-gradient(135deg,#ea580c,#facc15)", "linear-gradient(135deg,#ea580c,#facc15)");

export const PistaOficios = A("¿Qué oficio es?", "🧰", [
  ["Panadero", "Hornea el pan"], ["Médico", "Cura a los enfermos"],
  ["Maestro", "Enseña en la escuela"], ["Bombero", "Apaga incendios"],
  ["Carpintero", "Trabaja la madera"], ["Piloto", "Vuela aviones"],
  ["Pescador", "Pesca en el mar"], ["Jardinero", "Cuida plantas y flores"],
], "linear-gradient(135deg,#64748b,#0ea5e9)", "linear-gradient(135deg,#64748b,#0ea5e9)");

export const PistaDeportes = A("¿Qué deporte es?", "⚽", [
  ["Fútbol", "Once contra once con balón"], ["Tenis", "Raqueta y red"],
  ["Natación", "Se practica en la piscina"], ["Boxeo", "Guantes en un ring"],
  ["Ciclismo", "Dos ruedas y pedales"], ["Esquí", "Nieve y tablas en los pies"],
  ["Ajedrez", "Tablero de 64 casillas"], ["Rugby", "Balón ovalado y placajes"],
], "linear-gradient(135deg,#f59e0b,#ef4444)", "linear-gradient(135deg,#f59e0b,#ef4444)");

export const PistaInstrumentos = A("¿Qué instrumento es?", "🎺", [
  ["Piano", "88 teclas blancas y negras"], ["Guitarra", "Seis cuerdas"],
  ["Violín", "Se toca con arco"], ["Trompeta", "Viento metal brillante"],
  ["Flauta", "Viento madera travesera"], ["Batería", "Tambores y platillos"],
  ["Saxofón", "Viento curvo dorado"], ["Arpa", "Muchas cuerdas en triángulo"],
], "linear-gradient(135deg,#8b5cf6,#ec4899)", "linear-gradient(135deg,#8b5cf6,#ec4899)");

export const PistaFlores = A("¿Qué flor es?", "🌸", [
  ["Rosa", "Reina con espinas"], ["Girasol", "Gira buscando el sol"],
  ["Tulipán", "Copa de Holanda"], ["Margarita", "Pétalos blancos y centro amarillo"],
  ["Orquídea", "Exótica y elegante"], ["Clavel", "Borde dentado y olor dulce"],
  ["Lavanda", "Morada y perfumada"], ["Cactus flor", "Pinchos con sorpresa"],
], "linear-gradient(135deg,#ec4899,#22c55e)", "linear-gradient(135deg,#ec4899,#22c55e)");

export const PistaVehiculos = A("¿Qué vehículo es?", "🚗", [
  ["Avión", "Vuela con alas"], ["Barco", "Navega con velas o motor"],
  ["Bicicleta", "Dos ruedas a pedal"], ["Tren", "Ruedas sobre raíles"],
  ["Helicóptero", "Hélices arriba"], ["Submarino", "Viaja bajo el agua"],
  ["Camión", "Carga pesada"], ["Globo", "Canasta que flota con aire caliente"],
], "linear-gradient(135deg,#0ea5e9,#6366f1)", "linear-gradient(135deg,#0ea5e9,#6366f1)");

export const PistaFrutas = A("¿Qué fruta es?", "🍎", [
  ["Manzana", "Roja y crujiente"], ["Plátano", "Amarillo y alargado"],
  ["Naranja", "Cítrica para zumo"], ["Sandía", "Gigante verde con pepitas"],
  ["Piña", "Tropical con corona"], ["Uva", "Pequeña en racimo"],
  ["Mango", "Dulce tropical de hueso"], ["Limón", "Ácido amarillo"],
], "linear-gradient(135deg,#22c55e,#eab308)", "linear-gradient(135deg,#22c55e,#eab308)");

export const PistaRopa = A("¿Qué prenda es?", "👕", [
  ["Camisa", "Con botones y cuello"], ["Pantalón", "Dos perneras"],
  ["Zapato", "Protege el pie"], ["Sombrero", "Para la cabeza"],
  ["Bufanda", "Abriga el cuello"], ["Guantes", "Para las manos"],
  ["Falda", "Sin perneras"], ["Chaqueta", "Abrigo con mangas"],
], "linear-gradient(135deg,#a855f7,#6366f1)", "linear-gradient(135deg,#a855f7,#6366f1)");

export const PistaMuebles = A("¿Qué mueble es?", "🪑", [
  ["Silla", "Para sentarse"], ["Mesa", "Para comer encima"],
  ["Cama", "Para dormir"], ["Armario", "Guarda la ropa"],
  ["Sofá", "Sentarse cómodo en el salón"], ["Lámpara", "Da luz"],
  ["Estantería", "Guarda libros"], ["Espejo", "Devuelve tu reflejo"],
], "linear-gradient(135deg,#b45309,#78716c)", "linear-gradient(135deg,#b45309,#78716c)");

export const PistaColores = A("¿Qué color es?", "🎨", [
  ["Rojo", "Como la sangre"], ["Azul", "Como el cielo"],
  ["Verde", "Como la hierba"], ["Amarillo", "Como el sol"],
  ["Naranja", "Como la zanahoria"], ["Morado", "Como la uva"],
  ["Rosa", "Como el chicle"], ["Marrón", "Como la madera"],
], "linear-gradient(135deg,#f43f5e,#facc15)", "linear-gradient(135deg,#f43f5e,#facc15)");
