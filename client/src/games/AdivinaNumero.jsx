import { useState } from "react";
import GameShell, { useRegistro } from "../ui/GameShell";

export default function AdivinaNumero() {
  const { mensaje, tipo, registrarPunt } = useRegistro("Adivina el número");
  const [dif, setDif] = useState(2);
  const [juego, setJuego] = useState(null); // {secreto, rango, intentos, ultimaDist, fin, ganado}
  const [entrada, setEntrada] = useState("");
  const [pista, setPista] = useState("");

  const rangos = { 1: 50, 2: 100, 3: 1000 };
  const maxIntentos = { 1: 10, 2: 12, 3: 15 };

  function empezar() {
    setJuego({ secreto: Math.floor(Math.random() * rangos[dif]) + 1, rango: rangos[dif], intentos: 0, ultimaDist: null, fin: false });
    setPista("");
    setEntrada("");
  }

  function adivinar() {
    const n = parseInt(entrada, 10);
    if (!juego || juego.fin || isNaN(n)) return;
    if (n < 1 || n > juego.rango) { setPista(`El número debe estar entre 1 y ${juego.rango}.`); return; }
    const nuevoIntentos = juego.intentos + 1;
    if (n === juego.secreto) {
      const puntos = Math.max(100 - 10 * (nuevoIntentos - 1), 10);
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
      registrarPunt(0, 0);
      setJuego({ ...juego, intentos: nuevoIntentos, fin: true });
      setPista(`Se acabaron los ${maxIntentos[dif]} intentos. Era el ${juego.secreto}.`);
    } else {
      setJuego({ ...juego, intentos: nuevoIntentos, ultimaDist: dist });
      setPista(nueva);
    }
    setEntrada("");
  }

  return (
    <GameShell titulo="Adivina el número" emoji="🔢"
      descripcion="Intenta adivinar el número secreto con pistas de mayor/menor y frío/caliente.">
      <div className="fila-botones" style={{ marginTop: 0 }}>
        {[1, 2, 3].map(d => (
          <button key={d} className={dif === d ? "btn-principal" : ""} onClick={() => { setDif(d); }}>{(d === 1 ? "Fácil" : d === 2 ? "Normal" : "Difícil")}</button>
        ))}
        <button className="btn-exito" onClick={empezar}>{juego ? "Reiniciar" : "Empezar"}</button>
      </div>
      {juego && (
        <div>
          <p>Pienso en un número entre <b>1 y {juego.rango}</b>. Tienes <b>{maxIntentos[dif]}</b> intentos.</p>
          {!juego.fin && (
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 8 }}>
              <input type="number" value={entrada} onChange={e => setEntrada(e.target.value)}
                onKeyDown={e => e.key === "Enter" && adivinar()} placeholder={`1–${juego.rango}`} style={{ width: 110 }} />
              <button className="btn-principal" onClick={adivinar}>Probar</button>
              <span className="chip">Intentos: <b>{juego.intentos}/{maxIntentos[dif]}</b></span>
            </div>
          )}
          {pista && <p className="aviso info" style={{ marginTop: 14 }}>{pista}</p>}
          {juego.fin && <div className={`mensaje-final ${juego.ganado ? (tipo === "record" ? "record" : "victoria") : "perdida"}`}>{mensaje}</div>}
        </div>
      )}
    </GameShell>
  );
}