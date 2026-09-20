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
  return { saldo: SALDO_INICIAL, ultimoBonus: "", ganado: 0, apostado: 0 };
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

/** Apuesta fichas. Devuelve {ok} — ok:false si no hay saldo suficiente. */
export function apostar(cantidad) {
  const c = Math.floor(Number(cantidad) || 0);
  if (c <= 0) return { ok: false, motivo: "Apuesta inválida" };
  const b = cargarBilletera();
  if (c > b.saldo) return { ok: false, motivo: "Sin fichas suficientes" };
  b.saldo -= c;
  b.apostado += c;
  guardar(b);
  return { ok: true, saldo: b.saldo };
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
