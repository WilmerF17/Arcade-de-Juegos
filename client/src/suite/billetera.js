/* Billetera virtual de ArcadePaLoMuchacho: fichas de juego (sin dinero real).
   - Saldo inicial 1000, bonus diario de 500.
   - Persistencia local + evento "aplm-billetera" para refrescar la UI. */

const CLAVE = "aplm-billetera-v1";
export const SALDO_INICIAL = 1000;
export const BONUS_DIARIO = 500;
export const MONEDA = "🪙";

function hoy() {
  return new Date().toISOString().slice(0, 10);
}

export function estadoInicial() {
  return { saldo: SALDO_INICIAL, ultimoBonus: "", ganado: 0, apostado: 0,
    rachaApuestas: 0, perdidoHoy: { fecha: "", monto: 0 }, limitePerdida: 1000, historialApuestas: [] };
}

export function cargarBilletera() {
  try {
    const raw = localStorage.getItem(CLAVE);
    if (!raw) return estadoInicial();
    const b = { ...estadoInicial(), ...JSON.parse(raw) };
    if (!Number.isFinite(b.saldo) || b.saldo < 0) b.saldo = 0;
    return b;
  } catch {
    return estadoInicial();
  }
}

function guardar(b) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(b));
  } catch { /* noop */ }
  window.dispatchEvent(new CustomEvent("aplm-billetera", { detail: b }));
}

/** Apuesta fichas. Devuelve {ok} — ok:false si no hay saldo o supera tu límite diario. */
export function apostar(cantidad) {
  const c = Math.floor(Number(cantidad) || 0);
  if (c <= 0) return { ok: false, motivo: "Apuesta inválida" };
  const b = cargarBilletera();
  if (c > b.saldo) return { ok: false, motivo: "Sin fichas suficientes" };
  if ((b.limitePerdida || 0) > 0 && (b.perdidoHoy?.fecha === hoy() ? b.perdidoHoy.monto : 0) + c > b.limitePerdida) {
    return { ok: false, motivo: `Límite diario de ${b.limitePerdida} alcanzado (juego responsable)` };
  }
  b.saldo -= c;
  b.apostado += c;
  b.ultimaApuesta = c;
  guardar(b);
  return { ok: true, saldo: b.saldo };
}

/** Registra el resultado de una apuesta: racha, límite diario e historial. */
export function resolverApuesta(apuesta, premio) {
  const b = cargarBilletera();
  const a = apuesta || b.ultimaApuesta || 0;
  const gano = premio > a;
  b.rachaApuestas = gano ? (b.rachaApuestas || 0) + 1 : 0;
  if (!gano && premio < a) {
    const ph = b.perdidoHoy?.fecha === hoy() ? b.perdidoHoy : { fecha: hoy(), monto: 0 };
    ph.monto += a - premio;
    b.perdidoHoy = ph;
  }
  const h = [...(b.historialApuestas || []), {
    fecha: new Date().toISOString(), apuesta: a, premio, gano,
  }].slice(-12);
  b.historialApuestas = h;
  guardar(b);
  return b.rachaApuestas;
}

/** Bonus de racha: cada 3 victorias seguidas paga +50% de la apuesta. */
export function bonusRacha(apuesta, racha) {
  if (racha > 0 && racha % 3 === 0) return Math.floor(apuesta * 0.5);
  return 0;
}

/** Cambia tu límite diario de pérdidas (0 = sin límite). */
export function fijarLimite(monto) {
  const b = cargarBilletera();
  b.limitePerdida = Math.max(0, Math.floor(Number(monto) || 0));
  guardar(b);
  return b.limitePerdida;
}

export function perdidoHoy() {
  const b = cargarBilletera();
  return b.perdidoHoy?.fecha === hoy() ? b.perdidoHoy.monto : 0;
}

/** Cobra un premio. Devuelve el saldo nuevo. */
export function cobrar(cantidad) {
  const c = Math.floor(Number(cantidad) || 0);
  const b = cargarBilletera();
  if (c > 0) {
    b.saldo += c;
    b.ganado += c;
    guardar(b);
  }
  return b.saldo;
}

/** Bonus diario de 500. Devuelve lo cobrado (0 si ya se reclamó hoy). */
export function bonusDiario() {
  const b = cargarBilletera();
  if (b.ultimoBonus === hoy()) return 0;
  b.ultimoBonus = hoy();
  b.saldo += BONUS_DIARIO;
  guardar(b);
  return BONUS_DIARIO;
}

export function bonusDisponible() {
  return cargarBilletera().ultimoBonus !== hoy();
}

/** Si te quedas en 0 y sin bonus, la banca te rescata con 200 (una vez al día). */
export function rescate() {
  const b = cargarBilletera();
  if (b.saldo > 0 || b.ultimoBonus === hoy()) return 0;
  b.ultimoBonus = hoy();
  b.saldo += 200;
  guardar(b);
  return 200;
}
