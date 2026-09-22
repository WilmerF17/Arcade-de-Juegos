import { useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { sfx } from "../suite/sonido";

/* Verdad o Reto familiar: gira y cumple. Suma puntos por cada prueba superada. */
function VoRBase({ titulo, banco, tira, iconoFondo }) {
  const { mensaje, tipo, registrarPunt } = useRegistro(titulo);
  const [reto, setReto] = useState(null);
  const [puntos, setPuntos] = useState(0);
  const [hechos, setHechos] = useState(0);
  const [jugando, setJugando] = useState(false);

  const META = 8;

  function empezar() {
    setPuntos(0); setHechos(0); setJugando(true);
    girar();
    sfx.clic();
  }

  function girar() {
    setReto(banco[Math.floor(Math.random() * banco.length)]);
  }

  function cumplir() {
    if (!jugando) return;
    const np = puntos + 100;
    const nh = hechos + 1;
    setPuntos(np); setHechos(nh);
    sfx.bien();
    if (nh >= META) {
      setJugando(false);
      registrarPunt(np, 1);
    } else girar();
  }

  return (
    <GameShell titulo={titulo} emoji="🎉"
      descripcion="Gira, cumple la prueba y suma · 8 pruebas = victoria."
      tira={tira} iconoFondo={iconoFondo}>
      <div className="fila-botones">
        <span className="chip">Pruebas: <b>{hechos}/{META}</b></span>
        <span className="chip">Puntos: <b>{puntos}</b></span>
      </div>
      {!jugando && hechos === 0 && (
        <div className="fila-botones"><button className="btn-principal" onClick={empezar}>▶ Empezar la fiesta</button></div>
      )}
      {reto && jugando && (
        <>
          <p style={{ textAlign: "center", fontSize: "1.05rem", background: "var(--bg-soft)", border: "1px solid var(--border)", borderRadius: 12, padding: 16 }}>
            <b>{reto.t}</b><br />{reto.d}
          </p>
          <div className="fila-botones">
            <button className="btn-exito" onClick={cumplir}>✅ ¡Cumplido! +100</button>
            <button className="btn-suave" onClick={girar}>⏭ Otra prueba</button>
          </div>
        </>
      )}
      <Resultado mensaje={mensaje} tipo={tipo} />
      {!jugando && hechos > 0 && !mensaje && (
        <div className="fila-botones"><button className="btn-principal" onClick={empezar}>↻ Otra fiesta</button></div>
      )}
    </GameShell>
  );
}

const CLASICO = [
  { t: "Verdad: ¿tu comida favorita?", d: "Cuéntala con pelos y señales." },
  { t: "Reto: imita a un animal", d: "El grupo debe adivinar cuál es." },
  { t: "Verdad: ¿tu mejor amigo?", d: "Di por qué es especial." },
  { t: "Reto: canta el estribillo", d: "Canta tu canción favorita." },
  { t: "Verdad: ¿qué quieres ser?", d: "Comparte tu sueño." },
  { t: "Reto: 10 saltos", d: "Salta 10 veces sin parar." },
  { t: "Verdad: ¿tu película favorita?", d: "Cuenta tu escena top." },
  { t: "Reto: cara rara", d: "Pon tu cara más rara 10 segundos." },
  { t: "Verdad: ¿tu lugar soñado?", d: "Describe a dónde viajarías." },
  { t: "Reto: trabalenguas", d: "Di 3 veces: tres tristes tigres." },
  { t: "Verdad: ¿qué te da risa?", d: "Cuéntalo." },
  { t: "Reto: bailecito", d: "Baila 15 segundos." },
];
const KIDS = [
  { t: "Verdad: ¿tu color favorito?", d: "Di por qué te gusta." },
  { t: "Reto: salta como rana", d: "Da 5 saltos de rana." },
  { t: "Verdad: ¿tu animal favorito?", d: "Imítalo también." },
  { t: "Reto: gira como trompo", d: "Gira 5 vueltas." },
  { t: "Verdad: ¿qué merienda te gusta?", d: "Descríbela." },
  { t: "Reto: pon cara de sorpresa", d: "Aguanta 10 segundos." },
  { t: "Verdad: ¿tu juego favorito?", d: "Explica cómo se juega." },
  { t: "Reto: aplaude con los pies", d: "Intenta aplaudir con los pies." },
  { t: "Verdad: ¿qué quieres aprender?", d: "Cuéntalo." },
  { t: "Reto: camina como pingüino", d: "Cruza la habitación." },
  { t: "Verdad: ¿tu canción favorita?", d: "Tararéala." },
  { t: "Reto: 5 sentadillas", d: "Haz 5 sentadillas." },
];

export function VerdadOReto() {
  return <VoRBase titulo="Verdad o Reto" banco={CLASICO} tira="linear-gradient(90deg,#ec4899,#f59e0b)" iconoFondo="linear-gradient(135deg,#ec4899,#f59e0b)" />;
}
export function VerdadORetoKids() {
  return <VoRBase titulo="Verdad o Reto Kids" banco={KIDS} tira="linear-gradient(90deg,#22c55e,#0ea5e9)" iconoFondo="linear-gradient(135deg,#22c55e,#0ea5e9)" />;
}
