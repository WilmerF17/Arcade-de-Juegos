/* Tienda de ArcadePaLoMuchacho: gasta fichas virtuales (sin dinero real) en
   temas visuales premium y potenciadores. Persistencia local + evento "aplm-tienda". */

export const TIENDA_ITEMS = [
  {
    id: "tema-dorado", tipo: "tema", nombre: "Tema Dorado", icono: "👑", precio: 800,
    desc: "Paleta oro y negro de casino VIP para toda la app.",
  },
  {
    id: "tema-oceano", tipo: "tema", nombre: "Tema Océano", icono: "🌊", precio: 800,
    desc: "Azules profundos y espuma para jugar relajado.",
  },
  {
    id: "boost-xp", tipo: "boost", nombre: "Doble XP ×2", icono: "⚡", precio: 500,
    desc: "Gana el doble de XP en todos los juegos durante 30 minutos.",
  },
  {
    id: "escudo", tipo: "escudo", nombre: "Escudo de racha", icono: "🛡️", precio: 300,
    desc: "Si un día no juegas, tu racha diaria no se rompe (se consume solo).",
  },
  {
    id: "tema-atardecer", tipo: "tema", nombre: "Tema Atardecer", icono: "🌅", precio: 900,
    desc: "Naranjas y morados de puesta de sol para jugar al anochecer.",
  },
  {
    id: "tema-bosque", tipo: "tema", nombre: "Tema Bosque", icono: "🌲", precio: 900,
    desc: "Verdes profundos de bosque nocturno, descanso visual.",
  },
  {
    id: "boost-xp-plus", tipo: "boost", nombre: "Doble XP Plus ⏳", icono: "🚀", precio: 900,
    desc: "Doble XP durante 60 minutos (se suma al tiempo que tengas).",
  },
  {
    id: "escudo-pack", tipo: "escudo", nombre: "Pack 3 escudos", icono: "🛡️", precio: 700,
    desc: "Tres escudos de racha: 3 días de perdón si no juegas.",
  },
];

const CLAVE = "aplm-tienda-v1";
export const BOOST_MS = 30 * 60 * 1000;

function estadoInicial() {
  return { comprados: [], boosterXpHasta: 0, escudos: 0 };
}

export function cargarTienda() {
  try {
    const raw = localStorage.getItem(CLAVE);
    if (!raw) return estadoInicial();
    const t = { ...estadoInicial(), ...JSON.parse(raw) };
    if (!Array.isArray(t.comprados)) t.comprados = [];
    return t;
  } catch {
    return estadoInicial();
  }
}

function guardar(t) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(t));
  } catch { /* noop */ }
  window.dispatchEvent(new CustomEvent("aplm-tienda", { detail: t }));
}

export function tienes(id) {
  return cargarTienda().comprados.includes(id);
}

export function dobleXpActivo() {
  return cargarTienda().boosterXpHasta > Date.now();
}

/** Compra un item cobrando de la billetera. Devuelve {ok, motivo}. */
export function comprar(id, cobrarDeBilletera) {
  const item = TIENDA_ITEMS.find(i => i.id === id);
  if (!item) return { ok: false, motivo: "Artículo inexistente" };
  const t = cargarTienda();
  if (item.tipo !== "boost" && item.tipo !== "escudo" && t.comprados.includes(id)) {
    return { ok: false, motivo: "Ya lo tienes" };
  }
  const cobro = cobrarDeBilletera(item.precio);
  if (!cobro.ok) return { ok: false, motivo: cobro.motivo || "Sin fichas suficientes" };
  if (item.tipo === "boost") {
    const ahora = Date.now();
    const extra = id === "boost-xp-plus" ? 2 * BOOST_MS : BOOST_MS;
    t.boosterXpHasta = Math.max(ahora, t.boosterXpHasta || 0) + extra;
  } else if (item.tipo === "escudo") {
    t.escudos = (t.escudos || 0) + (id === "escudo-pack" ? 3 : 1);
  } else if (!t.comprados.includes(id)) {
    t.comprados.push(id);
  }
  guardar(t);
  return { ok: true };
}

/** Consume un escudo si hay. Devuelve true si se consumió. */
export function consumirEscudo() {
  const t = cargarTienda();
  if ((t.escudos || 0) <= 0) return false;
  t.escudos -= 1;
  guardar(t);
  return true;
}

export function escudosRestantes() {
  return cargarTienda().escudos || 0;
}
