import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base "./" para que funcione igual en Vercel (/) y GitHub Pages (/repo/).
// __APP_VERSION__ y __BUILD_DATE__ se muestran en el lateral (versión visible).
export default defineConfig({
  base: "./",
  plugins: [react()],
  build: {
    target: "es2020",
    cssCodeSplit: true,
    sourcemap: false,
    assetsInlineLimit: 4096, // iconos pequeños inline, PNG grandes como fichero (cacheable)
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // React + vendor aparte: se cachea y no se re-descarga en cada versión.
        // Los 237 juegos ya van en chunks perezosos (lazy) por juego.
        // (Vite 8/rolldown exige forma de función.)
        manualChunks: id => {
          if (id.includes("node_modules/react")) return "vendor";
          return undefined;
        },
      },
    },
  },
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || "2.3.0"),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString().slice(0, 10)),
  },
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:3001",
    },
  },
});
