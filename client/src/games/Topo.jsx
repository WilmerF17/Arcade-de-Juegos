import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { escribiendo } from "../suite/teclado";
import { sfx } from "../suite/sonido";

export default function Topo() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Toca al Topo");
  const [huecos] = useState(9);
  const [topo, setTopo] = useState(-1);
  const [dorado, setDorado] = useState(false);
  const [puntos, setPuntos] = useState(0);
  const [tiempo, setTiempo] = useState(30);
  const [jugando, setJugando] = useState(false);
  const [record, setRecord] = useState(() => Number(localStorage.getItem("arcade-topo") || 0));
  const st = useRef({ puntos: 0, jugando: false, topo: -1 });
  st.current.puntos = puntos; st.current.jugando = jugando; st.current.topo = topo;

  function empezar() {
    setPuntos(0); st.current.puntos = 0;
    setTiempo(30); setTopo(-1);
    setJugando(true); st.current.jugando = true;
    sfx.clic();
  }

  useEffect(() => {
    if (!jugando) return;
    if (tiempo <= 0) {
      setJugando(false); st.current.jugando = false;
      setTopo(-1);
      const p = st.current.puntos;
      if (p > record) { setRecord(p); localStorage.setItem("arcade-topo", String(p)); }
      registrarPunt(p, p >= 150 ? 1 : 0);
      sfx.record();
      return;
    }
    const id = setTimeout(() => setTiempo(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [jugando, tiempo, record, registrarPunt]);

  useEffect(() => {
    if (!jugando) return;
    const id = setInterval(() => {
      const n = Math.floor(Math.random() * huecos);
      setTopo(n);
      st.current.topo = n;
      setDorado(Math.random() < 0.15);
    }, 650);
    return () => clearInterval(id);
  }, [jugando, huecos]);

  function golpear(i) {
    if (!st.current.jugando) return;
    if (i === st.current.topo) {
      const g = dorado ? 30 : 10;
      st.current.puntos += g;
      setPuntos(st.current.puntos);
      if (g >= 30) sfx.record(); else sfx.bien();
      setTopo(-1); st.current.topo = -1;
    } else {
      st.current.puntos = Math.max(0, st.current.puntos - 3);
      setPuntos(st.current.puntos);
      sfx.mal();
    }
  }
  const golpearRef = useRef(golpear); golpearRef.current = golpear;

  useEffect(() => {
    const fn = e => {
      if (escribiendo()) return;
      if (e.key >= "1" && e.key <= "9") golpearRef.current(Number(e.key) - 1);
      else if (e.key === "Enter" && !st.current.jugando) empezar();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dorado]);

  return (
    <GameShell titulo="Toca al Topo" emoji="🐹" descripcion="Clic o teclas 1-9 · 30 segundos · el dorado vale 30.">
      <div className="fila-botones">
        <button className="btn-principal" onClick={empezar}>{jugando ? "Reiniciar" : tiempo < 30 ? "↻ Otra vez" : "▶ Jugar"}</button>
        <span className="chip">Puntos <b>{puntos}</b></span>
        <span className="chip">⏱️ <b>{tiempo}s</b></span>
        <span className="chip">🏆 <b>{record}</b></span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,90px)", gap: 10, marginTop: 16, width: "max-content" }}>
        {Array.from({ length: huecos }, (_, i) => (
          <div key={i} onClick={() => golpear(i)} className="celda clickeable"
            style={{ width: 90, height: 90, fontSize: "2.4rem", background: i === topo ? (dorado ? "rgba(245,158,11,.3)" : "rgba(34,197,94,.25)") : undefined, outline: i === topo ? "2px solid var(--exito)" : undefined }}>
            {i === topo ? (dorado ? "🌟" : "🐹") : "🕳️"}
            <small style={{ position: "absolute", fontSize: ".6rem", color: "var(--texto-suave)" }}>{i + 1}</small>
          </div>
        ))}
      </div>
      <Resultado mensaje={mensaje} tipo={tipo} />
      <p className="aviso-ia">💡 Teclado: <b>1-9</b> golpea · no falles (-3).</p>
    </GameShell>
  );
}
