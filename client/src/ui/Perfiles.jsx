import { useState } from "react";
import GameShell from "./GameShell";
import { nivelDe } from "../suite/progreso";
import { MONEDA } from "../suite/billetera";
import { sfx } from "../suite/sonido";
import {
  listarPerfiles, perfilActivo, crearPerfil, cambiarPerfil,
  renombrarPerfil, borrarPerfil, resumenPerfil, EMOJIS, MAX_PERFILES,
} from "../suite/perfiles";

/** Recarga la app en el inicio con el perfil ya cambiado. */
function recargar() {
  try { window.location.hash = ""; } catch { /* noop */ }
  window.location.reload();
}

/** Perfiles: cada persona guarda su propio progreso en este aparato. */
export default function Perfiles() {
  const [perfiles, setPerfiles] = useState(() => listarPerfiles());
  const [activo, setActivo] = useState(() => perfilActivo());
  const [nombre, setNombre] = useState("");
  const [emoji, setEmoji] = useState(EMOJIS[perfiles.length % EMOJIS.length]);
  const [editando, setEditando] = useState(null);
  const [editNombre, setEditNombre] = useState("");
  const [aviso, setAviso] = useState("");
  const [tipoAviso, setTipoAviso] = useState("");

  function refrescar() {
    setPerfiles(listarPerfiles());
    setActivo(perfilActivo());
  }
  function decir(ok, texto) {
    setTipoAviso(ok ? "victoria" : "derrota");
    setAviso(texto);
    setTimeout(() => setAviso(""), 4000);
    if (ok) sfx.bien(); else sfx.mal();
  }

  function crear(e) {
    e?.preventDefault();
    const r = crearPerfil(nombre, emoji);
    if (!r.ok) { decir(false, `⛔ ${r.motivo}`); return; }
    sfx.bien();
    recargar();
  }
  function entrar(id) {
    if (id === activo.id) return;
    cambiarPerfil(id);
    sfx.clic();
    recargar();
  }
  function guardarEdicion(id) {
    const r = renombrarPerfil(id, editNombre, null);
    if (!r.ok) { decir(false, `⛔ ${r.motivo}`); return; }
    setEditando(null);
    refrescar();
    decir(true, "✅ Nombre actualizado");
  }
  function borrar(id, nombreP) {
    if (!window.confirm(`¿Borrar el perfil de ${nombreP}? Su progreso se perderá.`)) return;
    const r = borrarPerfil(id);
    if (!r.ok) { decir(false, `⛔ ${r.motivo}`); return; }
    sfx.clic();
    recargar();
  }

  return (
    <GameShell titulo="Perfiles" emoji="👥"
      descripcion="Cada persona guarda su propio progreso en este aparato: XP, fichas, tienda y favoritos. Sin cuentas ni internet."
      stats={[{ icono: activo.emoji, etiqueta: "Jugando", valor: activo.nombre }, { etiqueta: "Perfiles", valor: `${perfiles.length}/${MAX_PERFILES}` }]}
      resultado={aviso ? { mensaje: aviso, tipo: tipoAviso } : null}
      ayuda={<span>Al cambiar de perfil tu partida actual se <b>guarda sola</b>. El tema visual y el sonido son del aparato y se comparten.</span>}>
      <div className="tienda-grid">
        {perfiles.map(p => {
          const res = resumenPerfil(p.id);
          const { nivel } = nivelDe(res.xp);
          const esActivo = p.id === activo.id;
          return (
            <article key={p.id} className={`tienda-card${esActivo ? " owned" : ""}`}>
              <span className="tienda-icono" aria-hidden>{p.emoji}</span>
              {editando === p.id ? (
                <>
                  <input value={editNombre} onChange={e => setEditNombre(e.target.value)} maxLength={20}
                    style={{ fontSize: "1rem", padding: "8px 10px", borderRadius: 10, width: "100%", textAlign: "center" }}
                    aria-label="Nuevo nombre" />
                  <div className="fila-botones">
                    <button className="btn-principal" onClick={() => guardarEdicion(p.id)}>Guardar</button>
                    <button className="btn-suave" onClick={() => setEditando(null)}>Cancelar</button>
                  </div>
                </>
              ) : (
                <>
                  <h4>{p.nombre} {esActivo && <span className="chip">✅ Jugando</span>}</h4>
                  <p>Nivel {nivel} · {res.xp} XP · {MONEDA} {res.saldo}</p>
                  <div className="fila-botones">
                    {!esActivo && <button className="btn-principal" onClick={() => entrar(p.id)}>▶️ Jugar</button>}
                    <button className="btn-suave" onClick={() => { setEditando(p.id); setEditNombre(p.nombre); }}>✏️</button>
                    {perfiles.length > 1 && (
                      <button className="btn-suave" onClick={() => borrar(p.id, p.nombre)} aria-label={`Borrar ${p.nombre}`}>🗑️</button>
                    )}
                  </div>
                </>
              )}
            </article>
          );
        })}
      </div>
      {perfiles.length < MAX_PERFILES && (
        <form onSubmit={crear} style={{ marginTop: 14 }}>
          <h4 style={{ textAlign: "center" }}>➕ Nuevo perfil</h4>
          <div className="fila-botones" style={{ justifyContent: "center" }}>
            {EMOJIS.map(m => (
              <button key={m} type="button" onClick={() => { setEmoji(m); sfx.clic(); }}
                className={emoji === m ? "btn-principal" : "btn-suave"}
                style={{ minWidth: 44, minHeight: 44, fontSize: "1.3rem" }} aria-label={`Avatar ${m}`}>{m}</button>
            ))}
          </div>
          <div className="fila-botones" style={{ justifyContent: "center" }}>
            <input value={nombre} onChange={e => setNombre(e.target.value)} maxLength={20}
              placeholder="Nombre (ej. Ana)" aria-label="Nombre del perfil"
              style={{ fontSize: "1.1rem", padding: "10px 12px", borderRadius: 10, width: 180, textAlign: "center" }} />
            <button className="btn-principal" type="submit">Crear y jugar</button>
          </div>
        </form>
      )}
    </GameShell>
  );
}
