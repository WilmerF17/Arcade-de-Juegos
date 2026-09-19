# 🚀 Despliegue de ArcadePaLoMuchacho v2

Todo el código ya está listo. Solo faltan los pasos que piden **tu login**
(esta máquina no tiene credenciales de escritura). Son 15 minutos.

## 1. Subir el código (2 comandos)

```bash
cd ~/juegos-web
git push origin main     # GitHub
git push hf main         # Hugging Face Space (reconstruye solo)
```

## 2. GitHub Pages — frontend gratis (2 clics)

1. En GitHub abre tu repo → **Settings → Pages**.
2. En **Source** elige **GitHub Actions** y guarda.
3. El workflow `deploy-pages.yml` compila y publica solo.
4. Tu URL será `https://wilmerf17.github.io/Arcade-de-Juegos/`
   (funciona por el `base "./"` y el SW relativo).

## 3. Vercel — URL principal y canónica (3 clics)

1. En [vercel.com](https://vercel.com) → **Add New → Project** → importa
   `WilmerF17/Arcade-de-Juegos`.
2. Deja **Build Command** y **Output Directory** como los detecta
   (`vercel.json` ya fija `client/dist`); no toques nada.
3. **Deploy**. Obtendrás `https://arcadepalomuchacho.vercel.app`
   (o el nombre que elijas; si cambia, actualiza la constante
   `arcadepalomuchacho.vercel.app` en `client/index.html`,
   `robots.txt`, `sitemap.xml` y `render.yaml`, y reconstruye).

> La API de puntuaciones en Vercel/Pages no existe: la app guarda
> el progreso en el dispositivo y reintenta el servidor si hay uno.
> Para puntuaciones globales usa el backend en Render o HF:
> define `VITE_API_URL` en el frontend y `FRONTEND_URL` en el servidor
> (ver `.env.example`).

## 4. Backend en Render (opcional, puntuaciones globales)

1. [render.com](https://render.com) → **New → Web Service** → tu repo.
2. Detecta `render.yaml`: compila cliente + sirve API.
3. Copia su URL como `VITE_API_URL` del frontend si lo separas.

## 5. Salir en Google oficialmente

1. Despliega Vercel (paso 3) y abre la URL.
2. Entra a [Google Search Console](https://search.google.com/search-console),
   añade la propiedad (método: etiqueta HTML o DNS).
3. **Sitemaps → Añadir** `https://arcadepalomuchacho.vercel.app/sitemap.xml`.
4. **Inspección de URLs** → pide indexar `/`.
5. Espera de días a semanas. La marca es única: cuando Google la
   rastree, `ArcadePaLoMuchacho` rankeará #1 sin competencia.

## 6. Instalar en teléfono y PC (PWA)

Con la URL `https` desplegada:
- **Android/Chrome**: menú ⋮ → **Instalar app**.
- **PC Chrome/Edge**: icono de instalación en la barra → **Instalar**.
- **iPhone/iPad**: Compartir → **Añadir a pantalla de inicio**.
- Funciona sin conexión gracias al service worker `aplm-v3`.

Verifica todo en local con: `npm run salud`
