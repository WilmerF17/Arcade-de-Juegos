import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro } from "../ui/GameShell";
import { escribiendo } from "../suite/teclado";

const PALABRAS = [
  "casa", "perro", "gato", "mesa", "papel", "agua", "luna", "rojo", "verde", "flor",
  "pato", "libro", "fruta", "plato", "silla", "tabla", "pared", "cielo",
  "campo", "brazo", "barco", "calle", "carro", "tigre", "plaza", "letra", "fuego", "salir",
  "volar", "marea", "nieve", "tren", "suave", "roble", "lunar", "nuevo", "hoja", "queso",
  "jarra", "vela", "vino", "panza", "busto", "claro", "lento", "mundo", "selva",
];

const FILAS = 6, LARGO = 5;

export default function Palabra5() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Palabra 5");
  const [intentos, setIntentos] = useState([]);
  const [secreto, setSecreto] = useState(null);
  const [entrada, setEntrada] = useState("");
  const [aviso, setAviso] = useState("");
  const [fin, setFin] = useState(null);
  const entradaRef = useRef("");
  const finRef = useRef(null);
  entradaRef.current = entrada;
  finRef.current = fin;

  function empezar() {
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
    const sec = secreto;
    if (!sec || finRef.current) return;
    setIntentos(prev => {
      if (prev.length >= FILAS) return prev;
      if (palabra.length !== LARGO || !/^[a-zñ]+$/.test(palabra)) {
        setAviso("Debe tener 5 letras (a-z).");
        return prev;
      }
      const nuevo = evaluar(palabra, sec, prev);
      setEntrada("");
      entradaRef.current = "";
      setAviso("");
      if (palabra === sec) {
        const puntos = 60 - 10 * (nuevo.length - 1);
        registrarPunt(puntos, 1);
        const f = { gano: true };
        finRef.current = f;
        setFin(f);
      } else if (nuevo.length >= FILAS) {
        const f = { gano: false };
        finRef.current = f;
        setFin(f);
        registrarPunt(0, 0);
      }
      return nuevo;
    });
  }

  const enviarRef = useRef(enviar);
  enviarRef.current = enviar;

  // Teclado físico: letras, ENTER y RETROCESO (cuando el foco no está en el input)
  useEffect(() => {
    const fn = e => {
      if (!secreto || finRef.current) return;
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
    if (entradaRef.current.length < LARGO) {
      const n = (entradaRef.current + l).slice(0, LARGO);
      entradaRef.current = n;
      setEntrada(n);
    }
  }

  function borrar() {
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

  return (
    <GameShell titulo="Palabra 5" emoji="🟩"
      descripcion="Teclado físico o en pantalla · 5 letras en 6 intentos.">
      <div className="fila-botones">
        <button className="btn-exito" onClick={empezar}>{secreto ? "Reiniciar" : "Empezar"}</button>
      </div>
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
              <button className="btn-principal" onClick={() => enviar()}>Intentar</button>
              <span className="chip">Intento <b>{intentos.length + 1}/6</b></span>
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
          {fin && <div className={`mensaje-final ${tipo}`}>
            {fin.gano ? mensaje : `Fin: no acertaste. La palabra era ${secreto.toUpperCase()}.`}
          </div>}
        </div>
      )}
    </GameShell>
  );
}
