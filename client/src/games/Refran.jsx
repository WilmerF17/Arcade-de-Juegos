import { useState } from "react";
import GameShell, { useRegistro } from "../ui/GameShell";
import { sfx } from "../suite/sonido";

/* Motor de refranes: completa la frase con la opción correcta. 8 rondas. */
/* item: [inicio, [opciones], ok, final] */
function RefranBase({ titulo, emoji, banco, tira, iconoFondo }) {
  const { mensaje, tipo, registrarPunt } = useRegistro(titulo);
  const [ronda, setRonda] = useState(null);
  const [idx, setIdx] = useState(0);
  const [puntos, setPuntos] = useState(0);
  const [racha, setRacha] = useState(0);
  const [jugando, setJugando] = useState(false);

  const RONDAS = 8;

  function nuevaRonda() {
    const r = banco[Math.floor(Math.random() * banco.length)];
    setRonda(r);
  }

  function empezar() {
    setPuntos(0); setRacha(0); setIdx(1); setJugando(true);
    nuevaRonda();
    sfx.clic();
  }

  function elegir(i) {
    if (!jugando) return;
    if (i === ronda[2]) {
      const nr = racha + 1;
      const np = puntos + 100 + Math.min(50, nr * 10);
      setRacha(nr); setPuntos(np);
      sfx.bien();
    } else {
      setRacha(0);
      sfx.mal();
    }
    if (idx >= RONDAS) {
      setJugando(false);
      registrarPunt(puntos + (i === ronda[2] ? 100 : 0), puntos >= 500 ? 1 : 0);
    } else {
      nuevaRonda();
      setIdx(idx + 1);
    }
  }

  return (
    <GameShell titulo={titulo} emoji={emoji}
      descripcion="Completa el refrán · 8 rondas · cultura popular."
      tira={tira} iconoFondo={iconoFondo}>
      <div className="fila-botones" style={{ marginTop: 0 }}>
        <span className="chip">Refrán: <b>{jugando ? `${idx}/${RONDAS}` : "—"}</b></span>
        <span className="chip">Puntos: <b>{puntos}</b></span>
        <span className="chip">🔥 <b>{racha}</b></span>
      </div>
      {!jugando && idx === 0 && (
        <div className="fila-botones"><button className="btn-principal" onClick={empezar}>▶ Empezar</button></div>
      )}
      {jugando && ronda && (
        <>
          <p style={{ textAlign: "center", fontSize: "1.25rem" }}>💬 <b>{ronda[0]} …{ronda[3] ? ` ${ronda[3]}` : ""}</b></p>
          <div style={{ display: "grid", gap: 8 }}>
            {ronda[1].map((op, i) => (
              <button key={i} className="btn-suave" style={{ padding: "12px" }} onClick={() => elegir(i)}>{op}</button>
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

const RF = (titulo, emoji, banco, tira, iconoFondo) => function Comp() {
  return <RefranBase titulo={titulo} emoji={emoji} banco={banco} tira={tira} iconoFondo={iconoFondo} />;
};

export const Refranes = RF("Completa el Refrán", "💬", [
  ["A caballo regalado…", ["no le mires el diente", "ponle herraduras", "dale de comer", "cámbialo por otro"], 0, ""],
  ["Más vale pájaro en mano…", ["que cien volando", "que dos en el nido", "que un avión", "que nada en el mar"], 0, ""],
  ["No dejes para mañana…", ["lo que puedas hacer hoy", "lo de ayer", "la siesta", "el desayuno"], 0, ""],
  ["Dime con quién andas…", ["y te diré quién eres", "y te invito", "y nos vamos", "y lo celebramos"], 0, ""],
  ["Ojos que no ven…", ["corazón que no siente", "boca que no habla", "oídos que no oyen", "pies que no andan"], 0, ""],
  ["Camarón que se duerme…", ["se lo lleva la corriente", "sueña bonito", "descansa bien", "nada mejor"], 0, ""],
  ["En boca cerrada…", ["no entran moscas", "no sale aire", "hay silencio", "todo bien"], 0, ""],
  ["Del dicho al hecho…", ["hay mucho trecho", "poco camino", "un paso", "nada grave"], 0, ""],
], "linear-gradient(135deg,#b45309,#f59e0b)", "linear-gradient(135deg,#b45309,#f59e0b)");

export const Dichos = RF("Dichos Populares", "🗣️", [
  ["A lo hecho…", ["pecho", "techo", "lecho", "derecho"], 0, ""],
  ["Quien madruga…", ["Dios lo ayuda", "duerme poco", "llega tarde", "se cansa"], 0, ""],
  ["Perro que ladra…", ["no muerde", "corre mucho", "come poco", "duerme fuera"], 0, ""],
  ["Donde hay humo…", ["hay fuego", "hay fiesta", "llueve", "hace frío"], 0, ""],
  ["Barriga llena…", ["corazón contento", "sueño profundo", "bolsillo vacío", "tarde larga"], 0, ""],
  ["El que siembra vientos…", ["recoge tempestades", "cosecha flores", "riega poco", "canta mejor"], 0, ""],
  ["A palabras necias…", ["oídos sordos", "boca cerrada", "mente abierta", "paso firme"], 0, ""],
  ["Quien todo lo quiere…", ["todo lo pierde", "nada comparte", "mucho trabaja", "poco duerme"], 0, ""],
], "linear-gradient(135deg,#78716c,#f59e0b)", "linear-gradient(135deg,#78716c,#f59e0b)");
