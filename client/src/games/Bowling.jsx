import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro } from "../ui/GameShell";
import { escribiendo } from "../suite/teclado";
import { sfx } from "../suite/sonido";

export default function Bowling() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Bolos Neón");
  const [fase, setFase] = useState("angulo"); // angulo -> potencia -> tiro -> fin
  const [angulo, setAngulo] = useState(50);
  const [potencia, setPotencia] = useState(50);
  const [dirA, setDirA] = useState(1);
  const [dirP, setDirP] = useState(1);
  const [tiros, setTiros] = useState([]);
  const [jugando, setJugando] = useState(false);
  const st = useRef({ fase, angulo, potencia, tiros });
  st.current = { fase, angulo, potencia, tiros };

  function empezar() {
    setTiros([]); st.current.tiros = [];
    setFase("angulo"); st.current.fase = "angulo";
    setJugando(true);
  }
  useEffect(() => {
    if (!jugando || fase === "fin") return;
    const id = setInterval(() => {
      if (st.current.fase === "angulo") setAngulo(a => { const n = a + 4 * dirA; if (n >= 100 || n <= 0) setDirA(d => -d); return Math.max(0, Math.min(100, n)); });
      if (st.current.fase === "potencia") setPotencia(p => { const n = p + 6 * dirP; if (n >= 100 || n <= 0) setDirP(d => -d); return Math.max(0, Math.min(100, n)); });
    }, 40);
    return () => clearInterval(id);
  }, [jugando, fase, dirA, dirP]);

  function fijar() {
    const s = st.current;
    if (!jugando) return;
    if (s.fase === "angulo") { st.current.fase = "potencia"; setFase("potencia"); sfx.clic(); }
    else if (s.fase === "potencia") {
      const centro = 1 - Math.abs(s.angulo - 50) / 50;
      const pot = s.potencia / 100;
      const esperado = Math.round(centro * pot * 10);
      const ruido = Math.floor(Math.random() * 3) - 1;
      const derribados = Math.max(0, Math.min(10, esperado + ruido));
      const nt = [...s.tiros, { angulo: s.angulo, potencia: s.potencia, pinos: derribados }];
      st.current = { ...s, tiros: nt, fase: nt.length >= 5 ? "fin" : "angulo" };
      setTiros(nt);
      if (derribados >= 8) sfx.record(); else if (derribados >= 4) sfx.bien(); else sfx.mal();
      if (nt.length >= 5) {
        setFase("fin"); setJugando(false);
        const total = nt.reduce((a, t) => a + t.pinos, 0);
        registrarPunt(total * 4, total >= 30 ? 1 : 0);
      } else setFase("angulo");
    } else if (s.fase === "fin" || !jugando) empezar();
  }
  const fijarRef = useRef(fijar); fijarRef.current = fijar;
  useEffect(() => {
    const fn = e => {
      if (escribiendo()) return;
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fijarRef.current(); }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  const total = tiros.reduce((a, t) => a + t.pinos, 0);
  return (
    <GameShell titulo="Bolos Neón" emoji="🎳" descripcion="ENTER/ESPACIO fija ángulo y potencia · 5 tiros.">
      <div className="fila-botones">
        <button className="btn-principal" onClick={empezar}>{tiros.length && !jugando ? "↻ Otra vez" : jugando ? "Reiniciar" : "▶ Jugar"}</button>
        <span className="chip">Tiro <b>{Math.min(tiros.length + 1, 5)}/5</b></span>
        <span className="chip">Pinos <b>{total}/50</b></span>
      </div>
      <div style={{ fontSize: "2rem", marginTop: 12 }}>🎳 {Array.from({ length: 10 }, (_, i) => <span key={i} style={{ opacity: i < total % 11 ? 0.25 : 1 }}>🎳</span>)}</div>
      {jugando && (
        <div style={{ marginTop: 12 }}>
          <div>Fase: <b>{fase === "angulo" ? "1️⃣ Ángulo (pulsa ENTER)" : "2️⃣ Potencia (pulsa ENTER)"}</b></div>
          <div style={{ marginTop: 6 }}>Ángulo</div>
          <div className="barra-record" style={{ width: 300 }}><div style={{ width: `${angulo}%` }} /></div>
          <div style={{ marginTop: 6 }}>Potencia</div>
          <div className="barra-record" style={{ width: 300 }}><div style={{ width: `${potencia}%`, background: "linear-gradient(90deg,#ef4444,#f59e0b)" }} /></div>
          <div className="fila-botones"><button className="btn-principal" onClick={fijar}>🎯 Fijar (ENTER)</button></div>
        </div>
      )}
      {tiros.length > 0 && (
        <div className="fila-botones">
          {tiros.map((t, i) => <span key={i} className="chip">#{i + 1} 🎳<b>{t.pinos}</b></span>)}
        </div>
      )}
      {fase === "fin" && <div className={`mensaje-final ${tipo}`}>🏁 {total}/50 pinos. {mensaje}</div>}
    </GameShell>
  );
}
