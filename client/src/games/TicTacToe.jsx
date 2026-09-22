import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro } from "../ui/GameShell";
import { dirDeTecla, escribiendo } from "../suite/teclado";

const lineas = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];

const gana = (b, p) => lineas.some(l => l.every(i => b[i] === p));

function minimax(b, turno, prof) {
  if (gana(b, "O")) return 10 - prof;
  if (gana(b, "X")) return prof - 10;
  if (!b.includes(" ")) return 0;
  const vacios = b.map((v, i) => v === " " ? i : null).filter(v => v != null);
  if (turno === "O") {
    let mejor = -99;
    for (const i of vacios) { b[i] = "O"; mejor = Math.max(mejor, minimax(b, "X", prof + 1)); b[i] = " "; }
    return mejor;
  } else {
    let mejor = 99;
    for (const i of vacios) { b[i] = "X"; mejor = Math.min(mejor, minimax(b, "O", prof + 1)); b[i] = " "; }
    return mejor;
  }
}

export default function TicTacToe() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Tic-Tac-Toe");
  const [tablero, setTablero] = useState([]);
  const [turno, setTurno] = useState("X");
  const [vsIa, setVsIa] = useState(true);
  const [dif, setDif] = useState(3);
  const [terminado, setTerminado] = useState(null);
  const [cursor, setCursor] = useState(4);
  const tableroRef = useRef(tablero);
  const terminadoRef = useRef(terminado);
  tableroRef.current = tablero;
  terminadoRef.current = terminado;

  const empezar = () => {
    const t = Array(9).fill(" ");
    setTablero(t);
    tableroRef.current = t;
    setTurno("X");
    setTerminado(null);
    terminadoRef.current = null;
    setCursor(4);
  };

  useEffect(() => { empezar(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  function turnoIA(t) {
    if (dif === 1) {
      const vacios = t.map((v, i) => v === " " ? i : null).filter(v => v != null);
      return vacios[Math.floor(Math.random() * vacios.length)];
    }
    if (dif === 2) {
      for (let i = 0; i < 9; i++) {
        if (t[i] === " ") { t[i] = "O"; if (gana(t, "O")) { t[i] = " "; return i; } t[i] = " "; }
      }
      for (let i = 0; i < 9; i++) {
        if (t[i] === " ") { t[i] = "X"; if (gana(t, "X")) { t[i] = " "; return i; } t[i] = " "; }
      }
      if (t[4] === " ") return 4;
      const esquinas = [0, 2, 6, 8].filter(i => t[i] === " ");
      if (esquinas.length) return esquinas[0];
      return t.indexOf(" ");
    }
    let mejor = -99, elegidos = [];
    const b = [...t];
    for (let i = 0; i < 9; i++) {
      if (b[i] === " ") { b[i] = "O"; const v = minimax(b, "X", 1); b[i] = " ";
        if (v > mejor) { mejor = v; elegidos = [i]; } else if (v === mejor) elegidos.push(i); }
    }
    return elegidos[Math.floor(Math.random() * elegidos.length)];
  }

  function jugar(pos) {
    const tab = tableroRef.current;
    if (terminadoRef.current || !tab.length || tab[pos] !== " ") return;
    let nuevo = [...tab];
    const marca = vsIa ? "X" : turno;
    nuevo[pos] = marca;
    if (gana(nuevo, marca)) {
      const ganado = vsIa && marca === "X";
      registrarPunt(30, ganado ? 1 : 0);
      setTerminado({ ganador: marca, ganado });
      terminadoRef.current = { ganador: marca };
      setTablero(nuevo);
      tableroRef.current = nuevo;
      return;
    }
    if (!nuevo.includes(" ")) {
      registrarPunt(10, 0);
      setTerminado({ ganador: null, ganado: false });
      terminadoRef.current = { ganador: null };
      setTablero(nuevo);
      tableroRef.current = nuevo;
      return;
    }
    if (vsIa) {
      const posIA = turnoIA([...nuevo]);
      if (posIA == null || nuevo[posIA] !== " ") {
        setTablero(nuevo); tableroRef.current = nuevo; return;
      }
      nuevo[posIA] = "O";
      if (gana(nuevo, "O")) {
        setTerminado({ ganador: "O", ganado: false });
        terminadoRef.current = { ganador: "O" };
        registrarPunt(0, 0);
        setTablero(nuevo);
        tableroRef.current = nuevo;
        return;
      }
      if (!nuevo.includes(" ")) {
        setTerminado({ ganador: null, ganado: false });
        terminadoRef.current = { ganador: null };
        setTablero(nuevo);
        tableroRef.current = nuevo;
        registrarPunt(10, 0);
        return;
      }
      setTablero(nuevo);
      tableroRef.current = nuevo;
      setTurno("X");
    } else {
      const sig = marca === "X" ? "O" : "X";
      setTablero(nuevo);
      tableroRef.current = nuevo;
      setTurno(sig);
    }
  }

  const jugarRef = useRef(jugar);
  jugarRef.current = jugar;

  useEffect(() => {
    const fn = e => {
      if (escribiendo() || !tableroRef.current.length) return;
      const d = dirDeTecla(e.key);
      if (d) {
        e.preventDefault();
        setCursor(c => {
          const r = Math.floor(c / 3), col = c % 3;
          let nr = r, nc = col;
          if (d === "arr") nr = (r + 2) % 3;
          if (d === "aba") nr = (r + 1) % 3;
          if (d === "izq") nc = (col + 2) % 3;
          if (d === "der") nc = (col + 1) % 3;
          return nr * 3 + nc;
        });
        return;
      }
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setCursor(c => { jugarRef.current(c); return c; });
      } else if (e.key >= "1" && e.key <= "9") {
        const p = Number(e.key) - 1;
        setCursor(p);
        jugarRef.current(p);
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [vsIa, dif, turno]);

  const mostrarEtiqueta = (c, i) => c === " " && !terminado ? i + 1 : c;

  return (
    <GameShell titulo="Tic-Tac-Toe" emoji="❌"
      descripcion="Clic o teclado (flechas/WASD + ENTER, o teclas 1-9).">
      <div className="fila-botones">
        <button className={vsIa ? "btn-principal" : ""} onClick={() => { setVsIa(true); empezar(); }}>vs IA</button>
        <button className={!vsIa ? "btn-principal" : ""} onClick={() => { setVsIa(false); empezar(); }}>2 jugadores</button>
        {[1, 2, 3].map(d => (
          <button key={d} className={vsIa && dif === d ? "btn-exito" : ""} onClick={() => setDif(d)} disabled={!vsIa}>
            {d === 1 ? "Fácil" : d === 2 ? "Normal" : "Difícil"}
          </button>
        ))}
        <button onClick={empezar}>Reiniciar</button>
      </div>
      {tablero.length > 0 && (
        <div>
          <div className="tablero" style={{ gridTemplateColumns: "repeat(3,64px)", margin: "18px auto 0" }}>
            {tablero.map((c, i) => (
              <div key={i} className="celda clickeable"
                style={{ width: 62, height: 62, fontSize: "1.9rem", color: c === "X" ? "var(--peligro)" : "var(--info)", outline: i === cursor && !terminado ? "2px solid var(--info)" : undefined }}
                onClick={() => { setCursor(i); jugar(i); }}
                onMouseEnter={() => setCursor(i)}>
                {mostrarEtiqueta(c, i)}
              </div>
            ))}
          </div>
          <p style={{ textAlign: "center", marginTop: 12, color: "var(--texto-suave)" }}>
            {terminado ? "" : `Turno: ${vsIa ? "Tú (X)" : turno} · cursor en ${cursor + 1}`}
          </p>
          {terminado && <div className={`mensaje-final ${tipo}`} style={{ textAlign: "center" }}>
            {terminado.ganador === null ? "¡Empate! 🤝" : terminado.ganado ? "¡GANASTE! 🎉 " : vsIa ? "🤖 Gana la IA." : `¡Gana ${terminado.ganador}!`}
            {" "}{mensaje}
          </div>}
          {!terminado && <p className="aviso-ia" style={{ textAlign: "center" }}>💡 <b>flechas/WASD</b> mover · <b>ENTER</b> o <b>1-9</b> jugar.</p>}
        </div>
      )}
    </GameShell>
  );
}
