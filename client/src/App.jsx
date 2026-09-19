import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { JUEGOS, CATEGORIAS, TEMAS } from "./games/GAMES";
import Marcador from "./games/Marcador";
import { getStats } from "./api";
import { cargarProgreso, guardarProgreso, nivelDe, desafioDelDia, LOGROS } from "./suite/progreso";
import { sonidoActivado, cambiarSonido, sfx } from "./suite/sonido";
import { Icono, IconoJuego, LogoArcade } from "./ui/Iconos";

function leerFavs() {
  try { return JSON.parse(localStorage.getItem("arcade-favs") || "[]"); } catch { return []; }
}

export default function App() {
  const [activo, setActivo] = useState(() => window.location.hash.replace("#", "") || "inicio");
  const [busqueda, setBusqueda] = useState("");
  const [filtroCat, setFiltroCat] = useState("todas");
  const [tema, setTema] = useState(() => localStorage.getItem("arcade-tema") || "neon");
  const [rgb, setRgb] = useState(() => localStorage.getItem("arcade-rgb") !== "off");
  const [sonido, setSonido] = useState(() => sonidoActivado());
  const [stats, setStats] = useState({});
  const [prog, setProg] = useState(() => cargarProgreso());
  const [toast, setToast] = useState("");
  const [favs, setFavs] = useState(leerFavs);
  const [instalable, setInstalable] = useState(false);
  const [instalada, setInstalada] = useState(() =>
    window.matchMedia?.("(display-mode: standalone)").matches || navigator.standalone === true
  );
  const promptInstalar = useRef(null);
  const buscarRef = useRef(null);
  const juego = JUEGOS[activo];
  const totalJuegos = Object.keys(JUEGOS).length;

  useEffect(() => {
    document.body.dataset.tema = tema;
    localStorage.setItem("arcade-tema", tema);
  }, [tema]);

  useEffect(() => {
    document.body.dataset.rgb = rgb ? "on" : "off";
    localStorage.setItem("arcade-rgb", rgb ? "on" : "off");
  }, [rgb]);

  // Desafío del día + escucha de progresión
  useEffect(() => {
    const ids = Object.keys(JUEGOS);
    const hoy = new Date().toISOString().slice(0, 10);
    setProg(p => {
      if (p.desafio?.fecha !== hoy) {
        const n = { ...p, desafio: { fecha: hoy, juego: desafioDelDia(ids), hecho: false } };
        guardarProgreso(n);
        return n;
      }
      return p;
    });
    const fn = e => {
      setProg(e.detail);
      const d = e.detail;
      const ultimo = d.logros?.[d.logros.length - 1];
      if (ultimo) {
        const l = LOGROS.find(x => x.id === ultimo);
        if (l) {
          setToast(`🏅 ¡Logro! ${l.nombre}: ${l.desc}`);
          setTimeout(() => setToast(""), 4000);
        }
      }
    };
    window.addEventListener("arcade-progreso", fn);
    return () => window.removeEventListener("arcade-progreso", fn);
  }, []);

  useEffect(() => {
    getStats().then(setStats).catch(() => {});
  }, [activo]);

  function ir(id) {
    setActivo(id);
    sfx.clic();
    window.location.hash = id === "inicio" ? "" : id;
  }

  function toggleFav(id, e) {
    e?.stopPropagation();
    setFavs(f => {
      const n = f.includes(id) ? f.filter(x => x !== id) : [...f, id];
      localStorage.setItem("arcade-favs", JSON.stringify(n));
      return n;
    });
    sfx.clic();
  }

  function aleatorio() {
    const ids = Object.keys(JUEGOS);
    ir(ids[Math.floor(Math.random() * ids.length)]);
  }

  // PWA: captura el prompt de instalación (Chrome/Edge/Android/PC)
  useEffect(() => {
    const listo = e => {
      e.preventDefault();
      promptInstalar.current = e;
      setInstalable(true);
    };
    const hecho = () => {
      promptInstalar.current = null;
      setInstalable(false);
      setInstalada(true);
    };
    window.addEventListener("beforeinstallprompt", listo);
    window.addEventListener("appinstalled", hecho);
    return () => {
      window.removeEventListener("beforeinstallprompt", listo);
      window.removeEventListener("appinstalled", hecho);
    };
  }, []);

  async function instalar() {
    const e = promptInstalar.current;
    if (!e) return;
    e.prompt();
    try { await e.userChoice; } catch { /* noop */ }
    promptInstalar.current = null;
    setInstalable(false);
  }

  const esIOS = /iphone|ipad|ipod/i.test(navigator.userAgent || "");
  useEffect(() => {
    const fn = e => {
      const tag = document.activeElement?.tagName;
      const escribiendo = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
      if (e.key === "/" && !escribiendo) { e.preventDefault(); buscarRef.current?.focus(); }
      else if (e.key === "Escape") { setBusqueda(""); buscarRef.current?.blur(); ir("inicio"); }
      else if ((e.key === "g" || e.key === "G") && !escribiendo && activo === "inicio") aleatorio();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activo]);

  // Hash externo (atrás/adelante del navegador)
  useEffect(() => {
    const fn = () => setActivo(window.location.hash.replace("#", "") || "inicio");
    window.addEventListener("hashchange", fn);
    return () => window.removeEventListener("hashchange", fn);
  }, []);

  const totalPartidas = useMemo(
    () => Object.values(stats).reduce((s, v) => s + (v.jugadas || 0), 0),
    [stats]
  );

  const filtrados = useMemo(() => {
    let ids = Object.keys(JUEGOS);
    if (filtroCat === "favs") ids = ids.filter(id => favs.includes(id));
    else if (filtroCat !== "todas") {
      const cat = CATEGORIAS.find(c => c.id === filtroCat);
      ids = cat ? cat.juegos : ids;
    }
    if (busqueda.trim()) {
      const b = busqueda.toLowerCase();
      ids = ids.filter(id =>
        JUEGOS[id].nombre.toLowerCase().includes(b) || JUEGOS[id].tag.toLowerCase().includes(b)
      );
    }
    return ids;
  }, [busqueda, filtroCat, favs]);

  const { nivel, enNivel, need } = nivelDe(prog.xp || 0);
  const desafioJuego = JUEGOS[prog.desafio?.juego];
  const probados = Object.keys(prog.porJuego || {}).length;

  return (
    <div className="app">
      <div className="aurora a1" aria-hidden />
      <div className="aurora a2" aria-hidden />
      <div className="aurora a3" aria-hidden />
      <aside className="lateral">
        <div className="logo" onClick={() => ir("inicio")} style={{ cursor: "pointer" }}>
          <div className="logo-orb"><LogoArcade size={34} /></div>
          <h1>PaLoMuchacho</h1>
          <p>{totalJuegos} juegos · {totalPartidas} partidas</p>
        </div>

        <div className="progreso-box">
          <span className="nivel"><Icono n="nivel" size={15} /> Nivel {nivel}</span>
          <span style={{ color: "var(--texto-suave)", fontSize: ".78rem" }}> · {prog.xp || 0} XP · <Icono n="fuego" size={13} /> racha {prog.racha || 0}</span>
          <div className="xp-bar"><div style={{ width: `${Math.round((enNivel / need) * 100)}%` }} /></div>
          <small style={{ color: "var(--texto-suave)" }}>{enNivel}/{need} XP para el nivel {nivel + 1} · 🎮 {probados}/{totalJuegos} probados</small>
          {prog.desafio?.juego && (
            <div className="desafio-box">
              <Icono n="desafio" size={14} /> Desafío del día: <b>{desafioJuego?.nombre || prog.desafio.juego}</b> {prog.desafio.hecho ? "✅ (¡doble XP conseguido!)" : "· ¡doble XP! ⚡"}
              {!prog.desafio.hecho && <button className="switch" style={{ marginLeft: 8 }} onClick={() => ir(prog.desafio.juego)}>Jugar →</button>}
            </div>
          )}
          <div className="logros-lista">
            {LOGROS.map(l => (
              <span key={l.id} title={l.desc} className={`logro ${prog.logros?.includes(l.id) ? "on" : ""}`}>
                <Icono n={prog.logros?.includes(l.id) ? "estrella-llena" : "estrella"} size={11} /> {l.nombre}
              </span>
            ))}
          </div>
        </div>

        <div className="buscador">
          <Icono n="buscar" size={16} />
          <input ref={buscarRef} value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar juego... ( / )" />
          {busqueda && <button className="chip-cat" onClick={() => setBusqueda("")}>✕</button>}
        </div>

        <button className={`nav-item ${activo === "inicio" ? "activo" : ""}`} onClick={() => ir("inicio")}>
          <Icono n="inicio" size={18} /> Inicio <span className="flecha">→</span>
        </button>
        <button className={`nav-item ${activo === "marcador" ? "activo" : ""}`} onClick={() => ir("marcador")}>
          <Icono n="marcador" size={18} /> Marcador <span className="flecha">→</span>
        </button>

        <p className="cat">Categorías</p>
        <div className="chips-cat">
          <button className={filtroCat === "todas" ? "chip-cat on" : "chip-cat"} onClick={() => setFiltroCat("todas")}>Todo</button>
          <button className={filtroCat === "favs" ? "chip-cat on" : "chip-cat"} onClick={() => { setFiltroCat("favs"); ir("inicio"); }}><Icono n="estrella" size={12} /> ({favs.length})</button>
          {CATEGORIAS.map(c => (
            <button key={c.id} className={filtroCat === c.id ? "chip-cat on" : "chip-cat"}
              onClick={() => { setFiltroCat(c.id); ir("inicio"); }}><Icono n={c.icono} size={12} /> {c.nombre}</button>
          ))}
        </div>

        <div className="nav-scroll">
          {CATEGORIAS.map(cat => (
            <div key={cat.id}>
              <p className="cat"><Icono n={cat.icono} size={12} /> {cat.nombre}</p>
              {cat.juegos.map(id => {
                const j = JUEGOS[id];
                if (!j) return null;
                const s = stats[j.nombre];
                const esDesafio = prog.desafio?.juego === id && !prog.desafio?.hecho;
                return (
                  <button key={id} className={`nav-item ${activo === id ? "activo" : ""}`} onClick={() => ir(id)}>
                    <span className="miniatura" style={{ background: j.grad }}><IconoJuego id={id} size={18} /></span>
                    <span className="nav-txt">{j.nombre}
                      {esDesafio ? <small> · ×2</small> : s?.mejor ? <small> · {s.mejor}</small> : null}
                    </span>
                    <span className="flecha">→</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="tema-box">
          <p className="cat">Tema visual</p>
          <div className="tema-btns">
            {[["neon", "luna", "Neón"], ["retro", "retro", "Retro"], ["claro", "sol", "Claro"]].map(([id, icon, nombre]) => (
              <button key={id} title={nombre}
                className={tema === id ? "tema-btn on" : "tema-btn"}
                onClick={() => { setTema(id); sfx.clic(); }}><Icono n={icon} size={20} /></button>
            ))}
          </div>
          <div className="interruptores">
            <button className={`switch ${rgb ? "on" : ""}`} onClick={() => { setRgb(!rgb); sfx.clic(); }}>
              <Icono n="rgb" size={13} /> {rgb ? "RGB ON" : "RGB OFF"}
            </button>
            <button className={`switch ${sonido ? "on" : ""}`} onClick={() => setSonido(cambiarSonido())}>
              <Icono n={sonido ? "sonido" : "silencio"} size={13} /> {sonido ? "Sonido" : "Mudo"}
            </button>
          </div>
        </div>
      </aside>

      <main className="contenido">
        {activo === "inicio" && (
          <div className="inicio">
            <header className="hero">
              <div className="hero-fondo" />
              <div className="hero-txt">
                <span className="pill"><Icono n="mando" size={13} /> {totalJuegos} juegos · modo RGB · XP y niveles · sonidos</span>
                <h2>Tu arcade pa' lo muchacho, <em>modo turbo</em></h2>
                <p>{totalJuegos} juegos: clásicos, casino, tableros, arcade puro y mente. Luces RGB, progresión con XP, rachas, logros y desafío diario con doble XP. Todo con teclado (flechas/WASD) + ratón + táctil. Atajos: <b>/</b> buscar · <b>Esc</b> inicio · <b>G</b> aleatorio.</p>
                <div className="hero-btns">
                  <button className="btn-principal" onClick={aleatorio}><Icono n="aleatorio" size={15} /> Juego aleatorio (G)</button>
                  {prog.desafio?.juego && !prog.desafio.hecho && (
                    <button className="btn-exito" onClick={() => ir(prog.desafio.juego)}><Icono n="desafio" size={15} /> Desafío: {desafioJuego?.nombre}</button>
                  )}
                  <button className="btn-suave" onClick={() => ir("marcador")}><Icono n="marcador" size={15} /> Ver marcador</button>
                  {instalable && !instalada && (
                    <button className="btn-exito" onClick={instalar}><Icono n="descargar" size={15} /> Instalar app</button>
                  )}
                </div>
                {esIOS && !instalada && !instalable && (
                  <p className="aviso info" style={{ margin: "10px 0 0" }}>En iPhone/iPad: Compartir → «Añadir a pantalla de inicio» para instalarla.</p>
                )}
                {!instalada && !instalable && !esIOS && (
                  <details className="aviso info" style={{ margin: "10px 0 0" }}>
                    <summary>📲 ¿Cómo instalo ArcadePaLoMuchacho?</summary>
                    <p style={{ margin: "8px 0 0" }}>
                      <b>Android (Chrome):</b> menú ⋮ → «Instalar app» o «Añadir a pantalla de inicio».
                      <br /><b>PC (Chrome/Edge):</b> icono de instalación en la barra de direcciones o menú → «Instalar».
                      <br /><b>iPhone/iPad:</b> Compartir → «Añadir a pantalla de inicio».
                    </p>
                  </details>
                )}
                <div className="hero-stats">
                  <div><b>{totalJuegos}</b><span>juegos</span></div>
                  <div><b>{CATEGORIAS.length}</b><span>categorías</span></div>
                  <div><b>{totalPartidas}</b><span>partidas</span></div>
                  <div><b>Nv.{nivel}</b><span>{prog.xp || 0} XP</span></div>
                </div>
              </div>
              <div className="hero-art" aria-hidden>
                <div className="orbita o1"><IconoJuego id="tragaperras" size={30} /></div>
                <div className="orbita o2"><IconoJuego id="dino" size={30} /></div>
                <div className="orbita o3"><Icono n="reflejos" size={30} /></div>
                <div className="orbita o4"><IconoJuego id="juego2048" size={30} /></div>
                <div className="hero-nave"><Icono n="naves" size={72} /></div>
              </div>
            </header>

            <section className="seccion-cartas">
              <h3>{filtroCat === "todas" ? "Todos los juegos" : filtroCat === "favs" ? "⭐ Favoritos" : CATEGORIAS.find(c => c.id === filtroCat)?.nombre} <small>({filtrados.length})</small></h3>
              <div className="grid-cartas">
                {filtrados.map(id => {
                  const j = JUEGOS[id];
                  const s = stats[j.nombre];
                  const esDesafio = prog.desafio?.juego === id && !prog.desafio?.hecho;
                  const esFav = favs.includes(id);
                  return (
                    <article key={id} className="carta" onClick={() => ir(id)} tabIndex={0} role="button" aria-label={`Jugar ${j.nombre}`}
                      onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); ir(id); } }}>
                      <div className="carta-banner" style={{ background: j.grad }}>
                        <span className="carta-emoji"><IconoJuego id={id} size={46} /></span>
                        <span className="carta-tag">{j.tag}</span>
                        <button className={`fav-btn ${esFav ? "on" : ""}`} title={esFav ? "Quitar de favoritos" : "Añadir a favoritos"}
                          onClick={e => toggleFav(id, e)} onKeyDown={e => e.stopPropagation()} aria-label="Favorito">
                          <Icono n={esFav ? "estrella-llena" : "estrella"} size={15} />
                        </button>
                        {esDesafio
                          ? <span className="carta-record"><Icono n="desafio" size={11} /> ×2 XP</span>
                          : s?.mejor ? <span className="carta-record"><Icono n="estrella-llena" size={11} /> {s.mejor}</span> : null}
                      </div>
                      <div className="carta-cuerpo">
                        <h4>{j.nombre}</h4>
                        <p>{j.descripcion}</p>
                        <span className="carta-jugar">Jugar →</span>
                      </div>
                    </article>
                  );
                })}
              </div>
              {filtrados.length === 0 && <p className="aviso info">{filtroCat === "favs" ? "Sin favoritos todavía: pulsa ☆ en cualquier juego." : `Sin resultados para “${busqueda}”.`}</p>}
            </section>
          </div>
        )}
        {activo === "marcador" ? <Marcador /> : activo !== "inicio" && (() => {
          if (!juego) {
            return (
              <div className="gameshell">
                <div className="shell-head">
                  <div className="shell-icono">❓</div>
                  <div><h2>Juego no encontrado</h2><p className="sub">Ese enlace no existe en ArcadePaLoMuchacho.</p></div>
                </div>
                <div className="fila-botones"><button className="btn-principal" onClick={() => ir("inicio")}>← Volver al inicio</button></div>
              </div>
            );
          }
          const C = juego.Component;
          return (
            <Suspense fallback={<div className="gameshell"><p className="sub">⚡ Cargando juego…</p></div>}>
              <C key={activo} />
            </Suspense>
          );
        })()}
      </main>
      {toast && <div className="toast-logro"><Icono n="estrella-llena" size={15} /> {toast}</div>}
    </div>
  );
}
