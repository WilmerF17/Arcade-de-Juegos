import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro } from "../ui/GameShell";
import { dirDeTecla, escribiendo } from "../suite/teclado";

function mezclado() {
  const a = [...Array(15).keys()].map(n => n + 1).concat([0]);
  let hueco = 15;
  const t = [...a];
  for (let i = 0; i < 200; i++) {
    const r = Math.floor(hueco / 4), c = hueco % 4;
    const ops = [];
    if (r > 0) ops.push(hueco - 4);
    if (r < 3) ops.push(hueco + 4);
    if (c > 0) ops.push(hueco - 1);
    if (c < 3) ops.push(hueco + 1);
    const j = ops[Math.floor(Math.random() * ops.length)];
    [t[hueco], t[j]] = [t[j], t[hueco]];
    hueco = j;
  }
  return t;
}

export default function Puzzle15() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Puzzle 15");
  const [tab, setTab] = useState(mezclado);
  const [movs, setMovs] = useState(0);
  const [ganado, setGanado] = useState(false);
  const tabRef = useRef(tab);
  const movsRef = useRef(0);
  const ganadoRef = useRef(false);
  tabRef.current = tab;
  movsRef.current = movs;
  ganadoRef.current = ganado;

  const resuelto = tab.every((v, i) => v === (i + 1) % 16);

  function intentarMover(indiceFicha) {
    if (ganadoRef.current) return;
    const t = tabRef.current;
    const h = t.indexOf(0);
    const r1 = Math.floor(indiceFicha / 4), c1 = indiceFicha % 4;
    const r2 = Math.floor(h / 4), c2 = h % 4;
    if (Math.abs(r1 - r2) + Math.abs(c1 - c2) !== 1) return;
    aplicar(t, indiceFicha, h);
  }

  function moverPorTecla(dir) {
    if (ganadoRef.current) return;
    const t = tabRef.current;
    const h = t.indexOf(0);
    const r = Math.floor(h / 4), c = h % 4;
    let ficha = -1;
    // Flecha indica hacia dónde se mueve la ficha (el hueco va al contrario)
    if (dir === "arr") { if (r < 3) ficha = h + 4; }
    else if (dir === "aba") { if (r > 0) ficha = h - 4; }
    else if (dir === "izq") { if (c < 3) ficha = h + 1; }
    else if (dir === "der") { if (c > 0) ficha = h - 1; }
    if (ficha >= 0) aplicar(t, ficha, h);
  }

  function aplicar(t, ficha, h) {
    const nt = [...t];
    [nt[ficha], nt[h]] = [nt[h], nt[ficha]];
    const m = movsRef.current + 1;
    movsRef.current = m;
    tabRef.current = nt;
    setTab(nt);
    setMovs(m);
    if (nt.every((v, k) => v === (k + 1) % 16)) {
      ganadoRef.current = true;
      setGanado(true);
      registrarPunt(Math.max(200 - m, 20), 1);
    }
  }

  const moverRef = useRef(moverPorTecla);
  moverRef.current = moverPorTecla;

  useEffect(() => {
    const fn = e => {
      if (escribiendo()) return;
      const d = dirDeTecla(e.key);
      if (d) { e.preventDefault(); moverRef.current(d); }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function mezclar() {
    const t = mezclado();
    tabRef.current = t; movsRef.current = 0; ganadoRef.current = false;
    setTab(t); setMovs(0); setGanado(false);
  }

  return (
    <GameShell titulo="Puzzle 15" emoji="🧩"
      descripcion="Clic o flechas/WASD para deslizar fichas · ordena del 1 al 15."
      tira="linear-gradient(90deg,#14b8a6,#6366f1,#22d3ee)" iconoFondo="linear-gradient(135deg,#14b8a6,#6366f1)">
      <div className="fila-botones" style={{ marginTop: 0 }}>
        <button className="btn-exito" onClick={mezclar}>🔀 Mezclar</button>
        <span className="chip">Movimientos: <b>{movs}</b></span>
        <span className="chip">Progreso: <b>{tab.filter((v, i) => v === (i + 1) % 16).length}/16</b></span>
      </div>
      <div className="puzzle-tab" style={{ gridTemplateColumns: "repeat(4,64px)", marginTop: 14 }}>
        {tab.map((v, i) => (
          v === 0
            ? <div key={i} className="ficha-puzzle hueco" />
            : <div key={i} onClick={() => intentarMover(i)}
                className={`ficha-puzzle ${v === (i + 1) % 16 ? "ok" : ""}`}>{v}</div>
        ))}
      </div>
      <div className="fila-botones">
        {[["arr", "↑"], ["izq", "←"], ["aba", "↓"], ["der", "→"]].map(([d, f]) => (
          <button key={d} className="btn-suave" onClick={() => moverPorTecla(d)}>{f}</button>
        ))}
      </div>
      {ganado && <div className={`mensaje-final record`}>🎉 ¡Puzzle resuelto en {movs} movimientos! {mensaje}</div>}
      {!ganado && resuelto && movs === 0 && <p className="aviso info">Clica Mezclar para empezar.</p>}
      <p className="aviso-ia">💡 Teclado: <b>flechas o WASD</b> · las fichas con borde verde ya están en su sitio.</p>
    </GameShell>
  );
}
