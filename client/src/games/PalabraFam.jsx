import { useEffect, useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { sfx } from "../suite/sonido";

/* Palabras con pistas de colores: verde = bien, amarillo = otra posición. */
const DIFS = { "Fácil": { intentos: 8 }, "Normal": { intentos: 6 }, "Difícil": { intentos: 4 } };
function PalabraBase({ titulo, emoji, banco, longitud, diaria, tira, iconoFondo }) {
  const { mensaje, tipo, registrarPunt } = useRegistro(titulo);
  const [dif, setDif] = useState("Normal");
  const INTENTOS = DIFS[dif].intentos;
  const [objetivo, setObjetivo] = useState("");
  const [filas, setFilas] = useState([]);
  const [entrada, setEntrada] = useState("");
  const [jugando, setJugando] = useState(false);

  function elegirPalabra() {
    if (diaria) {
      const hoy = new Date().toISOString().slice(0, 10);
      let h = 0;
      for (const c of hoy) h = (h * 31 + c.charCodeAt(0)) >>> 0;
      return banco[h % banco.length];
    }
    return banco[Math.floor(Math.random() * banco.length)];
  }

  function empezar() {
    setObjetivo(elegirPalabra());
    setFilas([]); setEntrada(""); setJugando(true);
    sfx.clic();
  }

  function estados(intento) {
    // 3 = verde, 2 = amarilla, 1 = gris (con duplicadas bien resueltas)
    const res = Array(longitud).fill(1);
    const resto = {};
    for (let i = 0; i < longitud; i++) {
      if (intento[i] === objetivo[i]) res[i] = 3;
      else resto[objetivo[i]] = (resto[objetivo[i]] || 0) + 1;
    }
    for (let i = 0; i < longitud; i++) {
      if (res[i] !== 3 && resto[intento[i]] > 0) { res[i] = 2; resto[intento[i]]--; }
    }
    return res;
  }

  function probar() {
    if (!jugando) return;
    const t = entrada.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-ZÑ]/g, "");
    if (t.length !== longitud) return;
    const est = estados(t);
    const nf = [...filas, { t, est }];
    setFilas(nf);
    setEntrada("");
    if (t === objetivo) {
      setJugando(false);
      sfx.record();
      registrarPunt(600 - nf.length * 60, 1);
    } else if (nf.length >= INTENTOS) {
      setJugando(false);
      sfx.mal();
      registrarPunt(20, 0);
    } else sfx.clic();
  }

  useEffect(() => {
    const fn = (e) => {
      const tag = (e.target?.tagName || "").toUpperCase();
      const escribiendo = tag === "INPUT" || tag === "TEXTAREA";
      if ((e.key === "Enter" || e.key === " ") && !jugando && !escribiendo) {
        e.preventDefault();
        empezar();
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }); // eslint-disable-line react-hooks/exhaustive-deps

  const pct = Math.round((filas.length / INTENTOS) * 100);
  return (
    <GameShell titulo={titulo} emoji={emoji}
      descripcion={`Adivina la palabra de ${longitud} letras en ${INTENTOS} intentos${diaria ? " · cambia cada día" : ""}.`}
      tira={tira} iconoFondo={iconoFondo}
      stats={[
        { icono: "📝", etiqueta: "Intento", valor: `${Math.min(filas.length + (jugando ? 1 : 0), INTENTOS)}/${INTENTOS}` },
        { icono: "🔤", etiqueta: "Letras", valor: `${longitud}` },
        { icono: "📊", etiqueta: "Filas", valor: filas.length },
        { icono: "🎚️", etiqueta: "Dificultad", valor: dif },
      ]}
      resultado={{ mensaje, tipo }}
      ayuda={(
        <div>
          <p><b>Reglas:</b> adivina la palabra oculta de {longitud} letras en {INTENTOS} intentos. Verde = letra bien colocada, amarillo = existe pero en otro sitio.</p>
          <p><b>Controles:</b> escribe con el teclado físico o el móvil y pulsa <kbd>Enter</kbd> para probar · <kbd>Enter</kbd>/<kbd>Espacio</kbd> para empezar cuando no juegas.</p>
          <p><b>Puntuación:</b> ganas más cuantos menos intentos uses (600 menos 60 por fila). Si agotas los intentos solo sumas 20.</p>
          <p><b>Consejo:</b> empieza con una palabra con vocales variadas para descartar rápido.</p>
        </div>
      )}
      acciones={(
        <>
          {["Fácil", "Normal", "Difícil"].map(d => (
            <button key={d} className={dif === d ? "btn-principal" : "btn-suave"} disabled={jugando} onClick={() => { setDif(d); sfx.clic(); }}>{d}</button>
          ))}
          {!jugando && <button className="btn-principal" onClick={empezar}>{filas.length > 0 ? "↻ Otra vez" : "▶ Empezar"}</button>}
        </>
      )}>
      <div className="xp-bar fina" aria-hidden><div style={{ width: `${pct}%` }} /></div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "center", marginTop: 8 }}>
        {filas.map((f, r) => (
          <div key={r} style={{ display: "grid", gridTemplateColumns: `repeat(${longitud},44px)`, gap: 5 }}>
            {f.t.split("").map((l, c) => (
              <div key={c} style={{ width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.4rem", fontWeight: 800, borderRadius: 8,
                background: f.est[c] === 3 ? "var(--exito)" : f.est[c] === 2 ? "var(--aviso)" : "#3a3f55",
                color: f.est[c] === 1 ? "#a9aec5" : "white" }}>{l}</div>
            ))}
          </div>
        ))}
      </div>
      {jugando && (
        <div className="fila-botones">
          <input type="text" value={entrada} maxLength={longitud}
            onChange={e => setEntrada(e.target.value.toUpperCase().slice(0, longitud))}
            onKeyDown={e => { if (e.key === "Enter") probar(); }}
            placeholder={`${longitud} letras`} autoFocus style={{ fontSize: "1.3rem", letterSpacing: 3, textAlign: "center", width: 190, textTransform: "uppercase" }} />
          <button className="btn-principal" onClick={probar}>Probar ⏎</button>
        </div>
      )}
      {!jugando && filas.length > 0 && <p style={{ textAlign: "center" }}>Era: <b>{objetivo}</b></p>}
      <Resultado mensaje="" tipo="" />
    </GameShell>
  );
}

