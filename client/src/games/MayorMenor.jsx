import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { escribiendo } from "../suite/teclado";
import { sfx } from "../suite/sonido";

const PALOS = ["🪙", "🏆", "⚔️", "🍷"];
const NOMBRES = { 1: "As", 8: "Sota", 9: "Caballo", 10: "Rey" };
const nombre = v => NOMBRES[v] || v;
const VIDAS_OPS = [1, 3, 5];

/* Mayor o Menor: ¿la próxima carta sube o baja? Racha máxima manda. */
export default function MayorMenor() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Mayor o Menor");
  const [actual, setActual] = useState(null);
  const [racha, setRacha] = useState(0);
  const [mejor, setMejor] = useState(0);
  const [vidas, setVidas] = useState(3);
  const [vidasIni, setVidasIni] = useState(3);
  const [jugando, setJugando] = useState(false);
  const st = useRef({ jugando: false });
  st.current = { jugando };

  function carta() {
    return { v: 1 + Math.floor(Math.random() * 10), p: PALOS[Math.floor(Math.random() * 4)] };
  }

  function empezar() {
    setActual(carta()); setRacha(0); setMejor(0); setVidas(vidasIni); setJugando(true);
    st.current.jugando = true;
    sfx.clic();
  }

  function apostar(sube) {
    if (!st.current.jugando) return;
    const n = carta();
    const ok = sube ? n.v >= actual.v : n.v <= actual.v;
    if (ok) {
      const nr = racha + 1;
      setRacha(nr);
      setMejor(m => Math.max(m, nr));
      sfx.bien();
    } else {
      const nv = vidas - 1;
      setVidas(nv);
      setRacha(0);
      sfx.mal();
      if (nv <= 0) {
        setJugando(false);
        st.current.jugando = false;
        registrarPunt(mejor * 60, mejor >= 5 ? 1 : 0);
        setActual(n);
        return;
      }
    }
    setActual(n);
  }
  const apostarRef = useRef(apostar);
  apostarRef.current = apostar;
  const empezarRef = useRef(empezar);
  empezarRef.current = empezar;

  useEffect(() => {
    const fn = e => {
      if (escribiendo()) return;
      const k = e.key.toLowerCase();
      if (k === "arrowup" || k === "arrowright" || k === "m") apostarRef.current(true);
      else if (k === "arrowdown" || k === "arrowleft" || k === "n") apostarRef.current(false);
      else if (k === "enter" || k === " ") {
        e.preventDefault();
        if (!st.current.jugando) empezarRef.current();
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [actual, racha, vidas, mejor]);

  const pctVidas = vidasIni ? Math.round((vidas / vidasIni) * 100) : 0;

  return (
    <GameShell titulo="Mayor o Menor" emoji="🃏"
      descripcion={`¿La próxima carta sube o baja? Igual vale · ${vidasIni} vidas · ↑ mayor / ↓ menor.`}
      tira="linear-gradient(90deg,#0ea5e9,#a855f7)" iconoFondo="linear-gradient(135deg,#0ea5e9,#a855f7)"
      stats={[
        { icono: "🔥", etiqueta: "Racha", valor: racha },
        { icono: "🏆", etiqueta: "Récord", valor: mejor },
        { icono: "❤️", etiqueta: "Vidas", valor: `${vidas}/${vidasIni}` },
        { icono: "🎚️", etiqueta: "Modo", valor: `${vidasIni} vidas` },
      ]}
      acciones={<>
        {!jugando && <button className="btn-principal" onClick={empezar}>{actual ? "↻ Otra vez (ENTER)" : "▶ Empezar (ENTER)"}</button>}
        {VIDAS_OPS.map(n => (
          <button key={n} className={vidasIni === n ? "btn-exito" : "btn-suave"} disabled={jugando} onClick={() => { setVidasIni(n); sfx.clic(); }}>{n} {n === 1 ? "vida" : "vidas"}</button>
        ))}
      </>}
      ayuda={<>
        <p><b>Objetivo:</b> adivina si la próxima carta será <b>mayor o menor</b> (igual vale como acierto). Cada fallo resta 1 vida; la racha se reinicia al fallar.</p>
        <p><b>Controles:</b> botones Mayor/Menor, teclas <kbd>↑</kbd>/<kbd>→</kbd>/<kbd>M</kbd> mayor y <kbd>↓</kbd>/<kbd>←</kbd>/<kbd>N</kbd> menor, <kbd>Enter</kbd>/<kbd>Espacio</kbd> empezar. Táctil: toca los botones grandes.</p>
        <p><b>Puntuación:</b> al perder todas las vidas registras <b>60 pts por récord de racha</b>; racha ≥5 cuenta como victoria.</p>
        <p><b>Consejo:</b> con carta media (5–6) sigue la intuición, pero con extremos (1–2 o 9–10) apuesta casi siempre hacia el centro: la probabilidad manda.</p>
      </>}>
      <div className="xp-bar fina"><div style={{ width: `${pctVidas}%` }} /></div>
      {actual && (
        <>
          <p style={{ textAlign: "center", fontSize: "3.4rem", margin: "4px 0" }}>{actual.p}<br />{nombre(actual.v)}</p>
          {jugando && (
            <div className="fila-botones" style={{ justifyContent: "center" }}>
              <button className="btn-peligro" style={{ padding: "14px 26px", fontSize: "1.2rem" }} onClick={() => apostar(false)}>📉 Menor (↓)</button>
              <button className="btn-exito" style={{ padding: "14px 26px", fontSize: "1.2rem" }} onClick={() => apostar(true)}>📈 Mayor (↑)</button>
            </div>
          )}
        </>
      )}
      <Resultado mensaje={mensaje} tipo={tipo} />
      {!jugando && actual && !mensaje && (
        <div className="fila-botones" style={{ justifyContent: "center" }}><button className="btn-principal" onClick={empezar}>↻ Otra vez</button></div>
      )}
    </GameShell>
  );
}
