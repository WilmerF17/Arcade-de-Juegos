import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro } from "../ui/GameShell";
import { escribiendo } from "../suite/teclado";
import { sfx } from "../suite/sonido";

const caras = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
function tirarBloq(dados, bloq) { return dados.map((d, i) => (bloq[i] ? d : 1 + Math.floor(Math.random() * 6))); }
function puntuar(d, cat) {
  const cuenta = [0, 0, 0, 0, 0, 0, 0];
  d.forEach(v => { cuenta[v]++; });
  const suma = d.reduce((a, b) => a + b, 0);
  if (cat >= 1 && cat <= 6) return cuenta[cat] * cat;
  if (cat === "trio") return cuenta.some(c => c >= 3) ? suma : 0;
  if (cat === "poker") return cuenta.some(c => c >= 4) ? suma : 0;
  if (cat === "full") return cuenta.includes(3) && cuenta.includes(2) ? 25 : 0;
  if (cat === "esc") {
    const u = [...new Set(d)].sort().join("");
    return /12345|23456|1234|2345|3456/.test(u.replace(/,/g, "")) || u.length >= 4 ? 30 : 0;
  }
  if (cat === "yahtzee") return cuenta.some(c => c === 5) ? 50 : 0;
  if (cat === "chance") return suma;
  return 0;
}
const CATS = [[1, "Unos"], [2, "Doses"], [3, "Treses"], [4, "Cuatros"], [5, "Cincos"], [6, "Seises"], ["trio", "Trío"], ["poker", "Póker"], ["full", "Full (25)"], ["esc", "Escalera (30)"], ["yahtzee", "Cinco iguales (50)"], ["chance", "Chance"]];

export default function Yahtzee() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Dados Cinco");
  const [dados, setDados] = useState([1, 2, 3, 4, 5]);
  const [bloq, setBloq] = useState([false, false, false, false, false]);
  const [tiradas, setTiradas] = useState(0);
  const [usadas, setUsadas] = useState({});
  const [fin, setFin] = useState(false);
  const [mejor, setMejor] = useState(null);
  const st = useRef({ tiradas, usadas }); st.current = { tiradas, usadas };
  const finRef = useRef(false); finRef.current = fin;

  function lanzar() {
    if (fin || st.current.tiradas >= 3) return;
    setDados(d => tirarBloq(d, bloq));
    setTiradas(t => t + 1); st.current.tiradas += 1;
    sfx.clic();
  }
  function elegir(cat) {
    const s = st.current;
    if (fin || s.usadas[cat] != null || s.tiradas === 0) return;
    const p = puntuar(dados, cat);
    const nu = { ...s.usadas, [cat]: p };
    st.current.usadas = nu; setUsadas(nu);
    setBloq([false, false, false, false, false]);
    setTiradas(0); st.current.tiradas = 0;
    setDados([1, 2, 3, 4, 5]);
    if (p >= 25) sfx.bien(); else sfx.clic();
    if (Object.keys(nu).length >= CATS.length) {
      const total = Object.values(nu).reduce((a, b) => a + b, 0);
      setFin(true);
      finRef.current = true;
      setMejor(m => (m == null || total > m ? total : m));
      registrarPunt(total, total >= 200 ? 1 : 0);
      if (total >= 200) sfx.record(); else sfx.bien();
    }
  }
  function reiniciar() {
    sfx.clic();
    setDados([1, 2, 3, 4, 5]);
    setBloq([false, false, false, false, false]);
    setTiradas(0); st.current.tiradas = 0;
    setUsadas({}); st.current.usadas = {};
    setFin(false); finRef.current = false;
  }
  const lanzarRef = useRef(lanzar); lanzarRef.current = lanzar;
  const reiniciarRef = useRef(reiniciar); reiniciarRef.current = reiniciar;
  useEffect(() => {
    const fn = e => {
      if (escribiendo()) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (finRef.current) reiniciarRef.current();
        else lanzarRef.current();
      }
      if (e.key >= "1" && e.key <= "5") { const i = Number(e.key) - 1; setBloq(b => b.map((v, k) => (k === i ? !v : v))); sfx.clic(); }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [bloq, dados]);

  const total = Object.values(usadas).reduce((a, b) => a + b, 0);
  const hechas = Object.keys(usadas).length;
  const pct = Math.round((hechas / CATS.length) * 100);
  return (
    <GameShell titulo="Dados Cinco" emoji="🎲" descripcion="ENTER lanzar (3/turno) · 1-5 bloquear · elige categoría."
      stats={[
        { icono: "🎲", etiqueta: "Tirada", valor: `${tiradas}/3` },
        { icono: "⭐", etiqueta: "Total", valor: total },
        { icono: "📋", etiqueta: "Ronda", valor: `${hechas + 1}/${CATS.length}` },
        { icono: "🏆", etiqueta: "Mejor", valor: mejor == null ? "—" : mejor },
      ]}
      acciones={<>
        <button className="btn-principal" onClick={lanzar} disabled={fin || tiradas >= 3}>🎲 Lanzar ({tiradas}/3 · ENTER)</button>
        <button className="btn-exito" onClick={reiniciar}>↻ Nueva partida</button>
      </>}
      resultado={fin ? { mensaje, tipo } : null}
      ayuda={<>
        <p><b>Objetivo:</b> completa las 12 categorías con la mejor puntuación. Tienes <b>3 tiradas por turno</b> y puedes bloquear dados (clic o <kbd>1</kbd>–<kbd>5</kbd>).</p>
        <p><b>Controles:</b> <kbd>Enter</kbd>/<kbd>Espacio</kbd> lanzar (o reiniciar al terminar), <kbd>1</kbd>–<kbd>5</kbd> bloquear. Táctil: toca los dados y la categoría.</p>
        <p><b>Puntuación:</b> Unos–Seises suman sus dados; Trío/Póker suman todo si hay 3+/4+ iguales; Full 25 · Escalera 30 · Cinco iguales 50 · Chance suma libre. Total ≥200 cuenta como victoria.</p>
        <p><b>Consejo:</b> no quemes el Chance pronto: guárdalo para una mala tirada y prioriza Full/Escalera cuando los dados casi encajan.</p>
      </>}>
      <div className="xp-bar fina"><div style={{ width: `${pct}%` }} /></div>
      <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
        {dados.map((d, i) => (
          <div key={i} onClick={() => { setBloq(b => b.map((v, k) => (k === i ? !v : v))); sfx.clic(); }}
            className="dado" style={{ outline: bloq[i] ? "3px solid var(--exito)" : undefined, cursor: "pointer", opacity: tiradas === 0 ? 0.5 : 1 }}>
            {caras[d]}
          </div>
        ))}
      </div>
      <div className="grid" style={{ gridTemplateColumns: "repeat(3,1fr)", marginTop: 14 }}>
        {CATS.map(([cat, nom]) => {
          const usado = usadas[cat] != null;
          const pot = !usado && tiradas > 0 ? puntuar(dados, cat) : null;
          return (
            <button key={cat} disabled={usado || tiradas === 0 || fin} onClick={() => elegir(cat)}
              className={usado ? "" : pot >= 25 ? "btn-principal" : "btn-suave"}>
              {nom}: <b>{usado ? usadas[cat] : pot != null ? `(${pot})` : "—"}</b>
            </button>
          );
        })}
      </div>
      {fin && <p style={{ fontWeight: 800, textAlign: "center" }}>🎉 ¡Partida completa! Total {total}</p>}
    </GameShell>
  );
}
