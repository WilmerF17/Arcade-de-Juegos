import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro } from "../ui/GameShell";
import { sfx } from "../suite/sonido";
import { escribiendo } from "../suite/teclado";

const N = 5;

/* Laberinto Ciego: memoriza el camino dorado y crúzalo a ciegas. 3 niveles. */
export default function LabCiego() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Laberinto Ciego");
  const [camino, setCamino] = useState([]);
  const [pos, setPos] = useState([0, 0]);
  const [fase, setFase] = useState("inicio"); // inicio | mira | cruza | fin
  const [nivel, setNivel] = useState(1);
  const [vidas, setVidas] = useState(3);
  const [puntos, setPuntos] = useState(0);
  const st = useRef({ camino: [], pos: [0, 0], nivel: 1, vidas: 3, puntos: 0 });
  const timer = useRef(null);

  function generar(nivelActual) {
    const pasos = 6 + nivelActual * 2;
    let x = 0, y = 0;
    const c = [[0, 0]];
    const set = new Set(["0,0"]);
    while (c.length <= pasos) {
      const dirs = [[1, 0], [0, 1], [-1, 0], [0, -1]].sort(() => Math.random() - 0.5);
      let movido = false;
      for (const [dx, dy] of dirs) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= N || ny >= N || set.has(`${nx},${ny}`)) continue;
        x = nx; y = ny;
        set.add(`${x},${y}`);
        c.push([x, y]);
        movido = true;
        break;
      }
      if (!movido) break;
    }
    return c;
  }

  function empezarNivel(nv) {
    const c = generar(nv);
    st.current.camino = c;
    st.current.pos = [0, 0];
    setCamino(c); setPos([0, 0]); setFase("mira");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setFase("cruza"), 4000);
  }

  function empezar() {
    st.current = { camino: [], pos: [0, 0], nivel: 1, vidas: 3, puntos: 0 };
    setNivel(1); setVidas(3); setPuntos(0);
    empezarNivel(1);
    sfx.clic();
  }

  useEffect(() => () => clearTimeout(timer.current), []);

  function mover(dx, dy) {
    if (fase !== "cruza") return;
    const [x, y] = st.current.pos;
    const nx = x + dx, ny = y + dy;
    if (nx < 0 || ny < 0 || nx >= N || ny >= N) return;
    const enCamino = st.current.camino.some(([cx, cy]) => cx === nx && cy === ny);
    if (!enCamino) {
      const nv = st.current.vidas - 1;
      st.current.vidas = nv;
      setVidas(nv);
      sfx.mal();
      if (nv <= 0) {
        setFase("fin");
        registrarPunt(st.current.puntos, 0);
      }
      return;
    }
    st.current.pos = [nx, ny];
    setPos([nx, ny]);
    sfx.clic();
    const meta = st.current.camino[st.current.camino.length - 1];
    if (nx === meta[0] && ny === meta[1]) {
      const gana = 100 * st.current.nivel;
      st.current.puntos += gana;
      setPuntos(st.current.puntos);
      sfx.bien();
      if (st.current.nivel >= 3) {
        setFase("fin");
        registrarPunt(st.current.puntos, 1);
      } else {
        const nn = st.current.nivel + 1;
        st.current.nivel = nn;
        setNivel(nn);
        empezarNivel(nn);
      }
    }
  }

  const moverRef = useRef(mover);
  moverRef.current = mover;
  useEffect(() => {
    const fn = e => {
      if (escribiendo()) return;
      const k = e.key.toLowerCase();
      if (e.key === "ArrowUp" || k === "w") { e.preventDefault(); moverRef.current(0, -1); }
      if (e.key === "ArrowDown" || k === "s") { e.preventDefault(); moverRef.current(0, 1); }
      if (e.key === "ArrowLeft" || k === "a") { e.preventDefault(); moverRef.current(-1, 0); }
      if (e.key === "ArrowRight" || k === "d") { e.preventDefault(); moverRef.current(1, 0); }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  const enCamino = (x, y) => camino.some(([cx, cy]) => cx === x && cy === y);
  const esMeta = (x, y) => camino.length > 0 && camino[camino.length - 1][0] === x && camino[camino.length - 1][1] === y;

  return (
    <GameShell titulo="Laberinto Ciego" emoji="🙈"
      descripcion="Memoriza el camino dorado (4s) y crúzalo a ciegas · 3 niveles · 3 vidas."
      tira="linear-gradient(90deg,#57534e,#ff9a3d)" iconoFondo="linear-gradient(135deg,#57534e,#ff9a3d)">
      <div className="fila-botones" style={{ marginTop: 0 }}>
        <span className="chip">Nivel: <b>{nivel}/3</b></span>
        <span className="chip">❤️ <b>{vidas}</b></span>
        <span className="chip">Puntos: <b>{puntos}</b></span>
      </div>
      {fase === "inicio" && (
        <div className="fila-botones"><button className="btn-principal" onClick={empezar}>▶ Empezar</button></div>
      )}
      {fase !== "inicio" && (
        <>
          <p style={{ textAlign: "center", color: "var(--texto-suave)" }}>
            {fase === "mira" ? "👀 Memoriza el camino dorado…" : "🙈 A ciegas: flechas/WASD o botones"}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${N},56px)`, gap: 6, justifyContent: "center" }}>
            {Array.from({ length: N }, (_, y) =>
              Array.from({ length: N }, (_, x) => {
                const soy = pos[0] === x && pos[1] === y;
                const mostrar = fase === "mira" && enCamino(x, y);
                return (
                  <div key={`${x}-${y}`} style={{
                    width: 56, height: 56, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "1.4rem", border: "2px solid var(--border)",
                    background: soy ? "#22d3ee" : mostrar ? (esMeta(x, y) ? "#22c55e" : "rgba(255,154,61,.55)") : "var(--bg-soft)",
                  }}>
                    {soy ? "🧍" : mostrar && esMeta(x, y) ? "🏁" : mostrar ? "·" : ""}
                  </div>
                );
              })
            )}
          </div>
          {fase === "cruza" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,52px)", gap: 6, justifyContent: "center", marginTop: 10 }}>
              <span />
              <button className="btn-suave" onClick={() => mover(0, -1)}>↑</button>
              <span />
              <button className="btn-suave" onClick={() => mover(-1, 0)}>←</button>
              <button className="btn-suave" onClick={() => mover(0, 1)}>↓</button>
              <button className="btn-suave" onClick={() => mover(1, 0)}>→</button>
            </div>
          )}
        </>
      )}
      {mensaje && <div className={`mensaje-final ${tipo}`}>{mensaje}</div>}
      {fase === "fin" && !mensaje && (
        <div className="fila-botones"><button className="btn-principal" onClick={empezar}>↻ Jugar otra vez</button></div>
      )}
    </GameShell>
  );
}
