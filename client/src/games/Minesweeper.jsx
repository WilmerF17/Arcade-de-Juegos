import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro } from "../ui/GameShell";
import { dirDeTecla, escribiendo } from "../suite/teclado";

const TAM = {
  "9x9": { f: 9, c: 9, minas: 10 },
  "12x12": { f: 12, c: 12, minas: 20 },
  "14x14": { f: 14, c: 14, minas: 40 },
};

const numCls = n => `celda-mina revelada cont${n}`;

export default function Minesweeper() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Buscaminas");
  const [tamaño, setTamaño] = useState("9x9");
  const [campo, setCampo] = useState(null);
  const [perdido, setPerdido] = useState(false);
  const [ganado, setGanado] = useState(false);
  const [iniciado, setIniciado] = useState(false);
  const [cursor, setCursor] = useState(0);
  const [banderas, setBanderas] = useState(0);

  const t = TAM[tamaño];
  const campoRef = useRef(campo);
  campoRef.current = campo;
  const finRef = useRef(false);
  finRef.current = perdido || ganado;

  function vacio() {
    const total = t.f * t.c;
    return Array.from({ length: total }, () => ({ mina: false, num: 0, revelada: false, bandera: false }));
  }

  function reiniciar(nuevoTam = tamaño) {
    const tt = TAM[nuevoTam];
    const total = tt.f * tt.c;
    setCampo(Array.from({ length: total }, () => ({ mina: false, num: 0, revelada: false, bandera: false })));
    setPerdido(false); setGanado(false); setIniciado(false);
    setCursor(0); setBanderas(0);
  }

  useEffect(() => { reiniciar(tamaño); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [tamaño]);
  useEffect(() => { reiniciar("9x9"); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  function generar(evitar) {
    const total = t.f * t.c;
    const celdas = vacio();
    let colocadas = 0;
    let guard = 0;
    while (colocadas < t.minas && guard++ < 5000) {
      const i = Math.floor(Math.random() * total);
      if (i !== evitar && !celdas[i].mina) { celdas[i].mina = true; colocadas++; }
    }
    for (let i = 0; i < total; i++) {
      if (celdas[i].mina) continue;
      const r = Math.floor(i / t.c), c = i % t.c;
      for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < t.f && nc >= 0 && nc < t.c && celdas[nr * t.c + nc].mina) celdas[i].num++;
      }
    }
    return celdas;
  }

  function revelarFlood(celdas, i) {
    const cola = [i];
    const vistos = new Set();
    while (cola.length) {
      const idx = cola.pop();
      if (vistos.has(idx)) continue;
      vistos.add(idx);
      const cel = celdas[idx];
      if (!cel || cel.bandera || cel.revelada) continue;
      if (cel.mina) continue;
      cel.revelada = true;
      if (cel.num === 0) {
        const r = Math.floor(idx / t.c), c = idx % t.c;
        for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr, nc = c + dc;
          if (nr >= 0 && nr < t.f && nc >= 0 && nc < t.c) cola.push(nr * t.c + nc);
        }
      }
    }
  }

  function comprobarVictoria(celdas) {
    return celdas.filter(c => !c.mina).every(c => c.revelada);
  }

  function revelar(i) {
    if (finRef.current || !campoRef.current) return;
    if (i < 0 || i >= campoRef.current.length) return;
    let celdas = campoRef.current.map(c => ({ ...c }));
    if (celdas[i].revelada || celdas[i].bandera) return;
    if (!iniciado) {
      celdas = generar(i);
      revelarFlood(celdas, i);
      setCampo(celdas);
      campoRef.current = celdas;
      setIniciado(true);
      if (comprobarVictoria(celdas)) {
        setGanado(true);
        registrarPunt(50 + t.minas, 1);
      }
      return;
    }
    if (celdas[i].mina) {
      celdas.forEach(c => { if (c.mina) c.revelada = true; });
      setPerdido(true);
      setCampo(celdas);
      campoRef.current = celdas;
      registrarPunt(0, 0);
      return;
    }
    revelarFlood(celdas, i);
    setCampo(celdas);
    campoRef.current = celdas;
    if (comprobarVictoria(celdas)) {
      setGanado(true);
      registrarPunt(50 + t.minas, 1);
    }
  }

  function bandera(i) {
    if (finRef.current || !campoRef.current) return;
    const celdas = campoRef.current.map(c => ({ ...c }));
    if (celdas[i].revelada) return;
    celdas[i].bandera = !celdas[i].bandera;
    setCampo(celdas);
    campoRef.current = celdas;
    setBanderas(celdas.filter(c => c.bandera).length);
  }

  const revelarRef = useRef(revelar);
  revelarRef.current = revelar;
  const banderaRef = useRef(bandera);
  banderaRef.current = bandera;

  // Teclado: flechas/WASD mueven cursor · ENTER/ESPACIO revela · F bandera
  useEffect(() => {
    const fn = e => {
      if (escribiendo() || !campoRef.current) return;
      const d = dirDeTecla(e.key);
      if (d) {
        e.preventDefault();
        setCursor(prev => {
          const cols = TAM[tamaño]?.c || 9;
          const rows = TAM[tamaño]?.f || 9;
          let r = Math.floor(prev / cols), c = prev % cols;
          if (d === "arr") r = Math.max(0, r - 1);
          if (d === "aba") r = Math.min(rows - 1, r + 1);
          if (d === "izq") c = Math.max(0, c - 1);
          if (d === "der") c = Math.min(cols - 1, c + 1);
          return r * cols + c;
        });
        return true;
      }
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setCursor(cur => { revelarRef.current(cur); return cur; });
      } else if (e.key === "f" || e.key === "F") {
        setCursor(cur => { banderaRef.current(cur); return cur; });
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [tamaño, iniciado]);

  const nMinas = t.minas;

  return (
    <GameShell titulo="Buscaminas" emoji="💣"
      descripcion="Clic o ENTER/ESPACIO revela · clic derecho o F bandera · flechas/WASD mueven cursor.">
      <div className="fila-botones" style={{ marginTop: 0 }}>
        {Object.keys(TAM).map(k => (
          <button key={k} className={tamaño === k ? "btn-principal" : ""} onClick={() => { setTamaño(k); }}>{k}</button>
        ))}
        <button className="btn-exito" onClick={() => reiniciar()}>Reiniciar</button>
      </div>
      {!campo && <p style={{ marginTop: 30, textAlign: "center", color: "var(--texto-suave)" }}>Cargando...</p>}
      {campo && (
        <div>
          <div className="chip" style={{ display: "inline-block", marginBottom: 10 }}>Minas restantes: <b>{nMinas - campo.filter(c => c.bandera).length}</b></div>
          <div className="tablero" onContextMenu={e => e.preventDefault()}
            style={{ gridTemplateColumns: `repeat(${t.c}, 34px)` }}>
            {campo.map((cel, i) => (
              <div key={i} className={cel.revelada ? (cel.mina ? "celda-mina revelada" : numCls(cel.num)) : "celda-mina"}
                style={i === cursor && !cel.revelada ? { outline: "2px solid var(--info)", outlineOffset: -2 } : undefined}
                onClick={() => { setCursor(i); revelar(i); }}
                onMouseEnter={() => setCursor(i)}
                onContextMenu={e => { e.preventDefault(); bandera(i); }}>
                {cel.revelada
                  ? cel.mina ? "💣" : cel.num > 0 ? cel.num : ""
                  : cel.bandera ? "🚩" : ""}
              </div>
            ))}
          </div>
          {perdido && <div className={`mensaje-final ${tipo}`}>💥 ¡Boom! Pisaste una mina. {mensaje}</div>}
          {ganado && <div className="mensaje-final record">🎉 ¡Tablero limpio! {mensaje}</div>}
          {!perdido && !ganado && <p className="aviso-ia">💡 Teclado: <b>flechas/WASD</b> cursor · <b>ENTER</b> revelar · <b>F</b> bandera.</p>}
        </div>
      )}
    </GameShell>
  );
}
