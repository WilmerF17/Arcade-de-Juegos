# 📱 ArcadePaLoMuchacho en móvil + Google Play

## 1. Qué se optimizó en móvil

- **Grid 2 columnas** en móvil (antes 1): se ven más juegos sin scroll infinito.
- **Nav inferior** (🏠 Inicio · 🎲 Azar · 🔍 Buscar · 🏆 Récords): alcance del pulgar, sin abrir el menú.
- **Botones ≥44px** y **inputs a 16px**: sin zoom forzado en iPhone, táctil cómodo.
- **Auroras desactivadas en móvil**: el `blur(90px)` fundía la GPU de gama baja; en PC siguen.
- **Cartas con `content-visibility`**: el navegador no pinta las 237 de golpe.
- **Vendor React en chunk aparte** (`vite.config.js`): se cachea y las actualizaciones pesan menos.
- **Service worker v9** con *navigation preload*: la portada abre más rápido y sigue offline.
- **Safe-area + `100dvh`**: sin huecos raros con la barra del navegador ni el notch.
- **Wordle, teclados, tableros y canvas** adaptados a 360px con scroll horizontal seguro.

## 2. Descarga compatible con todo (ya funciona hoy, sin Play)

| Dispositivo | Cómo se instala |
|---|---|
| Android + Chrome/Edge | Banner «Instalar» o menú ⋮ → *Instalar app* |
| Android + Samsung/Firefox | Banner manual o menú → *Añadir a pantalla de inicio* |
| iPhone/iPad | Compartir → *Añadir a pantalla de inicio* |
| PC Chrome/Edge | Icono de instalación en la barra → *Instalar* |
| Cualquiera sin navegador compatible | APK/AAB (punto 3) o Google Play (punto 4) |

Todo sale de la misma PWA (`site.webmanifest` + `sw.js`): sin tiendas, sin permisos raros, funciona offline.

## 3. Generar el APK/AAB para Google Play (vía TWA, recomendado)

La app ya cumple los requisitos de Play para TWA: icono 512 + maskable 512,
screenshots wide + narrow, `display: standalone`, service worker y
`.well-known/assetlinks.json`.

```bash
# 1. Instala Bubblewrap (una vez)
npm i -g @bubblewrap/cli

# 2. Genera el proyecto Android desde la PWA en producción
cd juegos-web
bubblewrap init --manifest https://arcade-de-juegos.vercel.app/site.webmanifest

# 3. Compila el AAB firmado (te pedirá crear android.keystore la 1ª vez)
bubblewrap build
# → sale app-release-signed.aab en ./app-release-signed.aab
```

Sube ese `.aab` a **Play Console → Producción**. Mínimo Android 8 (SDK 23),
target SDK 34: compatible con ~99% de móviles actuales.

> `twa-manifest.json` de este repo ya trae el package
> `app.vercel.arcade_de_juegos.twa`, colores, iconos y versión listos para
> `bubblewrap build --manifest ./twa-manifest.json`.

### Paso crítico: huellas SHA-256

1. En Play Console → *Configuración → Integridad de la app* copia la huella
   **SHA-256 del certificado de firma**.
2. Pégala en `client/public/.well-known/assetlinks.json` donde pone
   `SUSTITUIR_CON_TU_SHA256_DE_PLAY_CONSOLE`.
3. Re-despliega (`git push`: Vercel reconstruye solo). Sin esto la app de Play
   mostraría la barra del navegador en vez de pantalla completa.

## 4. Alternativa: APK nativo con Capacitor

Si quieres repartir un `.apk` directo (WhatsApp, web, etc.) sin Play:

```bash
npm i -D @capacitor/cli @capacitor/core @capacitor/android
npx cap add android
npm run build && npx cap sync && npx cap open android
# En Android Studio: Build → Generate Signed Bundle/APK
```

Config base ya creada en `capacitor.config.ts`.

## 5. Publicar en Play (no puedo hacerlo por ti)

Subir a Google Play exige una **cuenta de desarrollador personal**
(25 USD, pago único) que solo tú puedes crear y verificar:

1. Crea la cuenta en <https://play.google.com/console> y verifica identidad.
2. Crea la app → sube el `.aab` del punto 3.
3. Completa ficha obligatoria: icono 512, imagen destacada 1024×500,
   2+ capturas de móvil, categoría *Juegos → Casual*, clasificación IARC
   (cuestionario gratis), política de privacidad (la app no pide datos:
   declara «sin recogida de datos»).
4. Revisa el checklist de `npm run salud` (PWA + manifest + SW) antes de enviar.
5. Envía a revisión (tarda de horas a ~7 días).

Cuando tengas la cuenta creada dime y te genero el `.aab` firmado + la ficha
de Play lista para pegar.
