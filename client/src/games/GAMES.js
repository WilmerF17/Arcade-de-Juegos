import { lazy } from "react";
const Destello = lazy(() => import("./Destello"));
const Sombras = lazy(() => import("./Sombras"));
const Ruta = lazy(() => import("./Ruta"));
const Escalera = lazy(() => import("./Escalera"));
const OidoFino = lazy(() => import("./OidoFino"));
const Atajada = lazy(() => import("./Atajada"));
const Oca = lazy(() => import("./Oca"));
const AdivinaNumero = lazy(() => import("./AdivinaNumero"));
const CazaTesoro = lazy(() => import("./CazaTesoro"));
const Ahorcado = lazy(() => import("./Ahorcado"));
const Wordle = lazy(() => import("./Wordle"));
const RPS = lazy(() => import("./RPS"));
const Memoria = lazy(() => import("./Memoria"));
const Trivia = lazy(() => import("./Trivia"));
const Blackjack = lazy(() => import("./Blackjack"));
const Dados = lazy(() => import("./Dados"));
const TicTacToe = lazy(() => import("./TicTacToe"));
const Minesweeper = lazy(() => import("./Minesweeper"));
const Connect4 = lazy(() => import("./Connect4"));
const Juego2048 = lazy(() => import("./Juego2048"));
const Simon = lazy(() => import("./Simon"));
const Mastermind = lazy(() => import("./Mastermind"));
const Snake = lazy(() => import("./Snake"));
const HundirFlota = lazy(() => import("./HundirFlota"));
const Puzzle15 = lazy(() => import("./Puzzle15"));
const Pong = lazy(() => import("./Pong"));
const Breakout = lazy(() => import("./Breakout"));
const Tragaperras = lazy(() => import("./Tragaperras"));
const Reflejos = lazy(() => import("./Reflejos"));
const MathBlitz = lazy(() => import("./MathBlitz"));
const Flappy = lazy(() => import("./Flappy"));
const Tetris = lazy(() => import("./Tetris"));
const Topo = lazy(() => import("./Topo"));
const Laberinto = lazy(() => import("./Laberinto"));
const Sudoku = lazy(() => import("./Sudoku"));
const Hanoi = lazy(() => import("./Hanoi"));
const Luces = lazy(() => import("./Luces"));
const Othello = lazy(() => import("./Othello"));
const Damas = lazy(() => import("./Damas"));
const Gomoku = lazy(() => import("./Gomoku"));
const Mecanografia = lazy(() => import("./Mecanografia"));
const Piano = lazy(() => import("./Piano"));
const Atrapar = lazy(() => import("./Atrapar"));
const Esquiva = lazy(() => import("./Esquiva"));
const Dino = lazy(() => import("./Dino"));
const Naves = lazy(() => import("./Naves"));
const Pacman = lazy(() => import("./Pacman"));
const Ruleta = lazy(() => import("./Ruleta"));
const Yahtzee = lazy(() => import("./Yahtzee"));
const Sopa = lazy(() => import("./Sopa"));
const Anagramas = lazy(() => import("./Anagramas"));
const Stroop = lazy(() => import("./Stroop"));
const Aim = lazy(() => import("./Aim"));
const Penaltis = lazy(() => import("./Penaltis"));
const Bowling = lazy(() => import("./Bowling"));
const Picross = lazy(() => import("./Picross"));
const Stack = lazy(() => import("./Stack"));
const Frogger = lazy(() => import("./Frogger"));
const Pong2P = lazy(() => import("./Pong2P"));
const Tron = lazy(() => import("./Tron"));
const Carrera = lazy(() => import("./Carrera"));
const Saltarin = lazy(() => import("./Saltarin"));
const Burbujas = lazy(() => import("./Burbujas"));
const Malabares = lazy(() => import("./Malabares"));
const Guerra = lazy(() => import("./Guerra"));
const Poker = lazy(() => import("./Poker"));
const Bingo = lazy(() => import("./Bingo"));
const SieteMedio = lazy(() => import("./SieteMedio"));
const Mate1 = lazy(() => import("./Mate1"));
const MemoriaNum = lazy(() => import("./MemoriaNum"));
const DDR = lazy(() => import("./DDR"));
const Capitales = lazy(() => import("./Capitales"));
const Crucigrama = lazy(() => import("./Crucigrama"));
const Cascada = lazy(() => import("./Cascada"));
const BolaLab = lazy(() => import("./BolaLab"));
const Pesca = lazy(() => import("./Pesca"));
const Zombies = lazy(() => import("./Zombies"));
const Equilibrio = lazy(() => import("./Equilibrio"));
const CazaPalabra = lazy(() => import("./CazaPalabra"));
const Pulso = lazy(() => import("./Pulso"));
const Inversa = lazy(() => import("./Inversa"));
const ParImpar = lazy(() => import("./ParImpar"));
const LabCiego = lazy(() => import("./LabCiego"));
const Sprint = lazy(() => import("./Sprint"));
const Ordena = lazy(() => import("./Ordena"));

