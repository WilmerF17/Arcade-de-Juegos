import { useEffect, useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { sfx } from "../suite/sonido";

/* Motor de quizzes extra: +100 por acierto con bonus de racha. */
const DIFS = { "Fácil": { n: 4 }, "Normal": { n: 6 }, "Difícil": { n: 8 } };
function QuizBase({ titulo, emoji, preguntas, tira, iconoFondo }) {
  const { mensaje, tipo, registrarPunt } = useRegistro(titulo);
  const [dif, setDif] = useState("Normal");
  const total = Math.min(DIFS[dif].n, preguntas.length);
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
    setOrden(mezclar(preguntas).slice(0, total));
    setIdx(0); setPuntos(0); setRacha(0); setJugando(true);
    sfx.clic();
  }

  function responder(i) {
    if (!jugando) return;
    const q = orden[idx];
    if (!q) return;
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
      const k = String(e.key).toLowerCase();
      let i = -1;
      if (["1", "2", "3", "4"].includes(e.key)) i = parseInt(e.key, 10) - 1;
      else if (["a", "b", "c", "d"].includes(k)) i = "abcd".indexOf(k);
      if (i >= 0 && orden[idx] && i < orden[idx].o.length) responder(i);
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }); // eslint-disable-line react-hooks/exhaustive-deps

  const q = orden[idx];
  const pct = orden.length ? Math.round((idx / orden.length) * 100) : 0;
  return (
    <GameShell titulo={titulo} emoji={emoji}
      descripcion={`${total} preguntas del tema · +100 por acierto · las rachas dan bonus.`}
      tira={tira} iconoFondo={iconoFondo}
      stats={[
        { icono: "❓", etiqueta: "Pregunta", valor: jugando ? `${idx + 1}/${orden.length || total}` : "—" },
        { icono: "⭐", etiqueta: "Puntos", valor: puntos },
        { icono: "🔥", etiqueta: "Racha", valor: racha },
        { icono: "🎚️", etiqueta: "Dificultad", valor: dif },
      ]}
      resultado={{ mensaje, tipo }}
      ayuda={(
        <div>
          <p><b>Reglas:</b> responde las {total} preguntas del tema. Cada acierto suma 100 puntos más bonus de racha.</p>
          <p><b>Controles:</b> ratón o táctil tocando la respuesta · teclado <kbd>1</kbd>–<kbd>4</kbd> o <kbd>A</kbd>–<kbd>D</kbd> para responder, <kbd>Enter</kbd>/<kbd>Espacio</kbd> para empezar o reintentar.</p>
          <p><b>Puntuación:</b> +100 por acierto y hasta +50 extra por racha. Victoria con 400+ puntos.</p>
          <p><b>Consejo:</b> no falles a propósito la primera: una racha larga desde el inicio vale hasta 50 extra por pregunta.</p>
        </div>
      )}
      acciones={(
        <>
          {["Fácil", "Normal", "Difícil"].map(d => (
            <button key={d} className={dif === d ? "btn-principal" : "btn-suave"} disabled={jugando} onClick={() => { setDif(d); sfx.clic(); }}>{d}</button>
          ))}
          {!jugando && <button className="btn-principal" onClick={empezar}>{idx > 0 ? "↻ Otra vez" : "▶ Empezar quiz"}</button>}
        </>
      )}>
      <div className="xp-bar fina" aria-hidden><div style={{ width: `${pct}%` }} /></div>
      <div style={{ display: "flex", gap: 6, justifyContent: "center", margin: "8px 0" }} aria-hidden>
        {(orden.length ? orden : Array.from({ length: total })).map((_, i) => (
          <span key={i} className={`tp-dot${i < idx ? " bien" : i === idx && jugando ? " actual" : ""}`} />
        ))}
      </div>
      {jugando && q && (
        <>
          <p style={{ fontSize: "1.15rem", textAlign: "center" }}><b>{q.p}</b></p>
          <div style={{ display: "grid", gap: 8 }}>
            {q.o.map((op, i) => (
              <button key={i} className="trivia-op" style={{ padding: "12px" }} onClick={() => responder(i)}><span className="op-letra"><kbd>{i + 1}</kbd></span> {op}</button>
            ))}
          </div>
        </>
      )}
      <Resultado mensaje="" tipo="" />
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
