import { useEffect, useMemo, useState } from "react";
import GameShell from "../ui/GameShell";
import { Icono } from "../ui/Iconos";
import BotonesCompartir from "../ui/Compartir";
import { getStats } from "../api";

export default function Marcador() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [recargando, setRecargando] = useState(false);

  function cargar() {
    setRecargando(true);
    getStats()
      .then(s => setStats(s))
      .catch(e => setError(String(e)))
      .finally(() => setRecargando(false));
  }

  useEffect(cargar, []);

  const filas = useMemo(() => {
    if (!stats) return [];
    return Object.entries(stats)
      .map(([juego, s]) => ({
        juego, ...s,
        win: s.jugadas ? Math.round((s.ganadas / s.jugadas) * 100) : 0,
      }))
      .sort((a, b) => (b.mejor || 0) - (a.mejor || 0));
  }, [stats]);

  const totalJugadas = filas.reduce((s, v) => s + (v.jugadas || 0), 0);
  const totalVictorias = filas.reduce((s, v) => s + (v.ganadas || 0), 0);
  const podio = filas.slice(0, 3);
  const ordenPodio = podio.length === 3 ? [podio[1], podio[0], podio[2]] : podio;
  const puesto = i => (podio.length === 3 ? [2, 1, 3][i] : i + 1);

  return (
    <GameShell titulo="Marcador" emoji="🏆"
      descripcion="Ranking global, podio y winrate de todos los juegos."
      tira="linear-gradient(90deg,#f59e0b,#ef4444,#a855f7)" iconoFondo="linear-gradient(135deg,#f59e0b,#ef4444)">
      <div className="fila-botones">
        <button className="btn-principal" onClick={cargar}>{recargando ? "Cargando..." : <><Icono n="refrescar" size={14} /> Refrescar</>}</button>
        <span className="chip"><Icono n="mando" size={13} /> Partidas: <b>{totalJugadas}</b></span>
        <span className="chip"><Icono n="desafio" size={13} /> Victorias: <b>{totalVictorias}</b></span>
        <span className="chip"><Icono n="nivel" size={13} /> Winrate: <b>{totalJugadas ? Math.round(totalVictorias / totalJugadas * 100) : 0}%</b></span>
        {podio.length > 0 && (
          <BotonesCompartir compacto texto={`🏆 Mi podio en ArcadePaLoMuchacho: ${podio.map(f => `${f.juego} (${f.mejor})`).join(", ")} · ${totalJugadas} partidas. ¿Me superas?`} />
        )}
      </div>
      {error && <p className="aviso info">{error}</p>}
      {!stats && !error && <p className="aviso info">Cargando estadísticas...</p>}
      {stats && filas.length === 0 && <p className="aviso info">Todavía no hay partidas. ¡Juega algo y vuelve!</p>}
      {podio.length >= 2 && (
        <div className="podio">
          {ordenPodio.map((f, i) => (
            <div key={f.juego} className={`podio-col ${i === 1 && podio.length === 3 ? "oro" : ""}`}>
              <div className={`medalla-rank r${puesto(i)}`}>{puesto(i)}</div>
              <b>{f.juego}</b>
              <small><Icono n="estrella-llena" size={11} /> {f.mejor} · {f.win}% win</small>
            </div>
          ))}
        </div>
      )}
      {stats && filas.length > 0 && (
        <table className="estadisticas">
          <thead>
            <tr><th>#</th><th>Juego</th><th>Mejor</th><th>Ganadas</th><th>Jugadas</th><th>Winrate</th></tr>
          </thead>
          <tbody>
            {filas.map((s, i) => (
              <tr key={s.juego}>
                <td>{i < 3 ? <span className={`medalla-rank mini r${i + 1}`}>{i + 1}</span> : i + 1}</td>
                <td><b>{s.juego}</b></td>
                <td><Icono n="estrella-llena" size={11} /> {s.mejor}</td>
                <td>{s.ganadas}</td>
                <td>{s.jugadas}</td>
                <td style={{ minWidth: 130 }}>
                  <small>{s.win}%</small>
                  <div className="barra-record"><div style={{ width: `${s.win}%` }} /></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </GameShell>
  );
}
