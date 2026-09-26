/* Sistema de progresión local de la suite: XP, niveles, racha, logros y misiones diarias. */
import { cargarTienda, consumirEscudo } from "./tienda";
import { cobrar } from "./billetera";

const CLAVE = "arcade-progreso-v1";

function hoy() {
  return new Date().toISOString().slice(0, 10);
}
function ayer() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function estadoInicial() {
  return { xp: 0, ultimaJugada: "", racha: 0, logros: [], desafio: { fecha: "", juego: "", hecho: false }, misiones: { fecha: "", jugadas: 0, victorias: 0, cobradas: [] } };
}

export function cargarProgreso() {
  try {
    const raw = localStorage.getItem(CLAVE);
    if (!raw) return estadoInicial();
    return { ...estadoInicial(), ...JSON.parse(raw) };
  } catch {
    return estadoInicial();
  }
}

export function guardarProgreso(p) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(p));
  } catch { /* noop */ }
}

export function nivelDe(xp) {
  let nivel = 1, resto = xp, need = 100;
  while (resto >= need) {
    resto -= need;
    nivel += 1;
    need = 100 + 50 * (nivel - 1);
  }
  return { nivel, enNivel: resto, need };
}

export const LOGROS = [
  { id: "primera", nombre: "Primera partida", desc: "Completa tu primera partida", test: p => p.partidas >= 1 },
  { id: "explorador", nombre: "Explorador", desc: "Prueba 5 juegos distintos", test: p => Object.keys(p.porJuego || {}).length >= 5 },
  { id: "veterano", nombre: "Veterano", desc: "Prueba 12 juegos distintos", test: p => Object.keys(p.porJuego || {}).length >= 12 },
  { id: "coleccionista", nombre: "Coleccionista", desc: "Prueba 25 juegos distintos", test: p => Object.keys(p.porJuego || {}).length >= 25 },
  { id: "completista", nombre: "Completista", desc: "Prueba 40 juegos distintos", test: p => Object.keys(p.porJuego || {}).length >= 40 },
  { id: "maratonista", nombre: "Maratonista", desc: "Prueba 60 juegos distintos", test: p => Object.keys(p.porJuego || {}).length >= 60 },
  { id: "centenario", nombre: "Centenario", desc: "Acumula 500 XP", test: p => (p.xp || 0) >= 500 },
  { id: "leyenda", nombre: "Leyenda", desc: "Acumula 2000 XP", test: p => (p.xp || 0) >= 2000 },
  { id: "racha3", nombre: "Constante", desc: "Juega 3 días seguidos", test: p => (p.racha || 0) >= 3 },
  { id: "desafio", nombre: "Reto diario", desc: "Completa el desafío del día", test: p => (p.desafiosCompletados || 0) >= 1 },
];

export function desafioDelDia(ids) {
  const d = new Date();
  const semilla = d.getFullYear() * 1000 + diaDelAno(d);
  return ids[semilla % ids.length];
}

/* Misiones diarias (tendencia 2026: retención por objetivos cortos).
   Se reinician cada día y pagan fichas automáticamente al completarse. */
export const MISIONES = [
  { id: "juega3", nombre: "Calentamiento", desc: "Juega 3 partidas hoy", meta: 3, campo: "jugadas", premio: 100 },
  { id: "gana1", nombre: "Sabor a victoria", desc: "Gana 1 partida hoy", meta: 1, campo: "victorias", premio: 150 },
  { id: "racha5", nombre: "En racha", desc: "Juega 5 partidas hoy", meta: 5, campo: "jugadas", premio: 200 },
];

export function misionesDelDia(prog) {
  const h = hoy();
  const m = prog?.misiones?.fecha === h
    ? prog.misiones
    : { fecha: h, jugadas: 0, victorias: 0, cobradas: [] };
  return MISIONES.map(mis => {
    const actual = Math.min(mis.meta, m[mis.campo] || 0);
    return { ...mis, actual, hecha: (m.cobradas || []).includes(mis.id) || actual >= mis.meta };
  });
}
function diaDelAno(d) {
  const ini = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d - ini) / 864e5);
}

/** Suma XP por una partida y actualiza racha/logros. Devuelve {prog, subioNivel, nuevosLogros, xpGanado}. */
export function sumarPartida(prev, { juegoId, puntos = 0, victoria = false, esDesafio = false }) {
  const prog = {
    ...prev,
    porJuego: { ...(prev.porJuego || {}) },
    logros: [...(prev.logros || [])],
    partidas: (prev.partidas || 0) + 1,
  };
  let xpGanado = 5 + Math.min(60, Math.max(0, Math.round(puntos / 2))) + (victoria ? 15 : 0);
  if (esDesafio && !prev.desafio?.hecho) xpGanado *= 2;
  // Potenciador de la tienda: doble XP si está activo
  let dobleXp = false;
  try {
    if (cargarTienda().boosterXpHasta > Date.now()) { xpGanado *= 2; dobleXp = true; }
  } catch { /* noop */ }

  const antes = nivelDe(prev.xp || 0).nivel;
  prog.xp = (prev.xp || 0) + xpGanado;
  const despues = nivelDe(prog.xp).nivel;

  // racha diaria (el escudo de la tienda evita que se rompa un día)
  const h = hoy();
  let escudoUsado = false;
  if (prev.ultimaJugada === h) { /* misma racha */ }
  else if (prev.ultimaJugada === ayer()) prog.racha = (prev.racha || 0) + 1;
  else if (consumirEscudo()) { prog.racha = prev.racha || 1; escudoUsado = true; }
  else prog.racha = 1;
  prog.ultimaJugada = h;

  // conteo por juego
  prog.porJuego[juegoId] = (prog.porJuego[juegoId] || 0) + 1;

  if (esDesafio) {
    prog.desafio = { ...(prev.desafio || {}), hecho: true };
    prog.desafiosCompletados = (prev.desafiosCompletados || 0) + 1;
  }

  // misiones diarias: conteo del día + pago automático de fichas
  const pm = prev.misiones?.fecha === h
    ? { ...prev.misiones, cobradas: [...(prev.misiones.cobradas || [])] }
    : { fecha: h, jugadas: 0, victorias: 0, cobradas: [] };
  pm.jugadas += 1;
  if (victoria) pm.victorias += 1;
  prog.misiones = pm;
  const misionesNuevas = [];
  for (const mis of MISIONES) {
    if (!pm.cobradas.includes(mis.id) && (pm[mis.campo] || 0) >= mis.meta) {
      pm.cobradas.push(mis.id);
      try { cobrar(mis.premio); } catch { /* noop */ }
      misionesNuevas.push(mis);
    }
  }

  const nuevosLogros = [];
  for (const l of LOGROS) {
    if (!prog.logros.includes(l.id)) {
      try {
        if (l.test(prog)) {
          prog.logros.push(l.id);
          nuevosLogros.push(l);
        }
      } catch { /* noop */ }
    }
  }
  guardarProgreso(prog);
  return { prog, subioNivel: despues > antes, nuevosLogros, xpGanado, dobleXp, escudoUsado, misionesNuevas };
}
