import { useState } from "react";
import GameShell from "./GameShell";
import { nivelDe } from "../suite/progreso";
import { MONEDA } from "../suite/billetera";
import { listarPerfiles, perfilActivo, resumenPerfil } from "../suite/perfiles";
import { sfx } from "../suite/sonido";

const MEDALLAS = ["🥇", "🥈", "🥉"];

/** Tabla Familiar: ranking de los perfiles del aparato por XP. Pique sano. */
export default function Familia({ onIr }) {
  const [perfiles] = useState(() => listarPerfiles());
  const [activo] = useState(() => perfilActivo());
  const filas = perfiles
    .map(p => ({ ...p, ...resumenPerfil(p.id) }))
    .sort((a, b) => b.xp - a.xp || b.victorias - a.victorias);

  return (
    <GameShell titulo="Tabla Familiar" emoji="🏠"
      descripcion="Quién manda en este aparato: ranking por XP entre tus perfiles."
      stats={[{ icono: "👥", etiqueta: "Jugadores", valor: filas.length }]}
      ayuda={<span>Se ordena por <b>XP</b> (luego por victorias). Cada uno suma jugando lo suyo. ¿Revancha? Arma una <b>Copa Familiar</b>.</span>}>
      <div className="tienda-grid">
        {filas.map((f, i) => {
          const { nivel } = nivelDe(f.xp);
          const esActivo = f.id === activo.id;
          return (
            <article key={f.id} className={`tienda-card${esActivo ? " owned" : ""}`}>
              <span className="tienda-icono" aria-hidden>{MEDALLAS[i] || `${i + 1}º`}</span>
              <h4>{f.emoji} {f.nombre} {esActivo && <span className="chip">Tú</span>}</h4>
              <p>Nivel {nivel} · {f.xp} XP · {f.victorias} victorias · {f.partidas} partidas · 🔥{f.racha} · {MONEDA} {f.saldo}</p>
            </article>
          );
        })}
      </div>
      <div className="fila-botones">
        <button className="btn-principal" onClick={() => { sfx.clic(); onIr("copa"); }}>🏆 Armar copa</button>
        <button className="btn-suave" onClick={() => { sfx.clic(); onIr("perfiles"); }}>👥 Perfiles</button>
      </div>
    </GameShell>
  );
}
