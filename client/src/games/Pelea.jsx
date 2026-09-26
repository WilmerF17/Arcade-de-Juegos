import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { escribiendo } from "../suite/teclado";
import { sfx } from "../suite/sonido";

const TICK = 50, ARENA = 100, TIEMPO = 60;
const DANO_PUNO = 8, DANO_PATADA = 13, ALC_PUNO = 15, ALC_PAT = 17;

/* Peleas en tiempo real: quita toda la vida rival antes del final del asalto.
   1P = muévete + puño + patada + bloqueo · 2P = duelo local en el mismo teclado. */
function PeleaMotor({ nombre, emojiL, emojiR, descripcion, ayuda, modo, ia }) {
  const { mensaje, tipo, registrarPunt } = useRegistro(nombre);
  const [luch, setLuch] = useState(null);
  const [quedan, setQuedan] = useState(TIEMPO);
  const [fin, setFin] = useState(null);
  const st = useRef(null);
  const teclas = useRef({});
  const flags = useRef({ lIz: false, lDe: false, rIz: false, rDe: false });
  const loop = useRef(null);
  const jugando = useRef(false);

  function base() {
    return {
      l: { x: 28, hp: 100, cdP: 0, cdK: 0, bloq: false, golpe: 0 },
      r: { x: 72, hp: 100, cdP: 0, cdK: 0, bloq: false, golpe: 0 },
      dmgL: 0, dmgR: 0, t: TIEMPO,
    };
  }

  function empezar() {
    st.current = base();
    jugando.current = true;
    setFin(null); setQuedan(TIEMPO);
    setLuch({ ...st.current });
    sfx.clic();
    if (loop.current) clearInterval(loop.current);
    loop.current = setInterval(paso, TICK);
  }

  useEffect(() => () => { if (loop.current) clearInterval(loop.current); }, []);

  useEffect(() => {
    const dn = e => {
      if (escribiendo() || !jugando.current) return;
      const key = e.key.toLowerCase();
      const utiles = modo === "duelo"
        ? ["a", "d", "f", "g", "h", "arrowleft", "arrowright", "k", "l", "p"]
        : ["a", "d", "arrowleft", "arrowright", "j", "k", "l"];
      if (utiles.includes(key)) { teclas.current[key] = true; e.preventDefault(); }
    };
    const up = e => { teclas.current[e.key.toLowerCase()] = false; };
    window.addEventListener("keydown", dn);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", dn);
      window.removeEventListener("keyup", up);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modo]);

  function ataca(s, atk, def, esPuno) {
    const cd = esPuno ? "cdP" : "cdK";
    if (s[atk][cd] > 0 || !jugando.current) return;
    s[atk][cd] = esPuno ? 400 : 800;
    const dist = Math.abs(s.l.x - s.r.x);
    const alc = esPuno ? ALC_PUNO : ALC_PAT;
    if (dist <= alc) {
      let d = esPuno ? DANO_PUNO : DANO_PAT;
      if (s[def].bloq) d = Math.ceil(d * 0.3);
      s[def].hp = Math.max(0, s[def].hp - d);
      s[def].golpe = Date.now();
      if (atk === "l") s.dmgL += d; else s.dmgR += d;
      // empuja al rival
      const dir = s[atk].x < s[def].x ? 1 : -1;
      s[def].x = Math.max(4, Math.min(96, s[def].x + dir * (esPuno ? 2 : 3.5)));
      sfx.bien();
    } else {
      sfx.clic();
    }
  }

  function cerebroIA(s) {
    const yo = s.r, tu = s.l;
    const dist = Math.abs(yo.x - tu.x);
    yo.bloq = tu.cdP <= 150 && dist < ALC_PUNO + 4 && Math.random() < ia.bloqueo;
    if (!yo.bloq && dist > ALC_PUNO - 2) {
      yo.x += (tu.x < yo.x ? -1 : 1) * ia.vel;
      yo.x = Math.max(4, Math.min(96, yo.x));
    } else if (!yo.bloq && Math.random() < ia.agresion) {
      if (Math.random() < 0.6) ataca(s, "r", "l", true);
      else ataca(s, "r", "l", false);
    }
  }

  function paso() {
    const s = st.current;
    if (!s || !jugando.current) return;
    const T = teclas.current, F = flags.current;
    for (const q of ["l", "r"]) {
      s[q].cdP = Math.max(0, s[q].cdP - TICK);
      s[q].cdK = Math.max(0, s[q].cdK - TICK);
    }
    if (modo === "duelo") {
      // P1: A/D + F puño, G patada, H bloqueo · P2: ←/→ + K puño, L patada, P bloqueo
      if (T.a || F.lIz) s.l.x = Math.max(4, s.l.x - 2.2);
      if (T.d || F.lDe) s.l.x = Math.min(96, s.l.x + 2.2);
      s.l.bloq = !!T.h;
      if (T.f) { ataca(s, "l", "r", true); T.f = false; }
      if (T.g) { ataca(s, "l", "r", false); T.g = false; }
      if (T.arrowleft || F.rIz) s.r.x = Math.max(4, s.r.x - 2.2);
      if (T.arrowright || F.rDe) s.r.x = Math.min(96, s.r.x + 2.2);
      s.r.bloq = !!T.p;
      if (T.k) { ataca(s, "r", "l", true); T.k = false; }
      if (T.l) { ataca(s, "r", "l", false); T.l = false; }
    } else {
      if (T.a || T.arrowleft || F.lIz) s.l.x = Math.max(4, s.l.x - 2.2);
      if (T.d || T.arrowright || F.lDe) s.l.x = Math.min(96, s.l.x + 2.2);
      s.l.bloq = !!T.l;
      if (T.j) { ataca(s, "l", "r", true); T.j = false; }
      if (T.k) { ataca(s, "l", "r", false); T.k = false; }
      cerebroIA(s);
    }
    // no atravesarse
    if (Math.abs(s.l.x - s.r.x) < 6) {
      const m = (s.l.x + s.r.x) / 2;
      s.l.x = Math.max(4, m - 3); s.r.x = Math.min(96, m + 3);
    }
    s.t -= TICK / 1000;
    setLuch({ ...s, l: { ...s.l }, r: { ...s.r } });
    setQuedan(Math.max(0, Math.ceil(s.t)));
    if (s.l.hp <= 0 || s.r.hp <= 0 || s.t <= 0) terminar(s);
  }

  function terminar(s) {
    jugando.current = false;
    if (loop.current) { clearInterval(loop.current); loop.current = null; }
    const ganaL = s.l.hp > s.r.hp;
    const ganaR = s.r.hp > s.l.hp;
    const res = ganaL ? "¡GANA EL AZUL! 🥇" : ganaR ? (modo === "duelo" ? "¡GANA EL ROJO! 🥇" : "Gana la máquina 🤖") : "¡EMPATE! 🤝";
    setFin(res);
    const puntos = Math.max(10, Math.round(100 - s.dmgR + (ganaL ? 60 : 0)));
    registrarPunt(puntos, ganaL ? 1 : 0);
    if (ganaL) sfx.record(); else sfx.mal();
  }

  function boton(txt, fn, etiqueta) {
    return (
      <button className="btn-suave" aria-label={etiqueta}
        onPointerDown={e => { e.preventDefault(); fn(true); }}
        onPointerUp={() => fn(false)} onPointerLeave={() => fn(false)} onPointerCancel={() => fn(false)}
        onContextMenu={e => e.preventDefault()}
        style={{ minWidth: 52, minHeight: 52, fontSize: "1.4rem", touchAction: "none", userSelect: "none" }}>
        {txt}
      </button>
    );
  }

  function barra(hp) {
    const c = hp > 50 ? "var(--exito)" : hp > 25 ? "var(--aviso)" : "var(--peligro)";
    return (
      <div style={{ flex: 1, height: 14, background: "var(--bg-soft)", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
        <div style={{ width: `${hp}%`, height: "100%", background: c, transition: "width .15s" }} />
      </div>
    );
  }

  return (
    <GameShell titulo={nombre} emoji="🥊"
      descripcion={descripcion}
      stats={luch ? [
        { etiqueta: "⏱️", valor: `${quedan}s` },
        { etiqueta: modo === "duelo" ? "P1" : "Tú", valor: `${Math.round(luch.l.hp)}❤️` },
        { etiqueta: modo === "duelo" ? "P2" : "CPU", valor: `${Math.round(luch.r.hp)}❤️` },
      ] : []}
      resultado={{ mensaje, tipo }}
      ayuda={<span>{ayuda}</span>}>
      {!luch && <div className="fila-botones"><button className="btn-principal" onClick={empezar}>🥊 ¡A pelear! (60s)</button></div>}
      {luch && (
        <>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span aria-hidden>🔵</span>{barra(luch.l.hp)}
            <b>{quedan}s</b>
            {barra(luch.r.hp)}<span aria-hidden>🔴</span>
          </div>
          <div className="pelea-arena" aria-hidden
            style={{ position: "relative", height: 110, background: "var(--bg-soft)", border: "1px solid var(--border)", borderRadius: 12, marginTop: 8, overflow: "hidden" }}>
            <div style={{ position: "absolute", bottom: 6, left: "50%", transform: "translateX(-50%)", fontSize: ".8rem", opacity: .6 }}>◀ ━━━ RING ━━━ ▶</div>
            <span style={{
              position: "absolute", bottom: 18, left: `${luch.l.x}%`, transform: `translateX(-50%) scaleX(-1) scale(${Date.now() - luch.l.golpe < 180 ? 1.35 : 1})`,
              fontSize: "2.6rem", filter: luch.l.bloq ? "drop-shadow(0 0 8px var(--info))" : "none", transition: "left .05s linear",
            }}>{emojiL}</span>
            <span style={{
              position: "absolute", bottom: 18, left: `${luch.r.x}%`, transform: `translateX(-50%) scale(${Date.now() - luch.r.golpe < 180 ? 1.35 : 1})`,
              fontSize: "2.6rem", filter: luch.r.bloq ? "drop-shadow(0 0 8px var(--info))" : "none", transition: "left .05s linear",
            }}>{emojiR}</span>
          </div>
          {fin
            ? <div className="fila-botones"><span className="chip victoria">{fin}</span><button className="btn-principal" onClick={empezar}>🔁 Revancha</button></div>
            : modo === "duelo" ? (
              <div style={{ display: "flex", gap: 8, justifyContent: "space-between", marginTop: 8 }}>
                <div className="fila-botones" style={{ flexWrap: "nowrap" }}>
                  {boton("◀", v => { flags.current.lIz = v; }, "P1 izquierda")}
                  {boton("👊", v => { if (v) { teclas.current.f = true; } }, "P1 puño")}
                  {boton("🦵", v => { if (v) { teclas.current.g = true; } }, "P1 patada")}
                  {boton("▶", v => { flags.current.lDe = v; }, "P1 derecha")}
                </div>
                <div className="fila-botones" style={{ flexWrap: "nowrap" }}>
                  {boton("◀", v => { flags.current.rIz = v; }, "P2 izquierda")}
                  {boton("👊", v => { if (v) { teclas.current.k = true; } }, "P2 puño")}
                  {boton("🦵", v => { if (v) { teclas.current.l = true; } }, "P2 patada")}
                  {boton("▶", v => { flags.current.rDe = v; }, "P2 derecha")}
                </div>
              </div>
            ) : (
              <div className="fila-botones" style={{ flexWrap: "nowrap" }}>
                {boton("◀", v => { flags.current.lIz = v; }, "Izquierda")}
                {boton("▶", v => { flags.current.lDe = v; }, "Derecha")}
                {boton("👊", v => { if (v) { teclas.current.j = true; } }, "Puño (J)")}
                {boton("🦵", v => { if (v) { teclas.current.k = true; } }, "Patada (K)")}
                {boton("🛡️", v => { teclas.current.l = v; }, "Bloquear (L)")}
              </div>
            )}
        </>
      )}
      <Resultado mensaje={mensaje} tipo={tipo} />
    </GameShell>
  );
}

export default function PeleaNeon() {
  return <PeleaMotor nombre="Pelea Neón" emojiL="🤖" emojiR="👾" modo="ia"
    descripcion="Pelea contra la máquina: puños, patadas y bloqueo. 60 segundos."
    ayuda={<>Muévete con <b>A/D o ←/→</b>, <b>J</b> puño, <b>K</b> patada y <b>L</b> bloqueo (en móvil usa los botones). El bloqueo aguanta el 70% del daño. Gana quien deje más vida al final.</>}
    ia={{ vel: 1.4, agresion: 0.35, bloqueo: 0.25 }} />;
}
export function PeleaTurbo() {
  return <PeleaMotor nombre="Pelea Turbo" emojiL="⚡" emojiR="🔥" modo="ia"
    descripcion="La máquina ataca sin piedad: rápida y agresiva."
    ayuda={<>Igual que Pelea Neón pero la IA es <b>más rápida, pega más y bloquea mejor</b>. No te quedes quieto.</>}
    ia={{ vel: 2, agresion: 0.55, bloqueo: 0.45 }} />;
}
export function PeleaDuelo() {
  return <PeleaMotor nombre="Pelea Duelo" emojiL="🥊" emojiR="🥋" modo="duelo"
    descripcion="Duelo local: P1 (A/D+F/G) contra P2 (←/→+K/L)."
    ayuda={<><b>P1</b>: A/D moverse, F puño, G patada, H bloqueo. <b>P2</b>: ←/→ moverse, K puño, L patada, P bloqueo. En móvil, cada uno usa su fila de botones.</>} />;
}
