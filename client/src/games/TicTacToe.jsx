import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro } from "../ui/GameShell";
import { dirDeTecla, escribiendo } from "../suite/teclado";
import { sfx } from "../suite/sonido";

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

const NOM_DIF = { 1: "Fácil", 2: "Normal", 3: "Difícil" };

export default function TicTacToe() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Tic-Tac-Toe");
  const [tablero, setTablero] = useState([]);
  const [turno, setTurno] = useState("X");
  const [vsIa, setVsIa] = useState(true);
  const [dif, setDif] = useState(3);
  const [terminado, setTerminado] = useState(null);
  const [cursor, setCursor] = useState(4);
  const [balance, setBalance] = useState({ v: 0, e: 0, d: 0 });
  const tableroRef = useRef(tablero);
  const terminadoRef = useRef(terminado);
  tableroRef.current = tablero;
  terminadoRef.current = terminado;

  const empezar = () => {
    sfx.clic();
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
    sfx.clic();
    let nuevo = [...tab];
    const marca = vsIa ? "X" : turno;
    nuevo[pos] = marca;
    if (gana(nuevo, marca)) {
      const ganado = vsIa && marca === "X";
      registrarPunt(30, ganado ? 1 : 0);
      if (ganado) { sfx.bien(); setBalance(b => ({ ...b, v: b.v + 1 })); }
      else if (vsIa) { sfx.mal(); setBalance(b => ({ ...b, d: b.d + 1 })); }
      else { sfx.bien(); setBalance(b => ({ ...b, v: b.v + 1 })); }
      setTerminado({ ganador: marca, ganado });
      terminadoRef.current = { ganador: marca };
      setTablero(nuevo);
      tableroRef.current = nuevo;
      return;
    }
    if (!nuevo.includes(" ")) {
      registrarPunt(10, 0);
      sfx.clic();
      setBalance(b => ({ ...b, e: b.e + 1 }));
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
        sfx.mal();
        setBalance(b => ({ ...b, d: b.d + 1 }));
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
        setBalance(b => ({ ...b, e: b.e + 1 }));
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
  const empezarRef = useRef(empezar);
  empezarRef.current = empezar;

  useEffect(() => {
    const fn = e => {
      if (escribiendo() || !tableroRef.current.length) return;
      if ((e.key === "Enter" || e.key === " ") && terminadoRef.current) {
        e.preventDefault();
        empezarRef.current();
        return;
      }
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
  const totalFin = balance.v + balance.e + balance.d;
  const pctV = totalFin ? Math.round((balance.v / totalFin) * 100) : 0;
  const textoFin = terminado
    ? terminado.ganador === null ? "¡Empate! 🤝" : terminado.ganado ? "¡GANASTE! 🎉 " : vsIa ? "🤖 Gana la IA." : `¡Gana ${terminado.ganador}!`
    : "";
  const resultadoBanner = terminado ? { mensaje: `${textoFin} ${mensaje}`, tipo } : null;

  return (
    <GameShell titulo="Tic-Tac-Toe" emoji="❌"
      descripcion="Clic o teclado (flechas/WASD + ENTER, o teclas 1-9)."
      stats={[
        { icono: "🔄", etiqueta: "Turno", valor: terminado ? "Fin" : vsIa ? "Tú (X)" : turno },
        { icono: "🤖", etiqueta: "Modo", valor: vsIa ? `IA ${NOM_DIF[dif]}` : "2 jug." },
        { icono: "🏆", etiqueta: "Victorias", valor: balance.v },
        { icono: "🤝", etiqueta: "Tablas", valor: balance.e },
      ]}
      acciones={<>
        <button className={vsIa ? "btn-principal" : "btn-suave"} onClick={() => { setVsIa(true); empezar(); }}>vs IA</button>
        <button className={!vsIa ? "btn-principal" : "btn-suave"} onClick={() => { setVsIa(false); empezar(); }}>2 jugadores</button>
        {[1, 2, 3].map(d => (
          <button key={d} className={vsIa && dif === d ? "btn-exito" : "btn-suave"} onClick={() => { sfx.clic(); setDif(d); }} disabled={!vsIa}>
            {d === 1 ? "Fácil" : d === 2 ? "Normal" : "Difícil"}
          </button>
        ))}
        <button className="btn-exito" onClick={empezar}>↻ Reiniciar (ENTER)</button>
      </>}
      resultado={resultadoBanner}
      ayuda={<>
        <p><b>Objetivo:</b> alinea 3 fichas en fila, columna o diagonal. Juegas con <b>X</b>; la IA o el segundo jugador lleva <b>O</b>.</p>
        <p><b>Controles:</b> clica una casilla o mueve el cursor con <kbd>←</kbd><kbd>→</kbd><kbd>↑</kbd><kbd>↓</kbd>/<kbd>WASD</kbd> y confirma con <kbd>Enter</kbd>/<kbd>Espacio</kbd>. Teclas <kbd>1</kbd>–<kbd>9</kbd> juegan directo. Con <kbd>Enter</kbd> reinicias al terminar.</p>
        <p><b>Puntuación:</b> ganar da <b>30 pts</b>, empatar <b>10 pts</b>, perder 0. Niveles: <b>Fácil</b> aleatoria, <b>Normal</b> glotona (gana/bloquea), <b>Difícil</b> minimax casi perfecta.</p>
        <p><b>Consejo:</b> ocupa el centro si está libre y crea dobles amenazas (dos líneas a la vez) para forzar la victoria.</p>
      </>}>
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
          {totalFin > 0 && (
            <div style={{ maxWidth: 320, margin: "8px auto" }}>
              <div className="xp-bar fina"><div style={{ width: `${pctV}%` }} /></div>
              <p style={{ textAlign: "center", fontSize: ".8rem", color: "var(--texto-suave)" }}>Victorias {balance.v}/{totalFin} · Derrotas {balance.d} · Tablas {balance.e}</p>
            </div>
          )}
          {!terminado && <p className="aviso-ia" style={{ textAlign: "center" }}>💡 <b>flechas/WASD</b> mover · <b>ENTER</b> o <b>1-9</b> jugar.</p>}
        </div>
      )}
    </GameShell>
  );
}
