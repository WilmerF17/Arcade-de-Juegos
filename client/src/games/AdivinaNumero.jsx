import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { sfx } from "../suite/sonido";
import { escribiendo } from "../suite/teclado";

export default function AdivinaNumero() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Adivina el número");
  const [dif, setDif] = useState(2);
  const [juego, setJuego] = useState(null); // {secreto, rango, intentos, ultimaDist, fin, ganado}
  const [entrada, setEntrada] = useState("");
  const [pista, setPista] = useState("");
  const juegoRef = useRef(null);
  juegoRef.current = juego;

  const rangos = { 1: 50, 2: 100, 3: 1000 };
  const maxIntentos = { 1: 10, 2: 12, 3: 15 };
  const nombreDif = dif === 1 ? "Fácil" : dif === 2 ? "Normal" : "Difícil";

  function empezar() {
    sfx.clic();
    setJuego({ secreto: Math.floor(Math.random() * rangos[dif]) + 1, rango: rangos[dif], intentos: 0, ultimaDist: null, fin: false });
    setPista("");
    setEntrada("");
  }

  function cambiarDif(d) {
    sfx.clic();
    setDif(d);
    setJuego(null);
    setPista("");
    setEntrada("");
  }

  function adivinar() {
    const n = parseInt(entrada, 10);
    if (!juego || juego.fin || isNaN(n)) return;
    if (n < 1 || n > juego.rango) { setPista(`El número debe estar entre 1 y ${juego.rango}.`); sfx.mal(); return; }
    const nuevoIntentos = juego.intentos + 1;
    if (n === juego.secreto) {
      const puntos = Math.max(100 - 10 * (nuevoIntentos - 1), 10);
      sfx.bien();
      sfx.record();
      registrarPunt(puntos, 1);
      setJuego({ ...juego, intentos: nuevoIntentos, fin: true, ganado: true });
      setPista(`¡ACERTASTE! Era el ${juego.secreto} en ${nuevoIntentos} intentos → +${puntos} pts`);
      return;
    }
    const dist = Math.abs(n - juego.secreto);
    let nueva = "";
    if (juego.ultimaDist != null) nueva = dist < juego.ultimaDist ? "🔥 ¡Más caliente!" : "❄️ Más frío...";
    if (dist <= juego.rango * 0.03) nueva += " · Estás muy muy cerca.";
    else if (dist <= juego.rango * 0.1) nueva += " · Estás cerca.";
    else nueva += ` · Está ${juego.secreto > n ? "MAYOR" : "MENOR"} que ${n}.`;
    if (nuevoIntentos >= maxIntentos[dif]) {
      sfx.mal();
      registrarPunt(0, 0);
      setJuego({ ...juego, intentos: nuevoIntentos, fin: true });
      setPista(`Se acabaron los ${maxIntentos[dif]} intentos. Era el ${juego.secreto}.`);
    } else {
      if (dist < (juego.ultimaDist ?? Infinity)) sfx.clic();
      else sfx.mal();
      setJuego({ ...juego, intentos: nuevoIntentos, ultimaDist: dist });
      setPista(nueva);
    }
    setEntrada("");
  }

  const adivinarRef = useRef(adivinar);
  adivinarRef.current = adivinar;
  const empezarRef = useRef(empezar);
  empezarRef.current = empezar;

  useEffect(() => {
    const fn = e => {
      if (escribiendo()) return;
      if ((e.key === "Enter" || e.key === " ") && !juegoRef.current) {
        e.preventDefault();
        empezarRef.current();
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  const pct = juego ? Math.round((juego.intentos / maxIntentos[dif]) * 100) : 0;

  return (
    <GameShell titulo="Adivina el número" emoji="🔢"
      descripcion="Intenta adivinar el número secreto con pistas de mayor/menor y frío/caliente."
      stats={[
        { icono: "🎯", etiqueta: "Intentos", valor: juego ? `${juego.intentos}/${maxIntentos[dif]}` : `0/${maxIntentos[dif]}` },
        { icono: "🔢", etiqueta: "Rango", valor: `1–${rangos[dif]}` },
        { icono: "📝", etiqueta: "Dificultad", valor: nombreDif },
      ]}
      acciones={<button className="btn-exito" onClick={empezar}>{juego ? "↻ Reiniciar" : "▶ Empezar"}</button>}
      resultado={juego?.fin ? { mensaje, tipo } : null}
      ayuda={<>
        <span>Adivina el secreto entre <b>1</b> y el tope de tu dificultad. Cada intento te dice si vas <b>más caliente o más frío</b> y si el secreto es mayor o menor.</span>
        <span>Controles: escribe el número y pulsa <kbd>ENTER</kbd> o Probar; <kbd>ENTER</kbd> o <kbd>ESPACIO</kbd> empieza la partida.</span>
        <span>Puntuación: acertar pronto da hasta <b>100 puntos</b> y victoria; agotar intentos da 0. Dificultad: <b>Fácil 1–50 (10)</b>, <b>Normal 1–100 (12)</b>, <b>Difícil 1–1000 (15)</b>.</span>
        <span>Consejo: combina la pista mayor/menor con la de caliente/frío para acotar rápido.</span>
      </>}>
      <div className="fila-botones" role="group" aria-label="Dificultad">
        {[1, 2, 3].map(d => (
          <button key={d} className={dif === d ? "btn-principal" : "btn-suave"} onClick={() => cambiarDif(d)}>{(d === 1 ? "🟢 Fácil" : d === 2 ? "🟡 Normal" : "🔴 Difícil")}</button>
        ))}
      </div>
      <div className="xp-bar fina" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Intentos usados"><div style={{ width: `${pct}%` }} /></div>
      {juego && (
        <div>
          <p>Pienso en un número entre <b>1 y {juego.rango}</b>. Tienes <b>{maxIntentos[dif]}</b> intentos.</p>
          {!juego.fin && (
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 8 }}>
              <input type="number" value={entrada} onChange={e => setEntrada(e.target.value)}
                onKeyDown={e => e.key === "Enter" && adivinar()} placeholder={`1–${juego.rango}`} style={{ width: 110 }} />
              <button className="btn-principal" onClick={adivinar}>Probar ⏎</button>
              <span className="chip">Intentos: <b>{juego.intentos}/{maxIntentos[dif]}</b></span>
            </div>
          )}
          {pista && <p className="aviso info" style={{ marginTop: 14 }}>{pista}</p>}
          {juego.fin && mensaje && <Resultado mensaje={mensaje} tipo={tipo} />}
          {juego.fin && !mensaje && <div className={`mensaje-final ${juego.ganado ? "victoria" : "perdida"}`}>{pista}</div>}
        </div>
      )}
    </GameShell>
  );
}
