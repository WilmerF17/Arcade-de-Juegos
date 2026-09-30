import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { sfx } from "../suite/sonido";
import { escribiendo } from "../suite/teclado";

/* Teléfono Roto: memoriza la lista y escríbela en orden. Crece cada nivel. */
const CONF_DIF = { 1: { vidas: 4, nombre: "Fácil" }, 2: { vidas: 3, nombre: "Normal" }, 3: { vidas: 2, nombre: "Difícil" } };
function TelefonoBase({ titulo, banco, frase, tira, iconoFondo }) {
  const { mensaje, tipo, registrarPunt } = useRegistro(titulo);
  const [lista, setLista] = useState([]);
  const [fase, setFase] = useState("inicio");
  const [entrada, setEntrada] = useState("");
  const [nivel, setNivel] = useState(3);
  const [dif, setDif] = useState(2);
  const [vidas, setVidas] = useState(CONF_DIF[2].vidas);
  const [puntos, setPuntos] = useState(0);
  const [mejorNivel, setMejorNivel] = useState(3);
  const timer = useRef(null);
  const faseRef = useRef("inicio");
  faseRef.current = fase;
  const comprobarRef = useRef(null);

  function nueva(n) {
    const l = [...banco].sort(() => Math.random() - 0.5).slice(0, n);
    setLista(l);
    setFase("mira");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setFase("escribe"), 1500 + n * 900);
  }
  useEffect(() => () => clearTimeout(timer.current), []);

  function empezar() {
    setNivel(3); setVidas(CONF_DIF[dif].vidas); setPuntos(0); setEntrada("");
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
      setMejorNivel(m => Math.max(m, nn));
      sfx.bien();
      nueva(nn);
    } else {
      const nv = vidas - 1;
      setVidas(nv); setEntrada("");
      sfx.mal();
      if (nv <= 0) {
        setFase("fin");
        clearTimeout(timer.current);
        registrarPunt(puntos, nivel >= 5 ? 1 : 0);
      } else {
        nueva(nivel);
      }
    }
  }
  comprobarRef.current = comprobar;

  useEffect(() => {
    const fn = e => {
      if (escribiendo()) return;
      if ((e.key === "Enter" || e.key === " ") && (faseRef.current === "inicio" || faseRef.current === "fin")) {
        e.preventDefault();
        empezar();
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dif, banco]);

  const pct = Math.min(100, Math.round(((nivel - 3) / 7) * 100));

  return (
    <GameShell titulo={titulo} emoji="📞"
      descripcion={frase}
      tira={tira} iconoFondo={iconoFondo}
      stats={[
        { icono: "📶", etiqueta: "Nivel", valor: nivel },
        { icono: "❤️", etiqueta: "Vidas", valor: vidas },
        { icono: "⭐", etiqueta: "Puntos", valor: puntos },
        { icono: "🎯", etiqueta: "Dificultad", valor: CONF_DIF[dif].nombre },
      ]}
      acciones={fase === "inicio" || fase === "fin" ? <button className="btn-principal" onClick={empezar}>{fase === "inicio" ? "▶ Empezar" : "↻ Otra vez"}</button> : null}
      ayuda={<>
        <span>Memoriza la lista en orden y escríbela separada por comas: cada nivel añade <b>una palabra</b> y suma <b>nivel × 30</b>.</span>
        <span>Controles: escribe y confirma con <kbd>ENTER</kbd> o Comprobar. <kbd>ENTER</kbd> o <kbd>ESPACIO</kbd> empieza.</span>
        <span>Puntuación: llegar a <b>nivel 5+</b> cuenta como victoria. Dificultad: <b>Fácil 4 vidas</b>, <b>Normal 3</b>, <b>Difícil 2</b>.</span>
        <span>Consejo: inventa una frase que enlace las palabras en orden.</span>
      </>}>
      {fase === "inicio" && (
        <div className="fila-botones" role="group" aria-label="Dificultad">
          {[1, 2, 3].map(d => (
            <button key={d} className={dif === d ? "btn-principal" : "btn-suave"} onClick={() => { setDif(d); setVidas(CONF_DIF[d].vidas); sfx.clic(); }}>{d === 1 ? "🟢 Fácil" : d === 2 ? "🟡 Normal" : "🔴 Difícil"}</button>
          ))}
        </div>
      )}
      <div className="xp-bar fina" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Progreso de nivel"><div style={{ width: `${pct}%` }} /></div>
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
          <button className="btn-principal" onClick={() => { sfx.clic(); comprobar(); }}>Comprobar ⏎</button>
        </div>
      )}
      {mejorNivel > 3 && <p style={{ textAlign: "center", color: "var(--texto-suave)" }}>🏆 Mejor nivel: <b>{mejorNivel}</b></p>}
      <Resultado mensaje={mensaje} tipo={tipo} />
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
