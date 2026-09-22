# 📱 Ficha de Google Play — lista para pegar

Archivos: `play/feature-1024x500.png` (destacada), `play/captura-1-portada.png`,
`play/captura-2-partida.png` (capturas de teléfono), icono 512 de
`client/public/icon-512.png`. Bundle: `~/android-twa/app/app-release-bundle.aab`
(v2.6.3, código 4, paquete `app.vercel.arcade_de_juegos.twa`).

## Título (máx 30)
```
ArcadePaLoMuchacho
```

## Descripción breve (máx 80)
```
250 minijuegos gratis en español: arcade, casino y trivia sin internet.
```

## Descripción completa
```
🕹️ 250 MINIJUEGOS GRATIS EN ESPAÑOL

Arcade, casino, trivia, palabras, tableros, deporte y lógica en una sola app
que funciona SIN INTERNET una vez instalada.

✨ ¿POR QUÉ JUGAR?
• 250 juegos originales: Trivia, Serpiente, Blackjack, Plinko, Minas, Sudoku…
• Sistema de XP, niveles, rachas, logros y desafío diario con doble XP
• Casino con fichas VIRTUALES y tienda: temas, doble XP y escudos
• Marcador global con récords de todo el mundo
• Desafío diario, favoritos, modo aleatorio y atajos de teclado
• Funciona sin conexión · Ocupa poco · Sin cuentas ni registros

🎰 FICHAS 100% VIRTUALES: no hay dinero real, ni premios, ni compras.
Apta para jugar en familia. Sin permisos raros.

📲 ¡Descarga y presume tu nivel!
```

## Novedades (release notes v2.6.3)
```
250 juegos + tienda con temas y potenciadores, descarga directa del APK
y juego portable para PC. Corrección de fugas táctiles y rediseño general.
```

## Categoría y etiquetas
- Categoría: **Juegos > Casual**
- Etiquetas: arcade, trivia, casino, puzzle, sin conexión

## Datos para los formularios de Play Console (responde así)
- **Anuncios**: No contiene anuncios.
- **Compras integradas**: No (las fichas son virtuales y gratuitas).
- **Público objetivo**: 13+ (contiene casino SIMULADO con fichas virtuales;
  nada de dinero real). No dirigida a menores de 13.
- **Clasificación de contenido (IARC)**: declara "juego de azar simulado".
  Te saldrá Teen/Adolescentes o similar: es lo normal en casinos sociales.
- **Seguridad de los datos**: no se recogen datos personales (las puntuaciones
  del marcador son anónimas: juego, puntos y fecha). Cifrado en tránsito: sí (HTTPS).
- **Política de privacidad**: `https://arcade-de-juegos.vercel.app/#privacidad`
- **Correo de contacto**: [PON-TU-EMAIL] (obligatorio en la ficha)

## Pasos en Play Console (cuenta de desarrollador $25, solo tú)
1. **Crear app** → nombre `ArcadePaLoMuchacho`, idioma español, tipo Juego/Casual,
   gratuita, declara que NO es para menores de 13.
2. **Panel → Pruebas internas**: crea una versión, sube `app-release-bundle.aab`,
   añade tu correo como tester. Instala desde el enlace y prueba que abre a
   pantalla completa (si sale barra del navegador, avísame: es el assetlinks).
3. Completa **Ficha de Play** (pega lo de arriba + gráficos + icono + email).
4. Completa **Clasificación de contenido** (cuestionario IARC gratis),
   **Público objetivo**, **Seguridad de los datos**, **Anuncios: No**.
5. **Producción** → crear versión → subir el MISMO `.aab` → revisar → **Enviar**.
   La revisión tarda de horas a ~7 días.
6. ⚠️ Tras la PRIMERA subida, Play te da su huella **SHA-256 de firma**:
   cópiala en `client/public/.well-known/assetlinks.json` (sustituye la actual),
   `npm run publicar`, y listo. Sin esto, la versión de Play mostraría la barra
   del navegador.
