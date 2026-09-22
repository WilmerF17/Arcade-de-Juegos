import { useEffect, useState } from "react";
import GameShell from "./GameShell";
import { TIENDA_ITEMS, cargarTienda, comprar, dobleXpActivo, escudosRestantes } from "../suite/tienda";
import { cargarBilletera, apostar, MONEDA } from "../suite/billetera";
import { sfx } from "../suite/sonido";

/** Tienda: gasta fichas virtuales en temas premium y potenciadores (sin dinero real). */
export default function Tienda() {
  const [saldo, setSaldo] = useState(() => cargarBilletera().saldo);
  const [inv, setInv] = useState(() => cargarTienda());
  const [aviso, setAviso] = useState("");
  const [tipoAviso, setTipoAviso] = useState("");

  useEffect(() => {
    const fb = e => setSaldo(e.detail.saldo);
    const ft = e => setInv(e.detail);
    window.addEventListener("aplm-billetera", fb);
    window.addEventListener("aplm-tienda", ft);
    const id = setInterval(() => setInv(cargarTienda()), 30000);
    return () => {
      window.removeEventListener("aplm-billetera", fb);
      window.removeEventListener("aplm-tienda", ft);
      clearInterval(id);
    };
  }, []);

  function comprarItem(item) {
    const r = comprar(item.id, c => apostar(c));
    if (r.ok) {
      sfx.bien();
      setTipoAviso("victoria");
      setAviso(`✅ ¡${item.nombre} conseguido! ${item.tipo === "boost" ? "Doble XP activo 30 min." : item.tipo === "escudo" ? `Tienes ${escudosRestantes()} escudo(s).` : "Actívalo en Tema visual."}`);
    } else {
      sfx.mal();
      setTipoAviso("derrota");
      setAviso(`⛔ ${r.motivo}. Te faltan fichas: juega partidas (+5, +15 si ganas), reclama el bonus o apuesta en el casino.`);
    }
    setTimeout(() => setAviso(""), 5000);
  }

  const boostMin = Math.max(0, Math.ceil((inv.boosterXpHasta - Date.now()) / 60000));

  return (
    <GameShell titulo="Tienda" emoji="🛍️"
      descripcion="Gasta tus fichas en temas exclusivos y potenciadores. Todo es virtual: sin dinero real."
      stats={[
        { icono: MONEDA, etiqueta: "Saldo", valor: saldo },
        ...(dobleXpActivo() ? [{ icono: "⚡", etiqueta: "Doble XP", valor: `${boostMin} min` }] : []),
        ...((inv.escudos || 0) > 0 ? [{ icono: "🛡️", etiqueta: "Escudos", valor: inv.escudos }] : []),
      ]}
      resultado={aviso ? { mensaje: aviso, tipo: tipoAviso } : null}
      ayuda={<>
        <span>Ganas <b>+5 fichas</b> por partida y <b>+15</b> si ganas, además del <b>🎁 bonus diario de 500</b>.</span>
        <span>Los temas comprados se activan abajo en <b>Tema visual</b> del menú.</span>
      </>}>
      <div className="tienda-grid">
        {TIENDA_ITEMS.map(item => {
          const owned = item.tipo !== "boost" && item.tipo !== "escudo" && inv.comprados.includes(item.id);
          return (
            <article key={item.id} className={`tienda-card${owned ? " owned" : ""}`}>
              <span className="tienda-icono" aria-hidden>{item.icono}</span>
              <h4>{item.nombre}</h4>
              <p>{item.desc}</p>
              {owned
                ? <span className="chip">✅ Tuyo</span>
                : <button className="btn-principal" onClick={() => comprarItem(item)}>
                  {MONEDA} {item.precio}
                </button>}
            </article>
          );
        })}
      </div>
    </GameShell>
  );
}
