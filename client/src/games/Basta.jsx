import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { sfx } from "../suite/sonido";
import { escribiendo } from "../suite/teclado";

/* ¡Basta!: te dan letra y categorías, escribe una palabra de cada. */
const CONF_DIF = { 1: { tiempo: 90, nombre: "Fácil" }, 2: { tiempo: 60, nombre: "Normal" }, 3: { tiempo: 45, nombre: "Difícil" } };
function BastaBase({ titulo, categorias, tira, iconoFondo }) {
  const { mensaje, tipo, registrarPunt } = useRegistro(titulo);
  const [letra, setLetra] = useState("");
  const [resps, setResps] = useState({});
  const [dif, setDif] = useState(2);
  const [tiempo, setTiempo] = useState(CONF_DIF[2].tiempo);
  const [jugando, setJugando] = useState(false);
  const st = useRef({ jugando: false, letra: "", resps: {} });
  const jugandoRef = useRef(false);
  jugandoRef.current = jugando;

  function empezar() {
    const l = "ABCDEFGHIJKLMNÑOPRSTUV".split("")[Math.floor(Math.random() * 20)];
    st.current = { jugando: true, letra: l, resps: {} };
    setLetra(l); setResps({}); setTiempo(CONF_DIF[dif].tiempo); setJugando(true);
    sfx.clic();
  }

  useEffect(() => {
    if (!jugando) return;
    if (tiempo <= 0) {
      st.current.jugando = false;
      setJugando(false);
      const validas = categorias.filter(c => {
        const v = (st.current.resps[c] || "").trim().toLowerCase();
        return v && v[0] === st.current.letra.toLowerCase();
      });
      // bonus por unicidad: todas distintas = +50
      const uns = new Set(validas.map(c => st.current.resps[c].trim().toLowerCase()));
      const puntos = validas.length * 50 + (uns.size === validas.length && validas.length > 0 ? 50 : 0);
      if (validas.length >= 4) sfx.bien();
      else sfx.mal();
      registrarPunt(puntos, validas.length >= 4 ? 1 : 0);
      return;
    }
    const id = setTimeout(() => setTiempo(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [jugando, tiempo]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const fn = e => {
      if (escribiendo()) return;
      if ((e.key === "Enter" || e.key === " ") && !jugandoRef.current) {
        e.preventDefault();
        empezar();
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dif, categorias]);

  function escribe(cat, v) {
    st.current.resps = { ...st.current.resps, [cat]: v };
    setResps(st.current.resps);
  }

  const validasAhora = categorias.filter(c => {
    const v = (resps[c] || "").trim().toLowerCase();
    return letra && v && v[0] === letra.toLowerCase();
  }).length;
  const total = CONF_DIF[dif].tiempo;
  const pct = Math.max(0, Math.round((tiempo / total) * 100));

  return (
    <GameShell titulo={titulo} emoji="✏️"
      descripcion={`Letra + categorías · ${total}s · cada válida = 50 · todas distintas = +50.`}
      tira={tira} iconoFondo={iconoFondo}
      stats={[
        { icono: "⏱", etiqueta: "Tiempo", valor: `${tiempo}s` },
        { icono: "🔤", etiqueta: "Letra", valor: letra || "—" },
        { icono: "✅", etiqueta: "Válidas", valor: `${validasAhora}/${categorias.length}` },
        { icono: "🎯", etiqueta: "Dificultad", valor: CONF_DIF[dif].nombre },
      ]}
      acciones={!jugando ? <button className="btn-principal" onClick={empezar}>▶ Empezar ({total}s)</button> : null}
      ayuda={<>
        <span>Escribe una palabra por categoría que empiece por la letra: cada válida suma <b>50</b> y si todas son distintas hay <b>+50 extra</b>.</span>
        <span>Controles: escribe en cada campo con teclado físico o táctil. <kbd>ENTER</kbd> o <kbd>ESPACIO</kbd> empieza cuando no juegas.</span>
        <span>Puntuación: con <b>4+ válidas</b> la partida cuenta como victoria. Dificultad: <b>Fácil 90s</b>, <b>Normal 60s</b>, <b>Difícil 45s</b>.</span>
        <span>Consejo: rellena primero las categorías fáciles y deja País para el final.</span>
      </>}>
      {!jugando && !letra && (
        <div className="fila-botones" role="group" aria-label="Dificultad">
          {[1, 2, 3].map(d => (
            <button key={d} className={dif === d ? "btn-principal" : "btn-suave"} onClick={() => { setDif(d); setTiempo(CONF_DIF[d].tiempo); sfx.clic(); }}>{d === 1 ? "🟢 Fácil" : d === 2 ? "🟡 Normal" : "🔴 Difícil"}</button>
          ))}
        </div>
      )}
      <div className="xp-bar fina" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Tiempo restante"><div style={{ width: `${pct}%` }} /></div>
      {jugando && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {categorias.map(c => (
            <label key={c} style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ width: 110, color: "var(--texto-suave)" }}>{c}</span>
              <input type="text" value={resps[c] || ""} onChange={e => escribe(c, e.target.value)}
                placeholder={`…con ${letra}`} style={{ flex: 1 }} />
            </label>
          ))}
        </div>
      )}
      <Resultado mensaje={mensaje} tipo={tipo} />
    </GameShell>
  );
}

export function Basta() {
  return <BastaBase titulo="¡Basta!" categorias={["Nombre", "Animal", "Cosa", "Comida", "País"]} tira="linear-gradient(90deg,#facc15,#ff3d5a)" iconoFondo="linear-gradient(135deg,#facc15,#ff3d5a)" />;
}
export function BastaJunior() {
  return <BastaBase titulo="¡Basta! Junior" categorias={["Nombre", "Animal", "Color", "Comida"]} tira="linear-gradient(90deg,#22c55e,#0ea5e9)" iconoFondo="linear-gradient(135deg,#22c55e,#0ea5e9)" />;
}
