import { useCallback, useEffect, useState } from "react";
import { Icono } from "./Iconos";

/**
 * Hook compartido para la instalación PWA.
 * - Guarda el evento `beforeinstallprompt` en `window.__aplmInstallPrompt`
 *   para que todos los botones usen el mismo prompt.
 * - Detecta si la app ya está instalada (standalone / iOS standalone).
 */
export function useInstalacion() {
  const [instalable, setInstalable] = useState(
    () => !!window.__aplmInstallPrompt
  );
  const [instalada, setInstalada] = useState(
    () =>
      window.matchMedia?.("(display-mode: standalone)").matches ||
      window.matchMedia?.("(display-mode: fullscreen)").matches ||
      navigator.standalone === true
  );

  useEffect(() => {
    const sync = () => setInstalable(!!window.__aplmInstallPrompt);
    const listo = e => {
      e.preventDefault();
      window.__aplmInstallPrompt = e;
      setInstalable(true);
      window.dispatchEvent(new Event("aplm-instalable"));
    };
    const hecho = () => {
      window.__aplmInstallPrompt = null;
      setInstalable(false);
      setInstalada(true);
      window.dispatchEvent(new Event("aplm-instalable"));
    };
    const cambioDisplay = e => {
      if (e.matches) {
        setInstalada(true);
        setInstalable(false);
      }
    };
    const mq = window.matchMedia?.("(display-mode: standalone)");

    window.addEventListener("beforeinstallprompt", listo);
    window.addEventListener("appinstalled", hecho);
    window.addEventListener("aplm-instalable", sync);
    mq?.addEventListener?.("change", cambioDisplay);
    return () => {
      window.removeEventListener("beforeinstallprompt", listo);
      window.removeEventListener("appinstalled", hecho);
      window.removeEventListener("aplm-instalable", sync);
      mq?.removeEventListener?.("change", cambioDisplay);
    };
  }, []);

  const instalar = useCallback(async () => {
    const e = window.__aplmInstallPrompt;
    if (!e) return false;
    try {
      e.prompt();
      await e.userChoice;
    } catch {
      /* el usuario cerró el diálogo o el navegador lo bloqueó */
    }
    window.__aplmInstallPrompt = null;
    setInstalable(false);
    window.dispatchEvent(new Event("aplm-instalable"));
    return true;
  }, []);

  return { instalable, instalada, instalar };
}

function detectaPlataforma() {
  const ua = navigator.userAgent || "";
  const esIOS = /iphone|ipad|ipod/i.test(ua);
  const esAndroid = /android/i.test(ua);
  const esPC =
    !esIOS && !esAndroid && /windows|macintosh|linux|cros/i.test(ua);
  return { esIOS, esAndroid, esPC };
}

/** APK firmado generado con Bubblewrap (TWA): descarga directa, sin tienda. */
export const URL_APK = `${import.meta.env.BASE_URL}descargas/palomuchacho.apk`;
export const APK_NOMBRE = "palomuchacho.apk";
/** Juego portable para PC: un solo .html con los 250 juegos (doble clic y a jugar). */
export const URL_PORTABLE = `${import.meta.env.BASE_URL}descargas/PaLoMuchacho-portable.html`;
export const PORTABLE_NOMBRE = "PaLoMuchacho-portable.html";

