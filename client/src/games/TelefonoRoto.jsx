import { useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { sfx } from "../suite/sonido";

/* Teléfono Roto: memoriza la lista y escríbela en orden. Crece cada nivel. */
function TelefonoBase({ titulo, banco, frase, tira, iconoFondo }) {
  const { mensaje, tipo, registrarPunt } = useRegistro(titulo);
  const [lista, setLista] = useState([]);
  const [fase, setFase] = useState("inicio");
  const [entrada, setEntrada] = useState("");
  const [nivel, setNivel] = useState(3);
  const [vidas, setVidas] = useState(3);
  const [puntos, setPuntos] = useState(0);

  function nueva(n) {
    const l = [...banco].sort(() => Math.random() - 0.5).slice(0, n);
    setLista(l);
    setFase("mira");
    setTimeout(() => setFase("escribe"), 1500 + n * 900);
  }

  function empezar() {
    setNivel(3); setVidas(3); setPuntos(0); setEntrada("");
    nueva(3);
    sfx.clic();
  }

  function norm(s) {
    return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").split(",").map(x => x.trim()).filter(Boolean);
  }

  function comprobar() {
    const dadas = norm(entrada);
    const ok = dadas.length === lista.length && dadas.every((w, i) => norm(lista[i])[0] === w);
    if (ok) {
      const gana = nivel * 30;
      const np = puntos + gana;
      setPuntos(np);
      const nn = nivel + 1;
      setNivel(nn); setEntrada("");
      sfx.bien();
      nueva(nn);
    } else {
      const nv = vidas - 1;
      setVidas(nv); setEntrada("");
      sfx.mal();
      if (nv <= 0) {
        setFase("fin");
        registrarPunt(puntos, nivel >= 5 ? 1 : 0);
      } else {
        nueva(nivel);
      }
    }
  }

  return (
    <GameShell titulo={titulo} emoji="📞"
      descripcion={frase}
      tira={tira} iconoFondo={iconoFondo}>
      <div className="fila-botones">
        <span className="chip">Nivel: <b>{nivel}</b></span>
        <span className="chip">❤️ <b>{vidas}</b></span>
        <span className="chip">Puntos: <b>{puntos}</b></span>
      </div>
      {fase === "inicio" && (
        <div className="fila-botones"><button className="btn-principal" onClick={empezar}>▶ Empezar</button></div>
      )}
      {fase === "mira" && (
        <>
          <p style={{ textAlign: "center", fontSize: "1.5rem" }}>{lista.join(" · ")}</p>
          <p style={{ textAlign: "center", color: "var(--texto-suave)" }}>Memoriza en orden…</p>
        </>
      )}
      {fase === "escribe" && (
        <div className="fila-botones">
          <input type="text" value={entrada} onChange={e => setEntrada(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") comprobar(); }}
            placeholder="palabra1, palabra2, …" autoFocus style={{ minWidth: 240 }} />
          <button className="btn-principal" onClick={comprobar}>Comprobar ⏎</button>
        </div>
      )}
      <Resultado mensaje={mensaje} tipo={tipo} />
      {fase === "fin" && !mensaje && (
        <div className="fila-botones"><button className="btn-principal" onClick={empezar}>↻ Otra vez</button></div>
      )}
    </GameShell>
  );
}

const PALABRAS = ["perro", "gato", "casa", "sol", "luna", "pan", "flor", "mar", "tren", "libro", "mesa", "silla", "nube", "rio", "toro", "uva", "pino", "lago", "oso", "pez"];
const FRASES = ["el perro ladra", "sale el sol", "como pan", "leo un libro", "voy en tren", "miro la luna", "riego la flor", "nado en el mar", "subo al pino", "pesco un pez", "cruzo el rio", "abrazo al oso"];

export function TelefonoRoto() {
  return <TelefonoBase titulo="Teléfono Roto" banco={PALABRAS} frase="Memoriza las palabras en orden y escríbelas separadas por comas · 3 vidas." tira="linear-gradient(90deg,#0ea5e9,#a855f7)" iconoFondo="linear-gradient(135deg,#0ea5e9,#a855f7)" />;
}
export function TelefonoFrases() {
  return <TelefonoBase titulo="Teléfono de Frases" banco={FRASES} frase="Memoriza las frases mini en orden · 3 vidas." tira="linear-gradient(90deg,#a855f7,#ec4899)" iconoFondo="linear-gradient(135deg,#a855f7,#ec4899)" />;
}
