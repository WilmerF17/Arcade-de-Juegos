import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

createRoot(document.getElementById("root")).render(<App />);

// PWA: registra el service worker solo en producción (build).
// Se usa BASE_URL para que funcione en subrutas (GitHub Pages) y en raíz (Vercel).
// Además avisa a la app cuando hay versión nueva (auto-actualización).
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    const swUrl = `${import.meta.env.BASE_URL}sw.js`;
    navigator.serviceWorker.register(swUrl).then(reg => {
      const avisar = () => window.dispatchEvent(new CustomEvent("aplm-update"));
      if (reg.waiting) avisar();
      reg.addEventListener("updatefound", () => {
        const nw = reg.installing;
        if (!nw) return;
        nw.addEventListener("statechange", () => {
          if (nw.state === "installed" && navigator.serviceWorker.controller) avisar();
        });
      });
      // Revisa actualizaciones cada 30 minutos
      setInterval(() => reg.update().catch(() => {}), 30 * 60 * 1000);
      // Al activar el nuevo SW, recarga para estrenar versión
      navigator.serviceWorker.addEventListener("controllerchange", () => window.location.reload());
      window.__aplmActualizar = () => {
        if (reg.waiting) reg.waiting.postMessage("SKIP_WAITING");
        else window.location.reload();
      };
    }).catch(() => {});
  });
}
