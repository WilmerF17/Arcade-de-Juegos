import GameShell from "./GameShell";

/** Política de privacidad: lista para enlazar desde Google Play y la web. */
export default function Privacidad() {
  return (
    <GameShell titulo="Política de privacidad" emoji="🔒"
      descripcion="Última actualización: 22 de septiembre de 2026.">
      <div className="privacidad">
        <p>
          <b>ArcadePaLoMuchacho</b> es una colección de minijuegos gratuita.
          No necesitas crear cuenta, no mostramos publicidad y no vendemos datos.
        </p>
        <h3>Datos que se guardan en tu dispositivo</h3>
        <p>
          Tu progreso (XP, niveles, logros, racha), tus fichas virtuales, tus compras
          de la tienda, tus favoritos y tus ajustes (tema, sonido) se guardan solo en
          tu navegador o dispositivo (almacenamiento local). Nunca salen de ahí y
          puedes borrarlos cuando quieras desde los ajustes de tu navegador.
        </p>
        <h3>Puntuaciones globales</h3>
        <p>
          Si hay conexión, enviamos tu puntuación (nombre del juego, puntos y fecha)
          a nuestro servidor para el marcador global. No se envía tu nombre, correo
          ni ningún identificador personal.
        </p>
        <h3>Fichas virtuales y tienda</h3>
        <p>
          Las fichas (🪙) y la tienda son <b>100% virtuales y gratuitas</b>: no hay
          compras con dinero real, no hay premios en dinero y nada se puede canjear
          fuera del juego.
        </p>
        <h3>Menores</h3>
        <p>
          La app es apta para todos los públicos y no recoge datos personales de
          nadie, incluidos menores de 13 años.
        </p>
        <h3>Permisos</h3>
        <p>
          La app instalada (PWA o APK) no pide permisos especiales: ni ubicación,
          ni contactos, ni cámara, ni micrófono. Funciona sin conexión una vez instalada.
        </p>
        <h3>Contacto</h3>
        <p>
          Para preguntas o para pedir el borrado de una puntuación del marcador global,
          abre un issue en{" "}
          <a href="https://github.com/WilmerF17/Arcade-de-Juegos" target="_blank" rel="noopener">
            github.com/WilmerF17/Arcade-de-Juegos
          </a>.
        </p>
      </div>
    </GameShell>
  );
}
