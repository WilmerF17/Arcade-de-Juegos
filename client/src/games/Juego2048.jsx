import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro } from "../ui/GameShell";
import { dirDeTecla, escribiendo } from "../suite/teclado";

function filaVacia() { return [0, 0, 0, 0]; }

// Devuelve {fila, puntos} fusionando hacia la izquierda
function reconbinarFila(fila) {
  const sinCeros = fila.filter(v => v !== 0);
  const combinada = [];
  let pts = 0;
  for (let i = 0; i < sinCeros.length; i++) {
    if (sinCeros[i] === sinCeros[i + 1]) {
      const v = sinCeros[i] * 2;
      combinada.push(v);
      pts += v;
      i++;
    } else combinada.push(sinCeros[i]);
  }
  while (combinada.length < 4) combinada.push(0);
  return { fila: combinada, puntos: pts };
}

function moverGrid(prev, dir) {
  let grid = prev.map(f => [...f]);
  let pts = 0;
  const haciaFin = dir === "der" || dir === "aba";
  const transponer = m => m[0].map((_, i) => m.map(f => f[i]));
  let filas = (dir === "izq" || dir === "der") ? grid : transponer(grid);
  filas = filas.map(f => [...f]);
  for (let r = 0; r < 4; r++) {
    let fila = [...filas[r]];
    if (haciaFin) fila = [...fila].reverse();
    const { fila: nueva, puntos } = reconbinarFila(fila);
    pts += puntos;
    let colocada = [...nueva];
    if (haciaFin) colocada = colocada.reverse();
    filas[r] = colocada;
  }
  grid = (dir === "izq" || dir === "der") ? filas : transponer(filas);
  return { grid, pts, movio: grid.flat().join() !== prev.flat().join() };
}

function sinMovimientos(g) {
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
    if (g[r][c] === 0) return false;
    if (c < 3 && g[r][c] === g[r][c + 1]) return false;
    if (r < 3 && g[r][c] === g[r + 1][c]) return false;
  }
  return true;
}

export default function Juego2048() {
  const { mensaje, tipo, registrarPunt } = useRegistro("2048");
  const [tabla, setTabla] = useState(filaVacia().map(() => filaVacia()));
  const [puntos, setPuntos] = useState(0);
  const [sobre, setSobre] = useState(false);
  const [gano, setGano] = useState(false);
  const tablaRef = useRef(tabla);
  const puntosRef = useRef(0);
  const finRef = useRef(false);
  tablaRef.current = tabla;
  puntosRef.current = puntos;

  function nuevaFicha(t) {
    const copia = t.map(f => [...f]);
    const vacios = [];
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) if (copia[r][c] === 0) vacios.push([r, c]);
    if (!vacios.length) return copia;
    const [r, c] = vacios[Math.floor(Math.random() * vacios.length)];
    copia[r][c] = Math.random() < 0.9 ? 2 : 4;
    return copia;
  }

  function mover(dir) {
    if (finRef.current) return;
    const prev = tablaRef.current;
    const { grid, pts, movio } = moverGrid(prev, dir);
    if (!movio) return;
    const conFicha = nuevaFicha(grid);
    const np = puntosRef.current + pts;
    puntosRef.current = np;
    setPuntos(np);
    tablaRef.current = conFicha;
    setTabla(conFicha);
    const hayMeta = conFicha.some(f => f.some(v => v >= 2048));
    if (hayMeta && !gano) {
      setGano(true); finRef.current = true;
      registrarPunt(500 + np, 1);
    } else if (!hayMeta && sinMovimientos(conFicha)) {
      setSobre(true); finRef.current = true;
      registrarPunt(np, 0);
    }
  }

  const moverRef = useRef(mover);
  moverRef.current = mover;

  function empezar() {
    let g = filaVacia().map(() => filaVacia());
    // nuevaFicha pura dos veces
    const vacios1 = [];
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) vacios1.push([r, c]);
    const [r1, c1] = vacios1.splice(Math.floor(Math.random() * vacios1.length), 1)[0];
    g[r1][c1] = Math.random() < 0.9 ? 2 : 4;
    const [r2, c2] = vacios1[Math.floor(Math.random() * vacios1.length)];
    g[r2][c2] = Math.random() < 0.9 ? 2 : 4;
    tablaRef.current = g;
    puntosRef.current = 0;
    finRef.current = false;
    setTabla(g); setPuntos(0); setSobre(false); setGano(false);
  }

  // Auto-empezar con tablero vacío
  useEffect(() => {
    if (tablaRef.current.flat().every(v => v === 0)) empezar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fn = e => {
      if (escribiendo()) return;
      const d = dirDeTecla(e.key);
      if (d) { e.preventDefault(); moverRef.current(d); return; }
      if (e.key === "r" || e.key === "R") empezar();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gano, sobre]);

  return (
    <GameShell titulo="2048" emoji="🃃"
      descripcion="Flechas o WASD para fusionar · R reinicia · llega a 2048.">
      <div className="fila-botones" style={{ marginTop: 0 }}>
        <button className="btn-exito" onClick={empezar}>{tabla[0][0] === 0 && !puntos ? "Empezar" : "Nueva partida"}</button>
        <span className="chip">Puntos: <b>{puntos}</b></span>
        <span className="chip">Meta: <b>2048</b></span>
      </div>
      <div className="tablero" style={{ gridTemplateColumns: "repeat(4, 74px)", marginTop: 16 }}>
        {tabla.flatMap((fila, r) => fila.map((v, c) => (
          <div key={`${r}-${c}`} className={`ficha-2048 v-${v}`}>{v > 0 ? v : ""}</div>
        )))}
      </div>
      <div className="fila-botones">
        {[["arr", "↑"], ["izq", "←"], ["aba", "↓"], ["der", "→"]].map(([d, f]) => (
          <button key={d} className="btn-principal" onClick={() => mover(d)}>{f}</button>
        ))}
      </div>
      {sobre && <div className={`mensaje-final ${tipo}`}>¡Fin de partida! {mensaje}</div>}
      {gano && <div className="mensaje-final record">🎉 ¡CREASTE 2048! {mensaje}</div>}
    </GameShell>
  );
}
