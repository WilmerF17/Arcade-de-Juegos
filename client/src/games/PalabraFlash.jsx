import { useEffect, useRef, useState } from "react";
import GameShell, { useRegistro, Resultado } from "../ui/GameShell";
import { sfx } from "../suite/sonido";

/* Palabra Flash (tendencia sprint de palabras): 60 segundos, resuelve
   anagramas escribiendo. 3 longitudes. Teclado físico + móvil (input). */
const BOLSAS = {
  4: ["gato", "mesa", "luna", "flor", "tren", "nube", "pato", "vino", "roca", "hoja", "casa", "pala", "sopa", "dijo"],
  5: ["papel", "verde", "fuego", "nieve", "queso", "jarra", "playa", "tigre", "fruta", "campo", "brazo", "nuevo"],
  6: ["verano", "camino", "puerta", "espejo", "ciudad", "viento", "dedo", "tierra", "naranja", "planeta"],
};
function mezcla(p) {
  const a = p.split("");
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  const m = a.join("");
  return m === p ? mezcla(p) : m;
}

function FlashMotor({ nombre, emoji, descripcion, largo }) {
  const { mensaje, tipo, registrarPunt } = useRegistro(nombre);
  const bolsa = BOLSAS[largo].filter(w => w.length === largo && /^[a-zñ]+$/.test(w));
  const [objetivo, setObjetivo] = useState(() => bolsa[Math.floor(Math.random() * bolsa.length)]);
  const [revuelto, setRevuelto] = useState(() => mezcla(objetivo));
  const [txt, setTxt] = useState("");
  const [puntos, setPuntos] = useState(0);
  const [racha, setRacha] = useState(0);
  const [quedan, setQuedan] = useState(60);
  const [jugando, setJugando] = useState(false);
  const [fin, setFin] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);

  function nueva() {
    const o = bolsa[Math.floor(Math.random() * bolsa.length)];
    setObjetivo(o); setRevuelto(mezcla(o)); setTxt("");
  }
  function empezar() {
    if (timer.current) clearInterval(timer.current);
    setPuntos(0); setRacha(0); setQuedan(60); setFin(false); setJugando(true);
    nueva(); sfx.clic();
    timer.current = setInterval(() => {
      setQuedan(q => {
        if (q <= 1) { clearInterval(timer.current); timer.current = null; return 0; }
        return q - 1;
      });
    }, 1000);
  }
  useEffect(() => {
    if (jugando && quedan === 0 && !fin) {
      setJugando(false); setFin(true);
      registrarPunt(puntos, puntos >= 30 ? 1 : 0);
      if (puntos >= 30) sfx.bien(); else sfx.mal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quedan]);

  function probar(e) {
    e?.preventDefault();
    if (!jugando) return;
    const t = txt.trim().toLowerCase();
    if (!t) return;
    if (t === objetivo) {
      const g = 10 + Math.min(10, racha * 2);
      setPuntos(p => p + g); setRacha(r => r + 1);
      sfx.bien(); nueva();
    } else {
      setRacha(0); sfx.mal();
    }
    setTxt("");
  }
  function saltar() { if (jugando) { setRacha(0); nueva(); sfx.clic(); } }

  return (
    <GameShell titulo={nombre} emoji={emoji}
      descripcion={descripcion}
      stats={[{ etiqueta: "Puntos", valor: puntos }, { etiqueta: "Tiempo", valor: `${quedan}s` }, ...(racha > 1 ? [{ etiqueta: "Racha", valor: `🔥${racha}` }] : [])]}
      resultado={{ mensaje, tipo }}
      ayuda={<span>Ordena las letras y <b>escribe la palabra</b> antes de que acabe el minuto. Cada acierto seguido suma más (racha). <b>Saltar</b> rompe la racha.</span>}>
      <p className="revuelto" style={{ textAlign: "center", fontSize: "2rem", letterSpacing: ".35em" }} aria-label="Letras desordenadas">{revuelto.toUpperCase()}</p>
      <form onSubmit={probar} className="fila-botones" style={{ justifyContent: "center" }}>
        <input value={txt} onChange={e => setTxt(e.target.value)} maxLength={largo}
          placeholder={`${largo} letras`} disabled={!jugando}
          style={{ fontSize: "1.2rem", padding: "10px 12px", borderRadius: 10, width: 150, textAlign: "center" }}
          aria-label="Tu palabra" autoCapitalize="none" autoCorrect="off" />
        <button className="btn-principal" type="submit" disabled={!jugando}>Probar</button>
        <button className="btn-suave" type="button" onClick={saltar} disabled={!jugando}>Saltar</button>
      </form>
      <div className="fila-botones">
        {!jugando && <button className="btn-principal" onClick={empezar}>{fin ? "🔁 Otra vez (60s)" : "▶️ Jugar 60s"}</button>}
        {fin && <span className={`chip${puntos >= 30 ? " victoria" : ""}`}>{puntos} pts</span>}
      </div>
      <Resultado mensaje={mensaje} tipo={tipo} />
    </GameShell>
  );
}

export default function AnagramaFlash() {
  return <FlashMotor nombre="Anagrama Flash" emoji="⚡" largo={5}
    descripcion="Anagramas de 5 letras contra el crono: 60 segundos." />;
}
export function PalabraRelampago() {
  return <FlashMotor nombre="Palabra Relámpago" emoji="🌩️" largo={4}
    descripcion="Anagramas fáciles de 4 letras en 60 segundos." />;
}
export function PalabraTurbo() {
  return <FlashMotor nombre="Palabra Turbo" emoji="🚄" largo={6}
    descripcion="Anagramas duros de 6 letras en 60 segundos." />;
}
