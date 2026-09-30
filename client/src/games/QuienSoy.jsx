import { useEffect, useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { sfx } from "../suite/sonido";

/* Motor "¿Quién soy?": 3 pistas y 4 opciones. */
const DIFS = { "Fácil": { n: 4 }, "Normal": { n: 6 }, "Difícil": { n: 8 } };
function QuienBase({ titulo, emoji, banco, tira, iconoFondo }) {
  const { mensaje, tipo, registrarPunt } = useRegistro(titulo);
  const [dif, setDif] = useState("Normal");
  const RONDAS = DIFS[dif].n;
  const [ronda, setRonda] = useState(null);
  const [pistas, setPistas] = useState(1);
  const [idx, setIdx] = useState(0);
  const [puntos, setPuntos] = useState(0);
  const [racha, setRacha] = useState(0);
  const [jugando, setJugando] = useState(false);

  function nuevaRonda() {
    const item = banco[Math.floor(Math.random() * banco.length)];
    const dist = banco.filter(([r]) => r !== item[0]).sort(() => Math.random() - 0.5).slice(0, 3).map(([r]) => r);
    setRonda({ resp: item[0], pistas: item.slice(1), opciones: [item[0], ...dist].sort(() => Math.random() - 0.5) });
    setPistas(1);
  }

  function empezar() {
    setPuntos(0); setRacha(0); setIdx(1); setJugando(true);
    nuevaRonda();
    sfx.clic();
  }

  function pedirPista() {
    if (!jugando) return;
    if (pistas < 3) {
      setPistas(pistas + 1);
      sfx.clic();
    }
  }

  function elegir(r) {
    if (!jugando) return;
    const gana = r === ronda.resp ? 150 - (pistas - 1) * 40 : 0;
    if (gana > 0) {
      setPuntos(puntos + gana);
      setRacha(racha + 1);
      sfx.bien();
    } else {
      setRacha(0);
      sfx.mal();
    }
    if (idx >= RONDAS) {
      setJugando(false);
      registrarPunt(puntos + gana, puntos >= 500 ? 1 : 0);
    } else {
      nuevaRonda();
      setIdx(idx + 1);
    }
  }

  useEffect(() => {
    const fn = (e) => {
      const tag = (e.target?.tagName || "").toUpperCase();
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if ((e.key === "Enter" || e.key === " ") && !jugando) {
        e.preventDefault();
        empezar();
        return;
      }
      if (!jugando || !ronda) return;
      const k = String(e.key).toLowerCase();
      if (k === "p") { pedirPista(); return; }
      let i = -1;
      if (["1", "2", "3", "4"].includes(e.key)) i = parseInt(e.key, 10) - 1;
      else if (["a", "b", "c", "d"].includes(k)) i = "abcd".indexOf(k);
      if (i >= 0 && i < ronda.opciones.length) elegir(ronda.opciones[i]);
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }); // eslint-disable-line react-hooks/exhaustive-deps

  const pct = RONDAS ? Math.round(((idx - (jugando ? 1 : 0)) / RONDAS) * 100) : 0;
  return (
    <GameShell titulo={titulo} emoji={emoji}
      descripcion={`3 pistas para adivinar · menos pistas = más puntos · ${RONDAS} rondas.`}
      tira={tira} iconoFondo={iconoFondo}
      stats={[
        { icono: "🕵️", etiqueta: "Ronda", valor: jugando ? `${idx}/${RONDAS}` : "—" },
        { icono: "⭐", etiqueta: "Puntos", valor: puntos },
        { icono: "🔥", etiqueta: "Racha", valor: racha },
        { icono: "🎚️", etiqueta: "Dificultad", valor: dif },
      ]}
      resultado={{ mensaje, tipo }}
      ayuda={(
        <div>
          <p><b>Reglas:</b> adivina quién soy con 1 a 3 pistas durante {RONDAS} rondas. Adivinar con 1 pista da 150, con 2 da 110, con 3 da 70.</p>
          <p><b>Controles:</b> ratón o táctil para pedir pista o elegir · teclado <kbd>1</kbd>–<kbd>4</kbd> para responder, <kbd>P</kbd> para otra pista, <kbd>Enter</kbd>/<kbd>Espacio</kbd> para empezar.</p>
          <p><b>Puntuación:</b> menos pistas = más puntos. Victoria con 500+ puntos.</p>
          <p><b>Consejo:</b> si lo sabes con 1 pista, arriesga: cada pista extra te cuesta 40 puntos.</p>
        </div>
      )}
      acciones={(
        <>
          {["Fácil", "Normal", "Difícil"].map(d => (
            <button key={d} className={dif === d ? "btn-principal" : "btn-suave"} disabled={jugando} onClick={() => { setDif(d); sfx.clic(); }}>{d}</button>
          ))}
          {!jugando && <button className="btn-principal" onClick={empezar}>{idx > 0 ? "↻ Otra vez" : "▶ Empezar"}</button>}
        </>
      )}>
      <div className="xp-bar fina" aria-hidden><div style={{ width: `${pct}%` }} /></div>
      {jugando && ronda && (
        <>
          {ronda.pistas.slice(0, pistas).map((p, i) => (
            <p key={i} style={{ textAlign: "center" }}>🔎 {p}</p>
          ))}
          {pistas < 3 && (
            <div className="fila-botones"><button className="btn-suave" onClick={pedirPista}>+ Otra pista (−40) <kbd>P</kbd></button></div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {ronda.opciones.map((o, i) => (
              <button key={o} className="trivia-op" style={{ padding: "14px 8px" }} onClick={() => elegir(o)}><span className="op-letra"><kbd>{i + 1}</kbd></span> {o}</button>
            ))}
          </div>
        </>
      )}
      <Resultado mensaje="" tipo="" />
    </GameShell>
  );
}

const QS = (titulo, emoji, banco, tira, iconoFondo) => function Comp() {
  return <QuienBase titulo={titulo} emoji={emoji} banco={banco} tira={tira} iconoFondo={iconoFondo} />;
};

export const QuienAnimales = QS("¿Quién soy? Animales", "🐾", [
  ["Jirafa", "Cuello muy largo", "Manchas marrones", "Come hojas altas"],
  ["Pingüino", "Ave que no vuela", "Vive en el frío", "Nada muy bien"],
  ["Canguro", "Salta sin parar", "Vive en Australia", "Lleva a su cría en el bolso"],
  ["Pulpo", "Vive en el mar", "Echa tinta", "Tiene ocho brazos"],
  ["Camaleón", "Es un reptil", "Cambia de color", "Lengua larguísima"],
  ["Murciélago", "Duerme colgado", "Sale de noche", "Mamífero que vuela"],
  ["Elefante", "Enorme y gris", "Orejas grandes", "Trompa larga"],
  ["Búho", "Caza de noche", "Ojos enormes", "Gira mucho la cabeza"],
], "linear-gradient(135deg,#a16207,#eab308)", "linear-gradient(135deg,#a16207,#eab308)");

export const QuienOficios = QS("¿Quién soy? Oficios", "🧰", [
  ["Panadero", "Trabaja de noche", "Usa harina", "Hornea el pan"],
  ["Bombero", "Viste de rojo", "Apaga fuegos", "Maneja la manguera"],
  ["Piloto", "Viaja mucho", "Viste uniforme", "Vuela aviones"],
  ["Maestro", "Trabaja en la escuela", "Explica lecciones", "Enseña a leer"],
  ["Médico", "Viste bata blanca", "Usa estetoscopio", "Cura enfermos"],
  ["Carpintero", "Huele a madera", "Usa martillo", "Hace muebles"],
  ["Pescador", "Madruga mucho", "Usa redes", "Pesca en el mar"],
  ["Jardinero", "Ama las flores", "Usa tijeras de podar", "Riega plantas"],
], "linear-gradient(135deg,#64748b,#0ea5e9)", "linear-gradient(135deg,#64748b,#0ea5e9)");
