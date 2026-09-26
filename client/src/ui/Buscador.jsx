import { useMemo, useRef, useState } from "react";
import { JUEGOS } from "../games/GAMES";
import { Icono, IconoJuego } from "./Iconos";
import { sfx } from "../suite/sonido";

const MAX_RESULTADOS = 8;

/** Resalta lo que coincide con la búsqueda. */
function Resaltado({ texto, query }) {
  const q = query.trim().toLowerCase();
  const i = texto.toLowerCase().indexOf(q);
  if (!q || i < 0) return <>{texto}</>;
  return <>{texto.slice(0, i)}<mark>{texto.slice(i, i + q.length)}</mark>{texto.slice(i + q.length)}</>;
}

/** Buscador remake: filtra la lista Y muestra resultados instantáneos
 *  con navegación por teclado (↑↓ + Enter). */
export default function Buscador({ busqueda, setBusqueda, inputRef, stats, desafioId, onIr, onAleatorio }) {
  const [abierto, setAbierto] = useState(false);
  const [cursor, setCursor] = useState(0);
  const cerrando = useRef(false);

  const resultados = useMemo(() => {
    const b = busqueda.trim().toLowerCase();
    if (!b) return [];
    const ids = Object.keys(JUEGOS).filter(id =>
      JUEGOS[id].nombre.toLowerCase().includes(b) || JUEGOS[id].tag.toLowerCase().includes(b));
    const porNombre = ids.filter(id => JUEGOS[id].nombre.toLowerCase().includes(b));
    const porTag = ids.filter(id => !JUEGOS[id].nombre.toLowerCase().includes(b));
    return [...porNombre, ...porTag].slice(0, MAX_RESULTADOS);
  }, [busqueda]);

  const total = useMemo(() => {
    const b = busqueda.trim().toLowerCase();
    if (!b) return 0;
    return Object.keys(JUEGOS).filter(id =>
      JUEGOS[id].nombre.toLowerCase().includes(b) || JUEGOS[id].tag.toLowerCase().includes(b)).length;
  }, [busqueda]);

  function elegir(id) {
    if (!id) return;
    sfx.clic();
    setAbierto(false);
    onIr(id);
  }
  function limpiar() {
    setBusqueda("");
    setCursor(0);
    inputRef.current?.focus();
  }
  // El blur cierra con un pelín de espera para que el toque llegue antes
  function alBlur() {
    cerrando.current = true;
    setTimeout(() => {
      if (cerrando.current) setAbierto(false);
      cerrando.current = false;
    }, 150);
  }

  function alTeclado(e) {
    if (e.key === "ArrowDown" && resultados.length) {
      e.preventDefault();
      setCursor(c => (c + 1) % resultados.length);
    } else if (e.key === "ArrowUp" && resultados.length) {
      e.preventDefault();
      setCursor(c => (c - 1 + resultados.length) % resultados.length);
    } else if (e.key === "Enter" && busqueda.trim() && resultados.length) {
      e.preventDefault();
      elegir(resultados[Math.min(cursor, resultados.length - 1)]);
    }
  }

  const mostrando = abierto && busqueda.trim().length > 0;

  return (
    <div className="buscador-wrap">
      <div className={`buscador${mostrando ? " con-resultados" : ""}`}>
        <Icono n="buscar" size={17} />
        <input ref={inputRef} type="search" value={busqueda}
          onChange={e => { setBusqueda(e.target.value); setCursor(0); setAbierto(true); }}
          onFocus={() => setAbierto(true)}
          onBlur={alBlur}
          onKeyDown={alTeclado}
          placeholder="Buscar juego…" aria-label="Buscar juego"
          autoComplete="off" role="combobox" aria-expanded={mostrando} aria-controls="buscador-lista" />
        {busqueda
          ? <button className="buscar-limpiar" onMouseDown={e => e.preventDefault()} onClick={limpiar} aria-label="Limpiar búsqueda">✕</button>
          : <kbd className="buscar-kbd" aria-hidden>/</kbd>}
      </div>
      {mostrando && (
        <div className="buscador-panel" id="buscador-lista" role="listbox" aria-label="Resultados">
          {resultados.map((id, i) => {
            const j = JUEGOS[id];
            const s = stats[j.nombre];
            const esDesafio = desafioId === id;
            return (
              <button key={id} role="option" aria-selected={i === cursor}
                className={`buscador-item${i === cursor ? " on" : ""}`}
                onMouseDown={e => e.preventDefault()}
                onClick={() => elegir(id)}
                onMouseEnter={() => setCursor(i)}>
                <span className="buscador-emoji"><IconoJuego id={id} size={26} /></span>
                <span className="buscador-txt">
                  <b><Resaltado texto={j.nombre} query={busqueda} /></b>
                  <small>{j.tag}{esDesafio ? " · ×2 XP" : ""}{s?.mejor ? ` · ★ ${s.mejor}` : ""}</small>
                </span>
                <span className="buscador-ir" aria-hidden>→</span>
              </button>
            );
          })}
          {resultados.length === 0 && (
            <div className="buscador-vacio">
              <p>Sin resultados para “{busqueda.trim()}”.</p>
              <button className="btn-suave" onMouseDown={e => e.preventDefault()}
                onClick={() => { setAbierto(false); onAleatorio(); }}>
                🎲 Probar suerte
              </button>
            </div>
          )}
          {total > MAX_RESULTADOS && (
            <div className="buscador-pie">+{total - MAX_RESULTADOS} más en la lista ↓</div>
          )}
        </div>
      )}
    </div>
  );
}
