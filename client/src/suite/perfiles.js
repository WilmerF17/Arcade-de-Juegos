/* Perfiles locales de ArcadePaLoMuchacho: varios jugadores en el mismo
   dispositivo, cada uno con su progreso, fichas, tienda y favoritos.
   Sin cuentas ni internet: al cambiar de perfil se guardan las claves
   actuales y se cargan las del perfil elegido (luego se recarga la app).
   Claves globales del aparato (no por perfil): tema, rgb, sonido. */

const CLAVE = "arcade-perfiles-v1";
export const MAX_PERFILES = 8;
export const EMOJIS = ["😎", "🦊", "🐼", "🦁", "🐸", "🤖", "👾", "🦄", "🐯", "🦉", "👻", "⚡"];

/* Claves con datos por persona (el resto son del aparato y se comparten). */
const CLAVES_PERFIL = ["arcade-progreso-v1", "aplm-billetera-v1", "aplm-tienda-v1", "arcade-favs"];

function leer(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}
function escribir(key, valor) {
  try {
    if (valor == null) localStorage.removeItem(key);
    else localStorage.setItem(key, valor);
  } catch { /* modo privado: se juega sin guardar */ }
}

function estadoVacio() {
  return { activo: "", perfiles: [], datos: {} };
}

export function cargarEstado() {
  try {
    const raw = localStorage.getItem(CLAVE);
    if (!raw) return estadoVacio();
    const e = { ...estadoVacio(), ...JSON.parse(raw) };
    if (!Array.isArray(e.perfiles)) e.perfiles = [];
    if (!e.datos || typeof e.datos !== "object") e.datos = {};
    return e;
  } catch {
    return estadoVacio();
  }
}

function guardar(e) {
  try { localStorage.setItem(CLAVE, JSON.stringify(e)); } catch { /* noop */ }
}

function fotoActual() {
  const foto = {};
  for (const k of CLAVES_PERFIL) foto[k] = leer(k);
  return foto;
}

function restaurar(foto) {
  for (const k of CLAVES_PERFIL) escribir(k, foto?.[k] ?? null);
}

function nuevoId() {
  return "p" + Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36);
}

function saneaNombre(nombre) {
  return String(nombre || "").trim().slice(0, 20);
}

/** Primera carga: si no hay perfiles, el progreso actual pasa a ser el de "Jugador". */
export function asegurarPerfiles() {
  const e = cargarEstado();
  if (e.perfiles.length > 0 && e.perfiles.some(p => p.id === e.activo)) return e;
  if (e.perfiles.length === 0) {
    const p = { id: nuevoId(), nombre: "Jugador", emoji: "😎", creado: new Date().toISOString().slice(0, 10) };
    e.perfiles = [p];
    e.activo = p.id;
    e.datos[p.id] = fotoActual();
    guardar(e);
  } else {
    e.activo = e.perfiles[0].id;
    guardar(e);
  }
  return e;
}

export function listarPerfiles() {
  return asegurarPerfiles().perfiles;
}

export function perfilActivo() {
  const e = asegurarPerfiles();
  return e.perfiles.find(p => p.id === e.activo) || e.perfiles[0];
}

/** Crea un perfil y lo deja activo. Devuelve {ok, motivo}. La UI debe recargar. */
export function crearPerfil(nombre, emoji) {
  const e = asegurarPerfiles();
  const limpio = saneaNombre(nombre);
  if (!limpio) return { ok: false, motivo: "Escribe un nombre" };
  if (e.perfiles.length >= MAX_PERFILES) return { ok: false, motivo: `Máximo ${MAX_PERFILES} perfiles` };
  if (e.perfiles.some(p => p.nombre.toLowerCase() === limpio.toLowerCase())) {
    return { ok: false, motivo: "Ese nombre ya existe" };
  }
  e.datos[e.activo] = fotoActual();
  const p = {
    id: nuevoId(),
    nombre: limpio,
    emoji: EMOJIS.includes(emoji) ? emoji : EMOJIS[e.perfiles.length % EMOJIS.length],
    creado: new Date().toISOString().slice(0, 10),
  };
  e.perfiles.push(p);
  e.activo = p.id;
  e.datos[p.id] = {};
  guardar(e);
  restaurar({});
  return { ok: true, perfil: p };
}

/** Cambia al perfil indicado. Devuelve {ok}. La UI debe recargar. */
export function cambiarPerfil(id) {
  const e = asegurarPerfiles();
  if (id === e.activo) return { ok: true };
  if (!e.perfiles.some(p => p.id === id)) return { ok: false, motivo: "Perfil inexistente" };
  e.datos[e.activo] = fotoActual();
  e.activo = id;
  guardar(e);
  restaurar(e.datos[id] || {});
  return { ok: true };
}

export function renombrarPerfil(id, nombre, emoji) {
  const e = asegurarPerfiles();
  const p = e.perfiles.find(x => x.id === id);
  if (!p) return { ok: false, motivo: "Perfil inexistente" };
  const limpio = saneaNombre(nombre);
  if (!limpio) return { ok: false, motivo: "Escribe un nombre" };
  if (e.perfiles.some(x => x.id !== id && x.nombre.toLowerCase() === limpio.toLowerCase())) {
    return { ok: false, motivo: "Ese nombre ya existe" };
  }
  p.nombre = limpio;
  if (EMOJIS.includes(emoji)) p.emoji = emoji;
  guardar(e);
  return { ok: true };
}

/** Borra un perfil (sus datos se pierden). Nunca deja cero perfiles. */
export function borrarPerfil(id) {
  const e = asegurarPerfiles();
  if (e.perfiles.length <= 1) return { ok: false, motivo: "No puedes borrar tu único perfil" };
  if (!e.perfiles.some(p => p.id === id)) return { ok: false, motivo: "Perfil inexistente" };
  if (id === e.activo) {
    const otro = e.perfiles.find(p => p.id !== id);
    e.activo = otro.id;
    restaurar(e.datos[otro.id] || {});
  }
  e.perfiles = e.perfiles.filter(p => p.id !== id);
  delete e.datos[id];
  guardar(e);
  return { ok: true };
}

/** Resumen para la vista (XP y fichas del snapshot, sin tocar lo cargado). */
export function resumenPerfil(id) {
  const e = cargarEstado();
  const foto = id === e.activo ? fotoActual() : e.datos[id] || {};
  let xp = 0, saldo = 0;
  try { xp = JSON.parse(foto["arcade-progreso-v1"] || "{}").xp || 0; } catch { /* noop */ }
  try { saldo = JSON.parse(foto["aplm-billetera-v1"] || "{}").saldo ?? 0; } catch { /* noop */ }
  return { xp, saldo };
}
