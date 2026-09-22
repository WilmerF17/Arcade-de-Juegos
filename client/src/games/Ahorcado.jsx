import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro } from "../ui/GameShell";
import { escribiendo } from "../suite/teclado";

const PALABRAS = {
  animales: ["elefante", "murcielago", "tortuga", "jirafa", "rinoceronte", "mariposa", "delfin", "canguro", "aguilucho"],
  objetos: ["computadora", "teclado", "ventana", "telescopio", "paraguas", "guitarra", "microondas", "sombrero"],
  naturaleza: ["montana", "tormenta", "volcan", "cascada", "amanecer", "desierto", "bosque", "arcoiris"],
  general: ["gato", "perro", "nube", "arbol", "luna", "nieve", "tren", "puerta", "piano", "avion"],
};

const maxFallos = 6;

export default function Ahorcado() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Ahorcado");
  const [juego, setJuego] = useState(null);
  const [letra, setLetra] = useState("");
  const [usadas, setUsadas] = useState([]);
  const [pista, setPista] = useState("");
  const juegoRef = useRef(null);
  const usadasRef = useRef([]);
  juegoRef.current = juego;
  usadasRef.current = usadas;

  function empezar() {
    const cats = Object.keys(PALABRAS);
    const cat = cats[Math.floor(Math.random() * cats.length)];
    const lista = PALABRAS[cat];
    const secreto = lista[Math.floor(Math.random() * lista.length)];
    const j = { secreto, cat, fallos: 0, fin: false, ganado: false };
    juegoRef.current = j;
    usadasRef.current = [];
    setJuego(j);
    setUsadas([]);
    setPista("");
    setLetra("");
  }

  function probarLetra(lRaw) {
    const j = juegoRef.current;
    const usadasAhora = usadasRef.current;
    const l = (lRaw || "").replace(/ñ/g, "n").toLowerCase().slice(0, 1);
    if (!j || j.fin || !l || !/[a-z]/.test(l)) return;
    if (usadasAhora.includes(l)) return;
    if (j.secreto.includes(l)) {
      const nuevas = [...usadasAhora, l];
      usadasRef.current = nuevas;
      setUsadas(nuevas);
      const todas = j.secreto.split("").every(li => nuevas.includes(li.replace(/ñ/g, "n")));
      if (todas) {
        const p = Math.max(50 - 5 * j.fallos, 10);
        registrarPunt(p, 1);
        const fin = { ...j, fin: true, ganado: true };
        juegoRef.current = fin;
        setJuego(fin);
        setPista(`¡GANASTE! La palabra era ${j.secreto}. +${p} pts`);
      } else {
        setPista("¡Bien! La letra está en la palabra.");
      }
    } else {
      const nuevas = [...usadasAhora, l];
      usadasRef.current = nuevas;
      setUsadas(nuevas);
      setPista("La letra no está. ❌");
      const nj = { ...j, fallos: j.fallos + 1 };
      if (nj.fallos >= maxFallos) {
        nj.fin = true;
        juegoRef.current = nj;
        setJuego(nj);
        registrarPunt(0, 0);
      } else {
        juegoRef.current = nj;
        setJuego(nj);
      }
    }
  }

  function jugar() {
    const v = letra.trim().toLowerCase().replace(/ñ/g, "n");
    if (!v) return;
    setLetra("");
    if (v.length > 1) {
      const j = juegoRef.current;
      if (!j || j.fin) return;
      if (v === j.secreto) {
        const p = Math.max(50 - 5 * j.fallos, 10);
        registrarPunt(p, 1);
        const fin = { ...j, fin: true, ganado: true };
        juegoRef.current = fin;
        setJuego(fin);
        setPista(`¡ADIVINASTE LA PALABRA! +${p} pts`);
      } else {
        setPista("No es esa palabra.");
        const nj = { ...j, fallos: j.fallos + 1 };
        if (nj.fallos >= maxFallos) {
          nj.fin = true;
          juegoRef.current = nj;
          setJuego(nj);
          registrarPunt(0, 0);
        } else {
          juegoRef.current = nj;
          setJuego(nj);
        }
      }
      return;
    }
    probarLetra(v);
  }

  const probarRef = useRef(probarLetra);
  probarRef.current = probarLetra;

  // Teclado físico directo (cuando no se escribe en el input)
  useEffect(() => {
    const fn = e => {
      if (escribiendo() || !juegoRef.current || juegoRef.current.fin) return;
      if (/^[a-zA-ZñÑ]$/.test(e.key)) probarRef.current(e.key);
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dibujos = ["", "   ___", "   ___ \n     |", "   ___ \n     |\n     O", "   ___ \n     |\n     O\n    /|\\", "   ___ \n     |\n     O\n    /|\\\n    /", "   ___ \n     |\n     O\n    /|\\\n    / \\"];
  const fallos = juego?.fallos ?? 0;

  return (
    <GameShell titulo="Ahorcado" emoji="💀"
      descripcion="Teclado físico o en pantalla · adivina antes de 6 fallos.">
      <div className="fila-botones">
        <button className="btn-exito" onClick={empezar}>{juego ? "Reiniciar" : "Empezar"}</button>
      </div>
      {juego && (
        <div style={{ display: "flex", gap: 26, flexWrap: "wrap" }}>
          <pre style={{ fontSize: "1.05rem", color: "var(--peligro)", fontWeight: 700 }}>{dibujos[juego.fin && !juego.ganado ? 6 : fallos]}</pre>
          <div>
            <p>Categoría: <b>{juego.cat}</b> · Fallos <b style={{ color: "var(--peligro)" }}>{fallos}</b>/{maxFallos}</p>
            <p style={{ letterSpacing: 6, fontSize: "1.8rem", fontWeight: 800 }}>
              {juego.secreto.split("").map((l, i) => (juego.fin ? l : usadas.includes(l.replace(/ñ/g, "n")) ? l : "_")).join(" ")}
            </p>
            {!juego.fin && (
              <div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8 }}>
                  <input type="text" value={letra} onChange={e => setLetra(e.target.value.slice(0, 20))}
                    onKeyDown={e => e.key === "Enter" && jugar()} placeholder="letra o palabra" style={{ width: 150 }} />
                  <button className="btn-principal" onClick={jugar}>Probar</button>
                </div>
                <div className="teclado">
                  {["qwertyuiop", "asdfghjklñ", "zxcvbnm"].map((fila, i) => (
                    <div className="fila" key={i}>
                      {fila.split("").map(l => (
                        <button key={l} className="tecla" onClick={() => probarLetra(l)}
                          disabled={usadas.includes(l.replace(/ñ/g, "n"))}>{l}</button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {pista && <p style={{ marginTop: 14 }}>{pista}</p>}
            {juego.fin && <div className={`mensaje-final ${tipo}`}>{juego.ganado ? mensaje : `Era "${juego.secreto}". ${mensaje}`}</div>}
          </div>
        </div>
      )}
    </GameShell>
  );
}
