import { useState } from "react";
import { registrar } from "../api";
import { cargarProgreso, sumarPartida } from "../suite/progreso";
import { sfx } from "../suite/sonido";
import { Icono, iconoDeTitulo } from "./Iconos";

/** Lee el id del juego activo desde la URL (#juego) para dar XP al juego correcto. */
function juegoIdActual(nombreJuego) {
  const h = window.location.hash.replace("#", "");
  return h || nombreJuego;
}

/**
 * Gancho compartido: registra en el servidor + progresión local (XP/nivel/logros)
 * + sonidos + flash RGB en récord.
 */
export function useRegistro(nombreJuego, juegoId = null) {
  const [estado, setEstado] = useState({
    stats: null,
    mensaje: "",
    tipo: "",
    xp: null, // {xpGanado, subioNivel, nuevosLogros}
  });

  const registrarPunt = async (puntos, ganadas = 0, jugadas = 1) => {
    const id = juegoId || juegoIdActual(nombreJuego);
    let s = null;
    try {
      s = await registrar(nombreJuego, puntos, ganadas, jugadas);
    } catch (e) {
      setEstado(prev => ({ ...prev, mensaje: "Sin conexión al ranking (offline o servidor apagado): tu XP y nivel se guardan igual en este dispositivo. ✅" }));
    }

    // Progresión local (siempre, aunque falle el servidor)
    let extra = null;
    try {
      const prev = cargarProgreso();
      const esDesafio = prev.desafio?.juego === id && !prev.desafio?.hecho;
      const r = sumarPartida(prev, { juegoId: id, puntos, victoria: ganadas > 0, esDesafio });
      extra = { xpGanado: r.xpGanado, subioNivel: r.subioNivel, nuevosLogros: r.nuevosLogros };
      window.dispatchEvent(new CustomEvent("arcade-progreso", { detail: r.prog }));
    } catch { /* noop */ }

    const esRecord = !!s?.nuevoRecord;
    if (esRecord) {
      sfx.record();
      document.body.classList.remove("flash-record");
      void document.body.offsetWidth;
      document.body.classList.add("flash-record");
      setTimeout(() => document.body.classList.remove("flash-record"), 1300);
    } else if (ganadas) {
      sfx.bien();
    }

    const trozoXp = extra ? ` · +${extra.xpGanado} XP⚡${extra.subioNivel ? " · ¡NIVEL UP! 🎆" : ""}` : "";
    const trozoLogros = extra?.nuevosLogros?.length
      ? ` · 🏅 ${extra.nuevosLogros.map(l => l.nombre).join(", ")}` : "";
    setEstado({
      stats: s,
      mensaje: `${nombreJuego}: ${puntos} puntos${ganadas ? " · victoria ✅" : ""}${s?.nuevoRecord ? " · ¡NUEVO RÉCORD! 🏆" : ""}${trozoXp}${trozoLogros}`,
      tipo: esRecord ? "record" : ganadas ? "victoria" : "derrota",
      xp: extra,
    });
    return s;
  };

  return { ...estado, registrarPunt };
}

/** Encabezado + zona de contenido común para cada juego, con tira de color temática. */
export default function GameShell({ titulo, emoji, descripcion, children, tira, iconoFondo }) {
  const icon = iconoDeTitulo(titulo);
  return (
    <div className="gameshell" style={tira ? { "--tira": tira } : undefined}>
      <div className="shell-head">
        <div className="shell-icono" style={{ background: iconoFondo || "linear-gradient(135deg,var(--principal),var(--principal-2))" }}>
          {icon ? <Icono n={icon} size={30} /> : <span>{emoji}</span>}
        </div>
        <div>
          <h2>{titulo}</h2>
          <p className="sub">{descripcion}</p>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {children}
      </div>
    </div>
  );
}

/** Banner de resultado reutilizable con mini-confeti en récords. */
export function Resultado({ mensaje, tipo }) {
  if (!mensaje) return null;
  const esRecord = tipo === "record";
  return (
    <div className={`mensaje-final ${tipo}`} style={{ position: "relative" }}>
      {esRecord && (
        <span className="confeti" aria-hidden>
          {["✦", "●", "▲", "✦", "●", "▲"].map((e, i) => (
            <span key={i} style={{ left: `${8 + i * 15}%`, animationDelay: `${i * 0.15}s` }}>{e}</span>
          ))}
        </span>
      )}
      {mensaje}
    </div>
  );
}
