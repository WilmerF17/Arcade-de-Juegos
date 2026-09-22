import { createContext, useContext, useState } from "react";
import { registrar } from "../api";
import { cobrar } from "../suite/billetera";
import { cargarProgreso, sumarPartida } from "../suite/progreso";
import { sfx } from "../suite/sonido";
import { Icono, iconoDeTitulo } from "./Iconos";

/** Lee el id del juego activo desde la URL (#juego) para dar XP al juego correcto. */
function juegoIdActual(nombreJuego) {
  const h = window.location.hash.replace("#", "");
  return h || nombreJuego;
}

/**
 * Tema visual del juego activo (tira de color + familia).
 * App.jsx lo provee automáticamente desde el catálogo (grad/tema),
 * así los 237 juegos heredan identidad propia sin editar cada fichero.
 */
const TemaJuegoContext = createContext({ tira: null, fam: null });
export const ProveedorTemaJuego = TemaJuegoContext.Provider;
export function useTemaJuego() {
  return useContext(TemaJuegoContext);
}

/**
 * Gancho compartido: progresión local (XP/nivel/logros) PRIMERO para
 * respuesta instantánea, y registro en el servidor después en segundo plano.
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

    // 1) Progresión local inmediata (funciona offline y sin esperar red)
    let extra = null;
    try {
      const prev = cargarProgreso();
      const esDesafio = prev.desafio?.juego === id && !prev.desafio?.hecho;
      const r = sumarPartida(prev, { juegoId: id, puntos, victoria: ganadas > 0, esDesafio });
      extra = { xpGanado: r.xpGanado, subioNivel: r.subioNivel, nuevosLogros: r.nuevosLogros, dobleXp: r.dobleXp, escudoUsado: r.escudoUsado };
      window.dispatchEvent(new CustomEvent("arcade-progreso", { detail: r.prog }));
    } catch { /* noop */ }
    // Economía: cada partida paga fichas para la tienda (+5, +15 si ganas)
    try { cobrar(5 + (ganadas > 0 ? 10 : 0)); } catch { /* noop */ }

    const trozoXp = extra ? ` · +${extra.xpGanado} XP⚡${extra.dobleXp ? " (×2)" : ""}${extra.subioNivel ? " · ¡NIVEL UP! 🎆" : ""}${extra.escudoUsado ? " · 🛡️ escudo usado" : ""}` : "";
    const trozoLogros = extra?.nuevosLogros?.length
      ? ` · 🏅 ${extra.nuevosLogros.map(l => l.nombre).join(", ")}` : "";
    const mensajeBase = `${nombreJuego}: ${puntos} puntos${ganadas ? " · victoria ✅" : ""}${trozoXp}${trozoLogros}`;

    // Muestra el resultado al instante con lo local; el récord se añade si el servidor lo confirma
    setEstado(prev => ({ ...prev, mensaje: mensajeBase, tipo: ganadas ? "victoria" : "derrota", xp: extra }));
    if (ganadas) sfx.bien();

    // 2) Servidor en segundo plano (ranking global + récord)
    let s = null;
    try {
      s = await registrar(nombreJuego, puntos, ganadas, jugadas);
    } catch {
      setEstado(prev => ({
        ...prev,
        mensaje: prev.mensaje + " · Sin conexión al ranking (offline o servidor apagado): tu XP y nivel se guardan igual en este dispositivo. ✅",
      }));
      return s;
    }

    const esRecord = !!s?.nuevoRecord;
    if (esRecord) {
      sfx.record();
      document.body.classList.remove("flash-record");
      void document.body.offsetWidth;
      document.body.classList.add("flash-record");
      setTimeout(() => document.body.classList.remove("flash-record"), 1300);
    }
    setEstado({
      stats: s,
      mensaje: `${mensajeBase}${esRecord ? " · ¡NUEVO RÉCORD! 🏆" : ""}`,
      tipo: esRecord ? "record" : ganadas ? "victoria" : "derrota",
      xp: extra,
    });
    return s;
  };

  return { ...estado, registrarPunt };
}

/**
 * Encabezado + zona de contenido común para cada juego, con tira de color temática.
 * Props nuevas (opcionales): resultado {mensaje,tipo}, stats [{icono,valor,etiqueta}],
 * ayuda (nodo), acciones (nodo → botonera estándar), fam (familia para acento visual).
 * Si App provee tema vía contexto, tira/fam se heredan solas.
 */
export default function GameShell({
  titulo, emoji, descripcion, children,
  tira, iconoFondo, resultado, stats, ayuda, acciones, fam,
}) {
  const temaCtx = useTemaJuego();
  const tiraFinal = tira || temaCtx.tira;
  const famFinal = fam || temaCtx.fam;
  const icon = iconoDeTitulo(titulo);
  return (
    <div
      className="gameshell"
      style={tiraFinal ? { "--tira": tiraFinal } : undefined}
      data-fam={famFinal || undefined}
    >
      <div className="shell-head">
        <div
          className="shell-icono"
          style={{ background: iconoFondo || tiraFinal || "linear-gradient(135deg,var(--principal),var(--principal-2))" }}
        >
          {icon ? <Icono n={icon} size={30} /> : <span>{emoji}</span>}
        </div>
        <div>
          <h2>{titulo}</h2>
          <p className="sub">{descripcion}</p>
        </div>
      </div>
      {stats?.length > 0 && <Stats items={stats} />}
      <div className="shell-cuerpo">
        {children}
      </div>
      {acciones && <div className="fila-botones">{acciones}</div>}
      <Resultado mensaje={resultado?.mensaje} tipo={resultado?.tipo} />
      {ayuda && <Ayuda>{ayuda}</Ayuda>}
    </div>
  );
}

/** Fila de chips de marcador (puntos, mejor, racha…) con el mismo estilo en todos los juegos. */
export function Stats({ items = [] }) {
  if (!items.length) return null;
  return (
    <div className="marcador-chips" role="status" aria-label="Marcador">
      {items.map((it, i) => (
        <span className="chip" key={i}>
          {it.icono && <span aria-hidden>{it.icono} </span>}
          {it.etiqueta && <span>{it.etiqueta}: </span>}
          <b>{it.valor}</b>
        </span>
      ))}
    </div>
  );
}

/** Banner de resultado reutilizable con mini-confeti en récords. */
const ICONO_RESULTADO = { record: "🏆", victoria: "✅", derrota: "💪", perdida: "💪", empate: "🤝" };
export function Resultado({ mensaje, tipo }) {
  if (!mensaje) return null;
  const esRecord = tipo === "record";
  return (
    <div className={`mensaje-final ${tipo || ""}`} role="status" style={{ position: "relative" }}>
      {esRecord && (
        <span className="confeti" aria-hidden>
          {["✦", "●", "▲", "✦", "●", "▲"].map((e, i) => (
            <span key={i} style={{ left: `${8 + i * 15}%`, animationDelay: `${i * 0.15}s` }}>{e}</span>
          ))}
        </span>
      )}
      <span className="mf-icono" aria-hidden>{ICONO_RESULTADO[tipo] || "🎮"}</span> {mensaje}
    </div>
  );
}

/** Acordeón de ayuda "¿Cómo se juega?" con estilo unificado. */
export function Ayuda({ children }) {
  if (!children) return null;
  return (
    <details className="ayuda-juego">
      <summary>❓ ¿Cómo se juega?</summary>
      <div className="ayuda-cuerpo">{children}</div>
    </details>
  );
}
