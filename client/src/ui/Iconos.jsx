/* Iconografía SVG propia del arcade: 70 juegos + interfaz + logo.
   Trazos consistentes (24×24, round) en currentColor para heredar el color. */

function S({ size = 22, children, sw = 1.9 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

function T({ x = 12, y = 16, children, size = 11 }) {
  return (
    <text x={x} y={y} textAnchor="middle" fill="currentColor" stroke="none"
      fontSize={size} fontWeight={800} fontFamily="inherit">{children}</text>
  );
}

export function Icono({ n, size = 22 }) {
  switch (n) {
    case "adivina": return <S size={size}><circle cx="11" cy="11" r="6" /><path d="M15.5 15.5 20 20" /><T x={11} y={14.5} size={8}>?</T></S>;
    case "caza": return <S size={size}><rect x="4" y="9" width="16" height="11" rx="2" /><path d="M4 13h16M9 9V6h6v3" /><circle cx="12" cy="16" r="1.4" fill="currentColor" stroke="none" /></S>;
    case "ahorcado": return <S size={size}><path d="M6 21V4h11v4" /><circle cx="17" cy="12" r="2.4" /><path d="M17 14.5V18M17 16l-2.5 2M17 16l2.5 2" /></S>;
    case "wordle": return <S size={size}><rect x="3" y="4" width="8" height="7" rx="1.5" /><rect x="13" y="4" width="8" height="7" rx="1.5" /><rect x="3" y="13" width="8" height="7" rx="1.5" /><rect x="13" y="13" width="8" height="7" rx="1.5" fill="currentColor" stroke="none" opacity=".85" /></S>;
    case "rps": return <S size={size}><circle cx="6" cy="6" r="2.6" /><circle cx="6" cy="18" r="2.6" /><path d="M8 7.5 20 19M8 16.5 20 5" /></S>;
    case "memoria": return <S size={size}><rect x="2.5" y="6" width="9" height="12" rx="2" /><rect x="12.5" y="6" width="9" height="12" rx="2" /><path d="M7 10.5c.8-1.6 2.2-1.6 3 0M14.5 12.5c.8-1.6 2.2-1.6 3 0" /></S>;
    case "trivia": return <S size={size}><T x={12} y={16} size={15}>?</T><circle cx="12" cy="19.5" r="1" fill="currentColor" stroke="none" /></S>;
    case "blackjack": return <S size={size}><path d="M12 3C9 9 5 12 5 15.5A3.6 3.6 0 0 0 12 17a3.6 3.6 0 0 0 7-1.5C19 12 15 9 12 3z" /><path d="M12 17v4M8.5 21h7" /></S>;
    case "dados": return <S size={size}><rect x="4" y="4" width="16" height="16" rx="4" /><circle cx="9" cy="9" r="1.3" fill="currentColor" stroke="none" /><circle cx="15" cy="15" r="1.3" fill="currentColor" stroke="none" /><circle cx="15" cy="9" r="1.3" fill="currentColor" stroke="none" /><circle cx="9" cy="15" r="1.3" fill="currentColor" stroke="none" /></S>;
    case "treslinea": return <S size={size}><path d="M9 3v18M15 3v18M3 9h18M3 15h18" /><circle cx="15" cy="15" r="2.4" /></S>;
    case "buscaminas": return <S size={size}><circle cx="11" cy="14" r="6" /><path d="M15.5 9.5 19 6M17 4.5h3v3" /><circle cx="9" cy="12.5" r="1.2" fill="currentColor" stroke="none" /></S>;
    case "c4": return <S size={size}><rect x="3" y="4" width="18" height="16" rx="3" /><circle cx="7" cy="12" r="2" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="2" /><circle cx="17" cy="12" r="2" /></S>;
    case "juego2048": return <S size={size}><rect x="3" y="3" width="8" height="8" rx="2" fill="currentColor" stroke="none" opacity=".9" /><rect x="13" y="3" width="8" height="8" rx="2" /><rect x="3" y="13" width="8" height="8" rx="2" /><rect x="13" y="13" width="8" height="8" rx="2" /></S>;
    case "simon": return <S size={size}><path d="M11 4H6a2 2 0 0 0-2 2v5h7z" fill="currentColor" stroke="none" /><path d="M13 4h5a2 2 0 0 1 2 2v5h-7z" /><path d="M4 13v5a2 2 0 0 0 2 2h5v-7z" /><path d="M20 13v5a2 2 0 0 1-2 2h-5v-7z" /></S>;
    case "mastermind": return <S size={size}><circle cx="12" cy="13" r="8" /><circle cx="9" cy="11" r="1.4" fill="currentColor" stroke="none" /><circle cx="14.5" cy="10.5" r="1.4" fill="currentColor" stroke="none" /><circle cx="12" cy="15.5" r="1.4" fill="currentColor" stroke="none" /><path d="M16 5.5c1.5-1 3.5-.5 4 1" /></S>;
    case "snake": return <S size={size}><path d="M4 17c3.5 0 3.5-4.5 7-4.5S14.5 17 18 17h2" /><circle cx="20.5" cy="17" r="1.8" fill="currentColor" stroke="none" /><circle cx="4" cy="7" r="1.8" fill="currentColor" stroke="none" /><path d="M4 7h6" /></S>;
    case "flota": return <S size={size}><path d="M3 15h18l-2.5 5h-13z" /><path d="M12 15V5M12 5h5l-1.5 2.5L12 10" /><circle cx="12" cy="4" r="1" fill="currentColor" stroke="none" /></S>;
    case "puzzle15": return <S size={size}><rect x="3" y="3" width="8" height="8" rx="1.5" fill="currentColor" stroke="none" opacity=".9" /><rect x="13" y="3" width="8" height="8" rx="1.5" /><rect x="3" y="13" width="8" height="8" rx="1.5" /></S>;
    case "pong": return <S size={size}><rect x="3" y="7" width="3" height="10" rx="1.5" fill="currentColor" stroke="none" /><rect x="18" y="7" width="3" height="10" rx="1.5" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="2.2" fill="currentColor" stroke="none" /><path d="M12 3v3M12 18v3" opacity=".5" /></S>;
    case "pong2p": return <S size={size}><rect x="3" y="7" width="3" height="10" rx="1.5" fill="currentColor" stroke="none" /><rect x="18" y="7" width="3" height="10" rx="1.5" fill="currentColor" stroke="none" /><circle cx="9.5" cy="10" r="1.6" fill="currentColor" stroke="none" /><circle cx="14.5" cy="14" r="1.6" fill="currentColor" stroke="none" /></S>;
    case "breakout": return <S size={size}><rect x="4" y="4" width="7" height="4" rx="1" fill="currentColor" stroke="none" /><rect x="13" y="4" width="7" height="4" rx="1" /><rect x="4" y="10" width="7" height="4" rx="1" /><rect x="13" y="10" width="7" height="4" rx="1" fill="currentColor" stroke="none" opacity=".7" /><circle cx="12" cy="18.5" r="1.8" fill="currentColor" stroke="none" /></S>;
    case "tragaperras": return <S size={size}><rect x="5" y="3" width="14" height="18" rx="3" /><T x={12} y={16} size={11}>7</T><path d="M19 8h2.5M21.5 8v4" /></S>;
    case "reflejos": return <S size={size}><path d="M13 2 5 14h6l-1 8 8-12h-6z" /></S>;
    case "mathblitz": return <S size={size}><path d="M4 7V4M4 7H1M4 7h3M4 7v3" /><path d="M15 15l6 6M21 15l-6 6" /><path d="M14 5h7v7" /></S>;
    case "flappy": return <S size={size}><circle cx="10" cy="13" r="5.5" /><circle cx="8.5" cy="11.5" r="1" fill="currentColor" stroke="none" /><path d="M15 12l4-1.5L15.5 14" /><path d="M4 20c2-1 4-1 6 0" /></S>;
    case "tetris": return <S size={size}><rect x="3" y="4" width="6" height="6" rx="1" fill="currentColor" stroke="none" /><rect x="9" y="4" width="6" height="6" rx="1" fill="currentColor" stroke="none" /><rect x="15" y="4" width="6" height="6" rx="1" fill="currentColor" stroke="none" /><rect x="9" y="10" width="6" height="6" rx="1" fill="currentColor" stroke="none" /><rect x="9" y="16" width="6" height="5" rx="1" opacity=".45" /></S>;
    case "topo": return <S size={size}><path d="M3 20c2-4 5-6 9-6s7 2 9 6" /><circle cx="12" cy="12" r="4.5" /><circle cx="10.3" cy="11" r=".9" fill="currentColor" stroke="none" /><circle cx="13.7" cy="11" r=".9" fill="currentColor" stroke="none" /></S>;
    case "laberinto": return <S size={size}><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h8v6h6M12 15v6M17 3v6" /><circle cx="18" cy="18" r="1.4" fill="currentColor" stroke="none" /></S>;
    case "sudoku": return <S size={size}><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M9.3 4v16M14.6 4v16M4 9.3h16M4 14.6h16" /><circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" /></S>;
    case "hanoi": return <S size={size}><path d="M4 20h16M12 4v16" /><rect x="7" y="16" width="10" height="3" rx="1.5" fill="currentColor" stroke="none" /><rect x="8.5" y="12.5" width="7" height="3" rx="1.5" fill="currentColor" stroke="none" opacity=".7" /><rect x="10" y="9" width="4" height="3" rx="1.5" fill="currentColor" stroke="none" opacity=".45" /></S>;
    case "luces": return <S size={size}><circle cx="12" cy="10" r="5" /><path d="M9.5 18.5h5M10.5 21h3M12 2v1.5M5 5l1 1M19 5l-1 1" /></S>;
    case "othello": return <S size={size}><circle cx="12" cy="12" r="8" /><path d="M12 4a8 8 0 0 1 0 16z" fill="currentColor" stroke="none" /></S>;
    case "damas": return <S size={size}><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M4 9.3h16M4 14.6h16M9.3 4v16M14.6 4v16" opacity=".6" /><circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" /></S>;
    case "gomoku": return <S size={size}><path d="M4 8h16M4 12h16M4 16h16M8 4v16M12 4v16M16 4v16" opacity=".55" /><circle cx="12" cy="12" r="2.4" fill="currentColor" stroke="none" /></S>;
    case "mecanografia": return <S size={size}><rect x="2.5" y="6" width="19" height="12" rx="2.5" /><path d="M6 10.5h1.5M10 10.5h1.5M14 10.5h1.5M18 10.5h.5M6 14.5h12" /></S>;
    case "piano": return <S size={size}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M8 5v7M12 5v7M16 5v7" /><path d="M7 5h2.4v5H7zM11 5h2.4v5H11zM15 5h2.4v5H15z" fill="currentColor" stroke="none" /></S>;
    case "atrapar": return <S size={size}><path d="M5 13h14l-1.8 6H6.8z" /><circle cx="12" cy="8" r="2.6" /><path d="M12 5.4c0-1.5 1-2 2-2.4" /></S>;
    case "esquiva": return <S size={size}><path d="M12 2c3 3.5 4 7.5 3 12l-3 2-3-2c-1-4.5 0-8.5 3-12z" /><circle cx="12" cy="9" r="1.6" /><path d="M9 16l-2.5 5M15 16l2.5 5M12 16v5" /></S>;
    case "dino": return <S size={size}><path d="M6 20v-8h3l2-4h4l3 3v4h-3" /><path d="M6 20h12M8 20v-3M14 20v-3" /><circle cx="15.5" cy="9.5" r=".9" fill="currentColor" stroke="none" /></S>;
    case "naves": return <S size={size}><rect x="8" y="4" width="8" height="5" rx="1" fill="currentColor" stroke="none" /><path d="M4 9l3 3M20 9l-3 3M6 15l-2 5M18 15l2 5M9 15h6" /><circle cx="10" cy="6.5" r=".8" fill="#fff" stroke="none" /><circle cx="14" cy="6.5" r=".8" fill="#fff" stroke="none" /></S>;
    case "pacman": return <S size={size}><path d="M12 12 20 7a9 9 0 1 0 0 10z" fill="currentColor" stroke="none" /><circle cx="18" cy="7" r="1.2" fill="currentColor" stroke="none" /></S>;
    case "ruleta": return <S size={size}><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" /><path d="M12 3.5V7M12 17v3.5M3.5 12H7M17 12h3.5M6 6l2.4 2.4M18 18l-2.4-2.4M18 6l-2.4 2.4M6 18l2.4-2.4" opacity=".7" /></S>;
    case "yahtzee": return <S size={size}><rect x="3" y="9" width="8" height="8" rx="2" /><rect x="13" y="7" width="8" height="8" rx="2" /><circle cx="7" cy="13" r="1.2" fill="currentColor" stroke="none" /><circle cx="17" cy="11" r="1.2" fill="currentColor" stroke="none" /></S>;
    case "sopa": return <S size={size}><circle cx="10.5" cy="10.5" r="6" /><path d="M15 15l5 5" /><T x={10.5} y={14} size={8}>A</T></S>;
    case "anagramas": return <S size={size}><path d="M3 7h8l-2.5-2.5M21 7h-8l2.5-2.5" /><path d="M3 17h8l-2.5 2.5M21 17h-8l2.5 2.5" opacity=".55" /></S>;
    case "stroop": return <S size={size}><path d="M12 3s6 7 6 11.5a6 6 0 0 1-12 0C6 10 12 3 12 3z" /><circle cx="12" cy="14.5" r="2" /></S>;
    case "aim": return <S size={size}><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4.5" /><circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none" /><path d="M12 1.5V5M12 19v3.5M1.5 12H5M19 12h3.5" /></S>;
    case "penaltis": return <S size={size}><circle cx="12" cy="12" r="8.5" /><path d="M12 8l2.6 1.9-1 3.1h-3.2l-1-3.1z" fill="currentColor" stroke="none" /><path d="M12 3.5V8M17.5 9.5l-2.9.4M15.5 18.5l-1.9-2.5M8.5 18.5l1.9-2.5M6.5 9.5l2.9.4" opacity=".7" /></S>;
    case "bowling": return <S size={size}><path d="M10 3c2 2 2.5 4.5 1.5 7L9 14.5A3.5 3.5 0 1 0 15 17l-1-2.5" /><circle cx="14.5" cy="20" r="1.6" fill="currentColor" stroke="none" /><path d="M9.5 6.5h3" /></S>;
    case "picross": return <S size={size}><rect x="4" y="4" width="16" height="16" rx="2" /><rect x="6.5" y="6.5" width="4.5" height="4.5" rx="1" fill="currentColor" stroke="none" /><rect x="13" y="13" width="4.5" height="4.5" rx="1" fill="currentColor" stroke="none" /></S>;
    case "stack": return <S size={size}><rect x="6" y="3.5" width="12" height="4" rx="1.5" /><rect x="4" y="10" width="16" height="4" rx="1.5" fill="currentColor" stroke="none" opacity=".75" /><rect x="6" y="16.5" width="12" height="4" rx="1.5" opacity=".5" /></S>;
    case "frogger": return <S size={size}><circle cx="8.5" cy="9" r="3" /><circle cx="15.5" cy="9" r="3" /><circle cx="8.5" cy="9" r=".9" fill="currentColor" stroke="none" /><circle cx="15.5" cy="9" r=".9" fill="currentColor" stroke="none" /><path d="M5 15c2 3 12 3 14 0M7 19c3 1.5 9 1.5 10 0" /></S>;
    case "tron": return <S size={size}><circle cx="6" cy="17" r="3" /><circle cx="18" cy="17" r="3" /><path d="M6 17l3-8h5l4 8M9 9H4" /><path d="M4 9H2" opacity=".6" /></S>;
    case "carrera": return <S size={size}><path d="M6 21V4" /><path d="M6 4h12v4H6" fill="currentColor" stroke="none" opacity=".85" /><path d="M6 8h12v4H6" /><path d="M10 4v8M14 4v8" stroke="#fff" strokeWidth="1.2" opacity=".8" /></S>;
    case "saltarin": return <S size={size}><path d="M12 20V7M6.5 12.5 12 7l5.5 5.5" /><path d="M6.5 18.5 12 13l5.5 5.5" opacity=".5" /></S>;
    case "burbujas": return <S size={size}><circle cx="9" cy="13" r="5" /><circle cx="17" cy="8" r="3.2" /><circle cx="17.5" cy="17" r="2" opacity=".6" /></S>;
    case "malabares": return <S size={size}><circle cx="6" cy="8" r="2.4" /><circle cx="12" cy="6" r="2.4" fill="currentColor" stroke="none" opacity=".85" /><circle cx="18" cy="8" r="2.4" /><path d="M4 20c3-4 13-4 16 0" /></S>;
    case "guerra": return <S size={size}><path d="M4 20 16 5M5 4l3 3M16 5l3-1-1 3z" /><path d="M20 20 8 5M19 4l-3 3M8 5L5 4l1 3z" opacity=".65" /></S>;
    case "poker": return <S size={size}><circle cx="9" cy="10" r="3" /><circle cx="15" cy="10" r="3" /><circle cx="12" cy="7" r="3" /><path d="M12 13v8M8.5 21h7" /></S>;
    case "bingo": return <S size={size}><circle cx="12" cy="13" r="8" /><circle cx="12" cy="13" r="3.4" /><T x={12} y={15.5} size={6}>75</T><path d="M12 2v1.5" /></S>;
    case "sietemedio": return <S size={size}><circle cx="12" cy="12" r="8.5" /><T x={12} y={14} size={7}>7½</T><path d="M7 6a8 8 0 0 1 5-2.5" opacity=".6" /></S>;
    case "mate1": return <S size={size}><path d="M7 20v-3c0-2 1-3 2-4l1-5c0-1.5 1-2.5 2.5-2.5S15 7 14.5 9L14 11h3l-1.5 3H13l-1 3z" /><path d="M5 20h14" /></S>;
    case "memorianum": return <S size={size}><T x={12} y={13} size={10}>123</T><path d="M5 18h14" /><path d="M5 18l2-2M19 18l-2-2" opacity=".6" /></S>;
    case "ddr": return <S size={size}><path d="M11 4 8 7M11 4l3 3M11 4v5" /><path d="M13 20l3-3M13 20l-3-3M13 20v-5" opacity=".55" /><path d="M4 11 7 8M4 11l3 3M4 11h5" /><path d="M20 13l-3-2M20 13l-3 4M20 13h-5" opacity=".55" /></S>;
    case "capitales": return <S size={size}><circle cx="12" cy="12" r="8.5" /><ellipse cx="12" cy="12" rx="4" ry="8.5" /><path d="M3.5 12h17M5 7.5h14M5 16.5h14" opacity=".7" /></S>;
    case "crucigrama": return <S size={size}><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M4 9.3h16M4 14.6h16M9.3 4v16" opacity=".6" /><rect x="9.3" y="9.3" width="5.3" height="5.3" fill="currentColor" stroke="none" /></S>;
    case "cascada": return <S size={size}><T x={12} y={9} size={10}>A</T><path d="M12 12v9M8.5 17.5 12 21l3.5-3.5" /><path d="M6 12v4M18 12v4" opacity=".5" /></S>;
    case "bolalab": return <S size={size}><rect x="3" y="3" width="18" height="18" rx="4" /><path d="M8 3v7H3" opacity=".6" /><circle cx="15" cy="15" r="3" fill="currentColor" stroke="none" /></S>;
    case "pesca": return <S size={size}><path d="M12 2v8" /><path d="M12 10a4.5 4.5 0 0 1-9 0" /><path d="M3 10l-1.5 2.5L3 15" /><path d="M15 15c1.5-1 3-1 4.5 0-1.5 1-3 1-4.5 0zM15 15l-1 2" opacity=".7" /></S>;
    case "zombies": return <S size={size}><circle cx="12" cy="10" r="7" /><path d="M9 15v3.5h6V15" /><circle cx="9.5" cy="10" r="1.4" fill="currentColor" stroke="none" /><circle cx="14.5" cy="10" r="1.4" fill="currentColor" stroke="none" /><path d="M11 15.5v1.5M13 15.5v1.5" /></S>;
    case "equilibrio": return <S size={size}><rect x="7" y="3.5" width="10" height="3.5" rx="1.5" /><rect x="5" y="9" width="14" height="3.5" rx="1.5" fill="currentColor" stroke="none" opacity=".75" /><rect x="7" y="14.5" width="10" height="3.5" rx="1.5" opacity=".5" /><path d="M4 21h16" /></S>;
    case "cazapalabra": return <S size={size}><circle cx="10.5" cy="10.5" r="6" /><path d="M15 15l5 5" /><T x={10.5} y={14} size={7}>ñ</T></S>;
    case "pulso": return <S size={size}><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" /><path d="M12 4v3M12 17v3M4 12h3M17 12h3" /></S>;
    case "inversa": return <S size={size}><path d="M4 8h13l-3-3M20 16H7l3 3" /><T x={12} y={14} size={7}>21</T></S>;
    case "parimpar": return <S size={size}><T x={7.5} y={15} size={10}>2</T><T x={16.5} y={15} size={10}>3</T><path d="M12 4v16" opacity=".5" /></S>;
    case "labciego": return <S size={size}><rect x="3" y="3" width="18" height="18" rx="4" /><path d="M8 8h8v8H8z" /><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" /><path d="M12 3v2M12 19v2M3 12h2M19 12h2" opacity=".6" /></S>;
    case "sprint": return <S size={size}><path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V10m0-4.5a1.5 1.5 0 0 1 3 0V10m0-3a1.5 1.5 0 0 1 3 0v6c0 3-2 6-5.5 6S7 17 6 14.5L4.5 11c-.5-1.2 1-2.2 2-1.4L9 11z" /></S>;
    case "ordena": return <S size={size}><path d="M7 4v13M7 17l-2.5-2.5M7 17l2.5-2.5" /><path d="M17 20V7M17 7l-2.5 2.5M17 7l2.5 2.5" opacity=".6" /><T x={12} y={14} size={7}>5</T></S>;
    case "destello": return <S size={size}><path d="M13 2 5 14h6l-1 8 8-12h-6z" /><circle cx="18" cy="18" r="3" opacity=".6" /></S>;
    case "sombras": return <S size={size}><rect x="2.5" y="5" width="8" height="8" rx="2" /><rect x="13.5" y="5" width="8" height="8" rx="2" /><rect x="2.5" y="15" width="8" height="8" rx="2" /><circle cx="17.5" cy="19" r="4" fill="currentColor" stroke="none" opacity=".85" /></S>;
    case "ruta": return <S size={size}><path d="M4 18L9 13M9 13l-3-3M9 13H4" /><path d="M12 17V6M12 6L9 9M12 6l3 3" /><path d="M20 18l-2-2M20 18l-2 2" opacity=".55" /></S>;
    case "escalera": return <S size={size}><path d="M3 20h4v-4h4v-4h4V8h4V4" /><rect x="15" y="15" width="6" height="6" rx="1.5" fill="currentColor" stroke="none" /></S>;
    case "oidofino": return <S size={size}><path d="M6 10v4h3l4 3.5v-11L9 10z" /><path d="M16 9a4.5 4.5 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11" /></S>;
    case "atajada": return <S size={size}><circle cx="12" cy="12" r="8.5" /><path d="M7 14c1-3 3-4 5-4s4 1 5 4" /><circle cx="10" cy="11" r="1" fill="currentColor" stroke="none" /><circle cx="14" cy="11" r="1" fill="currentColor" stroke="none" /></S>;
    case "oca": return <S size={size}><circle cx="7" cy="15" r="3.5" /><circle cx="15" cy="9" r="3.5" opacity=".55" /><path d="M7 15l8-6" /><path d="M17 17l4-1-1 4" /></S>;
    case "marcador": return <S size={size}><path d="M8 4h8v5a4 4 0 0 1-8 0z" /><path d="M8 5H4.5A3.5 3.5 0 0 0 8 12M16 5h3.5A3.5 3.5 0 0 1 16 12" /><path d="M12 13v4M8.5 20.5h7M10 17h4" /></S>;
    case "inicio": return <S size={size}><path d="M3.5 11.5 12 3.5l8.5 8" /><path d="M6 10v10h12V10" /><rect x="10.5" y="14" width="3" height="6" /></S>;
    case "buscar": return <S size={size}><circle cx="11" cy="11" r="6.5" /><path d="M15.8 15.8 20.5 20.5" /></S>;
    case "estrella": return <S size={size}><path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8L3.5 9.7l5.9-.8z" /></S>;
    case "estrella-llena": return <S size={size}><path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8L3.5 9.7l5.9-.8z" fill="currentColor" stroke="none" /></S>;
    case "aleatorio": return <S size={size}><rect x="4" y="7" width="11" height="11" rx="2.5" /><circle cx="9.5" cy="12.5" r="1.3" fill="currentColor" stroke="none" /><path d="M15 4.5h4.5V9M19.5 4.5 13 11" /></S>;
    case "desafio": return <S size={size}><circle cx="11" cy="12" r="7" /><circle cx="11" cy="12" r="3.4" /><path d="m13.5 9.5 4.5 4.5 3-3" /></S>;
    case "sol": return <S size={size}><circle cx="12" cy="12" r="4.5" /><path d="M12 2.5V5M12 19v2.5M2.5 12H5M19 12h2.5M5 5l1.8 1.8M17.2 17.2 19 19M19 5l-1.8 1.8M6.8 17.2 5 19" /></S>;
    case "playa": return <S size={size}><circle cx="17" cy="7" r="3" /><path d="M3 18c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 6 0" /><path d="M7 14c0-3 2-5 5-5 0 2-1 3-2 4" /></S>;
    case "luna": return <S size={size}><path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z" /></S>;
    case "retro": return <S size={size}><rect x="3" y="7" width="18" height="12" rx="2.5" /><path d="M8 21h8M9 7l3-3 3 3" /><path d="M7 11.5h.5M10.5 11.5h.5" /></S>;
    case "sonido": return <S size={size}><path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z" /><path d="M15 9a4.5 4.5 0 0 1 0 6M17.5 6.8a8 8 0 0 1 0 10.4" /></S>;
    case "silencio": return <S size={size}><path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z" /><path d="m16 10 5 5M21 10l-5 5" /></S>;
    case "rgb": return <S size={size}><path d="M4 18a8 8 0 0 1 16 0" /><circle cx="8" cy="14" r="1.4" fill="currentColor" stroke="none" /><circle cx="12" cy="11.5" r="1.4" fill="currentColor" stroke="none" /><circle cx="16" cy="14" r="1.4" fill="currentColor" stroke="none" /></S>;
    case "jugar": return <S size={size}><path d="M8 5l11 7-11 7z" fill="currentColor" stroke="none" /></S>;
    case "pausa": return <S size={size}><rect x="7" y="5" width="3.4" height="14" rx="1.4" fill="currentColor" stroke="none" /><rect x="13.6" y="5" width="3.4" height="14" rx="1.4" fill="currentColor" stroke="none" /></S>;
    case "reiniciar": return <S size={size}><path d="M20 12a8 8 0 1 1-2.3-5.6" /><path d="M20 3.5V8h-4.5" /></S>;
    case "refrescar": return <S size={size}><path d="M20 12a8 8 0 0 1-14 5M4 12a8 8 0 0 1 14-5" /><path d="M18 3.5V8h-4.5M6 20.5V16h4.5" /></S>;
    case "reloj": return <S size={size}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></S>;
    case "fuego": return <S size={size}><path d="M12 2.5s6 5.5 6 11a6 6 0 0 1-12 0c0-2.5 1.2-4.5 2.5-6 .3 1.5 1 2.5 2.3 3C11 8 11.3 5 12 2.5z" /></S>;
    case "nivel": return <S size={size}><circle cx="12" cy="12" r="8.5" /><path d="m12 8 1.4 2.9 3.1.4-2.3 2.2.6 3.1-2.8-1.5-2.8 1.5.6-3.1-2.3-2.2 3.1-.4z" fill="currentColor" stroke="none" /></S>;
    case "mando": return <S size={size}><path d="M7 8h10a5 5 0 0 1 5 5c0 2.5-1.5 5.5-3.5 5.5-1.5 0-2-1.5-2.7-3H8.2c-.7 1.5-1.2 3-2.7 3C3.5 18.5 2 15.5 2 13a5 5 0 0 1 5-5z" /><path d="M7.5 11v3M6 12.5h3" /><circle cx="15.5" cy="11.8" r="1" fill="currentColor" stroke="none" /><circle cx="17.5" cy="14" r="1" fill="currentColor" stroke="none" /></S>;
    case "cerrar": return <S size={size}><path d="m6 6 12 12M18 6 6 18" /></S>;
    case "descargar": return <S size={size}><path d="M12 3.5V15M7.5 10.5 12 15l4.5-4.5" /><path d="M4.5 17.5v2h15v-2" /></S>;
    case "compartir": return <S size={size}><circle cx="6" cy="12" r="2.5" /><circle cx="17" cy="5.5" r="2.5" /><circle cx="17" cy="18.5" r="2.5" /><path d="M8.2 10.8l6.6-4M8.2 13.2l6.6 4" /></S>;
    default: {
      const letra = String(n || "?").charAt(0).toUpperCase();
      return <S size={size}><T x={12} y={16} size={13}>{letra}</T></S>;
    }
  }
}

export function IconoJuego({ id, size = 22 }) {
  return <Icono n={id} size={size} />;
}

const TITULO_A_ICONO = {
  "Adivina el número": "adivina", "Caza del tesoro": "caza", "Ahorcado": "ahorcado",
  "Palabra 5": "wordle", "Wordle": "wordle", "Piedra, papel o tijeras": "rps", "Memoria": "memoria",
  "Trivia": "trivia", "Blackjack": "blackjack", "Dados": "dados",
  "Tic-Tac-Toe": "treslinea", "Buscaminas": "buscaminas", "Conecta 4": "c4",
  "Fusión 2048": "juego2048", "2048": "juego2048", "Secuencia Neón": "simon", "Simón dice": "simon", "Mastermind": "mastermind",
  "Serpiente (Snake)": "snake", "Serpiente": "snake", "Hundir la flota": "flota",
  "Puzzle 15": "puzzle15",   "Pong neón": "pong", "Pong 2 Jugadores": "pong2p", "Rebote Neón": "pong", "Rebote 2 Jugadores": "pong2p",
  "Rompebloques": "breakout", "Tragaperras": "tragaperras", "Reflejos": "reflejos",
  "Math Blitz": "mathblitz", "Vuelo Neón": "flappy", "Flappy neón": "flappy", "Bloques Neón": "tetris", "Tetris neón": "tetris",
  "Toca al Topo": "topo", "Laberinto": "laberinto", "Sudoku": "sudoku",
  "Torres de Hanói": "hanoi", "Lights Out": "luces", "Reversi (Othello)": "othello",
  "Reversi": "othello", "Damas": "damas", "Gomoku": "gomoku",
  "Mecanografía": "mecanografia", "Piano Tiles": "piano", "Teclas Ritmo": "piano", "Atrapa la Fruta": "atrapar",
  "Esquiva Meteoros": "esquiva", "Dino Salto": "dino", "Invasores Neón": "naves",
  "Comepuntos": "pacman", "Ruleta": "ruleta", "Yahtzee": "yahtzee", "Dados Cinco": "yahtzee",
  "Sopa de Letras": "sopa", "Anagramas": "anagramas", "Stroop Colores": "stroop",
  "Aim Trainer": "aim", "Penaltis": "penaltis", "Bolos Neón": "bowling",
  "Nonogram": "picross", "Torre Stack": "stack", "Rana Crossing": "frogger",
  "Tron Neón": "tron", "Moto Neón": "tron", "Carrera Neón": "carrera", "Saltarín Vertical": "saltarin",
  "Cazaburbujas": "burbujas", "Malabares": "malabares", "Guerra de Cartas": "guerra",
  "Video Poker": "poker", "Bingo": "bingo", "Siete y Medio": "sietemedio",
  "Mate en 1": "mate1", "Memoria Numérica": "memorianum", "Dance Flechas": "ddr",
  "Capitales del Mundo": "capitales", "Crucigrama Mini": "crucigrama",
  "Cascada de Letras": "cascada", "Bola Laberinto": "bolalab", "Pesca": "pesca",
  "Defensa Zombie": "zombies", "Marcador": "marcador",
  "Torre Equilibrio": "equilibrio", "Caza Palabra": "cazapalabra",
  "Pulso Neón": "pulso", "Secuencia Inversa": "inversa",
  "Par o Impar Relámpago": "parimpar", "Laberinto Ciego": "labciego",
  "Sprint de Clics": "sprint", "Ordena Números": "ordena",
  "Destello": "destello", "Sombras Gemelas": "sombras", "Ruta Exprés": "ruta",
  "Escalera de Dados": "escalera", "Oído Fino": "oidofino",
  "Atajada": "atajada", "La Oca Veloz": "oca",
  "Quiz Historia": "trivia", "Quiz Ciencia": "trivia", "Quiz Geografía": "trivia",
  "Quiz Deportes": "trivia", "Quiz Música": "trivia", "Quiz Cine": "trivia",
  "Quiz Naturaleza": "trivia", "Quiz Tecnología": "trivia", "Quiz Arte": "trivia",
  "Quiz Gastronomía": "trivia", "Quiz Animales": "trivia", "Quiz Espacio": "trivia",
  "Quiz Libros": "trivia", "Quiz Cuerpo": "trivia", "Quiz Viajes": "trivia",
  "Verdad: Ciencia": "desafio", "Verdad: Historia": "desafio", "Verdad: Animales": "desafio",
  "Verdad: Deportes": "desafio", "Verdad: Mundo": "desafio", "Verdad: Cuerpo": "desafio",
  "Verdad: Música": "desafio", "Verdad: Comida": "desafio",
  "¿Quién soy? Animales": "sopa", "¿Quién soy? Oficios": "sopa",
  "Capitales: América": "capitales", "Capitales: Europa": "capitales",
  "Capitales: Asia": "capitales", "Capitales: África": "capitales",
  "Capitales: Oceanía": "capitales",
  "Banderas: América": "capitales", "Banderas: Europa": "capitales",
  "Banderas: Asia y África": "capitales",
  "Mímica": "malabares", "Mímica: Pelis": "malabares",
  "Verdad o Reto": "aleatorio", "Verdad o Reto Kids": "aleatorio",
  "Teléfono Roto": "memorianum", "Teléfono de Frases": "memorianum",
  "Duelo de Manos": "rps", "Duelo Pro: +Lagarto": "rps",
  "Dados 2P": "dados", "Dados 2P Largo": "dados",
  "Duelo de Reflejos": "reflejos", "Duelo Largo": "reflejos",
  "Copa Relámpago": "carrera", "Lotería": "bingo",
  "¿Dónde Quedó?": "caza", "¿Dónde Quedó? Pro": "caza",
  "¡Basta!": "mecanografia", "¡Basta! Junior": "mecanografia",
  "Duelo de Trivia": "trivia", "Duelo de Cultura": "trivia",
  "¿Qué animal es?": "sopa", "¿Qué país es?": "sopa", "¿Qué comida es?": "sopa",
  "¿Qué oficio es?": "sopa", "¿Qué deporte es?": "sopa", "¿Qué instrumento es?": "sopa",
  "¿Qué flor es?": "sopa", "¿Qué vehículo es?": "sopa", "¿Qué fruta es?": "sopa",
  "¿Qué prenda es?": "sopa", "¿Qué mueble es?": "sopa", "¿Qué color es?": "sopa",
  "Completa el Refrán": "crucigrama", "Dichos Populares": "crucigrama",
  "Frases: Refranes": "crucigrama", "Frases: Datos": "crucigrama",
  "Frases: Animales": "crucigrama", "Frases: Viajes": "crucigrama",
  "Palabra Diaria": "wordle", "Palabra 6": "wordle", "Palabra 4": "wordle",
  "Ahorcado: Animales": "ahorcado", "Ahorcado: Comidas": "ahorcado",
  "Ahorcado: Países": "ahorcado", "Ahorcado: Oficios": "ahorcado",
  "Ahorcado: Deportes": "ahorcado",
  "Emoji: Animales": "memoria", "Emoji: Comida": "memoria", "Emoji: Deportes": "memoria",
  "Emoji: Objetos": "memoria", "Emoji: Naturaleza": "memoria", "Emoji: Viajes": "memoria",
  "Ordena al Revés": "memorianum", "Ordena Letras": "memorianum", "Ordena Pares": "memorianum",
  "Sumas Veloces": "mathblitz", "Restas Veloces": "mathblitz", "Tablas Veloces": "mathblitz",
  "Divisiones Netas": "mathblitz", "Dobles y Mitades": "mathblitz", "Mezcla Mental": "mathblitz",
  "El Intruso: Animales": "buscar", "El Intruso: Frutas": "buscar",
  "El Intruso: Países": "buscar", "El Intruso: Colores": "buscar",
  "El Intruso: Deportes": "buscar", "El Intruso: Oficios": "buscar",
  "El Intruso: Música": "buscar", "El Intruso: Comidas": "buscar",
  "El Intruso: Ropa": "buscar", "El Intruso: Casa": "buscar",
  "Parejas de Números": "memoria", "Parejas de Letras": "memoria",
  "Parejas de Banderas": "memoria", "Parejas de Animales": "memoria",
  "Parejas de Frutas": "memoria", "Parejas de Deportes": "memoria",
  "Parejas de Formas": "memoria", "Parejas de Comida": "memoria",
  "Parejas del Espacio": "memoria", "Parejas de Música": "memoria",
  "Adivina el 50": "adivina", "Adivina el 1000": "adivina", "Adivina Exprés": "adivina",
  "La Máquina Adivina": "adivina",
  "Mayor o Menor": "poker", "Escoba": "poker", "Brisca": "poker",
  "Parchís Veloz": "dados", "Parchís Duelo": "dados",
  "Serpientes y Escaleras": "carrera", "Serpientes Duelo": "carrera",
  "Raya 4×4": "treslinea", "Raya 5×5": "treslinea",
  "Sudoku 4×4": "sudoku", "Buscaminas Chico": "buscaminas", "Buscaminas Grande": "buscaminas",
  "Toca el Mayor": "reflejos", "Toca el Menor": "reflejos", "Toca el Par": "reflejos",
  "Toca el Impar": "reflejos", "Toca el Primo": "reflejos",
  "Toca el Múltiplo de 5": "reflejos", "Toca la Decena": "reflejos",
  "Salto Largo": "saltarin", "Oído Veloz": "sonido",
  "Quiz Mitología": "trivia", "Quiz Inventos": "trivia", "Quiz Océanos": "trivia",
  "Parejas de Navidad": "memoria", "Parejas de Halloween": "memoria",
  "Siete Alto": "dados", "Moneda Racha": "tragaperras", "Hípica": "carrera",
  "Chuck de la Suerte": "dados", "Punto Banco": "poker",
  "Keno Veloz": "bingo", "Rasca y Gana": "tragaperras",
};

export function iconoDeTitulo(titulo) {
  return TITULO_A_ICONO[titulo] || null;
}

export function LogoArcade({ size = 34 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#fff"
      strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 12h10a4.5 4.5 0 0 1 4.5 4.5c0 2.2-1.3 4.8-3 4.8-1.3 0-1.8-1.3-2.4-2.6H7.9c-.6 1.3-1.1 2.6-2.4 2.6-1.7 0-3-2.6-3-4.8A4.5 4.5 0 0 1 7 12z" fill="rgba(255,255,255,.16)" />
      <path d="M12 12V6.5" />
      <circle cx="12" cy="4.8" r="2" fill="#fff" stroke="none" />
      <path d="M7.4 14.4v2.6M6.1 15.7h2.6" />
      <circle cx="15.4" cy="14.8" r=".9" fill="#fff" stroke="none" />
      <circle cx="17.2" cy="16.6" r=".9" fill="#fff" stroke="none" />
    </svg>
  );
}
