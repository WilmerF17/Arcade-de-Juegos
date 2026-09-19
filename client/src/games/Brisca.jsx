import { useState } from "react";
import GameShell, { useRegistro } from "../ui/GameShell";
import { sfx } from "../suite/sonido";

const PALOS = [{ n: "Oros", e: "🪙" }, { n: "Copas", e: "🏆" }, { n: "Espadas", e: "⚔️" }, { n: "Bastos", e: "🍷" }];
const PUNTOS = { 1: 11, 3: 10, 10: 4, 9: 3, 8: 2 };
const RANGO = { 1: 14, 3: 13, 10: 12, 9: 11, 8: 10, 7: 7, 6: 6, 5: 5, 4: 4, 2: 2 };
const NOMBRE = v => (v === 1 ? "As" : v === 8 ? "Sota" : v === 9 ? "Caballo" : v === 10 ? "Rey" : v);

function mazo() {
  const m = [];
  for (let p = 0; p < 4; p++) for (const v of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) m.push({ v, p });
  return m.sort(() => Math.random() - 0.5);
}
// ¿gana `a` (segunda) a `b` (primera)? triunfo = palo muestra
function ganaSegunda(a, b, triunfo) {
  if (a.p === b.p) return RANGO[a.v] > RANGO[b.v];
  return a.p === triunfo;
}