export const JUEGOS = {
  adivina: { nombre: "Adivina el número", emoji: "🔢", descripcion: "Adivina el número secreto con pistas frío/caliente.", Component: AdivinaNumero, tema: "neon-cian", grad: "linear-gradient(135deg,#06b6d4,#3b82f6)", tag: "Azar" },
  caza: { nombre: "Caza del tesoro", emoji: "🗺️", descripcion: "Explora el mapa con radar y encuentra el tesoro.", Component: CazaTesoro, tema: "aventura", grad: "linear-gradient(135deg,#f59e0b,#ef4444)", tag: "Exploración" },
  ahorcado: { nombre: "El ahorcado", emoji: "🪢", descripcion: "Adivina la palabra antes de completar el ahorcado.", Component: Ahorcado, tema: "papel", grad: "linear-gradient(135deg,#8b5cf6,#ec4899)", tag: "Palabras" },
  wordle: { nombre: "Palabra 5", emoji: "🟩", descripcion: "Adivina la palabra de 5 letras en 6 intentos.", Component: Wordle, tema: "palabra5", grad: "linear-gradient(135deg,#22c55e,#15803d)", tag: "Palabras" },
  rps: { nombre: "Piedra papel tijeras", emoji: "✂️", descripcion: "Duelo al mejor de 5, con modo lagarto/spock.", Component: RPS, tema: "duelo", grad: "linear-gradient(135deg,#f43f5e,#fb923c)", tag: "Duelo" },
  memoria: { nombre: "Memoria", emoji: "🧠", descripcion: "Encuentra todas las parejas de emojis.", Component: Memoria, tema: "mente", grad: "linear-gradient(135deg,#a855f7,#6366f1)", tag: "Mente" },
  trivia: { nombre: "Trivia", emoji: "❓", descripcion: "8 categorías, 10 preguntas, contra el crono.", Component: Trivia, tema: "quiz", grad: "linear-gradient(135deg,#38bdf8,#6366f1)", tag: "Cultura" },
  blackjack: { nombre: "Blackjack", emoji: "🃏", descripcion: "Casino: acércate a 21, dobla y gana a la banca.", Component: Blackjack, tema: "casino", grad: "linear-gradient(135deg,#052e16,#22c55e)", tag: "Casino" },
  dados: { nombre: "Dados", emoji: "🎲", descripcion: "Duelo de dados a 5 rondas con animación 3D.", Component: Dados, tema: "azar", grad: "linear-gradient(135deg,#eab308,#dc2626)", tag: "Azar" },
  treslinea: { nombre: "Tres en línea", emoji: "❌", descripcion: "Tic-tac-toe contra IA minimax o un amigo.", Component: TicTacToe, tema: "minimal", grad: "linear-gradient(135deg,#22d3ee,#a78bfa)", tag: "Tablero" },
  buscaminas: { nombre: "Buscaminas", emoji: "💣", descripcion: "Revela celdas sin pisar las minas.", Component: Minesweeper, tema: "militar", grad: "linear-gradient(135deg,#475569,#22c55e)", tag: "Tablero" },
  c4: { nombre: "Conecta 4", emoji: "🔴", descripcion: "Forma línea de 4 antes que la IA.", Component: Connect4, tema: "arcade-rojo", grad: "linear-gradient(135deg,#ef4444,#f59e0b)", tag: "Tablero" },
  juego2048: { nombre: "Fusión 2048", emoji: "🔶", descripcion: "Fusiona fichas hasta llegar a 2048.", Component: Juego2048, tema: "numeros", grad: "linear-gradient(135deg,#fbbf24,#f97316)", tag: "Puzzle" },
  simon: { nombre: "Secuencia Neón", emoji: "🔵", descripcion: "Repite la secuencia de colores que crece.", Component: Simon, tema: "luces", grad: "linear-gradient(135deg,#3b82f6,#a855f7)", tag: "Arcade" },
  mastermind: { nombre: "Mastermind", emoji: "🎨", descripcion: "Descifra el código secreto de colores.", Component: Mastermind, tema: "codigo", grad: "linear-gradient(135deg,#ec4899,#8b5cf6)", tag: "Lógica" },
  snake: { nombre: "Serpiente", emoji: "🐍", descripcion: "Come, crece y no te choques. Modo turbo.", Component: Snake, tema: "selva", grad: "linear-gradient(135deg,#22c55e,#84cc16)", tag: "Arcade" },
  flota: { nombre: "Hundir la flota", emoji: "🚢", descripcion: "Batalla naval contra la IA con sonar.", Component: HundirFlota, tema: "oceano", grad: "linear-gradient(135deg,#0ea5e9,#1e3a8a)", tag: "Estrategia" },
  puzzle15: { nombre: "Puzzle 15", emoji: "🧩", descripcion: "Ordena el puzzle deslizante 4×4.", Component: Puzzle15, tema: "puzzle", grad: "linear-gradient(135deg,#14b8a6,#6366f1)", tag: "Puzzle" },
  pong: { nombre: "Rebote Neón", emoji: "🏓", descripcion: "El clásico rebote con estelas y efecto neón.", Component: Pong, tema: "neon", grad: "linear-gradient(135deg,#22d3ee,#e879f9)", tag: "Arcade" },
  breakout: { nombre: "Rompebloques", emoji: "🧱", descripcion: "Rompe todos los bloques con la pala láser.", Component: Breakout, tema: "retro", grad: "linear-gradient(135deg,#fb7185,#a855f7)", tag: "Arcade" },
  tragaperras: { nombre: "Tragaperras", emoji: "🎰", descripcion: "Slots con créditos, rachas y premio mayor.", Component: Tragaperras, tema: "casino-neon", grad: "linear-gradient(135deg,#f59e0b,#ec4899)", tag: "Casino" },
  reflejos: { nombre: "Reflejos", emoji: "⚡", descripcion: "Test de reacción: toca solo en verde.", Component: Reflejos, tema: "voltaje", grad: "linear-gradient(135deg,#facc15,#22c55e)", tag: "Reflejos" },
  mathblitz: { nombre: "Math Blitz", emoji: "🔢", descripcion: "60s de cálculo mental con combos.", Component: MathBlitz, tema: "numeros-neon", grad: "linear-gradient(135deg,#38bdf8,#a855f7)", tag: "Mente" },
  flappy: { nombre: "Vuelo Neón", emoji: "🐤", descripcion: "Vuela entre tubos con física y partículas.", Component: Flappy, tema: "cielo", grad: "linear-gradient(135deg,#22c55e,#38bdf8)", tag: "Arcade" },
  tetris: { nombre: "Bloques Neón", emoji: "🟪", descripcion: "Apila piezas, limpia líneas y sube de nivel.", Component: Tetris, tema: "neon", grad: "linear-gradient(135deg,#7c3aed,#22d3ee)", tag: "Arcade" },
  topo: { nombre: "Toca al Topo", emoji: "🐹", descripcion: "Golpea topos 30s · teclas 1-9 · dorado ×3.", Component: Topo, tema: "pradera", grad: "linear-gradient(135deg,#84cc16,#22c55e)", tag: "Reflejos" },
  laberinto: { nombre: "Laberinto", emoji: "🧭", descripcion: "Escapa del laberinto procedural con flechas/WASD.", Component: Laberinto, tema: "aventura", grad: "linear-gradient(135deg,#14b8a6,#0ea5e9)", tag: "Puzzle" },
  sudoku: { nombre: "Sudoku", emoji: "🔢", descripcion: "9×9 clásico con 2 puzzles y cursor de teclado.", Component: Sudoku, tema: "numeros", grad: "linear-gradient(135deg,#38bdf8,#6366f1)", tag: "Lógica" },
  hanoi: { nombre: "Torres de Hanói", emoji: "🗼", descripcion: "Mueve la torre con movimientos óptimos.", Component: Hanoi, tema: "templo", grad: "linear-gradient(135deg,#f59e0b,#8b5cf6)", tag: "Lógica" },
  luces: { nombre: "Lights Out", emoji: "💡", descripcion: "Apaga las 25 luces · puzzle 5×5.", Component: Luces, tema: "luces", grad: "linear-gradient(135deg,#facc15,#f97316)", tag: "Puzzle" },
  othello: { nombre: "Reversi", emoji: "⚫", descripcion: "Reversi 8×8 contra IA glotona.", Component: Othello, tema: "tablero", grad: "linear-gradient(135deg,#15803d,#052e16)", tag: "Tablero" },
  damas: { nombre: "Damas", emoji: "♟️", descripcion: "Damas 8×8 contra IA · captura todo.", Component: Damas, tema: "clasico", grad: "linear-gradient(135deg,#b45309,#451a03)", tag: "Tablero" },
  gomoku: { nombre: "Gomoku", emoji: "⚪", descripcion: "5 en línea en 9×9 antes que la IA.", Component: Gomoku, tema: "zen", grad: "linear-gradient(135deg,#eab308,#a16207)", tag: "Tablero" },
  mecanografia: { nombre: "Mecanografía", emoji: "⌨️", descripcion: "Test 60s de velocidad y precisión.", Component: Mecanografia, tema: "oficina", grad: "linear-gradient(135deg,#64748b,#0ea5e9)", tag: "Palabras" },
  piano: { nombre: "Teclas Ritmo", emoji: "🎹", descripcion: "Ritmo con D F J K · 30 segundos.", Component: Piano, tema: "musica", grad: "linear-gradient(135deg,#ec4899,#6366f1)", tag: "Ritmo" },
  atrapar: { nombre: "Atrapa la Fruta", emoji: "🧺", descripcion: "Mueve la cesta ←/→ · evita bombas.", Component: Atrapar, tema: "huerto", grad: "linear-gradient(135deg,#22c55e,#eab308)", tag: "Arcade" },
  esquiva: { nombre: "Esquiva Meteoros", emoji: "🚀", descripcion: "Sobrevive con flechas/WASD a la lluvia.", Component: Esquiva, tema: "espacio", grad: "linear-gradient(135deg,#0f172a,#7c3aed)", tag: "Arcade" },
  dino: { nombre: "Dino Salto", emoji: "🦖", descripcion: "Runner infinito · ESPACIO salta cactus.", Component: Dino, tema: "desierto", grad: "linear-gradient(135deg,#f59e0b,#57534e)", tag: "Arcade" },
  naves: { nombre: "Invasores Neón", emoji: "👾", descripcion: "Shooter ←/→ + ESPACIO · 3 vidas.", Component: Naves, tema: "espacio", grad: "linear-gradient(135deg,#22d3ee,#7c3aed)", tag: "Arcade" },
  pacman: { nombre: "Comepuntos", emoji: "🟡", descripcion: "Come todo el laberinto sin que te atrapen.", Component: Pacman, tema: "retro", grad: "linear-gradient(135deg,#facc15,#0ea5e9)", tag: "Arcade" },
  ruleta: { nombre: "Ruleta", emoji: "🎡", descripcion: "Rojo/negro/par/impar ×2 · número ×35.", Component: Ruleta, tema: "casino", grad: "linear-gradient(135deg,#ef4444,#052e16)", tag: "Casino" },
  yahtzee: { nombre: "Dados Cinco", emoji: "🎲", descripcion: "5 dados, 3 tiros, 12 categorías.", Component: Yahtzee, tema: "dados", grad: "linear-gradient(135deg,#a855f7,#f59e0b)", tag: "Azar" },
  sopa: { nombre: "Sopa de Letras", emoji: "🔍", descripcion: "Encuentra las palabras ocultas · 3 niveles.", Component: Sopa, tema: "papel", grad: "linear-gradient(135deg,#0ea5e9,#6366f1)", tag: "Palabras" },
  anagramas: { nombre: "Anagramas", emoji: "🔀", descripcion: "60s ordenando letras con rachas.", Component: Anagramas, tema: "letras", grad: "linear-gradient(135deg,#8b5cf6,#ec4899)", tag: "Palabras" },
  stroop: { nombre: "Stroop Colores", emoji: "🎨", descripcion: "Elige la TINTA, no la palabra · 30s.", Component: Stroop, tema: "mente", grad: "linear-gradient(135deg,#f43f5e,#facc15)", tag: "Mente" },
  aim: { nombre: "Aim Trainer", emoji: "🎯", descripcion: "Precisión y velocidad de clic · 30s.", Component: Aim, tema: "punteria", grad: "linear-gradient(135deg,#ef4444,#f59e0b)", tag: "Reflejos" },
  penaltis: { nombre: "Penaltis", emoji: "⚽", descripcion: "5 lanzamientos contra el portero.", Component: Penaltis, tema: "estadio", grad: "linear-gradient(135deg,#22c55e,#0ea5e9)", tag: "Deporte" },
  bowling: { nombre: "Bolos Neón", emoji: "🎳", descripcion: "Fija ángulo y potencia · 5 tiros.", Component: Bowling, tema: "bolera", grad: "linear-gradient(135deg,#7c3aed,#f59e0b)", tag: "Deporte" },
  picross: { nombre: "Nonogram", emoji: "🧩", descripcion: "Picross 5×5 con pistas · 3 puzzles.", Component: Picross, tema: "pixel", grad: "linear-gradient(135deg,#14b8a6,#a855f7)", tag: "Puzzle" },
  stack: { nombre: "Torre Stack", emoji: "🏗️", descripcion: "Apila bloques con ESPACIO al milímetro.", Component: Stack, tema: "obra", grad: "linear-gradient(135deg,#38bdf8,#7c3aed)", tag: "Arcade" },
  frogger: { nombre: "Rana Crossing", emoji: "🐸", descripcion: "Cruza 5 carriles con flechas/WASD · 3 vidas.", Component: Frogger, tema: "calle", grad: "linear-gradient(135deg,#22c55e,#0ea5e9)", tag: "Arcade" },
  pong2p: { nombre: "Rebote 2 Jugadores", emoji: "🏓", descripcion: "Duelo local: J1 W/S contra J2 ↑/↓.", Component: Pong2P, tema: "duelo", grad: "linear-gradient(135deg,#22c55e,#e879f9)", tag: "Duelo" },
  tron: { nombre: "Moto Neón", emoji: "🏍️", descripcion: "Estelas neón vs IA · no choques.", Component: Tron, tema: "neon", grad: "linear-gradient(135deg,#22d3ee,#fb7185)", tag: "Arcade" },
  carrera: { nombre: "Carrera Neón", emoji: "🏎️", descripcion: "Esquiva el tráfico con flechas/WASD.", Component: Carrera, tema: "asfalto", grad: "linear-gradient(135deg,#f59e0b,#ef4444)", tag: "Arcade" },
  saltarin: { nombre: "Saltarín Vertical", emoji: "🐤", descripcion: "Doodle jump con ←/→ · sube sin caer.", Component: Saltarin, tema: "cielo", grad: "linear-gradient(135deg,#38bdf8,#a855f7)", tag: "Arcade" },
  burbujas: { nombre: "Cazaburbujas", emoji: "🫧", descripcion: "Revienta burbujas 45s · combos · evita 💣.", Component: Burbujas, tema: "mar", grad: "linear-gradient(135deg,#22d3ee,#0ea5e9)", tag: "Reflejos" },
  malabares: { nombre: "Malabares", emoji: "🤹", descripcion: "Mantén la bola en el aire con la pala.", Component: Malabares, tema: "circo", grad: "linear-gradient(135deg,#a855f7,#f59e0b)", tag: "Arcade" },
  guerra: { nombre: "Guerra de Cartas", emoji: "🪖", descripcion: "13 rondas · carta alta gana · empate = guerra.", Component: Guerra, tema: "batalla", grad: "linear-gradient(135deg,#57534e,#ef4444)", tag: "Cartas" },
  poker: { nombre: "Video Poker", emoji: "🃏", descripcion: "5 cartas · quédate y cambia · premios.", Component: Poker, tema: "casino", grad: "linear-gradient(135deg,#0ea5e9,#a855f7)", tag: "Casino" },
  bingo: { nombre: "Bingo", emoji: "🎱", descripcion: "Cartón 5×5 · línea y bingo · modo auto.", Component: Bingo, tema: "sala", grad: "linear-gradient(135deg,#8b5cf6,#22c55e)", tag: "Azar" },
  sietemedio: { nombre: "Siete y Medio", emoji: "🪙", descripcion: "El clásico español vs la banca · no pases 7.5.", Component: SieteMedio, tema: "taberna", grad: "linear-gradient(135deg,#b45309,#f59e0b)", tag: "Cartas" },
  mate1: { nombre: "Mate en 1", emoji: "♞", descripcion: "Puzzles de ajedrez · encuentra el mate.", Component: Mate1, tema: "ajedrez", grad: "linear-gradient(135deg,#44403c,#a8a29e)", tag: "Lógica" },
  memorianum: { nombre: "Memoria Numérica", emoji: "🔢", descripcion: "Memoriza cifras cada vez más largas.", Component: MemoriaNum, tema: "mente", grad: "linear-gradient(135deg,#6366f1,#22d3ee)", tag: "Mente" },
  ddr: { nombre: "Dance Flechas", emoji: "💃", descripcion: "Ritmo con flechas/WASD · 45 segundos.", Component: DDR, tema: "disco", grad: "linear-gradient(135deg,#ec4899,#7c3aed)", tag: "Ritmo" },
  capitales: { nombre: "Capitales del Mundo", emoji: "🌍", descripcion: "15 países o 60s · capitales con rachas.", Component: Capitales, tema: "atlas", grad: "linear-gradient(135deg,#0ea5e9,#22c55e)", tag: "Cultura" },
  crucigrama: { nombre: "Crucigrama Mini", emoji: "📝", descripcion: "5 definiciones · comprueba con ENTER.", Component: Crucigrama, tema: "papel", grad: "linear-gradient(135deg,#78716c,#f59e0b)", tag: "Palabras" },
  cascada: { nombre: "Cascada de Letras", emoji: "🔤", descripcion: "Teclea letras que caen · 3 vidas · 60s.", Component: Cascada, tema: "lluvia", grad: "linear-gradient(135deg,#38bdf8,#6366f1)", tag: "Palabras" },
  bolalab: { nombre: "Bola Laberinto", emoji: "🔮", descripcion: "Bola con física e inercia hasta la meta.", Component: BolaLab, tema: "fisica", grad: "linear-gradient(135deg,#7c3aed,#22d3ee)", tag: "Puzzle" },
  pesca: { nombre: "Pesca", emoji: "🎣", descripcion: "10 lances · centra la barra y recoge.", Component: Pesca, tema: "lago", grad: "linear-gradient(135deg,#0ea5e9,#22c55e)", tag: "Casual" },
  zombies: { nombre: "Defensa Zombie", emoji: "🧟", descripcion: "Oleadas · clic dispara · R recarga.", Component: Zombies, tema: "noche", grad: "linear-gradient(135deg,#166534,#ef4444)", tag: "Acción" },
  equilibrio: { nombre: "Torre Equilibrio", emoji: "🏗️", descripcion: "Fija 10 pisos en la zona verde que se achica.", Component: Equilibrio, tema: "obra", grad: "linear-gradient(135deg,#ff3d5a,#ff9a3d)", tag: "Reflejos" },
  cazapalabra: { nombre: "Caza Palabra", emoji: "🔎", descripcion: "Toca la palabra de la categoría · 45s con rachas.", Component: CazaPalabra, tema: "letras", grad: "linear-gradient(135deg,#0ea5e9,#a855f7)", tag: "Palabras" },
  pulso: { nombre: "Pulso Neón", emoji: "💓", descripcion: "Toca cuando la barra pase por la ventana dorada.", Component: Pulso, tema: "voltaje", grad: "linear-gradient(135deg,#ff3d5a,#7c3aed)", tag: "Ritmo" },
  inversa: { nombre: "Secuencia Inversa", emoji: "🔄", descripcion: "Memoriza dígitos y escríbelos al revés.", Component: Inversa, tema: "mente", grad: "linear-gradient(135deg,#a855f7,#22d3ee)", tag: "Mente" },
  parimpar: { nombre: "Par o Impar Relámpago", emoji: "⚡", descripcion: "Clasifica números con ←/→ · 30 segundos.", Component: ParImpar, tema: "numeros-neon", grad: "linear-gradient(135deg,#facc15,#ff3d5a)", tag: "Mente" },
  labciego: { nombre: "Laberinto Ciego", emoji: "🙈", descripcion: "Memoriza el camino y crúzalo a ciegas.", Component: LabCiego, tema: "aventura", grad: "linear-gradient(135deg,#57534e,#ff9a3d)", tag: "Puzzle" },
  sprint: { nombre: "Sprint de Clics", emoji: "👆", descripcion: "¿Cuántos toques en 10 segundos?", Component: Sprint, tema: "punteria", grad: "linear-gradient(135deg,#22d3ee,#ff3d5a)", tag: "Reflejos" },
  ordena: { nombre: "Ordena Números", emoji: "🔢", descripcion: "Toca del menor al mayor · 8 rondas.", Component: Ordena, tema: "numeros", grad: "linear-gradient(135deg,#38bdf8,#a855f7)", tag: "Lógica" },
  destello: { nombre: "Destello", emoji: "✨", descripcion: "Toca la celda dorada antes de que se apague.", Component: Destello, tema: "luces", grad: "linear-gradient(135deg,#facc15,#ff9a3d)", tag: "Reflejos" },
  sombras: { nombre: "Sombras Gemelas", emoji: "👯", descripcion: "Encuentra el emoji que cambió · 10 rondas.", Component: Sombras, tema: "mente", grad: "linear-gradient(135deg,#a855f7,#22d3ee)", tag: "Mente" },
  ruta: { nombre: "Ruta Exprés", emoji: "🧭", descripcion: "Memoriza flechas y repítelas · 3 vidas.", Component: Ruta, tema: "aventura", grad: "linear-gradient(135deg,#22d3ee,#22c55e)", tag: "Mente" },
  escalera: { nombre: "Escalera de Dados", emoji: "🎲", descripcion: "Supera tu tiro para subir 6 peldaños.", Component: Escalera, tema: "dados", grad: "linear-gradient(135deg,#a855f7,#ff9a3d)", tag: "Azar" },
  oidofino: { nombre: "Oído Fino", emoji: "👂", descripcion: "¿El tono es grave, medio o agudo? · 12 rondas.", Component: OidoFino, tema: "musica", grad: "linear-gradient(135deg,#38bdf8,#a855f7)", tag: "Ritmo" },
  atajada: { nombre: "Atajada", emoji: "🧤", descripcion: "Portero: adivina 5 penaltis y ataja.", Component: Atajada, tema: "estadio", grad: "linear-gradient(135deg,#22c55e,#0ea5e9)", tag: "Deporte" },
  oca: { nombre: "La Oca Veloz", emoji: "🪿", descripcion: "Carrera de dados vs IA · clava el 24.", Component: Oca, tema: "taberna", grad: "linear-gradient(135deg,#22c55e,#eab308)", tag: "Tablero" },
};

