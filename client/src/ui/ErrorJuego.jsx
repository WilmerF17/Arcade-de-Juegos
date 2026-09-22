import { Component } from "react";

/**
 * Si un juego falla (error en su lógica o en su chunk), muestra una
 * pantalla amable en vez de romper toda la app.
 */
export default class ErrorJuego extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error) {
    // Visible en consola para depurar; la app sigue viva.
    console.error("[arcade] falló el juego:", error);
  }
  render() {
    if (this.state.error) {
      const { alInicio } = this.props;
      return (
        <div className="gameshell" data-fam="error">
          <div className="shell-head">
            <div className="shell-icono">🛟</div>
            <div>
              <h2>Este juego tropezó</h2>
              <p className="sub">Algo falló al cargar esta partida, pero el arcade sigue abierto.</p>
            </div>
          </div>
          <div className="fila-botones">
            <button className="btn-principal" onClick={() => this.setState({ error: null })}>
              ↻ Reintentar
            </button>
            {alInicio && (
              <button className="btn-suave" onClick={alInicio}>← Volver al inicio</button>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
