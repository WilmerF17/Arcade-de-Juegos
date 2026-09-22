import { useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { sfx } from "../suite/sonido";

const PALOS = [{ n: "Oros", e: "🪙" }, { n: "Copas", e: "🏆" }, { n: "Espadas", e: "⚔️" }, { n: "Bastos", e: "🍷" }];
const VALOR = v => (v <= 7 ? v : v === 8 ? 8 : v === 9 ? 9 : 10);
const NOMBRE = v => (v <= 7 ? v : ["", "", "", "", "", "", "", "Sota", "Caballo", "Rey"][v - 1]);

function mazo() {
  const m = [];
  for (let p = 0; p < 4; p++) for (let v = 1; v <= 10; v++) m.push({ v, p });
  return m.sort(() => Math.random() - 0.5);
}
// subconjuntos de la mesa que suman (15 - jugada)
function capturas(mesa, jugada) {
  const obj = 15 - VALOR(jugada.v);
  const res = [];
  const n = mesa.length;
  for (let mask = 1; mask < 1 << n; mask++) {
    let s = 0;
    const idx = [];
    for (let i = 0; i < n; i++) if (mask & (1 << i)) { s += VALOR(mesa[i].v); idx.push(i); }
    if (s === obj) res.push(idx);
  }
  return res;
}

/* Escoba: captura cartas que sumen 15 con la tuya. Barrrer la mesa = escoba. */
export default function Escoba() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Escoba");
  const [mano, setMano] = useState([]);
  const [manoIA, setManoIA] = useState([]);
  const [mesa, setMesa] = useState([]);
  const [resto, setResto] = useState([]);
  const [misCap, setMisCap] = useState([]);
  const [iaCap, setIaCap] = useState([]);
  const [escobas, setEscobas] = useState(0);
  const [jugando, setJugando] = useState(false);
  const [log, setLog] = useState("");

  function empezar() {
    const m = mazo();
    setMano(m.slice(0, 3)); setManoIA(m.slice(3, 6)); setMesa(m.slice(6, 10)); setResto(m.slice(10));
    setMisCap([]); setIaCap([]); setEscobas(0); setJugando(true); setLog("");
    sfx.clic();
  }

  function repartir(manoN, manoIAN, mesaN, restoN) {
    if (manoN.length === 0 && manoIAN.length === 0 && restoN.length >= 6) {
      return { manoN: restoN.slice(0, 3), manoIAN: restoN.slice(3, 6), restoN: restoN.slice(6) };
    }
    return { manoN, manoIAN, restoN };
  }

  function jugarCarta(ci) {
    if (!jugando) return;
    const carta = mano[ci];
    const caps = capturas(mesa, carta);
    let nMesa = [...mesa], nMis = [...misCap], nEsc = escobas;
    let nMano = mano.filter((_, i) => i !== ci);
    let nIa = [...manoIA], nResto = [...resto];
    let texto;
    if (caps.length) {
      // captura el grupo más grande
      const g = caps.sort((a, b) => b.length - a.length)[0];
      const tomadas = g.map(i => mesa[i]);
      nMesa = mesa.filter((_, i) => !g.includes(i));
      nMis = [...nMis, carta, ...tomadas];
      if (nMesa.length === 0) { nEsc++; texto = `🧹 ¡ESCOBA con ${NOMBRE(carta.v)}!`; sfx.record(); }
      else { texto = `✅ Capturas ${tomadas.length + 1}`; sfx.bien(); }
    } else {
      nMesa = [...nMesa, carta];
      texto = "Dejas carta…";
      sfx.clic();
    }
    // turno IA: greedy
    if (nIa.length) {
      let mejor = null, mejorG = [];
      nIa.forEach((c, i) => {
        const cp = capturas(nMesa, c);
        if (cp.length) {
          const g = cp.sort((a, b) => b.length - a.length)[0];
          if (!mejor || g.length > mejorG.length) { mejor = i; mejorG = g; }
        }
      });
      let nIaCap = [...iaCap];
      if (mejor !== null) {
        const tomadas = mejorG.map(i => nMesa[i]);
        nMesa = nMesa.filter((_, i) => !mejorG.includes(i));
        nIaCap = [...nIaCap, nIa[mejor], ...tomadas];
        texto += ` | 🤖 IA captura ${tomadas.length + 1}`;
      } else {
        const peor = nIa.map((c, i) => [VALOR(c.v), i]).sort((a, b) => a[0] - b[0])[0][1];
        nMesa = [...nMesa, nIa[peor]];
        nIa = nIa.filter((_, i) => i !== peor);
        texto += " | 🤖 IA deja carta";
      }
      setIaCap(nIaCap);
      if (mejor !== null) nIa = nIa.filter((_, i) => i !== mejor);
    }
    const r = repartir(nMano, nIa, nMesa, nResto);
    setMano(r.manoN); setManoIA(r.manoIAN); setMesa(nMesa); setResto(r.restoN);
    setMisCap(nMis); setEscobas(nEsc);
    setLog(texto);
    if (r.manoN.length === 0 && r.manoIAN.length === 0 && r.restoN.length === 0 && nMesa.length >= 0) {
      // fin del mazo
      if (r.restoN.length === 0 && nMano.length === 0 && nIa.length === 0) {
        setJugando(false);
        const puntos = nEsc * 100 + nMis.length * 5;
        const victoria = nEsc > 0 || nMis.length >= 20;
        if (victoria) sfx.record();
        registrarPunt(puntos, victoria ? 1 : 0);
      }
    }
  }

  const cartaTxt = c => `${NOMBRE(c.v)}${PALOS[c.p].e}`;

  return (
    <GameShell titulo="Escoba" emoji="🧹"
      descripcion="Suma 15 con la mesa para capturar · barrerla = escoba."
      tira="linear-gradient(90deg,#b45309,#f59e0b)" iconoFondo="linear-gradient(135deg,#b45309,#f59e0b)">
      <div className="fila-botones">
        {!jugando && mano.length === 0 && <button className="btn-principal" onClick={empezar}>▶ Repartir</button>}
        <span className="chip">🧹 Escobas: <b>{escobas}</b></span>
        <span className="chip">Tus cartas: <b>{misCap.length}</b></span>
        <span className="chip">IA: <b>{iaCap.length}</b></span>
      </div>
      {mesa.length > 0 && <p style={{ textAlign: "center", color: "var(--texto-suave)" }}>Mesa ({mesa.length})</p>}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
        {mesa.map((c, i) => (
          <span key={i} className="chip" style={{ fontSize: "1rem" }}>{cartaTxt(c)}</span>
        ))}
      </div>
      {log && <p style={{ textAlign: "center" }}>{log}</p>}
      {jugando && (
        <>
          <p style={{ textAlign: "center", color: "var(--texto-suave)" }}>Tu mano 👇</p>
          <div className="fila-botones">
            {mano.map((c, i) => (
              <button key={i} className="btn-principal" onClick={() => jugarCarta(i)}>{cartaTxt(c)}</button>
            ))}
          </div>
        </>
      )}
      <Resultado mensaje={mensaje} tipo={tipo} />
    </GameShell>
  );
}
