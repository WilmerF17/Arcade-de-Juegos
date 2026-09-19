import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro } from "../ui/GameShell";
import { escribiendo } from "../suite/teclado";

const COLORES = ["🔴", "🟠", "🟢", "🔵", "🟡", "🟣"];

export default function Mastermind() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Mastermind");
  const [combo, setCombo] = useState([]);
  const [fila, setFila] = useState([]);
  const [intentos, setIntentos] = useState([]);
  const [fin, setFin] = useState(false);
  const [aviso, setAviso] = useState("");

  function empezar() {
    const c = [];
    while (c.length < 4) {
      const v = Math.floor(Math.random() * 6);
      if (!c.includes(v)) c.push(v);
    }
    setCombo(c); setFila([]); setIntentos([]); setFin(false); setAviso("");
  }

  function elegirColor(i) {
    if (fin || intentos.length >= 10 || !combo.length) return;
    setFila(f => {
      if (f.includes(i)) return f.filter(x => x !== i);
      if (f.length >= 4) return f;
      return [...f, i];
    });
  }

  function probar() {
    if (fin || intentos.length >= 10 || !combo.length) return;
    if (fila.length < 4) { setAviso("Selecciona 4 colores (clic o teclas 1-6)."); return; }
    let p = 0, d = 0;
    const resto = [...combo];
    fila.forEach((c, k) => {
      if (c === combo[k]) { p++; resto[resto.indexOf(c)] = -1; }
    });
    fila.forEach((c, k) => {
      if (c === combo[k]) return;
      const idx = resto.indexOf(c);
      if (idx >= 0) { d++; resto[idx] = -1; }
    });
    const nuevo = [...intentos, { fila: [...fila], p, d }];
    setIntentos(nuevo); setFila([]); setAviso("");
    if (p === 4) {
      const pts = Math.max(10 * (11 - nuevo.length), 10);
      registrarPunt(pts, 1);
      setFin(true);
    } else if (nuevo.length >= 10) {
      registrarPunt(0, 0);
      setFin(true);
    }
  }

  const elegirRef = useRef(elegirColor);
  elegirRef.current = elegirColor;
  const probarRef = useRef(probar);
  probarRef.current = probar;
  const empezarRef = useRef(empezar);
  empezarRef.current = empezar;

  // Teclado: 1-6 alterna color · ENTER probar · N nueva partida
  useEffect(() => {
    const fn = e => {
      if (escribiendo()) return;
      if (e.key >= "1" && e.key <= "6") elegirRef.current(Number(e.key) - 1);
      else if (e.key === "Enter") {
        if (!combo.length || fin) empezarRef.current();
        else probarRef.current();
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [combo, fila, intentos, fin]);

  return (
    <GameShell titulo="Mastermind" emoji="🎨"
      descripcion="Teclado: 1-6 elige color · ENTER probar · 4 colores, 10 intentos.">
      <div className="fila-botones" style={{ marginTop: 0 }}>
        <button className="btn-exito" onClick={empezar}>{combo.length ? "Nueva partida" : "Empezar"}</button>
        <span className="chip">Intentos: <b>{intentos.length}/10</b></span>
      </div>
      <div style={{ marginTop: 10 }}>
        <p style={{ margin: "0 0 6px" }}>Elige 4 colores:</p>
        <div className="fila-botones" style={{ marginTop: 0 }}>
          {COLORES.map((c, i) => (
            <button key={i} className={fila.includes(i) ? "btn-principal" : "btn-suave"} onClick={() => elegirColor(i)} style={{ fontSize: "1.3rem" }} title={`Tecla ${i + 1}`}>{c}<small style={{ display: "block", fontSize: ".6rem" }}>{i + 1}</small></button>
          ))}
        </div>
        <p style={{ margin: "10px 0 4px" }}>Tu intento:</p>
        <div className="fila-botones" style={{ marginTop: 0, minHeight: 44 }}>
          {Array.from({ length: 4 }, (_, i) => (
            <span key={i} style={{ width: 44, height: 44, borderRadius: 10, background: fila[i] != null ? undefined : "var(--bg-soft)", border: "2px dashed var(--border)", display: "grid", placeItems: "center", fontSize: "1.5rem" }}>
              {fila[i] != null ? COLORES[fila[i]] : ""}
            </span>
          ))}
        </div>
        <div className="fila-botones" style={{ marginTop: 10 }}>
          <button className="btn-principal" onClick={probar}>Probar intento (ENTER)</button>
          {aviso && <span className="chip" style={{ color: "var(--aviso)" }}>{aviso}</span>}
        </div>
      </div>
      <div className="tablero" style={{ padding: 10, marginTop: 14 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {intentos.slice().reverse().map((it, r) => (
            <div key={intentos.length - 1 - r} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span className="chip">#{intentos.length - r}</span>
              <span>{it.fila.map((c, i) => <span key={i} style={{ marginRight: 4 }}>{COLORES[c]}</span>)}</span>
              <span className="chip" style={{ letterSpacing: 2 }}>{"●".repeat(it.p)}<span style={{ opacity: 0.6 }}>{"○".repeat(it.d)}</span></span>
            </div>
          ))}
          {intentos.length === 0 && <span style={{ color: "var(--texto-suave)", fontSize: ".85rem" }}>Sin intentos todavía. ● = bien colocado · ○ = color correcto en otro sitio.</span>}
        </div>
      </div>
      {fin && <div className={`mensaje-final ${tipo}`}>
        {intentos[intentos.length - 1]?.p === 4
          ? "🎉 ¡ADIVINASTE! " + mensaje
          : `Se acabaron los intentos. La combinación era: ${combo.map(c => COLORES[c]).join(" ")}`}
      </div>}
    </GameShell>
  );
}
