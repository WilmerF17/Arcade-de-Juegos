import { useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { sfx } from "../suite/sonido";

/* Motor de quizzes extra: 6 preguntas, +100 por acierto con bonus de racha.
   Reutiliza la fórmula del QuizBase para no duplicar lógica de XP. */
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
      <div className="fila-botones">
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
      <Resultado mensaje={mensaje} tipo={tipo} />
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

export const QuizMates = T("Quiz Mates", "➗", [
  Q("¿7 × 8?", "54", "*56", "63", "48"),
  Q("¿Mitad de 150?", "60", "80", "*75", "70"),
  Q("¿12²?", "124", "134", "*144", "154"),
  Q("¿Qué número es primo?", "21", "27", "*29", "33"),
  Q("¿15% de 200?", "25", "*30", "35", "20"),
  Q("¿3/4 de 100?", "60", "70", "*75", "80"),
  Q("¿9 × 9 + 1?", "80", "*82", "81", "90"),
  Q("¿Siguiente primo después del 7?", "9", "*11", "10", "13"),
], "linear-gradient(135deg,#6366f1,#22d3ee)", "linear-gradient(135deg,#6366f1,#22d3ee)");

export const QuizIngles = T("Quiz Inglés", "🇬🇧", [
  Q("¿Cómo se dice 'perro'?", "Cat", "*Dog", "Bird", "Fish"),
  Q("¿Cómo se dice 'gracias'?", "Please", "*Thanks", "Hello", "Bye"),
  Q("¿Qué significa 'red'?", "Azul", "*Rojo", "Verde", "Amarillo"),
  Q("¿Cómo se dice 'amigo'?", "*Friend", "Family", "Enemy", "Teacher"),
  Q("¿Qué significa 'book'?", "Mesa", "Silla", "*Libro", "Puerta"),
  Q("¿Cómo se dice 'agua'?", "Fire", "Bread", "*Water", "Milk"),
  Q("¿Qué significa 'happy'?", "Triste", "*Feliz", "Cansado", "Enfermo"),
  Q("¿Cómo se dice 'escuela'?", "*School", "House", "Park", "Shop"),
], "linear-gradient(135deg,#0ea5e9,#6366f1)", "linear-gradient(135deg,#0ea5e9,#6366f1)");

export const QuizCodigo = T("Quiz Código", "💻", [
  Q("¿Qué etiqueta hace un botón en HTML?", "img", "*button", "div", "link"),
  Q("¿Qué significa CSS?", "Código Secreto Simple", "*Hojas de estilo", "Control de sonido", "Caja segura"),
  Q("¿Con qué declaras una variable en JS moderno?", "var siempre", "*let o const", "int", "string"),
  Q("¿Qué hace 'if'?", "Repite", "*Decide según condición", "Guarda archivo", "Dibuja"),
  Q("¿Qué es un 'bug'?", "Una función", "*Un error", "Un archivo", "Un virus siempre"),
  Q("¿Qué guarda una lista de valores?", "Un número", "*Un array", "Un color", "Un clic"),
  Q("¿Qué atajo guarda en casi todo?", "Ctrl+X", "*Ctrl+S", "Ctrl+Q", "Ctrl+P siempre"),
  Q("¿Qué es la 'nube'?", "Internet en el cielo", "*Servidores en internet", "Un cable", "Un virus"),
], "linear-gradient(135deg,#22d3ee,#a855f7)", "linear-gradient(135deg,#22d3ee,#a855f7)");
