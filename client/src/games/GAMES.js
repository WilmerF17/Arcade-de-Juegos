import { lazy } from "react";
const QuizMitologia = lazy(() => import("./QuizTema").then(m => ({ default: m.QuizMitologia })));
const QuizInventos = lazy(() => import("./QuizTema").then(m => ({ default: m.QuizInventos })));
const QuizOceanos = lazy(() => import("./QuizTema").then(m => ({ default: m.QuizOceanos })));
const ParejasNavidad = lazy(() => import("./Parejas").then(m => ({ default: m.ParejasNavidad })));
const ParejasHalloween = lazy(() => import("./Parejas").then(m => ({ default: m.ParejasHalloween })));
const SieteAlto = lazy(() => import("./SieteAlto"));
const MonedaRacha = lazy(() => import("./MonedaRacha"));
const Hipica = lazy(() => import("./Hipica"));
const ChuckSuerte = lazy(() => import("./ChuckSuerte"));
const PuntoBanco = lazy(() => import("./PuntoBanco"));
const KenoVeloz = lazy(() => import("./KenoVeloz"));
const RascaGana = lazy(() => import("./RascaGana"));
const QuizHistoria = lazy(() => import("./QuizTema").then(m => ({ default: m.QuizHistoria })));
const QuizCiencia = lazy(() => import("./QuizTema").then(m => ({ default: m.QuizCiencia })));
const QuizGeografia = lazy(() => import("./QuizTema").then(m => ({ default: m.QuizGeografia })));
const QuizDeportes = lazy(() => import("./QuizTema").then(m => ({ default: m.QuizDeportes })));
const QuizMusica = lazy(() => import("./QuizTema").then(m => ({ default: m.QuizMusica })));
const QuizCine = lazy(() => import("./QuizTema").then(m => ({ default: m.QuizCine })));
const QuizNaturaleza = lazy(() => import("./QuizTema").then(m => ({ default: m.QuizNaturaleza })));
const QuizTecno = lazy(() => import("./QuizTema").then(m => ({ default: m.QuizTecno })));
const QuizArte = lazy(() => import("./QuizTema").then(m => ({ default: m.QuizArte })));
const QuizGastro = lazy(() => import("./QuizTema").then(m => ({ default: m.QuizGastro })));
const QuizAnimales = lazy(() => import("./QuizTema").then(m => ({ default: m.QuizAnimales })));
const QuizEspacio = lazy(() => import("./QuizTema").then(m => ({ default: m.QuizEspacio })));
const QuizLibros = lazy(() => import("./QuizTema").then(m => ({ default: m.QuizLibros })));
const QuizCuerpo = lazy(() => import("./QuizTema").then(m => ({ default: m.QuizCuerpo })));
const QuizViajes = lazy(() => import("./QuizTema").then(m => ({ default: m.QuizViajes })));
const VoFCiencia = lazy(() => import("./VoF").then(m => ({ default: m.VoFCiencia })));
const VoFHistoria = lazy(() => import("./VoF").then(m => ({ default: m.VoFHistoria })));
const VoFAnimales = lazy(() => import("./VoF").then(m => ({ default: m.VoFAnimales })));
const VoFDeportes = lazy(() => import("./VoF").then(m => ({ default: m.VoFDeportes })));
const VoFGeo = lazy(() => import("./VoF").then(m => ({ default: m.VoFGeo })));
const VoFCuerpo = lazy(() => import("./VoF").then(m => ({ default: m.VoFCuerpo })));
const VoFMusica = lazy(() => import("./VoF").then(m => ({ default: m.VoFMusica })));
const VoFComida = lazy(() => import("./VoF").then(m => ({ default: m.VoFComida })));
const QuienAnimales = lazy(() => import("./QuienSoy").then(m => ({ default: m.QuienAnimales })));
const QuienOficios = lazy(() => import("./QuienSoy").then(m => ({ default: m.QuienOficios })));
const CapAmerica = lazy(() => import("./CapitalesCont").then(m => ({ default: m.CapAmerica })));
const CapEuropa = lazy(() => import("./CapitalesCont").then(m => ({ default: m.CapEuropa })));
const CapAsia = lazy(() => import("./CapitalesCont").then(m => ({ default: m.CapAsia })));
const CapAfrica = lazy(() => import("./CapitalesCont").then(m => ({ default: m.CapAfrica })));
const CapOceania = lazy(() => import("./CapitalesCont").then(m => ({ default: m.CapOceania })));
const BanderasAmerica = lazy(() => import("./Bandera").then(m => ({ default: m.BanderasAmerica })));
const BanderasEuropa = lazy(() => import("./Bandera").then(m => ({ default: m.BanderasEuropa })));
const BanderasAsia = lazy(() => import("./Bandera").then(m => ({ default: m.BanderasAsia })));
const Mimica = lazy(() => import("./Mimica"));
const MimicaPelis = lazy(() => import("./Mimica").then(m => ({ default: m.MimicaPelis })));
const VerdadOReto = lazy(() => import("./VerdadOReto"));
const VerdadORetoKids = lazy(() => import("./VerdadOReto").then(m => ({ default: m.VerdadORetoKids })));
const TelefonoRoto = lazy(() => import("./TelefonoRoto"));
const TelefonoFrases = lazy(() => import("./TelefonoRoto").then(m => ({ default: m.TelefonoFrases })));
const DueloManos = lazy(() => import("./DueloManos"));
const DueloManosPro = lazy(() => import("./DueloManos").then(m => ({ default: m.DueloManosPro })));
const Dados2P = lazy(() => import("./Dados2P"));
const Dados2PLargo = lazy(() => import("./Dados2P").then(m => ({ default: m.Dados2PLargo })));
const DueloReflejos = lazy(() => import("./DueloReflejos"));
const DueloLargo = lazy(() => import("./DueloReflejos").then(m => ({ default: m.DueloLargo })));
const CopaRelampago = lazy(() => import("./CopaRelampago"));
const Loteria = lazy(() => import("./Loteria"));
const DondeQuedo = lazy(() => import("./DondeQuedo"));
const DondeQuedoPro = lazy(() => import("./DondeQuedo").then(m => ({ default: m.DondeQuedoPro })));
const Basta = lazy(() => import("./Basta"));
const BastaJunior = lazy(() => import("./Basta").then(m => ({ default: m.BastaJunior })));
const DueloTrivia = lazy(() => import("./DueloTrivia"));
const DueloCultura = lazy(() => import("./DueloTrivia").then(m => ({ default: m.DueloCultura })));
const PistaAnimales = lazy(() => import("./AdivinaPista").then(m => ({ default: m.PistaAnimales })));
const PistaPaises = lazy(() => import("./AdivinaPista").then(m => ({ default: m.PistaPaises })));
const PistaComidas = lazy(() => import("./AdivinaPista").then(m => ({ default: m.PistaComidas })));
const PistaOficios = lazy(() => import("./AdivinaPista").then(m => ({ default: m.PistaOficios })));
const PistaDeportes = lazy(() => import("./AdivinaPista").then(m => ({ default: m.PistaDeportes })));
const PistaInstrumentos = lazy(() => import("./AdivinaPista").then(m => ({ default: m.PistaInstrumentos })));
const PistaFlores = lazy(() => import("./AdivinaPista").then(m => ({ default: m.PistaFlores })));
const PistaVehiculos = lazy(() => import("./AdivinaPista").then(m => ({ default: m.PistaVehiculos })));
const PistaFrutas = lazy(() => import("./AdivinaPista").then(m => ({ default: m.PistaFrutas })));
const PistaRopa = lazy(() => import("./AdivinaPista").then(m => ({ default: m.PistaRopa })));
const PistaMuebles = lazy(() => import("./AdivinaPista").then(m => ({ default: m.PistaMuebles })));
const PistaColores = lazy(() => import("./AdivinaPista").then(m => ({ default: m.PistaColores })));
const Refranes = lazy(() => import("./Refran").then(m => ({ default: m.Refranes })));
const Dichos = lazy(() => import("./Refran").then(m => ({ default: m.Dichos })));
const FrasesRefranes = lazy(() => import("./Frase").then(m => ({ default: m.FrasesRefranes })));
const FrasesHechos = lazy(() => import("./Frase").then(m => ({ default: m.FrasesHechos })));
const FrasesAnimales = lazy(() => import("./Frase").then(m => ({ default: m.FrasesAnimales })));
const FrasesViajes = lazy(() => import("./Frase").then(m => ({ default: m.FrasesViajes })));
const PalabraDiaria = lazy(() => import("./PalabraFam").then(m => ({ default: m.PalabraDiaria })));
const Palabra6 = lazy(() => import("./PalabraFam").then(m => ({ default: m.Palabra6 })));
const Palabra4 = lazy(() => import("./PalabraFam").then(m => ({ default: m.Palabra4 })));
const AhorAnimales = lazy(() => import("./AhorcadoFam").then(m => ({ default: m.AhorAnimales })));
const AhorComidas = lazy(() => import("./AhorcadoFam").then(m => ({ default: m.AhorComidas })));
const AhorPaises = lazy(() => import("./AhorcadoFam").then(m => ({ default: m.AhorPaises })));
const AhorOficios = lazy(() => import("./AhorcadoFam").then(m => ({ default: m.AhorOficios })));
const AhorDeportes = lazy(() => import("./AhorcadoFam").then(m => ({ default: m.AhorDeportes })));
const EmojiAnimales = lazy(() => import("./EmojiQuiz").then(m => ({ default: m.EmojiAnimales })));
const EmojiComida = lazy(() => import("./EmojiQuiz").then(m => ({ default: m.EmojiComida })));
const EmojiDeportes = lazy(() => import("./EmojiQuiz").then(m => ({ default: m.EmojiDeportes })));
const EmojiObjetos = lazy(() => import("./EmojiQuiz").then(m => ({ default: m.EmojiObjetos })));
const EmojiNaturaleza = lazy(() => import("./EmojiQuiz").then(m => ({ default: m.EmojiNaturaleza })));
const EmojiViajes = lazy(() => import("./EmojiQuiz").then(m => ({ default: m.EmojiViajes })));
const OrdenaInverso = lazy(() => import("./OrdenaV").then(m => ({ default: m.OrdenaInverso })));
const OrdenaLetras = lazy(() => import("./OrdenaV").then(m => ({ default: m.OrdenaLetras })));
const OrdenaPares = lazy(() => import("./OrdenaV").then(m => ({ default: m.OrdenaPares })));
const SumasVeloces = lazy(() => import("./Cuenta").then(m => ({ default: m.SumasVeloces })));
const RestasVeloces = lazy(() => import("./Cuenta").then(m => ({ default: m.RestasVeloces })));
const TablasVeloces = lazy(() => import("./Cuenta").then(m => ({ default: m.TablasVeloces })));
const DivisionesNetas = lazy(() => import("./Cuenta").then(m => ({ default: m.DivisionesNetas })));
const DoblesMitades = lazy(() => import("./Cuenta").then(m => ({ default: m.DoblesMitades })));
const CuentasMezcla = lazy(() => import("./Cuenta").then(m => ({ default: m.CuentasMezcla })));
const IntrusoAnimales = lazy(() => import("./Intruso").then(m => ({ default: m.IntrusoAnimales })));
const IntrusoFrutas = lazy(() => import("./Intruso").then(m => ({ default: m.IntrusoFrutas })));
const IntrusoPaises = lazy(() => import("./Intruso").then(m => ({ default: m.IntrusoPaises })));
const IntrusoColores = lazy(() => import("./Intruso").then(m => ({ default: m.IntrusoColores })));
const IntrusoDeportes = lazy(() => import("./Intruso").then(m => ({ default: m.IntrusoDeportes })));
const IntrusoOficios = lazy(() => import("./Intruso").then(m => ({ default: m.IntrusoOficios })));
const IntrusoInstrumentos = lazy(() => import("./Intruso").then(m => ({ default: m.IntrusoInstrumentos })));
const IntrusoComidas = lazy(() => import("./Intruso").then(m => ({ default: m.IntrusoComidas })));
const IntrusoRopa = lazy(() => import("./Intruso").then(m => ({ default: m.IntrusoRopa })));
const IntrusoCasa = lazy(() => import("./Intruso").then(m => ({ default: m.IntrusoCasa })));
const ParejasNumeros = lazy(() => import("./Parejas").then(m => ({ default: m.ParejasNumeros })));
const ParejasLetras = lazy(() => import("./Parejas").then(m => ({ default: m.ParejasLetras })));
const ParejasBanderas = lazy(() => import("./Parejas").then(m => ({ default: m.ParejasBanderas })));
const ParejasAnimales = lazy(() => import("./Parejas").then(m => ({ default: m.ParejasAnimales })));
const ParejasFrutas = lazy(() => import("./Parejas").then(m => ({ default: m.ParejasFrutas })));
const ParejasDeportes = lazy(() => import("./Parejas").then(m => ({ default: m.ParejasDeportes })));
const ParejasColores = lazy(() => import("./Parejas").then(m => ({ default: m.ParejasColores })));
const ParejasComida = lazy(() => import("./Parejas").then(m => ({ default: m.ParejasComida })));
const ParejasEspacio = lazy(() => import("./Parejas").then(m => ({ default: m.ParejasEspacio })));
const ParejasMusica = lazy(() => import("./Parejas").then(m => ({ default: m.ParejasMusica })));
const Puzzle9 = lazy(() => import("./Puzzle9"));
const Adivina50 = lazy(() => import("./AdivinaRango").then(m => ({ default: m.Adivina50 })));
const Adivina1000 = lazy(() => import("./AdivinaRango").then(m => ({ default: m.Adivina1000 })));
const AdivinaExpres = lazy(() => import("./AdivinaRango").then(m => ({ default: m.AdivinaExpres })));
const MaquinaAdivina = lazy(() => import("./AdivinaRango").then(m => ({ default: m.MaquinaAdivina })));
const MayorMenor = lazy(() => import("./MayorMenor"));
const Escoba = lazy(() => import("./Escoba"));
const Brisca = lazy(() => import("./Brisca"));
const ParchisVeloz = lazy(() => import("./Parchis").then(m => ({ default: m.ParchisVeloz })));
const ParchisDuelo = lazy(() => import("./Parchis").then(m => ({ default: m.ParchisDuelo })));
const Serpientes = lazy(() => import("./Serpientes"));
const SerpientesDuelo = lazy(() => import("./Serpientes").then(m => ({ default: m.SerpientesDuelo })));
const Raya4 = lazy(() => import("./RayaN").then(m => ({ default: m.Raya4 })));
const Raya5 = lazy(() => import("./RayaN").then(m => ({ default: m.Raya5 })));
const Sudoku4 = lazy(() => import("./Sudoku4"));
const BuscaChico = lazy(() => import("./BuscaN").then(m => ({ default: m.BuscaChico })));
const BuscaGrande = lazy(() => import("./BuscaN").then(m => ({ default: m.BuscaGrande })));
const TocaMayor = lazy(() => import("./TocaEl").then(m => ({ default: m.TocaMayor })));
const TocaMenor = lazy(() => import("./TocaEl").then(m => ({ default: m.TocaMenor })));
const TocaPar = lazy(() => import("./TocaEl").then(m => ({ default: m.TocaPar })));
const TocaImpar = lazy(() => import("./TocaEl").then(m => ({ default: m.TocaImpar })));
const TocaPrimo = lazy(() => import("./TocaEl").then(m => ({ default: m.TocaPrimo })));
const TocaMultiplo5 = lazy(() => import("./TocaEl").then(m => ({ default: m.TocaMultiplo5 })));
const TocaDecena = lazy(() => import("./TocaEl").then(m => ({ default: m.TocaDecena })));
const SaltoLargo = lazy(() => import("./SaltoLargo"));
const OidoVeloz = lazy(() => import("./OidoVeloz"));
const Destello = lazy(() => import("./Destello"));
const Sombras = lazy(() => import("./Sombras"));
const Ruta = lazy(() => import("./Ruta"));
const Escalera = lazy(() => import("./Escalera"));
const OidoFino = lazy(() => import("./OidoFino"));
const Atajada = lazy(() => import("./Atajada"));
const Oca = lazy(() => import("./Oca"));
const Plinko = lazy(() => import("./Plinko"));
const Minas = lazy(() => import("./Minas"));
const Torre = lazy(() => import("./Torre"));
const PenaltisOro = lazy(() => import("./PenaltisOro"));
const CartaMayor = lazy(() => import("./CartaMayor"));
const Suma7 = lazy(() => import("./Suma7"));
const Tombola = lazy(() => import("./Tombola"));
const EscaleraOro = lazy(() => import("./EscaleraOro"));
const Rueda = lazy(() => import("./Rueda"));
const Bolsa = lazy(() => import("./Bolsa"));
const Dobles = lazy(() => import("./Dobles"));
const Quince = lazy(() => import("./Quince"));
const Lotto6 = lazy(() => import("./Lotto6"));
const Crash = lazy(() => import("./Crash"));
const CrashTurbo = lazy(() => import("./Crash").then(m => ({ default: m.CrashTurbo })));
const CrashLuna = lazy(() => import("./Crash").then(m => ({ default: m.CrashLuna })));
const FusionNeon = lazy(() => import("./Fusion"));
const FusionFrutas = lazy(() => import("./Fusion").then(m => ({ default: m.FusionFrutas })));
const FusionGemas = lazy(() => import("./Fusion").then(m => ({ default: m.FusionGemas })));
const AimPro = lazy(() => import("./Destreza"));
const ReflejoNeon = lazy(() => import("./Destreza").then(m => ({ default: m.ReflejoNeon })));
const DianaTranquila = lazy(() => import("./Destreza").then(m => ({ default: m.DianaLenta })));
const AnagramaFlash = lazy(() => import("./PalabraFlash"));
const PalabraRelampago = lazy(() => import("./PalabraFlash").then(m => ({ default: m.PalabraRelampago })));
const PalabraTurbo = lazy(() => import("./PalabraFlash").then(m => ({ default: m.PalabraTurbo })));
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
  quizhistoria: { nombre: "Quiz Historia", emoji: "🏛️", descripcion: "6 preguntas de historia con bonus", Component: QuizHistoria, tema: "aplm", grad: "linear-gradient(135deg,#38bdf8,#6366f1)", tag: "Cultura" },
  quizciencia: { nombre: "Quiz Ciencia", emoji: "🔬", descripcion: "6 preguntas de ciencia con bonus", Component: QuizCiencia, tema: "aplm", grad: "linear-gradient(135deg,#38bdf8,#6366f1)", tag: "Cultura" },
  quizgeografia: { nombre: "Quiz Geografía", emoji: "🗺️", descripcion: "6 preguntas de geografía", Component: QuizGeografia, tema: "aplm", grad: "linear-gradient(135deg,#38bdf8,#6366f1)", tag: "Cultura" },
  quizdeportes: { nombre: "Quiz Deportes", emoji: "🏅", descripcion: "6 preguntas de deportes", Component: QuizDeportes, tema: "aplm", grad: "linear-gradient(135deg,#38bdf8,#6366f1)", tag: "Cultura" },
  quizmusica: { nombre: "Quiz Música", emoji: "🎵", descripcion: "6 preguntas de música", Component: QuizMusica, tema: "aplm", grad: "linear-gradient(135deg,#38bdf8,#6366f1)", tag: "Cultura" },
  quizcine: { nombre: "Quiz Cine", emoji: "🎬", descripcion: "6 preguntas de cine", Component: QuizCine, tema: "aplm", grad: "linear-gradient(135deg,#38bdf8,#6366f1)", tag: "Cultura" },
  quiznaturaleza: { nombre: "Quiz Naturaleza", emoji: "🌿", descripcion: "6 preguntas de naturaleza", Component: QuizNaturaleza, tema: "aplm", grad: "linear-gradient(135deg,#38bdf8,#6366f1)", tag: "Cultura" },
  quiztecno: { nombre: "Quiz Tecnología", emoji: "💻", descripcion: "6 preguntas de tecnología", Component: QuizTecno, tema: "aplm", grad: "linear-gradient(135deg,#38bdf8,#6366f1)", tag: "Cultura" },
  quizarte: { nombre: "Quiz Arte", emoji: "🎨", descripcion: "6 preguntas de arte", Component: QuizArte, tema: "aplm", grad: "linear-gradient(135deg,#38bdf8,#6366f1)", tag: "Cultura" },
  quizgastro: { nombre: "Quiz Gastronomía", emoji: "🍽️", descripcion: "6 preguntas de cocina", Component: QuizGastro, tema: "aplm", grad: "linear-gradient(135deg,#38bdf8,#6366f1)", tag: "Cultura" },
  quizanimales: { nombre: "Quiz Animales", emoji: "🦁", descripcion: "6 preguntas de animales", Component: QuizAnimales, tema: "aplm", grad: "linear-gradient(135deg,#38bdf8,#6366f1)", tag: "Cultura" },
  quizespacio: { nombre: "Quiz Espacio", emoji: "🚀", descripcion: "6 preguntas del espacio", Component: QuizEspacio, tema: "aplm", grad: "linear-gradient(135deg,#38bdf8,#6366f1)", tag: "Cultura" },
  quizlibros: { nombre: "Quiz Libros", emoji: "📚", descripcion: "6 preguntas de libros", Component: QuizLibros, tema: "aplm", grad: "linear-gradient(135deg,#38bdf8,#6366f1)", tag: "Cultura" },
  quizcuerpo: { nombre: "Quiz Cuerpo", emoji: "🫀", descripcion: "6 preguntas del cuerpo", Component: QuizCuerpo, tema: "aplm", grad: "linear-gradient(135deg,#38bdf8,#6366f1)", tag: "Cultura" },
  quizviajes: { nombre: "Quiz Viajes", emoji: "✈️", descripcion: "6 preguntas de viajes", Component: QuizViajes, tema: "aplm", grad: "linear-gradient(135deg,#38bdf8,#6366f1)", tag: "Cultura" },
  vciencia: { nombre: "Verdad: Ciencia", emoji: "🔬", descripcion: "Verdadero o falso de ciencia · 60s", Component: VoFCiencia, tema: "aplm", grad: "linear-gradient(135deg,#38bdf8,#6366f1)", tag: "Cultura" },
  vhistoria: { nombre: "Verdad: Historia", emoji: "🏛️", descripcion: "Verdadero o falso de historia", Component: VoFHistoria, tema: "aplm", grad: "linear-gradient(135deg,#38bdf8,#6366f1)", tag: "Cultura" },
  vanimales: { nombre: "Verdad: Animales", emoji: "🦁", descripcion: "Verdadero o falso de animales", Component: VoFAnimales, tema: "aplm", grad: "linear-gradient(135deg,#38bdf8,#6366f1)", tag: "Cultura" },
  vdeportes: { nombre: "Verdad: Deportes", emoji: "🏅", descripcion: "Verdadero o falso de deportes", Component: VoFDeportes, tema: "aplm", grad: "linear-gradient(135deg,#38bdf8,#6366f1)", tag: "Cultura" },
  vmundo: { nombre: "Verdad: Mundo", emoji: "🌍", descripcion: "Verdadero o falso del mundo", Component: VoFGeo, tema: "aplm", grad: "linear-gradient(135deg,#38bdf8,#6366f1)", tag: "Cultura" },
  vcuerpo: { nombre: "Verdad: Cuerpo", emoji: "🫀", descripcion: "Verdadero o falso del cuerpo", Component: VoFCuerpo, tema: "aplm", grad: "linear-gradient(135deg,#38bdf8,#6366f1)", tag: "Cultura" },
  vmusica: { nombre: "Verdad: Música", emoji: "🎵", descripcion: "Verdadero o falso de música", Component: VoFMusica, tema: "aplm", grad: "linear-gradient(135deg,#38bdf8,#6366f1)", tag: "Cultura" },
  vcomida: { nombre: "Verdad: Comida", emoji: "🍽️", descripcion: "Verdadero o falso de comida", Component: VoFComida, tema: "aplm", grad: "linear-gradient(135deg,#38bdf8,#6366f1)", tag: "Cultura" },
  quienanimales: { nombre: "¿Quién soy? Animales", emoji: "🐾", descripcion: "Adivina con 3 pistas · 8 rondas", Component: QuienAnimales, tema: "aplm", grad: "linear-gradient(135deg,#38bdf8,#6366f1)", tag: "Cultura" },
  quienoficios: { nombre: "¿Quién soy? Oficios", emoji: "🧰", descripcion: "Adivina el oficio con pistas", Component: QuienOficios, tema: "aplm", grad: "linear-gradient(135deg,#38bdf8,#6366f1)", tag: "Cultura" },
  capamerica: { nombre: "Capitales: América", emoji: "🗽", descripcion: "Capitales americanas · 8 rondas", Component: CapAmerica, tema: "aplm", grad: "linear-gradient(135deg,#38bdf8,#6366f1)", tag: "Cultura" },
  capeuropa: { nombre: "Capitales: Europa", emoji: "🏰", descripcion: "Capitales europeas", Component: CapEuropa, tema: "aplm", grad: "linear-gradient(135deg,#38bdf8,#6366f1)", tag: "Cultura" },
  capasia: { nombre: "Capitales: Asia", emoji: "⛩️", descripcion: "Capitales asiáticas", Component: CapAsia, tema: "aplm", grad: "linear-gradient(135deg,#38bdf8,#6366f1)", tag: "Cultura" },
  capafrica: { nombre: "Capitales: África", emoji: "🦁", descripcion: "Capitales africanas", Component: CapAfrica, tema: "aplm", grad: "linear-gradient(135deg,#38bdf8,#6366f1)", tag: "Cultura" },
  capoceania: { nombre: "Capitales: Oceanía", emoji: "🏝️", descripcion: "Capitales de Oceanía", Component: CapOceania, tema: "aplm", grad: "linear-gradient(135deg,#38bdf8,#6366f1)", tag: "Cultura" },
  bandamerica: { nombre: "Banderas: América", emoji: "🌎", descripcion: "Adivina la bandera americana", Component: BanderasAmerica, tema: "aplm", grad: "linear-gradient(135deg,#38bdf8,#6366f1)", tag: "Cultura" },
  bandeuropa: { nombre: "Banderas: Europa", emoji: "🏰", descripcion: "Adivina la bandera europea", Component: BanderasEuropa, tema: "aplm", grad: "linear-gradient(135deg,#38bdf8,#6366f1)", tag: "Cultura" },
  bandasia: { nombre: "Banderas: Asia y África", emoji: "🌏", descripcion: "Banderas de Asia y África", Component: BanderasAsia, tema: "aplm", grad: "linear-gradient(135deg,#38bdf8,#6366f1)", tag: "Cultura" },
  mimica: { nombre: "Mímica", emoji: "🤹", descripcion: "Actúa sin hablar · 60s en equipo", Component: Mimica, tema: "aplm", grad: "linear-gradient(135deg,#0ea5e9,#22c55e)", tag: "Casual" },
  mimicapelis: { nombre: "Mímica: Pelis", emoji: "🎬", descripcion: "Actúa escenas de peli", Component: MimicaPelis, tema: "aplm", grad: "linear-gradient(135deg,#0ea5e9,#22c55e)", tag: "Casual" },
  verdad: { nombre: "Verdad o Reto", emoji: "🎉", descripcion: "Fiesta: 8 pruebas", Component: VerdadOReto, tema: "aplm", grad: "linear-gradient(135deg,#0ea5e9,#22c55e)", tag: "Casual" },
  verdadkids: { nombre: "Verdad o Reto Kids", emoji: "🧒", descripcion: "Fiesta infantil: 8 pruebas", Component: VerdadORetoKids, tema: "aplm", grad: "linear-gradient(135deg,#0ea5e9,#22c55e)", tag: "Casual" },
  telroto: { nombre: "Teléfono Roto", emoji: "📞", descripcion: "Memoriza palabras en orden", Component: TelefonoRoto, tema: "aplm", grad: "linear-gradient(135deg,#6366f1,#22d3ee)", tag: "Mente" },
  telfrases: { nombre: "Teléfono de Frases", emoji: "📝", descripcion: "Memoriza frases en orden", Component: TelefonoFrases, tema: "aplm", grad: "linear-gradient(135deg,#6366f1,#22d3ee)", tag: "Mente" },
  duelmanos: { nombre: "Duelo de Manos", emoji: "✋", descripcion: "Piedra-papel-tijeras 2P oculto", Component: DueloManos, tema: "aplm", grad: "linear-gradient(135deg,#f43f5e,#fb923c)", tag: "Duelo" },
  duelopro: { nombre: "Duelo Pro: +Lagarto", emoji: "🦎", descripcion: "Duelo 5 gestos al mejor de 7", Component: DueloManosPro, tema: "aplm", grad: "linear-gradient(135deg,#f43f5e,#fb923c)", tag: "Duelo" },
  dados2p: { nombre: "Dados 2P", emoji: "🎲", descripcion: "3 dados por ronda · 5 rondas", Component: Dados2P, tema: "aplm", grad: "linear-gradient(135deg,#f43f5e,#fb923c)", tag: "Duelo" },
  dados2plargo: { nombre: "Dados 2P Largo", emoji: "🎲", descripcion: "Duelo de dados a 9 rondas", Component: Dados2PLargo, tema: "aplm", grad: "linear-gradient(135deg,#f43f5e,#fb923c)", tag: "Duelo" },
  dueloreflejos: { nombre: "Duelo de Reflejos", emoji: "⚡", descripcion: "J1 (A) vs J2 (L) en verde", Component: DueloReflejos, tema: "aplm", grad: "linear-gradient(135deg,#f43f5e,#fb923c)", tag: "Duelo" },
  duelolargo: { nombre: "Duelo Largo", emoji: "⚡", descripcion: "Duelo de reflejos a 9 rondas", Component: DueloLargo, tema: "aplm", grad: "linear-gradient(135deg,#f43f5e,#fb923c)", tag: "Duelo" },
  copa: { nombre: "Copa Relámpago", emoji: "🏆", descripcion: "Elige corredor · 5 carreras", Component: CopaRelampago, tema: "aplm", grad: "linear-gradient(135deg,#eab308,#dc2626)", tag: "Azar" },
  loteria: { nombre: "Lotería", emoji: "🎴", descripcion: "Cartón 4×4 contra 2 rivales", Component: Loteria, tema: "aplm", grad: "linear-gradient(135deg,#eab308,#dc2626)", tag: "Azar" },
  donde: { nombre: "¿Dónde Quedó?", emoji: "🥤", descripcion: "Sigue la bolita · 8 rondas", Component: DondeQuedo, tema: "aplm", grad: "linear-gradient(135deg,#0ea5e9,#22c55e)", tag: "Casual" },
  dondepro: { nombre: "¿Dónde Quedó? Pro", emoji: "🥤", descripcion: "Bolita con 5 vasos", Component: DondeQuedoPro, tema: "aplm", grad: "linear-gradient(135deg,#0ea5e9,#22c55e)", tag: "Casual" },
  basta: { nombre: "¡Basta!", emoji: "✏️", descripcion: "Letra + categorías en 60s", Component: Basta, tema: "aplm", grad: "linear-gradient(135deg,#8b5cf6,#ec4899)", tag: "Palabras" },
  bastajunior: { nombre: "¡Basta! Junior", emoji: "✏️", descripcion: "Basta fácil para peques", Component: BastaJunior, tema: "aplm", grad: "linear-gradient(135deg,#8b5cf6,#ec4899)", tag: "Palabras" },
  duelotrivia: { nombre: "Duelo de Trivia", emoji: "⚔️", descripcion: "Trivia por turnos 2P", Component: DueloTrivia, tema: "aplm", grad: "linear-gradient(135deg,#38bdf8,#6366f1)", tag: "Cultura" },
  duelocultura: { nombre: "Duelo de Cultura", emoji: "⚔️", descripcion: "Cultura por turnos 2P", Component: DueloCultura, tema: "aplm", grad: "linear-gradient(135deg,#38bdf8,#6366f1)", tag: "Cultura" },
  pistaanimales: { nombre: "¿Qué animal es?", emoji: "🐾", descripcion: "Adivina por la pista · 8 rondas", Component: PistaAnimales, tema: "aplm", grad: "linear-gradient(135deg,#8b5cf6,#ec4899)", tag: "Palabras" },
  pistapaises: { nombre: "¿Qué país es?", emoji: "🌍", descripcion: "Adivina el país por la pista", Component: PistaPaises, tema: "aplm", grad: "linear-gradient(135deg,#8b5cf6,#ec4899)", tag: "Palabras" },
  pistacomidas: { nombre: "¿Qué comida es?", emoji: "🍲", descripcion: "Adivina la comida", Component: PistaComidas, tema: "aplm", grad: "linear-gradient(135deg,#8b5cf6,#ec4899)", tag: "Palabras" },
  pistaoficios: { nombre: "¿Qué oficio es?", emoji: "🧰", descripcion: "Adivina el oficio", Component: PistaOficios, tema: "aplm", grad: "linear-gradient(135deg,#8b5cf6,#ec4899)", tag: "Palabras" },
  pistadeportes: { nombre: "¿Qué deporte es?", emoji: "⚽", descripcion: "Adivina el deporte", Component: PistaDeportes, tema: "aplm", grad: "linear-gradient(135deg,#8b5cf6,#ec4899)", tag: "Palabras" },
  pistainstrumentos: { nombre: "¿Qué instrumento es?", emoji: "🎺", descripcion: "Adivina el instrumento", Component: PistaInstrumentos, tema: "aplm", grad: "linear-gradient(135deg,#8b5cf6,#ec4899)", tag: "Palabras" },
  pistaflores: { nombre: "¿Qué flor es?", emoji: "🌸", descripcion: "Adivina la flor", Component: PistaFlores, tema: "aplm", grad: "linear-gradient(135deg,#8b5cf6,#ec4899)", tag: "Palabras" },
  pistavehiculos: { nombre: "¿Qué vehículo es?", emoji: "🚗", descripcion: "Adivina el vehículo", Component: PistaVehiculos, tema: "aplm", grad: "linear-gradient(135deg,#8b5cf6,#ec4899)", tag: "Palabras" },
  pistafrutas: { nombre: "¿Qué fruta es?", emoji: "🍎", descripcion: "Adivina la fruta", Component: PistaFrutas, tema: "aplm", grad: "linear-gradient(135deg,#8b5cf6,#ec4899)", tag: "Palabras" },
  pistaropa: { nombre: "¿Qué prenda es?", emoji: "👕", descripcion: "Adivina la prenda", Component: PistaRopa, tema: "aplm", grad: "linear-gradient(135deg,#8b5cf6,#ec4899)", tag: "Palabras" },
  pistamuebles: { nombre: "¿Qué mueble es?", emoji: "🪑", descripcion: "Adivina el mueble", Component: PistaMuebles, tema: "aplm", grad: "linear-gradient(135deg,#8b5cf6,#ec4899)", tag: "Palabras" },
  pistacolores: { nombre: "¿Qué color es?", emoji: "🎨", descripcion: "Adivina el color", Component: PistaColores, tema: "aplm", grad: "linear-gradient(135deg,#8b5cf6,#ec4899)", tag: "Palabras" },
  refranes: { nombre: "Completa el Refrán", emoji: "💬", descripcion: "Termina el refrán · 8 rondas", Component: Refranes, tema: "aplm", grad: "linear-gradient(135deg,#8b5cf6,#ec4899)", tag: "Palabras" },
  dichos: { nombre: "Dichos Populares", emoji: "🗣️", descripcion: "Completa el dicho popular", Component: Dichos, tema: "aplm", grad: "linear-gradient(135deg,#8b5cf6,#ec4899)", tag: "Palabras" },
  fraserefranes: { nombre: "Frases: Refranes", emoji: "💬", descripcion: "Ordena refranes palabra a palabra", Component: FrasesRefranes, tema: "aplm", grad: "linear-gradient(135deg,#8b5cf6,#ec4899)", tag: "Palabras" },
  frasehechos: { nombre: "Frases: Datos", emoji: "💡", descripcion: "Ordena frases de datos", Component: FrasesHechos, tema: "aplm", grad: "linear-gradient(135deg,#8b5cf6,#ec4899)", tag: "Palabras" },
  fraseanimales: { nombre: "Frases: Animales", emoji: "🐾", descripcion: "Ordena frases de animales", Component: FrasesAnimales, tema: "aplm", grad: "linear-gradient(135deg,#8b5cf6,#ec4899)", tag: "Palabras" },
  fraseviajes: { nombre: "Frases: Viajes", emoji: "✈️", descripcion: "Ordena frases de viajes", Component: FrasesViajes, tema: "aplm", grad: "linear-gradient(135deg,#8b5cf6,#ec4899)", tag: "Palabras" },
  palabradiaria: { nombre: "Palabra Diaria", emoji: "📅", descripcion: "La palabra del día · 5 letras", Component: PalabraDiaria, tema: "aplm", grad: "linear-gradient(135deg,#8b5cf6,#ec4899)", tag: "Palabras" },
  palabra6: { nombre: "Palabra 6", emoji: "🟨", descripcion: "Adivina en 6 letras", Component: Palabra6, tema: "aplm", grad: "linear-gradient(135deg,#8b5cf6,#ec4899)", tag: "Palabras" },
  palabra4: { nombre: "Palabra 4", emoji: "🟦", descripcion: "Adivina en 4 letras", Component: Palabra4, tema: "aplm", grad: "linear-gradient(135deg,#8b5cf6,#ec4899)", tag: "Palabras" },
  ahoranimales: { nombre: "Ahorcado: Animales", emoji: "🐾", descripcion: "Ahorcado de animales", Component: AhorAnimales, tema: "aplm", grad: "linear-gradient(135deg,#8b5cf6,#ec4899)", tag: "Palabras" },
  ahorcomidas: { nombre: "Ahorcado: Comidas", emoji: "🍲", descripcion: "Ahorcado de comidas", Component: AhorComidas, tema: "aplm", grad: "linear-gradient(135deg,#8b5cf6,#ec4899)", tag: "Palabras" },
  ahorpaises: { nombre: "Ahorcado: Países", emoji: "🌍", descripcion: "Ahorcado de países", Component: AhorPaises, tema: "aplm", grad: "linear-gradient(135deg,#8b5cf6,#ec4899)", tag: "Palabras" },
  ahoroficios: { nombre: "Ahorcado: Oficios", emoji: "🧰", descripcion: "Ahorcado de oficios", Component: AhorOficios, tema: "aplm", grad: "linear-gradient(135deg,#8b5cf6,#ec4899)", tag: "Palabras" },
  ahordeportes: { nombre: "Ahorcado: Deportes", emoji: "⚽", descripcion: "Ahorcado de deportes", Component: AhorDeportes, tema: "aplm", grad: "linear-gradient(135deg,#8b5cf6,#ec4899)", tag: "Palabras" },
  emojianimales: { nombre: "Emoji: Animales", emoji: "🐾", descripcion: "Toca el emoji descrito", Component: EmojiAnimales, tema: "aplm", grad: "linear-gradient(135deg,#8b5cf6,#ec4899)", tag: "Palabras" },
  emojicomida: { nombre: "Emoji: Comida", emoji: "🍕", descripcion: "Emojis de comida", Component: EmojiComida, tema: "aplm", grad: "linear-gradient(135deg,#8b5cf6,#ec4899)", tag: "Palabras" },
  emojideportes: { nombre: "Emoji: Deportes", emoji: "⚽", descripcion: "Emojis de deportes", Component: EmojiDeportes, tema: "aplm", grad: "linear-gradient(135deg,#8b5cf6,#ec4899)", tag: "Palabras" },
  emojiobjetos: { nombre: "Emoji: Objetos", emoji: "💡", descripcion: "Emojis de objetos", Component: EmojiObjetos, tema: "aplm", grad: "linear-gradient(135deg,#8b5cf6,#ec4899)", tag: "Palabras" },
  emojinatura: { nombre: "Emoji: Naturaleza", emoji: "🌿", descripcion: "Emojis de naturaleza", Component: EmojiNaturaleza, tema: "aplm", grad: "linear-gradient(135deg,#8b5cf6,#ec4899)", tag: "Palabras" },
  emojiviajes: { nombre: "Emoji: Viajes", emoji: "✈️", descripcion: "Emojis de viajes", Component: EmojiViajes, tema: "aplm", grad: "linear-gradient(135deg,#8b5cf6,#ec4899)", tag: "Palabras" },
  ordenainverso: { nombre: "Ordena al Revés", emoji: "⬇️", descripcion: "De mayor a menor · 6 rondas", Component: OrdenaInverso, tema: "aplm", grad: "linear-gradient(135deg,#14b8a6,#6366f1)", tag: "Lógica" },
  ordenaletras: { nombre: "Ordena Letras", emoji: "🔤", descripcion: "Orden alfabético", Component: OrdenaLetras, tema: "aplm", grad: "linear-gradient(135deg,#6366f1,#22d3ee)", tag: "Mente" },
  ordenapares: { nombre: "Ordena Pares", emoji: "⚖️", descripcion: "Pares de menor a mayor", Component: OrdenaPares, tema: "aplm", grad: "linear-gradient(135deg,#6366f1,#22d3ee)", tag: "Mente" },
  sumas: { nombre: "Sumas Veloces", emoji: "➕", descripcion: "Sumas en 45s", Component: SumasVeloces, tema: "aplm", grad: "linear-gradient(135deg,#6366f1,#22d3ee)", tag: "Mente" },
  restas: { nombre: "Restas Veloces", emoji: "➖", descripcion: "Restas en 45s", Component: RestasVeloces, tema: "aplm", grad: "linear-gradient(135deg,#6366f1,#22d3ee)", tag: "Mente" },
  tablas: { nombre: "Tablas Veloces", emoji: "✖️", descripcion: "Multiplica en 45s", Component: TablasVeloces, tema: "aplm", grad: "linear-gradient(135deg,#6366f1,#22d3ee)", tag: "Mente" },
  divisiones: { nombre: "Divisiones Netas", emoji: "➗", descripcion: "Divisiones exactas", Component: DivisionesNetas, tema: "aplm", grad: "linear-gradient(135deg,#6366f1,#22d3ee)", tag: "Mente" },
  dobles: { nombre: "Dobles y Mitades", emoji: "🔢", descripcion: "Dobles y mitades", Component: DoblesMitades, tema: "aplm", grad: "linear-gradient(135deg,#6366f1,#22d3ee)", tag: "Mente" },
  mezcla: { nombre: "Mezcla Mental", emoji: "🧮", descripcion: "Operaciones mezcladas", Component: CuentasMezcla, tema: "aplm", grad: "linear-gradient(135deg,#6366f1,#22d3ee)", tag: "Mente" },
  intrusoanimales: { nombre: "El Intruso: Animales", emoji: "🦁", descripcion: "¿Cuál no pertenece?", Component: IntrusoAnimales, tema: "aplm", grad: "linear-gradient(135deg,#14b8a6,#6366f1)", tag: "Lógica" },
  intrusofrutas: { nombre: "El Intruso: Frutas", emoji: "🍎", descripcion: "Detecta el intruso frutal", Component: IntrusoFrutas, tema: "aplm", grad: "linear-gradient(135deg,#14b8a6,#6366f1)", tag: "Lógica" },
  intrusopaises: { nombre: "El Intruso: Países", emoji: "🌍", descripcion: "País fuera de lugar", Component: IntrusoPaises, tema: "aplm", grad: "linear-gradient(135deg,#14b8a6,#6366f1)", tag: "Lógica" },
  intrusocolores: { nombre: "El Intruso: Colores", emoji: "🎨", descripcion: "Color que no encaja", Component: IntrusoColores, tema: "aplm", grad: "linear-gradient(135deg,#14b8a6,#6366f1)", tag: "Lógica" },
  intrusodeportes: { nombre: "El Intruso: Deportes", emoji: "🏅", descripcion: "Deporte distinto", Component: IntrusoDeportes, tema: "aplm", grad: "linear-gradient(135deg,#14b8a6,#6366f1)", tag: "Lógica" },
  intrusooficios: { nombre: "El Intruso: Oficios", emoji: "🧰", descripcion: "Oficio distinto", Component: IntrusoOficios, tema: "aplm", grad: "linear-gradient(135deg,#14b8a6,#6366f1)", tag: "Lógica" },
  intrusomusica: { nombre: "El Intruso: Música", emoji: "🎵", descripcion: "Instrumento distinto", Component: IntrusoInstrumentos, tema: "aplm", grad: "linear-gradient(135deg,#14b8a6,#6366f1)", tag: "Lógica" },
  intrusocomidas: { nombre: "El Intruso: Comidas", emoji: "🍽️", descripcion: "Comida que sobra", Component: IntrusoComidas, tema: "aplm", grad: "linear-gradient(135deg,#14b8a6,#6366f1)", tag: "Lógica" },
  intrusoropa: { nombre: "El Intruso: Ropa", emoji: "👕", descripcion: "Prenda distinta", Component: IntrusoRopa, tema: "aplm", grad: "linear-gradient(135deg,#14b8a6,#6366f1)", tag: "Lógica" },
  intrusocasa: { nombre: "El Intruso: Casa", emoji: "🏠", descripcion: "Objeto fuera de lugar", Component: IntrusoCasa, tema: "aplm", grad: "linear-gradient(135deg,#14b8a6,#6366f1)", tag: "Lógica" },
  parejasnumeros: { nombre: "Parejas de Números", emoji: "🔢", descripcion: "Memoria numérica 4×4", Component: ParejasNumeros, tema: "aplm", grad: "linear-gradient(135deg,#6366f1,#22d3ee)", tag: "Mente" },
  parejasletras: { nombre: "Parejas de Letras", emoji: "🔤", descripcion: "Memoria de letras", Component: ParejasLetras, tema: "aplm", grad: "linear-gradient(135deg,#6366f1,#22d3ee)", tag: "Mente" },
  parejasbanderas: { nombre: "Parejas de Banderas", emoji: "🏳️", descripcion: "Memoria de banderas", Component: ParejasBanderas, tema: "aplm", grad: "linear-gradient(135deg,#6366f1,#22d3ee)", tag: "Mente" },
  parejasanimales: { nombre: "Parejas de Animales", emoji: "🐾", descripcion: "Memoria animal", Component: ParejasAnimales, tema: "aplm", grad: "linear-gradient(135deg,#6366f1,#22d3ee)", tag: "Mente" },
  parejasfrutas: { nombre: "Parejas de Frutas", emoji: "🍓", descripcion: "Memoria frutal", Component: ParejasFrutas, tema: "aplm", grad: "linear-gradient(135deg,#6366f1,#22d3ee)", tag: "Mente" },
  parejasdeportes: { nombre: "Parejas de Deportes", emoji: "🏅", descripcion: "Memoria deportiva", Component: ParejasDeportes, tema: "aplm", grad: "linear-gradient(135deg,#6366f1,#22d3ee)", tag: "Mente" },
  parejasformas: { nombre: "Parejas de Formas", emoji: "🔷", descripcion: "Memoria de formas", Component: ParejasColores, tema: "aplm", grad: "linear-gradient(135deg,#6366f1,#22d3ee)", tag: "Mente" },
  parejascomida: { nombre: "Parejas de Comida", emoji: "🍕", descripcion: "Memoria de comida", Component: ParejasComida, tema: "aplm", grad: "linear-gradient(135deg,#6366f1,#22d3ee)", tag: "Mente" },
  parejasplanetas: { nombre: "Parejas del Espacio", emoji: "🪐", descripcion: "Memoria espacial", Component: ParejasEspacio, tema: "aplm", grad: "linear-gradient(135deg,#6366f1,#22d3ee)", tag: "Mente" },
  parejasmusica: { nombre: "Parejas de Música", emoji: "🎶", descripcion: "Memoria musical", Component: ParejasMusica, tema: "aplm", grad: "linear-gradient(135deg,#6366f1,#22d3ee)", tag: "Mente" },
  puzzle9: { nombre: "Puzzle 9", emoji: "🧩", descripcion: "Deslizante 3×3", Component: Puzzle9, tema: "aplm", grad: "linear-gradient(135deg,#14b8a6,#a855f7)", tag: "Puzzle" },
  adivina50: { nombre: "Adivina el 50", emoji: "🔢", descripcion: "Del 1 al 50 en 6 intentos", Component: Adivina50, tema: "aplm", grad: "linear-gradient(135deg,#eab308,#dc2626)", tag: "Azar" },
  adivina1000: { nombre: "Adivina el 1000", emoji: "🎯", descripcion: "Del 1 al 1000 en 10 intentos", Component: Adivina1000, tema: "aplm", grad: "linear-gradient(135deg,#eab308,#dc2626)", tag: "Azar" },
  adivinaexpres: { nombre: "Adivina Exprés", emoji: "⚡", descripcion: "Del 1 al 100 en 5 intentos", Component: AdivinaExpres, tema: "aplm", grad: "linear-gradient(135deg,#eab308,#dc2626)", tag: "Azar" },
  maquina: { nombre: "La Máquina Adivina", emoji: "🤖", descripcion: "La IA adivina tu número", Component: MaquinaAdivina, tema: "aplm", grad: "linear-gradient(135deg,#eab308,#dc2626)", tag: "Azar" },
  mayormenor: { nombre: "Mayor o Menor", emoji: "🃏", descripcion: "¿Sube o baja la carta?", Component: MayorMenor, tema: "aplm", grad: "linear-gradient(135deg,#57534e,#ef4444)", tag: "Cartas" },
  escoba: { nombre: "Escoba", emoji: "🧹", descripcion: "Captura sumando 15", Component: Escoba, tema: "aplm", grad: "linear-gradient(135deg,#57534e,#ef4444)", tag: "Cartas" },
  brisca: { nombre: "Brisca", emoji: "🃏", descripcion: "Bazas con triunfo · +60 gana", Component: Brisca, tema: "aplm", grad: "linear-gradient(135deg,#57534e,#ef4444)", tag: "Cartas" },
  parchis: { nombre: "Parchís Veloz", emoji: "🎲", descripcion: "2 fichas a meta 20 vs IA", Component: ParchisVeloz, tema: "aplm", grad: "linear-gradient(135deg,#b45309,#451a03)", tag: "Tablero" },
  parchisduelo: { nombre: "Parchís Duelo", emoji: "🎲", descripcion: "Parchís 2P en local", Component: ParchisDuelo, tema: "aplm", grad: "linear-gradient(135deg,#b45309,#451a03)", tag: "Tablero" },
  serpientes: { nombre: "Serpientes y Escaleras", emoji: "🐍", descripcion: "Dados a la meta 30 vs IA", Component: Serpientes, tema: "aplm", grad: "linear-gradient(135deg,#b45309,#451a03)", tag: "Tablero" },
  serpientesduelo: { nombre: "Serpientes Duelo", emoji: "🐍", descripcion: "Serpientes 2P en local", Component: SerpientesDuelo, tema: "aplm", grad: "linear-gradient(135deg,#b45309,#451a03)", tag: "Tablero" },
  raya4: { nombre: "Raya 4×4", emoji: "❌", descripcion: "4 en línea en 4×4 vs IA", Component: Raya4, tema: "aplm", grad: "linear-gradient(135deg,#b45309,#451a03)", tag: "Tablero" },
  raya5: { nombre: "Raya 5×5", emoji: "⭕", descripcion: "4 en línea en 5×5 vs IA", Component: Raya5, tema: "aplm", grad: "linear-gradient(135deg,#b45309,#451a03)", tag: "Tablero" },
  sudoku4: { nombre: "Sudoku 4×4", emoji: "🔢", descripcion: "Mini sudokus 4×4", Component: Sudoku4, tema: "aplm", grad: "linear-gradient(135deg,#b45309,#451a03)", tag: "Tablero" },
  buscachico: { nombre: "Buscaminas Chico", emoji: "💣", descripcion: "8×8 con 10 minas", Component: BuscaChico, tema: "aplm", grad: "linear-gradient(135deg,#b45309,#451a03)", tag: "Tablero" },
  buscagrande: { nombre: "Buscaminas Grande", emoji: "💥", descripcion: "12×12 con 25 minas", Component: BuscaGrande, tema: "aplm", grad: "linear-gradient(135deg,#b45309,#451a03)", tag: "Tablero" },
  tocamayor: { nombre: "Toca el Mayor", emoji: "🦒", descripcion: "El número mayor en 30s", Component: TocaMayor, tema: "aplm", grad: "linear-gradient(135deg,#facc15,#22c55e)", tag: "Reflejos" },
  tocamenor: { nombre: "Toca el Menor", emoji: "🐭", descripcion: "El número menor", Component: TocaMenor, tema: "aplm", grad: "linear-gradient(135deg,#facc15,#22c55e)", tag: "Reflejos" },
  tocapar: { nombre: "Toca el Par", emoji: "⚖️", descripcion: "El único par", Component: TocaPar, tema: "aplm", grad: "linear-gradient(135deg,#facc15,#22c55e)", tag: "Reflejos" },
  tocaimpar: { nombre: "Toca el Impar", emoji: "🎲", descripcion: "El único impar", Component: TocaImpar, tema: "aplm", grad: "linear-gradient(135deg,#facc15,#22c55e)", tag: "Reflejos" },
  tocaprimo: { nombre: "Toca el Primo", emoji: "💎", descripcion: "El único primo", Component: TocaPrimo, tema: "aplm", grad: "linear-gradient(135deg,#facc15,#22c55e)", tag: "Reflejos" },
  tocamult5: { nombre: "Toca el Múltiplo de 5", emoji: "🖐️", descripcion: "El múltiplo de 5", Component: TocaMultiplo5, tema: "aplm", grad: "linear-gradient(135deg,#facc15,#22c55e)", tag: "Reflejos" },
  tocadecena: { nombre: "Toca la Decena", emoji: "🔟", descripcion: "La decena exacta", Component: TocaDecena, tema: "aplm", grad: "linear-gradient(135deg,#facc15,#22c55e)", tag: "Reflejos" },
  saltolargo: { nombre: "Salto Largo", emoji: "🦘", descripcion: "Carga y suelta en verde", Component: SaltoLargo, tema: "aplm", grad: "linear-gradient(135deg,#22d3ee,#7c3aed)", tag: "Arcade" },
  oidoveloz: { nombre: "Oído Veloz", emoji: "👂", descripcion: "Toca al oír el pitido", Component: OidoVeloz, tema: "aplm", grad: "linear-gradient(135deg,#ec4899,#7c3aed)", tag: "Ritmo" },
  sietealto: { nombre: "Siete Alto", emoji: "🎲", descripcion: "Apuesta Alto/Bajo ×2 · Siete ×5.", Component: SieteAlto, tema: "dados", grad: "linear-gradient(135deg,#eab308,#dc2626)", tag: "Azar" },
  monedaracha: { nombre: "Moneda Racha", emoji: "🪙", descripcion: "Cara o cruz ×2 · planta o arriesga.", Component: MonedaRacha, tema: "moneda", grad: "linear-gradient(135deg,#facc15,#eab308)", tag: "Azar" },
  hipica: { nombre: "Hípica", emoji: "🐎", descripcion: "Apuesta al corredor con su cuota.", Component: Hipica, tema: "hipodromo", grad: "linear-gradient(135deg,#16a34a,#eab308)", tag: "Azar" },
  chuck: { nombre: "Chuck de la Suerte", emoji: "🍀", descripcion: "3 dados · 1×2, 2×3, 3×5.", Component: ChuckSuerte, tema: "dados", grad: "linear-gradient(135deg,#16a34a,#22c55e)", tag: "Azar" },
  puntobanco: { nombre: "Punto Banco", emoji: "🃏", descripcion: "Jugador ×2 · Banca ×2 · Empate ×9.", Component: PuntoBanco, tema: "casino", grad: "linear-gradient(135deg,#052e16,#22c55e)", tag: "Casino" },
  keno: { nombre: "Keno Veloz", emoji: "🎱", descripcion: "Elige 5 · 3×2, 4×5, 5×20.", Component: KenoVeloz, tema: "bolas", grad: "linear-gradient(135deg,#0f172a,#7c3aed)", tag: "Azar" },
  rasca: { nombre: "Rasca y Gana", emoji: "🎫", descripcion: "Revela 3 · trío ×10.", Component: RascaGana, tema: "suerte", grad: "linear-gradient(135deg,#f59e0b,#ec4899)", tag: "Azar" },
  quizmitologia: { nombre: "Quiz Mitología", emoji: "⚡", descripcion: "Dioses y héroes en 6 preguntas.", Component: QuizMitologia, tema: "aplm", grad: "linear-gradient(135deg,#f59e0b,#7c3aed)", tag: "Cultura" },
  quizinventos: { nombre: "Quiz Inventos", emoji: "💡", descripcion: "Grandes inventos en 6 preguntas.", Component: QuizInventos, tema: "aplm", grad: "linear-gradient(135deg,#facc15,#0ea5e9)", tag: "Cultura" },
  quizoceanos: { nombre: "Quiz Océanos", emoji: "🌊", descripcion: "Mares y océanos en 6 preguntas.", Component: QuizOceanos, tema: "aplm", grad: "linear-gradient(135deg,#0369a1,#22d3ee)", tag: "Cultura" },
  parejasnavidad: { nombre: "Parejas de Navidad", emoji: "🎄", descripcion: "Memoria navideña 4×4.", Component: ParejasNavidad, tema: "aplm", grad: "linear-gradient(135deg,#166534,#ef4444)", tag: "Mente" },
  parejashalloween: { nombre: "Parejas de Halloween", emoji: "🎃", descripcion: "Memoria de miedo 4×4.", Component: ParejasHalloween, tema: "aplm", grad: "linear-gradient(135deg,#7c2d12,#a855f7)", tag: "Mente" },
  plinko: { nombre: "Plinko", emoji: "🔮", descripcion: "La bola cae entre clavos: premio ×0.5 a ×10.", Component: Plinko, tema: "casino-neon", grad: "linear-gradient(135deg,#22d3ee,#a855f7)", tag: "Casino" },
  minas: { nombre: "Minas", emoji: "💣", descripcion: "Revela sin pisar minas · cada acierto ×1.3 · cobra cuando quieras.", Component: Minas, tema: "militar", grad: "linear-gradient(135deg,#57534e,#ef4444)", tag: "Casino" },
  torre: { nombre: "Torre Dorada", emoji: "🗼", descripcion: "Sube 6 pisos eligiendo puertas · ×1.5 por piso · cobra cuando quieras.", Component: Torre, tema: "templo", grad: "linear-gradient(135deg,#f59e0b,#78350f)", tag: "Casino" },
  penaltisoro: { nombre: "Penaltis de Oro", emoji: "🥅", descripcion: "3 penaltis: 2 goles ×2, pleno ×5.", Component: PenaltisOro, tema: "estadio", grad: "linear-gradient(135deg,#16a34a,#facc15)", tag: "Casino" },
  cartamayor: { nombre: "Carta Mayor", emoji: "🂡", descripcion: "Tu carta contra la banca · gana ×2 · empate devuelve.", Component: CartaMayor, tema: "casino", grad: "linear-gradient(135deg,#0ea5e9,#1e3a8a)", tag: "Casino" },
  suma7: { nombre: "Suma 7", emoji: "🎲", descripcion: "Dos dados: menor ×2.2 · siete ×4.5 · mayor ×2.2.", Component: Suma7, tema: "dados", grad: "linear-gradient(135deg,#f97316,#dc2626)", tag: "Azar" },
  tombola: { nombre: "Tómbola", emoji: "🎪", descripcion: "Elige 3 del 0 al 9: 2 aciertos ×2, pleno ×6.", Component: Tombola, tema: "feria", grad: "linear-gradient(135deg,#ec4899,#f59e0b)", tag: "Azar" },
  escaleraoro: { nombre: "Escalera Millonaria", emoji: "🪜", descripcion: "5 peldaños con 2 dados · ×1.4 cada uno · cobra cuando quieras.", Component: EscaleraOro, tema: "obra", grad: "linear-gradient(135deg,#eab308,#a16207)", tag: "Casino" },
  rueda: { nombre: "Rueda Fortuna", emoji: "🎡", descripcion: "Gira la rueda de 8 premios: de ×0 a ×10.", Component: Rueda, tema: "feria", grad: "linear-gradient(135deg,#8b5cf6,#ec4899)", tag: "Casino" },
  bolsa: { nombre: "La Bolsa", emoji: "📈", descripcion: "Invierte y sigue 5 movimientos: vende en verde o aguanta.", Component: Bolsa, tema: "oficina", grad: "linear-gradient(135deg,#16a34a,#0ea5e9)", tag: "Casino" },
  doblesdados: { nombre: "Dobles", emoji: "🎲", descripcion: "Dos dados: pareja ×5 · suma 7 devuelve.", Component: Dobles, tema: "dados", grad: "linear-gradient(135deg,#7c3aed,#eab308)", tag: "Azar" },
  quince: { nombre: "Quince", emoji: "🃏", descripcion: "Acércate al 15 sin pasarte y supera a la banca ×2.", Component: Quince, tema: "casino", grad: "linear-gradient(135deg,#065f46,#f59e0b)", tag: "Casino" },
  lotto6: { nombre: "Lotto 6", emoji: "🎱", descripcion: "Elige 6 del 1 al 20: pleno ×100.", Component: Lotto6, tema: "bolas", grad: "linear-gradient(135deg,#1e3a8a,#22d3ee)", tag: "Azar" },
  crash: { nombre: "Crash Cohete", emoji: "🚀", descripcion: "Cobra antes de que explote: ×1 a ×10+.", Component: Crash, tema: "casino-neon", grad: "linear-gradient(135deg,#ef4444,#f59e0b)", tag: "Casino" },
  crashturbo: { nombre: "Crash Turbo", emoji: "⚡", descripcion: "Crash a doble velocidad para valientes.", Component: CrashTurbo, tema: "casino-neon", grad: "linear-gradient(135deg,#f59e0b,#ef4444)", tag: "Casino" },
  crashluna: { nombre: "Crash Luna", emoji: "🌙", descripcion: "Vuelo lento a la Luna: caza el ×20.", Component: CrashLuna, tema: "casino-neon", grad: "linear-gradient(135deg,#1e3a8a,#a855f7)", tag: "Casino" },
  fusionneon: { nombre: "Fusión Neón", emoji: "🧬", descripcion: "Fusiona números vecinos: 1→2→4→2K.", Component: FusionNeon, tema: "aplm", grad: "linear-gradient(135deg,#22d3ee,#a855f7)", tag: "Puzzle" },
  fusionfrutas: { nombre: "Fusión Frutas", emoji: "🍉", descripcion: "Fusiona frutas: de la cereza a la corona.", Component: FusionFrutas, tema: "aplm", grad: "linear-gradient(135deg,#16a34a,#f59e0b)", tag: "Puzzle" },
  fusiongemas: { nombre: "Fusión Gemas", emoji: "💎", descripcion: "Fusiona gemas hasta la estrella.", Component: FusionGemas, tema: "aplm", grad: "linear-gradient(135deg,#7c3aed,#22d3ee)", tag: "Puzzle" },
  aimpro: { nombre: "Aim Pro", emoji: "🎯", descripcion: "Aim-trainer: 20 dianas en 30s.", Component: AimPro, tema: "aplm", grad: "linear-gradient(135deg,#f43f5e,#f59e0b)", tag: "Reflejos" },
  reflejoneon: { nombre: "Reflejo Neón", emoji: "⚡", descripcion: "15 dianas en 20 segundos exprés.", Component: ReflejoNeon, tema: "aplm", grad: "linear-gradient(135deg,#a855f7,#22d3ee)", tag: "Reflejos" },
  dianatranquila: { nombre: "Diana Tranquila", emoji: "🌸", descripcion: "18 dianas en 45s, modo relajado.", Component: DianaTranquila, tema: "aplm", grad: "linear-gradient(135deg,#ec4899,#a855f7)", tag: "Reflejos" },
  anagramaflash: { nombre: "Anagrama Flash", emoji: "⚡", descripcion: "Anagramas de 5 letras en 60s.", Component: AnagramaFlash, tema: "aplm", grad: "linear-gradient(135deg,#8b5cf6,#ec4899)", tag: "Palabras" },
  palabrarelampago: { nombre: "Palabra Relámpago", emoji: "🌩️", descripcion: "Anagramas fáciles de 4 letras en 60s.", Component: PalabraRelampago, tema: "aplm", grad: "linear-gradient(135deg,#f59e0b,#ef4444)", tag: "Palabras" },
  palabraturbo: { nombre: "Palabra Turbo", emoji: "🚄", descripcion: "Anagramas duros de 6 letras en 60s.", Component: PalabraTurbo, tema: "aplm", grad: "linear-gradient(135deg,#0ea5e9,#7c3aed)", tag: "Palabras" },
};

