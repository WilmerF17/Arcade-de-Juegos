import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro } from "../ui/GameShell";
import { dirDeTecla, escribiendo } from "../suite/teclado";

const VACIA = () => Array(6).fill(null).map(() => Array(7).fill(0));

function enRango(r, c) { return r >= 0 && r < 6 && c >= 0 && c < 7; }

const direcciones = [[0, 1], [1, 0], [1, 1], [1, -1]];

function gana(tabla, p) {
  for (let r = 0; r < 6; r++) for (let c = 0; c < 7; c++) {
    if (tabla[r][c] !== p) continue;
    for (const [dr, dc] of direcciones) {
      let cont = 0;
      for (let k = 0; k < 4; k++) {
        const nr = r + dr * k, nc = c + dc * k;
        if (!enRango(nr, nc)) break;
        if (tabla[nr][nc] === p) cont++; else break;
      }
      if (cont >= 4) return true;
    }
  }
  return false;
}

function copiar(t) { return t.map(f => [...f]); }

export default function Connect4() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Connect 4");
  const [tabla, setTabla] = useState(null);
  const [turno, setTurno] = useState(1);
  const [dif, setDif] = useState(2);
  const [terminado, setTerminado] = useState(null);
  const [cursor, setCursor] = useState(3);
  const tablaRef = useRef(tabla);
  const terminadoRef = useRef(terminado);
  tablaRef.current = tabla;
  terminadoRef.current = terminado;

  const empezar = () => { setTabla(VACIA()); setTurno(1); setTerminado(null); setCursor(3); };

  function soltar(col) {
    const tab = tablaRef.current;
    if (!tab || terminadoRef.current) return;
    if (col < 0 || col > 6) return;
    const nuevo = copiar(tab);
    let fila = -1;
    for (let r = 5; r >= 0; r--) { if (nuevo[r][col] === 0) { fila = r; break; } }
    if (fila < 0) return;
    nuevo[fila][col] = 1;
    if (gana(nuevo, 1)) {
      registrarPunt(30 * (dif === 3 ? 2 : 1), 1);
      setTerminado("1");
      terminadoRef.current = "1";
      setTabla(nuevo);
      tablaRef.current = nuevo;
      return;
    }
    if (nuevo.every(f => f.every(v => v !== 0))) { setTerminado("e"); terminadoRef.current = "e"; setTabla(nuevo); tablaRef.current = nuevo; registrarPunt(10, 0); return; }
    // IA
    const colIA = mejorIA(nuevo);
    for (let r = 5; r >= 0; r--) { if (nuevo[r][colIA] === 0) { nuevo[r][colIA] = 2; break; } }
    if (gana(nuevo, 2)) { setTerminado("2"); terminadoRef.current = "2"; setTabla(nuevo); tablaRef.current = nuevo; registrarPunt(0, 0); return; }
    if (nuevo.every(f => f.every(v => v !== 0))) { setTerminado("e"); terminadoRef.current = "e"; setTabla(nuevo); tablaRef.current = nuevo; registrarPunt(10, 0); return; }
    setTabla(nuevo);
    tablaRef.current = nuevo;
    setTurno(1);
  }

  const soltarRef = useRef(soltar);
  soltarRef.current = soltar;

  function mejorIA(t) {
    const cols = [3, 2, 4, 1, 5, 0, 6];
    for (const c of cols) {
      const t2 = copiar(t);
      let puesta = false;
      for (let r = 5; r >= 0; r--) { if (t2[r][c] === 0) { t2[r][c] = 2; puesta = true; break; } }
      if (puesta && gana(t2, 2)) return c;
    }
    for (const c of cols) {
      const t2 = copiar(t);
      let puesta = false;
      for (let r = 5; r >= 0; r--) { if (t2[r][c] === 0) { t2[r][c] = 1; puesta = true; break; } }
      if (puesta && gana(t2, 1)) return c;
    }
    if (dif === 1) return cols[Math.floor(Math.random() * cols.length)];
    return cols[Math.floor(Math.random() * 3)];
  }

  useEffect(() => {
    const fn = e => {
      if (escribiendo() || !tablaRef.current) return;
      const d = dirDeTecla(e.key);
      if (d === "izq" || d === "der") {
        e.preventDefault();
        setCursor(c => Math.max(0, Math.min(6, c + (d === "izq" ? -1 : 1))));
        return;
      }
      if (e.key === "Enter" || e.key === " " || d === "aba") {
        e.preventDefault();
        setCursor(c => { soltarRef.current(c); return c; });
      } else if (e.key >= "1" && e.key <= "7") {
        const c = Number(e.key) - 1;
        setCursor(c);
        soltarRef.current(c);
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [dif]);

  const fin = terminado !== null;

  return (
    <GameShell titulo="Conecta 4" emoji="🔴"
      descripcion="Clic o teclado (←/→ o A/D + ENTER/↓, o teclas 1-7).">
      <div className="fila-botones">
        <button className="btn-exito" onClick={empezar}>Empezar partida</button>
        {[1, 2, 3].map(d => (
          <button key={d} className={dif === d ? "btn-principal" : ""} onClick={() => setDif(d)}>
            {d === 1 ? "Fácil" : d === 2 ? "Normal" : "Difícil"}
          </button>
        ))}
      </div>
      {tabla && (
        <div>
          <div className="fila-botones" style={{ marginTop: 10 }}>
            {[0, 1, 2, 3, 4, 5, 6].map(c => (
              <button key={c} className={c === cursor ? "btn-principal" : "btn-suave"}
                disabled={!!terminado}
                onClick={() => { setCursor(c); soltar(c); }} style={{ marginBottom: 4 }}>↓</button>
            ))}
          </div>
          <div className="tablero" style={{ gridTemplateColumns: "repeat(7, 52px)", marginBottom: 14 }}>
            {tabla.flatMap((fila, r) => fila.map((v, c) => (
              <div key={`${r}-${c}`} className={`celda ${!terminado ? "clickeable" : ""}`}
                style={{ width: 50, height: 50, background: v ? undefined : c === cursor && !terminado ? "rgba(99,102,241,0.18)" : "rgba(255,255,255,0.04)", outline: c === cursor && !terminado && r === 0 ? "2px solid var(--info)" : undefined }}
                onClick={() => { if (v === 0 && !terminado) { setCursor(c); soltar(c); } }}>
                {v === 0 ? "" : <span className={`ficha-c4 ${v === 1 ? "j1" : "j2"}`}>●</span>}
              </div>
            )))}
          </div>
          <p className="chip" style={{ display: "inline-block", marginBottom: 10 }}>
            {!terminado
              ? `Turno: 🔴 Tú · cursor en columna ${cursor + 1}`
              : terminado === "1" ? "🎉 ¡GANASTE!" : terminado === "2" ? "🤖 Gana la IA" : "🤝 Empate"}
          </p>
          {terminado && <div className={`mensaje-final ${terminado === "1" ? tipo : terminado === "e" ? "victoria" : "perdida"}`}>{terminado === "e" ? "🤝 Empate. Tablero lleno." : mensaje}</div>}
          {!fin && <p className="aviso-ia">💡 Teclado: <b>←/→ o A/D</b> mover · <b>ENTER/↓/ESPACIO o 1-7</b> soltar.</p>}
        </div>
      )}
    </GameShell>
  );
}