const B5 = ["PLAZA", "CARRO", "PERRO", "GATOS", "MESAS", "LIBRO", "NUBES", "DULCE", "MUNDO", "CALLE", "PLAYA", "MONTE", "SELVA", "FRUTA", "VERDE", "NIEVE", "LLAVE", "VELAS", "TIGRE", "ZORRO", "RATON", "FUEGO", "BARCO", "AVION"];
const B6 = ["PLAZAS", "SILLAS", "PUERTAS", "VENTANA", "CAMISAS", "ZAPATOS", "SOMBRAS", "CESPED", "JARDIN", "MERCADO", "PUEBLO", "BOSQUE", "AMIGOS", "ESCUELA", "MAESTRO", "DOCTOR", "BANCOS", "TIENDA"];
const B4 = ["GATO", "CASA", "MESA", "LUNA", "OSOS", "LOBO", "PATO", "SAPO", "RANA", "LAGO", "RIOS", "TREN", "DADO", "BOLA", "DEDO", "MANO", "PIES", "OJOS"];

export function PalabraDiaria() {
  return <PalabraBase titulo="Palabra Diaria" emoji="📅" banco={B5} longitud={5} diaria tira="linear-gradient(135deg,#22c55e,#15803d)" iconoFondo="linear-gradient(135deg,#22c55e,#15803d)" />;
}
export function Palabra6() {
  return <PalabraBase titulo="Palabra 6" emoji="🟨" banco={B6} longitud={6} tira="linear-gradient(135deg,#eab308,#a16207)" iconoFondo="linear-gradient(135deg,#eab308,#a16207)" />;
}
export function Palabra4() {
  return <PalabraBase titulo="Palabra 4" emoji="🟦" banco={B4} longitud={4} tira="linear-gradient(135deg,#38bdf8,#6366f1)" iconoFondo="linear-gradient(135deg,#38bdf8,#6366f1)" />;
}
