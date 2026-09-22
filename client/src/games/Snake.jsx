import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro } from "../ui/GameShell";
import { dirDeTecla, escribiendo, OPUESTA } from "../suite/teclado";

const FILAS = 20, COLS = 20;
const PASO_BASE = 160, PASO_MIN = 85, PASO_POR_NIVEL = 12;
const CLAVE_MEJOR = "arcade-snake-mejor";

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

function leerMejor() {
  try { return Number(localStorage.getItem(CLAVE_MEJOR) || 0) || 0; } catch { return 0; }
}

export default function Snake() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Serpiente");
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [huevo, setHuevo] = useState(() => nuevoHuevo([{ x: 10, y: 10 }]));
  const [corriendo, setCorriendo] = useState(false);
  const [puntos, setPuntos] = useState(0);
  const [pausa, setPausa] = useState(false);
  const [mejor, setMejor] = useState(leerMejor);
  const dirRef = useRef("der");
  const puntosRef = useRef(0);
  const colaRef = useRef(3);
  const huevoRef = useRef(huevo);
  const corriendoRef = useRef(false);
  const pausaRef = useRef(false);
  const finalRef = useRef(false);
  const tactilRef = useRef(null);
  huevoRef.current = huevo;

  const nivel = Math.floor(puntos / 50) + 1;
  const paso = Math.max(PASO_MIN, PASO_BASE - (nivel - 1) * PASO_POR_NIVEL);

  function girar(d) {
    if (d !== OPUESTA[dirRef.current]) dirRef.current = d;
    if (!corriendoRef.current && !finalRef.current) iniciar();
  }

  function preparar() {
    const s = [{ x: 10, y: 10 }];
    setSnake(s);
    setHuevo(nuevoHuevo(s));
    puntosRef.current = 0;
    colaRef.current = 3;
    setPuntos(0);
    dirRef.current = "der";
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

  function alternarPausa() {
    if (corriendoRef.current) {
      pausaRef.current = !pausaRef.current;
      setPausa(pausaRef.current);
    } else if (!finalRef.current) iniciar();
  }

  function finalizar(s, gano, pts) {
    if (finalRef.current) return;
    finalRef.current = true;
    corriendoRef.current = false;
    setCorriendo(false);
    if (pts > leerMejor()) {
      try { localStorage.setItem(CLAVE_MEJOR, String(pts)); } catch { /* noop */ }
      setMejor(pts);
    }
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
        girar(d);
        return;
      }
      if (e.key === " " || e.key === "p" || e.key === "P") {
        e.preventDefault();
        alternarPausa();
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
    }, paso);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [corriendo, nivel]);

  // Swipe táctil sobre el tablero
  function toqueInicio(e) {
    tactilRef.current = e.touches[0];
  }
  function toqueFin(e) {
    const ini = tactilRef.current;
    tactilRef.current = null;
    if (!ini) return;
    const fin = e.changedTouches[0];
    const dx = fin.clientX - ini.clientX, dy = fin.clientY - ini.clientY;
    if (Math.abs(dx) < 18 && Math.abs(dy) < 18) return;
    girar(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "der" : "izq") : (dy > 0 ? "aba" : "arr"));
  }

  const mapa = {};
  snake.forEach((s, i) => { mapa[`${s.x},${s.y}`] = i === 0 ? "cabeza" : "cuerpo"; });
  const hueco = `${huevo.x},${huevo.y}`;
  const terminado = finalRef.current && !corriendo;

  return (
    <GameShell titulo="Serpiente (Snake)" emoji="🐍"
      descripcion="Flechas/WASD o desliza para girar · ESPACIO/P pausa · cada 50 puntos sube la velocidad."
      stats={[
        { etiqueta: "Puntos", valor: puntos },
        { etiqueta: "Longitud", valor: snake.length },
        { icono: "⚡", etiqueta: "Nivel", valor: nivel },
        { icono: "🏆", etiqueta: "Mi mejor", valor: Math.max(mejor, puntos) },
      ]}
      acciones={<>
        <button className="btn-exito" onClick={preparar}>↻ Reiniciar</button>
        {!corriendo && !finalRef.current && <button className="btn-principal" onClick={iniciar}>▶ Jugar</button>}
        {corriendo && <button className="btn-suave" onClick={alternarPausa}>{pausa ? "▶ Seguir" : "⏸ Pausa"}</button>}
      </>}
      ayuda={<>
        <span>Come los huevos dorados <b>(+10)</b> sin chocar con los bordes ni contigo.</span>
        <span>Cada <b>50 puntos</b> la serpiente acelera un nivel. Ganas al llegar a <b>200</b>.</span>
        <span>En móvil también puedes <b>deslizar el dedo</b> sobre el tablero para girar.</span>
      </>}>
      <div className="tablero sn-tablero" style={{ gridTemplateColumns: `repeat(${COLS}, 16px)` }}
        onTouchStart={toqueInicio} onTouchEnd={toqueFin}>
        {Array.from({ length: FILAS * COLS }, (_, i) => {
          const x = i % COLS, y = Math.floor(i / COLS);
          const k = `${x},${y}`;
          const t = mapa[k];
          return <div key={i} className={`sn-celda ${t === "cabeza" ? "sn-cabeza" : t === "cuerpo" ? "sn-cuerpo" : k === hueco ? "sn-huevo" : "sn-vacia"}`} />;
        })}
      </div>
      {/* Botones táctiles */}
      <div className="sn-touch" role="group" aria-label="Controles táctiles">
        <span />
        <button className="btn-suave" onClick={() => girar("arr")} aria-label="Arriba">↑</button>
        <span />
        <button className="btn-suave" onClick={() => girar("izq")} aria-label="Izquierda">←</button>
        <button className="btn-suave" onClick={() => girar("aba")} aria-label="Abajo">↓</button>
        <button className="btn-suave" onClick={() => girar("der")} aria-label="Derecha">→</button>
      </div>
      {!corriendo && (
        <div className={`mensaje-final ${tipo}`}>
          {terminado ? mensaje : pausa ? "⏸ En pausa." : "Pulsa Jugar o una flecha / WASD para moverte."}
        </div>
      )}
    </GameShell>
  );
}
