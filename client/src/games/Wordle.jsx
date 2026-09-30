import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { escribiendo } from "../suite/teclado";
import { sfx } from "../suite/sonido";

const PALABRAS = [
  "casa", "perro", "gato", "mesa", "papel", "agua", "luna", "rojo", "verde", "flor",
  "pato", "libro", "fruta", "plato", "silla", "tabla", "pared", "cielo",
  "campo", "brazo", "barco", "calle", "carro", "tigre", "plaza", "letra", "fuego", "salir",
  "volar", "marea", "nieve", "tren", "suave", "roble", "lunar", "nuevo", "hoja", "queso",
  "jarra", "vela", "vino", "panza", "busto", "claro", "lento", "mundo", "selva",
];

const LARGO = 5;
const FILAS_DIF = { 1: 8, 2: 6, 3: 5 };
const NOMBRE_DIF = { 1: "Fácil", 2: "Normal", 3: "Difícil" };

export default function Palabra5() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Palabra 5");
  const [intentos, setIntentos] = useState([]);
  const [secreto, setSecreto] = useState(null);
  const [entrada, setEntrada] = useState("");
  const [aviso, setAviso] = useState("");
  const [fin, setFin] = useState(null);
  const [dif, setDif] = useState(2);
  const FILAS = FILAS_DIF[dif];
  const entradaRef = useRef("");
  const finRef = useRef(null);
  entradaRef.current = entrada;
  finRef.current = fin;
  const secretoRef = useRef(null);
  secretoRef.current = secreto;

  function empezar() {
    sfx.clic();
    setIntentos([]);
    setEntrada("");
    setFin(null);
    finRef.current = null;
    setSecreto(PALABRAS[Math.floor(Math.random() * PALABRAS.length)]);
    setAviso("");
  }

  function evaluar(palabra, sec, prev) {
    const restantes = sec.split("");
    const estados = Array(LARGO).fill(1);
    for (let i = 0; i < LARGO; i++) {
      if (palabra[i] === sec[i]) { estados[i] = 3; restantes.splice(restantes.indexOf(sec[i]), 1); }
    }
    for (let i = 0; i < LARGO; i++) {
      if (estados[i] === 3) continue;
      const idx = restantes.indexOf(palabra[i]);
      if (idx >= 0) { estados[i] = 2; restantes.splice(idx, 1); }
    }
    return [...prev, { letras: palabra.split(""), estados }];
  }

  function enviar(palabraParam) {
    const palabra = (palabraParam ?? entradaRef.current).toLowerCase().trim();
    const sec = secretoRef.current;
    if (!sec || finRef.current) return;
    setIntentos(prev => {
      if (prev.length >= FILAS) return prev;
      if (palabra.length !== LARGO || !/^[a-zñ]+$/.test(palabra)) {
        setAviso("Debe tener 5 letras (a-z).");
        sfx.mal();
        return prev;
      }
      const nuevo = evaluar(palabra, sec, prev);
      setEntrada("");
      entradaRef.current = "";
      setAviso("");
      if (palabra === sec) {
        const puntos = 60 - 10 * (nuevo.length - 1);
        sfx.bien();
        sfx.moneda();
        registrarPunt(puntos, 1);
        const f = { gano: true };
        finRef.current = f;
        setFin(f);
      } else if (nuevo.length >= FILAS) {
        const f = { gano: false };
        finRef.current = f;
        setFin(f);
        sfx.mal();
        registrarPunt(0, 0);
      } else {
        sfx.clic();
      }
      return nuevo;
    });
  }

  const enviarRef = useRef(enviar);
  enviarRef.current = enviar;
  const empezarRef = useRef(empezar);
  empezarRef.current = empezar;

  // Teclado físico: letras, ENTER y RETROCESO (cuando el foco no está en el input)
  useEffect(() => {
    const fn = e => {
      if (!secreto || finRef.current) {
        if (!secreto && (e.key === "Enter" || e.key === " ") && !escribiendo()) {
          e.preventDefault();
          empezarRef.current();
        }
        return;
      }
      if (escribiendo()) return; // el input ya gestiona sus teclas
      if (e.key === "Enter") { enviarRef.current(entradaRef.current); }
      else if (e.key === "Backspace") {
        setEntrada(p => { const n = p.slice(0, -1); entradaRef.current = n; return n; });
      } else if (/^[a-zA-ZñÑ]$/.test(e.key)) {
        if (entradaRef.current.length < LARGO) {
          const n = (entradaRef.current + e.key.toLowerCase()).slice(0, LARGO);
          entradaRef.current = n;
          setEntrada(n);
        }
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [secreto]);

  function tecla(l) {
    if (finRef.current) return;
    sfx.clic();
    if (entradaRef.current.length < LARGO) {
      const n = (entradaRef.current + l).slice(0, LARGO);
      entradaRef.current = n;
      setEntrada(n);
    }
  }

  function borrar() {
    sfx.clic();
    const n = entradaRef.current.slice(0, -1);
    entradaRef.current = n;
    setEntrada(n);
  }

  const usoTeclado = {};
  intentos.forEach(t => t.letras.forEach((l, i) => {
    if (!usoTeclado[l] || t.estados[i] > usoTeclado[l]) usoTeclado[l] = t.estados[i];
  }));

  // Fila actual: solo la primera fila vacía muestra lo tecleado
  const filasVacias = FILAS - intentos.length;
  const letrasActuales = entrada.split("");
  const pct = Math.round((intentos.length / FILAS) * 100);

  return (
    <GameShell titulo="Palabra 5" emoji="🟩"
      descripcion={`Teclado físico o en pantalla · 5 letras en ${FILAS} intentos.`}
      stats={[
        { icono: "📝", etiqueta: "Intento", valor: `${Math.min(intentos.length + 1, FILAS)}/${FILAS}` },
        { icono: "🟩", etiqueta: "Pistas", valor: intentos.length },
        { icono: "🎯", etiqueta: "Dificultad", valor: NOMBRE_DIF[dif] },
      ]}
      acciones={<button className="btn-exito" onClick={empezar}>{secreto ? "↻ Reiniciar" : "▶ Empezar"}</button>}
      resultado={fin ? { mensaje: fin.gano ? mensaje : `No acertaste. Era ${secreto ? secreto.toUpperCase() : ""}.`, tipo } : null}
      ayuda={<>
        <span>Adivina la palabra de <b>5 letras</b> en <b>{FILAS} intentos</b>: 🟩 letra correcta, 🟨 en otro sitio, ⬜ no está.</span>
        <span>Controles: teclado físico (<kbd>A</kbd>–<kbd>Z</kbd>, <kbd>ENTER</kbd>, <kbd>⌫</kbd>) o teclado en pantalla. <kbd>ENTER</kbd> empieza.</span>
        <span>Puntuación: acertar pronto da hasta <b>60 puntos</b> y victoria; agotar intentos da 0. Dificultad: <b>Fácil 8 intentos</b>, <b>Normal 6</b>, <b>Difícil 5</b>.</span>
        <span>Consejo: abre con una palabra con 5 letras distintas para cazar pistas rápido.</span>
      </>}>
      {!secreto && (
        <div className="fila-botones" role="group" aria-label="Dificultad">
          {[1, 2, 3].map(d => (
            <button key={d} className={dif === d ? "btn-principal" : "btn-suave"} onClick={() => { setDif(d); sfx.clic(); }}>{d === 1 ? "🟢 Fácil 8" : d === 2 ? "🟡 Normal 6" : "🔴 Difícil 5"}</button>
          ))}
        </div>
      )}
      <div className="xp-bar fina" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Intentos usados"><div style={{ width: `${pct}%` }} /></div>
      {secreto && (
        <div>
          <p className="aviso info" style={{ marginTop: 8 }}>🟩 correcta · 🟨 en otro sitio · ⬜ no está</p>
          <div className="palabra-wordle" style={{ marginTop: 12 }}>
            {intentos.map((row, r) => row.letras.map((l, c) => (
              <div key={`${r}-${c}`} className={`casilla-wordle ${row.estados[c] === 3 ? "verde" : row.estados[c] === 2 ? "amarilla" : "gris"} rellenada`}>{l}</div>
            )))}
            {Array.from({ length: filasVacias * LARGO }, (_, i) => {
              const fila = Math.floor(i / LARGO), c = i % LARGO;
              const ch = fila === 0 ? (letrasActuales[c] || "") : "";
              return <div key={"e" + i} className={`casilla-wordle ${ch ? "rellenada" : ""}`}>{ch}</div>;
            })}
          </div>
          {!fin && intentos.length < FILAS && (
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 14 }}>
              <input type="text" value={entrada} onChange={e => { const v = e.target.value.toLowerCase().replace(/[^a-zñ]/g, "").slice(0, 5); entradaRef.current = v; setEntrada(v); }}
                onKeyDown={e => e.key === "Enter" && enviar()} placeholder="palabra" style={{ width: 140, textTransform: "uppercase" }} maxLength={5} />
              <button className="btn-principal" onClick={() => enviar()}>Intentar ⏎</button>
              <span className="chip">Intento <b>{intentos.length + 1}/{FILAS}</b></span>
            </div>
          )}
          {aviso && <p className="aviso info">{aviso}</p>}
          <div className="teclado">
            {["qwertyuiop", "asdfghjklñ", "zxcvbnm"].map((fila, i) => (
              <div className="fila" key={i}>
                {fila.split("").map(l => (
                  <button key={l} className={`tecla ${usoTeclado[l] === 3 ? "verde" : usoTeclado[l] === 2 ? "amarilla" : usoTeclado[l] ? "gris" : ""}`}
                    onClick={() => tecla(l)}>{l}</button>
                ))}
                {i === 2 && <button className="tecla" onClick={borrar} title="Borrar">⌫</button>}
              </div>
            ))}
          </div>
          {fin && <Resultado mensaje={fin.gano ? mensaje : `Fin: no acertaste. La palabra era ${secreto.toUpperCase()}.`} tipo={tipo} />}
        </div>
      )}
    </GameShell>
  );
}