export const CATEGORIAS = [
  { id: "quiz", nombre: "Quiz y saber", icono: "trivia", juegos: ["quizhistoria", "quizciencia", "quizgeografia", "quizdeportes", "quizmusica", "quizcine", "quiznaturaleza", "quiztecno", "quizarte", "quizgastro", "quizanimales", "quizespacio", "quizlibros", "quizcuerpo", "quizviajes", "vciencia", "vhistoria", "vanimales", "vdeportes", "vmundo", "vcuerpo", "vmusica", "vcomida", "quienanimales", "quienoficios", "capamerica", "capeuropa", "capasia", "capafrica", "capoceania", "bandamerica", "bandeuropa", "bandasia", "quizmitologia", "quizinventos", "quizoceanos"] },
  { id: "fiesta", nombre: "Fiesta y 2 jugadores", icono: "tragaperras", juegos: ["mimica", "mimicapelis", "verdad", "verdadkids", "telroto", "telfrases", "duelmanos", "duelopro", "dados2p", "dados2plargo", "dueloreflejos", "duelolargo", "copa", "loteria", "donde", "dondepro", "basta", "bastajunior", "duelotrivia", "duelocultura"] },
  { id: "palabras", nombre: "Palabras", icono: "sopa", juegos: ["ahorcado", "wordle", "sopa", "anagramas", "mecanografia", "crucigrama", "cascada", "capitales", "memorianum", "cazapalabra", "pistaanimales", "pistapaises", "pistacomidas", "pistaoficios", "pistadeportes", "pistainstrumentos", "pistaflores", "pistavehiculos", "pistafrutas", "pistaropa", "pistamuebles", "pistacolores", "refranes", "dichos", "fraserefranes", "frasehechos", "fraseanimales", "fraseviajes", "palabradiaria", "palabra6", "palabra4", "ahoranimales", "ahorcomidas", "ahorpaises", "ahoroficios", "ahordeportes", "emojianimales", "emojicomida", "emojideportes", "emojiobjetos", "emojinatura", "emojiviajes", "anagramaflash", "palabrarelampago", "palabraturbo"] },
  { id: "logica", nombre: "Lógica y puzzle", icono: "puzzle15", juegos: ["mastermind", "puzzle15", "juego2048", "mathblitz", "caza", "sudoku", "hanoi", "luces", "picross", "laberinto", "stack", "mate1", "bolalab", "labciego", "ordena", "inversa", "sombras", "ruta", "ordenainverso", "ordenaletras", "ordenapares", "sumas", "restas", "tablas", "divisiones", "dobles", "mezcla", "intrusoanimales", "intrusofrutas", "intrusopaises", "intrusocolores", "intrusodeportes", "intrusooficios", "intrusomusica", "intrusocomidas", "intrusoropa", "intrusocasa", "parejasnumeros", "parejasletras", "parejasbanderas", "parejasanimales", "parejasfrutas", "parejasdeportes", "parejasformas", "parejascomida", "parejasplanetas", "parejasmusica", "parejasnavidad", "parejashalloween", "puzzle9", "fusionneon", "fusionfrutas", "fusiongemas"] },
  { id: "azar", nombre: "Azar y casino", icono: "dados", juegos: ["adivina", "rps", "dados", "blackjack", "tragaperras", "ruleta", "yahtzee", "guerra", "poker", "bingo", "sietemedio", "escalera", "adivina50", "adivina1000", "adivinaexpres", "maquina", "mayormenor", "escoba", "brisca", "sietealto", "monedaracha", "hipica", "chuck", "puntobanco", "keno", "rasca", "plinko", "minas", "torre", "penaltisoro", "cartamayor", "suma7", "tombola", "escaleraoro", "rueda", "bolsa", "doblesdados", "quince", "lotto6", "crash", "crashturbo", "crashluna"] },
  { id: "tablero", nombre: "Tablero y estrategia", icono: "treslinea", juegos: ["treslinea", "c4", "buscaminas", "flota", "othello", "damas", "gomoku", "oca", "parchis", "parchisduelo", "serpientes", "serpientesduelo", "raya4", "raya5", "sudoku4", "buscachico", "buscagrande"] },
  { id: "arcade", nombre: "Arcade y acción", icono: "mando", juegos: ["snake", "pong", "pong2p", "breakout", "simon", "flappy", "reflejos", "tetris", "topo", "atrapar", "esquiva", "dino", "naves", "pacman", "piano", "aim", "frogger", "tron", "carrera", "saltarin", "burbujas", "malabares", "ddr", "pesca", "zombies", "equilibrio", "sprint", "pulso", "destello", "tocamayor", "tocamenor", "tocapar", "tocaimpar", "tocaprimo", "tocamult5", "tocadecena", "saltolargo", "oidoveloz", "aimpro", "reflejoneon", "dianatranquila"] },
  { id: "cultura", nombre: "Cultura, mente y deporte", icono: "capitales", juegos: ["trivia", "memoria", "stroop", "penaltis", "bowling", "parimpar", "atajada", "oidofino"] },
];

export const TEMAS = [
  { id: "neon", nombre: "Neón", icono: "🌃" },
  { id: "retro", nombre: "Retro", icono: "📼" },
  { id: "claro", nombre: "Claro", icono: "☀️" },
];
