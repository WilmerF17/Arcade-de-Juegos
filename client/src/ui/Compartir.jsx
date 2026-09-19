import { useState } from "react";
import { Icono } from "./Iconos";

const URL_APP = "https://arcadepalomuchacho.vercel.app/";

/** Comparte con Web Share API y, si no existe, copia al portapapeles. */
export async function compartir({ titulo, texto, url = URL_APP }) {
  const datos = { title: titulo, text: texto, url };
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share(datos);
      return "compartido";
    } catch {
      return "cancelado";
    }
  }
  try {
    await navigator.clipboard.writeText(`${texto} ${url}`);
    return "copiado";
  } catch {
    return "error";
  }
}

export function enlaceWhatsApp(texto, url = URL_APP) {
  return `https://wa.me/?text=${encodeURIComponent(`${texto} ${url}`)}`;
}
export function enlaceX(texto, url = URL_APP) {
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(texto)}&url=${encodeURIComponent(url)}`;
}
export function enlaceTelegram(texto, url = URL_APP) {
  return `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(texto)}`;
}

/** Botonera compacta: compartir nativo + WhatsApp + X + Telegram. */
export default function BotonesCompartir({ texto, titulo = "ArcadePaLoMuchacho", compacto = false }) {
  const [aviso, setAviso] = useState("");

  async function principal() {
    const r = await compartir({ titulo, texto });
    setAviso(r === "copiado" ? "¡Enlace copiado! 📋" : r === "compartido" ? "¡Compartido! 🎉" : "");
    setTimeout(() => setAviso(""), 3000);
  }

  const btn = { display: "inline-flex", alignItems: "center", gap: 6 };
  return (
    <span style={{ display: "inline-flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
      <button className="btn-suave" style={btn} onClick={principal} aria-label="Compartir">
        <Icono n="compartir" size={15} /> {!compacto && "Compartir"}
      </button>
      <a className="btn-suave" style={{ ...btn, textDecoration: "none" }} href={enlaceWhatsApp(texto)} target="_blank" rel="noopener" aria-label="Compartir en WhatsApp">💬</a>
      <a className="btn-suave" style={{ ...btn, textDecoration: "none" }} href={enlaceX(texto)} target="_blank" rel="noopener" aria-label="Compartir en X">𝕏</a>
      <a className="btn-suave" style={{ ...btn, textDecoration: "none" }} href={enlaceTelegram(texto)} target="_blank" rel="noopener" aria-label="Compartir en Telegram">✈️</a>
      {aviso && <small style={{ color: "var(--exito)" }}>{aviso}</small>}
    </span>
  );
}
