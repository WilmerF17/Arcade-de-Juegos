import { useEffect, useRef, useState } from "react";
import GameShell from "./GameShell";
import { JUEGOS } from "../games/GAMES";
import { getStats, borrarStats } from "../api";
import { cargarBilletera } from "../suite/billetera";
import { listarPerfiles, perfilActivo } from "../suite/perfiles";
import { sfx } from "../suite/sonido";

const CLAVES_DATOS = ["arcade-progreso-v1", "aplm-billetera-v1", "aplm-tienda-v1",
  "arcade-favs", "arcade-perfiles-v1", "arcade-tema", "arcade-rgb", "arcade-sonido"];

/** Administración: estado de la plataforma, datos y mantenimiento. Todo en local. */
export default function Admin() {
  const [top, setTop] = useState([]);
  const [cuota, setCuota] = useState(null);
  const [aviso, setAviso] = useState("");
  const [tipoAviso, setTipoAviso] = useState("");
  const fileRef = useRef(null);
  const perfiles = listarPerfiles();
  const activo = perfilActivo();
  const historial = (cargarBilletera().historialApuestas || []).slice().reverse();

  useEffect(() => {
    getStats().then(s => {
      const filas = Object.entries(s || {})
        .map(([nombre, v]) => ({ nombre, jugadas: v.jugadas || 0, mejor: v.mejor || 0 }))
        .sort((a, b) => b.jugadas - a.jugadas)
        .slice(0, 5);
      setTop(filas);
    }).catch(() => {});
    try {
      navigator.storage?.estimate?.().then(e => {
        if (e.usage != null) setCuota(e);
      }).catch(() => {});
    } catch { /* noop */ }
  }, []);

  function leerTodo() {
    const datos = {};
    for (const k of CLAVES_DATOS) {
      try {
        const v = localStorage.getItem(k);
        if (v != null) datos[k] = v;
      } catch { /* noop */ }
    }
    return datos;
  }
  function bytes() {
    return Object.entries(leerTodo()).reduce((s, [k, v]) => s + k.length + v.length, 0);
  }
  function decir(ok, texto) {
    setTipoAviso(ok ? "victoria" : "derrota");
    setAviso(texto);
    setTimeout(() => setAviso(""), 4000);
    if (ok) sfx.bien(); else sfx.mal();
  }
  function recargar() {
    try { window.location.hash = ""; } catch { /* noop */ }
    window.location.reload();
  }

  function exportar() {
    try {
      const blob = new Blob([JSON.stringify({ app: "arcadepalomuchacho", fecha: new Date().toISOString(), datos: leerTodo() }, null, 2)],
        { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `arcade-respaldo-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
      decir(true, "✅ Respaldo descargado: guárdalo bien.");
    } catch {
      decir(false, "⛔ No se pudo crear el respaldo.");
    }
  }
  function importar(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    const lector = new FileReader();
    lector.onload = () => {
      try {
        const obj = JSON.parse(lector.result);
        const datos = obj.datos || obj;
        let n = 0;
        for (const k of CLAVES_DATOS) {
          if (typeof datos[k] === "string") { localStorage.setItem(k, datos[k]); n++; }
        }
        if (!n) { decir(false, "⛔ Ese archivo no trae datos del arcade."); return; }
        decir(true, `✅ ${n} datos restaurados. Recargando…`);
        setTimeout(recargar, 900);
      } catch {
        decir(false, "⛔ Archivo inválido.");
      }
    };
    lector.readAsText(f);
    e.target.value = "";
  }
  async function limpiarCache() {
    try {
      if ("caches" in window) {
        const ks = await caches.keys();
        await Promise.all(ks.map(k => caches.delete(k)));
      }
      decir(true, "✅ Caché limpio. Recargando…");
      setTimeout(recargar, 900);
    } catch {
      decir(false, "⛔ No se pudo limpiar la caché.");
    }
  }
  function borrarProgreso() {
    if (!window.confirm(`¿Borrar el progreso de ${activo.nombre}? Se pierden su XP, fichas, tienda, favoritos y también sus partidas y récords contados.`)) return;
    try {
      for (const k of ["arcade-progreso-v1", "aplm-billetera-v1", "aplm-tienda-v1", "arcade-favs"]) {
        localStorage.removeItem(k);
      }
    } catch {
      decir(false, "⛔ No se pudo borrar.");
      return;
    }
    // Mejor esfuerzo: también las partidas del servidor (si no hay conexión, igual se borró lo local)
    borrarStats().catch(() => {}).finally(() => {
      setTop([]);
      decir(true, "✅ Perfil y partidas borrados. Recargando…");
      setTimeout(recargar, 900);
    });
  }

  const version = typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "?";
  const fecha = typeof __BUILD_DATE__ !== "undefined" ? __BUILD_DATE__ : "";
  const kb = (bytes() / 1024).toFixed(1);

  return (
    <GameShell titulo="Administración" emoji="🛠️"
      descripcion="Estado de la plataforma, tus datos y mantenimiento. Todo se queda en tu aparato."
      stats={[
        { icono: "📦", etiqueta: "Versión", valor: version },
        { icono: "🎮", etiqueta: "Juegos", valor: Object.keys(JUEGOS).length },
        { icono: "👥", etiqueta: "Perfiles", valor: perfiles.length },
        { icono: "💾", etiqueta: "Datos", valor: `${kb} KB` },
      ]}
      resultado={aviso ? { mensaje: aviso, tipo: tipoAviso } : null}
      ayuda={<span>El respaldo sirve para <b>guardar tu progreso fuera del móvil</b> o pasarlo a otro aparato. La caché solo guarda la app para jugar sin conexión.</span>}>
      <h4>📊 Estado</h4>
      <div className="fila-botones">
        <span className="chip">Compilado: <b>{fecha || "—"}</b></span>
        {cuota && <span className="chip">Navegador: <b>{(cuota.usage / 1048576).toFixed(1)} MB</b> usados</span>}
        <span className="chip">Jugando: <b>{activo.emoji} {activo.nombre}</b></span>
      </div>
      {top.length > 0 && (
        <>
          <h4 style={{ marginTop: 12 }}>🔥 Lo más jugado (ranking)</h4>
          <div className="fila-botones">
            {top.map((t, i) => (
              <span key={t.nombre} className="chip">{["🥇", "🥈", "🥉", "4️⃣", "5️⃣"][i]} {t.nombre}: <b>{t.jugadas}</b></span>
            ))}
          </div>
        </>
      )}
      <h4 style={{ marginTop: 12 }}>💾 Tus datos</h4>
      <div className="fila-botones">
        <button className="btn-principal" onClick={exportar}>⬇️ Exportar respaldo</button>
        <button className="btn-suave" onClick={() => fileRef.current?.click()}>⬆️ Importar respaldo</button>
        <input ref={fileRef} type="file" accept="application/json" hidden onChange={importar} aria-label="Importar respaldo" />
      </div>
      {historial.length > 0 && (
        <>
          <h4 style={{ marginTop: 12 }}>🎰 Últimas apuestas</h4>
          <div className="fila-botones">
            {historial.slice(0, 8).map((h, i) => (
              <span key={i} className="chip">{h.gano ? "✅" : "❌"} {h.apuesta}→{h.premio}</span>
            ))}
          </div>
        </>
      )}
      <h4 style={{ marginTop: 12 }}>🧹 Mantenimiento</h4>
      <div className="fila-botones">
        <button className="btn-suave" onClick={limpiarCache}>🗑️ Limpiar caché y actualizar</button>
        <button className="btn-suave" onClick={borrarProgreso}>⚠️ Borrar progreso de {activo.nombre}</button>
      </div>
    </GameShell>
  );
}
