import { useState } from "react";
import GameShell, { useRegistro } from "../ui/GameShell";
import { sfx } from "../suite/sonido";

/* Motor "¿Quién soy?": 3 pistas y 4 opciones. 8 rondas. */
/* item: [respuesta, pista1, pista2, pista3] */
function QuienBase({ titulo, emoji, banco, tira, iconoFondo }) {
  const { mensaje, tipo, registrarPunt } = useRegistro(titulo);
  const [ronda, setRonda] = useState(null);
  const [pistas, setPistas] = useState(1);
  const [idx, setIdx] = useState(0);
  const [puntos, setPuntos] = useState(0);
  const [jugando, setJugando] = useState(false);

  const RONDAS = 8;

  function nuevaRonda() {
    const item = banco[Math.floor(Math.random() * banco.length)];
    const dist = banco.filter(([r]) => r !== item[0]).sort(() => Math.random() - 0.5).slice(0, 3).map(([r]) => r);
    setRonda({ resp: item[0], pistas: item.slice(1), opciones: [item[0], ...dist].sort(() => Math.random() - 0.5) });
    setPistas(1);
  }

  function empezar() {
    setPuntos(0); setIdx(1); setJugando(true);
    nuevaRonda();
    sfx.clic();
  }

  function elegir(r) {
    if (!jugando) return;
    const gana = r === ronda.resp ? 150 - (pistas - 1) * 40 : 0;
    if (gana > 0) {
      setPuntos(puntos + gana);
      sfx.bien();
    } else sfx.mal();
    if (idx >= RONDAS) {
      setJugando(false);
      registrarPunt(puntos + gana, puntos >= 500 ? 1 : 0);
    } else {
      nuevaRonda();
      setIdx(idx + 1);
    }
  }

  return (
    <GameShell titulo={titulo} emoji={emoji}
      descripcion="3 pistas para adivinar · menos pistas = más puntos · 8 rondas."
      tira={tira} iconoFondo={iconoFondo}>
      <div className="fila-botones" style={{ marginTop: 0 }}>
        <span className="chip">Ronda: <b>{jugando ? `${idx}/${RONDAS}` : "—"}</b></span>
        <span className="chip">Puntos: <b>{puntos}</b></span>
      </div>
      {!jugando && idx === 0 && (
        <div className="fila-botones"><button className="btn-principal" onClick={empezar}>▶ Empezar</button></div>
      )}
      {jugando && ronda && (
        <>
          {ronda.pistas.slice(0, pistas).map((p, i) => (
            <p key={i} style={{ textAlign: "center" }}>🔎 {p}</p>
          ))}
          {pistas < 3 && (
            <div className="fila-botones"><button className="btn-suave" onClick={() => setPistas(pistas + 1)}>+ Otra pista (−40)</button></div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {ronda.opciones.map(o => (
              <button key={o} className="btn-suave" style={{ padding: "14px 8px" }} onClick={() => elegir(o)}>{o}</button>
            ))}
          </div>
        </>
      )}
      {mensaje && <div className={`mensaje-final ${tipo}`}>{mensaje}</div>}
      {!jugando && idx > 0 && !mensaje && (
        <div className="fila-botones"><button className="btn-principal" onClick={empezar}>↻ Otra vez</button></div>
      )}
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
