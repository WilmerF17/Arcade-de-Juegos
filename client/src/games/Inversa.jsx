import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro } from "../ui/GameShell";
import { sfx } from "../suite/sonido";

/* Secuencia Inversa: memoriza los dígitos y escríbelos al revés. 3 vidas. */
export default function Inversa() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Secuencia Inversa");
  const [nivel, setNivel] = useState(3);
  const [secuencia, setSecuencia] = useState([]);
  const [fase, setFase] = useState("inicio"); // inicio | memoriza | escribe | fin
  const [entrada, setEntrada] = useState("");
  const [vidas, setVidas] = useState(3);
  const [puntos, setPuntos] = useState(0);
  const st = useRef({ nivel: 3, vidas: 3, puntos: 0, secuencia: [] });
  const timer = useRef(null);

  function nuevaSecuencia(n) {
    const s = Array.from({ length: n }, () => Math.floor(Math.random() * 10));
    st.current.secuencia = s;
    setSecuencia(s);
    setFase("memoriza");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setFase("escribe"), 1200 + n * 700);
  }

  function empezar() {
    st.current = { nivel: 3, vidas: 3, puntos: 0, secuencia: [] };
    setNivel(3); setVidas(3); setPuntos(0); setEntrada("");
    nuevaSecuencia(3);
    sfx.clic();
  }

  useEffect(() => () => clearTimeout(timer.current), []);

  function comprobar() {
    const esperado = [...st.current.secuencia].reverse().join("");
    if (entrada.trim() === esperado) {
      const gana = st.current.nivel * 20;
      st.current.puntos += gana;
      const nn = st.current.nivel + 1;
      st.current.nivel = nn;
      setPuntos(st.current.puntos); setNivel(nn); setEntrada("");
      sfx.bien();
      nuevaSecuencia(nn);
    } else {
      const nv = st.current.vidas - 1;
      st.current.vidas = nv;
      setVidas(nv); setEntrada("");
      sfx.mal();
      if (nv <= 0) {
        setFase("fin");
        registrarPunt(st.current.puntos, st.current.nivel >= 6 ? 1 : 0);
      } else {
        nuevaSecuencia(st.current.nivel);
      }
    }
  }

  return (
    <GameShell titulo="Secuencia Inversa" emoji="🔄"
      descripcion="Memoriza los dígitos y escríbelos al revés · 3 vidas · crece cada nivel."
      tira="linear-gradient(90deg,#a855f7,#22d3ee)" iconoFondo="linear-gradient(135deg,#a855f7,#22d3ee)">
      <div className="fila-botones" style={{ marginTop: 0 }}>
        <span className="chip">Nivel: <b>{nivel} dígitos</b></span>
        <span className="chip">❤️ <b>{vidas}</b></span>
        <span className="chip">Puntos: <b>{puntos}</b></span>
      </div>
      {fase === "inicio" && (
        <div className="fila-botones"><button className="btn-principal" onClick={empezar}>▶ Empezar</button></div>
      )}
      {fase === "memoriza" && (
        <p style={{ textAlign: "center", fontSize: "2.2rem", letterSpacing: 8, margin: "14px 0" }}>
          {secuencia.join(" ")}
        </p>
      )}
      {fase === "memoriza" && <p style={{ textAlign: "center", color: "var(--texto-suave)" }}>Memoriza… ahora los escribirás al revés</p>}
      {fase === "escribe" && (
        <div className="fila-botones">
          <input type="text" inputMode="numeric" value={entrada} maxLength={12}
            onChange={e => setEntrada(e.target.value.replace(/\D/g, ""))}
            onKeyDown={e => { if (e.key === "Enter") comprobar(); }}
            placeholder="Al revés…" autoFocus style={{ fontSize: "1.4rem", letterSpacing: 4, textAlign: "center", width: 220 }} />
          <button className="btn-principal" onClick={comprobar}>Comprobar ⏎</button>
        </div>
      )}
      {mensaje && <div className={`mensaje-final ${tipo}`}>{mensaje}</div>}
      {fase === "fin" && !mensaje && (
        <div className="fila-botones"><button className="btn-principal" onClick={empezar}>↻ Jugar otra vez</button></div>
      )}
    </GameShell>
  );
}
