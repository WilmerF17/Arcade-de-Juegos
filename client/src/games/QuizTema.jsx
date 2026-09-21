import { useState } from "react";
import GameShell, { useRegistro } from "../ui/GameShell";
import { sfx } from "../suite/sonido";

/* Motor de quizzes temáticos: 6 preguntas, +100 por acierto con bonus de racha. */
function QuizBase({ titulo, emoji, preguntas, tira, iconoFondo }) {
  const { mensaje, tipo, registrarPunt } = useRegistro(titulo);
  const [orden, setOrden] = useState([]);
  const [idx, setIdx] = useState(0);
  const [puntos, setPuntos] = useState(0);
  const [racha, setRacha] = useState(0);
  const [jugando, setJugando] = useState(false);

  function mezclar(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function empezar() {
    setOrden(mezclar(preguntas).slice(0, 6));
    setIdx(0); setPuntos(0); setRacha(0); setJugando(true);
    sfx.clic();
  }

  function responder(i) {
    if (!jugando) return;
    const q = orden[idx];
    if (i === q.ok) {
      const nr = racha + 1;
      const np = puntos + 100 + Math.min(50, nr * 10);
      setRacha(nr); setPuntos(np);
      sfx.bien();
    } else {
      setRacha(0);
      sfx.mal();
    }
    if (idx + 1 >= orden.length) {
      setJugando(false);
      registrarPunt(puntos + (i === q.ok ? 100 + Math.min(50, (racha + 1) * 10) : 0), puntos >= 400 ? 1 : 0);
    } else {
      setIdx(idx + 1);
    }
  }

  const q = orden[idx];
  return (
    <GameShell titulo={titulo} emoji={emoji}
      descripcion="6 preguntas del tema · +100 por acierto · las rachas dan bonus."
      tira={tira} iconoFondo={iconoFondo}>
      <div className="fila-botones" style={{ marginTop: 0 }}>
        <span className="chip">Pregunta: <b>{jugando ? `${idx + 1}/6` : "—"}</b></span>
        <span className="chip">Puntos: <b>{puntos}</b></span>
        <span className="chip">🔥 <b>{racha}</b></span>
      </div>
      {!jugando && idx === 0 && (
        <div className="fila-botones"><button className="btn-principal" onClick={empezar}>▶ Empezar quiz</button></div>
      )}
      {jugando && q && (
        <>
          <p style={{ fontSize: "1.15rem", textAlign: "center" }}><b>{q.p}</b></p>
          <div style={{ display: "grid", gap: 8 }}>
            {q.o.map((op, i) => (
              <button key={i} className="btn-suave" style={{ padding: "12px" }} onClick={() => responder(i)}>{op}</button>
            ))}
          </div>
        </>
      )}
      {mensaje && <div className={`mensaje-final ${tipo}`}>{mensaje}</div>}
      {!jugando && idx > 0 && !mensaje && (
        <div className="fila-botones"><button className="btn-principal" onClick={empezar}>↻ Otra vez</button></div>
      )}
    </GameShell>
  );
}

const T = (titulo, emoji, preguntas, tira, iconoFondo) => function Comp() {
  return <QuizBase titulo={titulo} emoji={emoji} preguntas={preguntas} tira={tira} iconoFondo={iconoFondo} />;
};

/* Q: pregunta, O: opciones (la correcta marcada con * al inicio) */
function Q(p, ...ops) {
  const o = ops.map(s => s.replace(/^\*/, ""));
  return { p, o, ok: ops.findIndex(s => s.startsWith("*")) };
}

export const QuizHistoria = T("Quiz Historia", "🏛️", [
  Q("¿En qué año llegó Colón a América?", "*1492", "1502", "1482", "1512"),
  Q("¿En qué país están las pirámides de Guiza?", "México", "*Egipto", "Perú", "Grecia"),
  Q("¿Dónde está la Gran Muralla?", "*China", "India", "Japón", "Mongolia"),
  Q("¿En qué ciudad está el Coliseo?", "Atenas", "Madrid", "*Roma", "París"),
  Q("¿En qué año fue la Revolución Francesa?", "1689", "*1789", "1889", "1589"),
  Q("¿Cleopatra fue reina de…?", "Roma", "Grecia", "*Egipto", "Persia"),
], "linear-gradient(135deg,#b45309,#451a03)", "linear-gradient(135deg,#b45309,#451a03)");

export const QuizCiencia = T("Quiz Ciencia", "🔬", [
  Q("¿Fórmula química del agua?", "CO2", "*H2O", "O2", "NaCl"),
  Q("¿El planeta rojo?", "*Marte", "Venus", "Júpiter", "Mercurio"),
  Q("¿Quién describió la gravedad?", "Einstein", "Galileo", "*Newton", "Darwin"),
  Q("¿A qué temperatura hierve el agua?", "90°C", "*100°C", "110°C", "80°C"),
  Q("¿Qué gas respiramos para vivir?", "*Oxígeno", "Helio", "Nitrógeno puro", "Hidrógeno"),
  Q("¿El Sol es…?", "Un planeta", "*Una estrella", "Un satélite", "Un cometa"),
], "linear-gradient(135deg,#0ea5e9,#22c55e)", "linear-gradient(135deg,#0ea5e9,#22c55e)");

export const QuizGeografia = T("Quiz Geografía", "🗺️", [
  Q("¿El desierto cálido más grande?", "*Sahara", "Gobi", "Atacama", "Kalahari"),
  Q("¿La montaña más alta?", "*Everest", "Aconcagua", "K2", "Mont Blanc"),
  Q("¿El océano más grande?", "Atlántico", "Índico", "*Pacífico", "Ártico"),
  Q("¿En qué península está España?", "*Ibérica", "Itálica", "Balcanes", "Escandinava"),
  Q("¿La selva más extensa?", "*Amazonas", "Congo", "Borneo", "Daintree"),
  Q("¿Qué continente es Australia?", "Asia", "África", "*Oceanía", "América"),
], "linear-gradient(135deg,#16a34a,#0ea5e9)", "linear-gradient(135deg,#16a34a,#0ea5e9)");

export const QuizDeportes = T("Quiz Deportes", "🏅", [
  Q("¿Jugadores de fútbol por equipo?", "9", "*11", "10", "12"),
  Q("¿Cada cuánto son los Juegos Olímpicos?", "2 años", "*4 años", "3 años", "5 años"),
  Q("¿Jugadores de baloncesto por equipo en cancha?", "6", "4", "*5", "7"),
  Q("¿Distancia aproximada de un maratón?", "30 km", "*42 km", "50 km", "25 km"),
  Q("¿Casillas de un tablero de ajedrez?", "48", "*64", "32", "100"),
  Q("¿En tenis, qué es un 'ace'?", "Una falta", "*Un saque directo", "Un tie-break", "Una volea"),
], "linear-gradient(135deg,#f59e0b,#ef4444)", "linear-gradient(135deg,#f59e0b,#ef4444)");

export const QuizMusica = T("Quiz Música", "🎵", [
  Q("¿Teclas tiene un piano?", "76", "*88", "96", "64"),
  Q("¿Cuerdas tiene un violín?", "6", "5", "*4", "7"),
  Q("¿Cuerdas tiene una guitarra?", "4", "5", "*6", "8"),
  Q("¿Líneas tiene un pentagrama?", "4", "*5", "6", "3"),
  Q("¿Con qué dirige el director de orquesta?", "*Batuta", "Varita", "Puntero", "Arco"),
  Q("¿Qué instrumento tiene teclas blancas y negras?", "*Piano", "Trompeta", "Flauta", "Batería"),
], "linear-gradient(135deg,#8b5cf6,#ec4899)", "linear-gradient(135deg,#8b5cf6,#ec4899)");

export const QuizCine = T("Quiz Cine", "🎬", [
  Q("¿Premio más famoso del cine?", "*Óscar", "Grammy", "Emmy", "Tony"),
  Q("¿Dónde está Hollywood?", "*Los Ángeles", "Nueva York", "Miami", "Londres"),
  Q("¿Fotogramas por segundo del cine clásico?", "*24", "30", "60", "12"),
  Q("¿Quién es Charlot?", "*Chaplin", "Hitchcock", "Disney", "Keaton"),
  Q("¿De qué están hechas las palomitas?", "*Maíz", "Trigo", "Arroz", "Avena"),
  Q("¿Qué es un cortometraje?", "*Una película corta", "Un anuncio", "Un tráiler", "Un documental largo"),
], "linear-gradient(135deg,#57534e,#a855f7)", "linear-gradient(135deg,#57534e,#a855f7)");

export const QuizNaturaleza = T("Quiz Naturaleza", "🌿", [
  Q("¿Qué hacen las plantas con la luz?", "*Fotosíntesis", "Digestión", "Respiración solo", "Nada"),
  Q("¿Qué producen las abejas?", "*Miel", "Seda", "Cera solo", "Leche"),
  Q("¿Brazos tiene un pulpo?", "6", "*8", "10", "4"),
  Q("¿Qué animal es el mamífero marino más grande?", "Tiburón", "Delfín", "*Ballena", "Orca"),
  Q("¿Dónde vive el cactus?", "*Desierto", "Selva", "Polo", "Pantano"),
  Q("¿Qué animal es un mamífero que vuela?", "Águila", "*Murciélago", "Abeja", "Mariposa"),
], "linear-gradient(135deg,#22c55e,#84cc16)", "linear-gradient(135deg,#22c55e,#84cc16)");

export const QuizTecno = T("Quiz Tecnología", "💻", [
  Q("¿Qué significa @ en un correo?", "*Arroba", "Punto", "Guion", "Dominio"),
  Q("¿Qué es el wifi?", "Un cable", "*Internet inalámbrico", "Un virus", "Una app"),
  Q("¿Qué es un píxel?", "Un virus", "*Un punto de imagen", "Un chip", "Un cable"),
  Q("¿Qué es un robot?", "Un humano", "*Una máquina programable", "Un juego", "Un coche"),
  Q("¿Para qué sirve un buscador?", "*Encontrar páginas", "Enviar correos", "Jugar", "Imprimir"),
  Q("¿Qué es una contraseña segura?", "*Larga y única", "Tu nombre", "1234", "La misma en todo"),
], "linear-gradient(135deg,#38bdf8,#6366f1)", "linear-gradient(135deg,#38bdf8,#6366f1)");

export const QuizArte = T("Quiz Arte", "🎨", [
  Q("¿Quién pintó la Mona Lisa?", "*Da Vinci", "Picasso", "Van Gogh", "Dalí"),
  Q("¿Quién pintó el Guernica?", "Dalí", "*Picasso", "Miró", "Goya"),
  Q("¿Con qué se pinta al óleo?", "*Pincel", "Martillo", "Tijeras", "Regla"),
  Q("¿Dónde se exponen obras de arte?", "Banco", "*Museo", "Estadio", "Mercado"),
  Q("¿Qué es una escultura?", "Un cuadro", "*Una obra en 3D", "Una foto", "Un dibujo plano"),
  Q("¿Qué colores son primarios?", "*Rojo, azul y amarillo", "Verde, rosa y negro", "Blanco y negro", "Todos"),
], "linear-gradient(135deg,#ec4899,#f59e0b)", "linear-gradient(135deg,#ec4899,#f59e0b)");

export const QuizGastro = T("Quiz Gastronomía", "🍽️", [
  Q("¿De dónde es la paella?", "*España", "Italia", "México", "Grecia"),
  Q("¿De dónde es la pizza?", "Francia", "*Italia", "EE. UU.", "Turquía"),
  Q("¿De dónde son los tacos?", "Perú", "*México", "Chile", "Cuba"),
  Q("¿Ingrediente principal del sushi?", "Pollo", "*Pescado", "Cerdo", "Queso"),
  Q("¿De qué planta sale el chocolate?", "*Cacao", "Café", "Vainilla", "Menta"),
  Q("¿Ingrediente base del pan?", "Arroz", "*Harina", "Azúcar", "Leche"),
], "linear-gradient(135deg,#ea580c,#facc15)", "linear-gradient(135deg,#ea580c,#facc15)");

export const QuizAnimales = T("Quiz Animales", "🦁", [
  Q("¿Dónde vive el canguro?", "África", "*Australia", "Asia", "América"),
  Q("¿El pingüino puede volar?", "Sí", "*No, pero nada", "Solo de noche", "Solo el macho"),
  Q("¿Qué usa el elefante para agarrar?", "*La trompa", "La cola", "Las orejas", "Los colmillos"),
  Q("¿Quién tiene melena?", "Tigresa", "*León", "Lobo", "Oso"),
  Q("¿Patas tiene una araña?", "6", "*8", "10", "4"),
  Q("¿Qué come la jirafa?", "*Hojas altas", "Carne", "Peces", "Insectos"),
], "linear-gradient(135deg,#a16207,#eab308)", "linear-gradient(135deg,#a16207,#eab308)");

export const QuizEspacio = T("Quiz Espacio", "🚀", [
  Q("¿Satélite natural de la Tierra?", "*La Luna", "Marte", "El Sol", "Venus"),
  Q("¿Planeta de los anillos?", "Marte", "*Saturno", "Mercurio", "Venus"),
  Q("¿Nuestra galaxia?", "*Vía Láctea", "Andrómeda", "Orión", "Sirio"),
  Q("¿El planeta más grande?", "Tierra", "*Júpiter", "Saturno", "Neptuno"),
  Q("¿Qué lleva un astronauta?", "*Traje espacial", "Bañador", "Paraguas", "Esquís"),
  Q("¿Qué es un cometa?", "*Hielo y polvo con cola", "Una estrella", "Un planeta", "Un satélite"),
], "linear-gradient(135deg,#0f172a,#7c3aed)", "linear-gradient(135deg,#0f172a,#7c3aed)");

export const QuizLibros = T("Quiz Libros", "📚", [
  Q("¿Quién escribió el Quijote?", "*Cervantes", "Lorca", "Quevedo", "Góngora"),
  Q("¿Dónde se prestan libros?", "Museo", "*Biblioteca", "Banco", "Cine"),
  Q("¿Qué es un cuento?", "Poema largo", "*Relato corto", "Novela de 500 páginas", "Obra de teatro"),
  Q("¿Qué escribe un poeta?", "*Versos", "Leyes", "Facturas", "Mapas"),
  Q("¿Qué tiene moraleja?", "*Fábula", "Manual", "Diccionario", "Atlas"),
  Q("¿Qué ordena las letras?", "*Alfabeto", "Número", "Calendario", "Reloj"),
], "linear-gradient(135deg,#78716c,#b45309)", "linear-gradient(135deg,#78716c,#b45309)");

export const QuizCuerpo = T("Quiz Cuerpo", "🫀", [
  Q("¿Qué bombea la sangre?", "*Corazón", "Pulmón", "Hígado", "Riñón"),
  Q("¿Cuántos sentidos tenemos?", "4", "*5", "6", "7"),
  Q("¿Para qué son los pulmones?", "*Respirar", "Pensar", "Comer", "Ver"),
  Q("¿Con qué vemos?", "Orejas", "*Ojos", "Nariz", "Piel"),
  Q("¿Qué órgano piensa?", "Corazón", "*Cerebro", "Estómago", "Pulmón"),
  Q("¿Qué nos sostiene por dentro?", "Músculos solo", "*Huesos", "Piel", "Pelo"),
], "linear-gradient(135deg,#ef4444,#f59e0b)", "linear-gradient(135deg,#ef4444,#f59e0b)");

export const QuizViajes = T("Quiz Viajes", "✈️", [
  Q("¿Documento para viajar al extranjero?", "*Pasaporte", "Factura", "Menú", "Entrada de cine"),
  Q("¿Qué indica el norte?", "*Brújula", "Reloj", "Termómetro", "Regla"),
  Q("¿Para qué sirve un mapa?", "*Orientarse", "Comer", "Dormir", "Jugar"),
  Q("¿Dónde duermes de viaje?", "Museo", "*Hotel", "Banco", "Estadio"),
  Q("¿Medio de transporte más rápido?", "Barco", "*Avión", "Bici", "Tren a pie"),
  Q("¿Qué llevas en la maleta?", "*Ropa", "Muebles", "Comida del mes", "Macetas"),
], "linear-gradient(135deg,#0ea5e9,#6366f1)", "linear-gradient(135deg,#0ea5e9,#6366f1)");

export const QuizMitologia = T("Quiz Mitología", "⚡", [
  Q("¿Dios griego del rayo?", "*Zeus", "Ares", "Apolo", "Hades"),
  Q("¿De quién es el martillo Mjolnir?", "Odín", "*Thor", "Loki", "Balder"),
  Q("¿Quién vivía en el laberinto de Creta?", "Medusa", "*Minotauro", "Hidra", "Quimera"),
  Q("¿Héroe de los doce trabajos?", "*Hércules", "Aquiles", "Ulises", "Perseo"),
  Q("¿Cabello de serpientes y mirada de piedra?", "*Medusa", "Esfinge", "Sirena", "Arpía"),
  Q("¿Enigma de la Esfinge de Egipto?", "*Enigma", "Tesoro", "Mapa", "Hechizo"),
], "linear-gradient(135deg,#f59e0b,#7c3aed)", "linear-gradient(135deg,#f59e0b,#7c3aed)");

export const QuizInventos = T("Quiz Inventos", "💡", [
  Q("¿Qué invento movió el transporte?", "*La rueda", "La vela", "El clavo", "La cuerda"),
  Q("¿Quién mejoró la bombilla?", "*Edison", "Tesla", "Bell", "Curie"),
  Q("¿Quién patentó el teléfono?", "Morse", "*Bell", "Marconi", "Nobel"),
  Q("¿Quiénes volaron primero?", "*Hermanos Wright", "Santos-Dumont", "Lindbergh", "Earhart"),
  Q("¿Quién creó la imprenta moderna?", "*Gutenberg", "Da Vinci", "Galileo", "Copérnico"),
  Q("¿Descubridor de la penicilina?", "Pasteur", "*Fleming", "Lister", "Koch"),
], "linear-gradient(135deg,#facc15,#0ea5e9)", "linear-gradient(135deg,#facc15,#0ea5e9)");

export const QuizOceanos = T("Quiz Océanos", "🌊", [
  Q("¿El océano más grande?", "*Pacífico", "Atlántico", "Índico", "Ártico"),
  Q("¿El segundo océano más grande?", "Índico", "*Atlántico", "Pacífico", "Antártico"),
  Q("¿Animal marino más grande?", "Tiburón", "*Ballena", "Delfín", "Orca"),
  Q("¿Fosa más profunda?", "*Marianas", "Java", "Tonga", "Kermadec"),
  Q("¿Arrecife famoso de Australia?", "*Gran Barrera", "Rojo", "Florida", "Belice"),
  Q("¿Qué tiburón es el mayor?", "*Tiburón ballena", "Blanco", "Tigre", "Martillo"),
], "linear-gradient(135deg,#0369a1,#22d3ee)", "linear-gradient(135deg,#0369a1,#22d3ee)");
