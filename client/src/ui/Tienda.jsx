import { useEffect, useState } from "react";
import GameShell from "./GameShell";
import { TIENDA_ITEMS, cargarTienda, comprar, dobleXpActivo, fichasX2Activo, minutosRestantes, escudosRestantes } from "../suite/tienda";
import { cargarBilletera, apostar, cobrar, fijarLimite, perdidoHoy, MONEDA } from "../suite/billetera";
import { cargarProgreso, guardarProgreso } from "../suite/progreso";
import { sfx } from "../suite/sonido";

const CATS = ["Todo", "Temas", "Boosts", "Diversión"];

function catDe(item) {
  if (item.cat) return item.cat;
  return item.tipo === "tema" ? "Temas" : item.tipo === "caja" ? "Diversión" : "Boosts";
}

/** Tienda remake: pestañas por sección, estados en vivo, caja misteriosa,
 *  pack de XP y juego responsable. Todo virtual, sin dinero real. */
export default function Tienda() {
  const [saldo, setSaldo] = useState(() => cargarBilletera().saldo);
  const [inv, setInv] = useState(() => cargarTienda());
  const [cat, setCat] = useState("Todo");
  const [aviso, setAviso] = useState("");
  const [tipoAviso, setTipoAviso] = useState("");
  const [limite, setLimite] = useState(() => cargarBilletera().limitePerdida ?? 1000);
  const [perdido, setPerdido] = useState(() => perdidoHoy());

  useEffect(() => {
    const fb = e => { setSaldo(e.detail.saldo); setPerdido(perdidoHoy()); };
    const ft = e => setInv(e.detail);
    window.addEventListener("aplm-billetera", fb);
    window.addEventListener("aplm-tienda", ft);
    const id = setInterval(() => { setInv(cargarTienda()); setPerdido(perdidoHoy()); }, 30000);
    return () => {
      window.removeEventListener("aplm-billetera", fb);
      window.removeEventListener("aplm-tienda", ft);
      clearInterval(id);
    };
  }, []);

  function decir(ok, texto) {
    setTipoAviso(ok ? "victoria" : "derrota");
    setAviso(texto);
    setTimeout(() => setAviso(""), 5000);
    if (ok) sfx.bien(); else sfx.mal();
  }

  function comprarItem(item) {
    const r = comprar(item.id, c => apostar(c));
    if (!r.ok) {
      decir(false, `⛔ ${r.motivo}. Juega partidas (+5, +15 si ganas) o reclama el bonus.`);
      return;
    }
    if (item.id === "caja-misteriosa") {
      const premio = 50 + Math.floor(Math.random() * 451);
      cobrar(premio);
      sfx.moneda();
      decir(true, premio >= 300 ? `🎁 ¡CAJA CALIENTE! Pagaste 200 y salieron ${premio} ${MONEDA}.` : `🎁 La caja traía ${premio} ${MONEDA} (pagaste 200).`);
      return;
    }
    if (item.id === "pack-xp") {
      try {
        const p = cargarProgreso();
        p.xp = (p.xp || 0) + 500;
        guardarProgreso(p);
        window.dispatchEvent(new CustomEvent("arcade-progreso", { detail: p }));
      } catch { /* noop */ }
      decir(true, `🌟 +500 XP directos a tu perfil. ¡A por el siguiente nivel!`);
      return;
    }
    if (item.tipo === "boost") decir(true, `✅ ¡${item.nombre} activo! Revisa el tiempo arriba.`);
    else if (item.tipo === "escudo") decir(true, `✅ ¡${item.nombre} conseguido! Tienes ${escudosRestantes()} escudo(s).`);
    else decir(true, `✅ ¡${item.nombre} conseguido! Actívalo en Tema visual.`);
  }

  function guardarLimite() {
    const v = fijarLimite(limite);
    setLimite(v);
    decir(true, v === 0 ? "Límite quitado. Juega con cabeza. 🧠" : `⛔ Límite diario: no podrás perder más de ${v} fichas al día.`);
  }

  const items = TIENDA_ITEMS.filter(i => cat === "Todo" || catDe(i) === cat);
  const xpMin = minutosRestantes("boost-xp");
  const fichasMin = minutosRestantes("boost-fichas");

  return (
    <GameShell titulo="Tienda" emoji="🛍️"
      descripcion="Temas, boosts y diversión con tus fichas. Todo es virtual: sin dinero real."
      stats={[
        { icono: MONEDA, etiqueta: "Saldo", valor: saldo },
        ...(dobleXpActivo() ? [{ icono: "⚡", etiqueta: "Doble XP", valor: `${xpMin} min` }] : []),
        ...(fichasX2Activo() ? [{ icono: "💰", etiqueta: "Fichas ×2", valor: `${fichasMin} min` }] : []),
        ...((inv.escudos || 0) > 0 ? [{ icono: "🛡️", etiqueta: "Escudos", valor: inv.escudos }] : []),
      ]}
      resultado={aviso ? { mensaje: aviso, tipo: tipoAviso } : null}
      ayuda={<>
        <span>Ganas <b>+5 fichas</b> por partida y <b>+15</b> si ganas{inv.fichasX2Hasta > Date.now() ? " (¡×2 activo!)" : ""}, más el <b>🎁 bonus diario de 500</b>.</span>
        <span>En el casino, cada <b>3 victorias seguidas</b> pagan +50% de bonus.</span>
      </>}>
      <div className="fila-botones" role="tablist" aria-label="Secciones de la tienda">
        {CATS.map(c => (
          <button key={c} role="tab" aria-selected={cat === c}
            className={cat === c ? "btn-principal" : "btn-suave"} onClick={() => { setCat(c); sfx.clic(); }}>{c}</button>
        ))}
      </div>
      <div className="tienda-grid">
        {items.map(item => {
          const owned = item.tipo === "tema" && inv.comprados.includes(item.id);
          const activoBoost = item.id === "boost-fichas" ? fichasX2Activo()
            : item.tipo === "boost" ? dobleXpActivo() : false;
          return (
            <article key={item.id} className={`tienda-card${owned ? " owned" : ""}`}>
              <span className="tienda-icono" aria-hidden>{item.icono}</span>
              <h4>{item.nombre}</h4>
              <p>{item.desc}</p>
              {activoBoost && <span className="chip victoria">⚡ Activo</span>}
              {owned
                ? <span className="chip">✅ Tuyo</span>
                : <button className="btn-principal" onClick={() => comprarItem(item)}>
                  {MONEDA} {item.precio}{item.tipo === "caja" || item.tipo === "xp" ? " · otra vez" : ""}
                </button>}
            </article>
          );
        })}
      </div>
      <div className="tienda-responsable">
        <h4>🧠 Juego responsable</h4>
        <p>Hoy vas <b>{perdido}</b> en pérdidas. Pon tu tope diario:</p>
        <div className="fila-botones">
          <input type="number" value={limite} min={0} step={100} max={100000}
            onChange={e => setLimite(e.target.value)} aria-label="Límite diario de pérdidas"
            style={{ width: 110, fontSize: "1rem", padding: "8px 10px", borderRadius: 10, textAlign: "center" }} />
          <button className="btn-suave" onClick={guardarLimite}>Fijar tope</button>
          <span className="chip">0 = sin tope</span>
        </div>
      </div>
    </GameShell>
  );
}