export const CATEGORIAS = [
  { id: "palabras", nombre: "Palabras", icono: "sopa", juegos: ["ahorcado", "wordle", "sopa", "anagramas", "mecanografia", "crucigrama", "cascada", "capitales", "memorianum", "cazapalabra"] },
  { id: "logica", nombre: "Lógica y puzzle", icono: "puzzle15", juegos: ["mastermind", "puzzle15", "juego2048", "mathblitz", "caza", "sudoku", "hanoi", "luces", "picross", "laberinto", "stack", "mate1", "bolalab", "labciego", "ordena", "inversa", "sombras", "ruta"] },
  { id: "azar", nombre: "Azar y casino", icono: "dados", juegos: ["adivina", "rps", "dados", "blackjack", "tragaperras", "ruleta", "yahtzee", "guerra", "poker", "bingo", "sietemedio", "escalera"] },
  { id: "tablero", nombre: "Tablero y estrategia", icono: "treslinea", juegos: ["treslinea", "c4", "buscaminas", "flota", "othello", "damas", "gomoku", "oca"] },
  { id: "arcade", nombre: "Arcade y acción", icono: "mando", juegos: ["snake", "pong", "pong2p", "breakout", "simon", "flappy", "reflejos", "tetris", "topo", "atrapar", "esquiva", "dino", "naves", "pacman", "piano", "aim", "frogger", "tron", "carrera", "saltarin", "burbujas", "malabares", "ddr", "pesca", "zombies", "equilibrio", "sprint", "pulso", "destello"] },
  { id: "cultura", nombre: "Cultura, mente y deporte", icono: "capitales", juegos: ["trivia", "memoria", "stroop", "penaltis", "bowling", "parimpar", "atajada", "oidofino"] },
];

export const TEMAS = [
  { id: "neon", nombre: "Neón", icono: "🌃" },
  { id: "retro", nombre: "Retro", icono: "📼" },
  { id: "claro", nombre: "Claro", icono: "☀️" },
];
