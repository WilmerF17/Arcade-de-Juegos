import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro } from "../ui/GameShell";
import { dirDeTecla, escribiendo, OPUESTA } from "../suite/teclado";

const FILAS = 20, COLS = 20, PASO = 160;

function nuevoHuevo(snake = []) {
  for (let i = 0; i < 200; i++) {
    const p = {
      x: 2 + Math.floor(Math.random() * (COLS - 4)),
      y: 2 + Math.floor(Math.random() * (FILAS - 4)),
    };
    if (!snake.some(s => s.x === p.x && s.y === p.y)) return p;
  }
  return { x: 1, y: 1 };
}

export default function Snake() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Serpiente");
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [huevo, setHuevo] = useState(() => nuevoHuevo([{ x: 10, y: 10 }]));
  const [dir, setDir] = useState("der");
  const [corriendo, setCorriendo] = useState(false);
  const [puntos, setPuntos] = useState(0);
  const [pausa, setPausa] = useState(false);
  const dirRef = useRef("der");
  const puntosRef = useRef(0);
  const colaRef = useRef(3);
  const huevoRef = useRef(huevo);
  const corriendoRef = useRef(false);
  const pausaRef = useRef(false);
  const finalRef = useRef(false);
  huevoRef.current = huevo;

  function preparar() {
    const s = [{ x: 10, y: 10 }];
    setSnake(s);
    setHuevo(nuevoHuevo(s));
    puntosRef.current = 0;
    colaRef.current = 3;
    setPuntos(0);
    setDir("der"); dirRef.current = "der";
    setCorriendo(false); corriendoRef.current = false;
    setPausa(false); pausaRef.current = false;
    finalRef.current = false;
  }

  function iniciar() {
    if (finalRef.current) preparar();
    finalRef.current = false;
    setPausa(false); pausaRef.current = false;
    setCorriendo(true); corriendoRef.current = true;
  }

  function finalizar(s, gano, pts) {
    if (finalRef.current) return;
    finalRef.current = true;
    corriendoRef.current = false;
    setCorriendo(false);
    registrarPunt(pts, gano ? 1 : 0);
    setSnake(s);
  }

  // Teclado: flechas + WASD para girar, ESPACIO/P para pausa, ENTER para empezar
  useEffect(() => {
    const al = e => {
      if (escribiendo()) return;
      const d = dirDeTecla(e.key);
      if (d) {
        e.preventDefault();
        // no permitir giro de 180°
        if (d !== OPUESTA[dirRef.current]) {
          dirRef.current = d;
          setDir(d);
        }
        if (!corriendoRef.current && !finalRef.current) iniciar();
        return;
      }
      if (e.key === " " || e.key === "p" || e.key === "P") {
        e.preventDefault();
        if (corriendoRef.current) {
          pausaRef.current = !pausaRef.current;
          setPausa(pausaRef.current);
        } else if (!finalRef.current) iniciar();
      } else if (e.key === "Enter") {
        if (!corriendoRef.current && !finalRef.current) iniciar();
      }
    };
    window.addEventListener("keydown", al);
    return () => window.removeEventListener("keydown", al);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!corriendo) return;
    const id = setInterval(() => {
      if (finalRef.current || !corriendoRef.current || pausaRef.current) return;
      setSnake(prevSnake => {
        if (finalRef.current) return prevSnake;
        const cabeza = prevSnake[0];
        const d = dirRef.current;
        const nueva = {
          x: cabeza.x + (d === "der" ? 1 : d === "izq" ? -1 : 0),
          y: cabeza.y + (d === "aba" ? 1 : d === "arr" ? -1 : 0),
        };
        if (nueva.x < 0 || nueva.x >= COLS || nueva.y < 0 || nueva.y >= FILAS) {
          finalizar(prevSnake, false, puntosRef.current);
          return prevSnake;
        }
        const cuerpo = [...prevSnake];
        if (cuerpo.some(s => s.x === nueva.x && s.y === nueva.y)) {
          finalizar(prevSnake, false, puntosRef.current);
          return prevSnake;
        }
        const h = huevoRef.current;
        const comio = nueva.x === h.x && nueva.y === h.y;
        const nuevoSnake = [nueva, ...cuerpo];
        if (comio) {
          const np = puntosRef.current + 10;
          puntosRef.current = np;
          setPuntos(np);
          colaRef.current += 1;
          setHuevo(nuevoHuevo(nuevoSnake));
          if (np >= 200) { finalizar(nuevoSnake, true, np); return nuevoSnake; }
        } else if (nuevoSnake.length > colaRef.current) {
          nuevoSnake.pop();
        }
        return nuevoSnake;
      });
    }, PASO);
    return () => clearInterval(id);
  }, [corriendo]);

  const mapa = {};
  snake.forEach((s, i) => { mapa[`${s.x},${s.y}`] = i === 0 ? "cabeza" : "cuerpo"; });
  const hueco = `${huevo.x},${huevo.y}`;

  return (
    <GameShell titulo="Serpiente (Snake)" emoji="🐍"
      descripcion="Flechas o WASD para girar · ESPACIO/P pausa · come huevos sin chocar.">
      <div className="fila-botones" style={{ marginTop: 0 }}>
        <button className="btn-exito" onClick={preparar}>Reiniciar</button>
        {!corriendo && !finalRef.current && <button className="btn-principal" onClick={iniciar}>Jugar</button>}
        {corriendo && <button onClick={() => { pausaRef.current = !pausaRef.current; setPausa(pausaRef.current); }}>{pausa ? "▶ Seguir" : "⏸ Pausa"}</button>}
        <span className="chip">Puntos: <b>{puntos}</b></span>
        <span className="chip">Longitud: <b>{snake.length}</b></span>
      </div>
      <div className="tablero" style={{ gridTemplateColumns: `repeat(${COLS}, 16px)`, margin: "14px auto 0", width: "max-content" }}>
        {Array.from({ length: FILAS * COLS }, (_, i) => {
          const x = i % COLS, y = Math.floor(i / COLS);
          const k = `${x},${y}`;
          const t = mapa[k];
          return (
            <div key={i} style={{
              width: 16, height: 16, borderRadius: 3,
              background: t === "cabeza" ? "var(--exito)" : t === "cuerpo" ? "rgba(34,197,94,0.55)" : k === hueco ? "var(--aviso)" : "rgba(255,255,255,0.03)",
            }} />
          );
        })}
      </div>
      {/* Botones táctiles */}
      <div className="fila-botones" style={{ marginTop: 10 }}>
        {[["arr", "↑"], ["izq", "←"], ["aba", "↓"], ["der", "→"]].map(([d, f]) => (
          <button key={d} className="btn-suave" onClick={() => {
            if (d !== OPUESTA[dirRef.current]) { dirRef.current = d; setDir(d); }
            if (!corriendoRef.current && !finalRef.current) iniciar();
          }}>{f}</button>
        ))}
      </div>
      {!corriendo && (
        <div className={`mensaje-final ${tipo}`}>{finalRef.current ? mensaje : pausa ? "⏸ En pausa." : "Pulsa Jugar o una flecha / WASD para moverte."}</div>
      )}
    </GameShell>
  );
}
