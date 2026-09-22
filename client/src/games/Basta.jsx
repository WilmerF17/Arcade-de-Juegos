import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { sfx } from "../suite/sonido";

/* ¡Basta!: te dan letra y categorías, escribe una palabra de cada en 60s. */
function BastaBase({ titulo, categorias, tira, iconoFondo }) {
  const { mensaje, tipo, registrarPunt } = useRegistro(titulo);
  const [letra, setLetra] = useState("");
  const [resps, setResps] = useState({});
  const [tiempo, setTiempo] = useState(60);
  const [jugando, setJugando] = useState(false);
  const st = useRef({ jugando: false, letra: "", resps: {} });

  function empezar() {
    const l = "ABCDEFGHIJKLMNÑOPRSTUV".split("")[Math.floor(Math.random() * 20)];
    st.current = { jugando: true, letra: l, resps: {} };
    setLetra(l); setResps({}); setTiempo(60); setJugando(true);
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
      sfx.bien();
      registrarPunt(puntos, validas.length >= 4 ? 1 : 0);
      return;
    }
    const id = setTimeout(() => setTiempo(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [jugando, tiempo]); // eslint-disable-line react-hooks/exhaustive-deps

  function escribe(cat, v) {
    st.current.resps = { ...st.current.resps, [cat]: v };
    setResps(st.current.resps);
  }

  return (
    <GameShell titulo={titulo} emoji="✏️"
      descripcion={`Letra + categorías · 60s · cada válida = 50 · todas distintas = +50.`}
      tira={tira} iconoFondo={iconoFondo}>
      <div className="fila-botones">
        <span className="chip">⏱ <b>{tiempo}s</b></span>
        {letra && <span className="chip">Letra: <b style={{ fontSize: "1.3rem" }}>{letra}</b></span>}
      </div>
      {!jugando && (
        <div className="fila-botones"><button className="btn-principal" onClick={empezar}>▶ Empezar (60s)</button></div>
      )}
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
