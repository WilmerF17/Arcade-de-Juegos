import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { escribiendo } from "../suite/teclado";
import { sfx } from "../suite/sonido";

const TIEMPO_TIRO = 45, BALAS = 6;

/* Galería de tiro: aparecen bandidos 🥷 (+10) y civiles 👤 (−15).
   Toca para disparar, recarga con R. Fallar al aire gasta bala. */
function TiroteoMotor({ nombre, emoji, descripcion, ayuda, intervalo, maxVivos, vidaMs, oscuro }) {
  const { mensaje, tipo, registrarPunt } = useRegistro(nombre);
  const [blancos, setBlancos] = useState([]);
  const [puntos, setPuntos] = useState(0);
  const [balas, setBalas] = useState(BALAS);
  const [quedan, setQuedan] = useState(TIEMPO_TIRO);
  const [jugando, setJugando] = useState(false);
  const [fin, setFin] = useState(false);
  const st = useRef({ puntos: 0, balas: BALAS });
  const timers = useRef([]);

  useEffect(() => () => timers.current.forEach(t => clearInterval(t)), []);

  function empezar() {
    timers.current.forEach(t => clearInterval(t)); timers.current = [];
    st.current = { puntos: 0, balas: BALAS };
    setPuntos(0); setBalas(BALAS); setQuedan(TIEMPO_TIRO);
    setBlancos([]); setFin(false); setJugando(true);
    sfx.clic();
    let idc = 0;
    timers.current.push(setInterval(() => {
      setBlancos(b => {
        if (b.length >= maxVivos) return b;
        const id = ++idc;
        const civil = Math.random() < 0.25;
        const nb = { id, x: 6 + Math.random() * 82, y: 8 + Math.random() * 68, civil, nace: Date.now() };
        timers.current.push(setTimeout(() => setBlancos(v => v.filter(x => x.id !== id)), vidaMs));
        return [...b, nb];
      });
    }, intervalo));
    timers.current.push(setInterval(() => {
      setQuedan(q => {
        if (q <= 1) { terminar(); return 0; }
        return q - 1;
      });
    }, 1000));
  }

  function terminar() {
    timers.current.forEach(t => clearInterval(t)); timers.current = [];
    setJugando(false); setFin(true); setBlancos([]);
    const p = Math.max(0, st.current.puntos);
    registrarPunt(p, p >= 100 ? 1 : 0);
    if (p >= 100) sfx.bien(); else sfx.mal();
  }

  function recargar() {
    if (!jugando) return;
    st.current.balas = BALAS;
    setBalas(BALAS);
    sfx.clic();
  }

  useEffect(() => {
    const dn = e => {
      if (escribiendo() || !jugando) return;
      if (e.key.toLowerCase() === "r") { recargar(); e.preventDefault(); }
    };
    window.addEventListener("keydown", dn);
    return () => window.removeEventListener("keydown", dn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jugando]);

  function dispararAire() {
    if (!jugando || fin) return;
    if (st.current.balas <= 0) { sfx.mal(); return; }
    st.current.balas -= 1;
    st.current.puntos -= 2;
    setBalas(st.current.balas); setPuntos(st.current.puntos);
    sfx.clic();
  }

  function dispararBlanco(id, civil) {
    if (!jugando || fin) return;
    if (st.current.balas <= 0) { sfx.mal(); return; }
    st.current.balas -= 1;
    st.current.puntos += civil ? -15 : 10;
    setBalas(st.current.balas); setPuntos(st.current.puntos);
    setBlancos(b => b.filter(x => x.id !== id));
    if (civil) sfx.mal(); else sfx.bien();
  }

  return (
    <GameShell titulo={nombre} emoji={emoji}
      descripcion={descripcion}
      stats={[
        { etiqueta: "Puntos", valor: puntos },
        { etiqueta: "Balas", valor: `🔫 ${balas}/${BALAS}` },
        { etiqueta: "Tiempo", valor: `${quedan}s` },
      ]}
      resultado={{ mensaje, tipo }}
      ayuda={<>
        <span><b>Objetivo:</b> {descripcion}</span>
        <span><b>Controles:</b> <kbd>clic</kbd>/<kbd>toque</kbd> disparar, <kbd>R</kbd> recargar (6 balas).</span>
        <span><b>Puntos:</b> 🥷 +10, 👤 −15, aire −2 y gasta bala; 100+ es victoria. {ayuda}</span>
        <span><b>Consejo:</b> no vacíes el cargador: recarga con 1-2 balas de margen.</span>
      </>}>
      <div onPointerDown={dispararAire}
        style={{
          position: "relative", height: 260, borderRadius: 12, overflow: "hidden",
          border: "1px solid var(--border)", cursor: "crosshair", touchAction: "manipulation",
          background: oscuro
            ? "radial-gradient(circle at 50% 120%, #1e1b4b, #020617 70%)"
            : "radial-gradient(circle at 50% 120%, #14532d, #052e16 70%)",
        }} aria-label="Campo de tiro: toca a los bandidos">
        {blancos.map(b => (
          <button key={b.id} aria-label={b.civil ? "civil, no dispares" : "bandido"}
            onPointerDown={e => { e.stopPropagation(); dispararBlanco(b.id, b.civil); }}
            style={{
              position: "absolute", left: `${b.x}%`, top: `${b.y}%`, transform: "translate(-50%,-50%)",
              fontSize: "2rem", background: "none", border: "none", cursor: "crosshair",
              animation: "pop .18s ease", padding: 6,
            }}>{b.civil ? "👤" : "🥷"}</button>
        ))}
        {!jugando && !fin && (
          <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: .7 }}>
            Toca «Jugar» y afina la puntería 🎯
          </span>
        )}
      </div>
      <div className="fila-botones">
        {!jugando && <button className="btn-principal" onClick={empezar}>{fin ? "🔁 Otra ronda" : `▶️ Jugar (${TIEMPO_TIRO}s)`}</button>}
        {jugando && <button className="btn-exito" onClick={recargar}>🔄 Recargar (R)</button>}
        {fin && <span className={`chip${puntos >= 100 ? " victoria" : ""}`}>{puntos} pts</span>}
      </div>
      <Resultado mensaje={mensaje} tipo={tipo} />
    </GameShell>
  );
}

