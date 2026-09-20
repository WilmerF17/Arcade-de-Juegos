# 🕹️ ArcadePaLoMuchacho

**232 minijuegos originales en español**, con XP, niveles, logros, desafío diario,
billetera virtual y ranking global. Instalable en móvil y PC (PWA), funciona sin conexión.

- 🎮 Juega: https://arcade-de-juegos.vercel.app
- 🌐 Espejo: https://wilmerf17.github.io/Arcade-de-Juegos/
- 📖 Despliegue y SEO: [DESPLIEGUE.md](./DESPLIEGUE.md) · Historial: [CHANGELOG.md](./CHANGELOG.md)

Todo el código, iconos y sonidos son propios (SVG + WebAudio generados, sin assets de terceros
ni marcas registradas).

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/WilmerF17/Arcade-de-Juegos)

## Desarrollo local

```bash
npm run install-all   # una vez: dependencias de servidor + cliente
npm run dale          # prende API + web y abre el navegador (o ./bin/dale)
npm run salud         # chequeo PWA + Google (18 puntos)
npm run test          # 17 chequeos automáticos del catálogo
jugar                 # atajo clásico: mismo efecto que npm run dale
```
