import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro } from "../ui/GameShell";
import { escribiendo } from "../suite/teclado";
import { sfx } from "../suite/sonido";

const DATOS = [
  ["Francia", "París"], ["España", "Madrid"], ["Italia", "Roma"], ["Alemania", "Berlín"], ["Portugal", "Lisboa"],
  ["México", "Ciudad de México"], ["Argentina", "Buenos Aires"], ["Japón", "Tokio"], ["China", "Pekín"], ["Egipto", "El Cairo"],
  ["Brasil", "Brasilia"], ["Canadá", "Ottawa"], ["Australia", "Canberra"], ["Rusia", "Moscú"], ["India", "Nueva Delhi"],
  ["Grecia", "Atenas"], ["Turquía", "Ankara"], ["Marruecos", "Rabat"], ["Perú", "Lima"], ["Chile", "Santiago"],
  ["Colombia", "Bogotá"], ["Cuba", "La Habana"], ["Noruega", "Oslo"], ["Suecia", "Estocolmo"], ["Finlandia", "Helsinki"],
];
function ronda() {
  const [pais, cap] = DATOS[Math.floor(Math.random() * DATOS.length)];
  const falsas = DATOS.filter(d => d[1] !== cap).sort(() => Math.random() - 0.5).slice(0, 3).map(d => d[1]);
  const ops = [...falsas, cap].sort(() => Math.random() - 0.5);
  return { pais, cap, ops };
}
export default function Capitales() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Capitales del Mundo");
  const [r, setR] = useState(ronda);
  const [puntos, setPuntos] = useState(0);
  const [racha, setRacha] = useState(0);
  const [n, setN] = useState(0);
  const [tiempo, setTiempo] = useState(60);
  const [jugando, setJugando] = useState(false);
  const st = useRef({ puntos: 0, n: 0, racha: 0 });
  st.current = { puntos, n, racha };

  function empezar() {
    setR(ronda()); setPuntos(0); st.current.puntos = 0;
    setRacha(0); st.current.racha = 0; setN(0); st.current.n = 0;
    setTiempo(60); setJugando(true);
  }
  useEffect(() => {
    if (!jugando) return;
    if (tiempo <= 0 || st.current.n >= 15) {
      setJugando(false);
      registrarPunt(st.current.puntos, st.current.puntos >= 100 ? 1 : 0);
      sfx.record();
      return;
    }
    const id = setTimeout(() => setTiempo(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [jugando, tiempo, registrarPunt]);
  function elegir(cap) {
    if (!jugando) return;
    const ok = cap === r.cap;
    if (ok) {
      const nr = st.current.racha + 1;
      st.current.racha = nr; setRacha(nr);
      st.current.puntos += 10 + Math.min(10, nr * 2); setPuntos(st.current.puntos);
      sfx.bien();
    } else {
      st.current.racha = 0; setRacha(0);
      st.current.puntos = Math.max(0, st.current.puntos - 3); setPuntos(st.current.puntos);
      sfx.mal();
    }
    st.current.n += 1; setN(st.current.n);
    setR(ronda());
  }
  const elegirRef = useRef(elegir); elegirRef.current = elegir;
  useEffect(() => {
    const fn = e => {
      if (escribiendo() || !jugando) return;
      const k = e.key.toLowerCase();
      const m = { 1: 0, 2: 1, 3: 2, 4: 3, a: 0, b: 1, c: 2, d: 3 };
      if (m[k] != null && r.ops[m[k]]) elegirRef.current(r.ops[m[k]]);
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jugando, r]);
  return (
    <GameShell titulo="Capitales del Mundo" emoji="🌍" descripcion="1-4 o A-D · 15 países o 60s · racha = bonus.">
      <div className="fila-botones" style={{ marginTop: 0 }}>
        <button className="btn-principal" onClick={empezar}>{jugando ? "Reiniciar" : "▶ Jugar"}</button>
        <span className="chip">Puntos <b>{puntos}</b></span>
        <span className="chip">🔥 <b>×{racha}</b></span>
        <span className="chip">📝 <b>{n}/15</b></span>
        <span className="chip">⏱️ <b>{tiempo}s</b></span>
      </div>
      {jugando && (
        <div style={{ marginTop: 14 }}>
          <h3 style={{ margin: "6px 0 10px" }}>¿Capital de <b>{r.pais}</b>?</h3>
          {r.ops.map((op, i) => (
            <button key={op} className="trivia-op" onClick={() => elegir(op)}>{String.fromCharCode(65 + i)}) {op}</button>
          ))}
        </div>
      )}
      {!jugando && mensaje && <div className={`mensaje-final ${tipo}`}>{mensaje}</div>}
    </GameShell>
  );
}
