import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { JUEGOS, CATEGORIAS, TEMAS } from "./games/GAMES";
import Marcador from "./games/Marcador";
import { getStats } from "./api";
import { cargarProgreso, guardarProgreso, nivelDe, desafioDelDia, LOGROS, misionesDelDia } from "./suite/progreso";
import { cargarBilletera, bonusDiario, bonusDisponible, rescate, MONEDA } from "./suite/billetera";
import { sonidoActivado, cambiarSonido, sfx } from "./suite/sonido";
import { Icono, IconoJuego, LogoArcade } from "./ui/Iconos";
import BotonesCompartir from "./ui/Compartir";
import BotonInstalar from "./ui/Instalar";
import ErrorJuego from "./ui/ErrorJuego";
import Tienda from "./ui/Tienda";
import Privacidad from "./ui/Privacidad";
import Perfiles from "./ui/Perfiles";
import { asegurarPerfiles, perfilActivo } from "./suite/perfiles";
import { tienes, dobleXpActivo, escudosRestantes } from "./suite/tienda";
import { ProveedorTemaJuego } from "./ui/GameShell";

// El progreso existente pasa al perfil "Jugador" antes del primer render.
asegurarPerfiles();

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
  const [hayUpdate, setHayUpdate] = useState(false);
  const [billetera, setBilletera] = useState(() => cargarBilletera());
  const [instalada, setInstalada] = useState(() =>
    window.matchMedia?.("(display-mode: standalone)").matches || navigator.standalone === true
  );
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [bannerOff, setBannerOff] = useState(false);
  const [perfil] = useState(() => perfilActivo());
  // La tienda avisa con "aplm-tienda": re-render para temas y potenciadores
  const [, setTickTienda] = useState(0);
  useEffect(() => {
    const fn = () => setTickTienda(t => t + 1);
    window.addEventListener("aplm-tienda", fn);
    return () => window.removeEventListener("aplm-tienda", fn);
  }, []);
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
    const fb = e => setBilletera(e.detail);
    window.addEventListener("aplm-billetera", fb);
    return () => {
      window.removeEventListener("arcade-progreso", fn);
      window.removeEventListener("aplm-billetera", fb);
    };
  }, []);

  useEffect(() => {
    getStats().then(setStats).catch(() => {});
  }, [activo]);

  function ir(id) {
    setActivo(id);
    setMenuAbierto(false);
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

  // PWA: hay versión nueva lista para estrenar
  useEffect(() => {
    const fn = () => setHayUpdate(true);
    window.addEventListener("aplm-update", fn);
    return () => window.removeEventListener("aplm-update", fn);
  }, []);

  // PWA: captura el prompt de instalación (Chrome/Edge/Android/PC)
  // Comparte el evento con el componente BotonInstalar vía window.__aplmInstallPrompt
  useEffect(() => {
    if (window.__aplmInstallPrompt) {
      promptInstalar.current = window.__aplmInstallPrompt;
      setInstalable(true);
    }
    const listo = e => {
      e.preventDefault();
      promptInstalar.current = e;
      window.__aplmInstallPrompt = e;
      setInstalable(true);
      window.dispatchEvent(new Event("aplm-instalable"));
    };
    const hecho = () => {
      promptInstalar.current = null;
      window.__aplmInstallPrompt = null;
      setInstalable(false);
      setInstalada(true);
      window.dispatchEvent(new Event("aplm-instalable"));
    };
    const sync = () => {
      if (!window.__aplmInstallPrompt) {
        promptInstalar.current = null;
        setInstalable(false);
      }
    };
    window.addEventListener("beforeinstallprompt", listo);
    window.addEventListener("appinstalled", hecho);
    window.addEventListener("aplm-instalable", sync);
    return () => {
      window.removeEventListener("beforeinstallprompt", listo);
      window.removeEventListener("appinstalled", hecho);
      window.removeEventListener("aplm-instalable", sync);
    };
  }, []);

  async function instalar() {
    const e = promptInstalar.current || window.__aplmInstallPrompt;
    if (!e) return;
    e.prompt();
    try { await e.userChoice; } catch { /* noop */ }
    promptInstalar.current = null;
    window.__aplmInstallPrompt = null;
    setInstalable(false);
    window.dispatchEvent(new Event("aplm-instalable"));
  }

  const esIOS = /iphone|ipad|ipod/i.test(navigator.userAgent || "");
  const esAndroid = /android/i.test(navigator.userAgent || "");
  // Altura real del viewport en móviles (corrige 100vh con barra del navegador)
  useEffect(() => {
    const fijar = () => {
      document.documentElement.style.setProperty("--app-height", `${window.innerHeight}px`);
    };
    fijar();
    window.addEventListener("resize", fijar);
    window.addEventListener("orientationchange", fijar);
    return () => {
      window.removeEventListener("resize", fijar);
      window.removeEventListener("orientationchange", fijar);
    };
  }, []);

  const mostrarBannerAuto = instalable && !instalada && !bannerOff;
  // Android sin prompt (Samsung/Firefox): banner manual una vez por sesión
  const mostrarBannerManual = !instalada && !instalable && !bannerOff && esAndroid && !esIOS;

  function irABuscar() {
    setMenuAbierto(true);
    // Espera a que el cajón se abra y enfoca el buscador
    setTimeout(() => buscarRef.current?.focus({ preventScroll: false }), 300);
  }
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
  const famDelJuego = useMemo(() => {
    if (!juego || activo === "inicio" || activo === "marcador") return null;
    return CATEGORIAS.find(c => c.juegos.includes(activo))?.id || null;
  }, [activo, juego]);
  const desafioJuego = JUEGOS[prog.desafio?.juego];
  const probados = Object.keys(prog.porJuego || {}).length;

  return (
    <div className="app">
      <div className="aurora a1" aria-hidden />
      <div className="aurora a2" aria-hidden />
      <div className="aurora a3" aria-hidden />
      <header className="barra-movil">
        <button className="btn-menu btn-suave" onClick={() => setMenuAbierto(true)} aria-label="Abrir menú">☰</button>
        <div className="logo-orb"><LogoArcade size={24} /></div>
        <b>PaLoMuchacho</b>
        <span className="espacio" />
        <BotonInstalar variante="icono" />
      </header>
      {menuAbierto && <div className="fondo-menu" onClick={() => setMenuAbierto(false)} aria-hidden />}
      <aside className={`lateral${menuAbierto ? " abierto" : ""}`}>
        <div className="logo" onClick={() => ir("inicio")} style={{ cursor: "pointer" }}>
          <div className="logo-orb"><LogoArcade size={34} /></div>
          <h1>PaLoMuchacho</h1>
          <p>{totalJuegos} juegos · {totalPartidas} partidas</p>
        </div>
        <button className="nav-item" onClick={() => ir("perfiles")} title="Cambiar de jugador">
          <span style={{ fontSize: "1.1rem" }}>{perfil.emoji}</span> {perfil.nombre} <span className="flecha">→</span>
        </button>

        <div className="caja-instalar">
          <span className="caja-instalar-txt">📲 <b>Llévame contigo</b><small>Juega sin conexión · pantalla completa</small></span>
          <BotonInstalar variante="lateral" />
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
          <div className="desafio-box" style={{ marginTop: 6 }}>
            <Icono n="desafio" size={14} /> <b>Misiones de hoy</b> 🎯
            {misionesDelDia(prog).map(m => (
              <div key={m.id} style={{ fontSize: ".78rem", marginTop: 4 }}>
                <span>{m.hecha ? "✅" : "·"} {m.nombre} ({m.actual}/{m.meta}) <small style={{ color: "var(--texto-suave)" }}>+{m.premio}🪙</small></span>
                <div className="xp-bar" style={{ height: 5, marginTop: 2 }}><div style={{ width: `${Math.round((m.actual / m.meta) * 100)}%` }} /></div>
              </div>
            ))}
          </div>
          <div className="logros-lista">
            {LOGROS.map(l => (
              <span key={l.id} title={l.desc} className={`logro ${prog.logros?.includes(l.id) ? "on" : ""}`}>
                <Icono n={prog.logros?.includes(l.id) ? "estrella-llena" : "estrella"} size={11} /> {l.nombre}
              </span>
            ))}
          </div>
        </div>

        <div className="billetera-box">
          <span className="nivel">{MONEDA} {billetera.saldo}</span>
          <span style={{ color: "var(--texto-suave)", fontSize: ".78rem" }}> fichas</span>
          <div className="interruptores" style={{ marginTop: 6 }}>
            <button className="switch on" onClick={() => { ir("tienda"); }}>
              🛍️ Tienda
            </button>
            {bonusDisponible() ? (
              <button className="switch on" onClick={() => {
                const c = bonusDiario() || rescate();
                if (c > 0) { setToast(`🎁 +${c} fichas en tu billetera`); setTimeout(() => setToast(""), 3000); sfx.clic(); }
              }}>
                🎁 Bonus +500
              </button>
            ) : (
              <button className="switch" disabled title="Vuelve mañana por más">🎁 Bonus reclamado</button>
            )}
          </div>
          <small style={{ color: "var(--texto-suave)" }}>Fichas virtuales · solo por diversión · +5 por partida</small>
          {(dobleXpActivo() || escudosRestantes() > 0) && (
            <div className="chips-cat" style={{ marginTop: 6 }}>
              {dobleXpActivo() && <span className="chip-cat on">⚡ Doble XP</span>}
              {escudosRestantes() > 0 && <span className="chip-cat on">🛡️ ×{escudosRestantes()}</span>}
            </div>
          )}
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
        <button className={`nav-item ${activo === "tienda" ? "activo" : ""}`} onClick={() => ir("tienda")}>
          <span style={{ fontSize: "1.1rem" }}>🛍️</span> Tienda <span className="flecha">→</span>
        </button>
        <button className={`nav-item ${activo === "perfiles" ? "activo" : ""}`} onClick={() => ir("perfiles")}>
          <span style={{ fontSize: "1.1rem" }}>👥</span> Perfiles <span className="flecha">→</span>
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
            {[["neon", "luna", "Neón"], ["retro", "retro", "Retro"], ["claro", "sol", "Claro"], ["playa", "playa", "Playa"],
              ...(tienes("tema-dorado") ? [["dorado", "estrella-llena", "Dorado 👑"]] : []),
              ...(tienes("tema-oceano") ? [["oceano", "pesca", "Océano 🌊"]] : []),
              ...(tienes("tema-atardecer") ? [["atardecer", "sol", "Atardecer 🌅"]] : []),
              ...(tienes("tema-bosque") ? [["bosque", "estrella", "Bosque 🌲"]] : [])].map(([id, icon, nombre]) => (
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
          <p style={{ color: "var(--texto-suave)", fontSize: ".72rem", margin: "10px 0 0" }}>
            v{typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "?"} · {typeof __BUILD_DATE__ !== "undefined" ? __BUILD_DATE__ : ""}
          </p>
        </div>
        <footer className="pie-lateral">
          <button className="enlace-pie" onClick={() => ir("privacidad")}>🔒 Privacidad</button>
          <span aria-hidden>·</span>
          <button className="enlace-pie" onClick={() => ir("tienda")}>🛍️ Tienda</button>
          <span aria-hidden>·</span>
          <a className="enlace-pie" href="https://github.com/WilmerF17/Arcade-de-Juegos" target="_blank" rel="noopener">Código</a>
        </footer>
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
                  <BotonesCompartir texto={`🕹️ Juego ${totalJuegos} minijuegos gratis en ArcadePaLoMuchacho: XP, logros y desafío diario. ¡Supérame!`} />
                  <BotonInstalar variante="hero" />
                </div>
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
        {activo === "marcador" ? <Marcador /> : activo === "tienda" ? <Tienda /> : activo === "privacidad" ? <Privacidad /> : activo === "perfiles" ? <Perfiles /> : activo !== "inicio" && (() => {
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
            <ProveedorTemaJuego value={{ tira: juego.grad, fam: famDelJuego }}>
              <ErrorJuego key={`err-${activo}`} alInicio={() => ir("inicio")}>
                <Suspense fallback={
                  <div className="gameshell" aria-busy="true" aria-label="Cargando juego">
                    <div className="shell-head">
                      <div className="shell-icono esqueleto" />
                      <div style={{ flex: 1 }}>
                        <div className="esqueleto esq-titulo" />
                        <div className="esqueleto esq-sub" />
                      </div>
                    </div>
                    <div className="esqueleto esq-bloque" />
                    <div className="esqueleto esq-bloque corto" />
                  </div>
                }>
                  <C key={activo} />
                </Suspense>
              </ErrorJuego>
            </ProveedorTemaJuego>
          );
        })()}
      </main>
      {toast && <div className="toast-logro"><Icono n="estrella-llena" size={15} /> {toast}</div>}
      {/* Nav inferior móvil: pulgar, 4 destinos, siempre visible */}
      <nav className="nav-movil" aria-label="Navegación principal">
        <button className={activo === "inicio" ? "on" : ""} onClick={() => ir("inicio")} aria-label="Inicio">
          <span className="ico">🏠</span>Inicio
        </button>
        <button onClick={aleatorio} aria-label="Juego aleatorio">
          <span className="ico">🎲</span>Azar
        </button>
        <button onClick={irABuscar} aria-label="Buscar juego">
          <span className="ico">🔍</span>Buscar
        </button>
        <button className={activo === "marcador" ? "on" : ""} onClick={() => ir("marcador")} aria-label="Marcador">
          <span className="ico">🏆</span>Récords
        </button>
      </nav>
      {mostrarBannerAuto && (
        <div className="banner-instalar">
          <span style={{ fontSize: "1.6rem" }}>📲</span>
          <span>Llévame contigo<small>Juega sin conexión · ocupa poco</small></span>
          <button className="instalar" onClick={instalar}>Instalar</button>
          <button className="cerrar" onClick={() => setBannerOff(true)} aria-label="Cerrar">✕</button>
        </div>
      )}
      {mostrarBannerManual && (
        <div className="banner-instalar">
          <span style={{ fontSize: "1.6rem" }}>📲</span>
          <span>Añádeme a tu inicio<small>Menú → «Añadir a pantalla de inicio»</small></span>
          <button className="cerrar" onClick={() => setBannerOff(true)} aria-label="Cerrar">✕</button>
        </div>
      )}
      {hayUpdate && (
        <div className="toast-logro" style={{ cursor: "pointer" }} role="button" tabIndex={0}
          onClick={() => { setHayUpdate(false); window.__aplmActualizar ? window.__aplmActualizar() : window.location.reload(); }}
          onKeyDown={e => { if (e.key === "Enter") { setHayUpdate(false); window.__aplmActualizar ? window.__aplmActualizar() : window.location.reload(); } }}>
          <Icono n="refrescar" size={15} /> ⚡ ¡Nueva versión lista! Toca para actualizar.
        </div>
      )}
    </div>
  );
}