/* Brisca: bazas contra la IA, el triunfo manda. Más de 60 puntos gana. */
export default function Brisca() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Brisca");
  const [mano, setMano] = useState([]);
  const [manoIA, setManoIA] = useState([]);
  const [resto, setResto] = useState([]);
  const [triunfo, setTriunfo] = useState(0);
  const [mesa, setMesa] = useState([]);
  const [lidero, setLidero] = useState(true);
  const [pts, setPts] = useState([0, 0]);
  const [jugando, setJugando] = useState(false);
  const [log, setLog] = useState("");

  function empezar() {
    const m = mazo();
    setMano(m.slice(0, 3)); setManoIA(m.slice(3, 6)); setResto(m.slice(6, -1));
    setTriunfo(m[m.length - 1].p);
    setMesa([]); setLidero(true); setPts([0, 0]); setJugando(true); setLog("");
    sfx.clic();
  }

  function robar(manoN, iaN, restoN, ganaHumano) {
    // El ganador de la baza roba primero; si no hay cartas, se sigue con lo que quede.
    let mN = [...manoN], iN = [...iaN], rN = [...restoN];
    if (rN.length) {
      if (ganaHumano) mN.push(rN.shift());
      else iN.push(rN.shift());
    }
    if (rN.length) {
      if (ganaHumano) iN.push(rN.shift());
      else mN.push(rN.shift());
    }
    return { manoN: mN, iaN: iN, restoN: rN };
  }

  function cerrarBaza(manoN, iaN, restoN, ptsN, ganaHumano, texto) {
    setMano(manoN); setManoIA(iaN); setResto(restoN); setPts(ptsN);
    setMesa([]); setLidero(ganaHumano);
    setLog(texto);
    if (!manoN.length && !iaN.length && !restoN.length) {
      setJugando(false);
      const victoria = ptsN[0] > 60;
      if (victoria) sfx.record(); else sfx.mal();
      registrarPunt(ptsN[0], victoria ? 1 : 0);
    }
  }

  function jugarHumano(ci) {
    if (!jugando || !mano.length || !manoIA.length) return;
    if (!lidero && mesa.length === 0) return; // esperando que la IA abra
    const c = mano[ci];
    if (lidero || mesa.length === 0) {
      // humano lidera o mesa vacía: pone y responde la IA
      const m = [...mesa, { c, de: "yo" }];
      const ia = [...manoIA];
      // IA responde: gana si puede con la menor que gane, si no la menor
      let ri = 0, best = -1;
      ia.forEach((x, i) => {
        if (ganaSegunda(x, c, triunfo) && (best === -1 || RANGO[x.v] < RANGO[ia[best].v])) best = i;
      });
      if (best === -1) best = ia.map((x, i) => [RANGO[x.v] + (x.p === triunfo ? 100 : 0), i]).sort((a, b) => a[0] - b[0])[0][1];
      ri = best;
      const rc = ia[ri];
      const m2 = [...m, { c: rc, de: "ia" }];
      setMesa(m2);
      const ganaIA = ganaSegunda(rc, c, triunfo);
      const p = (PUNTOS[c.v] || 0) + (PUNTOS[rc.v] || 0);
      const ptsN = ganaIA ? [pts[0], pts[1] + p] : [pts[0] + p, pts[1]];
      const manoN = mano.filter((_, i) => i !== ci);
      const iaN = ia.filter((_, i) => i !== ri);
      const { manoN: mN, iaN: iN, restoN: rN } = robar(manoN, iaN, resto, !ganaIA);
      setTimeout(() => cerrarBaza(mN, iN, rN, ptsN, !ganaIA,
        ganaIA ? `🤖 IA gana la baza (+${p})` : `✅ ¡Baza tuya! (+${p})`), 900);
      if (ganaIA) sfx.mal(); else sfx.bien();
    } else {
      // humano responde a la IA
      const primera = mesa[0].c;
      const m2 = [...mesa, { c, de: "yo" }];
      setMesa(m2);
      const ganoYo = ganaSegunda(c, primera, triunfo);
      const p = (PUNTOS[c.v] || 0) + (PUNTOS[primera.v] || 0);
      const ptsN = ganoYo ? [pts[0] + p, pts[1]] : [pts[0], pts[1] + p];
      const manoN = mano.filter((_, i) => i !== ci);
      // La IA ya puso su carta al liderar (se quitó en el render): su mano actual es la restante.
      const { manoN: mN, iaN: iN, restoN: rN } = robar(manoN, manoIA, resto, ganoYo);
      setTimeout(() => cerrarBaza(mN, iN, rN, ptsN, ganoYo,
        ganoYo ? `✅ ¡Baza tuya! (+${p})` : `🤖 IA gana la baza (+${p})`), 900);
      if (ganoYo) sfx.bien(); else sfx.mal();
    }
  }

  // Cuando la IA lidera, juega automáticamente su primera carta al quedarse la mesa vacía
  if (jugando && !lidero && mesa.length === 0 && manoIA.length && mano.length) {
    const ia = [...manoIA];
    const li = ia.map((x, i) => [RANGO[x.v], i]).sort((a, b) => a[0] - b[0])[0][1];
    const [lc] = ia.splice(li, 1);
    setManoIA(ia);
    setMesa([{ c: lc, de: "ia" }]);
    setLog("🤖 La IA abre la baza… responde tú.");
  }

  const cartaTxt = c => `${NOMBRE(c.v)}${PALOS[c.p].e}`;

  return (
    <GameShell titulo="Brisca" emoji="🃏"
      descripcion={`Triunfo: ${PALOS[triunfo].n} ${PALOS[triunfo].e} · gana la baza y roba · +60 puntos vence.`}
      tira="linear-gradient(90deg,#052e16,#22c55e)" iconoFondo="linear-gradient(135deg,#052e16,#22c55e)">
      <div className="fila-botones" style={{ marginTop: 0 }}>
        {!jugando && mano.length === 0 && <button className="btn-principal" onClick={empezar}>▶ Repartir</button>}
        <span className="chip">Tú: <b>{pts[0]}</b></span>
        <span className="chip">IA: <b>{pts[1]}</b></span>
        <span className="chip">Mazo: <b>{resto.length}</b></span>
      </div>
      {mesa.length > 0 && (
        <div className="fila-botones">
          {mesa.map((m, i) => (
            <span key={i} className="chip" style={{ fontSize: "1.1rem" }}>{m.de === "yo" ? "🧍" : "🤖"} {cartaTxt(m.c)}</span>
          ))}
        </div>
      )}
      {log && <p style={{ textAlign: "center" }}>{log}</p>}
      {jugando && (
        <>
          <p style={{ textAlign: "center", color: "var(--texto-suave)" }}>
            {mesa.length === 0 ? (lidero ? "Abres tú 👇" : "La IA abre…") : lidero || mesa.length === 2 ? "Tu mano 👇" : "Responde 👇"}
          </p>
          <div className="fila-botones">
            {mano.map((c, i) => (
              <button key={i} className="btn-principal" onClick={() => jugarHumano(i)}>{cartaTxt(c)}</button>
            ))}
          </div>
        </>
      )}
      {mensaje && <div className={`mensaje-final ${tipo}`}>{mensaje}</div>}
    </GameShell>
  );
}
