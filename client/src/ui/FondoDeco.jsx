/* Decoración ambiental eléctrica del fondo: iconos neón flotando + chispas. */
const CORAL = "rgba(255,61,90,.55)";
const CIAN = "rgba(34,211,238,.55)";
const VIOLETA = "rgba(168,85,247,.55)";
const ORO = "rgba(255,210,25,.55)";

const FICHAS = [
  { e: "🎮", left: "3%", top: "10%", size: 64, dur: 9, glow: CORAL },
  { e: "👾", left: "88%", top: "6%", size: 56, dur: 11, glow: VIOLETA },
  { e: "⚡", left: "70%", top: "12%", size: 72, dur: 7, glow: ORO, chispa: true },
  { e: "🎯", left: "90%", top: "50%", size: 66, dur: 8, glow: CORAL },
  { e: "🎲", left: "5%", top: "66%", size: 60, dur: 10, glow: CIAN },
  { e: "⭐", left: "44%", top: "3%", size: 36, dur: 7, glow: ORO },
  { e: "🕹️", left: "1%", top: "40%", size: 54, dur: 12, glow: VIOLETA },
  { e: "🏆", left: "82%", top: "84%", size: 58, dur: 9, glow: ORO },
  { e: "⚡", left: "18%", top: "88%", size: 60, dur: 6, glow: ORO, chispa: true },
  { e: "🎪", left: "62%", top: "78%", size: 52, dur: 10, glow: CORAL },
  { e: "👾", left: "30%", top: "55%", size: 40, dur: 11, glow: CIAN },
  { e: "⚡", left: "93%", top: "30%", size: 44, dur: 8, glow: CIAN, chispa: true },
];

export default function FondoDeco() {
  return (
    <div className="decor" aria-hidden>
      {FICHAS.map((f, i) => (
        <span key={i} className={f.chispa ? "chispa" : undefined} style={{
          left: f.left, top: f.top, fontSize: f.size,
          filter: `drop-shadow(0 0 14px ${f.glow})`,
          animationDuration: `${f.dur}s, 2.2s`, animationDelay: `${-i * 1.3}s, ${-i * 0.4}s`,
        }}>{f.e}</span>
      ))}
    </div>
  );
}
