/* Tienda de ArcadePaLoMuchacho: gasta fichas virtuales (sin dinero real) en
   temas visuales premium y potenciadores. Persistencia local + evento "aplm-tienda". */

export const TIENDA_ITEMS = [
  {
    id: "tema-dorado", tipo: "tema", cat: "Temas", nombre: "Tema Dorado", icono: "👑", precio: 800,
    desc: "Paleta oro y negro de casino VIP para toda la app.",
  },
  {
    id: "tema-oceano", tipo: "tema", cat: "Temas", nombre: "Tema Océano", icono: "🌊", precio: 800,
    desc: "Azules profundos y espuma para jugar relajado.",
  },
  {
    id: "tema-atardecer", tipo: "tema", cat: "Temas", nombre: "Tema Atardecer", icono: "🌅", precio: 900,
    desc: "Naranjas y morados de puesta de sol para jugar al anochecer.",
  },
  {
    id: "tema-bosque", tipo: "tema", cat: "Temas", nombre: "Tema Bosque", icono: "🌲", precio: 900,
    desc: "Verdes profundos de bosque nocturno, descanso visual.",
  },
  {
    id: "tema-volcan", tipo: "tema", cat: "Temas", nombre: "Tema Volcán", icono: "🌋", precio: 1000,
    desc: "Negro basalto y lava para noches eléctricas.",
  },
  {
    id: "tema-galaxia", tipo: "tema", cat: "Temas", nombre: "Tema Galaxia", icono: "🌌", precio: 1000,
    desc: "Violeta cósmico con polvo de estrellas.",
  },
  {
    id: "tema-dulce", tipo: "tema", cat: "Temas", nombre: "Tema Dulce", icono: "🍬", precio: 1000,
    desc: "Rosa chicle y menta para jugar feliz.",
  },
  {
    id: "tema-legendario", tipo: "tema", cat: "Temas", nombre: "Tema Legendario", icono: "💎", precio: 15200,
    desc: "👑 LA JOYA: tema animado exclusivo +25% XP para siempre, +5 fichas por partida y corona en tu perfil.",
  },
  {
    id: "boost-xp", tipo: "boost", cat: "Boosts", nombre: "Doble XP ×2", icono: "⚡", precio: 500,
    desc: "Gana el doble de XP en todos los juegos durante 30 minutos.",
  },
  {
    id: "boost-xp-plus", tipo: "boost", cat: "Boosts", nombre: "Doble XP Plus ⏳", icono: "🚀", precio: 900,
    desc: "Doble XP durante 60 minutos (se suma al tiempo que tengas).",
  },
  {
    id: "boost-fichas", tipo: "boost", cat: "Boosts", nombre: "Fichas ×2 🪙", icono: "💰", precio: 600,
    desc: "Doble de fichas por partida durante 60 minutos.",
  },
  {
    id: "escudo", tipo: "escudo", cat: "Boosts", nombre: "Escudo de racha", icono: "🛡️", precio: 300,
    desc: "Si un día no juegas, tu racha diaria no se rompe (se consume solo).",
  },
  {
    id: "escudo-pack", tipo: "escudo", cat: "Boosts", nombre: "Pack 3 escudos", icono: "🛡️", precio: 700,
    desc: "Tres escudos de racha: 3 días de perdón si no juegas.",
  },
  {
    id: "caja-misteriosa", tipo: "caja", cat: "Diversión", nombre: "Caja misteriosa", icono: "🎁", precio: 200,
    desc: "Paga 200 y recibe entre 50 y 500 fichas. ¿Suerte o truco?",
  },
  {
    id: "pack-xp", tipo: "xp", cat: "Boosts", nombre: "Pack +500 XP", icono: "🌟", precio: 300,
    desc: "Suma 500 XP al instante a tu perfil. Se puede repetir.",
  },
];

const CLAVE = "aplm-tienda-v1";
export const BOOST_MS = 30 * 60 * 1000;
export const FICHAS_MS = 60 * 60 * 1000;

function estadoInicial() {
  return { comprados: [], boosterXpHasta: 0, fichasX2Hasta: 0, escudos: 0 };
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

export function fichasX2Activo() {
  return (cargarTienda().fichasX2Hasta || 0) > Date.now();
}

/** Minutos restantes de cada boost (para la UI). */
export function minutosRestantes(id) {
  const t = cargarTienda();
  const hasta = id === "boost-fichas" ? t.fichasX2Hasta : t.boosterXpHasta;
  return Math.max(0, Math.ceil((hasta - Date.now()) / 60000));
}

/** Compra un item cobrando de la billetera. Devuelve {ok, motivo}.
 *  Los tipos "caja" y "xp" solo cobran: el premio se entrega en la UI. */
export function comprar(id, cobrarDeBilletera) {
  const item = TIENDA_ITEMS.find(i => i.id === id);
  if (!item) return { ok: false, motivo: "Artículo inexistente" };
  const t = cargarTienda();
  if (item.tipo !== "boost" && item.tipo !== "escudo" && item.tipo !== "caja" && item.tipo !== "xp" && t.comprados.includes(id)) {
    return { ok: false, motivo: "Ya lo tienes" };
  }
  const cobro = cobrarDeBilletera(item.precio);
  if (!cobro.ok) return { ok: false, motivo: cobro.motivo || "Sin fichas suficientes" };
  if (item.tipo === "boost") {
    const ahora = Date.now();
    if (id === "boost-xp-plus") {
      t.boosterXpHasta = Math.max(ahora, t.boosterXpHasta || 0) + 2 * BOOST_MS;
    } else if (id === "boost-fichas") {
      t.fichasX2Hasta = Math.max(ahora, t.fichasX2Hasta || 0) + FICHAS_MS;
    } else {
      t.boosterXpHasta = Math.max(ahora, t.boosterXpHasta || 0) + BOOST_MS;
    }
  } else if (item.tipo === "escudo") {
    t.escudos = (t.escudos || 0) + (id === "escudo-pack" ? 3 : 1);
  } else if (item.tipo === "tema" && !t.comprados.includes(id)) {
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
