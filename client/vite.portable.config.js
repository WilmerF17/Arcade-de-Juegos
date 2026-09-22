import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

// Build portable: TODO el juego en un solo .html (doble clic y a jugar,
// sin internet ni instalación). Los 250 juegos van incluidos (sin lazy).
// Salida: dist-portable/ -> se copia a public/descargas/ con npm run portable.
export default defineConfig({
  base: "./",
  plugins: [react(), viteSingleFile({ useRecommendedBuildConfig: true })],
  build: {
    target: "es2020",
    sourcemap: false,
    outDir: "dist-portable",
    emptyOutDir: true,
    assetsInlineLimit: 100 * 1024 * 1024,
    chunkSizeWarningLimit: 20000,
    rollupOptions: {
      // Sin code-splitting: un solo chunk para que todo quede inline.
      output: { manualChunks: undefined, inlineDynamicImports: true },
    },
  },
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || "2.6.2"),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString().slice(0, 10)),
  },
});
