import { LogoArcade } from "./Iconos";
import { sfx } from "../suite/sonido";

const CLAVE = "arcade-bienvenida-v1";

/** ¿Hay que mostrar la bienvenida? (solo la primera visita del aparato) */
export function necesitaBienvenida() {
  try {
    return !localStorage.getItem(CLAVE);
  } catch {
    return false;
  }
}

export function marcarBienvenida() {
  try { localStorage.setItem(CLAVE, "si"); } catch { /* noop */ }
}

/** Bienvenida de primera visita: qué es el arcade y por dónde empezar. */
export default function Bienvenida({ onJugar, onPerfiles, onCerrar }) {
  function acto(fn) {
    return () => { sfx.clic(); marcarBienvenida(); fn(); };
  }
  return (
    <div className="modal-fondo" role="dialog" aria-modal="true" aria-label="Bienvenida">
      <div className="modal-instalar">
        <div className="modal-instalar-head">
          <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <LogoArcade size={30} /> <b>¡Bienvenido al arcade! 🎉</b>
          </span>
          <button className="btn-suave" onClick={acto(onCerrar)} aria-label="Cerrar">✕</button>
        </div>
        <p className="modal-instalar-sub">Cientos de minijuegos gratis, en español y sin conexión.</p>
        <ul className="instalar-lista">
          <li>👥 <b>Tu perfil lo guarda todo</b>: XP, niveles, fichas y favoritos.</li>
          <li>⚡ <b>Desafío y misiones del día</b>: doble XP y fichas extra.</li>
          <li>📲 <b>Instálalo</b> y juega sin internet donde sea.</li>
        </ul>
        <div className="fila-botones">
          <button className="btn-principal" onClick={acto(onJugar)}>🎲 Jugar algo ya</button>
          <button className="btn-suave" onClick={acto(onPerfiles)}>👥 Crear mi perfil</button>
        </div>
      </div>
    </div>
  );
}
