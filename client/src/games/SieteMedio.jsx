import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro } from "../ui/GameShell";
import { escribiendo } from "../suite/teclado";
import { sfx } from "../suite/sonido";

function carta() {
  const r = Math.random();
  const v = r < 0.1 ? 10 : [1, 2, 3, 4, 5, 6, 7][Math.floor(Math.random() * 7)];
  const p = ["oros", "copas", "espadas", "bastos"][Math.floor(Math.random() * 4)];
  return { v, p, fig: v === 10 ? ["sota", "caballo", "rey"][Math.floor(Math.random() * 3)] : null };
}
const puntos = c => (c.v === 10 ? 0.5 : c.v);
const nom = c => (c.fig ? `${c.fig} de ${c.p}` : `${c.v} de ${c.p}`);
export default function SieteMedio() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Siete y Medio");
  const [tu, setTu] = useState([]);
  const [banca, setBanca] = useState([]);
  const [fase, setFase] = useState("apuesta");
  const [creditos, setCreditos] = useState(100);
  const [apuesta, setApuesta] = useState(10);
  const [res, setRes] = useState("");
  const credRef = useRef(100); credRef.current = creditos;

  const suma = m => m.reduce((a, c) => a + puntos(c), 0);
  function empezar() {
    if (credRef.current < apuesta) return;
    setCreditos(c => { credRef.current = c - apuesta; return credRef.current; });
    setTu([carta()]); setBanca([carta()]); setFase("juego"); setRes("");
    sfx.clic();
  }
  function pedir() {
    if (fase !== "juego") return;
    const nt = [...tu, carta()];
    setTu(nt);
    if (suma(nt) > 7.5) {
      setFase("fin"); setRes(`Te pasaste (${suma(nt)}). Pierdes.`);
      sfx.mal();
      if (credRef.current <= 0) registrarPunt(0, 0);
    } else sfx.clic();
  }
  function plantarse() {
    if (fase !== "juego") return;
    let b = [...banca];
    while (suma(b) < suma(tu) && suma(b) <= 7.5) b.push(carta());
    setBanca(b);
    const sT = suma(tu), sB = suma(b);
    let r, gano;
    if (sB > 7.5) { r = `La banca se pasa (${sB}). ¡GANAS! +${apuesta * 2}`; gano = true; }
    else if (sB >= sT) { r = `Banca ${sB} vs ${sT}. Pierdes.`; gano = false; }
    else { r = `Tú ${sT} vs ${sB}. ¡GANAS! +${apuesta * 2}`; gano = true; }
    setRes(r); setFase("fin");
    if (gano) {
      setCreditos(c => { credRef.current = c + apuesta * 2; return credRef.current; });
      sfx.record();
      if (apuesta >= 25) registrarPunt(apuesta * 2, 1);
    } else {
      sfx.mal();
      if (credRef.current <= 0) registrarPunt(0, 0);
    }
  }
  const pedirRef = useRef(pedir); pedirRef.current = pedir;
  const plantRef = useRef(plantarse); plantRef.current = plantarse;
  useEffect(() => {
    const fn = e => {
      if (escribiendo()) return;
      const k = e.key.toLowerCase();
      if (k === "c" || k === "h" || k === "enter") { if (fase === "juego") pedirRef.current(); else if (fase !== "juego") empezar(); }
      else if (k === "p") { if (fase === "juego") plantRef.current(); }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fase, apuesta, tu, banca]);
  return (
    <GameShell titulo="Siete y Medio" emoji="🪙" descripcion="C pedir · P plantarse · figuras valen 0.5 · no pases 7.5.">
      <div className="fila-botones" style={{ marginTop: 0 }}>
        <span className="chip">🪙 <b>{creditos}</b></span>
        <select value={apuesta} onChange={e => setApuesta(Number(e.target.value))} disabled={fase === "juego"}>
          <option value={5}>Apuesta 5</option><option value={10}>Apuesta 10</option><option value={25}>Apuesta 25</option>
        </select>
        {fase !== "juego" && <button className="btn-principal" onClick={empezar}>🃏 Repartir</button>}
        <button className="btn-suave" onClick={() => { setCreditos(100); credRef.current = 100; }}>↻ 100</button>
      </div>
      {(tu.length > 0) && (
        <div className="mesa-casino" style={{ marginTop: 14 }}>
          <p style={{ color: "#fff", margin: "0 0 6px" }}>🧑 Tú <b>({suma(tu)})</b>: {tu.map(nom).join(" · ")}</p>
          <p style={{ color: "#fff", margin: "0 0 10px" }}>🖥️ Banca <b>({fase === "juego" ? "?" : suma(banca)})</b>: {fase === "juego" ? `${nom(banca[0])} · ?` : banca.map(nom).join(" · ")}</p>
          {fase === "juego" && (
            <div className="fila-botones" style={{ marginTop: 0 }}>
              <button className="btn-principal" onClick={pedir}>Pedir (C)</button>
              <button onClick={plantarse}>Plantarse (P)</button>
            </div>
          )}
          {res && <p style={{ color: "#fff", fontWeight: 700 }}>{res}</p>}
        </div>
      )}
      {mensaje && fase === "fin" && <div className={`mensaje-final ${tipo}`}>{mensaje}</div>}
    </GameShell>
  );
}