function AyudaInstalar({ onCerrar }) {
  const { esIOS, esAndroid, esPC } = detectaPlataforma();
  return (
    <div
      className="modal-fondo"
      onClick={onCerrar}
      role="dialog"
      aria-modal="true"
      aria-label="Cómo instalar la app"
    >
      <div className="modal-instalar" onClick={e => e.stopPropagation()}>
        <div className="modal-instalar-head">
          <b>📲 Instalar PaLoMuchacho</b>
          <button className="btn-suave" onClick={onCerrar} aria-label="Cerrar">
            ✕
          </button>
        </div>
        <p className="modal-instalar-sub">
          Instálala y juega sin conexión, ocupa poco y abre a pantalla completa.
        </p>
        {esIOS ? (
          <ol className="instalar-lista">
            <li>
              Toca <b>Compartir</b> <span aria-hidden>⎙</span> en Safari.
            </li>
            <li>
              Elige <b>«Añadir a pantalla de inicio»</b>.
            </li>
            <li>
              Confirma con <b>Añadir</b>. ¡Listo! 🎉
            </li>
          </ol>
        ) : esAndroid ? (
          <ol className="instalar-lista">
            <li>
              <b>Directa (recomendado):</b>{" "}
              <a href={URL_APK} download={APK_NOMBRE}>descarga el APK 📥</a>,
              ábrelo y toca <b>Instalar</b> (permite «orígenes desconocidos» una vez).
            </li>
            <li>
              O en <b>Chrome</b>: menú <b>⋮</b> → <b>«Instalar app»</b>. En{" "}
              <b>Samsung Internet / Firefox</b>: menú →{" "}
              <b>«Añadir a pantalla de inicio»</b>.
            </li>
            <li>Busca el icono 📲 en tu inicio y juega offline.</li>
          </ol>
        ) : (
          <ol className="instalar-lista">
            <li>
              En <b>Chrome / Edge</b>: icono de instalación{" "}
              <b>⎙</b> en la barra de direcciones, o menú → <b>«Instalar»</b>.
            </li>
            <li>
              Confirma con <b>Instalar</b>. Se abre en su propia ventana.
            </li>
            {esPC ? null : (
              <li>
                En móvil: usa el menú del navegador →{" "}
                <b>«Añadir a pantalla de inicio»</b>.
              </li>
            )}
          </ol>
        )}
        <p className="modal-instalar-nota">
          💡 Si tu navegador no muestra la opción automática, usa «Añadir a
          pantalla de inicio» desde el menú: funciona igual y sin conexión.
        </p>
        <button className="btn-principal" onClick={onCerrar}>
          Entendido
        </button>
      </div>
    </div>
  );
}

/**
 * Botón de instalar siempre visible.
 * - En Android: descarga directa del APK firmado (un toque y a instalar).
 * - Si hay prompt del navegador: instala directo (PWA).
 * - Si no: abre el modal con instrucciones según plataforma.
 * - Si ya está instalada: muestra confirmación (o nada en variante icono).
 *
 * variantes: "hero" (verde grande) | "lateral" (ancho completo) | "icono" (solo icono)
 */
export default function BotonInstalar({
  variante = "hero",
  className = "",
}) {
  const { instalable, instalada, instalar } = useInstalacion();
  const [ayuda, setAyuda] = useState(false);
  const { esAndroid, esPC } = detectaPlataforma();

  async function alClic() {
    if (instalada) return;
    if (instalable) {
      const ok = await instalar();
      if (!ok) setAyuda(true);
    } else {
      setAyuda(true);
    }
  }

  if (instalada) {
    if (variante === "icono") return null;
    return (
      <button className={`btn-suave ${className}`} disabled title="Ya instalada">
        <Icono n="descargar" size={15} /> ✓ Instalada
      </button>
    );
  }

  // Android: el botón descarga el APK directamente, sin vueltas.
  // PC: descarga el juego portable (un .html con todo dentro).
  const descarga = esAndroid
    ? { url: URL_APK, nombre: APK_NOMBRE }
    : esPC
      ? { url: URL_PORTABLE, nombre: PORTABLE_NOMBRE }
      : null;
  if (descarga) {
    if (variante === "icono") {
      return (
        <a className={`btn-suave ${className}`} href={descarga.url} download={descarga.nombre}
          aria-label="Descargar juego" title="Descargar juego">
          <Icono n="descargar" size={16} />
        </a>
      );
    }
    if (variante === "lateral") {
      return (
        <a className={`btn-exito btn-instalar-lateral ${className}`} href={descarga.url} download={descarga.nombre}>
          <Icono n="descargar" size={15} /> Descargar juego
        </a>
      );
    }
    return (
      <a className={`btn-exito ${className}`} href={descarga.url} download={descarga.nombre}>
        <Icono n="descargar" size={15} /> Descargar juego
      </a>
    );
  }

  if (variante === "icono") {
    return (
      <>
        <button
          className={`btn-suave ${className}`}
          onClick={alClic}
          aria-label="Instalar app"
          title="Instalar app"
        >
          <Icono n="descargar" size={16} />
        </button>
        {ayuda && <AyudaInstalar onCerrar={() => setAyuda(false)} />}
      </>
    );
  }

  if (variante === "lateral") {
    return (
      <>
        <button className={`btn-exito btn-instalar-lateral ${className}`} onClick={alClic}>
          <Icono n="descargar" size={15} /> Instalar app
        </button>
        {ayuda && <AyudaInstalar onCerrar={() => setAyuda(false)} />}
      </>
    );
  }

  // hero por defecto
  return (
    <>
      <button className={`btn-exito ${className}`} onClick={alClic}>
        <Icono n="descargar" size={15} /> Instalar app
      </button>
      {ayuda && <AyudaInstalar onCerrar={() => setAyuda(false)} />}
    </>
  );
}