export default function Tiroteo() {
  return <TiroteoMotor nombre="Tiroteo" emoji="🔫" intervalo={700} maxVivos={4} vidaMs={1300} oscuro={false}
    descripcion="Galería de tiro: bandidos +10, civiles −15, 6 balas por cargador."
    ayuda={<>Toca a los <b>🥷 bandidos</b> (+10) y perdona a los <b>👤 civiles</b> (−15). Fallar al aire resta 2 y gasta bala. Recarga con <b>R</b> o el botón. 100 puntos = victoria.</>} />;
}
export function TiroteoNocturno() {
  return <TiroteoMotor nombre="Tiroteo Nocturno" emoji="🌙" intervalo={450} maxVivos={6} vidaMs={900} oscuro
    descripcion="Tiro de noche: más rápido, más blancos, menos perdón."
    ayuda={<>Igual que el Tiroteo pero <b>todo va más rápido</b> y duran menos en pantalla. Solo para gatillos veloces.</>} />;
}

/* Duelo al amanecer: el primero que dispare tras el ¡YA! gana la ronda.
   Disparar antes = falta y pierdes la ronda. Al mejor de 5 contra la máquina. */
export function DueloAmanecer() {
  const NOMBRE = "Duelo al Amanecer";
  const { mensaje, tipo, registrarPunt } = useRegistro(NOMBRE);
  const [fase, setFase] = useState("inicio");
  const [p1, setP1] = useState(0);
  const [p2, setP2] = useState(0);
  const [ronda, setRonda] = useState(0);
  const [fin, setFin] = useState(null);
  const timers = useRef([]);
  const faseRef = useRef("inicio");
  faseRef.current = fase;

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  function limpiar() { timers.current.forEach(clearTimeout); timers.current = []; }

  function nuevaRonda(n1, n2, nr) {
    setFase("espera");
    const espera = 2000 + Math.random() * 3000;
    timers.current.push(setTimeout(() => {
      if (faseRef.current !== "espera") return;
      setFase("ya");
      sfx.salto();
      const iaTarda = 350 + Math.random() * 600;
      timers.current.push(setTimeout(() => {
        if (faseRef.current !== "ya") return;
        ganaRonda(false, n1, n2, nr);
      }, iaTarda));
    }, espera));
  }

  function ganaRonda(ganaTu, n1, n2, nr) {
    limpiar();
    const a = n1 + (ganaTu ? 1 : 0), b = n2 + (ganaTu ? 0 : 1);
    setP1(a); setP2(b);
    if (ganaTu) sfx.bien(); else sfx.mal();
    if (a >= 3 || b >= 3) {
      const gano = a >= 3;
      setFase("fin");
      setFin(gano ? "¡GANASTE EL DUELO! 🤠" : "La máquina fue más rápida 🤖");
      registrarPunt(a * 20 + (gano ? 40 : 0), gano ? 1 : 0);
    } else {
      setRonda(nr + 1);
      nuevaRonda(a, b, nr + 1);
    }
  }

  function empezar() {
    limpiar();
    setP1(0); setP2(0); setRonda(1); setFin(null);
    sfx.clic();
    nuevaRonda(0, 0, 1);
  }

  function disparar() {
    if (fase === "ya") ganaRonda(true, p1, p2, ronda);
    else if (fase === "espera") {
      sfx.mal();
      ganaRonda(false, p1, p2, ronda); // falta: disparaste antes
    }
  }

  return (
    <GameShell titulo={NOMBRE} emoji="🤠"
      descripcion="Duelo rápido: espera el ¡YA! y dispara antes que la máquina. Al mejor de 5."
      stats={[{ etiqueta: "Tú", valor: p1 }, { etiqueta: "CPU", valor: p2 }, { etiqueta: "Ronda", valor: fin ? "—" : `${ronda}/5` }]}
      resultado={{ mensaje, tipo }}
      ayuda={<>
        <span><b>Objetivo:</b> dispara tras el <b>🔫 ¡YA!</b> antes que la máquina; al mejor de 5 (3 rondas).</span>
        <span><b>Controles:</b> <kbd>clic</kbd>/<kbd>toque</kbd> en ¡DISPARA!; disparar antes es falta.</span>
        <span><b>Puntos:</b> 20 por ronda + 40 bonus al ganar el duelo.</span>
        <span><b>Consejo:</b> no mires el “Espera…”, reacciona solo al cambio a ¡YA!.</span>
      </>}>
      <div style={{ textAlign: "center", fontSize: "3rem", minHeight: 90 }} aria-live="polite">
        {fase === "inicio" && "🌵"}
        {fase === "espera" && "😐"}
        {fase === "ya" && "🔫"}
        {fase === "fin" && (p1 >= 3 ? "🏆" : "💀")}
      </div>
      <p style={{ textAlign: "center", fontSize: "1.3rem" }}>
        {fase === "inicio" && "Pulsa Jugar y mantén el dedo listo…"}
        {fase === "espera" && "Espera… ⏳"}
        {fase === "ya" && <b style={{ color: "var(--exito)" }}>¡YA! ¡DISPARA!</b>}
        {fase === "fin" && <b>{fin}</b>}
      </p>
      <div className="fila-botones">
        {fase === "inicio" || fase === "fin"
          ? <button className="btn-principal" onClick={empezar}>{fase === "fin" ? "🔁 Otro duelo" : "▶️ Empezar duelo"}</button>
          : <button className="btn-exito" onClick={disparar} style={{ minHeight: 60, minWidth: 200, fontSize: "1.3rem", touchAction: "manipulation" }}>🔫 ¡DISPARA!</button>}
      </div>
      <Resultado mensaje={mensaje} tipo={tipo} />
    </GameShell>
  );
}
